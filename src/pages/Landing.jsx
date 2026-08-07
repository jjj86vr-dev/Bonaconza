import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import WallCanvas from '../components/WallCanvas'
import PlanCard from '../components/PlanCard'
import Reveal from '../components/Reveal'
import { fetchPlans, fetchWallSpaces, fetchWallStats, joinWaitlist } from '../lib/api'
import { number, price, captureReferral } from '../lib/format'

export default function Landing() {
  const navigate = useNavigate()
  const [plans, setPlans] = useState([])
  const [spaces, setSpaces] = useState([])
  const [stats, setStats] = useState(null)

  useEffect(() => {
    let alive = true
    Promise.all([fetchPlans(), fetchWallSpaces(), fetchWallStats()]).then(([p, s, st]) => {
      if (!alive) return
      setPlans(p)
      setSpaces(s)
      setStats(st)
    })
    return () => {
      alive = false
    }
  }, [])

  const cols = stats?.cols ?? 100
  const rows = stats?.total_rows ?? 60
  const total = stats?.total_cells ?? cols * rows
  const sold = stats?.sold_cells ?? 0
  const pct = total ? (sold / total) * 100 : 0
  const founder = plans.find((p) => p.code === 'founder')

  return (
    <>
      {/* ── HERO ─────────────────────────────────────────────────── */}
      <section className="section" style={{ paddingTop: 'clamp(3rem, 7vw, 5.5rem)' }}>
        <div className="shell">
          <div className="hero-grid">
            <div>
              <Reveal className="row" style={{ marginBottom: '1.8rem' }}>
                <span className="badge badge-live">
                  {stats ? `${number(sold)} celle già prese` : 'la wall è aperta'}
                </span>
                <span className="badge">Verona · dal 2026</span>
              </Reveal>

              <Reveal delay={80}>
                <h1 className="h-mega">
                  IL MURO
                  <br />
                  DI <span className="italic" style={{ color: 'var(--rosso-lux)' }}>VERONA</span>
                </h1>
              </Reveal>

              <Reveal delay={160}>
                <p className="lede" style={{ marginTop: '2rem' }}>
                  Una sola parete digitale. {number(total)} spazi, e non uno di più. Chi ne prende
                  uno mette il proprio logo, il proprio nome e il proprio link su Verona, e resta lì.
                  Nessun canone, nessuna scadenza, nessun algoritmo che decide se sei visibile.
                </p>
              </Reveal>

              <Reveal delay={240} className="row" style={{ marginTop: '2.4rem' }}>
                <Link to="/prendi-posto" className="btn">
                  Prendi il tuo posto
                  {founder && <span style={{ opacity: 0.75 }}>· da {price(founder.price_cents)}</span>}
                </Link>
                <Link to="/wall" className="btn btn-ghost">
                  Esplora la wall
                </Link>
              </Reveal>

              <Reveal delay={320} style={{ marginTop: '2.6rem', maxWidth: 420 }}>
                <div className="row" style={{ justifyContent: 'space-between', marginBottom: 8 }}>
                  <span className="mono muted">RIEMPIMENTO</span>
                  <span className="mono" style={{ color: 'var(--oro)' }}>
                    {pct.toFixed(1)}%
                  </span>
                </div>
                <div className="meter">
                  <i style={{ width: `${Math.max(pct, 1.5)}%` }} />
                </div>
                <p className="mono muted" style={{ marginTop: 10, fontSize: 11 }}>
                  QUANDO È PIENA, È PIENA. NON AGGIUNGIAMO CELLE.
                </p>
              </Reveal>
            </div>

            <Reveal delay={200} className="hero-wall wall-frame">
              <WallCanvas
                spaces={spaces}
                cols={cols}
                rows={rows}
                mode="view"
                onSelectSpace={() => navigate('/wall')}
              />
            </Reveal>
          </div>
        </div>
      </section>

      {/* ── NUMERI ───────────────────────────────────────────────── */}
      <section>
        <div className="figures">
          <div className="figure">
            <b>{number(total)}</b>
            <span>celle totali</span>
          </div>
          <div className="figure">
            <b>{number(sold)}</b>
            <span>già assegnate</span>
          </div>
          <div className="figure">
            <b>{number(stats?.free_cells ?? total - sold)}</b>
            <span>ancora libere</span>
          </div>
          <div className="figure">
            <b>1</b>
            <span>sola parete, per sempre</span>
          </div>
        </div>
      </section>

      {/* ── COS'E ────────────────────────────────────────────────── */}
      <section className="section marble">
        <div className="shell" style={{ position: 'relative', zIndex: 1 }}>
          <Reveal>
            <p className="eyebrow">Come funziona</p>
            <h2 className="h-xl" style={{ margin: '1.2rem 0 1.4rem' }}>
              Tre minuti.
              <br />
              Poi ci sei per sempre.
            </h2>
          </Reveal>

          <div className="steps" style={{ marginTop: '3.5rem' }}>
            <Reveal className="step" delay={0}>
              <h3>Scegli il tuo posto</h3>
              <p>
                Apri la wall, giri con il mouse, clicchi sulla cella che ti piace. Vicino
                all'Arena, in un angolo tranquillo, accanto a un amico: decidi tu. Nessuno potrà mai
                prendere quella posizione.
              </p>
            </Reveal>
            <Reveal className="step" delay={90}>
              <h3>Paghi una volta</h3>
              <p>
                Pagamento con carta, in venti secondi. Nessun abbonamento, nessun rinnovo
                automatico, nessuna sorpresa fra un anno. Ricevi fattura se ti serve.
              </p>
            </Reveal>
            <Reveal className="step" delay={180}>
              <h3>Costruisci la tua tessera</h3>
              <p>
                Carichi il logo, scrivi due righe, metti il link. Puoi cambiarlo quando vuoi. Chi
                clicca sul tuo spazio ti trova, e tu vedi quante visite hai ricevuto.
              </p>
            </Reveal>
          </div>

          <Reveal delay={240} style={{ marginTop: '3.5rem' }}>
            <Link to="/prendi-posto" className="btn">
              Voglio il mio posto
            </Link>
          </Reveal>
        </div>
      </section>

      {/* ── PERCHE ───────────────────────────────────────────────── */}
      <section className="section">
        <div className="shell">
          <div className="why-grid">
            <Reveal>
              <p className="eyebrow">Perché esiste</p>
              <h2 className="h-lg" style={{ margin: '1.2rem 0' }}>
                I social si dimenticano di te ogni ventiquattro ore.
              </h2>
              <p className="lede">
                Un post dura un giorno. Un cartellone costa duemila euro al mese. Una pagina web la
                trovi solo se sai già che esisti. La wall è l'unico posto dove metti una bandierina
                una volta e resta piantata: la tua attività, la tua associazione, il tuo nome,
                dentro la mappa di una città che la gente ha voglia di guardare.
              </p>
            </Reveal>

            <Reveal delay={120} className="stack" style={{ gap: '1px', background: 'var(--ink-line)' }}>
              {[
                ['Per un negozio', 'Chi cerca Verona ti trova senza passare da nessuna piattaforma.'],
                ['Per un professionista', 'Un biglietto da visita pubblico che non scade e non si perde.'],
                ['Per una associazione', 'Visibilita permanente con il budget di una cena in due.'],
                ['Per un veronese', 'Il tuo nome sul muro della tua città. Punto.'],
              ].map(([title, text]) => (
                <div key={title} style={{ background: 'var(--ink)', padding: '1.4rem 1.5rem' }}>
                  <strong style={{ display: 'block', marginBottom: 4 }}>{title}</strong>
                  <span style={{ color: 'var(--marmo-dim)', fontSize: 15 }}>{text}</span>
                </div>
              ))}
            </Reveal>
          </div>
        </div>
      </section>

      {/* ── PIANI ────────────────────────────────────────────────── */}
      <section className="section" id="piani">
        <div className="shell">
          <Reveal className="center" style={{ marginBottom: '3rem' }}>
            <p className="eyebrow">Quanto costa</p>
            <h2 className="h-xl" style={{ margin: '1.2rem auto 1.2rem', maxWidth: '16ch' }}>
              Si paga una volta sola.
            </h2>
            <p className="lede" style={{ marginInline: 'auto' }}>
              Più grande è il blocco, più si vede da lontano. Il prezzo del piano FONDATORE sale
              definitivamente quando i primi 200 sono finiti.
            </p>
          </Reveal>

          <Reveal delay={80} className="plans">
            {plans.map((plan) => (
              <PlanCard
                key={plan.code}
                plan={plan}
                as="div"
                onPick={() => navigate(`/prendi-posto?piano=${plan.code}`)}
              />
            ))}
          </Reveal>

          <Reveal delay={140} className="center" style={{ marginTop: '2.5rem' }}>
            <Link to="/prendi-posto" className="btn">
              Scegli il tuo blocco
            </Link>
            <p className="mono muted" style={{ marginTop: '1.2rem', fontSize: 11 }}>
              PAGAMENTO SICURO CON STRIPE · FATTURA SU RICHIESTA · RIMBORSO ENTRO 14 GIORNI
            </p>
          </Reveal>
        </div>
      </section>

      {/* ── FAQ ──────────────────────────────────────────────────── */}
      <section className="section marble" id="domande">
        <div className="shell" style={{ position: 'relative', zIndex: 1 }}>
          <Reveal>
            <p className="eyebrow">Domande legittime</p>
            <h2 className="h-xl" style={{ margin: '1.2rem 0 2.5rem' }}>
              Quelle che faremmo anche noi.
            </h2>
          </Reveal>

          <Reveal delay={80} className="faq">
            {FAQ.map(([question, answer]) => (
              <details key={question}>
                <summary>{question}</summary>
                <p>{answer}</p>
              </details>
            ))}
          </Reveal>
        </div>
      </section>

      {/* ── CHIUSURA ─────────────────────────────────────────────── */}
      <section className="section">
        <div className="shell center">
          <Reveal>
            <h2 className="h-xl" style={{ maxWidth: '18ch', marginInline: 'auto' }}>
              Fra un anno la wall sarà piena.
              <br />
              <span className="italic" style={{ color: 'var(--oro)' }}>
                Dove sarai tu?
              </span>
            </h2>
          </Reveal>

          <Reveal delay={100} style={{ marginTop: '2.5rem' }}>
            <Link to="/prendi-posto" className="btn">
              Prendi il tuo posto ora
            </Link>
          </Reveal>

          <Reveal delay={180} style={{ marginTop: '4rem', maxWidth: 460, marginInline: 'auto' }}>
            <hr className="rule" style={{ marginBottom: '2.5rem' }} />
            <WaitlistForm />
          </Reveal>
        </div>
      </section>
    </>
  )
}

