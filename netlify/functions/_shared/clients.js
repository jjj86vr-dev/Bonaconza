import { createClient } from '@supabase/supabase-js'
import Stripe from 'stripe'

function required(name) {
  const value = process.env[name]
  if (!value) throw new Error(`Variabile d'ambiente mancante: ${name}`)
  return value
}

/** Client Supabase con service_role: bypassa la RLS. Solo lato server. */
export function supabaseAdmin() {
  return createClient(required('SUPABASE_URL'), required('SUPABASE_SERVICE_ROLE_KEY'), {
    auth: { persistSession: false, autoRefreshToken: false },
  })
}

export function stripeClient() {
  return new Stripe(required('STRIPE_SECRET_KEY'), { apiVersion: '2024-06-20' })
}

export function siteUrl() {
  return (process.env.SITE_URL || process.env.URL || 'http://localhost:5173').replace(/\/$/, '')
}

export const json = (statusCode, body, headers = {}) => ({
  statusCode,
  headers: { 'Content-Type': 'application/json', ...headers },
  body: JSON.stringify(body),
})

export const CORS = {
  'Access-Control-Allow-Origin': process.env.SITE_URL || '*',
  'Access-Control-Allow-Headers': 'Content-Type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
}

/** Messaggi utente per gli errori sollevati dalle funzioni Postgres. */
export const DB_ERRORS = {
  AREA_TAKEN: 'Questa posizione è stata presa un attimo prima di te. Scegline un\'altra.',
  PLAN_SOLD_OUT: 'Questo piano è esaurito.',
  PLAN_NOT_FOUND: 'Piano non valido.',
  OUT_OF_BOUNDS: 'La posizione scelta esce dalla wall.',
  WALL_CLOSED: 'La wall non accetta nuovi spazi in questo momento.',
}

export function dbErrorMessage(error) {
  const raw = `${error?.message || ''}`
  for (const key of Object.keys(DB_ERRORS)) {
    if (raw.includes(key)) return { code: key, message: DB_ERRORS[key] }
  }
  return { code: 'UNKNOWN', message: 'Qualcosa è andato storto. Riprova fra un istante.' }
}

export const isEmail = (v) => typeof v === 'string' && /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(v.trim())
