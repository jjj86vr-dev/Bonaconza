-- ════════════════════════════════════════════════════════════════════
-- VERONA WALL — dati iniziali
-- ════════════════════════════════════════════════════════════════════

update wall_config
   set cols = 100, rows = 60, hold_minutes = 20, is_open = true
 where id;

insert into plans (code, name, tagline, w, h, price_cents, max_units, perks, sort_order) values
  ('founder',
   'FONDATORE',
   'I primi 200. Prezzo che non tornerà mai più.',
   1, 1, 3900, 200,
   '["Cella 1x1 sulla wall","Badge Fondatore permanente","Nome nei titoli di coda del progetto","Prezzo bloccato per sempre","Diritto di prelazione sugli upgrade"]'::jsonb,
   10),

  ('start',
   'START',
   'Il tuo mattone sulla parete.',
   1, 1, 6900, null,
   '["Cella 1x1 sulla wall","Logo, nome, descrizione, link","Pagina pubblica dedicata","Modifiche contenuto illimitate"]'::jsonb,
   20),

  ('plus',
   'PLUS',
   'Quattro volte più visibile.',
   2, 2, 19900, null,
   '["Blocco 2x2 sulla wall","Logo, nome, descrizione, link","Pagina pubblica dedicata","Statistiche visite e click","Priorita'' nella ricerca interna"]'::jsonb,
   30),

  ('prime',
   'PRIME',
   'Si vede da lontano, anche a zoom minimo.',
   3, 3, 49000, null,
   '["Blocco 3x3 sulla wall","Tutto quello di PLUS","Immagine di copertina nella scheda","Segnalazione nella newsletter di lancio","Assistenza al setup"]'::jsonb,
   40),

  ('landmark',
   'LANDMARK',
   'Solo 20. Sono i monumenti della wall.',
   5, 5, 149000, 20,
   '["Blocco 5x5 sulla wall","Tutto quello di PRIME","Posizione scelta con noi","Presenza nella home e nella mappa","Post dedicato sui canali social","Contratto di permanenza 10 anni"]'::jsonb,
   50)
on conflict (code) do update
  set name        = excluded.name,
      tagline     = excluded.tagline,
      w           = excluded.w,
      h           = excluded.h,
      price_cents = excluded.price_cents,
      max_units   = excluded.max_units,
      perks       = excluded.perks,
      sort_order  = excluded.sort_order;
