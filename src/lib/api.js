import { supabase, isConfigured } from './supabase'

/* ── Dati dimostrativi ──────────────────────────────────────────────
   Senza backend configurato il sito resta completamente navigabile:
   utile per demo, screenshot e sviluppo della sola UI.               */

export const DEMO_PLANS = [
  {
    code: 'founder',
    name: 'FONDATORE',
    tagline: "I primi 200. Prezzo che non tornerà mai più.",
    w: 1,
    h: 1,
    price_cents: 3900,
    max_units: 200,
    sort_order: 10,
    perks: [
      'Cella 1x1 sulla wall',
      'Badge Fondatore permanente',
      'Nome nei titoli di coda del progetto',
      'Prezzo bloccato per sempre',
    ],
  },
  {
    code: 'start',
    name: 'START',
    tagline: 'Il tuo mattone sulla parete.',
    w: 1,
    h: 1,
    price_cents: 6900,
    max_units: null,
    sort_order: 20,
    perks: [
      'Cella 1x1 sulla wall',
      'Logo, nome, descrizione, link',
      'Pagina pubblica dedicata',
      'Modifiche contenuto illimitate',
    ],
  },
  {
    code: 'plus',
    name: 'PLUS',
    tagline: "Quattro volte più visibile.",
    w: 2,
    h: 2,
    price_cents: 19900,
    max_units: null,
    sort_order: 30,
    perks: [
      'Blocco 2x2 sulla wall',
      'Logo, nome, descrizione, link',
      'Pagina pubblica dedicata',
      'Statistiche visite e click',
    ],
  },
  {
    code: 'prime',
    name: 'PRIME',
    tagline: 'Si vede da lontano, anche a zoom minimo.',
    w: 3,
    h: 3,
    price_cents: 49000,
    max_units: null,
    sort_order: 40,
    perks: [
      'Blocco 3x3 sulla wall',
      'Tutto quello di PLUS',
      'Immagine di copertina nella scheda',
      'Segnalazione nella newsletter',
    ],
  },
  {
    code: 'landmark',
    name: 'LANDMARK',
    tagline: 'Solo 20. Sono i monumenti della wall.',
    w: 5,
    h: 5,
    price_cents: 149000,
    max_units: 20,
    sort_order: 50,
    perks: [
      'Blocco 5x5 sulla wall',
      'Tutto quello di PRIME',
      'Posizione scelta con noi',
      'Presenza nella home e nella mappa',
      'Contratto di permanenza 10 anni',
    ],
  },
]

const DEMO_CONFIG = { cols: 100, rows: 60, hold_minutes: 20, is_open: true }

/** Griglia finta deterministica: stesso disegno a ogni ricarica. */
function demoSpaces() {
  const out = []
  let seed = 20260807
  const rnd = () => {
    seed = (seed * 1103515245 + 12345) % 2147483648
    return seed / 2147483648
  }
  const palette = ['#b4232a', '#d6a44c', '#2f5d50', '#e4d9c9', '#8a3b1f']
  const shapes = [
    [1, 1, 0.62],
    [2, 2, 0.24],
    [3, 3, 0.1],
    [5, 5, 0.04],
  ]

  for (let i = 0; i < 260; i += 1) {
    const roll = rnd()
    let acc = 0
    let shape = shapes[0]
    for (const s of shapes) {
      acc += s[2]
      if (roll <= acc) {
        shape = s
        break
      }
    }
    const [w, h] = shape
    const x = Math.floor(rnd() * (DEMO_CONFIG.cols - w))
    const y = Math.floor(rnd() * (DEMO_CONFIG.rows - h))
    const overlaps = out.some(
      (s) => x < s.x + s.w && x + w > s.x && y < s.y + s.h && y + h > s.y,
    )
    if (overlaps) continue
    out.push({
      id: `demo-${i}`,
      slug: `demo-${i}`,
      x,
      y,
      w,
      h,
      title: `Spazio ${i}`,
      description: 'Anteprima dimostrativa.',
      link_url: null,
      logo_path: null,
      bg_color: palette[Math.floor(rnd() * palette.length)],
      plan_code: w === 1 ? 'start' : w === 2 ? 'plus' : w === 3 ? 'prime' : 'landmark',
    })
  }
  return out
}

let demoCache = null
const demo = () => {
  if (!demoCache) demoCache = demoSpaces()
  return demoCache
}

/* ── API ────────────────────────────────────────────────────────── */

export async function fetchWallConfig() {
  if (!isConfigured) return DEMO_CONFIG
  const { data, error } = await supabase
    .from('wall_config')
    .select('cols, rows, hold_minutes, is_open')
    .maybeSingle()
  if (error || !data) return DEMO_CONFIG
  return data
}

export async function fetchPlans() {
  if (!isConfigured) return DEMO_PLANS
  const { data, error } = await supabase
    .from('plans')
    .select('code, name, tagline, w, h, price_cents, max_units, perks, sort_order')
    .eq('is_active', true)
    .order('sort_order')
  if (error || !data?.length) return DEMO_PLANS
  return data
}

export async function fetchWallSpaces() {
  if (!isConfigured) return demo()
  const { data, error } = await supabase
    .from('public_wall')
    .select('id, slug, x, y, w, h, title, description, link_url, logo_path, bg_color, plan_code')
  if (error) {
    console.error('fetchWallSpaces:', error.message)
    return []
  }
  return data ?? []
}

