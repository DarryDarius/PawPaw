package auth

import (
	"context"
	"crypto/rand"
	"crypto/sha256"
	"database/sql"
	"encoding/hex"
	"encoding/json"
	"errors"
	"net/http"
	"strconv"
	"strings"
	"time"

	"pawpaw/apps/api/internal/httpx"
)

type contextKey string

const userIDKey contextKey = "userID"

type Handler struct {
	DB *sql.DB
}

type User struct {
	ID           int64  `json:"id"`
	Nickname     string `json:"nickname"`
	AvatarURL    string `json:"avatarUrl,omitempty"`
	Neighborhood string `json:"neighborhood,omitempty"`
	PrivacyLevel string `json:"privacyLevel"`
	RiskState    string `json:"riskState"`
	CreatedAt    string `json:"createdAt"`
}

type Session struct {
	Token     string `json:"token"`
	ExpiresAt string `json:"expiresAt"`
}

func (h Handler) Register(mux *http.ServeMux, prefix string) {
	mux.HandleFunc(prefix+"/auth/login", h.handleLogin)
	mux.HandleFunc(prefix+"/auth/logout", h.handleLogout)
}

func Middleware(database *sql.DB, next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		userID, err := Authenticate(r.Context(), database, bearerToken(r))
		if err != nil {
			httpx.WriteError(w, http.StatusUnauthorized, "unauthorized", "Login required", nil)
			return
		}
		next.ServeHTTP(w, r.WithContext(WithUserID(r.Context(), userID)))
	})
}

func UserID(ctx context.Context) (int64, bool) {
	userID, ok := ctx.Value(userIDKey).(int64)
	return userID, ok
}

func WithUserID(ctx context.Context, userID int64) context.Context {
	return context.WithValue(ctx, userIDKey, userID)
}

func (h Handler) handleLogin(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPost {
		httpx.MethodNotAllowed(w)
		return
	}
	var input struct {
		Email        string `json:"email"`
		Nickname     string `json:"nickname"`
		Neighborhood string `json:"neighborhood"`
		AvatarURL    string `json:"avatarUrl"`
	}
	if err := json.NewDecoder(r.Body).Decode(&input); err != nil {
		httpx.WriteError(w, http.StatusBadRequest, "invalid_json", "Invalid JSON request body", nil)
		return
	}
	email := strings.ToLower(strings.TrimSpace(input.Email))
	if email == "" || !strings.Contains(email, "@") {
		httpx.WriteError(w, http.StatusBadRequest, "invalid_email", "A valid email is required", nil)
		return
	}
	nickname := strings.TrimSpace(input.Nickname)
	if nickname == "" {
		nickname = strings.Split(email, "@")[0]
	}
	neighborhood := strings.TrimSpace(input.Neighborhood)
	if neighborhood == "" {
		neighborhood = "Hyde Park"
	}

	user, err := upsertUser(r.Context(), h.DB, emailHash(email), nickname, neighborhood, strings.TrimSpace(input.AvatarURL))
	if err != nil {
		httpx.WriteError(w, http.StatusInternalServerError, "login_failed", "Could not create login session", nil)
		return
	}
	session, err := createSession(r.Context(), h.DB, user.ID)
	if err != nil {
		httpx.WriteError(w, http.StatusInternalServerError, "session_failed", "Could not create login session", nil)
		return
	}

	httpx.WriteJSON(w, http.StatusOK, map[string]any{
		"user":    user,
		"session": session,
	})
}

func (h Handler) handleLogout(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPost {
		httpx.MethodNotAllowed(w)
		return
	}
	token := bearerToken(r)
	if token != "" {
		_, _ = h.DB.ExecContext(r.Context(), `delete from session_tokens where token_hash = $1`, tokenHash(token))
	}
	httpx.WriteJSON(w, http.StatusOK, map[string]string{"status": "ok"})
}

func Authenticate(ctx context.Context, database *sql.DB, token string) (int64, error) {
	if token == "" {
		return 0, errors.New("missing token")
	}
	var userID int64
	err := database.QueryRowContext(ctx, `
		select user_id
		from session_tokens
		where token_hash = $1 and expires_at > now()
	`, tokenHash(token)).Scan(&userID)
	if err != nil {
		return 0, err
	}
	return userID, nil
}

func upsertUser(ctx context.Context, database *sql.DB, emailHash string, nickname string, neighborhood string, avatarURL string) (User, error) {
	row := database.QueryRowContext(ctx, `
		insert into users (email_hash, nickname, neighborhood, avatar_url)
		values ($1, $2, $3, nullif($4, ''))
		on conflict (email_hash) do update set
			nickname = excluded.nickname,
			neighborhood = excluded.neighborhood,
			avatar_url = coalesce(excluded.avatar_url, users.avatar_url)
		returning id, nickname, coalesce(avatar_url, ''), coalesce(neighborhood, ''), privacy_level, risk_state, created_at::text
	`, emailHash, nickname, neighborhood, avatarURL)
	return scanUser(row)
}

func createSession(ctx context.Context, database *sql.DB, userID int64) (Session, error) {
	token, err := randomToken()
	if err != nil {
		return Session{}, err
	}
	expiresAt := time.Now().UTC().Add(30 * 24 * time.Hour)
	_, err = database.ExecContext(ctx, `
		insert into session_tokens (token_hash, user_id, expires_at)
		values ($1, $2, $3)
	`, tokenHash(token), userID, expiresAt)
	if err != nil {
		return Session{}, err
	}
	return Session{Token: token, ExpiresAt: expiresAt.Format(time.RFC3339)}, nil
}

func scanUser(row interface{ Scan(dest ...any) error }) (User, error) {
	var user User
	err := row.Scan(&user.ID, &user.Nickname, &user.AvatarURL, &user.Neighborhood, &user.PrivacyLevel, &user.RiskState, &user.CreatedAt)
	return user, err
}

func bearerToken(r *http.Request) string {
	header := strings.TrimSpace(r.Header.Get("Authorization"))
	if header == "" {
		return ""
	}
	parts := strings.SplitN(header, " ", 2)
	if len(parts) != 2 || !strings.EqualFold(parts[0], "Bearer") {
		return ""
	}
	return strings.TrimSpace(parts[1])
}

func emailHash(email string) string {
	return hash("email:" + email)
}

func tokenHash(token string) string {
	return hash("session:" + token)
}

func hash(value string) string {
	sum := sha256.Sum256([]byte(value))
	return hex.EncodeToString(sum[:])
}

func randomToken() (string, error) {
	bytes := make([]byte, 32)
	if _, err := rand.Read(bytes); err != nil {
		return "", err
	}
	return hex.EncodeToString(bytes), nil
}

func ParseID(value string) (int64, bool) {
	id, err := strconv.ParseInt(value, 10, 64)
	return id, err == nil && id > 0
}
