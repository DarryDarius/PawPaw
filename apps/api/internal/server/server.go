package server

import (
	"database/sql"
	"net/http"
	"strings"

	"github.com/redis/go-redis/v9"

	"pawpaw/apps/api/internal/admin"
	"pawpaw/apps/api/internal/auth"
	"pawpaw/apps/api/internal/config"
	"pawpaw/apps/api/internal/demoapi"
	"pawpaw/apps/api/internal/health"
	"pawpaw/apps/api/internal/petapi"
	"pawpaw/apps/api/internal/playdate"
	"pawpaw/apps/api/internal/profile"
	"pawpaw/apps/api/internal/safety"
	"pawpaw/apps/api/internal/social"
)

type Dependencies struct {
	Config config.Config
	DB     *sql.DB
	Redis  *redis.Client
}

func New(deps Dependencies) http.Handler {
	mux := http.NewServeMux()
	mux.Handle("/healthz", health.Handler{DB: deps.DB, Redis: deps.Redis})

	demo := demoapi.NewStore()
	demo.Register(mux, "/api")

	auth.Handler{DB: deps.DB}.Register(mux, "/api/v1")
	profile.Handler{DB: deps.DB}.Register(mux, "/api/v1")
	petapi.Handler{DB: deps.DB}.Register(mux, "/api/v1")
	social.Handler{DB: deps.DB}.Register(mux, "/api/v1")
	playdate.Handler{DB: deps.DB}.Register(mux, "/api/v1")
	safety.Handler{DB: deps.DB}.Register(mux, "/api/v1")
	admin.Handler{DB: deps.DB}.Register(mux, "/api/v1")

	return cors(mux)
}

func cors(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Access-Control-Allow-Origin", "*")
		w.Header().Set("Access-Control-Allow-Headers", "Content-Type, Authorization")
		w.Header().Set("Access-Control-Allow-Methods", "GET, POST, PATCH, DELETE, OPTIONS")
		if r.Method == http.MethodOptions {
			w.WriteHeader(http.StatusNoContent)
			return
		}
		if strings.HasSuffix(r.URL.Path, "/") && r.URL.Path != "/" {
			http.Redirect(w, r, strings.TrimRight(r.URL.Path, "/"), http.StatusMovedPermanently)
			return
		}
		next.ServeHTTP(w, r)
	})
}
