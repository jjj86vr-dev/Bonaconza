import { supabaseAdmin, stripeClient, siteUrl } from './_shared/clients.js'
import { sendWelcomeEmail } from './_shared/email.js'

/** Il webhook risponde sempre 200 sugli eventi che non gestisce. */
export const handler = async (event) => {
  const signature = event.headers['stripe-signature'] || event.headers['Stripe-Signature']
  const secret = process.env.STRIPE_WEBHOOK_SECRET

  if (!signature || !secret) {
    return { statusCode: 400, body: 'Firma mancante' }
  }

  // Stripe verifica la firma sul body RAW: niente JSON.parse prima di qui.
  const rawBody = event.isBase64Encoded
    ? Buffer.from(event.body, 'base64')
    : Buffer.from(event.body || '', 'utf8')

  const stripe = stripeClient()
  let stripeEvent
  try {
    stripeEvent = stripe.webhooks.constructEvent(rawBody, signature, secret)
  } catch (error) {
    console.error('Firma webhook non valida:', error.message)
    return { statusCode: 400, body: `Webhook Error: ${error.message}` }
  }

  const db = supabaseAdmin()

  try {
    switch (stripeEvent.type) {
      case 'checkout.session.completed':
        await onCheckoutCompleted(db, stripeEvent.data.object)
        break

      case 'checkout.session.expired':
        await onCheckoutExpired(db, stripeEvent.data.object)
        break

      case 'charge.refunded':
        await onRefund(db, stripeEvent.data.object)
        break

      case 'customer.subscription.created':
      case 'customer.subscription.updated':
      case 'customer.subscription.deleted':
        await onSubscription(db, stripeEvent.data.object)
        break

      default:
        break
    }
  } catch (error) {
    console.error(`Errore gestione evento ${stripeEvent.type}:`, error)
    // 500 → Stripe riprova. Le operazioni sono idempotenti.
    return { statusCode: 500, body: 'Errore interno' }
  }

  return { statusCode: 200, body: JSON.stringify({ received: true }) }
}

async function onCheckoutCompleted(db, session) {
  if (session.payment_status !== 'paid') return

  const spaceId = session.metadata?.space_id
  const orderId = session.metadata?.order_id
  if (!spaceId) return

  const { error: activateError } = await db.rpc('activate_space', { p_space_id: spaceId })
  if (activateError) throw activateError

  if (orderId) {
    await db
      .from('orders')
      .update({
        status: 'paid',
        paid_at: new Date().toISOString(),
        stripe_payment_intent_id:
          typeof session.payment_intent === 'string' ? session.payment_intent : null,
      })
      .eq('id', orderId)
  }

  // Referral: conta la conversione e accredita il premio (20% del netto).
  const referral = session.metadata?.referral
  if (referral) {
    const { data: current } = await db
      .from('referrals')
      .select('conversions, reward_cents')
      .eq('code', referral)
      .maybeSingle()

    if (current) {
      await db
        .from('referrals')
        .update({
          conversions: current.conversions + 1,
          reward_cents: current.reward_cents + Math.round((session.amount_total || 0) * 0.2),
        })
        .eq('code', referral)
    }
  }

  const { data: space } = await db
    .from('spaces')
    .select('id, claim_email, x, y, w, h, plan_code')
    .eq('id', spaceId)
    .maybeSingle()

  if (space) {
    let magicLink = `${siteUrl()}/entra`
    try {
      const { data } = await db.auth.admin.generateLink({
        type: 'magiclink',
        email: space.claim_email,
        options: { redirectTo: `${siteUrl()}/gestisci` },
      })
      if (data?.properties?.action_link) magicLink = data.properties.action_link
    } catch (error) {
      console.warn('generateLink non riuscito:', error.message)
    }

    await sendWelcomeEmail({ space, magicLink }).catch((error) =>
      console.warn('Email di benvenuto non inviata:', error.message),
    )
  }
}

async function onCheckoutExpired(db, session) {
  const spaceId = session.metadata?.space_id
  const orderId = session.metadata?.order_id

  if (spaceId) {
    // Non tocca gli spazi già pagati.
    await db
      .from('spaces')
      .update({ status: 'expired' })
      .eq('id', spaceId)
      .in('status', ['held', 'pending_payment'])
  }
  if (orderId) {
    await db.from('orders').update({ status: 'expired' }).eq('id', orderId).eq('status', 'created')
  }
}

async function onRefund(db, charge) {
  const paymentIntentId =
    typeof charge.payment_intent === 'string' ? charge.payment_intent : charge.payment_intent?.id
  if (!paymentIntentId) return

  const { data: order } = await db
    .from('orders')
    .select('id, space_id')
    .eq('stripe_payment_intent_id', paymentIntentId)
    .maybeSingle()

  if (!order) return

  await db.from('orders').update({ status: 'refunded' }).eq('id', order.id)
  if (order.space_id) {
    await db.from('spaces').update({ status: 'cancelled' }).eq('id', order.space_id)
  }
}

async function onSubscription(db, subscription) {
  const spaceId = subscription.metadata?.space_id || null
  const email = subscription.metadata?.email || null

  await db.from('subscriptions').upsert(
    {
      space_id: spaceId,
      email: email || 'sconosciuta@veronawall.it',
      stripe_customer_id:
        typeof subscription.customer === 'string' ? subscription.customer : null,
      stripe_subscription_id: subscription.id,
      status: subscription.status,
      current_period_end: subscription.current_period_end
        ? new Date(subscription.current_period_end * 1000).toISOString()
        : null,
    },
    { onConflict: 'stripe_subscription_id' },
  )
}
