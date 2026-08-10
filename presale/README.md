# Le Mura di Verona · The Walls of Verona

Campagna Fondatori. Pagina singola, autosufficiente, senza backend:
HTML, CSS e JS in un file, più il panorama e l'immagine di anteprima.
Si pubblica trascinandola su Netlify e collegando un modulo di prenotazione.

**Modello: prenoti oggi senza carta, paghi solo se il muro apre.**
La prenotazione è gratuita; al completamento della campagna (o entro la
data limite) parte via email il link di pagamento Stripe da 99 €, con 14
giorni di recesso dal pagamento come da Codice del Consumo. Se il muro
non apre, le prenotazioni decadono e nessuno paga nulla.

> Perché non "blocchiamo" la carta subito: le autorizzazioni carta
> scadono dopo circa 7 giorni, una campagna dura settimane. Il modo
> onesto e senza backend è prenotazione ora + incasso a obiettivo
> raggiunto. Se un giorno servisse la carta salvata subito, si fa con
> Stripe Checkout in modalità setup, ma richiede un backend.

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

## Tre lingue

Italiano (lingua di partenza), inglese e tedesco, tutto dentro l'oggetto `T`
in fondo al file. La lingua si sceglie in quest'ordine: `?lang=en` /
`?lang=de` nell'URL → scelta salvata in precedenza → lingua del browser →
`CONFIG.LINGUA_DEFAULT` (italiano).

Il tedesco non è un vezzo: Verona vive di turismo di lingua tedesca (Garda,
Baviera, Austria) e le attività che lavorano con quel pubblico lo apprezzano.

Cambiando lingua si aggiornano anche `<html lang>`, il titolo della pagina, la
meta description, le etichette dei mattoni, le schede e il testo di WhatsApp.
Nel `<head>` ci sono i `hreflang` per italiano, inglese e x-default.

