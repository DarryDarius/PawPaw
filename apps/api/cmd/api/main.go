package main

import (
	"encoding/json"
	"log"
	"net/http"
	"strings"
	"sync"
	"time"
)

type healthResponse struct {
	Service string `json:"service"`
	Status  string `json:"status"`
}

type petProfile struct {
	ID                  string   `json:"id"`
	OwnerUserID         string   `json:"ownerUserId"`
	Name                string   `json:"name"`
	Breed               string   `json:"breed"`
	Size                string   `json:"size"`
	EnergyLevel         string   `json:"energyLevel"`
	VaccineStatus       string   `json:"vaccineStatus"`
	PersonalityTags     []string `json:"personalityTags"`
	ActivityPreferences []string `json:"activityPreferences"`
	Neighborhood        string   `json:"neighborhood"`
	DistanceKm          float64  `json:"distanceKm"`
	LikedBack           bool     `json:"likedBack"`
}

type recommendationCard struct {
	Pet     petProfile `json:"pet"`
	Score   int        `json:"score"`
	Reasons []string   `json:"reasons"`
}

type swipe struct {
	ID             string `json:"id"`
	UserID         string `json:"userId"`
	PetID          string `json:"petId"`
	TargetUserID   string `json:"targetUserId"`
	TargetPetID    string `json:"targetPetId"`
	Action         string `json:"action"`
	IdempotencyKey string `json:"idempotencyKey"`
	CreatedAt      string `json:"createdAt"`
}

type match struct {
	ID          string `json:"id"`
	PetID       string `json:"petId"`
	TargetPetID string `json:"targetPetId"`
	Status      string `json:"status"`
	CreatedAt   string `json:"createdAt"`
}

type playdate struct {
	ID              string `json:"id"`
	MatchID         string `json:"matchId"`
	LocationID      string `json:"locationId"`
	StartAt         string `json:"startAt"`
	Note            string `json:"note"`
	VaccineRequired bool   `json:"vaccineRequired"`
	Status          string `json:"status"`
	CreatedAt       string `json:"createdAt"`
}

type location struct {
	ID            string  `json:"id"`
	Name          string  `json:"name"`
	Type          string  `json:"type"`
	Neighborhood  string  `json:"neighborhood"`
	DistanceKm    float64 `json:"distanceKm"`
	IsPublicPlace bool    `json:"isPublicPlace"`
	SafetyNotes   string  `json:"safetyNotes"`
}

type appStore struct {
	mu        sync.Mutex
	myPetID   string
	pets      map[string]petProfile
	swipes    map[string]swipe
	matches   map[string]match
	playdates map[string]playdate
	locations map[string]location
}

type apiError struct {
	Error string `json:"error"`
}

func newStore() *appStore {
	return &appStore{
		myPetID: "p1",
		pets: map[string]petProfile{
			"p1": {ID: "p1", OwnerUserID: "u1", Name: "Mochi", Breed: "Corgi", Size: "small", EnergyLevel: "medium", VaccineStatus: "verified", PersonalityTags: []string{"friendly", "gentle", "shy_at_first"}, ActivityPreferences: []string{"walk", "dog_park", "training"}, Neighborhood: "Hyde Park"},
			"p2": {ID: "p2", OwnerUserID: "u2", Name: "Biscuit", Breed: "Beagle", Size: "medium", EnergyLevel: "medium", VaccineStatus: "verified", PersonalityTags: []string{"friendly", "curious", "food_motivated"}, ActivityPreferences: []string{"walk", "dog_park", "short_trip"}, Neighborhood: "Hyde Park", DistanceKm: 1.4, LikedBack: true},
			"p3": {ID: "p3", OwnerUserID: "u3", Name: "Luna", Breed: "Toy Poodle", Size: "small", EnergyLevel: "low", VaccineStatus: "verified", PersonalityTags: []string{"calm", "gentle", "people_friendly"}, ActivityPreferences: []string{"walk", "cafe", "small_group"}, Neighborhood: "Kenwood", DistanceKm: 2.1},
			"p4": {ID: "p4", OwnerUserID: "u4", Name: "Otis", Breed: "Golden Retriever", Size: "large", EnergyLevel: "high", VaccineStatus: "self_reported", PersonalityTags: []string{"playful", "high_energy", "large_dog_friendly"}, ActivityPreferences: []string{"dog_park", "fetch", "short_trip"}, Neighborhood: "South Loop", DistanceKm: 5.8, LikedBack: true},
		},
		swipes:    map[string]swipe{},
		matches:   map[string]match{},
		playdates: map[string]playdate{},
		locations: map[string]location{
			"loc1": {ID: "loc1", Name: "Jackson Bark", Type: "Dog park", Neighborhood: "Hyde Park", DistanceKm: 1.2, IsPublicPlace: true, SafetyNotes: "Fenced dog park, best for daytime meetups."},
			"loc2": {ID: "loc2", Name: "Promontory Point", Type: "Lakefront walk", Neighborhood: "Hyde Park", DistanceKm: 1.7, IsPublicPlace: true, SafetyNotes: "Open public route, keep dogs leashed."},
		},
	}
}

