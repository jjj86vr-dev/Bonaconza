import { useCallback, useEffect, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import WallCanvas from '../components/WallCanvas'
import PlanCard from '../components/PlanCard'
import {
  checkAreaFree,
  createCheckout,
  fetchOccupiedCells,
  fetchPlans,
  fetchWallSpaces,
  fetchWallStats,
  suggestFreeArea,
} from '../lib/api'
import { captureReferral, price } from '../lib/format'
import { isConfigured } from '../lib/supabase'

export default function Claim() {
  const [params, setParams] = useSearchParams()

  const [plans, setPlans] = useState([])
  const [spaces, setSpaces] = useState([])
  const [occupied, setOccupied] = useState([])
  const [config, setConfig] = useState({ cols: 100, rows: 60 })

  const [planCode, setPlanCode] = useState(params.get('piano') || '')
  const [position, setPosition] = useState(null)
  const [positionFree, setPositionFree] = useState(null)

  const [email, setEmail] = useState('')
  const [businessName, setBusinessName] = useState('')
  const [vat, setVat] = useState('')
  const [wantsInvoice, setWantsInvoice] = useState(false)
  const [accepted, setAccepted] = useState(false)

  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    let alive = true
    Promise.all([fetchPlans(), fetchWallSpaces(), fetchOccupiedCells(), fetchWallStats()]).then(
      ([p, s, o, st]) => {
        if (!alive) return
        setPlans(p)
        setSpaces(s)
        setOccupied(o)
        if (st) setConfig({ cols: st.cols, rows: st.total_rows })
        if (!planCode && p.length) setPlanCode(p[0].code)
      },
    )
    return () => {
      alive = false
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const plan = plans.find((p) => p.code === planCode) || null
  const size = plan ? { w: plan.w, h: plan.h } : { w: 1, h: 1 }

  /* Cambiando piano la vecchia posizione può non essere più valida. */
  useEffect(() => {
    if (!plan || !position) return
    let alive = true
    checkAreaFree({ x: position.x, y: position.y, w: plan.w, h: plan.h }).then((free) => {
      if (alive) setPositionFree(free)
    })
    return () => {
      alive = false
    }
  }, [plan, position])

  const choosePlan = (next) => {
    setPlanCode(next.code)
    setParams({ piano: next.code }, { replace: true })
    setError('')
  }

  const pickRandom = useCallback(async () => {
    if (!plan) return
    setBusy(true)
    const spot = await suggestFreeArea({ w: plan.w, h: plan.h })
    setBusy(false)
    if (spot) {
      setPosition(spot)
      setPositionFree(true)
    } else {
      setError('Non troviamo un blocco libero di questa misura. Prova una misura più piccola.')
    }
  }, [plan])

  const canPay = plan && position && positionFree && email.includes('@') && accepted && !busy

  const submit = async (event) => {
    event.preventDefault()
    if (!canPay) return
    setBusy(true)
    setError('')

    try {
      const { url } = await createCheckout({
        email: email.trim(),
        planCode: plan.code,
        x: position.x,
        y: position.y,
        referral: captureReferral(),
        businessName: wantsInvoice ? businessName : null,
        vat: wantsInvoice ? vat : null,
      })
      window.location.href = url
    } catch (requestError) {
      setBusy(false)
      setError(requestError.message)
      if (requestError.code === 'AREA_TAKEN') {
        setPositionFree(false)
        fetchOccupiedCells().then(setOccupied)
      }
    }
  }

  return (
    <section className="section" style={{ paddingTop: '3rem' }}>
      <div className="shell">
        <p className="eyebrow">Prendi posto</p>
        <h1 className="h-xl" style={{ margin: '1rem 0 2.5rem', maxWidth: '18ch' }}>
          Tre scelte e sei sul muro.
        </h1>

        {!isConfigured && (
          <p className="notice" style={{ marginBottom: '2rem' }}>
            Modalità dimostrativa: il backend non è configurato, il pagamento non partirà.
          </p>
        )}

        <form onSubmit={submit}>
          {/* ── 1. Piano ──────────────────────────────────────────── */}
          <StepTitle n="01" title="Che misura vuoi occupare?" />
          <div className="plans" style={{ marginBottom: '3.5rem' }}>
            {plans.map((item) => (
              <PlanCard
                key={item.code}
                plan={item}
                picked={item.code === planCode}
                onPick={choosePlan}
              />
            ))}
          </div>

          {/* ── 2. Posizione ──────────────────────────────────────── */}
          <StepTitle n="02" title="Dove lo vuoi, esattamente?" />
          <div className="split" style={{ marginBottom: '3.5rem' }}>
            <div className="wall-frame" style={{ height: 'clamp(360px, 55vh, 620px)' }}>
              <WallCanvas
                spaces={spaces}
                occupied={occupied}
                cols={config.cols}
                rows={config.rows}
                mode="pick"
                pickSize={size}
                selection={position}
                onPick={({ x, y, free }) => {
                  setPosition({ x, y })
                  setPositionFree(free)
                  setError('')
                }}
              />
            </div>

            <div className="card">
              <p className="mono muted" style={{ fontSize: 11, marginBottom: '1rem' }}>
                CLICCA UNA CELLA LIBERA SULLA WALL
              </p>

              {position ? (
                <>
                  <p className="h-md" style={{ marginBottom: '0.4rem' }}>
                    x {position.x} · y {position.y}
                  </p>
                  <p className={positionFree ? 'notice notice-ok' : 'notice notice-error'}>
                    {positionFree === null
                      ? 'Verifica in corso…'
                      : positionFree
                        ? `Blocco ${size.w}×${size.h} libero. È tuo se lo prendi ora.`
                        : 'Qui non ci sta: la zona è già occupata. Scegli un altro punto.'}
                  </p>
                </>
              ) : (
                <p style={{ color: 'var(--marmo-dim)', fontSize: 15 }}>
                  Nessuna posizione scelta. Puoi cliccare sulla wall oppure lasciar decidere a noi.
                </p>
              )}

              <button
                type="button"
                className="btn btn-ghost btn-block"
                style={{ marginTop: '1.4rem' }}
                onClick={pickRandom}
                disabled={busy || !plan}
              >
                Scegli tu per me
              </button>
            </div>
          </div>

          {/* ── 3. Dati e pagamento ───────────────────────────────── */}
          <StepTitle n="03" title="Ultimo passo." />
          <div className="split">
            <div>
              <label className="field">
                <span>Email — ci mandiamo il link per gestire lo spazio</span>
                <input
                  className="input"
                  type="email"
                  required
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  placeholder="la-tua@email.it"
                  autoComplete="email"
                />
              </label>

              <label className="row" style={{ gap: '0.6rem', marginBottom: '1rem' }}>
                <input
                  type="checkbox"
                  checked={wantsInvoice}
                  onChange={(event) => setWantsInvoice(event.target.checked)}
                />
                <span style={{ fontSize: 15 }}>Mi serve la fattura</span>
              </label>

              {wantsInvoice && (
                <>
                  <label className="field">
                    <span>Ragione sociale</span>
                    <input
                      className="input"
                      value={businessName}
                      onChange={(event) => setBusinessName(event.target.value)}
                      required={wantsInvoice}
                    />
                  </label>
                  <label className="field">
                    <span>Partita IVA o codice fiscale</span>
                    <input
                      className="input"
                      value={vat}
                      onChange={(event) => setVat(event.target.value)}
                      required={wantsInvoice}
                    />
                  </label>
                </>
              )}

              <label className="row" style={{ gap: '0.6rem', alignItems: 'start' }}>
                <input
                  type="checkbox"
                  checked={accepted}
                  onChange={(event) => setAccepted(event.target.checked)}
                  style={{ marginTop: 5 }}
                />
                <span style={{ fontSize: 14.5, color: 'var(--marmo-dim)' }}>
                  Ho letto le <a href="/note-legali">note legali</a> e accetto che il contenuto passi
                  da moderazione prima di diventare pubblico.
                </span>
              </label>
            </div>

            <div className="card">
              <p className="mono muted" style={{ fontSize: 11, marginBottom: '1.2rem' }}>
                RIEPILOGO
              </p>

              <Line label="Piano" value={plan ? plan.name : '—'} />
              <Line label="Misura" value={plan ? `${plan.w}×${plan.h} celle` : '—'} />
              <Line
                label="Posizione"
                value={position ? `x ${position.x} · y ${position.y}` : 'da scegliere'}
              />

              <hr className="rule" style={{ margin: '1.2rem 0' }} />

              <div className="row" style={{ justifyContent: 'space-between' }}>
                <span className="mono muted">TOTALE</span>
                <strong className="h-md">{plan ? price(plan.price_cents) : '—'}</strong>
              </div>
              <p className="mono muted" style={{ fontSize: 10.5, marginTop: 6 }}>
                UNA TANTUM · IVA INCLUSA
              </p>

              {error && (
                <p className="notice notice-error" style={{ marginTop: '1.2rem' }}>
                  {error}
                </p>
              )}

              <button className="btn btn-block" style={{ marginTop: '1.4rem' }} disabled={!canPay}>
                {busy ? 'Un attimo…' : 'Vai al pagamento'}
              </button>

              <p className="mono muted" style={{ fontSize: 10, marginTop: '1rem', lineHeight: 1.7 }}>
                PAGAMENTO GESTITO DA STRIPE. LA CELLA RESTA BLOCCATA PER TE PER 20 MINUTI.
                RIMBORSO INTEGRALE ENTRO 14 GIORNI.
              </p>
            </div>
          </div>
        </form>
      </div>
    </section>
  )
}

function StepTitle({ n, title }) {
  return (
    <div className="row" style={{ gap: '1rem', marginBottom: '1.5rem' }}>
      <span className="mono" style={{ color: 'var(--rosso-lux)', fontSize: 13 }}>
        {n}
      </span>
      <h2 className="h-md">{title}</h2>
      <hr className="rule" style={{ flex: 1 }} />
    </div>
  )
}

function Line({ label, value }) {
  return (
    <div className="row" style={{ justifyContent: 'space-between', marginBottom: '0.6rem' }}>
      <span className="mono muted" style={{ fontSize: 11 }}>
        {label.toUpperCase()}
      </span>
      <span style={{ fontSize: 15 }}>{value}</span>
    </div>
  )
}
