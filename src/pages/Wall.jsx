import { useEffect, useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import WallCanvas from '../components/WallCanvas'
import SpaceSheet from '../components/SpaceSheet'
import { fetchOccupiedCells, fetchWallSpaces, fetchWallStats } from '../lib/api'
import { number } from '../lib/format'

export default function Wall() {
  const navigate = useNavigate()
  const [spaces, setSpaces] = useState([])
  const [occupied, setOccupied] = useState([])
  const [stats, setStats] = useState(null)
  const [selected, setSelected] = useState(null)
  const [query, setQuery] = useState('')

  useEffect(() => {
    let alive = true
    Promise.all([fetchWallSpaces(), fetchOccupiedCells(), fetchWallStats()]).then(
      ([s, o, st]) => {
        if (!alive) return
        setSpaces(s)
        setOccupied(o)
        setStats(st)
      },
    )
    return () => {
      alive = false
    }
  }, [])

  const results = useMemo(() => {
    const term = query.trim().toLowerCase()
    if (term.length < 2) return []
    return spaces
      .filter((s) => `${s.title || ''} ${s.description || ''}`.toLowerCase().includes(term))
      .slice(0, 6)
  }, [query, spaces])

  const cols = stats?.cols ?? 100
  const rows = stats?.total_rows ?? 60

  return (
    <div className="wall-page">
      <div className="wall-bar">
        <div className="row" style={{ gap: '0.7rem' }}>
          <span className="badge badge-live">
            {number(stats?.sold_cells ?? 0)} / {number(stats?.total_cells ?? cols * rows)} celle
          </span>
          <span className="mono muted hide-sm" style={{ fontSize: 11 }}>
            TRASCINA PER MUOVERTI · ROTELLA PER LO ZOOM
          </span>
        </div>

        <div className="wall-search">
          <input
            className="input"
            placeholder="Cerca sulla wall…"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            aria-label="Cerca uno spazio"
          />
          {results.length > 0 && (
            <ul className="wall-results">
              {results.map((space) => (
                <li key={space.id}>
                  <button
                    type="button"
                    onClick={() => {
                      setSelected(space)
                      setQuery('')
                    }}
                  >
                    <strong>{space.title || 'Spazio'}</strong>
                    <span className="mono muted">
                      {space.x} · {space.y}
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>

        <Link to="/prendi-posto" className="btn btn-sm">
          Prendi posto
        </Link>
      </div>

      <div className="wall-stage">
        <WallCanvas
          spaces={spaces}
          occupied={occupied}
          cols={cols}
          rows={rows}
          mode="view"
          onSelectSpace={setSelected}
        />
      </div>

      <SpaceSheet space={selected} onClose={() => setSelected(null)} />

      {spaces.length === 0 && (
        <div className="wall-empty">
          <p className="eyebrow">La wall è vuota</p>
          <h2 className="h-lg" style={{ margin: '1rem 0 1.5rem' }}>
            Non c'e ancora nessuno.
            <br />
            Puoi essere il primo.
          </h2>
          <button type="button" className="btn" onClick={() => navigate('/prendi-posto')}>
            Prendi la cella numero uno
          </button>
        </div>
      )}
    </div>
  )
}