const FAQ = [
  [
    'Permanente vuol dire davvero per sempre?',
    'Vuol dire che non c\'è nessun canone e nessuna scadenza: paghi una volta e lo spazio resta tuo. Non promettiamo l\'eternità, perché nessuno può: ci impegniamo per contratto a tenere la wall online almeno dieci anni. Se un giorno il progetto dovesse chiudere, pubblichiamo l\'archivio completo e restituiamo il file dei contenuti a tutti.',
  ],
  [
    'Cosa succede se sbaglio posizione?',
    'Entro 14 giorni dall\'acquisto ti spostiamo gratis dove vuoi, se il posto e libero. Dopo, lo spostamento costa 19 euro. Il contenuto invece lo cambi quando vuoi, gratis, quante volte vuoi.',
  ],
  [
    'Chi controlla cosa finisce sulla wall?',
    'Ogni spazio passa da una moderazione umana prima di diventare pubblico, e chiunque può segnalare un contenuto. Niente contenuti illegali, offensivi, politici in campagna elettorale, o siti truffa. Se rifiutiamo, rimborsiamo tutto.',
  ],
  [
    'Serve avere una partita IVA?',
    'No. Comprano spazi anche privati cittadini, studenti, associazioni. Se ti serve la fattura, la chiedi in fase di acquisto e te la mandiamo.',
  ],
  [
    'Ma la gente ci verrà davvero a guardare?',
    'È la domanda giusta. La wall non vive di traffico casuale: vive del fatto che ogni persona che compra uno spazio lo mostra ai suoi. Per questo ogni proprietario riceve una immagine pronta da postare e un link personale che gli riconosce il 20% su chi entra grazie a lui. Il muro cresce perché chi ci sta dentro ha interesse a farlo vedere.',
  ],
  [
    'Perché dovrei fidarmi adesso che siete all\'inizio?',
    'Perché il rischio è proporzionato: costa meno di una cena e hai 14 giorni per ripensarci. E perché essere all\'inizio è esattamente il motivo per cui prendi la posizione migliore al prezzo più basso che ci sarà mai.',
  ],
]

