# Setup Supabase per sincronizzazione cross-device

## SQL da incollare in Supabase → SQL Editor → Run

```sql
-- Intenzioni di preghiera
create table intentions (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users not null,
  text text not null check (char_length(text) <= 500),
  done boolean default false,
  created_at timestamptz default now()
);
alter table intentions enable row level security;
create policy "own" on intentions using (auth.uid()=user_id) with check (auth.uid()=user_id);

-- Appunti personali
create table notes (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users not null,
  title text,
  content text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);
alter table notes enable row level security;
create policy "own" on notes using (auth.uid()=user_id) with check (auth.uid()=user_id);

-- Annotazioni al vangelo (per data)
create table gospel_notes (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users not null,
  date text not null,
  rite text not null default 'romano',
  note text,
  created_at timestamptz default now(),
  unique(user_id, date, rite)
);
alter table gospel_notes enable row level security;
create policy "own" on gospel_notes using (auth.uid()=user_id) with check (auth.uid()=user_id);

-- Impostazioni (preghiere personalizzate)
create table settings (
  user_id uuid primary key references auth.users,
  prayers jsonb,
  updated_at timestamptz default now()
);
alter table settings enable row level security;
create policy "own" on settings using (auth.uid()=user_id) with check (auth.uid()=user_id);

-- Streak (giorni di visita)
create table streak (
  user_id uuid primary key references auth.users,
  visits text[] default '{}',
  updated_at timestamptz default now()
);
alter table streak enable row level security;
create policy "own" on streak using (auth.uid()=user_id) with check (auth.uid()=user_id);
```

## Poi in config.js inserisci URL e chiave anon da Settings → API
