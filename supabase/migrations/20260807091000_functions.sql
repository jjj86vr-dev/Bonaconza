-- ════════════════════════════════════════════════════════════════════
-- VERONA WALL — viste e funzioni
-- ════════════════════════════════════════════════════════════════════

-- ── Vista pubblica della wall ───────────────────────────────────────
-- security_invoker = off (default): la vista gira con i privilegi del
-- proprietario e bypassa la RLS di `spaces`. E' voluto: e' l'unico
-- canale con cui anon legge gli spazi, ed espone solo colonne pubbliche
-- (niente email, niente dati di fatturazione).

create view public_wall as
select
  s.id,
  s.slug,
  s.x, s.y, s.w, s.h,
  s.title,
  s.description,
  s.link_url,
  s.logo_path,
  s.bg_color,
  s.category,
  s.plan_code,
  s.activated_at
from spaces s
where s.status = 'active'
  and s.moderation = 'approved';

grant select on public_wall to anon, authenticated;

-- ── Vista delle celle occupate (per disegnare i "buchi") ────────────
-- Include gli hold in corso, cosi' l'utente non prova a comprare una
-- cella che qualcun altro sta pagando in questo momento.

create view occupied_cells as
select s.x, s.y, s.w, s.h, (s.status = 'active') as is_active
from spaces s
where s.status in ('held', 'pending_payment', 'active');

grant select on occupied_cells to anon, authenticated;

-- ── Statistiche globali ─────────────────────────────────────────────

create or replace function wall_stats()
returns table (
  cols            integer,
  total_rows      integer,
  total_cells     integer,
  sold_cells      integer,
  reserved_cells  integer,
  free_cells      integer,
  spaces_count    integer,
  pct_sold        numeric
)
language sql
stable
security definer
set search_path = public
as $$
  with cfg as (select c.cols, c.rows from wall_config c where c.id),
  agg as (
    select
      coalesce(sum(w * h) filter (where status = 'active'), 0)::int as sold,
      coalesce(sum(w * h) filter (where status in ('held', 'pending_payment')), 0)::int as reserved,
      count(*) filter (where status = 'active')::int as n
    from spaces
  )
  select
    cfg.cols,
    cfg.rows,
    (cfg.cols * cfg.rows)::int,
    agg.sold,
    agg.reserved,
    (cfg.cols * cfg.rows - agg.sold - agg.reserved)::int,
    agg.n,
    round(agg.sold::numeric * 100 / nullif(cfg.cols * cfg.rows, 0), 2)
  from cfg, agg;
$$;

grant execute on function wall_stats() to anon, authenticated;

-- ── Disponibilita' di un'area ───────────────────────────────────────

create or replace function is_area_free(p_x integer, p_y integer, p_w integer, p_h integer)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select
    p_x >= 0 and p_y >= 0 and p_w > 0 and p_h > 0
    and p_x + p_w <= (select c.cols from wall_config c where c.id)
    and p_y + p_h <= (select c.rows from wall_config c where c.id)
    and not exists (
      select 1
      from spaces s
      where s.status in ('held', 'pending_payment', 'active')
        and s.area && box(
              point(p_x::float8 + 0.1,          p_y::float8 + 0.1),
              point((p_x + p_w)::float8 - 0.1,  (p_y + p_h)::float8 - 0.1)
            )
    );
$$;

grant execute on function is_area_free(integer, integer, integer, integer) to anon, authenticated;

-- ── Suggerisci una posizione libera (bottone "scegli per me") ───────

create or replace function random_free_area(p_w integer, p_h integer)
returns table (x integer, y integer)
language plpgsql
stable
security definer
set search_path = public
as $$
declare
  v_cols integer;
  v_rows integer;
  v_x    integer;
  v_y    integer;
  i      integer := 0;
begin
  select c.cols, c.rows into v_cols, v_rows from wall_config c where c.id;

  while i < 400 loop
    v_x := floor(random() * greatest(v_cols - p_w + 1, 1))::int;
    v_y := floor(random() * greatest(v_rows - p_h + 1, 1))::int;
    if is_area_free(v_x, v_y, p_w, p_h) then
      x := v_x; y := v_y;
      return next;
      return;
    end if;
    i := i + 1;
  end loop;

  -- fallback deterministico: prima cella libera scansionando la griglia
  for v_y in 0 .. v_rows - p_h loop
    for v_x in 0 .. v_cols - p_w loop
      if is_area_free(v_x, v_y, p_w, p_h) then
        x := v_x; y := v_y;
        return next;
        return;
      end if;
    end loop;
  end loop;
end;
$$;

grant execute on function random_free_area(integer, integer) to anon, authenticated;

-- ── Prenotazione temporanea (chiamata dal backend, service_role) ────

create or replace function hold_space(
  p_email      text,
  p_plan_code  text,
  p_x          integer,
  p_y          integer,
  p_referral   text default null
)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  v_plan   plans%rowtype;
  v_cfg    wall_config%rowtype;
  v_sold   integer;
  v_id     uuid;
