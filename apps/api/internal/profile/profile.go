package profile

import (
	"context"
	"database/sql"
	"encoding/json"
	"net/http"
	"strings"

	"pawpaw/apps/api/internal/auth"
	"pawpaw/apps/api/internal/httpx"
)

type Handler struct {
	DB *sql.DB
}

type MeResponse struct {
	User            UserProfile  `json:"user"`
	OwnerProfile    OwnerProfile `json:"ownerProfile"`
	Pets            []Pet        `json:"pets"`
	ProfileComplete bool         `json:"profileComplete"`
}

type UserProfile struct {
	ID           int64  `json:"id"`
	Nickname     string `json:"nickname"`
	AvatarURL    string `json:"avatarUrl,omitempty"`
	Neighborhood string `json:"neighborhood,omitempty"`
	PrivacyLevel string `json:"privacyLevel"`
	RiskState    string `json:"riskState"`
}

type OwnerProfile struct {
	AvailableWindows  []string `json:"availableWindows"`
	MeetupPreferences []string `json:"meetupPreferences"`
	MaxDistanceKm     float64  `json:"maxDistanceKm"`
	SafetyPreferences []string `json:"safetyPreferences"`
}

type Pet struct {
	ID                  int64    `json:"id"`
	OwnerUserID         int64    `json:"ownerUserId"`
	Name                string   `json:"name"`
	Breed               string   `json:"breed,omitempty"`
	BirthDate           string   `json:"birthDate,omitempty"`
	Sex                 string   `json:"sex,omitempty"`
	AvatarURL           string   `json:"avatarUrl,omitempty"`
	Size                string   `json:"size"`
	Neutered            *bool    `json:"neutered,omitempty"`
	VaccineStatus       string   `json:"vaccineStatus"`
	PersonalityTags     []string `json:"personalityTags"`
	ActivityPreferences []string `json:"activityPreferences"`
	AcceptsLargeDogs    bool     `json:"acceptsLargeDogs"`
	EnergyLevel         string   `json:"energyLevel"`
	Neighborhood        string   `json:"neighborhood,omitempty"`
}

type updateMeRequest struct {
	Nickname          *string  `json:"nickname"`
	AvatarURL         *string  `json:"avatarUrl"`
	Neighborhood      *string  `json:"neighborhood"`
	PrivacyLevel      *string  `json:"privacyLevel"`
	AvailableWindows  []string `json:"availableWindows"`
	MeetupPreferences []string `json:"meetupPreferences"`
	MaxDistanceKm     *float64 `json:"maxDistanceKm"`
	SafetyPreferences []string `json:"safetyPreferences"`
}

func (h Handler) Register(mux *http.ServeMux, prefix string) {
	mux.Handle(prefix+"/me", auth.Middleware(h.DB, http.HandlerFunc(h.handleMe)))
	mux.Handle(prefix+"/me/availability", auth.Middleware(h.DB, http.HandlerFunc(h.handleAvailability)))
}

func (h Handler) handleMe(w http.ResponseWriter, r *http.Request) {
	userID, _ := auth.UserID(r.Context())
	switch r.Method {
	case http.MethodGet:
		me, err := LoadMe(r.Context(), h.DB, userID)
		if err != nil {
			httpx.WriteError(w, http.StatusInternalServerError, "me_load_failed", "Could not load profile", nil)
			return
		}
		httpx.WriteJSON(w, http.StatusOK, me)
	case http.MethodPatch:
		var input updateMeRequest
		if err := json.NewDecoder(r.Body).Decode(&input); err != nil {
			httpx.WriteError(w, http.StatusBadRequest, "invalid_json", "Invalid JSON request body", nil)
			return
		}
		if err := updateMe(r.Context(), h.DB, userID, input); err != nil {
			httpx.WriteError(w, http.StatusBadRequest, "profile_update_failed", err.Error(), nil)
			return
		}
		me, err := LoadMe(r.Context(), h.DB, userID)
		if err != nil {
			httpx.WriteError(w, http.StatusInternalServerError, "me_load_failed", "Could not load profile", nil)
			return
		}
		httpx.WriteJSON(w, http.StatusOK, me)
	default:
		httpx.MethodNotAllowed(w)
	}
}

