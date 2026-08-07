import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { supabase, isConfigured, logoUrl } from '../lib/supabase'
import {
  fetchMySpaces,
  fetchSpaceStats,
  updateSpaceContent,
  uploadLogo,
} from '../lib/api'
import { dateShort, number } from '../lib/format'

export default function Manage() {
  const [session, setSession] = useState(null)
  const [loading, setLoading] = useState(true)
  const [spaces, setSpaces] = useState([])
  const [active, setActive] = useState(null)

  useEffect(() => {
    if (!isConfigured) {
      setLoading(false)
      return
    }

    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session)
      setLoading(false)
    })

    const { data: listener } = supabase.auth.onAuthStateChange((_event, next) => {
      setSession(next)
    })
    return () => listener.subscription.unsubscribe()
  }, [])

  useEffect(() => {
    if (!session) return
    fetchMySpaces()
      .then((rows) => {
        setSpaces(rows)
        setActive((current) => current ?? rows[0] ?? null)
      })
      .catch(() => setSpaces([]))
  }, [session])

  if (loading) {
    return (
      <section className="section">
        <div className="shell">
          <div className="skeleton" style={{ height: 220 }} />
        </div>
      </section>
    )
  }

  if (!session) {
    return (
      <section className="section" style={{ minHeight: '60vh', display: 'grid', placeItems: 'center' }}>
        <div className="shell center" style={{ maxWidth: 420 }}>
          <h1 className="h-lg" style={{ marginBottom: '1rem' }}>
            Devi entrare per gestire il tuo spazio.
          </h1>
          <Link to="/entra" className="btn">
            Vai all'accesso
          </Link>
        </div>
      </section>
    )
  }

  return (
    <section className="section" style={{ paddingTop: '2.5rem' }}>
      <div className="shell">
        <div className="row" style={{ justifyContent: 'space-between', marginBottom: '2rem' }}>
          <div>
            <p className="eyebrow">Il tuo spazio</p>
            <h1 className="h-lg" style={{ marginTop: '0.8rem' }}>
              Ciao, {session.user.email}
            </h1>
          </div>
          <button
            type="button"
            className="btn btn-ghost btn-sm"
            onClick={() => supabase.auth.signOut()}
          >
            Esci
          </button>
        </div>

        {spaces.length === 0 ? (
          <div className="card">
            <p style={{ marginBottom: '1.2rem' }}>
              Con questa email non risulta nessuno spazio. Se hai comprato con un altro indirizzo,
              accedi con quello.
            </p>
            <Link to="/prendi-posto" className="btn">
              Prendi il tuo posto
            </Link>
          </div>
        ) : (
          <div className="split">
            <div>
              {spaces.map((space) => (
                <button
                  key={space.id}
                  type="button"
                  className="space-row"
                  onClick={() => setActive(space)}
                  style={{ opacity: active?.id === space.id ? 1 : 0.62 }}
                >
                  {space.logo_path ? (
                    <img className="space-thumb" src={logoUrl(space.logo_path)} alt="" />
                  ) : (
                    <span
                      className="space-thumb"
                      style={{ background: space.bg_color || 'var(--ink-3)' }}
                    />
                  )}
                  <span>
                    <strong style={{ display: 'block' }}>{space.title || 'Senza titolo'}</strong>
                    <span className="mono muted" style={{ fontSize: 11 }}>
                      x {space.x} · y {space.y} · {space.w}×{space.h} ·{' '}
                      {space.plan_code.toUpperCase()}
                    </span>
                  </span>
                  <ModerationTag value={space.moderation} status={space.status} />
                </button>
              ))}
            </div>

            {active && (
              <SpaceEditor
                key={active.id}
                space={active}
                onSaved={(patch) => {
                  setSpaces((rows) =>
                    rows.map((row) => (row.id === active.id ? { ...row, ...patch } : row)),
                  )
                  setActive((current) => ({ ...current, ...patch }))
                }}
              />
            )}
          </div>
        )}
      </div>
    </section>
  )
}

function ModerationTag({ value, status }) {
  if (status !== 'active') return <span className="tag tag-pending">in attesa</span>
  if (value === 'approved') return <span className="tag tag-ok">online</span>
  if (value === 'rejected') return <span className="tag tag-bad">rifiutato</span>
  return <span className="tag tag-pending">in revisione</span>
}

