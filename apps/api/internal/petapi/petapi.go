package petapi

import (
	"context"
	"database/sql"
	"encoding/json"
	"net/http"
	"strings"

	"pawpaw/apps/api/internal/auth"
	"pawpaw/apps/api/internal/httpx"
	"pawpaw/apps/api/internal/profile"
)

type Handler struct {
	DB *sql.DB
}

type petRequest struct {
	Name                string   `json:"name"`
	Breed               string   `json:"breed"`
	BirthDate           string   `json:"birthDate"`
	Sex                 string   `json:"sex"`
	AvatarURL           string   `json:"avatarUrl"`
	Size                string   `json:"size"`
	Neutered            *bool    `json:"neutered"`
	VaccineStatus       string   `json:"vaccineStatus"`
	PersonalityTags     []string `json:"personalityTags"`
	ActivityPreferences []string `json:"activityPreferences"`
	AcceptsLargeDogs    *bool    `json:"acceptsLargeDogs"`
	EnergyLevel         string   `json:"energyLevel"`
	Neighborhood        string   `json:"neighborhood"`
}

type execer interface {
	ExecContext(ctx context.Context, query string, args ...any) (sql.Result, error)
}

func (h Handler) Register(mux *http.ServeMux, prefix string) {
	mux.Handle(prefix+"/me/pets", auth.Middleware(h.DB, http.HandlerFunc(h.handleMyPets)))
	mux.Handle(prefix+"/pets/", auth.Middleware(h.DB, http.HandlerFunc(h.handlePetByID)))
	mux.Handle(prefix+"/pets", auth.Middleware(h.DB, http.HandlerFunc(h.handlePets)))
}

func (h Handler) handleMyPets(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodGet {
		httpx.MethodNotAllowed(w)
		return
	}
	userID, _ := auth.UserID(r.Context())
	pets, err := profile.LoadPets(r.Context(), h.DB, userID)
	if err != nil {
		httpx.WriteError(w, http.StatusInternalServerError, "pets_load_failed", "Could not load pets", nil)
		return
	}
	httpx.WriteJSON(w, http.StatusOK, map[string]any{"pets": pets})
}

func (h Handler) handlePets(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPost {
		httpx.MethodNotAllowed(w)
		return
	}
	userID, _ := auth.UserID(r.Context())
	var input petRequest
	if err := json.NewDecoder(r.Body).Decode(&input); err != nil {
		httpx.WriteError(w, http.StatusBadRequest, "invalid_json", "Invalid JSON request body", nil)
		return
	}
	if err := validatePet(input); err != nil {
		httpx.WriteError(w, http.StatusBadRequest, "invalid_pet", err.Error(), nil)
		return
	}
	pet, err := createPet(r.Context(), h.DB, userID, input)
	if err != nil {
		httpx.WriteError(w, http.StatusInternalServerError, "pet_create_failed", "Could not create pet", nil)
		return
	}
	httpx.WriteJSON(w, http.StatusCreated, map[string]any{"pet": pet})
}

func (h Handler) handlePetByID(w http.ResponseWriter, r *http.Request) {
	userID, _ := auth.UserID(r.Context())
	suffix := strings.TrimPrefix(r.URL.Path, "/api/v1/pets/")
	if strings.HasSuffix(suffix, "/profile") {
		idText := strings.TrimSuffix(suffix, "/profile")
		petID, ok := auth.ParseID(strings.Trim(idText, "/"))
		if !ok {
			httpx.WriteError(w, http.StatusBadRequest, "invalid_pet_id", "Invalid pet id", nil)
			return
		}
		h.handlePetProfile(w, r, userID, petID)
		return
	}

	petID, ok := auth.ParseID(strings.Trim(suffix, "/"))
	if !ok {
		httpx.WriteError(w, http.StatusBadRequest, "invalid_pet_id", "Invalid pet id", nil)
		return
	}
	switch r.Method {
	case http.MethodGet:
		pet, err := loadPet(r.Context(), h.DB, petID)
		if err == sql.ErrNoRows {
			httpx.WriteError(w, http.StatusNotFound, "pet_not_found", "Pet not found", nil)
			return
		}
		if err != nil {
			httpx.WriteError(w, http.StatusInternalServerError, "pet_load_failed", "Could not load pet", nil)
			return
		}
		httpx.WriteJSON(w, http.StatusOK, map[string]any{"pet": pet})
	case http.MethodPatch:
		if ok, err := ownsPet(r.Context(), h.DB, userID, petID); err != nil || !ok {
			httpx.WriteError(w, http.StatusNotFound, "pet_not_found", "Pet not found", nil)
			return
		}
		var input petRequest
		if err := json.NewDecoder(r.Body).Decode(&input); err != nil {
			httpx.WriteError(w, http.StatusBadRequest, "invalid_json", "Invalid JSON request body", nil)
			return
		}
		if err := updatePet(r.Context(), h.DB, userID, petID, input); err != nil {
			httpx.WriteError(w, http.StatusBadRequest, "pet_update_failed", err.Error(), nil)
			return
		}
		pet, err := loadPet(r.Context(), h.DB, petID)
		if err != nil {
			httpx.WriteError(w, http.StatusInternalServerError, "pet_load_failed", "Could not load pet", nil)
			return
		}
		httpx.WriteJSON(w, http.StatusOK, map[string]any{"pet": pet})
	default:
		httpx.MethodNotAllowed(w)
	}
}