begin
  select * into v_cfg from wall_config where id;
  if not v_cfg.is_open then
    raise exception 'WALL_CLOSED' using hint = 'La wall non accetta nuovi spazi in questo momento.';
  end if;

  select * into v_plan from plans where code = p_plan_code and is_active;
  if not found then
    raise exception 'PLAN_NOT_FOUND' using hint = 'Piano non valido.';
  end if;

  if p_x < 0 or p_y < 0
     or p_x + v_plan.w > v_cfg.cols
     or p_y + v_plan.h > v_cfg.rows then
    raise exception 'OUT_OF_BOUNDS' using hint = 'Posizione fuori dalla wall.';
  end if;

  if v_plan.max_units is not null then
    select count(*) into v_sold
      from spaces
     where plan_code = p_plan_code
       and status in ('held', 'pending_payment', 'active');
    if v_sold >= v_plan.max_units then
      raise exception 'PLAN_SOLD_OUT' using hint = 'Questo piano e'' esaurito.';
    end if;
  end if;

  -- Libera gli hold scaduti prima di tentare l'inserimento.
  perform release_expired_holds();

  begin
    insert into spaces (claim_email, plan_code, x, y, w, h, status, hold_expires_at, referral_code)
    values (
      lower(trim(p_email)), p_plan_code, p_x, p_y, v_plan.w, v_plan.h,
      'held', now() + make_interval(mins => v_cfg.hold_minutes), nullif(p_referral, '')
    )
    returning id into v_id;
  exception when exclusion_violation then
    raise exception 'AREA_TAKEN' using hint = 'Questa posizione e'' appena stata presa.';
  end;

  return v_id;
end;
$$;

revoke execute on function hold_space(text, text, integer, integer, text) from anon, authenticated;

-- ── Attivazione dopo pagamento (chiamata dal webhook Stripe) ────────

create or replace function activate_space(p_space_id uuid)
returns spaces
language plpgsql
security definer
set search_path = public
as $$
declare
  v_space spaces%rowtype;
  v_slug  text;
begin
  select * into v_space from spaces where id = p_space_id for update;
  if not found then
    raise exception 'SPACE_NOT_FOUND';
  end if;

  if v_space.status = 'active' then
    return v_space;                     -- idempotente: webhook puo' arrivare due volte
  end if;

  v_slug := coalesce(v_space.slug, 'spazio-' || left(replace(p_space_id::text, '-', ''), 10));

  update spaces
     set status          = 'active',
         hold_expires_at = null,
         activated_at    = coalesce(activated_at, now()),
         slug            = v_slug
   where id = p_space_id
   returning * into v_space;

  -- Crea il codice referral personale del nuovo proprietario.
  insert into referrals (code, space_id, email)
  values (upper(left(replace(p_space_id::text, '-', ''), 8)), p_space_id, v_space.claim_email)
  on conflict (code) do nothing;

  return v_space;
end;
$$;

revoke execute on function activate_space(uuid) from anon, authenticated;

-- ── Rilascio hold scaduti ───────────────────────────────────────────

create or replace function release_expired_holds()
returns integer
language plpgsql
security definer
set search_path = public
as $$
declare
  v_count integer;
begin
  with released as (
    update spaces
       set status = 'expired'
     where status in ('held', 'pending_payment')
       and hold_expires_at is not null
       and hold_expires_at < now()
    returning id
  )
  select count(*) into v_count from released;

  update orders
     set status = 'expired'
   where status = 'created'
     and created_at < now() - interval '2 hours';

  return v_count;
end;
$$;

revoke execute on function release_expired_holds() from anon, authenticated;

-- ── Tracking view/click (anon) ──────────────────────────────────────

create or replace function track_space_event(p_space_id uuid, p_kind text)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  if p_kind not in ('view', 'click') then
    return;
  end if;

  if not exists (select 1 from spaces where id = p_space_id and status = 'active') then
    return;
  end if;

  insert into space_stats (space_id, day, views, clicks)
  values (
    p_space_id,
    current_date,
    case when p_kind = 'view' then 1 else 0 end,
    case when p_kind = 'click' then 1 else 0 end
  )
  on conflict (space_id, day) do update
    set views  = space_stats.views  + excluded.views,
        clicks = space_stats.clicks + excluded.clicks;
end;
$$;

grant execute on function track_space_event(uuid, text) to anon, authenticated;

-- ── Iscrizione lista d'attesa (anon) ────────────────────────────────

create or replace function join_waitlist(
  p_email  text,
  p_name   text default null,
  p_source text default 'landing',
  p_ref    text default null
)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  if p_email !~* '^[^@\s]+@[^@\s]+\.[^@\s]+$' then
    raise exception 'INVALID_EMAIL';
  end if;

  insert into leads (email, name, source, ref, consent)
  values (lower(trim(p_email)), nullif(trim(p_name), ''), p_source, nullif(p_ref, ''), true)
  on conflict (email) do update
    set name   = coalesce(excluded.name, leads.name),
        ref    = coalesce(leads.ref, excluded.ref);
end;
$$;

grant execute on function join_waitlist(text, text, text, text) to anon, authenticated;

-- ── Segnalazione contenuto (anon) ───────────────────────────────────

create or replace function report_space(p_space_id uuid, p_reason text, p_details text default null)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into reports (space_id, reason, details)
  values (p_space_id, left(coalesce(p_reason, 'altro'), 60), left(p_details, 500));
end;
$$;

grant execute on function report_space(uuid, text, text) to anon, authenticated;

-- ── Click referral ──────────────────────────────────────────────────

create or replace function track_referral_click(p_code text)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  update referrals set clicks = clicks + 1 where code = upper(trim(p_code));
end;
$$;

grant execute on function track_referral_click(text) to anon, authenticated;
