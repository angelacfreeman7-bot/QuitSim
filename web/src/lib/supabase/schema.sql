-- QuitSim Supabase Schema
-- Run this in the Supabase SQL Editor

-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- Users profile (extends Supabase auth.users)
create table public.profiles (
  id uuid references auth.users on delete cascade primary key,
  zip text default '80202',
  city text default 'Denver',
  state text default 'CO',
  salary integer default 85000,
  savings integer default 30000,
  monthly_expenses integer default 3500,
  investments integer default 15000,
  debt integer default 0,
  partner_salary integer,
  partner_savings integer,
  partner_expenses integer,
  couples_mode boolean default false,
  onboarded boolean default false,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Saved simulation plans
create table public.plans (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  name text not null,
  params jsonb not null,
  result jsonb not null,
  locked boolean default false,
  created_at timestamptz default now()
);

-- Practice quitting streaks
create table public.streaks (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null unique,
  current_streak integer default 0,
  longest_streak integer default 0,
  last_completed date,
  completed_challenges text[] default '{}'
);

-- Row Level Security
alter table public.profiles enable row level security;
alter table public.plans enable row level security;
alter table public.streaks enable row level security;

-- Policies: users can only access their own data
create policy "Users can view own profile"
  on public.profiles for select using (auth.uid() = id);

create policy "Users can update own profile"
  on public.profiles for update using (auth.uid() = id);

create policy "Users can insert own profile"
  on public.profiles for insert with check (auth.uid() = id);

create policy "Users can view own plans"
  on public.plans for select using (auth.uid() = user_id);

create policy "Users can insert own plans"
  on public.plans for insert with check (auth.uid() = user_id);

create policy "Users can update own plans"
  on public.plans for update using (auth.uid() = user_id);

create policy "Users can delete own plans"
  on public.plans for delete using (auth.uid() = user_id);

create policy "Users can view own streaks"
  on public.streaks for select using (auth.uid() = user_id);

create policy "Users can upsert own streaks"
  on public.streaks for insert with check (auth.uid() = user_id);

create policy "Users can update own streaks"
  on public.streaks for update using (auth.uid() = user_id);

-- Function to handle new user signup
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id)
  values (new.id);
  insert into public.streaks (user_id)
  values (new.id);
  return new;
end;
$$ language plpgsql security definer;

-- Trigger on auth.users insert
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- Indexes
create index idx_plans_user_id on public.plans(user_id);
create index idx_plans_created_at on public.plans(created_at desc);
