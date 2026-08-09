# Le Mura di Verona · The Walls of Verona

Campagna Fondatori. Pagina singola, autosufficiente, senza backend:
HTML, CSS e JS in un file, più il panorama e l'immagine di anteprima.
Si pubblica trascinandola su Netlify e collegando uno Stripe Payment Link.

**Serve a rispondere all'unica domanda che conta prima di costruire qualsiasi
cosa: i veronesi pagano?** 100 mattoni × 99 € = 9.900 € di tetto. Non è il
business, è il test del business.

```
presale/
  index.html         la pagina (bilingue IT/EN)
  panorama.svg       Verona da Castel San Pietro, illustrazione originale
  og-cover.png       anteprima 1200x630 per WhatsApp e social
  tools/
    campiona-mosaico.mjs   rigenera i colori del mosaico da panorama.svg
```

## Rapporto con il progetto grande

| | `presale/` | radice del repository |
|---|---|---|
| Nome | Le Mura di Verona | Verona Wall |
| Formato | 1 file HTML + 2 immagini | React + Supabase + Stripe + Netlify |
| Prezzo | 99 € (100 Fondatori) | 39-1.490 € (6.000 celle) |
| Backend | nessuno | database, RLS, webhook |
| Tempo di lancio | 1 ora | 7 giorni |
| A cosa serve | validare la domanda | erogare il prodotto |

L'ordine corretto è: **prima questa, poi quello.** Il progetto in React si
costruisce quando i 100 mattoni sono venduti, non prima.

---

## Due lingue

Italiano e inglese, tutto dentro l'oggetto `T` in fondo al file. La lingua si
sceglie in quest'ordine: `?lang=en` nell'URL → scelta salvata in precedenza →
lingua del browser → `CONFIG.LINGUA_DEFAULT`.

Cambiando lingua si aggiornano anche `<html lang>`, il titolo della pagina, la
meta description, le etichette dei mattoni, le schede e il testo di WhatsApp.
Nel `<head>` ci sono i `hreflang` per italiano, inglese e x-default.

Per aggiungere una lingua: duplica un blocco dentro `T`, traduci, e comparirà
da sola nel selettore se aggiungi il pulsante corrispondente.

## Il mosaico

Lo sfondo dell'intestazione è **Verona vista da Castel San Pietro**, scomposta
in 960 tessere (48 × 20). Non serve nessuna foto perché funzioni: i colori
sono campionati da `panorama.svg`, un'illustrazione in colori diurni reali —
cielo azzurro, Torricelle verdi, tetti in cotto, l'Adige verde-acqua, Ponte
Pietra in pietra chiara — disegnata apposta per questo progetto e quindi
**libera da vincoli di licenza**.

Le tessere si compongono a onda dal centro, e la griglia si comporta come uno
sfondo `cover`: mantiene le proporzioni del panorama e viene ritagliata,
invece di stirarsi in rettangoli irriconoscibili sui telefoni.

### Mettere le foto vere dei quartieri

```js
var FOTO = [
  { src:'foto/ponte-pietra.jpg', x:14, y:8, w:4, h:3,
    credito:'Foto: Nome Cognome' },
];
```

`x,y` è la tessera in alto a sinistra (0-47 e 0-19), `w,h` quante ne occupa.
Le foto vengono virate sui toni del panorama, così il mosaico resta leggibile
come veduta d'insieme anche quando sarà mezzo fotografico. I crediti compaiono
da soli in basso a destra.

> **Sulle foto, e non è un dettaglio.** Usa solo immagini tue o con una
> licenza che ne consenta l'uso commerciale, e cita sempre l'autore. Una foto
> presa da internet costa molto più di quanto valga: è lo stesso errore dei
> nomi di attività reali con prezzi inventati, e in una città piccola si
> paga caro. Castelvecchio, le Arche Scaligere e Ponte Pietra sono luoghi
> pubblici e fotografarli è libero, ma **lo scatto di qualcun altro no**.

### Ridisegnare il panorama

Modifica `panorama.svg`, poi rigenera i colori:

```bash
node presale/tools/campiona-mosaico.mjs
```

Copia la stringa stampata dentro `MOSAICO` in `index.html`.

---

## Configurazione

Tutto quello che va cambiato sta in un unico blocco `CONFIG`:

```js
var CONFIG = {
  STRIPE_LINK:   'INCOLLA_QUI_IL_TUO_PAYMENT_LINK',
  EMAIL:         'INSERISCI-EMAIL',
  PIVA:          'INSERISCI-PIVA',
  SITO:          'https://lemuradiverona.it',
  DATA_APERTURA: { it:'31 marzo 2026', en:'31 March 2026' },
  TOTALE:        100,
  MOSTRA_ESEMPI: null,        // null = automatico
  LINGUA_DEFAULT:'it'
};
```

Email, partita IVA e data compaiono da sole in tutti i punti della pagina dove
servono, in entrambe le lingue.

### Registrare una vendita

Non si aggiorna nessun contatore. Si aggiunge una riga a `MURATI`:

```js
{ n:'Nome Attività', q:'Veronetta',
  d:{ it:'Due righe.', en:'Two lines.' },
  o:{ it:'Offerta', en:'Offer' }, u:'https://esempio.it' }
```

`d` e `o` accettano sia una stringa sia `{it, en}`. Da lì si aggiornano da
soli contatore, barra di avanzamento, mattoni rimasti e muro, che mura il
nuovo Fondatore nel suo quartiere con il sigillo dorato. Quartieri validi:
`Città Antica`, `Veronetta`, `Borgo Trento`, `San Zeno`.

Se un quartiere riceve più Fondatori dei posti previsti, **il muro alza altre
file** invece di troncare in silenzio: verificato fino a 60 Fondatori.
Ai primi 8 Fondatori veri **i mattoni di esempio si spengono da soli.**

### Stripe Payment Link

1. **Campi personalizzati:** "Nome attività" e "Quartiere"
2. **Pagina di conferma → reindirizzamento** verso un modulo (Tally, Google
   Form) per logo, descrizione, link e offerta

Il quartiere del mattone cliccato viaggia fino a Stripe come
`client_reference_id`: clicchi un mattone di San Zeno e in dashboard il
pagamento arriva con `san-zeno` accanto.

---

## Prima di pubblicare

- [ ] Sostituire i valori in `CONFIG`
- [ ] Se cambi dominio, aggiornare `og:image`, `og:url`, `canonical` e i
      `hreflang` nel `<head>`: devono essere URL assoluti e reali
- [ ] Configurare il Payment Link (campi personalizzati + redirect)
- [ ] **Non lanciare con 0 mattoni murati.** Vendine 15-20 offline agli amici,
      aggiungili a `MURATI` e parti da "ne restano 82"
- [ ] Far leggere le note legali a un commercialista

## Una nota sul nome

"Le Mura di Verona" è più forte di "The Wall of Verona": le mura magistrali
sono un luogo vero, patrimonio UNESCO, e il plurale evoca la città invece di
un muro qualsiasi. In inglese "The Walls of Verona" funziona altrettanto bene
con i turisti.

Ha però un rovescio da conoscere: **è un nome descrittivo e geografico, quindi
molto più difficile da registrare come marchio.** Nel documento
`docs/07-valutazione-rischi.md` la registrazione del marchio era una delle due
difese contro chi copia il progetto. Con questo nome quella difesa si indebolisce
e resta solo l'anteriorità: essere il primo, con dentro i nomi giusti, e farlo
sapere. Se ci tieni alla protezione, valuta un marchio figurativo (il logo con
i merli) invece del solo nome.

La dichiarazione di indipendenza dal Comune, già presente nelle note legali, con
questo nome è ancora più necessaria.

## Verificato

Chromium a 1280×1100 e 390×844, in sei scenari. Nessun errore JavaScript in
nessuno di essi.

| Scenario | Esito |
|---|---|
| Italiano, 0 Fondatori | 960 tessere, 120 colori distinti, muro e contatori coerenti |
| Passaggio a inglese | `<html lang>`, titolo, meta description, FAQ, note legali, etichette dei mattoni, testo WhatsApp: tutto tradotto |
| `?lang=en` diretto | lingua inglese applicata all'apertura |
| Scheda mattone in inglese | testi, offerta e pulsante tradotti; focus sul pulsante di chiusura |
| 4 Fondatori + 1 foto nel mosaico | contatori a 4/96, sigilli dorati, foto e crediti al posto giusto |
| Cambio lingua a muro costruito | Fondatori, foto e contatori restano intatti |

Accessibilità: pannello `inert` e invisibile da chiuso, focus restituito al
mattone alla chiusura, tabulatore intrappolato nella scheda, `Esc` funzionante,
mosaico `aria-hidden`. Nessuno scorrimento orizzontale a 390 px.