func (h Handler) handleAvailability(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPatch {
		httpx.MethodNotAllowed(w)
		return
	}
	userID, _ := auth.UserID(r.Context())
	var input struct {
		AvailableWindows []string `json:"availableWindows"`
	}
	if err := json.NewDecoder(r.Body).Decode(&input); err != nil {
		httpx.WriteError(w, http.StatusBadRequest, "invalid_json", "Invalid JSON request body", nil)
		return
	}
	payload, _ := json.Marshal(input.AvailableWindows)
	_, err := h.DB.ExecContext(r.Context(), `
		insert into owner_profiles (user_id, available_windows)
		values ($1, $2)
		on conflict (user_id) do update set
			available_windows = excluded.available_windows,
			updated_at = now()
	`, userID, payload)
	if err != nil {
		httpx.WriteError(w, http.StatusInternalServerError, "availability_update_failed", "Could not update availability", nil)
		return
	}
	me, err := LoadMe(r.Context(), h.DB, userID)
	if err != nil {
		httpx.WriteError(w, http.StatusInternalServerError, "me_load_failed", "Could not load profile", nil)
		return
	}
	httpx.WriteJSON(w, http.StatusOK, me)
}

func LoadMe(ctx context.Context, database *sql.DB, userID int64) (MeResponse, error) {
	row := database.QueryRowContext(ctx, `
		select id, nickname, coalesce(avatar_url, ''), coalesce(neighborhood, ''), privacy_level, risk_state
		from users
		where id = $1
	`, userID)
	var me MeResponse
	if err := row.Scan(&me.User.ID, &me.User.Nickname, &me.User.AvatarURL, &me.User.Neighborhood, &me.User.PrivacyLevel, &me.User.RiskState); err != nil {
		return MeResponse{}, err
	}
	owner, err := loadOwnerProfile(ctx, database, userID)
	if err != nil {
		return MeResponse{}, err
	}
	pets, err := LoadPets(ctx, database, userID)
	if err != nil {
		return MeResponse{}, err
	}
	me.OwnerProfile = owner
	me.Pets = pets
	me.ProfileComplete = profileComplete(me)
	return me, nil
}

func updateMe(ctx context.Context, database *sql.DB, userID int64, input updateMeRequest) error {
	nickname := optionalString(input.Nickname)
	avatarURL := optionalString(input.AvatarURL)
	neighborhood := optionalString(input.Neighborhood)
	privacyLevel := optionalString(input.PrivacyLevel)
	if privacyLevel != "" && privacyLevel != "neighborhood" && privacyLevel != "private" {
		return sql.ErrNoRows
	}
	_, err := database.ExecContext(ctx, `
		update users set
			nickname = coalesce(nullif($2, ''), nickname),
			avatar_url = coalesce(nullif($3, ''), avatar_url),
			neighborhood = coalesce(nullif($4, ''), neighborhood),
			privacy_level = coalesce(nullif($5, ''), privacy_level)
		where id = $1
	`, userID, nickname, avatarURL, neighborhood, privacyLevel)
	if err != nil {
		return err
	}

	maxDistance := 5.0
	if input.MaxDistanceKm != nil {
		maxDistance = *input.MaxDistanceKm
	}
	availableWindows, _ := json.Marshal(input.AvailableWindows)
	meetupPreferences, _ := json.Marshal(input.MeetupPreferences)
	safetyPreferences, _ := json.Marshal(input.SafetyPreferences)
	_, err = database.ExecContext(ctx, `
		insert into owner_profiles (user_id, available_windows, meetup_preferences, max_distance_km, safety_preferences)
		values ($1, $2, $3, $4, $5)
		on conflict (user_id) do update set
			available_windows = case when $6 then excluded.available_windows else owner_profiles.available_windows end,
			meetup_preferences = case when $7 then excluded.meetup_preferences else owner_profiles.meetup_preferences end,
			max_distance_km = case when $8 then excluded.max_distance_km else owner_profiles.max_distance_km end,
			safety_preferences = case when $9 then excluded.safety_preferences else owner_profiles.safety_preferences end,
			updated_at = now()
	`, userID, availableWindows, meetupPreferences, maxDistance, safetyPreferences,
		input.AvailableWindows != nil, input.MeetupPreferences != nil, input.MaxDistanceKm != nil, input.SafetyPreferences != nil)
	return err
}

