-- ════════════════════════════════════════════════════════════════════
-- Verifica delle regole della wall.
-- Uso:
--   psql -f supabase/tests/00_supabase_stub.sql   (solo su DB vuoto)
--   psql -f supabase/migrations/*.sql
--   psql -f supabase/seed.sql
--   psql -f supabase/tests/01_wall_rules.sql
-- Ogni assert fallito interrompe lo script.
-- ════════════════════════════════════════════════════════════════════

\set ON_ERROR_STOP on

do $$
declare
  v_a uuid;
  v_b uuid;
  v_msg text;
  v_stats record;
begin
  delete from spaces;

  -- 1. prenotazione base
  v_a := hold_space('mario@esempio.it', 'start', 10, 10);
  assert v_a is not null, 'hold_space non ha restituito un id';

  -- 2. stessa cella → rifiutata
  begin
    perform hold_space('luigi@esempio.it', 'start', 10, 10);
    raise exception 'FALLITO: la seconda prenotazione sulla stessa cella e passata';
  exception when others then
    get stacked diagnostics v_msg = message_text;
    assert v_msg = 'AREA_TAKEN', format('atteso AREA_TAKEN, ricevuto %s', v_msg);
  end;

  -- 3. cella adiacente → deve passare (i box non si toccano)
  v_b := hold_space('luigi@esempio.it', 'start', 11, 10);
  assert v_b is not null, 'la cella adiacente e stata rifiutata: margine del box sbagliato';

  -- 4. blocco 2x2 che copre una cella occupata → rifiutato
  begin
    perform hold_space('anna@esempio.it', 'plus', 9, 9);
    raise exception 'FALLITO: il blocco sovrapposto e passato';
  exception when others then
    get stacked diagnostics v_msg = message_text;
    assert v_msg = 'AREA_TAKEN', format('atteso AREA_TAKEN, ricevuto %s', v_msg);
  end;

  -- 5. blocco 2x2 in area libera → ok
  assert hold_space('anna@esempio.it', 'plus', 40, 40) is not null, '2x2 libero rifiutato';

  -- 6. fuori griglia → rifiutato
  begin
    perform hold_space('out@esempio.it', 'start', 100, 0);
    raise exception 'FALLITO: posizione fuori griglia accettata';
  exception when others then
    get stacked diagnostics v_msg = message_text;
    assert v_msg = 'OUT_OF_BOUNDS', format('atteso OUT_OF_BOUNDS, ricevuto %s', v_msg);
  end;

  -- 7. is_area_free coerente con il vincolo
  assert is_area_free(10, 10, 1, 1) = false, 'is_area_free: cella occupata data per libera';
  assert is_area_free(50, 50, 3, 3) = true,  'is_area_free: area libera data per occupata';
  assert is_area_free(99, 0, 2, 1) = false,  'is_area_free: non controlla i bordi';

  -- 8. attivazione idempotente
  perform activate_space(v_a);
  perform activate_space(v_a);
  assert (select status from spaces where id = v_a) = 'active', 'attivazione non riuscita';
  assert (select slug from spaces where id = v_a) is not null, 'slug non generato';
  assert exists (select 1 from referrals where space_id = v_a), 'referral non creato';

  -- 9. lo spazio attivo compare nella vista pubblica solo dopo moderazione
  assert not exists (select 1 from public_wall where id = v_a), 'spazio non moderato gia pubblico';
  update spaces set moderation = 'approved' where id = v_a;
  assert exists (select 1 from public_wall where id = v_a), 'spazio approvato non pubblico';

  -- 10. rilascio degli hold scaduti
  update spaces set hold_expires_at = now() - interval '1 minute' where id = v_b;
  assert release_expired_holds() >= 1, 'nessun hold rilasciato';
  assert (select status from spaces where id = v_b) = 'expired', 'hold non scaduto';
  -- la cella liberata torna disponibile
  assert is_area_free(11, 10, 1, 1) = true, 'la cella liberata risulta ancora occupata';

  -- 11. tetto di unita' per piano
  -- 20 blocchi 5x5 su due file, lontani dagli spazi creati sopra
  perform hold_space(format('landmark%s@esempio.it', g), 'landmark', (g % 10) * 6, 20 + (g / 10) * 6)
  from generate_series(0, 19) g;
  begin
    perform hold_space('troppi@esempio.it', 'landmark', 70, 50);
    raise exception 'FALLITO: superato il tetto di 20 LANDMARK';
  exception when others then
    get stacked diagnostics v_msg = message_text;
    assert v_msg = 'PLAN_SOLD_OUT', format('atteso PLAN_SOLD_OUT, ricevuto %s', v_msg);
  end;

  -- 12. statistiche
  select * into v_stats from wall_stats();
  assert v_stats.total_cells = 6000, format('celle totali attese 6000, trovate %s', v_stats.total_cells);
  assert v_stats.sold_cells + v_stats.reserved_cells + v_stats.free_cells = 6000,
    'la somma delle celle non torna';

  -- 13. suggerimento di un'area libera
  assert (select count(*) from random_free_area(3, 3)) = 1, 'random_free_area non restituisce nulla';

  -- 14. i campi immutabili restano tali per il proprietario
  --     (qui il trigger passa perche' auth.uid() e' null = contesto server)
  update spaces set title = 'Prova' where id = v_a;
  assert (select moderation from spaces where id = v_a) = 'approved',
    'il contesto server non deve rimettere in moderazione';

  raise notice 'TUTTI I TEST SUPERATI';
end
$$;
