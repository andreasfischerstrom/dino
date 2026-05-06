-- Run this in your Supabase SQL editor

-- Characters table
create table if not exists characters (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null,
  name text not null,
  species text not null,
  stats jsonb not null default '{}',
  hp integer not null default 100,
  max_hp integer not null default 100,
  level integer not null default 1,
  xp integer not null default 0,
  bones integer not null default 100,
  image_url text,
  wins integer not null default 0,
  losses integer not null default 0,
  kills integer not null default 0,
  alive boolean not null default true,
  daring text not null default 'measured',
  surrender_at integer not null default 20,
  buffs jsonb not null default '[]',
  last_regen_at timestamptz not null default now(),
  created_at timestamptz not null default now()
);

-- Inventory table
create table if not exists inventory (
  id uuid primary key default gen_random_uuid(),
  character_id uuid references characters(id) on delete cascade not null,
  gear_id text not null,
  equipped boolean not null default false,
  created_at timestamptz not null default now(),
  unique(character_id, gear_id)
);

-- Challenges table
create table if not exists challenges (
  id uuid primary key default gen_random_uuid(),
  challenger_id uuid references characters(id) on delete cascade not null,
  challenged_id uuid references characters(id) on delete cascade not null,
  challenger_daring text not null default 'measured',
  challenger_surrender_at integer not null default 20,
  status text not null default 'pending', -- pending | completed | declined
  created_at timestamptz not null default now()
);

-- Battles table
create table if not exists battles (
  id uuid primary key default gen_random_uuid(),
  challenger_id uuid references characters(id) on delete set null,
  challenged_id uuid references characters(id) on delete set null,
  winner_id uuid references characters(id) on delete set null,
  events jsonb not null default '[]',
  challenger_survived boolean not null default true,
  challenged_survived boolean not null default true,
  created_at timestamptz not null default now()
);

-- Loot items (misc drops from mobs)
create table if not exists loot_items (
  id uuid primary key default gen_random_uuid(),
  character_id uuid references characters(id) on delete cascade not null,
  item_id text not null,
  created_at timestamptz not null default now()
);

-- RLS policies
alter table characters enable row level security;
alter table inventory enable row level security;
alter table challenges enable row level security;
alter table battles enable row level security;
alter table loot_items enable row level security;

-- Characters: users can read all, but only write their own
create policy "Characters are publicly readable" on characters for select using (true);
create policy "Users manage own character" on characters for all using (auth.uid() = user_id);

-- Inventory: character owner can manage, all can read
create policy "Inventory readable" on inventory for select using (true);
create policy "Inventory owner" on inventory for all using (
  exists (select 1 from characters where id = inventory.character_id and user_id = auth.uid())
);

-- Challenges: participants can read; only challenger can insert
create policy "Challenges readable" on challenges for select using (
  exists (select 1 from characters where id = challenges.challenger_id and user_id = auth.uid()) or
  exists (select 1 from characters where id = challenges.challenged_id and user_id = auth.uid())
);
create policy "Challenger can insert" on challenges for insert with check (
  exists (select 1 from characters where id = challenges.challenger_id and user_id = auth.uid())
);
create policy "Challenged can update" on challenges for update using (
  exists (select 1 from characters where id = challenges.challenged_id and user_id = auth.uid()) or
  exists (select 1 from characters where id = challenges.challenger_id and user_id = auth.uid())
);

-- Battles: all readable
create policy "Battles readable" on battles for select using (true);
create policy "Battles insertable by auth" on battles for insert with check (auth.role() = 'authenticated');

-- Loot: owner only
create policy "Loot owner" on loot_items for all using (
  exists (select 1 from characters where id = loot_items.character_id and user_id = auth.uid())
);

-- Storage bucket for character images (run separately in dashboard or here)
-- insert into storage.buckets (id, name, public) values ('character-images', 'character-images', true)
-- on conflict do nothing;
