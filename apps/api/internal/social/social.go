package social

import (
	"context"
	"database/sql"
	"encoding/json"
	"fmt"
	"math"
	"net/http"
	"sort"
	"strconv"
	"strings"

	"pawpaw/apps/api/internal/auth"
	"pawpaw/apps/api/internal/httpx"
	"pawpaw/apps/api/internal/profile"
)

type Handler struct {
	DB *sql.DB
}

type Card struct {
	Pet         profile.Pet `json:"pet"`
	Owner       Owner       `json:"owner"`
	Score       int         `json:"score"`
	Reasons     []string    `json:"reasons"`
	ReasonCodes []string    `json:"reasonCodes"`
}

type Owner struct {
	ID                int64    `json:"id"`
	Nickname          string   `json:"nickname"`
	Neighborhood      string   `json:"neighborhood"`
	AvailableWindows  []string `json:"availableWindows"`
	MaxDistanceKm     float64  `json:"maxDistanceKm"`
	MeetupPreferences []string `json:"meetupPreferences"`
}

type Swipe struct {
	ID             int64  `json:"id"`
	UserID         int64  `json:"userId"`
	PetID          int64  `json:"petId"`
	TargetUserID   int64  `json:"targetUserId"`
	TargetPetID    int64  `json:"targetPetId"`
	Action         string `json:"action"`
	IdempotencyKey string `json:"idempotencyKey"`
	CreatedAt      string `json:"createdAt"`
}

type Match struct {
	ID             int64       `json:"id"`
	Status         string      `json:"status"`
	ConversationID int64       `json:"conversationId"`
	Pet            profile.Pet `json:"pet"`
	TargetPet      profile.Pet `json:"targetPet"`
	CreatedAt      string      `json:"createdAt"`
}

type Message struct {
	ID             int64  `json:"id"`
	ConversationID int64  `json:"conversationId"`
	SenderUserID   int64  `json:"senderUserId"`
	Body           string `json:"body"`
	Seq            int64  `json:"seq"`
	CreatedAt      string `json:"createdAt"`
}

func (h Handler) Register(mux *http.ServeMux, prefix string) {
	mux.Handle(prefix+"/recommendations/feed", auth.Middleware(h.DB, http.HandlerFunc(h.handleRecommendationFeed)))
	mux.Handle(prefix+"/swipes", auth.Middleware(h.DB, http.HandlerFunc(h.handleSwipes)))
	mux.Handle(prefix+"/swipes/me", auth.Middleware(h.DB, http.HandlerFunc(h.handleMySwipes)))
	mux.Handle(prefix+"/matches", auth.Middleware(h.DB, http.HandlerFunc(h.handleMatches)))
	mux.Handle(prefix+"/matches/", auth.Middleware(h.DB, http.HandlerFunc(h.handleMatchByID)))
	mux.Handle(prefix+"/conversations/", auth.Middleware(h.DB, http.HandlerFunc(h.handleConversationByID)))
}

func (h Handler) handleRecommendationFeed(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodGet {
		httpx.MethodNotAllowed(w)
		return
	}
	userID, _ := auth.UserID(r.Context())
	me, err := profile.LoadMe(r.Context(), h.DB, userID)
	if err != nil {
		httpx.WriteError(w, http.StatusInternalServerError, "me_load_failed", "Could not load profile", nil)
		return
	}
	if !me.ProfileComplete {
		httpx.WriteError(w, http.StatusConflict, "profile_incomplete", "Complete owner and dog profiles before recommendations", nil)
		return
	}
	sourcePet := me.Pets[0]
	candidates, err := loadCandidates(r.Context(), h.DB, userID)
	if err != nil {
		httpx.WriteError(w, http.StatusInternalServerError, "recommendations_failed", "Could not load recommendations", nil)
		return
	}

	cards := []Card{}
	for _, candidate := range candidates {
		card := scoreCandidate(me, sourcePet, candidate)
		cards = append(cards, card)
	}
	sort.SliceStable(cards, func(i, j int) bool {
		return cards[i].Score > cards[j].Score
	})
	if len(cards) > 20 {
		cards = cards[:20]
	}
	for index, card := range cards {
		_ = logRecommendation(r.Context(), h.DB, userID, card.Pet.ID, index+1, card)
	}
	httpx.WriteJSON(w, http.StatusOK, map[string]any{"recommendations": cards})
}

