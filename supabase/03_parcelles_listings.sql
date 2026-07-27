-- =========================================================
-- KILTIVE AI — Parcelles (suivi de culture) + Annonces marché
-- À exécuter dans Supabase > SQL Editor > New query > Run
-- (après profiles + diagnostics déjà créés)
-- =========================================================

-- ---------- PARCELLES ----------
create table public.parcelles (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users on delete cascade not null,
  name text not null,             -- ex: "Parcelle Nord"
  crop text not null,             -- ex: "Tomate"
  stage text not null default 'germination', -- germination | croissance | floraison | recolte
  health_score int not null default 100,     -- 0 à 100
  created_at timestamp with time zone default now()
);

alter table public.parcelles enable row level security;

create policy "Un utilisateur voit ses propres parcelles"
  on public.parcelles for select using ( auth.uid() = user_id );
create policy "Un utilisateur crée ses propres parcelles"
  on public.parcelles for insert with check ( auth.uid() = user_id );
create policy "Un utilisateur modifie ses propres parcelles"
  on public.parcelles for update using ( auth.uid() = user_id );
create policy "Un utilisateur supprime ses propres parcelles"
  on public.parcelles for delete using ( auth.uid() = user_id );

-- Permet de lier un diagnostic à une parcelle précise (facultatif)
alter table public.diagnostics add column parcelle_id uuid references public.parcelles(id) on delete set null;

-- ---------- ANNONCES DU MARCHÉ ----------
create table public.listings (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users on delete cascade not null,
  title text not null,
  category text not null default 'legumes',   -- legumes | fruits | cereales | intrants
  price numeric not null,
  unit text not null default 'unité',
  quantity text,
  location text,
  created_at timestamp with time zone default now()
);

alter table public.listings enable row level security;

-- Marché public : tout le monde peut voir toutes les annonces
create policy "Tout le monde peut voir les annonces"
  on public.listings for select using ( true );
create policy "Un utilisateur crée ses propres annonces"
  on public.listings for insert with check ( auth.uid() = user_id );
create policy "Un utilisateur modifie ses propres annonces"
  on public.listings for update using ( auth.uid() = user_id );
create policy "Un utilisateur supprime ses propres annonces"
  on public.listings for delete using ( auth.uid() = user_id );
