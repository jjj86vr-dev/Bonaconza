import { Link } from 'react-router-dom'

export default function Footer() {
  return (
    <footer className="footer">
      <div className="shell footer-grid">
        <div>
          <div className="nav-brand" style={{ marginBottom: '0.9rem' }}>
            <b>VERONA</b>
            <span>Wall</span>
          </div>
          <p style={{ maxWidth: '34ch' }}>
            La parete digitale permanente della città di Verona. Un posto, il tuo nome, per sempre.
          </p>
        </div>

        <div>
          <h4>Progetto</h4>
          <ul>
            <li>
              <Link to="/wall">La wall</Link>
            </li>
            <li>
              <a href="/#piani">Prezzi</a>
            </li>
            <li>
              <a href="/#domande">Domande</a>
            </li>
          </ul>
        </div>

        <div>
          <h4>Il tuo spazio</h4>
          <ul>
            <li>
              <Link to="/prendi-posto">Prendi posto</Link>
            </li>
            <li>
              <Link to="/entra">Accedi</Link>
            </li>
            <li>
              <Link to="/gestisci">Modifica</Link>
            </li>
          </ul>
        </div>

        <div>
          <h4>Contatti</h4>
          <ul>
            <li>
              <a href="mailto:ciao@veronawall.it">ciao@veronawall.it</a>
            </li>
            <li>
              <Link to="/note-legali">Note legali</Link>
            </li>
          </ul>
        </div>
      </div>

      <div className="shell" style={{ marginTop: '2.5rem', fontSize: 12.5 }}>
        <hr className="rule" style={{ marginBottom: '1.5rem' }} />
        <p>
          © {new Date().getFullYear()} Verona Wall — Progetto indipendente, non affiliato al Comune
          di Verona.
        </p>
      </div>
    </footer>
  )
}
