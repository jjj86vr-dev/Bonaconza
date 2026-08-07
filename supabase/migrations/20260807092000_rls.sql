-- ════════════════════════════════════════════════════════════════════
-- VERONA WALL — Row Level Security
-- Regola generale: anon NON legge mai le tabelle direttamente.
-- La lettura pubblica passa dalle viste `public_wall` / `occupied_cells`
-- e dalle funzioni security definer. La scrittura passa dal backend
-- (service_role) o da policy strette per l'utente autenticato.
-- ════════════════════════════════════════════════════════════════════

alter table wall_config   enable row level security;
alter table plans         enable row level security;
alter table profiles      enable row level security;
alter table spaces        enable row level security;
alter table orders        enable row level security;
alter table subscriptions enable row level security;
alter table referrals     enable row level security;
alter table leads         enable row level security;
alter table space_stats   enable row level security;
alter table reports       enable row level security;

-- ── Catalogo pubblico ───────────────────────────────────────────────

create policy "plans: lettura pubblica"
  on plans for select
  to anon, authenticated
  using (is_active);

create policy "wall_config: lettura pubblica"
  on wall_config for select
  to anon, authenticated
  using (true);

-- ── Profili ─────────────────────────────────────────────────────────

create policy "profiles: leggi il tuo"
  on profiles for select
  to authenticated
  using (id = auth.uid());

create policy "profiles: aggiorna il tuo"
  on profiles for update
  to authenticated
  using (id = auth.uid())
  with check (id = auth.uid());

-- ── Spazi ───────────────────────────────────────────────────────────
-- Nessuna policy di SELECT per anon: la wall si legge dalla vista.

create policy "spaces: leggi i tuoi"
  on spaces for select
  to authenticated
  using (owner_id = auth.uid());

-- Il proprietario puo' modificare SOLO il contenuto del proprio spazio.
-- Posizione, piano, stato e moderazione restano immutabili lato client:
-- il trigger qui sotto blocca qualunque tentativo di alterarli.
create policy "spaces: aggiorna il contenuto del tuo"
  on spaces for update
  to authenticated
  using (owner_id = auth.uid() and status = 'active')
  with check (owner_id = auth.uid() and status = 'active');

create or replace function guard_space_update()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  -- service_role e postgres possono fare tutto (webhook, admin).
  if coalesce(current_setting('request.jwt.claims', true)::jsonb ->> 'role', '') = 'service_role'
     or auth.uid() is null then
    return new;
  end if;

  if new.x            is distinct from old.x
     or new.y         is distinct from old.y
     or new.w         is distinct from old.w
     or new.h         is distinct from old.h
     or new.plan_code is distinct from old.plan_code
     or new.status    is distinct from old.status
     or new.owner_id  is distinct from old.owner_id
     or new.slug      is distinct from old.slug
     or new.claim_email is distinct from old.claim_email then
    raise exception 'IMMUTABLE_FIELDS' using
      hint = 'Posizione, piano e stato dello spazio non sono modificabili.';
  end if;

  -- Ogni modifica del contenuto torna in coda di moderazione.
  if new.title       is distinct from old.title
     or new.description is distinct from old.description
     or new.link_url is distinct from old.link_url
     or new.logo_path is distinct from old.logo_path then
    new.moderation := 'pending';
  end if;

  return new;
end;
$$;

create trigger spaces_guard_update
  before update on spaces
  for each row execute function guard_space_update();

-- ── Ordini ──────────────────────────────────────────────────────────

create policy "orders: leggi i tuoi"
  on orders for select
  to authenticated
  using (
    email = (select p.email from profiles p where p.id = auth.uid())
  );

-- ── Abbonamenti ─────────────────────────────────────────────────────

create policy "subscriptions: leggi i tuoi"
  on subscriptions for select
  to authenticated
  using (
    space_id in (select s.id from spaces s where s.owner_id = auth.uid())
  );

-- ── Referral ────────────────────────────────────────────────────────

create policy "referrals: leggi il tuo"
  on referrals for select
  to authenticated
  using (
    space_id in (select s.id from spaces s where s.owner_id = auth.uid())
  );

-- ── Statistiche ─────────────────────────────────────────────────────

create policy "space_stats: leggi le tue"
  on space_stats for select
  to authenticated
  using (
    space_id in (select s.id from spaces s where s.owner_id = auth.uid())
  );

-- leads, reports: nessuna policy → accessibili solo via RPC security
-- definer (join_waitlist, report_space) e da service_role.

-- ════════════════════════════════════════════════════════════════════
-- Storage: bucket pubblico "logos"
-- ════════════════════════════════════════════════════════════════════

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'logos', 'logos', true, 2097152,
  array['image/png', 'image/jpeg', 'image/webp', 'image/svg+xml']
)
on conflict (id) do update
  set public = true,
      file_size_limit = excluded.file_size_limit,
      allowed_mime_types = excluded.allowed_mime_types;

create policy "logos: lettura pubblica"
  on storage.objects for select
  to anon, authenticated
  using (bucket_id = 'logos');

-- L'utente puo' scrivere solo dentro la cartella di uno spazio che possiede:
-- percorso richiesto → "<space_id>/<filename>"
create policy "logos: carica nel tuo spazio"
  on storage.objects for insert
  to authenticated
  with check (
    bucket_id = 'logos'
    and (storage.foldername(name))[1] in (
      select s.id::text from spaces s where s.owner_id = auth.uid()
    )
  );

create policy "logos: sostituisci nel tuo spazio"
  on storage.objects for update
  to authenticated
  using (
    bucket_id = 'logos'
    and (storage.foldername(name))[1] in (
      select s.id::text from spaces s where s.owner_id = auth.uid()
    )
  );

create policy "logos: cancella nel tuo spazio"
  on storage.objects for delete
  to authenticated
  using (
    bucket_id = 'logos'
    and (storage.foldername(name))[1] in (
      select s.id::text from spaces s where s.owner_id = auth.uid()
    )
  );
