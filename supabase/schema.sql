-- ========================================================
-- WatchFlix Supabase Database Schema
-- Run this in your Supabase SQL Editor to initialize tables
-- ========================================================

-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- 1. Profiles Table (Linked with Supabase Auth users)
create table if not exists public.profiles (
  id uuid references auth.users on delete cascade primary key,
  email text,
  username text,
  avatar_url text,
  is_admin boolean default false,
  preferred_theme text default 'dark',
  streaming_region text default 'US',
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Turn on Row Level Security (RLS)
alter table public.profiles enable row level security;

create policy "Public profiles are viewable by everyone."
  on public.profiles for select
  using ( true );

create policy "Users can insert their own profile."
  on public.profiles for insert
  with check ( auth.uid() = id );

create policy "Users can update their own profile."
  on public.profiles for update
  using ( auth.uid() = id );

-- Auto-create profile trigger on auth signup
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, email, username, avatar_url, is_admin)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'username', split_part(new.email, '@', 1)),
    coalesce(new.raw_user_meta_data->>'avatar_url', 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80'),
    false
  );
  return new;
end;
$$ language plpgsql security definer;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- 2. Favorites / Watchlist Table
create table if not exists public.user_watchlist (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users on delete cascade not null,
  media_id text not null, -- TMDB or custom ID
  media_type text not null check (media_type in ('movie', 'tv', 'custom')),
  title text not null,
  poster_path text,
  backdrop_path text,
  overview text,
  rating numeric(3, 1),
  release_date text,
  added_at timestamp with time zone default timezone('utc'::text, now()) not null,
  unique(user_id, media_id, media_type)
);

alter table public.user_watchlist enable row level security;

create policy "Users can view their own watchlist."
  on public.user_watchlist for select
  using ( auth.uid() = user_id );

create policy "Users can insert into their own watchlist."
  on public.user_watchlist for insert
  with check ( auth.uid() = user_id );

create policy "Users can delete from their own watchlist."
  on public.user_watchlist for delete
  using ( auth.uid() = user_id );

-- 3. Watch History & Continue Watching Table
create table if not exists public.watch_history (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users on delete cascade not null,
  media_id text not null,
  media_type text not null check (media_type in ('movie', 'tv', 'custom')),
  title text not null,
  poster_path text,
  backdrop_path text,
  season_number integer default 1,
  episode_number integer default 1,
  episode_title text,
  progress_seconds integer default 0,
  duration_seconds integer default 0,
  completed boolean default false,
  last_watched_at timestamp with time zone default timezone('utc'::text, now()) not null,
  unique(user_id, media_id, season_number, episode_number)
);

alter table public.watch_history enable row level security;

create policy "Users can manage their own watch history."
  on public.watch_history for all
  using ( auth.uid() = user_id )
  with check ( auth.uid() = user_id );

-- 4. Custom Video Streams & Media Source Overrides (Admin Content Management)
-- Allows the user to provide direct authorized HLS (.m3u8), MP4 or embed streams for any movie/show!
create table if not exists public.custom_streams (
  id uuid default gen_random_uuid() primary key,
  media_id text not null,
  media_type text not null check (media_type in ('movie', 'tv', 'custom')),
  title text not null,
  season_number integer,
  episode_number integer,
  stream_url text not null,
  stream_type text default 'hls' check (stream_type in ('hls', 'mp4', 'embed', 'youtube')),
  quality_label text default '1080p',
  subtitles_url text,
  is_active boolean default true,
  created_by uuid references auth.users,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table public.custom_streams enable row level security;

create policy "Custom streams are viewable by all authenticated users."
  on public.custom_streams for select
  using ( true );

create policy "Admins can manage custom streams."
  on public.custom_streams for all
  using (
    exists (
      select 1 from public.profiles
      where profiles.id = auth.uid() and profiles.is_admin = true
    )
  );