function WaitlistForm() {
  const [email, setEmail] = useState('')
  const [state, setState] = useState({ status: 'idle', message: '' })

  const submit = async (event) => {
    event.preventDefault()
    setState({ status: 'loading', message: '' })
    try {
      await joinWaitlist({ email, source: 'landing', ref: captureReferral() })
      setState({ status: 'ok', message: 'Ci sei. Ti scriviamo solo quando serve davvero.' })
      setEmail('')
    } catch (error) {
      setState({ status: 'error', message: error.message })
    }
  }

  if (state.status === 'ok') {
    return <p className="notice notice-ok">{state.message}</p>
  }

  return (
    <form onSubmit={submit}>
      <p className="mono muted" style={{ fontSize: 11, marginBottom: '1rem' }}>
        NON SEI PRONTO? LASCIA L'EMAIL, TI AVVISIAMO PRIMA DEI RINCARI.
      </p>
      <div className="row" style={{ flexWrap: 'nowrap' }}>
        <input
          className="input"
          type="email"
          required
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          placeholder="la-tua@email.it"
          aria-label="Indirizzo email"
        />
        <button className="btn btn-gold" disabled={state.status === 'loading'}>
          {state.status === 'loading' ? '···' : 'Avvisami'}
        </button>
      </div>
      {state.status === 'error' && (
        <p className="notice notice-error" style={{ marginTop: '1rem' }}>
          {state.message}
        </p>
      )}
    </form>
  )
}
