package playdate

import (
	"context"
	"database/sql"
	"encoding/json"
	"fmt"
	"net/http"
	"strconv"
	"strings"
	"time"

	"pawpaw/apps/api/internal/auth"
	"pawpaw/apps/api/internal/httpx"
	"pawpaw/apps/api/internal/profile"
)

type Handler struct {
	DB *sql.DB
}

type Location struct {
	ID            int64   `json:"id"`
	Name          string  `json:"name"`
	Type          string  `json:"type"`
	City          string  `json:"city,omitempty"`
	Neighborhood  string  `json:"neighborhood,omitempty"`
	IsPublicPlace bool    `json:"isPublicPlace"`
	SafetyNotes   string  `json:"safetyNotes,omitempty"`
	DistanceKm    float64 `json:"distanceKm,omitempty"`
}

type Participant struct {
	UserID      int64       `json:"userId"`
	PetID       int64       `json:"petId"`
	Status      string      `json:"status"`
	CheckedInAt string      `json:"checkedInAt,omitempty"`
	Pet         profile.Pet `json:"pet"`
}

type Playdate struct {
	ID              int64         `json:"id"`
	CreatorUserID   int64         `json:"creatorUserId"`
	Location        Location      `json:"location"`
	StartAt         string        `json:"startAt"`
	Visibility      string        `json:"visibility"`
	VaccineRequired bool          `json:"vaccineRequired"`
	Status          string        `json:"status"`
	Note            string        `json:"note,omitempty"`
	CreatedAt       string        `json:"createdAt"`
	Participants    []Participant `json:"participants"`
}

func (h Handler) Register(mux *http.ServeMux, prefix string) {
	mux.Handle(prefix+"/locations", auth.Middleware(h.DB, http.HandlerFunc(h.handleLocations)))
	mux.Handle(prefix+"/playdates", auth.Middleware(h.DB, http.HandlerFunc(h.handlePlaydates)))
	mux.Handle(prefix+"/playdates/", auth.Middleware(h.DB, http.HandlerFunc(h.handlePlaydateByID)))
}

func (h Handler) handleLocations(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodGet {
		httpx.MethodNotAllowed(w)
		return
	}
	rows, err := h.DB.QueryContext(r.Context(), `
		select id, name, type, coalesce(city, ''), coalesce(neighborhood, ''), is_public_place, coalesce(safety_notes, '')
		from locations
		where is_public_place = true
		order by neighborhood, name
	`)
	if err != nil {
		httpx.WriteError(w, http.StatusInternalServerError, "locations_load_failed", "Could not load locations", nil)
		return
	}
	defer rows.Close()
	locations := []Location{}
	for rows.Next() {
		var item Location
		if err := rows.Scan(&item.ID, &item.Name, &item.Type, &item.City, &item.Neighborhood, &item.IsPublicPlace, &item.SafetyNotes); err != nil {
			httpx.WriteError(w, http.StatusInternalServerError, "locations_load_failed", "Could not load locations", nil)
			return
		}
		locations = append(locations, item)
	}
	httpx.WriteJSON(w, http.StatusOK, map[string]any{"locations": locations})
}

func (h Handler) handlePlaydates(w http.ResponseWriter, r *http.Request) {
	userID, _ := auth.UserID(r.Context())
	switch r.Method {
	case http.MethodGet:
		items, err := loadPlaydates(r.Context(), h.DB, userID)
		if err != nil {
			httpx.WriteError(w, http.StatusInternalServerError, "playdates_load_failed", "Could not load playdates", nil)
			return
		}
		httpx.WriteJSON(w, http.StatusOK, map[string]any{"playdates": items})
	case http.MethodPost:
		var input struct {
			MatchID         int64  `json:"matchId"`
			LocationID      int64  `json:"locationId"`
			StartAt         string `json:"startAt"`
			Note            string `json:"note"`
			VaccineRequired bool   `json:"vaccineRequired"`
		}
		if err := json.NewDecoder(r.Body).Decode(&input); err != nil {
			httpx.WriteError(w, http.StatusBadRequest, "invalid_json", "Invalid JSON request body", nil)
			return
		}
		item, err := createPlaydate(r.Context(), h.DB, userID, input.MatchID, input.LocationID, input.StartAt, input.Note, input.VaccineRequired)
		if err != nil {
			httpx.WriteError(w, http.StatusBadRequest, "playdate_create_failed", err.Error(), nil)
			return
		}
		httpx.WriteJSON(w, http.StatusCreated, map[string]any{"playdate": item})
	default:
		httpx.MethodNotAllowed(w)
	}
}