func main() {
	store := newStore()
	mux := http.NewServeMux()
	mux.HandleFunc("/healthz", func(w http.ResponseWriter, r *http.Request) {
		writeJSON(w, http.StatusOK, healthResponse{Service: "pawpaw-api", Status: "ok"})
	})
	mux.HandleFunc("/api/recommendations/feed", store.handleRecommendationFeed)
	mux.HandleFunc("/api/swipes", store.handleSwipes)
	mux.HandleFunc("/api/matches", store.handleMatches)
	mux.HandleFunc("/api/playdates", store.handlePlaydates)
	mux.HandleFunc("/api/locations", store.handleLocations)

	log.Println("pawpaw-api listening on :8080")
	log.Fatal(http.ListenAndServe(":8080", cors(mux)))
}

func (s *appStore) handleRecommendationFeed(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodGet {
		writeError(w, http.StatusMethodNotAllowed, "method not allowed")
		return
	}
	s.mu.Lock()
	defer s.mu.Unlock()
	myPet := s.pets[s.myPetID]
	swiped := map[string]bool{}
	for _, item := range s.swipes {
		swiped[item.TargetPetID] = true
	}
	cards := []recommendationCard{}
	for _, pet := range s.pets {
		if pet.ID == s.myPetID || swiped[pet.ID] {
			continue
		}
		score := compatibilityScore(myPet, pet)
		cards = append(cards, recommendationCard{
			Pet:   pet,
			Score: score,
			Reasons: []string{
				pet.Neighborhood + " neighborhood",
				pet.Size + " size compatibility",
				pet.VaccineStatus + " vaccine status",
			},
		})
	}
	writeJSON(w, http.StatusOK, map[string]any{"recommendations": cards})
}

