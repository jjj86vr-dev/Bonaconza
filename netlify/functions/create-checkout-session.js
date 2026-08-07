import {
  supabaseAdmin,
  stripeClient,
  siteUrl,
  json,
  CORS,
  dbErrorMessage,
  isEmail,
} from './_shared/clients.js'

/**
 * POST /api/create-checkout-session
 * body: { email, planCode, x, y, referral?, businessName?, vat? }
 *
 * Sequenza:
 *  1. hold_space() prenota la cella nel DB (vincolo di esclusione GiST:
 *     due richieste simultanee sulla stessa cella → una sola vince).
 *  2. crea l'ordine.
 *  3. crea la Checkout Session Stripe.
 *  4. se Stripe fallisce, l'hold viene annullato subito.
 */
export const handler = async (event) => {
  if (event.httpMethod === 'OPTIONS') return { statusCode: 204, headers: CORS, body: '' }
  if (event.httpMethod !== 'POST') return json(405, { error: 'Metodo non consentito' }, CORS)

  let payload
  try {
    payload = JSON.parse(event.body || '{}')
  } catch {
    return json(400, { error: 'Body non valido' }, CORS)
  }

  const email = String(payload.email || '').trim().toLowerCase()
  const planCode = String(payload.planCode || '').trim()
  const x = Number.parseInt(payload.x, 10)
  const y = Number.parseInt(payload.y, 10)
  const referral = payload.referral ? String(payload.referral).trim().toUpperCase().slice(0, 16) : null

  if (!isEmail(email)) return json(400, { error: 'Inserisci un indirizzo email valido.' }, CORS)
  if (!planCode) return json(400, { error: 'Piano mancante.' }, CORS)
  if (!Number.isInteger(x) || !Number.isInteger(y) || x < 0 || y < 0) {
    return json(400, { error: 'Posizione non valida.' }, CORS)
  }

  const db = supabaseAdmin()
  const stripe = stripeClient()

  const { data: plan, error: planError } = await db
    .from('plans')
    .select('code, name, tagline, w, h, price_cents, currency, stripe_price_id')
    .eq('code', planCode)
    .eq('is_active', true)
    .maybeSingle()

  if (planError || !plan) return json(400, { error: 'Piano non valido.' }, CORS)

  // 1. Prenotazione atomica della cella
  const { data: spaceId, error: holdError } = await db.rpc('hold_space', {
    p_email: email,
    p_plan_code: planCode,
    p_x: x,
    p_y: y,
    p_referral: referral,
  })

  if (holdError) {
    const { code, message } = dbErrorMessage(holdError)
    return json(code === 'AREA_TAKEN' ? 409 : 400, { error: message, code }, CORS)
  }

  const rollback = async () => {
    await db.from('spaces').update({ status: 'cancelled' }).eq('id', spaceId)
  }

  // 2. Ordine
  const { data: order, error: orderError } = await db
    .from('orders')
    .insert({
      space_id: spaceId,
      email,
      plan_code: planCode,
      amount_cents: plan.price_cents,
      currency: plan.currency,
      referral_code: referral,
      invoice_business_name: payload.businessName ? String(payload.businessName).slice(0, 120) : null,
      invoice_vat: payload.vat ? String(payload.vat).slice(0, 32) : null,
    })
    .select('id')
    .single()

  if (orderError) {
    await rollback()
    return json(500, { error: 'Non siamo riusciti a creare l\'ordine. Riprova.' }, CORS)
  }

  // 3. Checkout Stripe
  const lineItem = plan.stripe_price_id
    ? { price: plan.stripe_price_id, quantity: 1 }
    : {
        quantity: 1,
        price_data: {
          currency: plan.currency,
          unit_amount: plan.price_cents,
          product_data: {
            name: `Verona Wall — ${plan.name}`,
            description: `Spazio ${plan.w}x${plan.h} in posizione (${x}, ${y}). ${plan.tagline || ''}`.trim(),
          },
        },
      }

  try {
    const session = await stripe.checkout.sessions.create(
      {
        mode: 'payment',
        line_items: [lineItem],
        customer_email: email,
        client_reference_id: order.id,
        locale: 'it',
        allow_promotion_codes: true,
        billing_address_collection: 'required',
        automatic_tax: { enabled: false },
        // La sessione scade prima dell'hold, così la cella non resta bloccata.
        expires_at: Math.floor(Date.now() / 1000) + 30 * 60,
        metadata: {
          space_id: spaceId,
          order_id: order.id,
          plan_code: planCode,
          x: String(x),
          y: String(y),
          referral: referral || '',
        },
        success_url: `${siteUrl()}/successo?session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${siteUrl()}/wall?annullato=1`,
      },
      // Idempotenza: un doppio click non crea due sessioni.
      { idempotencyKey: `order_${order.id}` },
    )

    await db
      .from('orders')
      .update({ stripe_checkout_session_id: session.id })
      .eq('id', order.id)

    await db
      .from('spaces')
      .update({ status: 'pending_payment' })
      .eq('id', spaceId)

    return json(200, { url: session.url, sessionId: session.id, spaceId }, CORS)
  } catch (error) {
    await rollback()
    await db.from('orders').update({ status: 'failed' }).eq('id', order.id)
    console.error('Stripe checkout error:', error)
    return json(502, { error: 'Il pagamento non è disponibile in questo momento. Riprova.' }, CORS)
  }
}
