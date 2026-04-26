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

type user struct {
	ID       string `json:"id"`
	Nickname string `json:"nickname"`
	CityCode string `json:"cityCode"`
}

type pet struct {
	ID         string `json:"id"`
	Name       string `json:"name"`
	Species    string `json:"species"`
	Breed      string `json:"breed,omitempty"`
	Sex        string `json:"sex,omitempty"`
	BirthDate  string `json:"birthDate,omitempty"`
	AvatarURL  string `json:"avatarUrl,omitempty"`
	CityCode   string `json:"cityCode"`
	Visibility string `json:"visibility"`
	Status     string `json:"status"`
	CreatedAt  string `json:"createdAt"`
	UpdatedAt  string `json:"updatedAt"`
}

type ownerPetBinding struct {
	UserID          string `json:"userId"`
	PetID           string `json:"petId"`
	Role            string `json:"role"`
	Status          string `json:"status"`
	IsPrimary       bool   `json:"isPrimary"`
	InvitedByUserID string `json:"invitedByUserId,omitempty"`
	CreatedAt       string `json:"createdAt"`
	UpdatedAt       string `json:"updatedAt"`
}

type petWithBinding struct {
	pet
	Role          string `json:"role"`
	IsPrimary     bool   `json:"isPrimary"`
	BindingStatus string `json:"bindingStatus"`
}

type post struct {
	ID               string   `json:"id"`
	AuthorUserID     string   `json:"authorUserId"`
	PetIDs           []string `json:"petIds"`
	PostType         string   `json:"postType"`
	Body             string   `json:"body"`
	Topic            string   `json:"topic"`
	CityCode         string   `json:"cityCode"`
	Visibility       string   `json:"visibility"`
	ModerationStatus string   `json:"moderationStatus"`
	MediaURLs        []string `json:"mediaUrls"`
	LikeCount        int      `json:"likeCount"`
	CommentCount     int      `json:"commentCount"`
	CollectCount     int      `json:"collectCount"`
	CreatedAt        string   `json:"createdAt"`
	UpdatedAt        string   `json:"updatedAt"`
}

type createPostRequest struct {
	PetIDs     []string `json:"petIds"`
	Topic      string   `json:"topic"`
	Body       string   `json:"body"`
	Visibility string   `json:"visibility"`
	MediaURLs  []string `json:"mediaUrls"`
}

type appStore struct {
	mu       sync.Mutex
	user     user
	pets     map[string]pet
	bindings map[string]ownerPetBinding
	posts    map[string]post
	nextPet  int
	nextPost int
}

type apiError struct {
	Error string `json:"error"`
}

func newStore() *appStore {
	now := time.Now().UTC().Format(time.RFC3339)
	return &appStore{
		user: user{ID: "u1", Nickname: "Darius", CityCode: "shanghai"},
		pets: map[string]pet{
			"p1": {
				ID:         "p1",
				Name:       "奶盖",
				Species:    "cat",
				Breed:      "英短",
				Sex:        "female",
				BirthDate:  "2023-05-12",
				AvatarURL:  "https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?auto=format&fit=crop&w=900&q=80",
				CityCode:   "shanghai",
				Visibility: "public",
				Status:     "active",
				CreatedAt:  now,
				UpdatedAt:  now,
			},
		},
		bindings: map[string]ownerPetBinding{
			bindingKey("u1", "p1"): {
				UserID:    "u1",
				PetID:     "p1",
				Role:      "owner",
				Status:    "active",
				IsPrimary: true,
				CreatedAt: now,
				UpdatedAt: now,
			},
		},
		posts: map[string]post{
			"post1": {
				ID:               "post1",
				AuthorUserID:     "u1",
				PetIDs:           []string{"p1"},
				PostType:         "image_text",
				Body:             "第一次给奶盖建立 PawPaw 档案，顺手记录今天体重 4.2kg。",
				Topic:            "成长记录",
				CityCode:         "shanghai",
				Visibility:       "public",
				ModerationStatus: "approved",
				MediaURLs:        []string{"https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?auto=format&fit=crop&w=900&q=80"},
				LikeCount:        24,
				CommentCount:     2,
				CollectCount:     0,
				CreatedAt:        now,
				UpdatedAt:        now,
			},
		},
		nextPet:  2,
		nextPost: 2,
	}
}

func main() {
	store := newStore()
	mux := http.NewServeMux()
	mux.HandleFunc("/healthz", func(w http.ResponseWriter, r *http.Request) {
		writeJSON(w, http.StatusOK, healthResponse{
			Service: "pawpaw-api",
			Status:  "ok",
		})
	})
	mux.HandleFunc("/api/me/pets", store.handleMyPets)
	mux.HandleFunc("/api/pets", store.handlePets)
	mux.HandleFunc("/api/pets/", store.handlePetAction)
	mux.HandleFunc("/api/posts", store.handlePosts)
	mux.HandleFunc("/api/feed", store.handleFeed)

	log.Println("pawpaw-api listening on :8080")
	log.Fatal(http.ListenAndServe(":8080", mux))
}