func (h Handler) handlePlaydateByID(w http.ResponseWriter, r *http.Request) {
	userID, _ := auth.UserID(r.Context())
	suffix := strings.TrimPrefix(r.URL.Path, "/api/v1/playdates/")
	parts := strings.Split(strings.Trim(suffix, "/"), "/")
	if len(parts) == 0 {
		http.NotFound(w, r)
		return
	}
	playdateID, ok := parseID(parts[0])
	if !ok {
		httpx.WriteError(w, http.StatusBadRequest, "invalid_playdate_id", "Invalid playdate id", nil)
		return
	}
	action := ""
	if len(parts) > 1 {
		action = parts[1]
	}
	switch {
	case r.Method == http.MethodGet && action == "":
		item, err := loadPlaydate(r.Context(), h.DB, userID, playdateID)
		if err == sql.ErrNoRows {
			httpx.WriteError(w, http.StatusNotFound, "playdate_not_found", "Playdate not found", nil)
			return
		}
		if err != nil {
			httpx.WriteError(w, http.StatusInternalServerError, "playdate_load_failed", "Could not load playdate", nil)
			return
		}
		httpx.WriteJSON(w, http.StatusOK, map[string]any{"playdate": item})
	case r.Method == http.MethodPost && action == "respond":
		var input struct {
			Status string `json:"status"`
		}
		_ = json.NewDecoder(r.Body).Decode(&input)
		if err := respond(r.Context(), h.DB, userID, playdateID, input.Status); err != nil {
			httpx.WriteError(w, http.StatusBadRequest, "playdate_respond_failed", err.Error(), nil)
			return
		}
		item, _ := loadPlaydate(r.Context(), h.DB, userID, playdateID)
		httpx.WriteJSON(w, http.StatusOK, map[string]any{"playdate": item})
	case r.Method == http.MethodPost && action == "cancel":
		if err := setPlaydateStatus(r.Context(), h.DB, userID, playdateID, "cancelled"); err != nil {
			httpx.WriteError(w, http.StatusBadRequest, "playdate_cancel_failed", err.Error(), nil)
			return
		}
		httpx.WriteJSON(w, http.StatusOK, map[string]string{"status": "cancelled"})
	case r.Method == http.MethodPost && action == "check-in":
		if err := checkIn(r.Context(), h.DB, userID, playdateID); err != nil {
			httpx.WriteError(w, http.StatusBadRequest, "playdate_check_in_failed", err.Error(), nil)
			return
		}
		item, _ := loadPlaydate(r.Context(), h.DB, userID, playdateID)
		httpx.WriteJSON(w, http.StatusOK, map[string]any{"playdate": item})
	case r.Method == http.MethodPost && action == "feedback":
		var input struct {
			ToUserID     int64  `json:"toUserId"`
			Rating       int    `json:"rating"`
			RepeatIntent string `json:"repeatIntent"`
			SafetyFlag   bool   `json:"safetyFlag"`
			Note         string `json:"note"`
		}
		if err := json.NewDecoder(r.Body).Decode(&input); err != nil {
			httpx.WriteError(w, http.StatusBadRequest, "invalid_json", "Invalid JSON request body", nil)
			return
		}
		if err := submitFeedback(r.Context(), h.DB, userID, playdateID, input.ToUserID, input.Rating, input.RepeatIntent, input.SafetyFlag, input.Note); err != nil {
			httpx.WriteError(w, http.StatusBadRequest, "feedback_failed", err.Error(), nil)
			return
		}
		httpx.WriteJSON(w, http.StatusCreated, map[string]string{"status": "feedback_saved"})
	default:
		httpx.MethodNotAllowed(w)
	}
}

