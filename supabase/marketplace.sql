-- HGW circular marketplace: run in a dedicated Supabase project SQL editor.
-- PostgreSQL + Supabase Auth, minimal data, RLS enabled. No payments.
create extension if not exists pgcrypto;
create table if not exists public.market_profiles (
 user_id uuid primary key references auth.users(id) on delete cascade,
 display_name text not null check (char_length(display_name) between 2 and 80),
 role text not null default 'buyer' check(role in ('buyer','seller','inspector','shipper')),
 created_at timestamptz not null default now()
);
create table if not exists public.market_listings (
 id uuid primary key default gen_random_uuid(),
 seller_id uuid not null references auth.users(id) on delete cascade,
 title text not null check(char_length(title) between 3 and 120),
 description text not null default '' check(char_length(description)<=2000),
 category text not null check(category in ('cars','equipment','electronics','clothing','furniture','other')),
 country text not null check(char_length(country) between 2 and 60),
 price numeric(14,2) not null check(price>=0),
 currency text not null check(currency in ('SEK','EUR','EGP','USD')),
 status text not null default 'draft' check(status in ('draft','published','paused','sold')),
 created_at timestamptz not null default now(),
 updated_at timestamptz not null default now()
);
create index if not exists market_listings_public_idx on public.market_listings(status,created_at desc);
create index if not exists market_listings_seller_idx on public.market_listings(seller_id);
create table if not exists public.market_requests (
 id uuid primary key default gen_random_uuid(),
 requester_id uuid not null references auth.users(id) on delete cascade,
 listing_id uuid not null references public.market_listings(id) on delete cascade,
 service text not null check(service in ('buy','inspection','shipping','inspection_shipping')),
 notes text not null default '' check(char_length(notes)<=1000),
 estimated_budget numeric(14,2) check(estimated_budget>=0),
 status text not null default 'new' check(status in ('new','in_review','completed','cancelled')),
 created_at timestamptz not null default now()
);
create index if not exists market_requests_requester_idx on public.market_requests(requester_id,created_at desc);
create table if not exists public.market_partners (
 user_id uuid primary key references auth.users(id) on delete cascade,
 service text not null check(service in ('inspection','shipping')),
 organization_name text not null check(char_length(organization_name) between 2 and 120),
 application_status text not null default 'pending' check(application_status in ('pending','approved','rejected')),
 created_at timestamptz not null default now()
);
-- Financial operations/commission calculations are intentionally not enabled.
alter table public.market_profiles enable row level security;
alter table public.market_listings enable row level security;
alter table public.market_requests enable row level security;
alter table public.market_partners enable row level security;
drop policy if exists "profiles self select" on public.market_profiles;
create policy "profiles self select" on public.market_profiles for select to authenticated using (user_id=(select auth.uid()));
drop policy if exists "profiles self insert" on public.market_profiles;
create policy "profiles self insert" on public.market_profiles for insert to authenticated with check(user_id=(select auth.uid()));
drop policy if exists "profiles self update" on public.market_profiles;
create policy "profiles self update" on public.market_profiles for update to authenticated using(user_id=(select auth.uid())) with check(user_id=(select auth.uid()));
drop policy if exists "public listings published or own" on public.market_listings;
create policy "public listings published or own" on public.market_listings for select to anon,authenticated using(status='published' or seller_id=(select auth.uid()));
drop policy if exists "owner create listing" on public.market_listings;
create policy "owner create listing" on public.market_listings for insert to authenticated with check(seller_id=(select auth.uid()));
drop policy if exists "owner update listing" on public.market_listings;
create policy "owner update listing" on public.market_listings for update to authenticated using(seller_id=(select auth.uid())) with check(seller_id=(select auth.uid()));
drop policy if exists "owner delete listing" on public.market_listings;
create policy "owner delete listing" on public.market_listings for delete to authenticated using(seller_id=(select auth.uid()));
drop policy if exists "requester read request" on public.market_requests;
create policy "requester read request" on public.market_requests for select to authenticated using(requester_id=(select auth.uid()));
drop policy if exists "requester create request" on public.market_requests;
create policy "requester create request" on public.market_requests for insert to authenticated with check(requester_id=(select auth.uid()) and status='new' and exists(select 1 from public.market_listings l where l.id=listing_id and l.status='published'));
drop policy if exists "requester cancel request" on public.market_requests;
-- No direct UPDATE policy: request status transitions require trusted backend workflows.
drop policy if exists "partner read self" on public.market_partners;
create policy "partner read self" on public.market_partners for select to authenticated using(user_id=(select auth.uid()));
drop policy if exists "partner apply" on public.market_partners;
create policy "partner apply" on public.market_partners for insert to authenticated with check(user_id=(select auth.uid()) and application_status='pending');
-- No user UPDATE grants for partner approvals: service-role workflow required.
grant usage on schema public to anon,authenticated;
grant select on public.market_listings to anon;
grant select,insert,update,delete on public.market_listings to authenticated;
grant select,insert,update on public.market_profiles to authenticated;
grant select,insert on public.market_requests to authenticated;
grant select,insert on public.market_partners to authenticated;
-- Never embed the service_role key in GitHub Pages or client JavaScript.
