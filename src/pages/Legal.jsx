export default function Legal() {
  return (
    <section className="section">
      <div className="shell" style={{ maxWidth: 760 }}>
        <p className="eyebrow">Note legali</p>
        <h1 className="h-xl" style={{ margin: '1rem 0 2.5rem' }}>
          Le regole del muro.
        </h1>

        <div className="legal">
          <h2>Cosa compri</h2>
          <p>
            Acquisti il diritto di uso esclusivo e non trasferibile di una porzione della griglia di
            Verona Wall, identificata da coordinate. Il pagamento è una tantum: non esistono canoni,
            rinnovi o addebiti successivi.
          </p>

          <h2>Per quanto tempo</h2>
          <p>
            Ci impegniamo a mantenere la wall pubblicamente accessibile per almeno dieci anni dalla
            data del tuo acquisto. Non usiamo la parola "per sempre" in senso contrattuale, perché
            nessuno può garantirlo. In caso di cessazione del servizio pubblichiamo un archivio
            statico completo e ti forniamo i tuoi contenuti in formato aperto.
          </p>

          <h2>Contenuti ammessi</h2>
          <p>
            Ogni contenuto passa da moderazione umana prima della pubblicazione e può essere
            segnalato da chiunque. Non sono ammessi: contenuti illegali, diffamatori, discriminatori,
            pornografici, propaganda elettorale, gioco d'azzardo, prodotti finanziari non
            autorizzati, malware o link ingannevoli. In caso di rifiuto rimborsiamo integralmente
            l'importo pagato.
          </p>

          <h2>Diritto di recesso</h2>
          <p>
            Hai quattordici giorni dall'acquisto per chiedere il rimborso integrale, senza dover
            motivare la richiesta. Scrivi a ciao@veronawall.it indicando l'email di acquisto.
          </p>

          <h2>Spostamenti e modifiche</h2>
          <p>
            Il contenuto del tuo spazio (nome, descrizione, immagine, link) è modificabile
            gratuitamente e senza limiti. La posizione sulla griglia è fissa: entro quattordici
            giorni la spostiamo gratis su un'area libera, in seguito con un contributo di 19 euro.
          </p>

          <h2>Dati personali</h2>
          <p>
            Trattiamo email, dati di fatturazione e statistiche aggregate di visita per la sola
            gestione del servizio. I pagamenti sono gestiti da Stripe: non conserviamo dati di carta.
            Puoi chiedere in qualunque momento accesso, rettifica o cancellazione dei tuoi dati
            scrivendo a ciao@veronawall.it. Le statistiche della wall sono aggregate e non
            identificano i visitatori.
          </p>

          <h2>Indipendenza</h2>
          <p>
            Verona Wall è un progetto privato e indipendente. Non è affiliato, sponsorizzato o
            approvato dal Comune di Verona o da alcun ente pubblico.
          </p>

          <p className="mono muted" style={{ marginTop: '2.5rem', fontSize: 11 }}>
            DOCUMENTO DA COMPLETARE CON RAGIONE SOCIALE, SEDE, P.IVA E FORO COMPETENTE PRIMA DEL
            LANCIO PUBBLICO. FARLO REVISIONARE DA UN LEGALE.
          </p>
        </div>
      </div>
    </section>
  )
}