func (h Handler) handlePetProfile(w http.ResponseWriter, r *http.Request, userID int64, petID int64) {
	if r.Method != http.MethodPatch {
		httpx.MethodNotAllowed(w)
		return
	}
	if ok, err := ownsPet(r.Context(), h.DB, userID, petID); err != nil || !ok {
		httpx.WriteError(w, http.StatusNotFound, "pet_not_found", "Pet not found", nil)
		return
	}
	var input petRequest
	if err := json.NewDecoder(r.Body).Decode(&input); err != nil {
		httpx.WriteError(w, http.StatusBadRequest, "invalid_json", "Invalid JSON request body", nil)
		return
	}
	if err := updatePetProfile(r.Context(), h.DB, petID, input); err != nil {
		httpx.WriteError(w, http.StatusBadRequest, "pet_profile_update_failed", err.Error(), nil)
		return
	}
	pet, err := loadPet(r.Context(), h.DB, petID)
	if err != nil {
		httpx.WriteError(w, http.StatusInternalServerError, "pet_load_failed", "Could not load pet", nil)
		return
	}
	httpx.WriteJSON(w, http.StatusOK, map[string]any{"pet": pet})
}

func createPet(ctx context.Context, database *sql.DB, userID int64, input petRequest) (profile.Pet, error) {
	tx, err := database.BeginTx(ctx, nil)
	if err != nil {
		return profile.Pet{}, err
	}
	defer tx.Rollback()

	var petID int64
	err = tx.QueryRowContext(ctx, `
		insert into pets (owner_user_id, name, breed, birth_date, sex, avatar_url)
		values ($1, $2, nullif($3, ''), nullif($4, '')::date, nullif($5, ''), nullif($6, ''))
		returning id
	`, userID, strings.TrimSpace(input.Name), strings.TrimSpace(input.Breed), strings.TrimSpace(input.BirthDate), normalizeSex(input.Sex), strings.TrimSpace(input.AvatarURL)).Scan(&petID)
	if err != nil {
		return profile.Pet{}, err
	}
	if err := insertPetProfile(ctx, tx, petID, input); err != nil {
		return profile.Pet{}, err
	}
	if err := tx.Commit(); err != nil {
		return profile.Pet{}, err
	}
	return loadPet(ctx, database, petID)
}

func updatePet(ctx context.Context, database *sql.DB, userID int64, petID int64, input petRequest) error {
	_, err := database.ExecContext(ctx, `
		update pets set
			name = coalesce(nullif($3, ''), name),
			breed = coalesce(nullif($4, ''), breed),
			birth_date = coalesce(nullif($5, '')::date, birth_date),
			sex = coalesce(nullif($6, ''), sex),
			avatar_url = coalesce(nullif($7, ''), avatar_url)
		where id = $1 and owner_user_id = $2
	`, petID, userID, strings.TrimSpace(input.Name), strings.TrimSpace(input.Breed), strings.TrimSpace(input.BirthDate), normalizeSex(input.Sex), strings.TrimSpace(input.AvatarURL))
	if err != nil {
		return err
	}
	if hasProfileFields(input) {
		return updatePetProfile(ctx, database, petID, input)
	}
	return nil
}

