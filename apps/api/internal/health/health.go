package health

import (
	"context"
	"database/sql"
	"net/http"
	"time"

	"github.com/redis/go-redis/v9"

	"pawpaw/apps/api/internal/httpx"
)

type Handler struct {
	DB    *sql.DB
	Redis *redis.Client
}

func (h Handler) ServeHTTP(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodGet {
		httpx.MethodNotAllowed(w)
		return
	}

	ctx, cancel := context.WithTimeout(r.Context(), 500*time.Millisecond)
	defer cancel()

	dependencies := map[string]string{
		"postgres": "not_configured",
		"redis":    "not_configured",
	}
	status := "ok"

	if h.DB != nil {
		if err := h.DB.PingContext(ctx); err != nil {
			dependencies["postgres"] = "down"
			status = "degraded"
		} else {
			dependencies["postgres"] = "ok"
		}
	}
	if h.Redis != nil {
		if err := h.Redis.Ping(ctx).Err(); err != nil {
			dependencies["redis"] = "down"
			status = "degraded"
		} else {
			dependencies["redis"] = "ok"
		}
	}

	httpx.WriteJSON(w, http.StatusOK, map[string]any{
		"service":      "pawpaw-api",
		"status":       status,
		"dependencies": dependencies,
	})
}