export async function fetchOccupiedCells() {
  if (!isConfigured) return demo().map(({ x, y, w, h }) => ({ x, y, w, h, is_active: true }))
  const { data, error } = await supabase.from('occupied_cells').select('x, y, w, h, is_active')
  if (error) return []
  return data ?? []
}

export async function fetchWallStats() {
  if (!isConfigured) {
    const sold = demo().reduce((acc, s) => acc + s.w * s.h, 0)
    const total = DEMO_CONFIG.cols * DEMO_CONFIG.rows
    return {
      cols: DEMO_CONFIG.cols,
      total_rows: DEMO_CONFIG.rows,
      total_cells: total,
      sold_cells: sold,
      reserved_cells: 0,
      free_cells: total - sold,
      spaces_count: demo().length,
      pct_sold: Number(((sold / total) * 100).toFixed(2)),
    }
  }
  const { data, error } = await supabase.rpc('wall_stats')
  if (error || !data?.length) return null
  return data[0]
}

export async function checkAreaFree({ x, y, w, h }) {
  if (!isConfigured) {
    return !demo().some((s) => x < s.x + s.w && x + w > s.x && y < s.y + s.h && y + h > s.y)
  }
  const { data, error } = await supabase.rpc('is_area_free', {
    p_x: x,
    p_y: y,
    p_w: w,
    p_h: h,
  })
  if (error) return false
  return Boolean(data)
}

export async function suggestFreeArea({ w, h }) {
  if (!isConfigured) {
    for (let i = 0; i < 500; i += 1) {
      const x = Math.floor(Math.random() * (DEMO_CONFIG.cols - w))
      const y = Math.floor(Math.random() * (DEMO_CONFIG.rows - h))
      if (await checkAreaFree({ x, y, w, h })) return { x, y }
    }
    return null
  }
  const { data, error } = await supabase.rpc('random_free_area', { p_w: w, p_h: h })
  if (error || !data?.length) return null
  return { x: data[0].x, y: data[0].y }
}

export async function joinWaitlist({ email, name, source = 'landing', ref = null }) {
  if (!isConfigured) return { ok: true, demo: true }
  const { error } = await supabase.rpc('join_waitlist', {
    p_email: email,
    p_name: name ?? null,
    p_source: source,
    p_ref: ref,
  })
  if (error) throw new Error("Non siamo riusciti a registrare l'email. Riprova.")
  return { ok: true }
}

export async function trackSpaceEvent(spaceId, kind) {
  if (!isConfigured || String(spaceId).startsWith('demo-')) return
  await supabase.rpc('track_space_event', { p_space_id: spaceId, p_kind: kind })
}

export async function reportSpace({ spaceId, reason, details }) {
  if (!isConfigured) return { ok: true }
  const { error } = await supabase.rpc('report_space', {
    p_space_id: spaceId,
    p_reason: reason,
    p_details: details ?? null,
  })
  if (error) throw new Error('Segnalazione non inviata.')
  return { ok: true }
}

/* ── Checkout ───────────────────────────────────────────────────── */

export async function createCheckout({ email, planCode, x, y, referral, businessName, vat }) {
  const response = await fetch('/api/create-checkout-session', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, planCode, x, y, referral, businessName, vat }),
  })

  const payload = await response.json().catch(() => ({}))
  if (!response.ok) {
    const error = new Error(payload.error || 'Checkout non disponibile.')
    error.code = payload.code
    throw error
  }
  return payload
}

export async function fetchOrderStatus(sessionId) {
  const response = await fetch(`/api/order-status?session_id=${encodeURIComponent(sessionId)}`)
  if (!response.ok) return null
  return response.json()
}

/* ── Area riservata ─────────────────────────────────────────────── */

export async function fetchMySpaces() {
  if (!isConfigured) return []
  const { data, error } = await supabase
    .from('spaces')
    .select(
      'id, x, y, w, h, plan_code, status, moderation, title, description, link_url, logo_path, bg_color, category, slug, activated_at',
    )
    .order('activated_at', { ascending: false })
  if (error) throw new Error(error.message)
  return data ?? []
}

export async function updateSpaceContent(spaceId, patch) {
  const { error } = await supabase.from('spaces').update(patch).eq('id', spaceId)
  if (error) {
    if (error.message.includes('IMMUTABLE_FIELDS')) {
      throw new Error('Posizione e piano dello spazio non sono modificabili.')
    }
    throw new Error(error.message)
  }
}

export async function uploadLogo(spaceId, file) {
  const extension = (file.name.split('.').pop() || 'png').toLowerCase()
  const path = `${spaceId}/logo-${Date.now()}.${extension}`
  const { error } = await supabase.storage
    .from('logos')
    .upload(path, file, { cacheControl: '31536000', upsert: true })
  if (error) throw new Error(`Caricamento non riuscito: ${error.message}`)
  return path
}

export async function fetchSpaceStats(spaceId) {
  if (!isConfigured) return []
  const { data } = await supabase
    .from('space_stats')
    .select('day, views, clicks')
    .eq('space_id', spaceId)
    .order('day', { ascending: false })
    .limit(30)
  return data ?? []
}
