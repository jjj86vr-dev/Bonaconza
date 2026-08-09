# The Wall of Verona — campagna Fondatori

Pagina singola, autosufficiente, senza backend: HTML, CSS e JS in un file.
Si pubblica trascinandola su Netlify e collegando uno Stripe Payment Link.

**Serve a rispondere all'unica domanda che conta prima di costruire qualsiasi
cosa: i veronesi pagano?** 100 mattoni x 99 € = 9.900 € di tetto. Non è il
business, è il test del business.

## Rapporto con il progetto grande

| | `presale/` | radice del repository |
|---|---|---|
| Nome | The Wall of Verona | Verona Wall |
| Formato | 1 file HTML + 1 immagine | React + Supabase + Stripe + Netlify |
| Prezzo | 99 € (100 Fondatori) | 39-1.490 € (6.000 celle) |
| Backend | nessuno | database, RLS, webhook |
| Tempo di lancio | 1 ora | 7 giorni |
| A cosa serve | validare la domanda | erogare il prodotto |

L'ordine corretto è: **prima questa, poi quello.** Il progetto in React si
costruisce quando i 100 mattoni sono venduti, non prima. Se non si vendono, si
è risparmiata una settimana di lavoro e si è imparata la cosa più importante.

---

## Configurazione

Tutto quello che va cambiato sta in un unico blocco `CONFIG` in fondo al file:

```js
var CONFIG = {
  STRIPE_LINK:   'INCOLLA_QUI_IL_TUO_PAYMENT_LINK',
  EMAIL:         'INSERISCI-EMAIL',
  PIVA:          'INSERISCI-PIVA',
  SITO:          'https://thewallofverona.it',
  DATA_APERTURA: '31 marzo 2026',
  TOTALE:        100,
  MOSTRA_ESEMPI: null        // null = automatico
};
```

Email, partita IVA e data compaiono da sole in tutti i punti della pagina dove
servono (footer, note legali, FAQ, garanzia di rimborso): **non c'è nessun
testo da cercare a mano.**

### Registrare una vendita

Non si aggiorna nessun contatore. Si aggiunge una riga a `MURATI`:

```js
var MURATI = [
  { n:'Nome Attività', q:'Veronetta', d:'Due righe di descrizione.',
    o:'Offerta della settimana', u:'https://esempio.it', img:'' },
];
```

Da lì si aggiornano da soli il contatore, la barra di avanzamento, i mattoni
rimasti nella barra fissa e il muro, che mura il nuovo Fondatore nel suo
quartiere con il sigillo dorato. Quartieri validi: `Città Antica`,
`Veronetta`, `Borgo Trento`, `San Zeno`.

Se un quartiere riceve più Fondatori dei posti previsti, **il muro alza altre
file** invece di troncare in silenzio: verificato fino a 60 Fondatori.

Ai primi 8 Fondatori veri **i mattoni di esempio si spengono da soli** e il
muro mostra solo cose vere. Si può forzare con `MOSTRA_ESEMPI: true/false`.

### Stripe Payment Link

Nel Payment Link vanno attivati:

1. **Campi personalizzati:** "Nome attività" e "Quartiere"
2. **Pagina di conferma → reindirizzamento** verso un modulo (Tally, Google
   Form) dove il Fondatore carica logo, descrizione, link e offerta

Il quartiere del mattone cliccato viaggia fino a Stripe come
`client_reference_id`: se uno clicca un mattone di San Zeno, in dashboard il
pagamento arriva con `san-zeno` accanto. È il modo più economico di sapere
dove murarlo senza scrivere una riga di backend.

---

## Cosa è stato corretto

| Problema | Stato |
|---|---|
| Nomi di attività reali con prezzi inventati | **Risolto.** Tutti i nomi ora sono di fantasia (`Osteria del Grifone`, `Panificio Tre Archi`): nessun commerciante vero si vede attribuire un'offerta che non ha mai fatto |
| Nessun modo di raccogliere logo e testi dopo il pagamento | **Risolto.** Campi personalizzati Stripe + redirect al modulo, spiegato nel passo II della pagina e nella FAQ dedicata |
| Anteprima muta su WhatsApp | **Risolto.** `og-cover.png` 1200x630 incluso, più tag Open Graph e Twitter completi |
| Contatore da aggiornare a mano | **Risolto.** Deriva da `MURATI.length` |
| Pannello raggiungibile da tastiera anche da chiuso | **Risolto.** `inert` + `visibility:hidden`, focus alla chiusura, focus restituito al mattone, trappola del tabulatore mentre è aperto |
| Nessuna informativa privacy, nessun recesso, nessuna data | **Risolto.** Sezione note legali con recesso di 14 giorni, trattamento dati e dichiarazione di indipendenza dal Comune |
| Placeholder sparsi nel documento | **Risolto.** Un solo blocco `CONFIG` |
| Barra fissa che copriva la card Fondatore | **Risolto.** Si ritira quando la card entra nello schermo |

## Cosa è stato aggiunto

- **Barra di avanzamento della muratura** nell'hero: la scarsità si vede,
  non si legge soltanto
- **Sigillo dorato** sui Fondatori veri, distinto dagli esempi
- **Pulsante WhatsApp "passa parola"**: in Italia il muro si diffonde di lì
- **FAQ "Mi porterà clienti?"** con risposta onesta che non promette traffico.
  Sembra controintuitivo in una pagina di vendita: è il motivo per cui i
  rimborsi resteranno bassi
- **Dati strutturati** `Product` + `Offer` per i motori di ricerca
- **Merli ghibellini** ridisegnati con proporzioni corrette
- **Aggancio statistiche**: la funzione `track()` è già chiamata nei punti
  giusti (click di acquisto con la provenienza, apertura scheda mattone,
  condivisione). Basta collegarla a Plausible o simili quando serve

## Prima di pubblicare

- [ ] Sostituire i quattro valori in `CONFIG` (link Stripe, email, P.IVA, data)
- [ ] Se cambi dominio, aggiornare `og:image`, `og:url` e `canonical`
      nel `<head>`: devono essere URL assoluti e reali
- [ ] Configurare il Payment Link (campi personalizzati + redirect)
- [ ] **Non lanciare con 0 mattoni murati.** Vendine 15-20 offline agli amici,
      aggiungili a `MURATI` e parti da "ne restano 82". Un muro a zero
      comunica che non ha comprato nessuno
- [ ] Far leggere le note legali a un commercialista: la prevendita con
      consegna futura ha regole precise

## Verificato

Provata con Chromium a 1280x1000 e 390x844, in quattro scenari:

| Scenario | Esito |
|---|---|
| Lancio, 0 Fondatori | 0/100, barra a zero, esempi visibili, nessun errore JS |
| 12 Fondatori + Stripe attivo | 12/100, barra al 12%, esempi spenti da soli, pulsanti verso Stripe |
| Scheda di un Fondatore | mostra il sigillo, il pulsante "Visita" e passa `client_reference_id=citta-antica` |
| 60 Fondatori | tutti e 60 murati, il muro alza le file necessarie |

Accessibilità: pannello `inert` e invisibile da chiuso, focus sul pulsante di
chiusura all'apertura, focus restituito al mattone alla chiusura, tabulatore
intrappolato nella scheda mentre è aperta, `Esc` funzionante.
Nessuno scorrimento orizzontale indesiderato a 390 px.