func (h Handler) handleSwipes(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPost {
		httpx.MethodNotAllowed(w)
		return
	}
	userID, _ := auth.UserID(r.Context())
	var input struct {
		PetID          int64  `json:"petId"`
		TargetPetID    int64  `json:"targetPetId"`
		Action         string `json:"action"`
		IdempotencyKey string `json:"idempotencyKey"`
	}
	if err := json.NewDecoder(r.Body).Decode(&input); err != nil {
		httpx.WriteError(w, http.StatusBadRequest, "invalid_json", "Invalid JSON request body", nil)
		return
	}
	input.Action = strings.ToLower(strings.TrimSpace(input.Action))
	if input.PetID <= 0 || input.TargetPetID <= 0 || (input.Action != "like" && input.Action != "pass") {
		httpx.WriteError(w, http.StatusBadRequest, "invalid_swipe", "petId, targetPetId, and action are required", nil)
		return
	}
	result, err := createSwipe(r.Context(), h.DB, userID, input.PetID, input.TargetPetID, input.Action, input.IdempotencyKey)
	if err == sql.ErrNoRows {
		httpx.WriteError(w, http.StatusNotFound, "target_pet_not_found", "Target pet not found", nil)
		return
	}
	if err != nil {
		httpx.WriteError(w, http.StatusBadRequest, "swipe_failed", err.Error(), nil)
		return
	}
	status := http.StatusCreated
	if !result.Created {
		status = http.StatusOK
	}
	httpx.WriteJSON(w, status, result)
}

func (h Handler) handleMySwipes(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodGet {
		httpx.MethodNotAllowed(w)
		return
	}
	userID, _ := auth.UserID(r.Context())
	rows, err := h.DB.QueryContext(r.Context(), `
		select id, user_id, pet_id, target_user_id, target_pet_id, action, idempotency_key, created_at::text
		from swipes
		where user_id = $1
		order by created_at desc
	`, userID)
	if err != nil {
		httpx.WriteError(w, http.StatusInternalServerError, "swipes_load_failed", "Could not load swipes", nil)
		return
	}
	defer rows.Close()
	items := []Swipe{}
	for rows.Next() {
		item, err := scanSwipe(rows)
		if err != nil {
			httpx.WriteError(w, http.StatusInternalServerError, "swipes_load_failed", "Could not load swipes", nil)
			return
		}
		items = append(items, item)
	}
	httpx.WriteJSON(w, http.StatusOK, map[string]any{"swipes": items})
}

func (h Handler) handleMatches(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodGet {
		httpx.MethodNotAllowed(w)
		return
	}
	userID, _ := auth.UserID(r.Context())
	matches, err := loadMatches(r.Context(), h.DB, userID)
	if err != nil {
		httpx.WriteError(w, http.StatusInternalServerError, "matches_load_failed", "Could not load matches", nil)
		return
	}
	httpx.WriteJSON(w, http.StatusOK, map[string]any{"matches": matches})
}

