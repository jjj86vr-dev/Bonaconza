# 04 — MVP in 7 giorni

Il codice in questo repository è già' l'MVP. Questo documento è la sequenza
operativa per passare da repository a **sito che incassa**, in sette giorni di
lavoro reale.

Regola dello sprint: **se una cosa non serve a incassare il primo euro,
non si fa questa settimana.**

---

## Giorno 1 — Fondamenta e database

- [ ] Creare il progetto Supabase (regione **eu-central-1**, per il GDPR)
- [ ] `supabase link` e `supabase db push` delle tre migrazioni
- [ ] Eseguire `supabase/seed.sql`
- [ ] Verificare le regole: `psql -f supabase/tests/01_wall_rules.sql`
      (14 controlli, devono passare tutti)
- [ ] Creare l'account Stripe, attivare i pagamenti, modalità test
- [ ] `npm install && npm run dev` — la landing deve girare con i dati demo
- [ ] Registrare il dominio `veronawall.it`

**Fine giornata: la wall si vede in locale e il database rifiuta le
sovrapposizioni.**

## Giorno 2 — Il flusso di acquisto completo

- [ ] Compilare `.env` con chiavi Supabase e Stripe di test
- [ ] `netlify dev` e acquisto completo con la carta `4242 4242 4242 4242`
- [ ] `stripe listen --forward-to localhost:8888/api/stripe-webhook`
- [ ] Verificare che lo spazio passi a `active` e che l'ordine risulti `paid`
- [ ] Provare i casi che vanno storti:
      - carta rifiutata `4000 0000 0000 0002`
      - chiusura del checkout → la cella deve tornare libera entro 20 minuti
      - due acquisti simultanei sulla stessa cella (due browser) → uno solo passa
- [ ] Configurare il template email in Brevo

**Fine giornata: si può comprare. È il giorno più importante dei sette.**

## Giorno 3 — Contenuti e onboarding del cliente

- [ ] Login con link magico funzionante
- [ ] Caricamento logo su Storage e comparsa sulla wall
- [ ] Coda di moderazione: una query salvata in Supabase con i pending
- [ ] Email di benvenuto con il link diretto alla modifica
- [ ] Testare tutto da telefono, non solo da desktop

> Il 60% degli acquisti arrivera da mobile. Se la scelta della cella non
> funziona bene con il dito, hai perso metà del fatturato.

## Giorno 4 — Testi, prezzi e aspetti legali

- [ ] Rileggere tutti i testi ad alta voce. Se una frase suona da agenzia,
      riscriverla
- [ ] Decidere il regime fiscale **prima** di pubblicare i prezzi
      (vedi `02-piano-economico.md`)
- [ ] Completare `/note-legali` con ragione sociale, sede, P.IVA, foro
- [ ] Informativa privacy e cookie (con Supabase e Stripe non servono cookie
      di profilazione: è un vantaggio, niente banner invasivo)
- [ ] Impostare la fatturazione elettronica
- [ ] Predisporre `og-cover.png` (1200x630) — determina come appare ogni
      condivisione su WhatsApp, che sarà il canale numero uno

## Giorno 5 — Messa in produzione

- [ ] Collegare il repository a Netlify, impostare le variabili d'ambiente
- [ ] Dominio + HTTPS + redirect `www` → apex
- [ ] Webhook Stripe in produzione con l'endpoint reale, evento
      `checkout.session.completed` (e `checkout.session.expired`)
- [ ] Attivare la funzione schedulata `release-holds`
- [ ] Controllare i Supabase Advisors: nessun avviso critico su RLS
- [ ] Un acquisto vero, con carta vera, da 39 €. **Comprare la prima cella
      di persona: è l'unico collaudo che conta**
- [ ] Backup automatico del database attivo

## Giorno 6 — Prova sociale

- [ ] Caricare a mano i 20 spazi degli ambasciatori: logo, testo, link
- [ ] La wall non deve mai essere vista vuota da un estraneo
- [ ] Generare il primo timelapse
- [ ] Preparare il comunicato stampa e la lista dei contatti giornalistici
- [ ] Scrivere i 10 messaggi WhatsApp personalizzati per i primi contatti

## Giorno 7 — Lancio

- [ ] Mattina: pubblicano i 20 ambasciatori, parte il comunicato
- [ ] Presidiare le risposte tutto il giorno: la velocità di risposta nelle
      prime 48 ore vale più di qualunque ottimizzazione
- [ ] Monitorare i log delle funzioni Netlify e Stripe
- [ ] Sera: pubblicare il numero reale delle celle vendute, qualunque sia.
      La trasparenza sul numero e essa stessa contenuto

---

## Cosa e volutamente escluso dai 7 giorni

| Rimandato a | Cosa |
|---|---|
| Settimana 2 | Immagine social generata automaticamente (il moltiplicatore più grande) |
| Settimana 2 | Pannello di moderazione con un'interfaccia vera |
| Settimana 3 | Abbonamento BOOST |
| Settimana 3 | Pagina pubblica per singolo spazio (`/spazio/slug`) e sitemap |
| Settimana 4 | Sfida dei quartieri e classifica |
| Mese 2 | App, notifiche, API, integrazioni, multilingua |

Ogni voce che sposti dentro i primi 7 giorni ritarda il primo incasso.

## Dove il piano può saltare

1. **Verifica dell'account Stripe.** Può richiedere da poche ore a diversi
   giorni. **Aprire l'account il giorno 1, non il giorno 5.**
2. **Deliverability delle email.** Configurare SPF, DKIM e DMARC sul dominio
   il giorno 4, non dopo: senza, le email di benvenuto finiscono nello spam e
   i clienti non completano mai il loro spazio.
3. **La carta di credito su mobile.** Se il checkout non e fluido da telefono,
   nessuna delle altre sei giornate conta.
