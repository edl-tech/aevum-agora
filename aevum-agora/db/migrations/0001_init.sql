-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- Profiles
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  username text unique not null check (username ~ '^[a-zA-Z0-9_]{3,20}$'),
  display_name text,
  avatar_url text,
  role text not null default 'member' check (role in ('member','moderator','admin')),
  created_at timestamptz not null default now()
);

alter table public.profiles enable row level security;

create policy "Public profiles readable" on public.profiles
  for select using (true);

create policy "User can update own profile" on public.profiles
  for update using (auth.uid() = id);

-- Topics
create table if not exists public.topics (
  id uuid primary key default uuid_generate_v4(),
  slug text unique not null,
  name text not null,
  description text,
  created_by uuid not null references public.profiles(id) on delete set null,
  created_at timestamptz not null default now()
);

alter table public.topics enable row level security;

create policy "Everyone can read topics" on public.topics for select using (true);
create policy "Members can create topics" on public.topics for insert with check (exists (select 1 from public.profiles p where p.id = auth.uid()));
create policy "Moderator can update topics" on public.topics for update using (exists (select 1 from public.profiles p where p.id = auth.uid() and p.role in ('moderator','admin')));

-- Threads
create table if not exists public.threads (
  id uuid primary key default uuid_generate_v4(),
  topic_id uuid not null references public.topics(id) on delete cascade,
  title text not null,
  author_id uuid not null references public.profiles(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.threads enable row level security;

create policy "Everyone can read threads" on public.threads for select using (true);
create policy "Members can create threads" on public.threads for insert with check (auth.uid() = author_id);
create policy "Owner or moderator can update/delete threads" on public.threads
  for all using (auth.uid() = author_id or exists (select 1 from public.profiles p where p.id = auth.uid() and p.role in ('moderator','admin')));

-- Posts
create table if not exists public.posts (
  id uuid primary key default uuid_generate_v4(),
  thread_id uuid not null references public.threads(id) on delete cascade,
  author_id uuid not null references public.profiles(id) on delete set null,
  content text not null default '',
  image_url text,
  link_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.posts enable row level security;

create policy "Everyone can read posts" on public.posts for select using (true);
create policy "Members can create posts" on public.posts for insert with check (auth.uid() = author_id);
create policy "Owner or moderator can update/delete posts" on public.posts
  for all using (auth.uid() = author_id or exists (select 1 from public.profiles p where p.id = auth.uid() and p.role in ('moderator','admin')));

-- Comments
create table if not exists public.comments (
  id uuid primary key default uuid_generate_v4(),
  post_id uuid not null references public.posts(id) on delete cascade,
  author_id uuid not null references public.profiles(id) on delete set null,
  parent_comment_id uuid references public.comments(id) on delete cascade,
  content text not null,
  created_at timestamptz not null default now()
);

alter table public.comments enable row level security;

create policy "Everyone can read comments" on public.comments for select using (true);
create policy "Members can create comments" on public.comments for insert with check (auth.uid() = author_id);
create policy "Owner or moderator can update/delete comments" on public.comments
  for all using (auth.uid() = author_id or exists (select 1 from public.profiles p where p.id = auth.uid() and p.role in ('moderator','admin')));

-- Post likes
create table if not exists public.post_likes (
  post_id uuid not null references public.posts(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (post_id, user_id)
);

alter table public.post_likes enable row level security;

create policy "Everyone can read likes" on public.post_likes for select using (true);
create policy "Members can like" on public.post_likes for insert with check (auth.uid() = user_id);
create policy "Users can unlike their like" on public.post_likes for delete using (auth.uid() = user_id);

-- Notifications
create table if not exists public.notifications (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  type text not null check (type in ('reply','mention','system')),
  payload jsonb not null default '{}',
  read_at timestamptz,
  created_at timestamptz not null default now()
);

alter table public.notifications enable row level security;

create policy "Users read own notifications" on public.notifications for select using (auth.uid() = user_id);
create policy "System can insert notifications" on public.notifications for insert with check (auth.uid() = user_id);

-- Triggers to update updated_at
create or replace function public.set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger threads_set_updated_at before update on public.threads for each row execute procedure public.set_updated_at();
create trigger posts_set_updated_at before update on public.posts for each row execute procedure public.set_updated_at();

-- Create profile on user signup
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, username, display_name, avatar_url, role)
  values (new.id, 'user_' || substr(new.id::text, 1, 8), null, null, 'member')
  on conflict (id) do nothing;
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();