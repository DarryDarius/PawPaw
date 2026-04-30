create table if not exists session_tokens (
  token_hash text primary key,
  user_id bigint not null references users(id) on delete cascade,
  expires_at timestamptz not null,
  created_at timestamptz not null default now()
);

create index if not exists session_tokens_user_id_idx on session_tokens(user_id);
create index if not exists session_tokens_expires_at_idx on session_tokens(expires_at);