func (s *appStore) handleMyPets(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodGet {
		writeError(w, http.StatusMethodNotAllowed, "method not allowed")
		return
	}
	s.mu.Lock()
	defer s.mu.Unlock()

	items := make([]petWithBinding, 0)
	for _, binding := range s.bindings {
		if binding.UserID != s.user.ID || binding.Status != "active" {
			continue
		}
		item, ok := s.pets[binding.PetID]
		if !ok || item.Status != "active" {
			continue
		}
		items = append(items, petWithBinding{
			pet:           item,
			Role:          binding.Role,
			IsPrimary:     binding.IsPrimary,
			BindingStatus: binding.Status,
		})
	}
	writeJSON(w, http.StatusOK, map[string]any{"pets": items})
}

func (s *appStore) handlePets(w http.ResponseWriter, r *http.Request) {
	if r.URL.Path != "/api/pets" {
		writeError(w, http.StatusNotFound, "not found")
		return
	}
	if r.Method != http.MethodPost {
		writeError(w, http.StatusMethodNotAllowed, "method not allowed")
		return
	}

	var input pet
	if err := json.NewDecoder(r.Body).Decode(&input); err != nil {
		writeError(w, http.StatusBadRequest, "invalid json")
		return
	}
	input = normalizePetInput(input)
	if err := validatePet(input); err != nil {
		writeError(w, http.StatusBadRequest, err.Error())
		return
	}

	s.mu.Lock()
	defer s.mu.Unlock()

	now := time.Now().UTC().Format(time.RFC3339)
	id := "p" + strconvItoa(s.nextPet)
	s.nextPet++
	input.ID = id
	input.Status = "active"
	input.CreatedAt = now
	input.UpdatedAt = now
	s.pets[id] = input

	isPrimary := s.activeBindingCount(s.user.ID) == 0
	binding := ownerPetBinding{
		UserID:    s.user.ID,
		PetID:     id,
		Role:      "owner",
		Status:    "active",
		IsPrimary: isPrimary,
		CreatedAt: now,
		UpdatedAt: now,
	}
	s.bindings[bindingKey(s.user.ID, id)] = binding

	writeJSON(w, http.StatusCreated, petWithBinding{
		pet:           input,
		Role:          binding.Role,
		IsPrimary:     binding.IsPrimary,
		BindingStatus: binding.Status,
	})
}

func (s *appStore) handlePetAction(w http.ResponseWriter, r *http.Request) {
	trimmed := strings.TrimPrefix(r.URL.Path, "/api/pets/")
	parts := strings.Split(strings.Trim(trimmed, "/"), "/")
	if len(parts) == 0 || parts[0] == "" {
		writeError(w, http.StatusNotFound, "not found")
		return
	}
	petID := parts[0]
	if len(parts) == 1 && r.Method == http.MethodPatch {
		s.handleUpdatePet(w, r, petID)
		return
	}
	if len(parts) == 2 && parts[1] == "set-primary" && r.Method == http.MethodPost {
		s.handleSetPrimary(w, r, petID)
		return
	}
	if len(parts) == 2 && parts[1] == "binding" && r.Method == http.MethodDelete {
		s.handleRemoveBinding(w, r, petID)
		return
	}
	if len(parts) == 2 && parts[1] == "posts" && r.Method == http.MethodGet {
		s.handlePetPosts(w, r, petID)
		return
	}
	writeError(w, http.StatusNotFound, "not found")
}

func (s *appStore) handleUpdatePet(w http.ResponseWriter, r *http.Request, petID string) {
	var input pet
	if err := json.NewDecoder(r.Body).Decode(&input); err != nil {
		writeError(w, http.StatusBadRequest, "invalid json")
		return
	}
	input = normalizePetInput(input)
	if err := validatePet(input); err != nil {
		writeError(w, http.StatusBadRequest, err.Error())
		return
	}

	s.mu.Lock()
	defer s.mu.Unlock()

	binding, ok := s.bindings[bindingKey(s.user.ID, petID)]
	if !ok || binding.Status != "active" || binding.Role != "owner" {
		writeError(w, http.StatusForbidden, "owner binding required")
		return
	}
	current, ok := s.pets[petID]
	if !ok || current.Status != "active" {
		writeError(w, http.StatusNotFound, "pet not found")
		return
	}
	input.ID = petID
	input.Status = current.Status
	input.CreatedAt = current.CreatedAt
	input.UpdatedAt = time.Now().UTC().Format(time.RFC3339)
	s.pets[petID] = input

	writeJSON(w, http.StatusOK, petWithBinding{
		pet:           input,
		Role:          binding.Role,
		IsPrimary:     binding.IsPrimary,
		BindingStatus: binding.Status,
	})
}

