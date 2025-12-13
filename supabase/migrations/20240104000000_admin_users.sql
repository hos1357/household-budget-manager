-- Admin users table
create table if not exists public.admin_users (
  id uuid default uuid_generate_v4() primary key,
  email text unique not null,
  admin_password text not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table public.admin_users enable row level security;

-- Everyone can check if they are admin (read only)
create policy "Anyone can check admin status"
  on public.admin_users for select
  using (true);

-- Insert your admin email with unique password
-- Change 'YOUR_UNIQUE_PASSWORD' to your desired password
insert into public.admin_users (email, admin_password) values ('hsamandarian@gmail.com', 'YOUR_UNIQUE_PASSWORD');
