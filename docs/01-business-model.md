# 01 — Business model

## La frase che deve stare in testa a tutti

> **Verona Wall vende un posto permanente, non uno spazio pubblicitario.**

Non stai comprando impression. Stai comprando l'atto di esserci: un mattone con
il tuo nome sul muro digitale della tua città. È un prodotto emotivo con una
struttura da e-commerce. Trattarlo come "pubblicità locale" lo uccide, perché
come pubblicità costa più di quello che rende.

## Cosa vendiamo davvero

| Livello | Cosa compra il cliente | Perché paga |
|---|---|---|
| Funzionale | Logo + nome + descrizione + link, con URL pubblico | Presenza online che non dipende da un algoritmo |
| Sociale | Un posto visibile accanto ad altri veronesi | Appartenenza, "io c'ero" |
| Simbolico | Permanenza, scarsità, coordinate uniche | Piccolo atto di orgoglio civico |

Il livello 2 e 3 sono il motore. La landing page infatti non parla di visite o
click: parla di **restare**.

## Segmenti, in ordine di facilità

1. **Micro-imprese e negozi di quartiere** (parrucchieri, bar, botteghe,
   artigiani). Budget marketing 0-100 €/mese, allergici agli abbonamenti.
   Il "paghi una volta" e per loro l'argomento decisivo.
2. **Professionisti** (avvocati, architetti, fisioterapisti, fotografi).
   Comprano per identità professionale più che per lead.
3. **Associazioni, ASD, cori, gruppi alpini, parrocchie.** Verona ne ha
   centinaia, tutte con budget minuscoli e un enorme bisogno di visibilità.
4. **Privati cittadini e regali.** La cella da 39-69 € è un regalo di Natale
   o di laurea. Segmento sottovalutato: è quello che genera il passaparola.
5. **Aziende medie e brand locali** (cantine, Consorzi, catene locali).
   Comprano LANDMARK, e servono soprattutto come prova sociale.

## Modello di ricavo

### A. Vendita spazi — una tantum (85-90% del fatturato anno 1)

| Piano | Misura | Prezzo | Tetto | Ruolo |
|---|---|---|---|---|
| FONDATORE | 1x1 | 39 € | 200 pz | Innesco, urgenza, esercito di ambasciatori |
| START | 1x1 | 69 € | — | Volume |
| PLUS | 2x2 | 199 € | — | Cavallo di battaglia sui margini |
| PRIME | 3x3 | 490 € | — | Aziende strutturate |
| LANDMARK | 5x5 | 1.490 € | 20 pz | Prova sociale + cassa iniziale |

Griglia: **100 x 60 = 6.000 celle**. Il tetto è il prodotto. Non si aggiungono
mai celle: è l'unica leva di scarsità che abbiamo, e va difesa anche quando
sarà economicamente doloroso.

### B. Ricorrente — BOOST 9 €/mese

Non tocca la promessa "paghi una volta" perché è opzionale e non serve a
restare visibili, ma a **essere più** visibili:

- bordo animato e priorità nella ricerca interna
- statistiche giornaliere e link tracciati
- vetrina: fino a 3 offerte/eventi aggiornabili
- posizione nella newsletter mensile

Obiettivo realistico: **10-15% di attach rate**. Su 1.000 clienti sono
100-150 abbonati, 900-1.350 € di MRR. Non è il business, ma paga tutti i
costi fissi e rende l'azienda "viva".

### C. Servizi accessori (5-8%)

- Setup grafico fatto da noi: **49 €** (converte benissimo: il 30% dei negozi
  non ha un logo in PNG decente)
- Spostamento di posizione dopo i 14 giorni: **19 €**
- Upgrade di piano: differenza di prezzo + 19 €
- Pacchetto foto/testo professionale: **149 €**

### D. Sponsorizzazioni di zona (anno 2)

Le colonne 0-9 e 90-99 (le "cornici") non vengono vendute a celle: diventano
due fasce sponsor annuali da 2.400 €/anno. Massimo 4 sponsor. Questo introduce
ricorrente vero senza rompere la promessa fatta a chi ha comprato una cella.

### E. Licenza CITY WALL (anno 2-3) — la vera opzione di crescita

Il software e replicabile. `Verona Wall` diventa il primo nodo di una rete:
Vicenza, Padova, Brescia, Trento, Bolzano. Modello: licenza 3.000 € di
attivazione + 15% del venduto a un partner locale che ci mette la faccia e la
rete di contatti. Chi compra la licenza sta comprando un business chiavi in
mano già validato su Verona.

**Questa è la sola strada per cui il progetto vale più di quanto incassa.**
Vedi `07-valutazione-rischi.md`.

## Struttura di costo

| Voce | Tipo | Importo |
|---|---|---|
| Supabase Pro | fisso | ~23 €/mese |
| Netlify | fisso | 0-18 €/mese |
| Dominio .it | fisso | 15 €/anno |
| Brevo (email) | fisso | 0-19 €/mese |
| Fatturazione elettronica | fisso | ~10 €/mese |
| Commercialista | fisso | 80-150 €/mese |
| Stripe | variabile | 1,5% + 0,25 € (carte EU) |
| Premi referral | variabile | 20% del venduto tramite link |
| Advertising | variabile | vedi piano economico |
| Moderazione | variabile | ~2 min/spazio |

Costi fissi reali dei primi mesi: **150-250 €/mese**. È un business che si
sostiene con 3 clienti al mese e diventa interessante a 80.

## Unit economics (piano PLUS, il più rappresentativo)

```
Prezzo di listino (IVA inclusa)        199,00 €
IVA 22% (regime ordinario)            − 35,90 €
Netto                                  163,10 €
Commissione Stripe (1,5% + 0,25)      −  3,24 €
Premio referral medio (20% su 25%)    −  8,16 €
Costo moderazione + supporto          −  2,00 €
─────────────────────────────────────────────
Margine di contribuzione               149,70 €   (75% del lordo)
```

Con un CAC target di 25 € il rapporto **LTV/CAC e circa 6**. È un business
sano finché il CAC resta sotto i 40 €. Sopra i 60 € smette di funzionare e
bisogna tornare sui canali organici.

## Le tre leve su cui si gioca tutto

1. **Riempimento visibile.** Una wall vuota non si vende. I primi 300 spazi
   vanno riempiti quasi a qualunque costo (anche regalandoli a chi porta
   pubblico). Da li in poi vende il muro stesso.
2. **Il possessore come venditore.** Ogni cliente deve avere un motivo
   egoistico per mostrare la wall. Premio referral + immagine social
   personalizzata sono infrastruttura, non marketing.
3. **La promessa mantenuta.** Il giorno in cui aggiungiamo celle "perché
   servivano soldi" il prodotto muore. La scarsità è l'unico asset difendibile.