func (s *appStore) handleSetPrimary(w http.ResponseWriter, _ *http.Request, petID string) {
	s.mu.Lock()
	defer s.mu.Unlock()

	binding, ok := s.bindings[bindingKey(s.user.ID, petID)]
	if !ok || binding.Status != "active" || binding.Role != "owner" {
		writeError(w, http.StatusForbidden, "owner binding required")
		return
	}
	now := time.Now().UTC().Format(time.RFC3339)
	for key, item := range s.bindings {
		if item.UserID != s.user.ID || item.Status != "active" {
			continue
		}
		item.IsPrimary = item.PetID == petID
		item.UpdatedAt = now
		s.bindings[key] = item
	}
	writeJSON(w, http.StatusOK, map[string]any{"petId": petID, "isPrimary": true})
}

func (s *appStore) handleRemoveBinding(w http.ResponseWriter, _ *http.Request, petID string) {
	s.mu.Lock()
	defer s.mu.Unlock()

	key := bindingKey(s.user.ID, petID)
	binding, ok := s.bindings[key]
	if !ok || binding.Status != "active" {
		writeError(w, http.StatusNotFound, "binding not found")
		return
	}
	if binding.Role == "owner" && s.activeOwnerCount(petID) <= 1 {
		writeError(w, http.StatusConflict, "cannot remove the last owner binding")
		return
	}

	wasPrimary := binding.IsPrimary
	binding.Status = "removed"
	binding.IsPrimary = false
	binding.UpdatedAt = time.Now().UTC().Format(time.RFC3339)
	s.bindings[key] = binding

	if wasPrimary {
		s.promoteAnotherPrimary(s.user.ID)
	}
	writeJSON(w, http.StatusOK, binding)
}

func (s *appStore) handlePosts(w http.ResponseWriter, r *http.Request) {
	if r.URL.Path != "/api/posts" {
		writeError(w, http.StatusNotFound, "not found")
		return
	}
	if r.Method != http.MethodPost {
		writeError(w, http.StatusMethodNotAllowed, "method not allowed")
		return
	}

	var input createPostRequest
	if err := json.NewDecoder(r.Body).Decode(&input); err != nil {
		writeError(w, http.StatusBadRequest, "invalid json")
		return
	}
	input = normalizePostInput(input)
	if err := validatePostInput(input); err != nil {
		writeError(w, http.StatusBadRequest, err.Error())
		return
	}

	s.mu.Lock()
	defer s.mu.Unlock()

	for _, petID := range input.PetIDs {
		if !s.canUsePet(s.user.ID, petID) {
			writeError(w, http.StatusForbidden, "owner or family binding required")
			return
		}
	}
	now := time.Now().UTC().Format(time.RFC3339)
	id := "post" + strconvItoa(s.nextPost)
	s.nextPost++
	cityCode := s.user.CityCode
	if firstPet, ok := s.pets[input.PetIDs[0]]; ok && firstPet.CityCode != "" {
		cityCode = firstPet.CityCode
	}
	item := post{
		ID:               id,
		AuthorUserID:     s.user.ID,
		PetIDs:           input.PetIDs,
		PostType:         "image_text",
		Body:             input.Body,
		Topic:            input.Topic,
		CityCode:         cityCode,
		Visibility:       input.Visibility,
		ModerationStatus: "pending",
		MediaURLs:        input.MediaURLs,
		CreatedAt:        now,
		UpdatedAt:        now,
	}
	s.posts[id] = item
	writeJSON(w, http.StatusCreated, item)
}

func (s *appStore) handleFeed(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodGet {
		writeError(w, http.StatusMethodNotAllowed, "method not allowed")
		return
	}
	s.mu.Lock()
	defer s.mu.Unlock()

	items := make([]post, 0)
	for _, item := range s.posts {
		if item.Visibility == "private" && !s.canViewPrivatePost(s.user.ID, item) {
			continue
		}
		items = append(items, item)
	}
	writeJSON(w, http.StatusOK, map[string]any{"posts": items})
}

func (s *appStore) handlePetPosts(w http.ResponseWriter, _ *http.Request, petID string) {
	s.mu.Lock()
	defer s.mu.Unlock()

	if _, ok := s.bindings[bindingKey(s.user.ID, petID)]; !ok {
		writeError(w, http.StatusForbidden, "active binding required")
		return
	}
	items := make([]post, 0)
	for _, item := range s.posts {
		if stringSliceContains(item.PetIDs, petID) {
			items = append(items, item)
		}
	}
	writeJSON(w, http.StatusOK, map[string]any{"posts": items})
}

