import { Link, NavLink } from 'react-router-dom'

export default function Nav() {
  return (
    <header className="nav">
      <Link to="/" className="nav-brand" aria-label="Verona Wall, home">
        <b>VERONA</b>
        <span>Wall</span>
      </Link>

      <nav className="nav-links">
        <NavLink to="/wall">La wall</NavLink>
        <a href="/#piani" className="hide-sm">
          Prezzi
        </a>
        <a href="/#domande" className="hide-sm">
          Domande
        </a>
        <NavLink to="/entra" className="hide-sm">
          Il mio spazio
        </NavLink>
        <Link to="/prendi-posto" className="btn btn-sm">
          Prendi posto
        </Link>
      </nav>
    </header>
  )
}
