import { supabaseAdmin, json, CORS } from './_shared/clients.js'

/**
 * GET /api/order-status?session_id=cs_...
 * Usata dalla pagina di successo: Stripe reindirizza prima che il
 * webhook sia arrivato, quindi il frontend fa polling qui.
 */
export const handler = async (event) => {
  if (event.httpMethod === 'OPTIONS') return { statusCode: 204, headers: CORS, body: '' }

  const sessionId = event.queryStringParameters?.session_id
  if (!sessionId || !sessionId.startsWith('cs_')) {
    return json(400, { error: 'session_id mancante' }, CORS)
  }

  const db = supabaseAdmin()
  const { data: order, error } = await db
    .from('orders')
    .select('id, status, plan_code, amount_cents, space_id, email')
    .eq('stripe_checkout_session_id', sessionId)
    .maybeSingle()

  if (error || !order) return json(404, { error: 'Ordine non trovato' }, CORS)

  let space = null
  if (order.space_id) {
    const { data } = await db
      .from('spaces')
      .select('id, x, y, w, h, status, slug')
      .eq('id', order.space_id)
      .maybeSingle()
    space = data
  }

  return json(
    200,
    {
      status: order.status,
      planCode: order.plan_code,
      amountCents: order.amount_cents,
      // L'email torna mascherata: l'endpoint e' pubblico.
      email: order.email.replace(/^(.).*(@.*)$/, '$1***$2'),
      space,
    },
    { ...CORS, 'Cache-Control': 'no-store' },
  )
}