func loadOwnerProfile(ctx context.Context, database *sql.DB, userID int64) (OwnerProfile, error) {
	var availableRaw, meetupRaw, safetyRaw []byte
	var owner OwnerProfile
	err := database.QueryRowContext(ctx, `
		select available_windows, meetup_preferences, max_distance_km::float8, safety_preferences
		from owner_profiles
		where user_id = $1
	`, userID).Scan(&availableRaw, &meetupRaw, &owner.MaxDistanceKm, &safetyRaw)
	if err == sql.ErrNoRows {
		return OwnerProfile{
			AvailableWindows:  []string{},
			MeetupPreferences: []string{},
			MaxDistanceKm:     5,
			SafetyPreferences: []string{},
		}, nil
	}
	if err != nil {
		return OwnerProfile{}, err
	}
	_ = json.Unmarshal(availableRaw, &owner.AvailableWindows)
	_ = json.Unmarshal(meetupRaw, &owner.MeetupPreferences)
	_ = json.Unmarshal(safetyRaw, &owner.SafetyPreferences)
	if owner.AvailableWindows == nil {
		owner.AvailableWindows = []string{}
	}
	if owner.MeetupPreferences == nil {
		owner.MeetupPreferences = []string{}
	}
	if owner.SafetyPreferences == nil {
		owner.SafetyPreferences = []string{}
	}
	return owner, nil
}

func LoadPets(ctx context.Context, database *sql.DB, userID int64) ([]Pet, error) {
	rows, err := database.QueryContext(ctx, `
		select p.id, p.owner_user_id, p.name, coalesce(p.breed, ''), coalesce(p.birth_date::text, ''),
			coalesce(p.sex, ''), coalesce(p.avatar_url, ''), pp.size, pp.neutered, pp.vaccine_status,
			pp.personality_tags, pp.activity_preferences, pp.accepts_large_dogs, pp.energy_level, coalesce(pp.neighborhood, '')
		from pets p
		join pet_profiles pp on pp.pet_id = p.id
		where p.owner_user_id = $1
		order by p.id
	`, userID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	pets := []Pet{}
	for rows.Next() {
		var pet Pet
		var personalityRaw, activityRaw []byte
		if err := rows.Scan(&pet.ID, &pet.OwnerUserID, &pet.Name, &pet.Breed, &pet.BirthDate, &pet.Sex, &pet.AvatarURL, &pet.Size, &pet.Neutered, &pet.VaccineStatus, &personalityRaw, &activityRaw, &pet.AcceptsLargeDogs, &pet.EnergyLevel, &pet.Neighborhood); err != nil {
			return nil, err
		}
		_ = json.Unmarshal(personalityRaw, &pet.PersonalityTags)
		_ = json.Unmarshal(activityRaw, &pet.ActivityPreferences)
		pets = append(pets, pet)
	}
	return pets, rows.Err()
}

func profileComplete(me MeResponse) bool {
	return strings.TrimSpace(me.User.Nickname) != "" &&
		strings.TrimSpace(me.User.Neighborhood) != "" &&
		len(me.OwnerProfile.AvailableWindows) > 0 &&
		me.OwnerProfile.MaxDistanceKm > 0 &&
		len(me.Pets) > 0
}

func optionalString(value *string) string {
	if value == nil {
		return ""
	}
	return strings.TrimSpace(*value)
}
