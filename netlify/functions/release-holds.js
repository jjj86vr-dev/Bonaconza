import { schedule } from '@netlify/functions'
import { supabaseAdmin } from './_shared/clients.js'

/**
 * Rilascia le celle prenotate ma mai pagate.
 * Gira ogni 5 minuti. Rete di sicurezza in caso di webhook
 * `checkout.session.expired` perso.
 */
const run = async () => {
  const db = supabaseAdmin()
  const { data, error } = await db.rpc('release_expired_holds')

  if (error) {
    console.error('release_expired_holds:', error.message)
    return { statusCode: 500, body: error.message }
  }

  console.log(`Celle liberate: ${data}`)
  return { statusCode: 200, body: JSON.stringify({ released: data }) }
}

export const handler = schedule('*/5 * * * *', run)
