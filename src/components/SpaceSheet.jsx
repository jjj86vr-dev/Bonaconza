import { useEffect } from 'react'
import { logoUrl } from '../lib/supabase'
import { trackSpaceEvent, reportSpace } from '../lib/api'

/** Pannello laterale con i dettagli di uno spazio della wall. */
export default function SpaceSheet({ space, onClose }) {
  useEffect(() => {
    if (!space) return
    trackSpaceEvent(space.id, 'view').catch(() => {})

    const onKey = (event) => {
      if (event.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [space, onClose])

  if (!space) return null

  const image = logoUrl(space.logo_path)

  return (
    <>
      <div className="sheet-backdrop" onClick={onClose} aria-hidden="true" />
      <aside className="sheet" role="dialog" aria-modal="true" aria-label={space.title || 'Spazio'}>
        <button type="button" className="sheet-close" onClick={onClose} aria-label="Chiudi">
          ×
        </button>

        <p className="mono muted" style={{ letterSpacing: '0.18em' }}>
          POSIZIONE {space.x} · {space.y} — {space.w}×{space.h}
        </p>

        {image ? (
          <img className="sheet-logo" src={image} alt="" style={{ marginTop: '1.4rem' }} />
        ) : (
          <div
            className="sheet-logo"
            style={{ marginTop: '1.4rem', background: space.bg_color || 'var(--ink-3)' }}
          />
        )}

        <h2 className="h-md" style={{ marginBottom: '0.7rem' }}>
          {space.title || 'Spazio riservato'}
        </h2>

        {space.description && (
          <p style={{ color: 'var(--marmo-dim)', fontSize: 15.5 }}>{space.description}</p>
        )}

        {space.link_url && (
          <a
            className="btn btn-ghost btn-block"
            href={space.link_url}
            target="_blank"
            rel="noopener noreferrer nofollow"
            style={{ marginTop: '1.6rem' }}
            onClick={() => trackSpaceEvent(space.id, 'click').catch(() => {})}
          >
            Visita
          </a>
        )}

        <hr className="rule" style={{ margin: '2rem 0 1.2rem' }} />

        <button
          type="button"
          className="mono muted"
          style={{ background: 'none', border: 0, cursor: 'pointer', padding: 0, fontSize: 11 }}
          onClick={async () => {
            const reason = window.prompt('Perché segnali questo spazio?')
            if (!reason) return
            try {
              await reportSpace({ spaceId: space.id, reason })
              window.alert('Grazie. Lo controlliamo entro 24 ore.')
            } catch {
              window.alert('Segnalazione non inviata. Riprova.')
            }
          }}
        >
          SEGNALA CONTENUTO
        </button>
      </aside>
    </>
  )
}