func createPlaydate(ctx context.Context, database *sql.DB, userID int64, matchID int64, locationID int64, startAt string, note string, vaccineRequired bool) (Playdate, error) {
	start, err := parseStart(startAt)
	if err != nil {
		return Playdate{}, fmt.Errorf("valid startAt is required")
	}
	tx, err := database.BeginTx(ctx, nil)
	if err != nil {
		return Playdate{}, err
	}
	defer tx.Rollback()
	var userLow, userHigh, petLow, petHigh int64
	err = tx.QueryRowContext(ctx, `
		select user_low_id, user_high_id, pet_low_id, pet_high_id
		from matches
		where id = $1 and status = 'active' and (user_low_id = $2 or user_high_id = $2)
	`, matchID, userID).Scan(&userLow, &userHigh, &petLow, &petHigh)
	if err != nil {
		return Playdate{}, fmt.Errorf("active match is required")
	}
	var public bool
	if err := tx.QueryRowContext(ctx, `select is_public_place from locations where id = $1`, locationID).Scan(&public); err != nil || !public {
		return Playdate{}, fmt.Errorf("public location is required")
	}
	var playdateID int64
	err = tx.QueryRowContext(ctx, `
		insert into playdates (creator_user_id, location_id, start_at, visibility, vaccine_required, status, note)
		values ($1, $2, $3, 'private', $4, 'pending', nullif($5, ''))
		returning id
	`, userID, locationID, start, vaccineRequired, strings.TrimSpace(note)).Scan(&playdateID)
	if err != nil {
		return Playdate{}, err
	}
	participants := []struct {
		userID int64
		petID  int64
	}{{userLow, petLow}, {userHigh, petHigh}}
	for _, participant := range participants {
		status := "invited"
		if participant.userID == userID {
			status = "confirmed"
		}
		if _, err := tx.ExecContext(ctx, `
			insert into playdate_participants (playdate_id, user_id, pet_id, status)
			values ($1, $2, $3, $4)
		`, playdateID, participant.userID, participant.petID, status); err != nil {
			return Playdate{}, err
		}
	}
	_, _ = tx.ExecContext(ctx, `
		update recommendation_logs set playdate_created = true
		where (user_id = $1 and candidate_pet_id in ($2, $3)) or (user_id = $4 and candidate_pet_id in ($2, $3))
	`, userLow, petLow, petHigh, userHigh)
	if err := tx.Commit(); err != nil {
		return Playdate{}, err
	}
	return loadPlaydate(ctx, database, userID, playdateID)
}

