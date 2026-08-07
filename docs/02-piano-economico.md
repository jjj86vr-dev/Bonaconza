# 02 — Piano economico

> Tutti i numeri sono ipotesi dichiarate, non previsioni. Le assunzioni sono
> esplicite proprio perché tu possa cambiarle e vedere cosa succede.
> Ogni cifra in euro e **IVA inclusa** dove non specificato diversamente.

## Assunzioni di base

| Assunzione | Valore | Nota |
|---|---|---|
| Celle totali | 6.000 | 100 x 60, tetto invalicabile |
| Conversione landing → acquisto | 2,5% | Realistico per traffico caldo locale; 1% per traffico freddo |
| Quota vendite via referral | 25% | Premio 20% sul lordo |
| Attach rate BOOST | 12% | Sul parco clienti attivo |
| Rimborsi entro 14 gg | 3% | Prudente |
| Commissione Stripe | 1,5% + 0,25 € | Carte EU; le extra-UE costano 2,5% |
| Regime fiscale | forfettario → SRL | Cambio al superamento degli 85.000 € |

## Mix di vendita ipotizzato (1.100 clienti anno 1)

| Piano | Clienti | Prezzo | Ricavo lordo | Celle |
|---|---|---|---|---|
| FONDATORE | 200 | 39 € | 7.800 € | 200 |
| START | 540 | 69 € | 37.260 € | 540 |
| PLUS | 225 | 199 € | 44.775 € | 900 |
| PRIME | 115 | 490 € | 56.350 € | 1.035 |
| LANDMARK | 20 | 1.490 € | 29.800 € | 500 |
| **Totale** | **1.100** | — | **175.985 €** | **3.175** |

Al dodicesimo mese la wall e piena al **53%**. È esattamente la condizione
migliore: abbastanza piena da sembrare viva, abbastanza vuota da poter ancora
scegliere un buon posto. **ARPU: 160 €.**

## Andamento mensile (scenario base)

| Mese | Nuovi clienti | Ricavo spazi | BOOST (MRR) | Servizi | Ricavo totale | Costi | Cassa mese | Cassa cum. |
|---|---|---|---|---|---|---|---|---|
| M1 | 60 | 4.200 € | 40 € | 200 € | 4.440 € | 3.100 € | +1.340 € | 1.340 € |
| M2 | 90 | 9.800 € | 110 € | 400 € | 10.310 € | 5.200 € | +5.110 € | 6.450 € |
| M3 | 110 | 17.500 € | 200 € | 600 € | 18.300 € | 7.400 € | +10.900 € | 17.350 € |
| M4 | 90 | 15.200 € | 290 € | 550 € | 16.040 € | 6.800 € | +9.240 € | 26.590 € |
| M5 | 80 | 13.400 € | 360 € | 500 € | 14.260 € | 6.200 € | +8.060 € | 34.650 € |
| M6 | 85 | 14.100 € | 430 € | 520 € | 15.050 € | 6.500 € | +8.550 € | 43.200 € |
| M7 | 80 | 13.200 € | 490 € | 500 € | 14.190 € | 6.300 € | +7.890 € | 51.090 € |
| M8 | 85 | 13.900 € | 550 € | 520 € | 14.970 € | 6.400 € | +8.570 € | 59.660 € |
| M9 | 90 | 14.800 € | 610 € | 560 € | 15.970 € | 6.700 € | +9.270 € | 68.930 € |
| M10 | 95 | 15.600 € | 670 € | 580 € | 16.850 € | 7.000 € | +9.850 € | 78.780 € |
| M11 | 105 | 17.100 € | 730 € | 640 € | 18.470 € | 7.600 € | +10.870 € | 89.650 € |
| M12 | 130 | 21.200 € | 800 € | 800 € | 22.800 € | 9.100 € | +13.700 € | 103.350 € |
| **Anno 1** | **1.100** | **176.000 €** | **5.280 €** | **6.370 €** | **187.650 €** | **78.300 €** | — | **103.350 €** |

M12 e alto perché cade a dicembre: **Santa Lucia e Natale sono il picco
naturale del progetto** (vedi strategia virale).

## Dettaglio costi anno 1

