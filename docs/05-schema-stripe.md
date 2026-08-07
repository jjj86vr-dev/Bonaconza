# 05 — Schema Stripe

## Principio architetturale

**Stripe non è la fonte di verità del prodotto: lo è il database.**

I prezzi vivono nella tabella `plans`. Le Checkout Session si creano con
`price_data` inline, calcolato al momento a partire dal record del piano. La
colonna `plans.stripe_price_id` esiste ed è supportata, ma serve solo se vuoi
gestire i listini dalla dashboard di Stripe.

Il vantaggio: cambiare un prezzo è una `update` su una riga, senza toccare
Stripe e senza rischiare disallineamenti tra i due sistemi.

## Catalogo

### Prodotti una tantum (mode: `payment`)

| Piano | `plans.code` | Importo | Descrizione dinamica sul checkout |
|---|---|---|---|
| FONDATORE | `founder` | 3900 | `Verona Wall — FONDATORE`, spazio 1x1 in (x, y) |
| START | `start` | 6900 | `Verona Wall — START`, spazio 1x1 in (x, y) |
| PLUS | `plus` | 19900 | `Verona Wall — PLUS`, spazio 2x2 in (x, y) |
| PRIME | `prime` | 49000 | `Verona Wall — PRIME`, spazio 3x3 in (x, y) |
| LANDMARK | `landmark` | 149000 | `Verona Wall — LANDMARK`, spazio 5x5 in (x, y) |

Le coordinate finiscono nella descrizione della riga d'ordine: il cliente vede
esattamente cosa sta comprando, e in caso di contestazione la ricevuta Stripe
prova quale posizione era stata acquistata.

### Abbonamento (mode: `subscription`) — dalla settimana 3

| Prodotto | Prezzo | ID consigliato |
|---|---|---|
| BOOST | 900 / mese, ricorrente | `price_boost_monthly` |

Da creare in dashboard e referenziare come `stripe_price_id`, perché gli
abbonamenti hanno bisogno di un Price stabile nel tempo.

## Metadata — obbligatori

Ogni Checkout Session porta:

```json
{
  "space_id": "uuid dello spazio prenotato",
  "order_id": "uuid dell'ordine",
  "plan_code": "plus",
  "x": "42",
  "y": "17",
  "referral": "A1B2C3D4"
}
```

`space_id` e `order_id` sono il collegamento fra Stripe e il database. Senza,
il webhook non sa cosa attivare. Sono l'unica parte davvero critica.

## Ciclo di vita di un acquisto

```
utente sceglie piano + cella
        │
        ▼
POST /api/create-checkout-session
        │
        ├─► hold_space()      cella prenotata (vincolo GiST: nessuna
        │                     sovrapposizione possibile, mai)
        ├─► INSERT orders     status = created
        └─► Stripe Checkout   expires_at = +30 min
        │
        ▼
   pagina Stripe
        │
        ├── pagato ──────────► checkout.session.completed
        │                        ├─ activate_space()   → status = active
        │                        ├─ orders.status      → paid
        │                        ├─ referral +1        → premio accreditato
        │                        └─ email di benvenuto con link magico
        │
        ├── abbandonato ─────► checkout.session.expired
        │                        └─ cella liberata
        │
        └── nulla ───────────► funzione schedulata ogni 5 minuti
                                 └─ release_expired_holds()
```

**Tre livelli di protezione sulla stessa cella:** il vincolo di esclusione del
database, la scadenza della sessione Stripe, la funzione schedulata. Ne bastano
due, il terzo è la rete di sicurezza.

## Eventi webhook da abilitare

| Evento | Cosa fa |
|---|---|
| `checkout.session.completed` | Attiva lo spazio, segna l'ordine pagato, invia l'email |
| `checkout.session.expired` | Libera la cella |
| `charge.refunded` | Ordine `refunded`, spazio `cancelled`, cella di nuovo in vendita |
| `customer.subscription.created` | Attiva BOOST |
| `customer.subscription.updated` | Aggiorna stato e scadenza |
| `customer.subscription.deleted` | Disattiva BOOST |

Gli altri eventi ricevono `200` e vengono ignorati.

## Idempotenza — il punto in cui quasi tutti sbagliano

Stripe **ripete** i webhook. Un cliente può cliccare due volte "Paga".

Nel codice:

- `activate_space()` esce subito se lo spazio e già `active`: chiamarla dieci
  volte equivale a chiamarla una
- `orders.stripe_checkout_session_id` ha un vincolo `unique`
- la creazione della sessione usa `idempotencyKey: order_<uuid>`
- `onCheckoutExpired` filtra con `.in('status', ['held','pending_payment'])`:
  **non può mai spegnere uno spazio già pagato**, nemmeno se gli eventi
  arrivano fuori ordine

Il webhook risponde `500` in caso di errore, così Stripe riprova. È sicuro
proprio perché ogni operazione è idempotente.

## Firma del webhook

Netlify consegna il corpo della richiesta in base64 quando è binario. Il file
`stripe-webhook.js` ricostruisce il **corpo grezzo** prima della verifica:

```js
const rawBody = event.isBase64Encoded
  ? Buffer.from(event.body, 'base64')
  : Buffer.from(event.body || '', 'utf8')
```

Se qui si fa `JSON.parse` prima della verifica, la firma non torna mai. È la
causa numero uno dei webhook che "non funzionano" su Netlify.

## Configurazione della dashboard Stripe

1. **Impostazioni → Branding**: logo, colore `#B4232A`, nome "Verona Wall"
2. **Checkout**: lingua italiana, indirizzo di fatturazione obbligatorio
3. **Metodi di pagamento**: carte, **Apple Pay / Google Pay** (in Italia
   valgono un aumento di conversione a due cifre su mobile), Klarna solo sopra
   i 199 €. Bonifico SEPA no: allunga i tempi e complica la moderazione
4. **Ricevute**: invio automatico attivo
5. **Radar**: regola `Blocca se il rischio è elevato`. Il rischio di frode su
   importi bassi è basso, ma i chargeback su prodotti digitali sono fastidiosi
6. **Tax**: `automatic_tax` disattivato finché si è in forfettario. Con la SRL
   va attivato e configurato con il commercialista

## Comandi utili

```bash
# Sviluppo: inoltra gli eventi al webhook locale
stripe listen --forward-to localhost:8888/api/stripe-webhook

# Simulare un pagamento completato
stripe trigger checkout.session.completed

# Simulare un abbandono
stripe trigger checkout.session.expired

# Ripetere un evento reale già ricevuto
stripe events resend evt_XXXXXXXX
```

## Carte di prova

| Numero | Esito |
|---|---|
| `4242 4242 4242 4242` | Pagamento riuscito |
| `4000 0000 0000 0002` | Rifiutata |
| `4000 0025 0000 3155` | Richiede 3D Secure |
| `4000 0000 0000 9995` | Fondi insufficienti |

Vanno provate tutte e quattro prima del lancio, verificando ogni volta lo stato
finale della cella nel database.

## Riconciliazione mensile

Una query da eseguire ogni fine mese: se restituisce righe, c'e un
disallineamento fra Stripe e il database da investigare a mano.

```sql
-- Spazi attivi senza un ordine pagato
select s.id, s.claim_email, s.activated_at
from spaces s
left join orders o on o.space_id = s.id and o.status = 'paid'
where s.status = 'active' and o.id is null;

-- Ordini pagati con lo spazio non attivo (il caso grave: cliente pagante
-- che non e sul muro)
select o.id, o.email, o.stripe_checkout_session_id
from orders o
join spaces s on s.id = o.space_id
where o.status = 'paid' and s.status <> 'active';
```
