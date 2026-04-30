package admin

import (
	"database/sql"
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
	mux.Handle(prefix+"/admin/dashboard", auth.Middleware(h.DB, http.HandlerFunc(h.handleDashboard)))
	mux.Handle(prefix+"/admin/reports", auth.Middleware(h.DB, http.HandlerFunc(h.handleReports)))
	mux.Handle(prefix+"/admin/reports/", auth.Middleware(h.DB, http.HandlerFunc(h.handleReportByID)))
	mux.Handle(prefix+"/admin/users", auth.Middleware(h.DB, http.HandlerFunc(h.handleUsers)))
	mux.Handle(prefix+"/admin/pets", auth.Middleware(h.DB, http.HandlerFunc(h.handlePets)))
	mux.Handle(prefix+"/admin/playdates", auth.Middleware(h.DB, http.HandlerFunc(h.handlePlaydates)))
}

func (h Handler) handleDashboard(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodGet {
		httpx.MethodNotAllowed(w)
		return
	}
	counts := map[string]int64{}
	for key, query := range map[string]string{
		"users":              `select count(*) from users`,
		"pets":               `select count(*) from pets`,
		"recommendationLogs": `select count(*) from recommendation_logs`,
		"likes":              `select count(*) from swipes where action = 'like'`,
		"passes":             `select count(*) from swipes where action = 'pass'`,
		"matches":            `select count(*) from matches`,
		"messages":           `select count(*) from messages`,
		"playdates":          `select count(*) from playdates`,
		"completedPlaydates": `select count(*) from playdates where status = 'completed'`,
		"feedback":           `select count(*) from feedback`,
		"reports":            `select count(*) from reports where status = 'open'`,
		"blocks":             `select count(*) from blocks`,
	} {
		var count int64
		_ = h.DB.QueryRowContext(r.Context(), query).Scan(&count)
		counts[key] = count
	}
	httpx.WriteJSON(w, http.StatusOK, map[string]any{"dashboard": counts})
}

func (h Handler) handleReports(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodGet {
		httpx.MethodNotAllowed(w)
		return
	}
	rows, err := h.DB.QueryContext(r.Context(), `
		select id, coalesce(reporter_user_id, 0), target_type, target_id, reason, status, created_at::text
		from reports
		order by created_at desc
		limit 100
	`)
	if err != nil {
		httpx.WriteError(w, http.StatusInternalServerError, "reports_load_failed", "Could not load reports", nil)
		return
	}
	defer rows.Close()
	reports := []map[string]any{}
	for rows.Next() {
		var id, reporterUserID int64
		var targetType, targetID, reason, status, createdAt string
		if err := rows.Scan(&id, &reporterUserID, &targetType, &targetID, &reason, &status, &createdAt); err != nil {
			httpx.WriteError(w, http.StatusInternalServerError, "reports_load_failed", "Could not load reports", nil)
			return
		}
		reports = append(reports, map[string]any{"id": id, "reporterUserId": reporterUserID, "targetType": targetType, "targetId": targetID, "reason": reason, "status": status, "createdAt": createdAt})
	}
	httpx.WriteJSON(w, http.StatusOK, map[string]any{"reports": reports})
}

func (h Handler) handleReportByID(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPost || !strings.HasSuffix(r.URL.Path, "/resolve") {
		httpx.MethodNotAllowed(w)
		return
	}
	idText := strings.TrimSuffix(strings.TrimPrefix(r.URL.Path, "/api/v1/admin/reports/"), "/resolve")
	id, err := strconv.ParseInt(strings.Trim(idText, "/"), 10, 64)
	if err != nil || id <= 0 {
		httpx.WriteError(w, http.StatusBadRequest, "invalid_report_id", "Invalid report id", nil)
		return
	}
	_, _ = h.DB.ExecContext(r.Context(), `update reports set status = 'resolved' where id = $1`, id)
	httpx.WriteJSON(w, http.StatusOK, map[string]string{"status": "resolved"})
}

func (h Handler) handleUsers(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodGet {
		httpx.MethodNotAllowed(w)
		return
	}
	rows, err := h.DB.QueryContext(r.Context(), `select id, nickname, coalesce(neighborhood, ''), privacy_level, risk_state, created_at::text from users order by id desc limit 100`)
	if err != nil {
		httpx.WriteError(w, http.StatusInternalServerError, "users_load_failed", "Could not load users", nil)
		return
	}
	defer rows.Close()
	items := []map[string]any{}
	for rows.Next() {
		var id int64
		var nickname, neighborhood, privacy, risk, createdAt string
		_ = rows.Scan(&id, &nickname, &neighborhood, &privacy, &risk, &createdAt)
		items = append(items, map[string]any{"id": id, "nickname": nickname, "neighborhood": neighborhood, "privacyLevel": privacy, "riskState": risk, "createdAt": createdAt})
	}
	httpx.WriteJSON(w, http.StatusOK, map[string]any{"users": items})
}

func (h Handler) handlePets(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodGet {
		httpx.MethodNotAllowed(w)
		return
	}
	rows, err := h.DB.QueryContext(r.Context(), `select id, owner_user_id, name, coalesce(breed, ''), created_at::text from pets order by id desc limit 100`)
	if err != nil {
		httpx.WriteError(w, http.StatusInternalServerError, "pets_load_failed", "Could not load pets", nil)
		return
	}
	defer rows.Close()
	items := []map[string]any{}
	for rows.Next() {
		var id, ownerUserID int64
		var name, breed, createdAt string
		_ = rows.Scan(&id, &ownerUserID, &name, &breed, &createdAt)
		items = append(items, map[string]any{"id": id, "ownerUserId": ownerUserID, "name": name, "breed": breed, "createdAt": createdAt})
	}
	httpx.WriteJSON(w, http.StatusOK, map[string]any{"pets": items})
}

func (h Handler) handlePlaydates(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodGet {
		httpx.MethodNotAllowed(w)
		return
	}
	rows, err := h.DB.QueryContext(r.Context(), `
		select p.id, p.creator_user_id, l.name, p.status, p.start_at::text, p.created_at::text
		from playdates p
		join locations l on l.id = p.location_id
		order by p.created_at desc
		limit 100
	`)
	if err != nil {
		httpx.WriteError(w, http.StatusInternalServerError, "playdates_load_failed", "Could not load playdates", nil)
		return
	}
	defer rows.Close()
	items := []map[string]any{}
	for rows.Next() {
		var id, creatorUserID int64
		var locationName, status, startAt, createdAt string
		_ = rows.Scan(&id, &creatorUserID, &locationName, &status, &startAt, &createdAt)
		items = append(items, map[string]any{"id": id, "creatorUserId": creatorUserID, "locationName": locationName, "status": status, "startAt": startAt, "createdAt": createdAt})
	}
	httpx.WriteJSON(w, http.StatusOK, map[string]any{"playdates": items})
}