func (h Handler) handleMatchByID(w http.ResponseWriter, r *http.Request) {
	userID, _ := auth.UserID(r.Context())
	suffix := strings.TrimPrefix(r.URL.Path, "/api/v1/matches/")
	if strings.HasSuffix(suffix, "/unmatch") {
		idText := strings.TrimSuffix(suffix, "/unmatch")
		matchID, ok := parseID(strings.Trim(idText, "/"))
		if !ok {
			httpx.WriteError(w, http.StatusBadRequest, "invalid_match_id", "Invalid match id", nil)
			return
		}
		if r.Method != http.MethodPost {
			httpx.MethodNotAllowed(w)
			return
		}
		if err := unmatch(r.Context(), h.DB, userID, matchID); err != nil {
			httpx.WriteError(w, http.StatusNotFound, "match_not_found", "Match not found", nil)
			return
		}
		httpx.WriteJSON(w, http.StatusOK, map[string]string{"status": "unmatched"})
		return
	}
	if r.Method != http.MethodGet {
		httpx.MethodNotAllowed(w)
		return
	}
	matchID, ok := parseID(strings.Trim(suffix, "/"))
	if !ok {
		httpx.WriteError(w, http.StatusBadRequest, "invalid_match_id", "Invalid match id", nil)
		return
	}
	item, err := loadMatch(r.Context(), h.DB, userID, matchID)
	if err == sql.ErrNoRows {
		httpx.WriteError(w, http.StatusNotFound, "match_not_found", "Match not found", nil)
		return
	}
	if err != nil {
		httpx.WriteError(w, http.StatusInternalServerError, "match_load_failed", "Could not load match", nil)
		return
	}
	httpx.WriteJSON(w, http.StatusOK, map[string]any{"match": item})
}

func (h Handler) handleConversationByID(w http.ResponseWriter, r *http.Request) {
	userID, _ := auth.UserID(r.Context())
	suffix := strings.TrimPrefix(r.URL.Path, "/api/v1/conversations/")
	if !strings.HasSuffix(suffix, "/messages") {
		http.NotFound(w, r)
		return
	}
	idText := strings.TrimSuffix(suffix, "/messages")
	conversationID, ok := parseID(strings.Trim(idText, "/"))
	if !ok {
		httpx.WriteError(w, http.StatusBadRequest, "invalid_conversation_id", "Invalid conversation id", nil)
		return
	}
	switch r.Method {
	case http.MethodGet:
		if ok, err := canAccessConversation(r.Context(), h.DB, userID, conversationID); err != nil || !ok {
			httpx.WriteError(w, http.StatusNotFound, "conversation_not_found", "Conversation not found", nil)
			return
		}
		messages, err := loadMessages(r.Context(), h.DB, conversationID)
		if err != nil {
			httpx.WriteError(w, http.StatusInternalServerError, "messages_load_failed", "Could not load messages", nil)
			return
		}
		httpx.WriteJSON(w, http.StatusOK, map[string]any{"messages": messages})
	case http.MethodPost:
		var input struct {
			Body string `json:"body"`
		}
		if err := json.NewDecoder(r.Body).Decode(&input); err != nil {
			httpx.WriteError(w, http.StatusBadRequest, "invalid_json", "Invalid JSON request body", nil)
			return
		}
		message, err := createMessage(r.Context(), h.DB, userID, conversationID, input.Body)
		if err == sql.ErrNoRows {
			httpx.WriteError(w, http.StatusNotFound, "conversation_not_found", "Conversation not found", nil)
			return
		}
		if err != nil {
			httpx.WriteError(w, http.StatusBadRequest, "message_create_failed", err.Error(), nil)
			return
		}
		httpx.WriteJSON(w, http.StatusCreated, map[string]any{"message": message})
	default:
		httpx.MethodNotAllowed(w)
	}
}

type candidate struct {
	Pet   profile.Pet
	Owner Owner
}

type swipeResult struct {
	Swipe          Swipe  `json:"swipe"`
	Created        bool   `json:"created"`
	Matched        bool   `json:"matched"`
	MatchID        int64  `json:"matchId,omitempty"`
	ConversationID int64  `json:"conversationId,omitempty"`
	Message        string `json:"message,omitempty"`
}

