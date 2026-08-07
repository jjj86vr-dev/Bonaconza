# 07 — Valutazione del progetto e punti deboli

Questa è la parte del documento che serve davvero. Le nove sezioni precedenti
spiegano come costruirlo; questa spiega perché potrebbe non funzionare.

---

## Valutazione onesta

### Cosa è Verona Wall

È un **micro-business locale ad alto margine**, non una startup tecnologica.
La distinzione non è accademica: cambia come lo si finanzia, chi si assume e
cosa si considera un successo.

| Criterio | Voto | Perché |
|---|---|---|
| Chiarezza dell'idea | 9/10 | Si spiega in una frase, e la frase vende |
| Velocità di esecuzione | 9/10 | Dal repository all'incasso in 7 giorni |
| Costi di avvio | 9/10 | Sotto i 500 € per essere operativi |
| Margini | 9/10 | 75% di margine di contribuzione |
| Difendibilità | **2/10** | Copiabile in un fine settimana |
| Ricorrenza dei ricavi | **2/10** | Una tantum per costruzione |
| Dimensione del mercato | **3/10** | Tetto strutturale di ~500.000 € |
| Ritenzione | **3/10** | Nessun motivo per tornare sul sito |
| Scalabilità | 5/10 | Solo replicando su altre città |

**Media pesata: 5,5/10.** Che tradotto significa: **ottimo progetto da
costruire, pessimo progetto in cui far entrare un investitore.**

### Valutazione economica

Al termine di un anno base (187.000 € di ricavi, ~109.000 € di margine
operativo), il valore di cessione realistico è:

- **Multiplo su utile di un micro-business online:** 1,5-2,5x il margine
  netto ricorrente. Ma il margine qui **non è ricorrente**: è vendita di
  inventario esauribile
- Chi compra sta comprando **le celle invendute**, non un flusso
- **Valutazione realistica: 120.000 - 200.000 €** al picco, in calo negli anni
  successivi man mano che l'inventario si esaurisce

Con un investitore, la valutazione pre-money difendibile è **200.000-350.000 €
al massimo**, e un investitore serio dirà di no: non c'è un ritorno da 10x su
un mercato che ha un tetto di 500.000 €.

> **Conclusione: bootstrappare. Non cercare capitale.**
> Servono 500 € per partire e il progetto va in pari a 20 clienti.
> Prendere soldi qui significa vendere il 20% di un business che non ne ha
> bisogno, e assumere un obbligo di crescita che il modello non può mantenere.

---

## I punti deboli, in ordine di gravità

### 1. Nessuno tornerà mai sul sito — GRAVE

**Il problema.** Un cliente compra, carica il logo, condivide una volta e non
torna più. La wall diventa un cimitero di loghi che nessuno guarda. Se il
traffico crolla, il prodotto perde valore proprio mentre lo stai ancora
vendendo — e il valore percepito è l'unica cosa che sostiene il prezzo.

**Perché è il rischio numero uno.** È esattamente quello che è successo alla
Million Dollar Homepage nel 2005: vendita completa in quattro mesi, poi il
95% dei link è diventato irraggiungibile e la pagina un reperto.

**Cosa fare.**
- Non vendere mai traffico. Vendere presenza e permanenza. La landing di
  questo repository è scritta così apposta
- Dare al muro una ragione ricorrente di essere guardato: sfida dei quartieri,
  timelapse settimanale, "cella del giorno", ricerca interna utile
- La pagina per singolo spazio con SEO locale porta traffico anche senza che
  nessuno guardi la wall: è la vera assicurazione sul valore

### 2. Ricavi una tantum su un impegno perpetuo — GRAVE

**Il problema.** Il cliente paga 69 € una volta, tu ti impegni a tenere online
il suo spazio per dieci anni. Il costo del decimo anno lo paghi con i ricavi
del primo. Quando le celle finiscono, i ricavi vanno a zero e i costi restano.

**I numeri.** Con 3.000 celle vendute e ~50 €/mese di infrastruttura, dieci
anni costano ~6.000 € più il tempo di gestione. Su 176.000 € incassati e
sostenibile. Ma **solo se accantonato**.

**Cosa fare.**
- Accantonare **il 5% di ogni vendita** in un fondo di continuità separato.
  Non è opzionale: è la differenza fra una promessa e una bugia
- Non usare mai la parola "per sempre" nei documenti contrattuali. Le note
  legali in questo repository dicono dieci anni, con archivio pubblico ed
  esportazione dei dati in caso di chiusura
- Costruire il ricorrente presto (BOOST, sponsor di zona), perché paghi la
  manutenzione quando la vendita si sarà fermata

### 3. Il mercato ha un tetto e lo raggiungi in fretta — GRAVE

**Il problema.** 6.000 celle sono, in valore, circa 500.000 €. Verona ha
25.000 imprese: anche con una penetrazione ottimistica del 10%, si arriva a
2.500 clienti e li ci si ferma. **Il business ha una data di scadenza
incorporata**, probabilmente attorno al mese 30.

**Cosa fare.** Decidere entro il mese 12 quale delle tre strade si prende:
1. **Replicare** su altre città (CITY WALL). È l'unica che scala davvero
2. **Convertire** in ricorrente (vetrina locale, directory a pagamento)
3. **Accettare** che sia un progetto triennale molto redditizio e chiudere in
   bellezza

