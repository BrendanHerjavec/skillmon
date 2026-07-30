-- VIVARIA schema (SPEC §8). Demo Mode uses localStorage with the same shape;
-- this schema is ready for magic-link auth + real persistence in Phase 5+.

create table if not exists users (
  id uuid primary key default gen_random_uuid(),
  handle text unique,
  created_at timestamptz not null default now()
);

create table if not exists skills (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references users(id) on delete cascade,
  name text not null,
  type text not null check (type in ('logic', 'craft', 'influence')),
  created_at timestamptz not null default now()
);

create table if not exists creatures (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references users(id) on delete cascade,
  skill_id uuid not null references skills(id) on delete cascade,
  name text not null,
  type text not null check (type in ('logic', 'craft', 'influence')),
  stage int not null default 0 check (stage between 0 and 2),
  level int not null default 1 check (level >= 1),
  xp int not null default 0 check (xp >= 0),
  sprite_urls jsonb,
  lore text,
  created_at timestamptz not null default now()
);

create table if not exists battles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references users(id) on delete cascade,
  creature_id uuid not null references creatures(id) on delete cascade,
  opponent text not null,
  arena int,
  result text not null check (result in ('victory', 'defeat')),
  max_streak int not null default 0,
  hearts_left int not null default 0,
  xp_earned int not null default 0,
  created_at timestamptz not null default now()
);

-- Audit trail: powers verification and anti-cheat later.
create table if not exists battle_events (
  id uuid primary key default gen_random_uuid(),
  battle_id uuid not null references battles(id) on delete cascade,
  question jsonb not null,
  answered int,
  correct boolean not null,
  ms int not null default 0
);

create table if not exists missed_questions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references users(id) on delete cascade,
  skill_id uuid references skills(id) on delete cascade,
  question jsonb not null,
  times_missed int not null default 1,
  last_seen timestamptz not null default now()
);

create table if not exists badges (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references users(id) on delete cascade,
  arena int not null,
  earned_at timestamptz not null default now(),
  unique (user_id, arena)
);

-- xp_events.source supports real-world verification later
-- (github_pr, figma, analytics, battle, …) — SPEC §12.
create table if not exists xp_events (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references users(id) on delete cascade,
  creature_id uuid not null references creatures(id) on delete cascade,
  amount int not null,
  source text not null default 'battle',
  created_at timestamptz not null default now()
);

-- RLS: users read/write only their own rows.
alter table users enable row level security;
alter table skills enable row level security;
alter table creatures enable row level security;
alter table battles enable row level security;
alter table battle_events enable row level security;
alter table missed_questions enable row level security;
alter table badges enable row level security;
alter table xp_events enable row level security;

create policy "own user" on users for all using (auth.uid() = id);
create policy "own skills" on skills for all using (auth.uid() = user_id);
create policy "own creatures" on creatures for all using (auth.uid() = user_id);
create policy "own battles" on battles for all using (auth.uid() = user_id);
create policy "own battle_events" on battle_events for all
  using (exists (select 1 from battles b where b.id = battle_id and b.user_id = auth.uid()));
create policy "own missed_questions" on missed_questions for all using (auth.uid() = user_id);
create policy "own badges" on badges for all using (auth.uid() = user_id);
create policy "own xp_events" on xp_events for all using (auth.uid() = user_id);
