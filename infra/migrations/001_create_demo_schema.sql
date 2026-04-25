create table if not exists users (
  id bigserial primary key,
  phone_hash text unique,
  nickname text not null,
  avatar_url text,
  city_code text,
  risk_state text not null default 'normal',
  created_at timestamptz not null default now()
);

create table if not exists pets (
  id bigserial primary key,
  name text not null,
  species text not null,
  breed text,
  sex text,
  birth_date date,
  avatar_url text,
  city_code text,
  visibility text not null default 'public',
  created_at timestamptz not null default now()
);

create table if not exists owner_pets (
  user_id bigint not null references users(id),
  pet_id bigint not null references pets(id),
  role text not null default 'owner',
  is_primary boolean not null default true,
  created_at timestamptz not null default now(),
  primary key (user_id, pet_id)
);

create table if not exists posts (
  id bigserial primary key,
  author_user_id bigint not null references users(id),
  post_type text not null default 'image_text',
  body text not null,
  city_code text,
  privacy_level text not null default 'public',
  moderation_status text not null default 'pending',
  created_at timestamptz not null default now()
);

create table if not exists post_pets (
  post_id bigint not null references posts(id),
  pet_id bigint not null references pets(id),
  primary key (post_id, pet_id)
);

create table if not exists health_records (
  id bigserial primary key,
  pet_id bigint not null references pets(id),
  record_type text not null,
  value_json jsonb not null default '{}'::jsonb,
  occurred_at timestamptz not null
);

create table if not exists service_providers (
  id bigserial primary key,
  name text not null,
  category text not null,
  city_code text,
  verify_status text not null default 'pending',
  created_at timestamptz not null default now()
);

create table if not exists leads (
  id bigserial primary key,
  listing_id bigint,
  user_id bigint references users(id),
  pet_id bigint references pets(id),
  status text not null default 'pending',
  created_at timestamptz not null default now()
);
