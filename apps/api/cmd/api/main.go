package main

import (
	"context"
	"log"
	"net/http"
	"time"

	"pawpaw/apps/api/internal/cache"
	"pawpaw/apps/api/internal/config"
	"pawpaw/apps/api/internal/db"
	"pawpaw/apps/api/internal/server"
)

func main() {
	cfg := config.Load()
	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	database, err := db.Open(ctx, cfg.DatabaseURL)
	if err != nil {
		log.Fatalf("connect postgres: %v", err)
	}
	defer database.Close()

	redisClient, err := cache.Open(ctx, cfg.RedisURL)
	if err != nil {
		log.Fatalf("connect redis: %v", err)
	}
	defer redisClient.Close()

	handler := server.New(server.Dependencies{
		Config: cfg,
		DB:     database,
		Redis:  redisClient,
	})

	log.Printf("pawpaw-api listening on %s", cfg.HTTPAddr)
	log.Fatal(http.ListenAndServe(cfg.HTTPAddr, handler))
}
