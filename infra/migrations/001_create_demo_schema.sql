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
  status text not null default 'active',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint pets_name_length check (char_length(name) between 1 and 20),
  constraint pets_species_check check (species in ('cat', 'dog', 'other')),
  constraint pets_sex_check check (sex is null or sex in ('female', 'male', 'unknown')),
  constraint pets_visibility_check check (visibility in ('public', 'city_only', 'private')),
  constraint pets_status_check check (status in ('active', 'archived'))
);

create table if not exists owner_pets (
  user_id bigint not null references users(id),
  pet_id bigint not null references pets(id),
  role text not null default 'owner',
  status text not null default 'active',
  is_primary boolean not null default false,
  invited_by_user_id bigint references users(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint owner_pets_role_check check (role in ('owner', 'family', 'viewer')),
  constraint owner_pets_status_check check (status in ('active', 'pending', 'removed')),
  primary key (user_id, pet_id)
);

create unique index if not exists owner_pets_one_primary_per_user
  on owner_pets (user_id)
  where is_primary and status = 'active';

create table if not exists posts (
  id bigserial primary key,
  author_user_id bigint not null references users(id),
  post_type text not null default 'image_text',
  body text not null,
  topic text not null,
  city_code text,
  visibility text not null default 'public',
  moderation_status text not null default 'pending',
  like_count integer not null default 0,
  comment_count integer not null default 0,
  collect_count integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint posts_type_check check (post_type in ('image_text')),
  constraint posts_visibility_check check (visibility in ('public', 'city_only', 'private')),
  constraint posts_moderation_check check (moderation_status in ('pending', 'approved', 'rejected', 'hidden')),
  constraint posts_body_length check (char_length(body) between 1 and 1000)
);

create table if not exists post_pets (
  post_id bigint not null references posts(id),
  pet_id bigint not null references pets(id),
  primary key (post_id, pet_id)
);

create table if not exists post_media (
  id bigserial primary key,
  post_id bigint not null references posts(id),
  media_type text not null default 'image',
  url text not null,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  constraint post_media_type_check check (media_type in ('image'))
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
