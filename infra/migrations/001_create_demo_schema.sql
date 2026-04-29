create table if not exists users (
  id bigserial primary key,
  email_hash text unique,
  phone_hash text unique,
  nickname text not null,
  avatar_url text,
  neighborhood text,
  privacy_level text not null default 'neighborhood',
  risk_state text not null default 'normal',
  created_at timestamptz not null default now()
);

create table if not exists owner_profiles (
  user_id bigint primary key references users(id),
  available_windows jsonb not null default '[]'::jsonb,
  meetup_preferences jsonb not null default '[]'::jsonb,
  max_distance_km numeric(5, 2) not null default 5,
  safety_preferences jsonb not null default '[]'::jsonb,
  updated_at timestamptz not null default now()
);

create table if not exists pets (
  id bigserial primary key,
  owner_user_id bigint not null references users(id),
  name text not null,
  species text not null default 'dog',
  breed text,
  birth_date date,
  sex text,
  avatar_url text,
  created_at timestamptz not null default now(),
  constraint pets_name_length check (char_length(name) between 1 and 40),
  constraint pets_species_check check (species in ('dog')),
  constraint pets_sex_check check (sex is null or sex in ('female', 'male', 'unknown'))
);

create table if not exists pet_profiles (
  pet_id bigint primary key references pets(id),
  size text not null,
  neutered boolean,
  vaccine_status text not null default 'unknown',
  personality_tags jsonb not null default '[]'::jsonb,
  activity_preferences jsonb not null default '[]'::jsonb,
  accepts_large_dogs boolean not null default false,
  energy_level text not null default 'medium',
  neighborhood text,
  updated_at timestamptz not null default now(),
  constraint pet_profiles_size_check check (size in ('small', 'medium', 'large')),
  constraint pet_profiles_vaccine_check check (vaccine_status in ('verified', 'self_reported', 'unknown')),
  constraint pet_profiles_energy_check check (energy_level in ('low', 'medium', 'high'))
);

create table if not exists locations (
  id bigserial primary key,
  name text not null,
  type text not null,
  city text,
  neighborhood text,
  geohash text,
  is_public_place boolean not null default true,
  safety_notes text,
  created_at timestamptz not null default now()
);

create table if not exists swipes (
  id bigserial primary key,
  user_id bigint not null references users(id),
  pet_id bigint not null references pets(id),
  target_user_id bigint not null references users(id),
  target_pet_id bigint not null references pets(id),
  action text not null,
  idempotency_key text not null,
  created_at timestamptz not null default now(),
  constraint swipes_action_check check (action in ('like', 'pass')),
  unique (user_id, target_pet_id),
  unique (idempotency_key)
);

create table if not exists matches (
  id bigserial primary key,
  user_low_id bigint not null references users(id),
  user_high_id bigint not null references users(id),
  pet_low_id bigint not null references pets(id),
  pet_high_id bigint not null references pets(id),
  status text not null default 'active',
  created_at timestamptz not null default now(),
  constraint matches_status_check check (status in ('active', 'unmatched', 'blocked')),
  unique (user_low_id, user_high_id, pet_low_id, pet_high_id)
);

create table if not exists conversations (
  id bigserial primary key,
  match_id bigint not null references matches(id),
  status text not null default 'active',
  last_message_at timestamptz,
  created_at timestamptz not null default now()
);

create table if not exists messages (
  id bigserial primary key,
  conversation_id bigint not null references conversations(id),
  sender_user_id bigint not null references users(id),
  body text not null,
  seq bigint not null,
  created_at timestamptz not null default now(),
  unique (conversation_id, seq)
);

create table if not exists playdates (
  id bigserial primary key,
  creator_user_id bigint not null references users(id),
  location_id bigint not null references locations(id),
  start_at timestamptz not null,
  visibility text not null default 'private',
  vaccine_required boolean not null default true,
  status text not null default 'pending',
  note text,
  created_at timestamptz not null default now(),
  constraint playdates_status_check check (status in ('pending', 'confirmed', 'cancelled', 'completed'))
);

create table if not exists playdate_participants (
  playdate_id bigint not null references playdates(id),
  user_id bigint not null references users(id),
  pet_id bigint not null references pets(id),
  status text not null default 'invited',
  checked_in_at timestamptz,
  primary key (playdate_id, user_id, pet_id)
);

create table if not exists feedback (
  id bigserial primary key,
  playdate_id bigint not null references playdates(id),
  from_user_id bigint not null references users(id),
  to_user_id bigint references users(id),
  rating integer not null,
  repeat_intent text not null,
  safety_flag boolean not null default false,
  note text,
  created_at timestamptz not null default now(),
  constraint feedback_rating_check check (rating between 1 and 5)
);

create table if not exists reports (
  id bigserial primary key,
  reporter_user_id bigint references users(id),
  target_type text not null,
  target_id text not null,
  reason text not null,
  status text not null default 'open',
  created_at timestamptz not null default now()
);

create table if not exists blocks (
  blocker_user_id bigint not null references users(id),
  blocked_user_id bigint not null references users(id),
  reason text,
  created_at timestamptz not null default now(),
  primary key (blocker_user_id, blocked_user_id)
);

create table if not exists recommendation_logs (
  id bigserial primary key,
  user_id bigint not null references users(id),
  candidate_pet_id bigint not null references pets(id),
  rank_position integer,
  features_snapshot jsonb not null default '{}'::jsonb,
  shown_at timestamptz not null default now(),
  action text,
  matched boolean not null default false,
  chat_started boolean not null default false,
  playdate_created boolean not null default false,
  feedback_score integer
);
