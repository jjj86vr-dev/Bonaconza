import { useEffect, useRef, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { fetchOrderStatus } from '../lib/api'
import { price } from '../lib/format'

/**
 * Stripe rimanda qui prima che il webhook sia stato elaborato:
 * facciamo polling finche' l'ordine non risulta pagato.
 */
export default function Success() {
  const [params] = useSearchParams()
  const sessionId = params.get('session_id')
  const [order, setOrder] = useState(null)
  const [state, setState] = useState('loading')
  const attempts = useRef(0)

  useEffect(() => {
    if (!sessionId) {
      setState('missing')
      return
    }

    let timer
    let alive = true

    const poll = async () => {
      const data = await fetchOrderStatus(sessionId)
      if (!alive) return

      if (data?.status === 'paid') {
        setOrder(data)
        setState('paid')
        return
      }

      attempts.current += 1
      if (attempts.current > 15) {
        setOrder(data)
        setState('slow')
        return
      }
      timer = setTimeout(poll, 2000)
    }

    poll()
    return () => {
      alive = false
      clearTimeout(timer)
    }
  }, [sessionId])

  return (
    <section className="section" style={{ minHeight: '70vh', display: 'grid', placeItems: 'center' }}>
      <div className="shell center" style={{ maxWidth: 620 }}>
        {state === 'loading' && (
          <>
            <p className="eyebrow">Un momento</p>
            <h1 className="h-xl" style={{ margin: '1.2rem 0' }}>
              Stiamo posando il tuo mattone.
            </h1>
            <div className="meter" style={{ maxWidth: 260, margin: '2rem auto' }}>
              <i style={{ width: '70%' }} />
            </div>
            <p className="muted">Non chiudere questa pagina.</p>
          </>
        )}

        {state === 'paid' && (
          <>
            <p className="eyebrow">Fatto</p>
            <h1 className="h-mega" style={{ fontSize: 'clamp(3rem,9vw,6rem)', margin: '1rem 0' }}>
              SEI SUL
              <br />
              MURO.
            </h1>
            {order?.space && (
              <p className="lede" style={{ marginInline: 'auto' }}>
                Posizione <strong>x {order.space.x} · y {order.space.y}</strong>, blocco{' '}
                {order.space.w}×{order.space.h}. Da adesso è tuo.
              </p>
            )}
            <p className="muted" style={{ marginTop: '1.5rem' }}>
              Abbiamo mandato a <strong>{order?.email}</strong> il link per caricare logo,
              descrizione e collegamento. Controlla anche lo spam.
            </p>

            <div className="row" style={{ justifyContent: 'center', marginTop: '2.5rem' }}>
              <Link to="/entra" className="btn">
                Completa il tuo spazio
              </Link>
              <Link to="/wall" className="btn btn-ghost">
                Vedi la wall
              </Link>
            </div>

            {order?.amountCents ? (
              <p className="mono muted" style={{ marginTop: '2rem', fontSize: 11 }}>
                ORDINE {order.planCode?.toUpperCase()} · {price(order.amountCents)}
              </p>
            ) : null}
          </>
        )}

        {state === 'slow' && (
          <>
            <p className="eyebrow">Quasi</p>
            <h1 className="h-lg" style={{ margin: '1.2rem 0' }}>
              Il pagamento è partito, la conferma sta arrivando.
            </h1>
            <p className="lede" style={{ marginInline: 'auto' }}>
              A volte la banca ci mette qualche minuto in più. Riceverai comunque l'email di
              conferma: se entro un'ora non arriva, scrivici e sistemiamo.
            </p>
            <a className="btn btn-ghost" href="mailto:ciao@veronawall.it" style={{ marginTop: '2rem' }}>
              Scrivici
            </a>
          </>
        )}

        {state === 'missing' && (
          <>
            <h1 className="h-lg" style={{ marginBottom: '1.2rem' }}>
              Non troviamo questo ordine.
            </h1>
            <Link to="/prendi-posto" className="btn">
              Torna alla scelta del posto
            </Link>
          </>
        )}
      </div>
    </section>
  )
}