func (s *appStore) activeBindingCount(userID string) int {
	count := 0
	for _, binding := range s.bindings {
		if binding.UserID == userID && binding.Status == "active" {
			count++
		}
	}
	return count
}

func (s *appStore) activeOwnerCount(petID string) int {
	count := 0
	for _, binding := range s.bindings {
		if binding.PetID == petID && binding.Status == "active" && binding.Role == "owner" {
			count++
		}
	}
	return count
}

func (s *appStore) promoteAnotherPrimary(userID string) {
	for key, binding := range s.bindings {
		if binding.UserID == userID && binding.Status == "active" {
			binding.IsPrimary = true
			binding.UpdatedAt = time.Now().UTC().Format(time.RFC3339)
			s.bindings[key] = binding
			return
		}
	}
}

func (s *appStore) canUsePet(userID, petID string) bool {
	binding, ok := s.bindings[bindingKey(userID, petID)]
	if !ok || binding.Status != "active" {
		return false
	}
	return binding.Role == "owner" || binding.Role == "family"
}

func (s *appStore) canViewPrivatePost(userID string, item post) bool {
	for _, petID := range item.PetIDs {
		binding, ok := s.bindings[bindingKey(userID, petID)]
		if ok && binding.Status == "active" {
			return true
		}
	}
	return false
}

func validatePet(item pet) error {
	if strings.TrimSpace(item.Name) == "" || len([]rune(item.Name)) > 20 {
		return errString("pet name must be 1-20 characters")
	}
	if !oneOf(item.Species, "cat", "dog", "other") {
		return errString("invalid species")
	}
	if item.Sex != "" && !oneOf(item.Sex, "female", "male", "unknown") {
		return errString("invalid sex")
	}
	if !oneOf(item.Visibility, "public", "city_only", "private") {
		return errString("invalid visibility")
	}
	if strings.TrimSpace(item.CityCode) == "" {
		return errString("cityCode is required")
	}
	return nil
}

func validatePostInput(item createPostRequest) error {
	if len(item.PetIDs) == 0 {
		return errString("at least one petId is required")
	}
	if strings.TrimSpace(item.Body) == "" || len([]rune(item.Body)) > 1000 {
		return errString("post body must be 1-1000 characters")
	}
	if !oneOf(item.Topic, "成长记录", "附近约玩", "新手求助", "宠物友好地点", "健康记录") {
		return errString("invalid topic")
	}
	if !oneOf(item.Visibility, "public", "city_only", "private") {
		return errString("invalid visibility")
	}
	if len(item.MediaURLs) > 9 {
		return errString("mediaUrls supports at most 9 images")
	}
	return nil
}

func normalizePetInput(item pet) pet {
	item.Name = strings.TrimSpace(item.Name)
	item.Breed = strings.TrimSpace(item.Breed)
	item.CityCode = strings.TrimSpace(item.CityCode)
	if item.Visibility == "" {
		item.Visibility = "public"
	}
	return item
}

func normalizePostInput(item createPostRequest) createPostRequest {
	seen := map[string]bool{}
	petIDs := make([]string, 0, len(item.PetIDs))
	for _, petID := range item.PetIDs {
		petID = strings.TrimSpace(petID)
		if petID == "" || seen[petID] {
			continue
		}
		seen[petID] = true
		petIDs = append(petIDs, petID)
	}
	mediaURLs := make([]string, 0, len(item.MediaURLs))
	for _, url := range item.MediaURLs {
		url = strings.TrimSpace(url)
		if url != "" {
			mediaURLs = append(mediaURLs, url)
		}
	}
	if item.Visibility == "" {
		item.Visibility = "public"
	}
	item.PetIDs = petIDs
	item.Body = strings.TrimSpace(item.Body)
	item.Topic = strings.TrimSpace(item.Topic)
	item.MediaURLs = mediaURLs
	return item
}

type errString string

func (e errString) Error() string {
	return string(e)
}

func oneOf(value string, options ...string) bool {
	for _, option := range options {
		if value == option {
			return true
		}
	}
	return false
}

func stringSliceContains(values []string, target string) bool {
	for _, value := range values {
		if value == target {
			return true
		}
	}
	return false
}

func bindingKey(userID, petID string) string {
	return userID + ":" + petID
}

func writeJSON(w http.ResponseWriter, status int, value any) {
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(status)
	_ = json.NewEncoder(w).Encode(value)
}

func writeError(w http.ResponseWriter, status int, message string) {
	writeJSON(w, status, apiError{Error: message})
}

func strconvItoa(value int) string {
	if value == 0 {
		return "0"
	}
	digits := make([]byte, 0, 8)
	for value > 0 {
		digits = append([]byte{byte('0' + value%10)}, digits...)
		value /= 10
	}
	return string(digits)
}
