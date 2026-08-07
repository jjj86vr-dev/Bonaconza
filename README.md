# VERONA WALL

**La parete digitale permanente della città di Verona.**
6.000 celle. Si comprano una volta sola. Quando finiscono, finiscono.

Questo repository contiene il progetto completo: modello di business, piano
economico, strategia di crescita e **l'MVP funzionante** — landing, wall
interattiva, checkout Stripe, database Supabase con le regole di integrità e
area riservata per i proprietari.

---

## Documenti

| # | Documento | Cosa contiene |
|---|---|---|
| 01 | [Business model](docs/01-business-model.md) | Cosa vendiamo, a chi, con quali margini |
| 02 | [Piano economico](docs/02-piano-economico.md) | 12 mesi, tre scenari, fiscalità, break-even |
| 03 | [Strategia virale per Verona](docs/03-strategia-virale-verona.md) | Otto motori di crescita, calendario veronese |
| 04 | [MVP in 7 giorni](docs/04-mvp-7-giorni.md) | Sequenza operativa giorno per giorno |
| 05 | [Schema Stripe](docs/05-schema-stripe.md) | Catalogo, webhook, idempotenza, riconciliazione |
| 06 | [Mille clienti paganti](docs/06-mille-clienti.md) | Sette canali, funnel, ritmo trimestrale |
| 07 | [Valutazione e punti deboli](docs/07-valutazione-rischi.md) | Cosa può andare storto, e la verità sulla valutazione |

> Se hai tempo per leggere un solo documento, leggi il **07**.

## Architettura

```
React + Vite ──► Netlify (statico + Functions)
                      │
        ┌─────────────┴──────────────┐
        ▼                            ▼
   Supabase                       Stripe
   Postgres + RLS                 Checkout + Webhook
   Auth (link magico)
   Storage (loghi)
```

Il cuore del sistema e **un vincolo di esclusione GiST su Postgres**: due
spazi "vivi" non possono sovrapporsi, nemmeno se due persone pagano la stessa
cella nello stesso millisecondo. La correttezza non e affidata al codice
applicativo.

```sql
alter table spaces
  add constraint spaces_no_overlap
  exclude using gist (area with &&)
  where (status in ('held', 'pending_payment', 'active'));
```

## Struttura

```
src/
  components/   WallCanvas (canvas, pan/zoom), PlanCard, SpaceSheet, Reveal
  pages/        Landing, Wall, Claim, Success, Manage, Login, Legal
  lib/          supabase.js, api.js (con dati demo), format.js
  styles/       global.css (sistema visivo), components.css
netlify/functions/
  create-checkout-session.js   prenota la cella + crea la sessione Stripe
  stripe-webhook.js            attiva lo spazio, referral, email
  order-status.js              polling della pagina di successo
  release-holds.js             funzione schedulata, ogni 5 minuti
supabase/
  migrations/   schema, funzioni, RLS
  seed.sql      i cinque piani
  tests/        14 controlli sulle regole della wall
```

## Avvio rapido

```bash
npm install
cp .env.example .env      # senza chiavi il sito gira in modalità demo
npm run dev
```

Senza Supabase configurato la landing e la wall restano completamente
navigabili con dati dimostrativi: utile per lavorare sulla UI o mostrare il
progetto a qualcuno prima di avere un backend.

### Con il backend completo

```bash
supabase link --project-ref <ref>
supabase db push
psql "$DATABASE_URL" -f supabase/seed.sql

netlify dev                                                   # in un terminale
stripe listen --forward-to localhost:8888/api/stripe-webhook  # in un altro
```

Variabili d'ambiente: vedi `.env.example`. Le chiavi con prefisso `VITE_`
finiscono nel bundle del browser — **`SUPABASE_SERVICE_ROLE_KEY` e
`STRIPE_SECRET_KEY` non devono mai averlo.**

## Test del database

Le regole della wall (nessuna sovrapposizione, celle adiacenti ammesse, limiti
della griglia, tetto per piano, attivazione idempotente, rilascio delle
prenotazioni scadute) sono coperte da 14 controlli eseguibili su un Postgres
qualunque:

```bash
createdb vw
psql -d vw -f supabase/tests/00_supabase_stub.sql   # stub di auth/storage
psql -d vw -f supabase/migrations/20260807090000_init.sql
psql -d vw -f supabase/migrations/20260807091000_functions.sql
psql -d vw -f supabase/migrations/20260807092000_rls.sql
psql -d vw -f supabase/seed.sql
psql -d vw -f supabase/tests/01_wall_rules.sql      # → TUTTI I TEST SUPERATI
```

Lo stub serve solo a simulare `auth` e `storage` fuori da Supabase: sul
progetto reale non va eseguito.

## Modello di sicurezza

- **Nessuna lettura diretta delle tabelle da parte di `anon`.** La wall
  pubblica passa dalle viste `public_wall` e `occupied_cells`, che espongono
  solo colonne pubbliche: mai email, mai dati di fatturazione.
- **Il proprietario può modificare solo il contenuto.** Un trigger blocca
  qualunque tentativo di cambiare posizione, piano, stato o proprietario, e
  rimette il contenuto in moderazione a ogni modifica.
- **Le operazioni sensibili** (`hold_space`, `activate_space`,
  `release_expired_holds`) sono revocate a `anon` e `authenticated`: passano
  solo dal backend con `service_role`.
- **Lo Storage** consente la scrittura solo dentro la cartella di uno spazio
  effettivamente posseduto.
- **Il webhook Stripe** verifica la firma sul corpo grezzo ed è idempotente:
  un evento ripetuto non produce effetti diversi da un evento singolo.

## Stato del progetto

Funzionante e verificato:

- [x] Landing, wall interattiva, flusso di acquisto, pagina di successo
- [x] Area riservata: caricamento logo, modifica contenuti, statistiche
- [x] Database con vincoli, RLS, funzioni e 14 test superati
- [x] Checkout Stripe, webhook idempotente, rilascio automatico delle celle

Da fare (in ordine di impatto, vedi `04-mvp-7-giorni.md`):

- [ ] Immagine social generata automaticamente per ogni nuovo spazio
- [ ] Pannello di moderazione
- [ ] Pagina pubblica per singolo spazio + sitemap
- [ ] Abbonamento BOOST
- [ ] Sfida dei quartieri

## Licenza

Progetto privato. Verona Wall è un'iniziativa indipendente, non affiliata al
Comune di Verona.
