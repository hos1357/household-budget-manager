-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- Create users table (extends Supabase auth.users)
create table public.profiles (
  id uuid references auth.users on delete cascade primary key,
  full_name text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS
alter table public.profiles enable row level security;

-- Profiles policies
create policy "Users can view own profile"
  on public.profiles for select
  using (auth.uid() = id);

create policy "Users can update own profile"
  on public.profiles for update
  using (auth.uid() = id);

-- Categories table
create table public.categories (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references auth.users on delete cascade not null,
  name text not null,
  icon text not null,
  color text not null,
  "order" integer not null default 0,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table public.categories enable row level security;

create policy "Users can view own categories"
  on public.categories for select
  using (auth.uid() = user_id);

create policy "Users can insert own categories"
  on public.categories for insert
  with check (auth.uid() = user_id);

create policy "Users can update own categories"
  on public.categories for update
  using (auth.uid() = user_id);

create policy "Users can delete own categories"
  on public.categories for delete
  using (auth.uid() = user_id);

-- Expenses table
create table public.expenses (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references auth.users on delete cascade not null,
  title text not null,
  amount numeric not null,
  category_id uuid references public.categories on delete restrict not null,
  date timestamp with time zone not null,
  jalali_date text not null,
  description text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table public.expenses enable row level security;

create policy "Users can view own expenses"
  on public.expenses for select
  using (auth.uid() = user_id);

create policy "Users can insert own expenses"
  on public.expenses for insert
  with check (auth.uid() = user_id);

create policy "Users can update own expenses"
  on public.expenses for update
  using (auth.uid() = user_id);

create policy "Users can delete own expenses"
  on public.expenses for delete
  using (auth.uid() = user_id);

-- Incomes table
create table public.incomes (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references auth.users on delete cascade not null,
  title text not null,
  amount numeric not null,
  date timestamp with time zone not null,
  jalali_date text not null,
  description text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table public.incomes enable row level security;

create policy "Users can view own incomes"
  on public.incomes for select
  using (auth.uid() = user_id);

create policy "Users can insert own incomes"
  on public.incomes for insert
  with check (auth.uid() = user_id);

create policy "Users can delete own incomes"
  on public.incomes for delete
  using (auth.uid() = user_id);

-- Budgets table
create table public.budgets (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references auth.users on delete cascade not null,
  monthly_target numeric not null,
  current_balance numeric not null,
  month text not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null,
  unique(user_id, month)
);

alter table public.budgets enable row level security;

create policy "Users can view own budgets"
  on public.budgets for select
  using (auth.uid() = user_id);

create policy "Users can insert own budgets"
  on public.budgets for insert
  with check (auth.uid() = user_id);

create policy "Users can update own budgets"
  on public.budgets for update
  using (auth.uid() = user_id);

-- Checks table
create table public.checks (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references auth.users on delete cascade not null,
  type text not null check (type in ('received', 'issued')),
  check_number text not null,
  amount numeric not null,
  issuer text not null,
  receiver text not null,
  bank text not null,
  account_number text,
  due_date timestamp with time zone not null,
  jalali_due_date text not null,
  issue_date timestamp with time zone not null,
  jalali_issue_date text not null,
  status text not null check (status in ('pending', 'cashed', 'bounced', 'cancelled')),
  description text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table public.checks enable row level security;

create policy "Users can view own checks"
  on public.checks for select
  using (auth.uid() = user_id);

create policy "Users can insert own checks"
  on public.checks for insert
  with check (auth.uid() = user_id);

create policy "Users can update own checks"
  on public.checks for update
  using (auth.uid() = user_id);

create policy "Users can delete own checks"
  on public.checks for delete
  using (auth.uid() = user_id);

-- Installments table
create table public.installments (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references auth.users on delete cascade not null,
  type text not null check (type in ('receivable', 'payable')),
  title text not null,
  total_amount numeric not null,
  paid_amount numeric not null default 0,
  remaining_amount numeric not null,
  installment_count integer not null,
  paid_count integer not null default 0,
  installment_amount numeric not null,
  start_date timestamp with time zone not null,
  jalali_start_date text not null,
  description text,
  creditor text,
  debtor text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table public.installments enable row level security;

create policy "Users can view own installments"
  on public.installments for select
  using (auth.uid() = user_id);

create policy "Users can insert own installments"
  on public.installments for insert
  with check (auth.uid() = user_id);

create policy "Users can update own installments"
  on public.installments for update
  using (auth.uid() = user_id);

create policy "Users can delete own installments"
  on public.installments for delete
  using (auth.uid() = user_id);

-- Installment payments table
create table public.installment_payments (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references auth.users on delete cascade not null,
  installment_id uuid references public.installments on delete cascade not null,
  amount numeric not null,
  due_date timestamp with time zone not null,
  jalali_due_date text not null,
  payment_date timestamp with time zone,
  jalali_payment_date text,
  status text not null check (status in ('pending', 'paid', 'overdue', 'cancelled')),
  installment_number integer not null,
  description text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table public.installment_payments enable row level security;

create policy "Users can view own installment payments"
  on public.installment_payments for select
  using (auth.uid() = user_id);

create policy "Users can insert own installment payments"
  on public.installment_payments for insert
  with check (auth.uid() = user_id);

create policy "Users can update own installment payments"
  on public.installment_payments for update
  using (auth.uid() = user_id);

create policy "Users can delete own installment payments"
  on public.installment_payments for delete
  using (auth.uid() = user_id);

-- Create indexes
create index expenses_user_id_idx on public.expenses(user_id);
create index expenses_date_idx on public.expenses(date);
create index expenses_category_id_idx on public.expenses(category_id);
create index incomes_user_id_idx on public.incomes(user_id);
create index checks_user_id_idx on public.checks(user_id);
create index checks_due_date_idx on public.checks(due_date);
create index installments_user_id_idx on public.installments(user_id);
create index installment_payments_installment_id_idx on public.installment_payments(installment_id);

-- Create updated_at trigger function
create or replace function public.handle_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

-- Add updated_at triggers
create trigger handle_profiles_updated_at before update on public.profiles
  for each row execute procedure public.handle_updated_at();

create trigger handle_categories_updated_at before update on public.categories
  for each row execute procedure public.handle_updated_at();

create trigger handle_expenses_updated_at before update on public.expenses
  for each row execute procedure public.handle_updated_at();

create trigger handle_budgets_updated_at before update on public.budgets
  for each row execute procedure public.handle_updated_at();

create trigger handle_checks_updated_at before update on public.checks
  for each row execute procedure public.handle_updated_at();

create trigger handle_installments_updated_at before update on public.installments
  for each row execute procedure public.handle_updated_at();
