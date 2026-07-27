-- =========================================================
-- KILTIVE AI — Table des profils agriculteurs
-- À exécuter dans Supabase > SQL Editor > New query > Run
-- =========================================================

create table public.profiles (
  id uuid references auth.users on delete cascade primary key,
  full_name text,
  phone text,
  location text,
  main_crops text,
  farm_size text,
  language text default 'kreyol',
  created_at timestamp with time zone default now()
);

-- Active la sécurité au niveau des lignes (chacun ne voit/modifie QUE son profil)
alter table public.profiles enable row level security;

create policy "Un utilisateur peut voir son propre profil"
  on public.profiles for select
  using ( auth.uid() = id );

create policy "Un utilisateur peut créer son propre profil"
  on public.profiles for insert
  with check ( auth.uid() = id );

create policy "Un utilisateur peut modifier son propre profil"
  on public.profiles for update
  using ( auth.uid() = id );
