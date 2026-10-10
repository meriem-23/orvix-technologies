-- =====================================================================
--  ORVIX TECHNOLOGIES — Supabase schema
--  Run once in Supabase → SQL Editor (as the project owner).
--  Every table has Row Level Security ON. The browser only ever uses the
--  anon key; anything sensitive goes through server code.
-- =====================================================================

create extension if not exists pgcrypto;

-- ---------------------------------------------------------------------
-- Profiles (1 row per auth user) + roles
-- ---------------------------------------------------------------------
create table if not exists public.profiles (
  id          uuid primary key references auth.users(id) on delete cascade,
  email       text not null,
  full_name   text not null default '',
  phone       text not null default '',
  company     text not null default '',
  wilaya      text not null default '',
  role        text not null default 'client' check (role in ('client', 'admin')),
  is_blocked  boolean not null default false,
  created_at  timestamptz not null default now()
);

-- Helper used by every policy. SECURITY DEFINER avoids recursive RLS.
-- An admin only counts as admin once the session passed 2-factor auth (aal2):
-- a stolen password alone gives NO admin rights, even through the raw API.
create or replace function public.is_admin()
returns boolean
language sql stable security definer set search_path = public
as $$
  select coalesce(auth.jwt()->>'aal', '') = 'aal2'
     and exists (
       select 1 from public.profiles
       where id = auth.uid() and role = 'admin' and not is_blocked
     );
$$;
revoke all on function public.is_admin() from public;
grant execute on function public.is_admin() to authenticated, anon;

-- Create the profile when someone signs up. Role is ALWAYS 'client' here,
-- whatever metadata the signup request contains.
create or replace function public.handle_new_user()
returns trigger
language plpgsql security definer set search_path = public
as $$
begin
  insert into public.profiles (id, email, full_name, phone, company)
  values (
    new.id,
    coalesce(new.email, ''),
    left(coalesce(new.raw_user_meta_data->>'full_name', ''), 120),
    left(coalesce(new.raw_user_meta_data->>'phone', ''), 30),
    left(coalesce(new.raw_user_meta_data->>'company', ''), 120)
  );
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- Clients may edit their own name/phone/company but NEVER role, email or block.
create or replace function public.protect_profile_columns()
returns trigger
language plpgsql security definer set search_path = public
as $$
begin
  if auth.uid() is not null and not public.is_admin() then
    if new.role is distinct from old.role
       or new.is_blocked is distinct from old.is_blocked
       or new.email is distinct from old.email
       or new.id is distinct from old.id then
      raise exception 'Modification non autorisée';
    end if;
  end if;
  return new;
end;
$$;

drop trigger if exists protect_profile on public.profiles;
create trigger protect_profile
  before update on public.profiles
  for each row execute function public.protect_profile_columns();

alter table public.profiles enable row level security;

drop policy if exists "profiles: read own or admin" on public.profiles;
create policy "profiles: read own or admin" on public.profiles
  for select using (id = auth.uid() or public.is_admin());

drop policy if exists "profiles: update own or admin" on public.profiles;
create policy "profiles: update own or admin" on public.profiles
  for update using (id = auth.uid() or public.is_admin())
  with check (id = auth.uid() or public.is_admin());