func loadCandidates(ctx context.Context, database *sql.DB, userID int64) ([]candidate, error) {
	rows, err := database.QueryContext(ctx, `
		select p.id, p.owner_user_id, p.name, coalesce(p.breed, ''), coalesce(p.birth_date::text, ''),
			coalesce(p.sex, ''), coalesce(p.avatar_url, ''), pp.size, pp.neutered, pp.vaccine_status,
			pp.personality_tags, pp.activity_preferences, pp.accepts_large_dogs, pp.energy_level, coalesce(pp.neighborhood, ''),
			u.id, u.nickname, coalesce(u.neighborhood, ''), coalesce(op.available_windows, '[]'::jsonb), coalesce(op.max_distance_km, 5)::float8, coalesce(op.meetup_preferences, '[]'::jsonb)
		from pets p
		join pet_profiles pp on pp.pet_id = p.id
		join users u on u.id = p.owner_user_id
		left join owner_profiles op on op.user_id = u.id
		where p.owner_user_id <> $1
			and u.risk_state = 'normal'
			and u.privacy_level <> 'private'
			and not exists (
				select 1 from swipes s where s.user_id = $1 and s.target_pet_id = p.id
			)
			and not exists (
				select 1 from blocks b where
					(b.blocker_user_id = $1 and b.blocked_user_id = p.owner_user_id)
					or (b.blocker_user_id = p.owner_user_id and b.blocked_user_id = $1)
			)
		limit 200
	`, userID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	items := []candidate{}
	for rows.Next() {
		var item candidate
		var personalityRaw, activityRaw, windowsRaw, meetupRaw []byte
		if err := rows.Scan(&item.Pet.ID, &item.Pet.OwnerUserID, &item.Pet.Name, &item.Pet.Breed, &item.Pet.BirthDate, &item.Pet.Sex, &item.Pet.AvatarURL, &item.Pet.Size, &item.Pet.Neutered, &item.Pet.VaccineStatus, &personalityRaw, &activityRaw, &item.Pet.AcceptsLargeDogs, &item.Pet.EnergyLevel, &item.Pet.Neighborhood, &item.Owner.ID, &item.Owner.Nickname, &item.Owner.Neighborhood, &windowsRaw, &item.Owner.MaxDistanceKm, &meetupRaw); err != nil {
			return nil, err
		}
		_ = json.Unmarshal(personalityRaw, &item.Pet.PersonalityTags)
		_ = json.Unmarshal(activityRaw, &item.Pet.ActivityPreferences)
		_ = json.Unmarshal(windowsRaw, &item.Owner.AvailableWindows)
		_ = json.Unmarshal(meetupRaw, &item.Owner.MeetupPreferences)
		items = append(items, item)
	}
	return items, rows.Err()
}

func scoreCandidate(me profile.MeResponse, sourcePet profile.Pet, candidate candidate) Card {
	locationScore := 65
	if strings.EqualFold(me.User.Neighborhood, candidate.Owner.Neighborhood) || strings.EqualFold(sourcePet.Neighborhood, candidate.Pet.Neighborhood) {
		locationScore = 100
	}
	personalityScore := overlapScore(sourcePet.PersonalityTags, candidate.Pet.PersonalityTags, []string{"friendly", "gentle", "calm"})
	sizeScore := sizeCompatibility(sourcePet, candidate.Pet)
	scheduleScore := overlapScore(me.OwnerProfile.AvailableWindows, candidate.Owner.AvailableWindows, nil)
	activityScore := overlapScore(sourcePet.ActivityPreferences, candidate.Pet.ActivityPreferences, nil)
	vaccineScore := map[string]int{"verified": 100, "self_reported": 65, "unknown": 35}[candidate.Pet.VaccineStatus]
	if vaccineScore == 0 {
		vaccineScore = 35
	}
	freshnessScore := 80
	score := int(math.Round(
		0.25*float64(locationScore) +
			0.20*float64(personalityScore) +
			0.15*float64(sizeScore) +
			0.15*float64(scheduleScore) +
			0.10*float64(activityScore) +
			0.10*float64(vaccineScore) +
			0.05*float64(freshnessScore),
	))
	reasons := []string{}
	reasonCodes := []string{}
	if locationScore == 100 {
		reasons = append(reasons, "Same neighborhood")
		reasonCodes = append(reasonCodes, "same_neighborhood")
	}
	if scheduleScore >= 70 {
		reasons = append(reasons, "Good schedule overlap")
		reasonCodes = append(reasonCodes, "schedule_overlap")
	}
	if vaccineScore == 100 {
		reasons = append(reasons, "Verified vaccine status")
		reasonCodes = append(reasonCodes, "verified_vaccine")
	}
	if sizeScore >= 75 {
		reasons = append(reasons, "Good size compatibility")
		reasonCodes = append(reasonCodes, "size_compatible")
	}
	if activityScore >= 70 {
		reasons = append(reasons, "Shared activity preferences")
		reasonCodes = append(reasonCodes, "shared_activity")
	}
	if len(reasons) == 0 {
		reasons = append(reasons, "Nearby profile with enough compatibility")
		reasonCodes = append(reasonCodes, "baseline_compatible")
	}
	return Card{Pet: candidate.Pet, Owner: candidate.Owner, Score: score, Reasons: reasons, ReasonCodes: reasonCodes}
}

func createSwipe(ctx context.Context, database *sql.DB, userID int64, petID int64, targetPetID int64, action string, idempotencyKey string) (swipeResult, error) {
	if idempotencyKey == "" {
		idempotencyKey = fmt.Sprintf("%d:%d:%s", userID, targetPetID, action)
	}
	tx, err := database.BeginTx(ctx, nil)
	if err != nil {
		return swipeResult{}, err
	}
	defer tx.Rollback()

	if ok, err := ownsPet(ctx, tx, userID, petID); err != nil || !ok {
		return swipeResult{}, fmt.Errorf("pet does not belong to current user")
	}
	targetUserID, err := targetOwner(ctx, tx, targetPetID)
	if err != nil {
		return swipeResult{}, err
	}
	if targetUserID == userID {
		return swipeResult{}, fmt.Errorf("cannot swipe your own pet")
	}

	item, created, err := insertSwipe(ctx, tx, userID, petID, targetUserID, targetPetID, action, idempotencyKey)
	if err != nil {
		return swipeResult{}, err
	}
	result := swipeResult{Swipe: item, Created: created}
	if !created {
		result.Message = "Already swiped this dog"
		if err := tx.Commit(); err != nil {
			return swipeResult{}, err
		}
		return result, nil
	}
	_, _ = tx.ExecContext(ctx, `
		update recommendation_logs set action = $1 where user_id = $2 and candidate_pet_id = $3
	`, action, userID, targetPetID)

	if action == "like" {
		matchID, conversationID, matched, err := maybeCreateMatch(ctx, tx, userID, petID, targetUserID, targetPetID)
		if err != nil {
			return swipeResult{}, err
		}
		result.Matched = matched
		result.MatchID = matchID
		result.ConversationID = conversationID
	}
	if err := tx.Commit(); err != nil {
		return swipeResult{}, err
	}
	return result, nil
}

func insertSwipe(ctx context.Context, tx *sql.Tx, userID int64, petID int64, targetUserID int64, targetPetID int64, action string, key string) (Swipe, bool, error) {
	row := tx.QueryRowContext(ctx, `
		insert into swipes (user_id, pet_id, target_user_id, target_pet_id, action, idempotency_key)
		values ($1, $2, $3, $4, $5, $6)
		on conflict do nothing
		returning id, user_id, pet_id, target_user_id, target_pet_id, action, idempotency_key, created_at::text
	`, userID, petID, targetUserID, targetPetID, action, key)
	item, err := scanSwipe(row)
	if err == nil {
		return item, true, nil
	}
	if err != sql.ErrNoRows {
		return Swipe{}, false, err
	}
	row = tx.QueryRowContext(ctx, `
		select id, user_id, pet_id, target_user_id, target_pet_id, action, idempotency_key, created_at::text
		from swipes
		where idempotency_key = $1 or (user_id = $2 and target_pet_id = $3)
		order by created_at desc
		limit 1
	`, key, userID, targetPetID)
	item, err = scanSwipe(row)
	return item, false, err
}

func maybeCreateMatch(ctx context.Context, tx *sql.Tx, userID int64, petID int64, targetUserID int64, targetPetID int64) (int64, int64, bool, error) {
	var mutual bool
	err := tx.QueryRowContext(ctx, `
		select exists(
			select 1 from swipes
			where user_id = $1 and pet_id = $2 and target_user_id = $3 and target_pet_id = $4 and action = 'like'
		)
	`, targetUserID, targetPetID, userID, petID).Scan(&mutual)
	if err != nil || !mutual {
		return 0, 0, false, err
	}

	userLow, userHigh, petLow, petHigh := normalizePair(userID, petID, targetUserID, targetPetID)
	var matchID int64
	err = tx.QueryRowContext(ctx, `
		insert into matches (user_low_id, user_high_id, pet_low_id, pet_high_id, status)
		values ($1, $2, $3, $4, 'active')
		on conflict (user_low_id, user_high_id, pet_low_id, pet_high_id)
		do update set status = 'active'
		returning id
	`, userLow, userHigh, petLow, petHigh).Scan(&matchID)
	if err != nil {
		return 0, 0, false, err
	}
	var conversationID int64
	err = tx.QueryRowContext(ctx, `
		insert into conversations (match_id, status, last_message_at)
		values ($1, 'active', now())
		on conflict (match_id) do update set status = 'active'
		returning id
	`, matchID).Scan(&conversationID)
	if err != nil {
		return 0, 0, false, err
	}
	_, _ = tx.ExecContext(ctx, `
		update recommendation_logs set matched = true where
			(user_id = $1 and candidate_pet_id = $2) or (user_id = $3 and candidate_pet_id = $4)
	`, userID, targetPetID, targetUserID, petID)
	return matchID, conversationID, true, nil
}

func loadMatches(ctx context.Context, database *sql.DB, userID int64) ([]Match, error) {
	rows, err := database.QueryContext(ctx, `
		select m.id, m.status, c.id, m.created_at::text,
			case when m.user_low_id = $1 then m.pet_low_id else m.pet_high_id end as my_pet_id,
			case when m.user_low_id = $1 then m.pet_high_id else m.pet_low_id end as target_pet_id
		from matches m
		join conversations c on c.match_id = m.id
		where (m.user_low_id = $1 or m.user_high_id = $1) and m.status = 'active'
		order by m.created_at desc
	`, userID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	items := []Match{}
	for rows.Next() {
		var item Match
		var petID, targetPetID int64
		if err := rows.Scan(&item.ID, &item.Status, &item.ConversationID, &item.CreatedAt, &petID, &targetPetID); err != nil {
			return nil, err
		}
		pet, err := loadPet(ctx, database, petID)
		if err != nil {
			return nil, err
		}
		target, err := loadPet(ctx, database, targetPetID)
		if err != nil {
			return nil, err
		}
		item.Pet = pet
		item.TargetPet = target
		items = append(items, item)
	}
	return items, rows.Err()
}

func loadMatch(ctx context.Context, database *sql.DB, userID int64, matchID int64) (Match, error) {
	matches, err := loadMatches(ctx, database, userID)
	if err != nil {
		return Match{}, err
	}
	for _, item := range matches {
		if item.ID == matchID {
			return item, nil
		}
	}
	return Match{}, sql.ErrNoRows
}

func unmatch(ctx context.Context, database *sql.DB, userID int64, matchID int64) error {
	result, err := database.ExecContext(ctx, `
		update matches set status = 'unmatched'
		where id = $1 and (user_low_id = $2 or user_high_id = $2)
	`, matchID, userID)
	if err != nil {
		return err
	}
	affected, _ := result.RowsAffected()
	if affected == 0 {
		return sql.ErrNoRows
	}
	return nil
}

func createMessage(ctx context.Context, database *sql.DB, userID int64, conversationID int64, body string) (Message, error) {
	body = strings.TrimSpace(body)
	if body == "" || len(body) > 1000 {
		return Message{}, fmt.Errorf("message body must be 1-1000 characters")
	}
	tx, err := database.BeginTx(ctx, nil)
	if err != nil {
		return Message{}, err
	}
	defer tx.Rollback()
	if ok, err := canAccessConversationTx(ctx, tx, userID, conversationID); err != nil || !ok {
		return Message{}, sql.ErrNoRows
	}
	var seq int64
	if err := tx.QueryRowContext(ctx, `select coalesce(max(seq), 0) + 1 from messages where conversation_id = $1`, conversationID).Scan(&seq); err != nil {
		return Message{}, err
	}
	row := tx.QueryRowContext(ctx, `
		insert into messages (conversation_id, sender_user_id, body, seq)
		values ($1, $2, $3, $4)
		returning id, conversation_id, sender_user_id, body, seq, created_at::text
	`, conversationID, userID, body, seq)
	message, err := scanMessage(row)
	if err != nil {
		return Message{}, err
	}
	_, _ = tx.ExecContext(ctx, `update conversations set last_message_at = now() where id = $1`, conversationID)
	if err := tx.Commit(); err != nil {
		return Message{}, err
	}
	return message, nil
}

func loadMessages(ctx context.Context, database *sql.DB, conversationID int64) ([]Message, error) {
	rows, err := database.QueryContext(ctx, `
		select id, conversation_id, sender_user_id, body, seq, created_at::text
		from messages
		where conversation_id = $1
		order by seq
	`, conversationID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()
	items := []Message{}
	for rows.Next() {
		item, err := scanMessage(rows)
		if err != nil {
			return nil, err
		}
		items = append(items, item)
	}
	return items, rows.Err()
}

func canAccessConversation(ctx context.Context, database *sql.DB, userID int64, conversationID int64) (bool, error) {
	var ok bool
	err := database.QueryRowContext(ctx, `
		select exists(
			select 1 from conversations c
			join matches m on m.id = c.match_id
			where c.id = $1 and m.status = 'active' and (m.user_low_id = $2 or m.user_high_id = $2)
		)
	`, conversationID, userID).Scan(&ok)
	return ok, err
}

func canAccessConversationTx(ctx context.Context, tx *sql.Tx, userID int64, conversationID int64) (bool, error) {
	var ok bool
	err := tx.QueryRowContext(ctx, `
		select exists(
			select 1 from conversations c
			join matches m on m.id = c.match_id
			where c.id = $1 and m.status = 'active' and (m.user_low_id = $2 or m.user_high_id = $2)
		)
	`, conversationID, userID).Scan(&ok)
	return ok, err
}

func logRecommendation(ctx context.Context, database *sql.DB, userID int64, petID int64, rank int, card Card) error {
	features, _ := json.Marshal(map[string]any{
		"score":       card.Score,
		"reasonCodes": card.ReasonCodes,
	})
	_, err := database.ExecContext(ctx, `
		insert into recommendation_logs (user_id, candidate_pet_id, rank_position, features_snapshot)
		values ($1, $2, $3, $4)
	`, userID, petID, rank, features)
	return err
}

func ownsPet(ctx context.Context, tx *sql.Tx, userID int64, petID int64) (bool, error) {
	var ok bool
	err := tx.QueryRowContext(ctx, `select exists(select 1 from pets where id = $1 and owner_user_id = $2)`, petID, userID).Scan(&ok)
	return ok, err
}

func targetOwner(ctx context.Context, tx *sql.Tx, petID int64) (int64, error) {
	var ownerID int64
	err := tx.QueryRowContext(ctx, `
		select p.owner_user_id
		from pets p
		join users u on u.id = p.owner_user_id
		where p.id = $1 and u.risk_state = 'normal' and u.privacy_level <> 'private'
	`, petID).Scan(&ownerID)
	return ownerID, err
}

func loadPet(ctx context.Context, database *sql.DB, petID int64) (profile.Pet, error) {
	rows, err := database.QueryContext(ctx, `
		select p.id, p.owner_user_id, p.name, coalesce(p.breed, ''), coalesce(p.birth_date::text, ''),
			coalesce(p.sex, ''), coalesce(p.avatar_url, ''), pp.size, pp.neutered, pp.vaccine_status,
			pp.personality_tags, pp.activity_preferences, pp.accepts_large_dogs, pp.energy_level, coalesce(pp.neighborhood, '')
		from pets p
		join pet_profiles pp on pp.pet_id = p.id
		where p.id = $1
	`, petID)
	if err != nil {
		return profile.Pet{}, err
	}
	defer rows.Close()
	if !rows.Next() {
		return profile.Pet{}, sql.ErrNoRows
	}
	var pet profile.Pet
	var personalityRaw, activityRaw []byte
	if err := rows.Scan(&pet.ID, &pet.OwnerUserID, &pet.Name, &pet.Breed, &pet.BirthDate, &pet.Sex, &pet.AvatarURL, &pet.Size, &pet.Neutered, &pet.VaccineStatus, &personalityRaw, &activityRaw, &pet.AcceptsLargeDogs, &pet.EnergyLevel, &pet.Neighborhood); err != nil {
		return profile.Pet{}, err
	}
	_ = json.Unmarshal(personalityRaw, &pet.PersonalityTags)
	_ = json.Unmarshal(activityRaw, &pet.ActivityPreferences)
	return pet, rows.Err()
}

func scanSwipe(row interface{ Scan(dest ...any) error }) (Swipe, error) {
	var item Swipe
	err := row.Scan(&item.ID, &item.UserID, &item.PetID, &item.TargetUserID, &item.TargetPetID, &item.Action, &item.IdempotencyKey, &item.CreatedAt)
	return item, err
}

func scanMessage(row interface{ Scan(dest ...any) error }) (Message, error) {
	var item Message
	err := row.Scan(&item.ID, &item.ConversationID, &item.SenderUserID, &item.Body, &item.Seq, &item.CreatedAt)
	return item, err
}

func normalizePair(userA int64, petA int64, userB int64, petB int64) (int64, int64, int64, int64) {
	if userA < userB {
		return userA, userB, petA, petB
	}
	return userB, userA, petB, petA
}

func overlapScore(left []string, right []string, boost []string) int {
	if len(left) == 0 || len(right) == 0 {
		return 50
	}
	set := map[string]bool{}
	for _, value := range left {
		set[value] = true
	}
	matches := 0
	boosted := 0
	for _, value := range right {
		if set[value] {
			matches++
		}
		if contains(boost, value) {
			boosted++
		}
	}
	score := int(math.Round(float64(matches)/float64(max(len(left), len(right)))*100)) + boosted*10
	if score < 35 {
		return 35
	}
	if score > 100 {
		return 100
	}
	return score
}

func sizeCompatibility(source profile.Pet, target profile.Pet) int {
	if source.Size == target.Size {
		return 100
	}
	if source.Size == "small" && target.Size == "large" && !source.AcceptsLargeDogs {
		return 35
	}
	if source.Size == "large" && target.Size == "small" && !target.AcceptsLargeDogs {
		return 45
	}
	return 76
}

func contains(items []string, value string) bool {
	for _, item := range items {
		if item == value {
			return true
		}
	}
	return false
}

func max(a int, b int) int {
	if a > b {
		return a
	}
	return b
}

func parseID(value string) (int64, bool) {
	id, err := strconv.ParseInt(value, 10, 64)
	return id, err == nil && id > 0
}
