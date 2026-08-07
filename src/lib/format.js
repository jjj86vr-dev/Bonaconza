const eur = new Intl.NumberFormat('it-IT', {
  style: 'currency',
  currency: 'EUR',
  maximumFractionDigits: 0,
})

const eurCents = new Intl.NumberFormat('it-IT', {
  style: 'currency',
  currency: 'EUR',
})

export function price(cents) {
  return cents % 100 === 0 ? eur.format(cents / 100) : eurCents.format(cents / 100)
}

export const number = (n) => new Intl.NumberFormat('it-IT').format(n ?? 0)

export function dateShort(value) {
  if (!value) return '—'
  return new Intl.DateTimeFormat('it-IT', { day: 'numeric', month: 'short', year: 'numeric' }).format(
    new Date(value),
  )
}

/** Il codice referral viaggia in querystring e resta in localStorage. */
export function captureReferral() {
  if (typeof window === 'undefined') return null
  const fromUrl = new URLSearchParams(window.location.search).get('ref')
  if (fromUrl) {
    const clean = fromUrl.trim().toUpperCase().slice(0, 16)
    try {
      localStorage.setItem('vw_ref', clean)
    } catch {
      /* storage bloccato: non è un problema */
    }
    return clean
  }
  try {
    return localStorage.getItem('vw_ref')
  } catch {
    return null
  }
}
