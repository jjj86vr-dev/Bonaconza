-- ════════════════════════════════════════════════════════════════════
-- VERONA WALL — schema iniziale
-- Griglia: 100 colonne x 60 righe = 6.000 celle vendibili.
-- L'unicita' della posizione e' garantita a livello di database da un
-- vincolo di esclusione GiST: due spazi "vivi" non possono sovrapporsi,
-- nemmeno in caso di due checkout simultanei sulla stessa cella.
-- ════════════════════════════════════════════════════════════════════

create extension if not exists pgcrypto;
create extension if not exists btree_gist;
create extension if not exists citext;

-- ── Enum ────────────────────────────────────────────────────────────

create type space_status as enum (
  'held',             -- prenotato temporaneamente (checkout aperto)
  'pending_payment',  -- sessione Stripe creata, pagamento non ancora confermato
  'active',           -- pagato e pubblicato
  'expired',          -- hold scaduto, cella tornata libera
  'cancelled'         -- annullato / rimborsato
);

create type moderation_status as enum ('pending', 'approved', 'rejected');

create type order_status as enum ('created', 'paid', 'failed', 'refunded', 'expired');

-- ── Configurazione della wall ───────────────────────────────────────

create table wall_config (
  id            boolean primary key default true check (id),
  cols          integer not null default 100 check (cols between 10 and 1000),
  rows          integer not null default 60  check (rows between 10 and 1000),
  hold_minutes  integer not null default 20  check (hold_minutes between 5 and 120),
  is_open       boolean not null default true,
  updated_at    timestamptz not null default now()
);

insert into wall_config (id) values (true) on conflict do nothing;

-- ── Piani ───────────────────────────────────────────────────────────

create table plans (
  code            text primary key,
  name            text not null,
  tagline         text,
  w               integer not null check (w between 1 and 20),
  h               integer not null check (h between 1 and 20),
  price_cents     integer not null check (price_cents >= 0),
  currency        text    not null default 'eur',
  stripe_price_id text,                       -- opzionale: se null si usa price_data inline
  max_units       integer,                    -- null = illimitato (limitato solo dallo spazio)
  perks           jsonb   not null default '[]'::jsonb,
  sort_order      integer not null default 0,
  is_active       boolean not null default true,
  created_at      timestamptz not null default now()
);

-- ── Profili (estensione di auth.users) ──────────────────────────────

create table profiles (
  id           uuid primary key references auth.users (id) on delete cascade,
  email        citext,
  display_name text,
  created_at   timestamptz not null default now()
);

-- ── Spazi ───────────────────────────────────────────────────────────

create table spaces (
  id                uuid primary key default gen_random_uuid(),
  owner_id          uuid references auth.users (id) on delete set null,
  claim_email       citext not null,
  plan_code         text not null references plans (code),

  -- posizione sulla griglia (origine in alto a sinistra)
  x                 integer not null check (x >= 0),
  y                 integer not null check (y >= 0),
  w                 integer not null check (w between 1 and 20),
  h                 integer not null check (h between 1 and 20),

  status            space_status not null default 'held',
  hold_expires_at   timestamptz,

  -- contenuto pubblico
  title             text,
  description       text check (description is null or char_length(description) <= 180),
  link_url          text,
  logo_path         text,          -- path dentro lo storage bucket "logos"
  bg_color          text check (bg_color is null or bg_color ~* '^#[0-9a-f]{6}$'),
  category          text,
  slug              text unique,

  moderation        moderation_status not null default 'pending',
  moderation_note   text,

  referral_code     text,          -- codice usato in fase di acquisto
  activated_at      timestamptz,
  created_at        timestamptz not null default now(),
  updated_at        timestamptz not null default now(),

  -- Rettangolo occupato, ristretto di 0.1 su ogni lato: due celle
  -- adiacenti si toccano ma NON si sovrappongono.
  area box generated always as (
    box(
      point(x::float8 + 0.1,        y::float8 + 0.1),
      point((x + w)::float8 - 0.1,  (y + h)::float8 - 0.1)
    )
  ) stored,

  constraint spaces_link_is_http check (
    link_url is null or link_url ~* '^https?://[^\s]+$'
  )
);

