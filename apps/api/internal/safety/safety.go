package safety

import (
	"database/sql"
	"encoding/json"
	"net/http"
	"strconv"
	"strings"

	"pawpaw/apps/api/internal/auth"
	"pawpaw/apps/api/internal/httpx"
)

type Handler struct {
	DB *sql.DB
}

func (h Handler) Register(mux *http.ServeMux, prefix string) {
	mux.Handle(prefix+"/reports", auth.Middleware(h.DB, http.HandlerFunc(h.handleReports)))
	mux.Handle(prefix+"/blocks", auth.Middleware(h.DB, http.HandlerFunc(h.handleBlocks)))
	mux.Handle(prefix+"/blocks/", auth.Middleware(h.DB, http.HandlerFunc(h.handleBlockByID)))
}

func (h Handler) handleReports(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPost {
		httpx.MethodNotAllowed(w)
		return
	}
	userID, _ := auth.UserID(r.Context())
	var input struct {
		TargetType string `json:"targetType"`
		TargetID   string `json:"targetId"`
		Reason     string `json:"reason"`
	}
	if err := json.NewDecoder(r.Body).Decode(&input); err != nil {
		httpx.WriteError(w, http.StatusBadRequest, "invalid_json", "Invalid JSON request body", nil)
		return
	}
	if strings.TrimSpace(input.TargetType) == "" || strings.TrimSpace(input.TargetID) == "" || strings.TrimSpace(input.Reason) == "" {
		httpx.WriteError(w, http.StatusBadRequest, "invalid_report", "targetType, targetId, and reason are required", nil)
		return
	}
	var id int64
	err := h.DB.QueryRowContext(r.Context(), `
		insert into reports (reporter_user_id, target_type, target_id, reason, status)
		values ($1, $2, $3, $4, 'open')
		returning id
	`, userID, strings.TrimSpace(input.TargetType), strings.TrimSpace(input.TargetID), strings.TrimSpace(input.Reason)).Scan(&id)
	if err != nil {
		httpx.WriteError(w, http.StatusInternalServerError, "report_failed", "Could not create report", nil)
		return
	}
	httpx.WriteJSON(w, http.StatusCreated, map[string]any{"id": id, "status": "open"})
}

func (h Handler) handleBlocks(w http.ResponseWriter, r *http.Request) {
	userID, _ := auth.UserID(r.Context())
	switch r.Method {
	case http.MethodGet:
		rows, err := h.DB.QueryContext(r.Context(), `
			select blocked_user_id, coalesce(reason, ''), created_at::text from blocks where blocker_user_id = $1 order by created_at desc
		`, userID)
		if err != nil {
			httpx.WriteError(w, http.StatusInternalServerError, "blocks_load_failed", "Could not load blocks", nil)
			return
		}
		defer rows.Close()
		blocks := []map[string]any{}
		for rows.Next() {
			var blockedUserID int64
			var reason, createdAt string
			if err := rows.Scan(&blockedUserID, &reason, &createdAt); err != nil {
				httpx.WriteError(w, http.StatusInternalServerError, "blocks_load_failed", "Could not load blocks", nil)
				return
			}
			blocks = append(blocks, map[string]any{"blockedUserId": blockedUserID, "reason": reason, "createdAt": createdAt})
		}
		httpx.WriteJSON(w, http.StatusOK, map[string]any{"blocks": blocks})
	case http.MethodPost:
		var input struct {
			BlockedUserID int64  `json:"blockedUserId"`
			Reason        string `json:"reason"`
		}
		if err := json.NewDecoder(r.Body).Decode(&input); err != nil {
			httpx.WriteError(w, http.StatusBadRequest, "invalid_json", "Invalid JSON request body", nil)
			return
		}
		if input.BlockedUserID <= 0 || input.BlockedUserID == userID {
			httpx.WriteError(w, http.StatusBadRequest, "invalid_block", "Valid blockedUserId is required", nil)
			return
		}
		_, err := h.DB.ExecContext(r.Context(), `
			insert into blocks (blocker_user_id, blocked_user_id, reason)
			values ($1, $2, nullif($3, ''))
			on conflict (blocker_user_id, blocked_user_id) do update set reason = excluded.reason
		`, userID, input.BlockedUserID, strings.TrimSpace(input.Reason))
		if err != nil {
			httpx.WriteError(w, http.StatusInternalServerError, "block_failed", "Could not block user", nil)
			return
		}
		httpx.WriteJSON(w, http.StatusCreated, map[string]string{"status": "blocked"})
	default:
		httpx.MethodNotAllowed(w)
	}
}

func (h Handler) handleBlockByID(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodDelete {
		httpx.MethodNotAllowed(w)
		return
	}
	userID, _ := auth.UserID(r.Context())
	idText := strings.TrimPrefix(r.URL.Path, "/api/v1/blocks/")
	blockedUserID, err := strconv.ParseInt(strings.Trim(idText, "/"), 10, 64)
	if err != nil || blockedUserID <= 0 {
		httpx.WriteError(w, http.StatusBadRequest, "invalid_blocked_user_id", "Invalid blocked user id", nil)
		return
	}
	_, _ = h.DB.ExecContext(r.Context(), `delete from blocks where blocker_user_id = $1 and blocked_user_id = $2`, userID, blockedUserID)
	httpx.WriteJSON(w, http.StatusOK, map[string]string{"status": "unblocked"})
}