Nessuna delle tre è sbagliata. Sbagliato è non sceglierne nessuna e scoprire
al mese 30 di non avere più niente da vendere.

### 4. Zero barriere all'ingresso — MEDIO

Chiunque può clonare il progetto in un fine settimana. La difesa non è tecnica,
è **il nome e l'anteriorità**: esiste un solo "muro di Verona" e sarà quello
arrivato per primo con dentro i nomi giusti.

**Cosa fare.** Registrare il marchio (~250 € in Italia). Occupare i profili
social di tutte le città venete adesso, non fra un anno. Firmare gli
ambasciatori in esclusiva. Muoversi in fretta: **la finestra è di 6-9 mesi**.

### 5. Moderazione e responsabilità legale — MEDIO

Ospiti contenuti di terzi in modo permanente. Prima o poi qualcuno mette un
link che diventa un sito di truffe, oppure un contenuto che offende. Con 1.000
spazi il caso non è ipotetico: è statistico.

**Cosa fare.**
- Moderazione umana prima della pubblicazione (già implementata: gli spazi
  nascono `pending`)
- Controllo automatico periodico dei link morti o compromessi
- Termini che prevedono esplicitamente la rimozione senza rimborso in caso di
  contenuto illecito
- Assicurazione RC professionale (~400 €/anno)
- `rel="nofollow noopener"` su tutti i link in uscita: già implementato

### 6. Concentrazione geografica — MEDIO

Tutto dipende da una città e, nei primi mesi, da pochissimi canali. Se L'Arena
non pubblica e Meta non converte, non c'è un piano B automatico.

**Cosa fare.** Nessun canale sopra il 30% (vedi `06-mille-clienti.md`).
Preparare le associazioni di categoria al mese 2, non al mese 5.

### 7. Il muro vuoto — MEDIO, ma solo all'inizio

Nessuno vuole essere il primo. Una wall al 2% comunica fallimento.

**Cosa fare.** I 20 ambasciatori con LANDMARK gratuito **prima** del lancio.
Non è un trucco: è la condizione minima perché il prodotto sia valutabile da
un estraneo. All'inizio si mostra sempre la wall inquadrata sulla zona più
popolata.

### 8. Le aspettative del cliente — MEDIO

Il negoziante che paga 199 € pensa "mi arriveranno clienti". Non arriveranno,
o non abbastanza. Al terzo mese chiede il rimborso o parla male in giro. In
una città piccola, venti clienti scontenti fanno rumore.

**Cosa fare.** Essere brutalmente chiari **prima** dell'acquisto. La FAQ nella
landing ha una domanda intitolata *"Ma la gente ci verrà davvero a
guardare?"* e la risposta non promette traffico. Sembra controintuitivo
metterla in una pagina di vendita: è invece il motivo per cui i rimborsi
resteranno sotto il 3%.

### 9. Fiscalità e adempimenti — MEDIO ma sottovalutato

Superamento della soglia forfettaria a metà anno, IVA che si mangia il 18% del
listino, fatturazione elettronica su 1.000 clienti, diritto di recesso di 14
giorni per i consumatori, GDPR su una base di dati personali.

**Cosa fare.** Un commercialista **prima** del lancio. Decidere il regime
prima di pubblicare i prezzi, perché cambiarli dopo avere venduto le prime
200 celle e un disastro di credibilità.

### 10. Il fondatore unico — MEDIO

Vendita diretta, moderazione, supporto, contenuti, sviluppo, contabilità.
Sono cinque lavori. Al mese 4, con 400 clienti, il supporto da solo occupa
un'ora al giorno.

**Cosa fare.** Collaboratore part-time dal mese 4 (previsto nel piano
economico). Automatizzare il più possibile fin da subito: è la ragione per cui
il login è senza password e la moderazione è una semplice coda.

---

## Le tre cose che possono ucciderlo

1. **Lanciare con il muro vuoto.** Sistemabile: 20 ambasciatori.
2. **Promettere traffico e non consegnarlo.** Sistemabile: onesta nella
   comunicazione, dal primo giorno.
3. **Non decidere cosa succede quando le celle finiscono.** Sistemabile solo
   se ci si pensa al mese 12, non al mese 30.

## Le tre cose che possono farlo esplodere

1. **La sfida dei quartieri.** Trasforma un acquisto in appartenenza. È la
   meccanica con il potenziale virale più alto dell'intero progetto.
2. **Un servizio in TV locale.** In una città di 250.000 abitanti, un
   passaggio a TeleArena vale 5.000 visite in un pomeriggio.
3. **La replica su altre città.** Se Verona funziona, il playbook e scritto e
   la seconda città costa un decimo della prima.

---

## Verdetto

**Costruiscilo.**

Non perché sia un grande business — non lo e, ed e importante saperlo. Ma
perché il rapporto fra quello che rischi e quello che puoi guadagnare è
sbilanciato a tuo favore in modo raro: **500 € e sette giorni contro un
potenziale di 100.000 € di margine in dodici mesi**, e nel caso peggiore
chiudi in pari avendo imparato a vendere, a costruire e a fare marketing in
una città reale.

Trattalo per quello che e: **un progetto di tre anni con un tetto noto**.
Massimizza il margine, accantona il fondo di continuità, e al mese 12 decidi
se replicarlo altrove. Non raccontarti che sia una startup destinata a
scalare, e non permettere a nessun investitore di raccontartelo.