-- ---------------------------------------------------------------------
-- Catalogue: software (kind = 'logiciel') and hardware / advertising
-- equipment (kind = 'materiel': PCs, logo projectors…)
-- ---------------------------------------------------------------------
create table if not exists public.products (
  id            uuid primary key default gen_random_uuid(),
  slug          text not null unique check (slug ~ '^[a-z0-9-]{2,60}$'),
  name          text not null,
  kind          text not null default 'logiciel' check (kind in ('logiciel', 'materiel')),
  category      text not null,
  image_path    text not null default '',
  in_stock      boolean not null default true,
  tagline       text not null default '',
  description   text not null default '',
  features      text[] not null default '{}',
  modules       text[] not null default '{}',
  price_dzd     integer check (price_dzd is null or price_dzd >= 0),
  pricing_model text not null default 'licence' check (pricing_model in ('licence', 'abonnement', 'devis')),
  platforms     text[] not null default '{Windows}',
  is_published  boolean not null default true,
  sort_order    integer not null default 100,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

-- Upgrade path for databases created with the first version of this file.
alter table public.products add column if not exists kind text not null default 'logiciel';
alter table public.products add column if not exists image_path text not null default '';
alter table public.products add column if not exists in_stock boolean not null default true;
alter table public.products drop constraint if exists products_category_check;
alter table public.products drop constraint if exists products_kind_check;
alter table public.products add constraint products_kind_check check (kind in ('logiciel', 'materiel'));
alter table public.products add constraint products_category_check check (
  (kind = 'logiciel' and category in ('sante', 'commerce', 'services', 'agences'))
  or (kind = 'materiel' and category in ('publicite', 'informatique'))
);
alter table public.products drop constraint if exists products_image_path_check;
alter table public.products add constraint products_image_path_check
  check (image_path = '' or image_path ~ '^[a-z0-9-]+/[0-9A-Za-z._-]+$');

alter table public.products enable row level security;

drop policy if exists "products: public read published" on public.products;
create policy "products: public read published" on public.products
  for select using (is_published or public.is_admin());

drop policy if exists "products: admin write" on public.products;
create policy "products: admin write" on public.products
  for all using (public.is_admin()) with check (public.is_admin());

-- ---------------------------------------------------------------------
-- Licences (activation keys)
-- ---------------------------------------------------------------------
create table if not exists public.licenses (
  id           uuid primary key default gen_random_uuid(),
  user_id      uuid not null references public.profiles(id) on delete cascade,
  product_id   uuid not null references public.products(id) on delete restrict,
  license_key  text not null unique,
  status       text not null default 'active' check (status in ('active', 'suspendue', 'expiree')),
  max_devices  integer not null default 1 check (max_devices between 1 and 100),
  expires_at   timestamptz,
  notes        text not null default '',
  created_at   timestamptz not null default now()
);
create index if not exists licenses_user_idx on public.licenses(user_id);

alter table public.licenses enable row level security;

drop policy if exists "licenses: read own or admin" on public.licenses;
create policy "licenses: read own or admin" on public.licenses
  for select using (user_id = auth.uid() or public.is_admin());

drop policy if exists "licenses: admin write" on public.licenses;
create policy "licenses: admin write" on public.licenses
  for all using (public.is_admin()) with check (public.is_admin());

-- Licences only exist for software, never for hardware.
create or replace function public.license_software_only()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  if not exists (select 1 from public.products where id = new.product_id and kind = 'logiciel') then
    raise exception 'Une licence ne peut être liée qu''à un logiciel';
  end if;
  return new;
end; $$;

drop trigger if exists license_software_only on public.licenses;
create trigger license_software_only before insert or update of product_id on public.licenses
  for each row execute function public.license_software_only();

-- True when the current user holds an active, non-expired licence for a product.
create or replace function public.has_active_license(p_product uuid)
returns boolean
language sql stable security definer set search_path = public
as $$
  select exists (
    select 1 from public.licenses
    where user_id = auth.uid()
      and product_id = p_product
      and status = 'active'
      and (expires_at is null or expires_at > now())
  );
$$;
grant execute on function public.has_active_license(uuid) to authenticated;

-- ---------------------------------------------------------------------
-- Releases (installers). Files live in the PRIVATE storage bucket "releases".
-- ---------------------------------------------------------------------
create table if not exists public.releases (
  id          uuid primary key default gen_random_uuid(),
  product_id  uuid not null references public.products(id) on delete cascade,
  version     text not null,
  file_path   text not null,
  file_size   bigint not null default 0,
  notes       text not null default '',
  created_at  timestamptz not null default now(),
  unique (product_id, version)
);

alter table public.releases enable row level security;

drop policy if exists "releases: licensed or admin" on public.releases;
create policy "releases: licensed or admin" on public.releases
  for select using (public.is_admin() or public.has_active_license(product_id));

drop policy if exists "releases: admin write" on public.releases;
create policy "releases: admin write" on public.releases
  for all using (public.is_admin()) with check (public.is_admin());

insert into storage.buckets (id, name, public)
values ('releases', 'releases', false)
on conflict (id) do update set public = false;

-- Only admins touch the bucket directly. Clients download through a
-- short-lived signed URL created by the server after a licence check.
drop policy if exists "releases bucket: admin only" on storage.objects;
create policy "releases bucket: admin only" on storage.objects
  for all using (bucket_id = 'releases' and public.is_admin())
  with check (bucket_id = 'releases' and public.is_admin());

-- Product photos (PCs, projectors, screenshots). PUBLIC read, admin write.
insert into storage.buckets (id, name, public)
values ('catalog', 'catalog', true)
on conflict (id) do update set public = true;

drop policy if exists "catalog bucket: admin write" on storage.objects;
create policy "catalog bucket: admin write" on storage.objects
  for all using (bucket_id = 'catalog' and public.is_admin())
  with check (bucket_id = 'catalog' and public.is_admin());

-- ---------------------------------------------------------------------
-- Requests: demo, purchase, custom project, contact
-- ---------------------------------------------------------------------
create table if not exists public.requests (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid references public.profiles(id) on delete set null,
  kind        text not null check (kind in ('demo', 'achat', 'sur_mesure', 'contact')),
  product_id  uuid references public.products(id) on delete set null,
  name        text not null,
  email       text not null,
  phone       text not null default '',
  company     text not null default '',
  budget      text not null default '',
  message     text not null,
  status      text not null default 'nouvelle' check (status in ('nouvelle', 'en_cours', 'traitee', 'refusee')),
  admin_note  text not null default '',
  created_at  timestamptz not null default now()
);
create index if not exists requests_user_idx on public.requests(user_id);

alter table public.requests enable row level security;

drop policy if exists "requests: read own or admin" on public.requests;
create policy "requests: read own or admin" on public.requests
  for select using (user_id = auth.uid() or public.is_admin());

drop policy if exists "requests: insert own" on public.requests;
create policy "requests: insert own" on public.requests
  for insert with check (user_id = auth.uid() and status = 'nouvelle' and admin_note = '');

drop policy if exists "requests: admin update" on public.requests;
create policy "requests: admin update" on public.requests
  for update using (public.is_admin()) with check (public.is_admin());

drop policy if exists "requests: admin delete" on public.requests;
create policy "requests: admin delete" on public.requests
  for delete using (public.is_admin());

-- ---------------------------------------------------------------------
-- Support tickets
-- ---------------------------------------------------------------------
create table if not exists public.tickets (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null references public.profiles(id) on delete cascade,
  product_id  uuid references public.products(id) on delete set null,
  subject     text not null,
  priority    text not null default 'normale' check (priority in ('basse', 'normale', 'urgente')),
  status      text not null default 'ouvert' check (status in ('ouvert', 'en_attente', 'resolu', 'ferme')),
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);
create index if not exists tickets_user_idx on public.tickets(user_id);

create table if not exists public.ticket_messages (
  id          uuid primary key default gen_random_uuid(),
  ticket_id   uuid not null references public.tickets(id) on delete cascade,
  author_id   uuid not null references public.profiles(id) on delete cascade,
  is_staff    boolean not null default false,
  body        text not null check (char_length(body) between 1 and 5000),
  created_at  timestamptz not null default now()
);
create index if not exists ticket_messages_ticket_idx on public.ticket_messages(ticket_id);

alter table public.tickets enable row level security;
alter table public.ticket_messages enable row level security;

drop policy if exists "tickets: read own or admin" on public.tickets;
create policy "tickets: read own or admin" on public.tickets
  for select using (user_id = auth.uid() or public.is_admin());

drop policy if exists "tickets: client insert own" on public.tickets;
create policy "tickets: client insert own" on public.tickets
  for insert with check (user_id = auth.uid() and status = 'ouvert');

drop policy if exists "tickets: admin update" on public.tickets;
create policy "tickets: admin update" on public.tickets
  for update using (public.is_admin()) with check (public.is_admin());

drop policy if exists "messages: read if ticket visible" on public.ticket_messages;
create policy "messages: read if ticket visible" on public.ticket_messages
  for select using (
    exists (select 1 from public.tickets t
            where t.id = ticket_id and (t.user_id = auth.uid() or public.is_admin()))
  );

drop policy if exists "messages: write if ticket visible and open" on public.ticket_messages;
create policy "messages: write if ticket visible and open" on public.ticket_messages
  for insert with check (
    author_id = auth.uid()
    and exists (select 1 from public.tickets t
                where t.id = ticket_id
                  and (public.is_admin() or (t.user_id = auth.uid() and t.status <> 'ferme')))
  );

-- is_staff is decided by the database, not by the client.
create or replace function public.ticket_message_defaults()
returns trigger
language plpgsql security definer set search_path = public
as $$
begin
  new.is_staff := public.is_admin();
  update public.tickets
     set updated_at = now(),
         status = case
           when new.is_staff and status = 'ouvert' then 'en_attente'
           when not new.is_staff and status in ('en_attente', 'resolu') then 'ouvert'
           else status end
   where id = new.ticket_id;
  return new;
end;
$$;

drop trigger if exists ticket_message_defaults on public.ticket_messages;
create trigger ticket_message_defaults
  before insert on public.ticket_messages
  for each row execute function public.ticket_message_defaults();

-- ---------------------------------------------------------------------
-- Site settings (contact info editable from the admin panel)
-- ---------------------------------------------------------------------
create table if not exists public.site_settings (
  key         text primary key check (key in ('phone', 'whatsapp', 'email', 'city', 'announcement')),
  value       text not null default '',
  updated_at  timestamptz not null default now()
);

alter table public.site_settings enable row level security;

drop policy if exists "settings: public read" on public.site_settings;
create policy "settings: public read" on public.site_settings for select using (true);

drop policy if exists "settings: admin write" on public.site_settings;
create policy "settings: admin write" on public.site_settings
  for all using (public.is_admin()) with check (public.is_admin());

-- ---------------------------------------------------------------------
-- Audit log (who did what in the admin panel)
-- ---------------------------------------------------------------------
create table if not exists public.audit_log (
  id          bigint generated always as identity primary key,
  actor_id    uuid references public.profiles(id) on delete set null,
  action      text not null,
  entity      text not null,
  entity_id   text,
  meta        jsonb not null default '{}',
  created_at  timestamptz not null default now()
);

alter table public.audit_log enable row level security;

drop policy if exists "audit: admin read" on public.audit_log;
create policy "audit: admin read" on public.audit_log for select using (public.is_admin());

drop policy if exists "audit: admin insert self" on public.audit_log;
create policy "audit: admin insert self" on public.audit_log
  for insert with check (public.is_admin() and actor_id = auth.uid());

-- ---------------------------------------------------------------------
-- Rate limiting (used by the server for public forms and auth actions)
-- Only the service role can call it.
-- ---------------------------------------------------------------------
create table if not exists public.rate_limits (
  bucket       text primary key,
  window_start timestamptz not null default now(),
  hits         integer not null default 0
);
alter table public.rate_limits enable row level security; -- no policies: service role only

create or replace function public.hit_rate_limit(p_bucket text, p_max integer, p_window_seconds integer)
returns boolean
language plpgsql security definer set search_path = public
as $$
declare
  v_hits integer;
begin
  insert into public.rate_limits as r (bucket, window_start, hits)
  values (p_bucket, now(), 1)
  on conflict (bucket) do update
    set hits = case when r.window_start < now() - make_interval(secs => p_window_seconds) then 1 else r.hits + 1 end,
        window_start = case when r.window_start < now() - make_interval(secs => p_window_seconds) then now() else r.window_start end
  returning hits into v_hits;
  return v_hits <= p_max;
end;
$$;
revoke all on function public.hit_rate_limit(text, integer, integer) from public, anon, authenticated;
grant execute on function public.hit_rate_limit(text, integer, integer) to service_role;

-- Keep updated_at fresh on products
create or replace function public.touch_updated_at()
returns trigger language plpgsql as $$
begin new.updated_at := now(); return new; end; $$;

drop trigger if exists products_touch on public.products;
create trigger products_touch before update on public.products
  for each row execute function public.touch_updated_at();