func updatePetProfile(ctx context.Context, database execer, petID int64, input petRequest) error {
	if err := validateProfilePatch(input); err != nil {
		return err
	}
	personalityTags, _ := json.Marshal(input.PersonalityTags)
	activityPreferences, _ := json.Marshal(input.ActivityPreferences)
	_, err := database.ExecContext(ctx, `
		insert into pet_profiles (pet_id, size, neutered, vaccine_status, personality_tags, activity_preferences, accepts_large_dogs, energy_level, neighborhood)
		values ($1, $2, $3, $4, $5, $6, $7, $8, nullif($9, ''))
		on conflict (pet_id) do update set
			size = coalesce(nullif($2, ''), pet_profiles.size),
			neutered = coalesce($3, pet_profiles.neutered),
			vaccine_status = coalesce(nullif($4, ''), pet_profiles.vaccine_status),
			personality_tags = case when $10 then excluded.personality_tags else pet_profiles.personality_tags end,
			activity_preferences = case when $11 then excluded.activity_preferences else pet_profiles.activity_preferences end,
			accepts_large_dogs = coalesce($7, pet_profiles.accepts_large_dogs),
			energy_level = coalesce(nullif($8, ''), pet_profiles.energy_level),
			neighborhood = coalesce(nullif($9, ''), pet_profiles.neighborhood),
			updated_at = now()
	`, petID, normalizeSizeDefault(input.Size), input.Neutered, normalizeVaccineDefault(input.VaccineStatus), personalityTags, activityPreferences,
		input.AcceptsLargeDogs, normalizeEnergy(input.EnergyLevel), strings.TrimSpace(input.Neighborhood),
		input.PersonalityTags != nil, input.ActivityPreferences != nil)
	return err
}

func insertPetProfile(ctx context.Context, tx *sql.Tx, petID int64, input petRequest) error {
	personalityTags, _ := json.Marshal(input.PersonalityTags)
	activityPreferences, _ := json.Marshal(input.ActivityPreferences)
	_, err := tx.ExecContext(ctx, `
		insert into pet_profiles (pet_id, size, neutered, vaccine_status, personality_tags, activity_preferences, accepts_large_dogs, energy_level, neighborhood)
		values ($1, $2, $3, $4, $5, $6, $7, $8, nullif($9, ''))
	`, petID, normalizeSizeDefault(input.Size), input.Neutered, normalizeVaccineDefault(input.VaccineStatus), personalityTags, activityPreferences,
		boolValue(input.AcceptsLargeDogs), normalizeEnergyDefault(input.EnergyLevel), strings.TrimSpace(input.Neighborhood))
	return err
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

func ownsPet(ctx context.Context, database *sql.DB, userID int64, petID int64) (bool, error) {
	var exists bool
	err := database.QueryRowContext(ctx, `select exists(select 1 from pets where id = $1 and owner_user_id = $2)`, petID, userID).Scan(&exists)
	return exists, err
}

func validatePet(input petRequest) error {
	if strings.TrimSpace(input.Name) == "" {
		return errText("pet name is required")
	}
	return validateProfilePatch(input)
}

func hasProfileFields(input petRequest) bool {
	return strings.TrimSpace(input.Size) != "" ||
		input.Neutered != nil ||
		strings.TrimSpace(input.VaccineStatus) != "" ||
		input.PersonalityTags != nil ||
		input.ActivityPreferences != nil ||
		input.AcceptsLargeDogs != nil ||
		strings.TrimSpace(input.EnergyLevel) != "" ||
		strings.TrimSpace(input.Neighborhood) != ""
}

func validateProfilePatch(input petRequest) error {
	if normalizeSize(input.Size) == "" && strings.TrimSpace(input.Size) != "" {
		return errText("size must be small, medium, or large")
	}
	if normalizeVaccine(input.VaccineStatus) == "" && strings.TrimSpace(input.VaccineStatus) != "" {
		return errText("vaccineStatus must be verified, self_reported, or unknown")
	}
	if normalizeEnergy(input.EnergyLevel) == "" && strings.TrimSpace(input.EnergyLevel) != "" {
		return errText("energyLevel must be low, medium, or high")
	}
	return nil
}

type errText string

func (e errText) Error() string { return string(e) }

func normalizeSize(value string) string {
	value = strings.ToLower(strings.TrimSpace(value))
	if value == "small" || value == "medium" || value == "large" {
		return value
	}
	return ""
}

func normalizeSizeDefault(value string) string {
	if normalized := normalizeSize(value); normalized != "" {
		return normalized
	}
	return "medium"
}

func normalizeVaccine(value string) string {
	value = strings.ToLower(strings.TrimSpace(value))
	if value == "verified" || value == "self_reported" || value == "unknown" {
		return value
	}
	return ""
}

func normalizeVaccineDefault(value string) string {
	if normalized := normalizeVaccine(value); normalized != "" {
		return normalized
	}
	return "unknown"
}

func normalizeEnergy(value string) string {
	value = strings.ToLower(strings.TrimSpace(value))
	if value == "low" || value == "medium" || value == "high" {
		return value
	}
	return ""
}

func normalizeEnergyDefault(value string) string {
	if normalized := normalizeEnergy(value); normalized != "" {
		return normalized
	}
	return "medium"
}

func normalizeSex(value string) string {
	value = strings.ToLower(strings.TrimSpace(value))
	if value == "female" || value == "male" || value == "unknown" {
		return value
	}
	return ""
}

func boolValue(value *bool) bool {
	return value != nil && *value
}
