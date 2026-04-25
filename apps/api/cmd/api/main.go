package main

import (
	"encoding/json"
	"log"
	"net/http"
)

type healthResponse struct {
	Service string `json:"service"`
	Status  string `json:"status"`
}

func main() {
	mux := http.NewServeMux()
	mux.HandleFunc("/healthz", func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Content-Type", "application/json")
		_ = json.NewEncoder(w).Encode(healthResponse{
			Service: "pawpaw-api",
			Status:  "ok",
		})
	})

	log.Println("pawpaw-api listening on :8080")
	log.Fatal(http.ListenAndServe(":8080", mux))
}