func loadPlaydates(ctx context.Context, database *sql.DB, userID int64) ([]Playdate, error) {
	rows, err := database.QueryContext(ctx, `
		select distinct p.id
		from playdates p
		join playdate_participants pp on pp.playdate_id = p.id
		where pp.user_id = $1
		order by p.id desc
	`, userID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()
	items := []Playdate{}
	for rows.Next() {
		var id int64
		if err := rows.Scan(&id); err != nil {
			return nil, err
		}
		item, err := loadPlaydate(ctx, database, userID, id)
		if err != nil {
			return nil, err
		}
		items = append(items, item)
	}
	return items, rows.Err()
}

func loadPlaydate(ctx context.Context, database *sql.DB, userID int64, id int64) (Playdate, error) {
	var item Playdate
	err := database.QueryRowContext(ctx, `
		select p.id, p.creator_user_id, l.id, l.name, l.type, coalesce(l.city, ''), coalesce(l.neighborhood, ''), l.is_public_place, coalesce(l.safety_notes, ''),
			p.start_at::text, p.visibility, p.vaccine_required, p.status, coalesce(p.note, ''), p.created_at::text
		from playdates p
		join locations l on l.id = p.location_id
		where p.id = $1 and exists(select 1 from playdate_participants pp where pp.playdate_id = p.id and pp.user_id = $2)
	`, id, userID).Scan(&item.ID, &item.CreatorUserID, &item.Location.ID, &item.Location.Name, &item.Location.Type, &item.Location.City, &item.Location.Neighborhood, &item.Location.IsPublicPlace, &item.Location.SafetyNotes, &item.StartAt, &item.Visibility, &item.VaccineRequired, &item.Status, &item.Note, &item.CreatedAt)
	if err != nil {
		return Playdate{}, err
	}
	participants, err := loadParticipants(ctx, database, id)
	if err != nil {
		return Playdate{}, err
	}
	item.Participants = participants
	return item, nil
}

func loadParticipants(ctx context.Context, database *sql.DB, playdateID int64) ([]Participant, error) {
	rows, err := database.QueryContext(ctx, `
		select pp.user_id, pp.pet_id, pp.status, coalesce(pp.checked_in_at::text, ''),
			p.id, p.owner_user_id, p.name, coalesce(p.breed, ''), coalesce(p.birth_date::text, ''),
			coalesce(p.sex, ''), coalesce(p.avatar_url, ''), prof.size, prof.neutered, prof.vaccine_status,
			prof.personality_tags, prof.activity_preferences, prof.accepts_large_dogs, prof.energy_level, coalesce(prof.neighborhood, '')
		from playdate_participants pp
		join pets p on p.id = pp.pet_id
		join pet_profiles prof on prof.pet_id = p.id
		where pp.playdate_id = $1
		order by pp.user_id
	`, playdateID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()
	items := []Participant{}
	for rows.Next() {
		var item Participant
		var personalityRaw, activityRaw []byte
		if err := rows.Scan(&item.UserID, &item.PetID, &item.Status, &item.CheckedInAt, &item.Pet.ID, &item.Pet.OwnerUserID, &item.Pet.Name, &item.Pet.Breed, &item.Pet.BirthDate, &item.Pet.Sex, &item.Pet.AvatarURL, &item.Pet.Size, &item.Pet.Neutered, &item.Pet.VaccineStatus, &personalityRaw, &activityRaw, &item.Pet.AcceptsLargeDogs, &item.Pet.EnergyLevel, &item.Pet.Neighborhood); err != nil {
			return nil, err
		}
		_ = json.Unmarshal(personalityRaw, &item.Pet.PersonalityTags)
		_ = json.Unmarshal(activityRaw, &item.Pet.ActivityPreferences)
		items = append(items, item)
	}
	return items, rows.Err()
}

func respond(ctx context.Context, database *sql.DB, userID int64, playdateID int64, status string) error {
	status = strings.ToLower(strings.TrimSpace(status))
	if status != "confirmed" && status != "declined" {
		return fmt.Errorf("status must be confirmed or declined")
	}
	result, err := database.ExecContext(ctx, `
		update playdate_participants set status = $1
		where playdate_id = $2 and user_id = $3
	`, status, playdateID, userID)
	if err != nil {
		return err
	}
	affected, _ := result.RowsAffected()
	if affected == 0 {
		return fmt.Errorf("playdate not found")
	}
	if status == "declined" {
		_, _ = database.ExecContext(ctx, `update playdates set status = 'cancelled' where id = $1`, playdateID)
		return nil
	}
	_, _ = database.ExecContext(ctx, `
		update playdates set status = 'confirmed'
		where id = $1 and not exists(select 1 from playdate_participants where playdate_id = $1 and status <> 'confirmed')
	`, playdateID)
	return nil
}

func checkIn(ctx context.Context, database *sql.DB, userID int64, playdateID int64) error {
	result, err := database.ExecContext(ctx, `
		update playdate_participants set checked_in_at = now()
		where playdate_id = $1 and user_id = $2
	`, playdateID, userID)
	if err != nil {
		return err
	}
	affected, _ := result.RowsAffected()
	if affected == 0 {
		return fmt.Errorf("playdate not found")
	}
	_, _ = database.ExecContext(ctx, `
		update playdates set status = 'completed'
		where id = $1 and not exists(select 1 from playdate_participants where playdate_id = $1 and checked_in_at is null)
	`, playdateID)
	return nil
}

func setPlaydateStatus(ctx context.Context, database *sql.DB, userID int64, playdateID int64, status string) error {
	result, err := database.ExecContext(ctx, `
		update playdates set status = $1
		where id = $2 and exists(select 1 from playdate_participants where playdate_id = $2 and user_id = $3)
	`, status, playdateID, userID)
	if err != nil {
		return err
	}
	affected, _ := result.RowsAffected()
	if affected == 0 {
		return fmt.Errorf("playdate not found")
	}
	return nil
}

func submitFeedback(ctx context.Context, database *sql.DB, userID int64, playdateID int64, toUserID int64, rating int, repeatIntent string, safetyFlag bool, note string) error {
	if rating < 1 || rating > 5 {
		return fmt.Errorf("rating must be between 1 and 5")
	}
	repeatIntent = strings.ToLower(strings.TrimSpace(repeatIntent))
	if repeatIntent == "" {
		repeatIntent = "maybe"
	}
	var participant bool
	if err := database.QueryRowContext(ctx, `select exists(select 1 from playdate_participants where playdate_id = $1 and user_id = $2)`, playdateID, userID).Scan(&participant); err != nil || !participant {
		return fmt.Errorf("playdate not found")
	}
	_, err := database.ExecContext(ctx, `
		insert into feedback (playdate_id, from_user_id, to_user_id, rating, repeat_intent, safety_flag, note)
		values ($1, $2, nullif($3, 0), $4, $5, $6, nullif($7, ''))
	`, playdateID, userID, toUserID, rating, repeatIntent, safetyFlag, strings.TrimSpace(note))
	if err != nil {
		return err
	}
	_, _ = database.ExecContext(ctx, `
		update recommendation_logs set feedback_score = $1
		where user_id = $2 and playdate_created = true
	`, rating, userID)
	return nil
}

func parseStart(value string) (time.Time, error) {
	if parsed, err := time.Parse(time.RFC3339, value); err == nil {
		return parsed, nil
	}
	return time.Parse("2006-01-02T15:04", value)
}

func parseID(value string) (int64, bool) {
	id, err := strconv.ParseInt(value, 10, 64)
	return id, err == nil && id > 0
}
