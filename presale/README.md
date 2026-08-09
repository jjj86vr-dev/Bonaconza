# The Wall of Verona — campagna Fondatori

Pagina singola, autosufficiente, senza backend: HTML + CSS + JS in un file.
Si pubblica trascinandola su Netlify e collegando uno Stripe Payment Link.

**Serve a rispondere all'unica domanda che conta prima di costruire qualsiasi
cosa: i veronesi pagano?** 100 mattoni x 99 € = 9.900 € di tetto. Non e il
business, e il test del business.

## Rapporto con il progetto grande

| | `presale/` | radice del repository |
|---|---|---|
| Nome | The Wall of Verona | Verona Wall |
| Formato | 1 file HTML | React + Supabase + Stripe + Netlify |
| Prezzo | 99 € (100 Fondatori) | 39-1.490 € (6.000 celle) |
| Backend | nessuno | database, RLS, webhook |
| Tempo di lancio | 1 ora | 7 giorni |
| A cosa serve | validare la domanda | erogare il prodotto |

L'ordine corretto e: **prima questa, poi quello.** Il progetto in React si
costruisce quando i 100 mattoni sono venduti, non prima. Se non si vendono, si
e risparmiata una settimana di lavoro e si e imparata la cosa piu importante.

## Configurazione

Due righe, in fondo al file dentro `<script>`:

```js
var STRIPE_LINK = 'INCOLLA_QUI_IL_TUO_PAYMENT_LINK';
var FONDATORI_RIMASTI = 100;
```

Senza `STRIPE_LINK` i pulsanti puntano alla sezione Fondatore e la console
avvisa. Il contatore va aggiornato a mano a ogni vendita.

## Da sistemare prima di andare online

Bloccanti:

- [ ] **Nomi delle attivita di esempio.** Diversi nomi nel muro dimostrativo
      (`Osteria al Duomo`, `Pasticceria San Zeno`, `Farmacia Borgo Trento`,
      `Bar Lamberti`, `Caffe XX Settembre`) sono costruiti come
      "categoria + luogo veronese" e con ogni probabilita corrispondono ad
      attivita reali. Ognuno e mostrato con prezzi e offerte inventati
      (`Colazione completa 3,50 €`). La nota "sono esempi" non basta: si sta
      pubblicando il nome di un commerciante accanto a condizioni commerciali
      che non ha mai fissato. **Sostituire con nomi palesemente inventati**
      (`Osteria del Grifone`, `Panificio Tre Archi`) oppure con soli mestieri
      (`Osteria`, `Panificio`, `Farmacia`).
- [ ] Sostituire `INCOLLA_QUI_IL_TUO_PAYMENT_LINK`, `INSERISCI-EMAIL`,
      `INSERISCI-PIVA`
- [ ] **Raccolta dei contenuti del mattone.** Oggi Stripe incassa 99 € e
      raccoglie l'email: logo, descrizione, link, quartiere e offerta non
      vengono chiesti da nessuna parte, e il passo "II. Raccontati" non ha un
      meccanismo. Soluzione minima: nel Payment Link attivare i **campi
      personalizzati** (nome attivita, quartiere) e impostare la **pagina di
      conferma** su un form (Tally, Google Form) per logo e testi.
- [ ] Informativa privacy, anche breve: si raccolgono email e dati di
      fatturazione. Basta una pagina o un blocco nel footer.
- [ ] Prevendita = consegna futura. Indicare **una data**: "se entro il
      GG/MM/AAAA il muro non e online, rimborso del 100%". Va anche citato il
      diritto di recesso di 14 giorni.

Alta resa, non bloccanti:

- [ ] **`og:image`** (1200x630). In Italia il link si condivide su WhatsApp:
      senza immagine l'anteprima e muta e la condivisione rende molto meno.
      E' probabilmente la singola modifica con il miglior rapporto
      sforzo/conversione di tutta la pagina.
- [ ] **Non lanciare con "100 su 100".** Comunica che non ha comprato nessuno.
      Vendere 15-20 mattoni offline agli amici e partire da "ne restano 82".
- [ ] Il pannello di dettaglio resta raggiungibile da tastiera anche da
      chiuso (2 elementi focalizzabili, `visibility: visible`, nessun `inert`).
      Aggiungere `inert` quando e chiuso e riportare il focus alla chiusura.

## Verificato

Provata con Chromium a 1280x1000 e 390x844:

- 54 mattoni renderizzati su 6 file, nessun errore JS o di console
- nessuno scorrimento orizzontale indesiderato su mobile (390 px)
- apertura e chiusura della scheda funzionanti, `Esc` incluso
- fallback dei pulsanti corretto quando `STRIPE_LINK` non e configurato