func (s *appStore) handleSwipes(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPost {
		writeError(w, http.StatusMethodNotAllowed, "method not allowed")
		return
	}
	var input struct {
		PetID          string `json:"petId"`
		TargetPetID    string `json:"targetPetId"`
		Action         string `json:"action"`
		IdempotencyKey string `json:"idempotencyKey"`
	}
	if err := json.NewDecoder(r.Body).Decode(&input); err != nil {
		writeError(w, http.StatusBadRequest, "invalid json")
		return
	}
	if input.PetID == "" || input.TargetPetID == "" || !contains([]string{"like", "pass"}, input.Action) {
		writeError(w, http.StatusBadRequest, "invalid swipe")
		return
	}
	s.mu.Lock()
	defer s.mu.Unlock()
	target, ok := s.pets[input.TargetPetID]
	if !ok {
		writeError(w, http.StatusNotFound, "target pet not found")
		return
	}
	key := input.IdempotencyKey
	if key == "" {
		key = input.PetID + ":" + input.TargetPetID + ":" + input.Action
	}
	if existing, ok := s.swipes[key]; ok {
		writeJSON(w, http.StatusOK, map[string]any{"swipe": existing, "matched": false})
		return
	}
	item := swipe{
		ID:             "swipe-" + time.Now().UTC().Format("20060102150405.000000000"),
		UserID:         "u1",
		PetID:          input.PetID,
		TargetUserID:   target.OwnerUserID,
		TargetPetID:    input.TargetPetID,
		Action:         input.Action,
		IdempotencyKey: key,
		CreatedAt:      time.Now().UTC().Format(time.RFC3339),
	}
	s.swipes[key] = item
	var createdMatch *match
	if input.Action == "like" && target.LikedBack {
		next := match{
			ID:          "match-" + time.Now().UTC().Format("20060102150405.000000000"),
			PetID:       input.PetID,
			TargetPetID: input.TargetPetID,
			Status:      "active",
			CreatedAt:   time.Now().UTC().Format(time.RFC3339),
		}
		s.matches[next.ID] = next
		createdMatch = &next
	}
	writeJSON(w, http.StatusCreated, map[string]any{"swipe": item, "matched": createdMatch != nil, "match": createdMatch})
}

func (s *appStore) handleMatches(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodGet {
		writeError(w, http.StatusMethodNotAllowed, "method not allowed")
		return
	}
	s.mu.Lock()
	defer s.mu.Unlock()
	items := []match{}
	for _, item := range s.matches {
		items = append(items, item)
	}
	writeJSON(w, http.StatusOK, map[string]any{"matches": items})
}

func (s *appStore) handlePlaydates(w http.ResponseWriter, r *http.Request) {
	switch r.Method {
	case http.MethodGet:
		s.mu.Lock()
		defer s.mu.Unlock()
		items := []playdate{}
		for _, item := range s.playdates {
			items = append(items, item)
		}
		writeJSON(w, http.StatusOK, map[string]any{"playdates": items})
	case http.MethodPost:
		var input playdate
		if err := json.NewDecoder(r.Body).Decode(&input); err != nil {
			writeError(w, http.StatusBadRequest, "invalid json")
			return
		}
		if input.MatchID == "" || input.LocationID == "" || input.StartAt == "" {
			writeError(w, http.StatusBadRequest, "missing required playdate fields")
			return
		}
		s.mu.Lock()
		defer s.mu.Unlock()
		input.ID = "playdate-" + time.Now().UTC().Format("20060102150405.000000000")
		input.Status = "pending"
		input.CreatedAt = time.Now().UTC().Format(time.RFC3339)
		s.playdates[input.ID] = input
		writeJSON(w, http.StatusCreated, map[string]any{"playdate": input})
	default:
		writeError(w, http.StatusMethodNotAllowed, "method not allowed")
	}
}

func (s *appStore) handleLocations(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodGet {
		writeError(w, http.StatusMethodNotAllowed, "method not allowed")
		return
	}
	s.mu.Lock()
	defer s.mu.Unlock()
	items := []location{}
	for _, item := range s.locations {
		items = append(items, item)
	}
	writeJSON(w, http.StatusOK, map[string]any{"locations": items})
}

func compatibilityScore(source, target petProfile) int {
	score := 55
	if source.Size == target.Size {
		score += 15
	}
	if target.VaccineStatus == "verified" {
		score += 12
	}
	if target.DistanceKm <= 2 {
		score += 10
	}
	for _, tag := range source.PersonalityTags {
		if contains(target.PersonalityTags, tag) {
			score += 4
		}
	}
	if score > 100 {
		return 100
	}
	return score
}

func contains(items []string, value string) bool {
	for _, item := range items {
		if item == value {
			return true
		}
	}
	return false
}

func writeJSON(w http.ResponseWriter, status int, value any) {
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(status)
	_ = json.NewEncoder(w).Encode(value)
}

func writeError(w http.ResponseWriter, status int, message string) {
	writeJSON(w, status, apiError{Error: message})
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
