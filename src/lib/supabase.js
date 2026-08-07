import { createClient } from '@supabase/supabase-js'

const url = import.meta.env.VITE_SUPABASE_URL
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

export const isConfigured = Boolean(url && anonKey)

if (!isConfigured && import.meta.env.DEV) {
  console.warn(
    'Supabase non configurato: copia .env.example in .env e compila VITE_SUPABASE_URL / VITE_SUPABASE_ANON_KEY.',
  )
}

/**
 * In assenza di configurazione il client resta null e `api.js` usa i dati
 * dimostrativi: la landing resta navigabile anche senza backend.
 */
export const supabase = isConfigured
  ? createClient(url, anonKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true,
      },
    })
  : null

export function logoUrl(path) {
  if (!path) return null
  if (path.startsWith('http')) return path
  return `${url}/storage/v1/object/public/logos/${path}`
}
