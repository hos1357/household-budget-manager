-- License system table
create table public.licenses (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references auth.users on delete cascade not null unique,
  license_key text unique,
  license_type text not null default 'trial', -- 'trial', 'permanent'
  trial_start_date timestamp with time zone default timezone('utc'::text, now()) not null,
  trial_end_date timestamp with time zone default (timezone('utc'::text, now()) + interval '3 days') not null,
  is_active boolean not null default true,
  activated_at timestamp with time zone,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table public.licenses enable row level security;

create policy "Users can view own license"
  on public.licenses for select
  using (auth.uid() = user_id);

create policy "Users can insert own license"
  on public.licenses for insert
  with check (auth.uid() = user_id);

create policy "Users can update own license"
  on public.licenses for update
  using (auth.uid() = user_id);

-- Function to create license on user signup
create or replace function public.handle_new_user_license()
returns trigger as $$
begin
  insert into public.licenses (user_id, license_type, trial_start_date, trial_end_date)
  values (new.id, 'trial', now(), now() + interval '3 days');
  return new;
end;
$$ language plpgsql security definer;

-- Trigger to auto-create license for new users
create trigger on_auth_user_created_license
  after insert on auth.users
  for each row execute procedure public.handle_new_user_license();

-- Admin table for managing license keys (optional - for admin panel)
create table public.license_keys (
  id uuid default uuid_generate_v4() primary key,
  license_key text unique not null,
  is_used boolean not null default false,
  used_by uuid references auth.users on delete set null,
  used_at timestamp with time zone,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Only admins can manage license keys (you'll need to set up admin role)
alter table public.license_keys enable row level security;

-- Allow users to check if a license key exists and is unused
create policy "Anyone can check license keys"
  on public.license_keys for select
  using (true);

-- Allow anyone to insert license keys (for admin panel)
create policy "Anyone can insert license keys"
  on public.license_keys for insert
  with check (true);

-- Allow anyone to update license keys (for marking as used)
create policy "Anyone can update license keys"
  on public.license_keys for update
  using (true);

-- Allow anyone to delete license keys (for admin panel)
create policy "Anyone can delete license keys"
  on public.license_keys for delete
  using (true);
