package main

import (
	"context"
	"log"
	"time"

	"pawpaw/apps/api/internal/config"
	"pawpaw/apps/api/internal/db"
	"pawpaw/apps/api/internal/migrate"
)

func main() {
	cfg := config.Load()
	ctx, cancel := context.WithTimeout(context.Background(), 30*time.Second)
	defer cancel()

	database, err := db.Open(ctx, cfg.DatabaseURL)
	if err != nil {
		log.Fatalf("connect postgres: %v", err)
	}
	defer database.Close()

	if err := migrate.ApplyDir(ctx, database, cfg.MigrationsDir); err != nil {
		log.Fatalf("apply migrations: %v", err)
	}
	log.Printf("migrations applied from %s", cfg.MigrationsDir)
}