| Voce | Importo | Note |
|---|---|---|
| Advertising (Meta + Google locale) | 19.000 € | ~60% del budget nei primi 5 mesi |
| Premi referral (20% su 25% del venduto) | 8.800 € | Costo variabile, si autofinanzia |
| Commissioni Stripe | 3.900 € | ~2,2% effettivo |
| Rimborsi (3%) | 5.300 € | |
| Infrastruttura (Supabase, Netlify, Brevo, dominio) | 900 € | |
| Contenuti (video, foto, grafica) | 4.500 € | Il timelapse settimanale è il contenuto più redditizio |
| Eventi, fiere, stampa, gadget | 5.200 € | Vinitaly, Tocatì, mercatini di Natale |
| Legale, commercialista, privacy | 4.200 € | Include revisione contratti e informativa |
| Collaboratore part-time (da M4) | 18.000 € | 20 h/settimana su vendita diretta e moderazione |
| Varie e imprevisti | 8.500 € | |
| **Totale** | **78.300 €** | |

**Margine operativo lordo anno 1: ~109.000 € (58%)**, prima delle imposte e
del compenso del fondatore.

## Fiscalità — la parte che rovina i piani ottimisti

Il progetto supera gli 85.000 € di ricavi intorno al **mese 7**. Da li in poi
il regime forfettario non e più applicabile per l'anno successivo.

**Percorso consigliato:**

1. **Mesi 1-6: ditta individuale in regime forfettario.** Coefficiente di
   redditività 67% (servizi), imposta sostitutiva 5% (nuova attività) o 15%.
   Nessuna IVA da esporre → i prezzi di listino sono anche il netto.
   Su 55.000 € di ricavi: imposta ~1.850 € + INPS gestione separata.
2. **Dal mese 7-8: costituzione SRL semplificata** (~1.000 € notaio + spese).
   Da qui l'IVA al 22% e dovuta e i prezzi vanno intesi IVA inclusa: il netto
   scende del 18%. **Questo va deciso prima del lancio, non dopo**, perché
   cambia i prezzi di listino.
3. Accantonare **35% del margine** per IRES/IRAP e contributi.

> Non improvvisare su questo punto. Un'ora di commercialista prima del lancio
> vale più di due settimane di codice. Le cifre qui sopra sono indicative e
> vanno verificate con un professionista.

## Tre scenari

| | Pessimistico | Base | Ottimistico |
|---|---|---|---|
| Clienti anno 1 | 320 | 1.100 | 2.400 |
| Ricavo anno 1 | 48.000 € | 187.650 € | 402.000 € |
| Costi | 41.000 € | 78.300 € | 148.000 € |
| Margine | 7.000 € | 109.350 € | 254.000 € |
| Riempimento wall | 15% | 53% | 92% |
| Cosa e successo | La stampa locale ignora il progetto, il referral non innesca, il CAC resta sopra 45 € | Va come previsto: PR locale, referral funzionante, due picchi stagionali | Un servizio in TV o un post virale, più due licenze CITY WALL vendute |

Nello scenario pessimistico **il progetto non fallisce**: chiude in pari.
È il vantaggio di una struttura di costi quasi interamente variabile. Questa
e la ragione principale per cui vale la pena provarci.

## Break-even

- Costi fissi mensili (senza ads e senza collaboratore): **~210 €**
- Margine di contribuzione medio per cliente: **~120 €**
- **Break-even operativo: 2 clienti al mese.**
- Break-even includendo il collaboratore e 1.500 €/mese di ads:
  **15 clienti al mese.**

Il rischio finanziario reale di questo progetto è sostanzialmente il costo
delle prime campagne pubblicitarie. Tutto il resto e tempo.

## Anno 2 e 3 (indicativo)

| | Anno 2 | Anno 3 |
|---|---|---|
| Nuove celle Verona | 1.400 | 900 |
| Ricavo Verona | 210.000 € | 130.000 € |
| BOOST (ricorrente) | 28.000 € | 42.000 € |
| Sponsor di zona | 9.600 € | 9.600 € |
| Licenze CITY WALL | 2 x 3.000 € + royalty 12.000 € | 5 x 3.000 € + royalty 45.000 € |
| **Totale** | **~265.000 €** | **~242.000 €** |

Il segnale importante e nella riga finale: **il fatturato di Verona da solo
decresce dall'anno 3**, perché il muro si esaurisce. Il progetto ha una
scadenza incorporata, e va pianificata dal primo giorno. O si replica, o si
trasforma in ricorrente, o si accetta che sia un ottimo progetto triennale.
