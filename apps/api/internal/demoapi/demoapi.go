package demoapi

import (
	"encoding/json"
	"net/http"
	"sort"
	"sync"
	"time"

	"pawpaw/apps/api/internal/httpx"
)

type PetProfile struct {
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

type RecommendationCard struct {
	Pet     PetProfile `json:"pet"`
	Score   int        `json:"score"`
	Reasons []string   `json:"reasons"`
}

type Swipe struct {
	ID             string `json:"id"`
	UserID         string `json:"userId"`
	PetID          string `json:"petId"`
	TargetUserID   string `json:"targetUserId"`
	TargetPetID    string `json:"targetPetId"`
	Action         string `json:"action"`
	IdempotencyKey string `json:"idempotencyKey"`
	CreatedAt      string `json:"createdAt"`
}

type Match struct {
	ID          string `json:"id"`
	PetID       string `json:"petId"`
	TargetPetID string `json:"targetPetId"`
	Status      string `json:"status"`
	CreatedAt   string `json:"createdAt"`
}

type Playdate struct {
	ID              string `json:"id"`
	MatchID         string `json:"matchId"`
	LocationID      string `json:"locationId"`
	StartAt         string `json:"startAt"`
	Note            string `json:"note"`
	VaccineRequired bool   `json:"vaccineRequired"`
	Status          string `json:"status"`
	CreatedAt       string `json:"createdAt"`
}

type Location struct {
	ID            string  `json:"id"`
	Name          string  `json:"name"`
	Type          string  `json:"type"`
	Neighborhood  string  `json:"neighborhood"`
	DistanceKm    float64 `json:"distanceKm"`
	IsPublicPlace bool    `json:"isPublicPlace"`
	SafetyNotes   string  `json:"safetyNotes"`
}

type Store struct {
	mu        sync.Mutex
	myPetID   string
	pets      map[string]PetProfile
	swipes    map[string]Swipe
	matches   map[string]Match
	playdates map[string]Playdate
	locations map[string]Location
}

func NewStore() *Store {
	return &Store{
		myPetID: "p1",
		pets: map[string]PetProfile{
			"p1": {ID: "p1", OwnerUserID: "u1", Name: "Mochi", Breed: "Corgi", Size: "small", EnergyLevel: "medium", VaccineStatus: "verified", PersonalityTags: []string{"friendly", "gentle", "shy_at_first"}, ActivityPreferences: []string{"walk", "dog_park", "training"}, Neighborhood: "Hyde Park"},
			"p2": {ID: "p2", OwnerUserID: "u2", Name: "Biscuit", Breed: "Beagle", Size: "medium", EnergyLevel: "medium", VaccineStatus: "verified", PersonalityTags: []string{"friendly", "curious", "food_motivated"}, ActivityPreferences: []string{"walk", "dog_park", "short_trip"}, Neighborhood: "Hyde Park", DistanceKm: 1.4, LikedBack: true},
			"p3": {ID: "p3", OwnerUserID: "u3", Name: "Luna", Breed: "Toy Poodle", Size: "small", EnergyLevel: "low", VaccineStatus: "verified", PersonalityTags: []string{"calm", "gentle", "people_friendly"}, ActivityPreferences: []string{"walk", "cafe", "small_group"}, Neighborhood: "Kenwood", DistanceKm: 2.1},
			"p4": {ID: "p4", OwnerUserID: "u4", Name: "Otis", Breed: "Golden Retriever", Size: "large", EnergyLevel: "high", VaccineStatus: "self_reported", PersonalityTags: []string{"playful", "high_energy", "large_dog_friendly"}, ActivityPreferences: []string{"dog_park", "fetch", "short_trip"}, Neighborhood: "South Loop", DistanceKm: 5.8, LikedBack: true},
		},
		swipes:    map[string]Swipe{},
		matches:   map[string]Match{},
		playdates: map[string]Playdate{},
		locations: map[string]Location{
			"loc1": {ID: "loc1", Name: "Jackson Bark", Type: "Dog park", Neighborhood: "Hyde Park", DistanceKm: 1.2, IsPublicPlace: true, SafetyNotes: "Fenced dog park, best for daytime meetups."},
			"loc2": {ID: "loc2", Name: "Promontory Point", Type: "Lakefront walk", Neighborhood: "Hyde Park", DistanceKm: 1.7, IsPublicPlace: true, SafetyNotes: "Open public route, keep dogs leashed."},
		},
	}
}

func (s *Store) Register(mux *http.ServeMux, prefix string) {
	mux.HandleFunc(prefix+"/recommendations/feed", s.handleRecommendationFeed)
	mux.HandleFunc(prefix+"/swipes", s.handleSwipes)
	mux.HandleFunc(prefix+"/matches", s.handleMatches)
	mux.HandleFunc(prefix+"/playdates", s.handlePlaydates)
	mux.HandleFunc(prefix+"/locations", s.handleLocations)
}

func (s *Store) handleRecommendationFeed(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodGet {
		httpx.MethodNotAllowed(w)
		return
	}
	s.mu.Lock()
	defer s.mu.Unlock()

	myPet := s.pets[s.myPetID]
	swiped := map[string]bool{}
	for _, item := range s.swipes {
		swiped[item.TargetPetID] = true
	}
	cards := []RecommendationCard{}
	for _, pet := range s.pets {
		if pet.ID == s.myPetID || swiped[pet.ID] {
			continue
		}
		score := compatibilityScore(myPet, pet)
		cards = append(cards, RecommendationCard{
			Pet:   pet,
			Score: score,
			Reasons: []string{
				pet.Neighborhood + " neighborhood",
				pet.Size + " size compatibility",
				pet.VaccineStatus + " vaccine status",
			},
		})
	}
	sort.SliceStable(cards, func(i, j int) bool {
		return cards[i].Score > cards[j].Score
	})
	httpx.WriteJSON(w, http.StatusOK, map[string]any{"recommendations": cards})
}

func (s *Store) handleSwipes(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPost {
		httpx.MethodNotAllowed(w)
		return
	}
	var input struct {
		PetID          string `json:"petId"`
		TargetPetID    string `json:"targetPetId"`
		Action         string `json:"action"`
		IdempotencyKey string `json:"idempotencyKey"`
	}
	if err := json.NewDecoder(r.Body).Decode(&input); err != nil {
		httpx.WriteError(w, http.StatusBadRequest, "invalid_json", "Invalid JSON request body", nil)
		return
	}
	if input.PetID == "" || input.TargetPetID == "" || !contains([]string{"like", "pass"}, input.Action) {
		httpx.WriteError(w, http.StatusBadRequest, "invalid_swipe", "Invalid swipe request", nil)
		return
	}

	s.mu.Lock()
	defer s.mu.Unlock()

	target, ok := s.pets[input.TargetPetID]
	if !ok {
		httpx.WriteError(w, http.StatusNotFound, "target_pet_not_found", "Target pet not found", nil)
		return
	}
	key := input.IdempotencyKey
	if key == "" {
		key = input.PetID + ":" + input.TargetPetID + ":" + input.Action
	}
	if existing, ok := s.swipes[key]; ok {
		httpx.WriteJSON(w, http.StatusOK, map[string]any{"swipe": existing, "matched": false})
		return
	}

	now := time.Now().UTC()
	item := Swipe{
		ID:             "swipe-" + now.Format("20060102150405.000000000"),
		UserID:         "u1",
		PetID:          input.PetID,
		TargetUserID:   target.OwnerUserID,
		TargetPetID:    input.TargetPetID,
		Action:         input.Action,
		IdempotencyKey: key,
		CreatedAt:      now.Format(time.RFC3339),
	}
	s.swipes[key] = item

	var createdMatch *Match
	if input.Action == "like" && target.LikedBack {
		next := Match{
			ID:          "match-" + now.Format("20060102150405.000000000"),
			PetID:       input.PetID,
			TargetPetID: input.TargetPetID,
			Status:      "active",
			CreatedAt:   now.Format(time.RFC3339),
		}
		s.matches[next.ID] = next
		createdMatch = &next
	}
	httpx.WriteJSON(w, http.StatusCreated, map[string]any{"swipe": item, "matched": createdMatch != nil, "match": createdMatch})
}

func (s *Store) handleMatches(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodGet {
		httpx.MethodNotAllowed(w)
		return
	}
	s.mu.Lock()
	defer s.mu.Unlock()

	items := []Match{}
	for _, item := range s.matches {
		items = append(items, item)
	}
	httpx.WriteJSON(w, http.StatusOK, map[string]any{"matches": items})
}

func (s *Store) handlePlaydates(w http.ResponseWriter, r *http.Request) {
	switch r.Method {
	case http.MethodGet:
		s.mu.Lock()
		defer s.mu.Unlock()
		items := []Playdate{}
		for _, item := range s.playdates {
			items = append(items, item)
		}
		httpx.WriteJSON(w, http.StatusOK, map[string]any{"playdates": items})
	case http.MethodPost:
		var input Playdate
		if err := json.NewDecoder(r.Body).Decode(&input); err != nil {
			httpx.WriteError(w, http.StatusBadRequest, "invalid_json", "Invalid JSON request body", nil)
			return
		}
		if input.MatchID == "" || input.LocationID == "" || input.StartAt == "" {
			httpx.WriteError(w, http.StatusBadRequest, "missing_playdate_fields", "Missing required playdate fields", nil)
			return
		}
		s.mu.Lock()
		defer s.mu.Unlock()
		now := time.Now().UTC()
		input.ID = "playdate-" + now.Format("20060102150405.000000000")
		input.Status = "pending"
		input.CreatedAt = now.Format(time.RFC3339)
		s.playdates[input.ID] = input
		httpx.WriteJSON(w, http.StatusCreated, map[string]any{"playdate": input})
	default:
		httpx.MethodNotAllowed(w)
	}
}

func (s *Store) handleLocations(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodGet {
		httpx.MethodNotAllowed(w)
		return
	}
	s.mu.Lock()
	defer s.mu.Unlock()

	items := []Location{}
	for _, item := range s.locations {
		items = append(items, item)
	}
	httpx.WriteJSON(w, http.StatusOK, map[string]any{"locations": items})
}

func compatibilityScore(source, target PetProfile) int {
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
