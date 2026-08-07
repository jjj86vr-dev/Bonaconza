import { Link } from 'react-router-dom'

export default function NotFound() {
  return (
    <section className="section" style={{ minHeight: '70vh', display: 'grid', placeItems: 'center' }}>
      <div className="shell center">
        <p className="eyebrow">404</p>
        <h1 className="h-mega" style={{ fontSize: 'clamp(3rem,10vw,7rem)', margin: '1rem 0' }}>
          CELLA
          <br />
          VUOTA.
        </h1>
        <p className="lede" style={{ marginInline: 'auto' }}>
          Questa pagina non esiste. Sulla wall, pero, di celle vuote ce ne sono ancora parecchie.
        </p>
        <Link to="/wall" className="btn" style={{ marginTop: '2rem' }}>
          Vai alla wall
        </Link>
      </div>
    </section>
  )
}
