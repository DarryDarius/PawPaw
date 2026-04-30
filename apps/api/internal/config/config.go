package config

import "os"

type Config struct {
	HTTPAddr      string
	DatabaseURL   string
	RedisURL      string
	MigrationsDir string
	SeedsDir      string
}

func Load() Config {
	return Config{
		HTTPAddr:      env("HTTP_ADDR", ":8080"),
		DatabaseURL:   env("DATABASE_URL", "postgres://pawpaw:pawpaw@localhost:5432/pawpaw?sslmode=disable"),
		RedisURL:      env("REDIS_URL", "redis://localhost:6379/0"),
		MigrationsDir: env("MIGRATIONS_DIR", "infra/migrations"),
		SeedsDir:      env("SEEDS_DIR", "infra/seeds"),
	}
}

func env(key, fallback string) string {
	if value := os.Getenv(key); value != "" {
		return value
	}
	return fallback
}
