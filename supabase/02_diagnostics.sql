-- =========================================================
-- KILTIVE AI — Table des diagnostics de plantes
-- À exécuter dans Supabase > SQL Editor > New query > Run
-- (après avoir déjà créé la table "profiles")
-- =========================================================

create table public.diagnostics (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users on delete cascade not null,
  plant_name text not null,
  disease_name text,             -- null ou vide = plante saine
  status text not null default 'sain',   -- 'sain' | 'attention' | 'maladie'
  confidence int,                 -- ex: 92 (pourcentage)
  symptoms text,
  treatment text,
  prevention text,
  created_at timestamp with time zone default now()
);

alter table public.diagnostics enable row level security;

create policy "Un utilisateur voit ses propres diagnostics"
  on public.diagnostics for select
  using ( auth.uid() = user_id );

create policy "Un utilisateur crée ses propres diagnostics"
  on public.diagnostics for insert
  with check ( auth.uid() = user_id );

create policy "Un utilisateur supprime ses propres diagnostics"
  on public.diagnostics for delete
  using ( auth.uid() = user_id );