function SpaceEditor({ space, onSaved }) {
  const [form, setForm] = useState({
    title: space.title || '',
    description: space.description || '',
    link_url: space.link_url || '',
    bg_color: space.bg_color || '#b4232a',
    category: space.category || '',
  })
  const [file, setFile] = useState(null)
  const [stats, setStats] = useState([])
  const [state, setState] = useState({ status: 'idle', message: '' })

  useEffect(() => {
    fetchSpaceStats(space.id).then(setStats)
  }, [space.id])

  const set = (key) => (event) => setForm((current) => ({ ...current, [key]: event.target.value }))

  const save = async (event) => {
    event.preventDefault()
    setState({ status: 'saving', message: '' })

    try {
      const patch = { ...form, link_url: form.link_url.trim() || null }

      if (patch.link_url && !/^https?:\/\//i.test(patch.link_url)) {
        patch.link_url = `https://${patch.link_url}`
      }

      if (file) {
        if (file.size > 2 * 1024 * 1024) {
          throw new Error('Il file supera 2 MB. Comprimilo e riprova.')
        }
        patch.logo_path = await uploadLogo(space.id, file)
      }

      await updateSpaceContent(space.id, patch)
      onSaved(patch)
      setFile(null)
      setState({
        status: 'ok',
        message: 'Salvato. Torna online appena passa la moderazione (di solito poche ore).',
      })
    } catch (error) {
      setState({ status: 'error', message: error.message })
    }
  }

  const totals = stats.reduce(
    (acc, row) => ({ views: acc.views + row.views, clicks: acc.clicks + row.clicks }),
    { views: 0, clicks: 0 },
  )

  return (
    <form className="card" onSubmit={save}>
      <p className="mono muted" style={{ fontSize: 11, marginBottom: '1.4rem' }}>
        CONTENUTO DELLO SPAZIO
      </p>

      <label className="field">
        <span>Nome</span>
        <input className="input" value={form.title} onChange={set('title')} maxLength={60} required />
      </label>

      <label className="field">
        <span>Descrizione — massimo 180 caratteri</span>
        <textarea
          className="input"
          value={form.description}
          onChange={set('description')}
          maxLength={180}
          rows={3}
        />
        <span className="mono muted" style={{ fontSize: 10 }}>
          {form.description.length}/180
        </span>
      </label>

      <label className="field">
        <span>Link</span>
        <input
          className="input"
          value={form.link_url}
          onChange={set('link_url')}
          placeholder="https://…"
          inputMode="url"
        />
      </label>

      <label className="field">
        <span>Logo o foto — PNG, JPG, WEBP o SVG, massimo 2 MB</span>
        <input
          className="input"
          type="file"
          accept="image/png,image/jpeg,image/webp,image/svg+xml"
          onChange={(event) => setFile(event.target.files?.[0] ?? null)}
        />
      </label>

      <label className="field">
        <span>Colore di sfondo</span>
        <input
          className="input"
          type="color"
          value={form.bg_color}
          onChange={set('bg_color')}
          style={{ height: 46, padding: 4 }}
        />
      </label>

      <button className="btn btn-block" disabled={state.status === 'saving'}>
        {state.status === 'saving' ? 'Salvo…' : 'Salva le modifiche'}
      </button>

      {state.message && (
        <p
          className={`notice ${state.status === 'error' ? 'notice-error' : 'notice-ok'}`}
          style={{ marginTop: '1rem' }}
        >
          {state.message}
        </p>
      )}

      <hr className="rule" style={{ margin: '2rem 0 1.4rem' }} />

      <p className="mono muted" style={{ fontSize: 11, marginBottom: '1rem' }}>
        ULTIMI 30 GIORNI
      </p>
      <div className="row" style={{ gap: '2.5rem' }}>
        <div>
          <strong className="h-md">{number(totals.views)}</strong>
          <p className="mono muted" style={{ fontSize: 10 }}>
            VISUALIZZAZIONI
          </p>
        </div>
        <div>
          <strong className="h-md">{number(totals.clicks)}</strong>
          <p className="mono muted" style={{ fontSize: 10 }}>
            CLICK SUL LINK
          </p>
        </div>
      </div>

      <p className="mono muted" style={{ fontSize: 10, marginTop: '1.4rem' }}>
        ATTIVO DAL {dateShort(space.activated_at).toUpperCase()}
      </p>
    </form>
  )
}
