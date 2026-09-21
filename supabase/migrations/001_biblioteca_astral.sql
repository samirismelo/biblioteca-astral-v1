-- Biblioteca Astral / Portal Cósmico
-- Base schema required by the current application.
-- Safe to run repeatedly where possible.

create extension if not exists "pgcrypto";

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text,
  role text not null default 'member' check (role in ('member','admin')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.categories (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  created_at timestamptz not null default now()
);

create table if not exists public.books (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  author text,
  description text,
  category_id uuid references public.categories(id) on delete set null,
  cover_url text,
  file_path text,
  file_type text not null default 'pdf' check (file_type in ('pdf','epub')),
  is_premium boolean not null default true,
  published boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.library_items (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  book_id uuid not null references public.books(id) on delete cascade,
  progress integer not null default 0 check (progress between 0 and 100),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (user_id, book_id)
);

create table if not exists public.subscriptions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  status text not null default 'inactive',
  plan text,
  current_period_end timestamptz,
  provider text,
  provider_subscription_id text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, full_name)
  values (new.id, coalesce(new.raw_user_meta_data->>'full_name',''))
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
after insert on auth.users
for each row execute procedure public.handle_new_user();

alter table public.profiles enable row level security;
alter table public.categories enable row level security;
alter table public.books enable row level security;
alter table public.library_items enable row level security;
alter table public.subscriptions enable row level security;

drop policy if exists "profiles select own" on public.profiles;
create policy "profiles select own"
on public.profiles for select
to authenticated
using (auth.uid() = id);

drop policy if exists "profiles update own" on public.profiles;
create policy "profiles update own"
on public.profiles for update
to authenticated
using (auth.uid() = id)
with check (auth.uid() = id);

drop policy if exists "categories public read" on public.categories;
create policy "categories public read"
on public.categories for select
to anon, authenticated
using (true);

drop policy if exists "books public published read" on public.books;
create policy "books public published read"
on public.books for select
to anon, authenticated
using (published = true);

drop policy if exists "library own read" on public.library_items;
create policy "library own read"
on public.library_items for select
to authenticated
using (auth.uid() = user_id);

drop policy if exists "library own insert" on public.library_items;
create policy "library own insert"
on public.library_items for insert
to authenticated
with check (auth.uid() = user_id);

drop policy if exists "library own update" on public.library_items;
create policy "library own update"
on public.library_items for update
to authenticated
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

drop policy if exists "library own delete" on public.library_items;
create policy "library own delete"
on public.library_items for delete
to authenticated
using (auth.uid() = user_id);

drop policy if exists "subscriptions own read" on public.subscriptions;
create policy "subscriptions own read"
on public.subscriptions for select
to authenticated
using (auth.uid() = user_id);

create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.profiles
    where id = auth.uid() and role = 'admin'
  );
$$;

drop policy if exists "admin categories all" on public.categories;
create policy "admin categories all"
on public.categories for all
to authenticated
using (public.is_admin())
with check (public.is_admin());

drop policy if exists "admin books all" on public.books;
create policy "admin books all"
on public.books for all
to authenticated
using (public.is_admin())
with check (public.is_admin());

drop policy if exists "admin subscriptions all" on public.subscriptions;
create policy "admin subscriptions all"
on public.subscriptions for all
to authenticated
using (public.is_admin())
with check (public.is_admin());

insert into storage.buckets (id, name, public)
values ('book-covers','book-covers',true)
on conflict (id) do update set public = excluded.public;

insert into storage.buckets (id, name, public)
values ('book-files','book-files',false)
on conflict (id) do update set public = excluded.public;

drop policy if exists "public covers read" on storage.objects;
create policy "public covers read"
on storage.objects for select
to anon, authenticated
using (bucket_id = 'book-covers');

drop policy if exists "admin covers write" on storage.objects;
create policy "admin covers write"
on storage.objects for all
to authenticated
using (bucket_id = 'book-covers' and public.is_admin())
with check (bucket_id = 'book-covers' and public.is_admin());

drop policy if exists "authenticated book files read" on storage.objects;
create policy "authenticated book files read"
on storage.objects for select
to authenticated
using (bucket_id = 'book-files');

drop policy if exists "admin book files write" on storage.objects;
create policy "admin book files write"
on storage.objects for all
to authenticated
using (bucket_id = 'book-files' and public.is_admin())
with check (bucket_id = 'book-files' and public.is_admin());