-- Il cuore del sistema: nessuna sovrapposizione fra spazi "vivi".
alter table spaces
  add constraint spaces_no_overlap
  exclude using gist (area with &&)
  where (status in ('held', 'pending_payment', 'active'));

create index spaces_status_idx        on spaces (status);
create index spaces_hold_expires_idx  on spaces (hold_expires_at) where status = 'held';
create index spaces_owner_idx         on spaces (owner_id);
create index spaces_email_idx         on spaces (claim_email);
create index spaces_public_idx        on spaces (status, moderation) where status = 'active';

-- ── Ordini ──────────────────────────────────────────────────────────

create table orders (
  id                          uuid primary key default gen_random_uuid(),
  space_id                    uuid references spaces (id) on delete set null,
  email                       citext not null,
  plan_code                   text references plans (code),
  amount_cents                integer not null check (amount_cents >= 0),
  currency                    text not null default 'eur',
  status                      order_status not null default 'created',
  stripe_checkout_session_id  text unique,
  stripe_payment_intent_id    text,
  referral_code               text,
  invoice_business_name       text,
  invoice_vat                 text,
  created_at                  timestamptz not null default now(),
  paid_at                     timestamptz
);

create index orders_email_idx  on orders (email);
create index orders_status_idx on orders (status);

-- ── Abbonamento BOOST (ricavo ricorrente) ───────────────────────────

create table subscriptions (
  id                      uuid primary key default gen_random_uuid(),
  space_id                uuid references spaces (id) on delete cascade,
  email                   citext not null,
  stripe_customer_id      text,
  stripe_subscription_id  text unique,
  status                  text not null default 'incomplete',
  current_period_end      timestamptz,
  created_at              timestamptz not null default now(),
  updated_at              timestamptz not null default now()
);

create index subscriptions_space_idx on subscriptions (space_id);

-- ── Referral ────────────────────────────────────────────────────────

create table referrals (
  code           text primary key,
  space_id       uuid references spaces (id) on delete set null,
  email          citext,
  clicks         integer not null default 0,
  conversions    integer not null default 0,
  reward_cents   integer not null default 0,
  payout_status  text not null default 'pending',
  created_at     timestamptz not null default now()
);

-- ── Lead / waitlist ─────────────────────────────────────────────────

create table leads (
  id          uuid primary key default gen_random_uuid(),
  email       citext not null unique,
  name        text,
  source      text,
  ref         text,
  consent     boolean not null default false,
  created_at  timestamptz not null default now()
);

-- ── Statistiche per spazio (aggregate per giorno) ───────────────────

create table space_stats (
  space_id  uuid not null references spaces (id) on delete cascade,
  day       date not null default current_date,
  views     integer not null default 0,
  clicks    integer not null default 0,
  primary key (space_id, day)
);

-- ── Segnalazioni (moderazione dal basso) ────────────────────────────

create table reports (
  id          uuid primary key default gen_random_uuid(),
  space_id    uuid not null references spaces (id) on delete cascade,
  reason      text not null,
  details     text,
  reporter_ip_hash text,
  handled     boolean not null default false,
  created_at  timestamptz not null default now()
);

-- ── updated_at automatico ───────────────────────────────────────────

create or replace function set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at := now();
  return new;
end;
$$;

create trigger spaces_set_updated_at
  before update on spaces
  for each row execute function set_updated_at();

create trigger subscriptions_set_updated_at
  before update on subscriptions
  for each row execute function set_updated_at();

-- ── Profilo automatico alla registrazione ───────────────────────────

create or replace function handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, email)
  values (new.id, new.email)
  on conflict (id) do nothing;

  -- Riassocia al nuovo utente gli spazi comprati con la stessa email.
  update public.spaces
     set owner_id = new.id
   where owner_id is null
     and claim_email = new.email;

  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function handle_new_user();
