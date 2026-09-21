create extension if not exists pgcrypto;

create table if not exists public.subscriptions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  provider text not null default 'mercadopago',
  provider_subscription_id text,
  plan text not null default 'biblioteca',
  status text not null default 'pending',
  current_period_end timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.subscriptions add column if not exists provider text not null default 'mercadopago';
alter table public.subscriptions add column if not exists provider_subscription_id text;
alter table public.subscriptions add column if not exists plan text not null default 'biblioteca';
alter table public.subscriptions add column if not exists status text not null default 'pending';
alter table public.subscriptions add column if not exists current_period_end timestamptz;
alter table public.subscriptions add column if not exists updated_at timestamptz not null default now();

create unique index if not exists subscriptions_provider_subscription_id_key
  on public.subscriptions(provider_subscription_id)
  where provider_subscription_id is not null;

alter table public.subscriptions enable row level security;

drop policy if exists "Users can read own subscriptions" on public.subscriptions;
create policy "Users can read own subscriptions"
  on public.subscriptions for select
  to authenticated
  using (auth.uid() = user_id);