Per aggiungere un'altra lingua: duplica un blocco dentro `T`, traduci, e
aggiungi il pulsante corrispondente nel selettore.

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
  LINK_PRENOTAZIONE: 'INCOLLA_QUI_IL_LINK_DEL_MODULO',   // Tally o Google Form
  EMAIL:             'INSERISCI-EMAIL',
  PIVA:              'INSERISCI-PIVA',
  SITO:              'https://lemuradiverona.it',
  DATA_APERTURA:     { it:'31 marzo 2026', en:'31 March 2026' },
  TOTALE:            100,
  MOSTRA_ESEMPI:     false,   // sul muro solo attività vere
  LINGUA_DEFAULT:    'it'
};
```

Email, partita IVA e data compaiono da sole in tutti i punti della pagina dove
servono, in entrambe le lingue.

## Le Fondamenta di Verona

Sotto i cento mattoni, il livello alto: **dieci pietre di fondazione a
999 €**, numerate da I a X, rese come due corsi di pietra chiara alla base
del muro. Non mattoni più grandi: le pietre su cui il muro poggia.

Cosa comprende (tutto mantenibile senza promettere clienti): pietra numerata,
incisione col nome, targa fisica da esporre, certificato numerato, nome nei
comunicati, prima scelta della posizione, cena annuale, trasferibilità.
Stessa formula di prenotazione: nessun pagamento oggi, 999 € solo se il muro
apre. **La Pietra I è Bonaconza Carni.**

Le vendite si registrano nell'array `FONDAMENTA` (stessi campi dei mattoni,
in ordine: la prima riga è la Pietra I). Il contatore "ne restano X su 10"
si aggiorna da solo. Dal mattone/pietra cliccati il modulo riceve
`?quartiere=fondamenta-ii` e simili.

### Registrare una prenotazione (mattoni)

Non si aggiorna nessun contatore. Si aggiunge una riga a `MURATI`.
Già murati: **Baraldi / BaccoVerona** (via IV Novembre 24D, Borgo Trento)
come mattone Fondatore, e **Bonaconza Carni** (via G.C. Abba 15/A) come
Pietra I delle Fondamenta.

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
I nomi di fantasia non esistono più: i posti non prenotati appaiono come
"da rivendicare" o "liberi".

## Le Dediche

Le dediche hanno **una parte di muro tutta loro**, tra i quartieri e le
Fondamenta: sedici spazi (che crescono da soli se servono) con il simbolo ❦,
prezzo del mattone normale, prenotabili anche da lontano — il figlio emigrato
che mura il mattone per il padre. È l'eco digitale dei biglietti sul muro di
Giulietta: a Verona il gesto lo conoscono già.

Una dedica si registra come qualunque mattone, con quartiere `Le Dediche`:

```js
{ n:'Per Nonna Maria', q:'Le Dediche', d:'1931–2019. Sempre con noi.' }
```

Dal modulo arriva `?quartiere=le-dediche`. La sezione è tradotta nelle tre
lingue (The Dedications / Die Widmungen).

## La regola del muro: qui mura solo Verona

Sul muro vanno **solo mattoni veronesi**: attività con sede in città o in
provincia, persone nate o residenti a Verona, o **dediche a un veronese**
(così il figlio emigrato può murare il mattone per il padre: è il mercato
delle dediche, non va chiuso). Il legame si dichiara nel modulo e si
verifica prima della pubblicazione; se manca, la prenotazione viene
annullata — e siccome nessuno ha pagato, non c'è nulla da rimborsare.

La regola è volutamente sul **mattone**, non sull'acquirente: dentro l'UE
il regolamento sul geo-blocking (2018/302) vieta di discriminare il
compratore per residenza o nazionalità, mentre un criterio editoriale sul
contenuto — "questa è una mappa di Verona, ci vanno solo voci veronesi" —
è una normale scelta di curatela, come una guida locale che elenca solo
attività locali. Stessa sostanza, forma inattaccabile. In pagina la regola
compare nell'hero ("Qui mura solo Verona."), nella FAQ "Chi può prenotare
un mattone?" e nelle note legali, nelle tre lingue.

### Il modulo di prenotazione

Un Tally o Google Form con: nome attività, quartiere, email, logo,
descrizione, link, offerta, e **il legame con Verona** (sede / nascita /
residenza / dedica — un menu a tendina più un campo libero). Il quartiere del mattone cliccato arriva
precompilato nel modulo come parametro `?quartiere=` (Tally e Google
Form leggono la querystring).

Quando la campagna riesce: crei **un** Payment Link Stripe da 99 € e lo
mandi via email a tutti i prenotati. Da lì valgono i 14 giorni di
recesso.

---

## Prima di pubblicare

- [ ] Sostituire i valori in `CONFIG` (modulo, email, P.IVA)
- [ ] Se cambi dominio, aggiornare `og:image`, `og:url`, `canonical` e i
      `hreflang` nel `<head>`: devono essere URL assoluti e reali
- [ ] Creare il modulo di prenotazione (Tally/Google Form) con il campo
      `quartiere` precompilabile da querystring
- [ ] **Conferma di Baraldi.** Bonaconza Carni è tua; Baraldi compare
      pubblicamente come Fondatore: assicurati che l'accordo sia chiuso
      prima di mettere la pagina online
- [ ] Raccogliere altre 10-15 prenotazioni a voce prima del lancio, così
      il contatore non parte da 2
- [ ] Far leggere le note legali a un commercialista

## Verifica concorrenza (10 agosto 2026)

Cercato: muri/pareti digitali per attività veronesi, cloni locali della
Million Dollar Homepage, formule "adotta un mattone", progetti col nome
"Le Mura di Verona", domini.

- **Nessun progetto uguale o simile esiste a Verona**: niente muro digitale
  per le attività, nessun clone cittadino della MDH attivo in Italia.
- **Il nome è affollato, ma da istituzioni, non da concorrenti**: le Mura
  sono patrimonio UNESCO con progetti attivi (Mura Festival col Comune,
  rilievo digitale UNESCO, Trail delle Mura). Nessuno vende mattoni, ma su
  Google "le mura di Verona" sarà sempre il monumento: il progetto non può
  vivere di ricerca organica — e non ne ha bisogno, vive di passaparola.
  La dichiarazione di indipendenza in pagina è essenziale anche per questo.
- **Il meccanismo ha precedenti culturali che aiutano**: "adotta un mattone"
  è una formula nota nelle raccolte per i restauri (es. Rotonda di San
  Lorenzo a Mantova), e il "Mattone del Cuore" di Hellas/Setti era
  beneficenza. Gli italiani capiscono al volo il mattone simbolico.
- **Domini**: `lemuradiverona.it` e `veronawall.it` non risolvono —
  quasi certamente liberi. **Da registrare subito**, prima di parlare del
  progetto in giro.

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
| Apertura | mattoni 1/100 (Baraldi), Fondamenta 1/10 (Bonaconza Carni, Pietra I), nessun nome di fantasia |
| Scheda Baraldi | descrizione, pulsante "Visita" verso baccoverona.com |
| Passaggio a inglese | "Bricks reserved", FAQ "When and how do I pay?", note "Reservation and payment" |
| Passaggio a tedesco | "Die Mauern von Verona", "Die Fundamente von Verona", data "31. März 2026", FAQ e note complete |
| Modulo configurato | dai mattoni arriva `?quartiere=citta-antica`, dalle pietre `?quartiere=fondamenta-ii` |
| Mosaico | 960 tessere in colori reali, su desktop e mobile |
| Cambio lingua a muro costruito | Fondatori e contatori restano intatti |

Accessibilità: pannello `inert` e invisibile da chiuso, focus restituito al
mattone alla chiusura, tabulatore intrappolato nella scheda, `Esc` funzionante,
mosaico `aria-hidden`. Nessuno scorrimento orizzontale a 390 px.
