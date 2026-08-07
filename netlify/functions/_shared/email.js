import { siteUrl } from './clients.js'

/**
 * Email transazionale via Brevo. Se BREVO_API_KEY non è configurata la
 * funzione non fa nulla: il flusso di acquisto non deve mai fallire per
 * colpa dell'email.
 */
async function send({ to, subject, html }) {
  const apiKey = process.env.BREVO_API_KEY
  if (!apiKey) {
    console.log(`[email disattivata] a ${to}: ${subject}`)
    return
  }

  const response = await fetch('https://api.brevo.com/v3/smtp/email', {
    method: 'POST',
    headers: { 'api-key': apiKey, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      sender: {
        email: process.env.BREVO_SENDER_EMAIL || 'ciao@veronawall.it',
        name: process.env.BREVO_SENDER_NAME || 'Verona Wall',
      },
      to: [{ email: to }],
      subject,
      htmlContent: html,
    }),
  })

  if (!response.ok) {
    throw new Error(`Brevo ${response.status}: ${await response.text()}`)
  }
}

export async function sendWelcomeEmail({ space, magicLink }) {
  const html = `
  <div style="font-family:Georgia,serif;background:#12100E;color:#F2EBE1;padding:40px 24px">
    <div style="max-width:520px;margin:0 auto">
      <p style="letter-spacing:.3em;font-size:11px;color:#D6A44C;margin:0 0 24px">VERONA WALL</p>
      <h1 style="font-size:32px;line-height:1.15;margin:0 0 16px">Il tuo posto sul muro è tuo.</h1>
      <p style="color:#C9BFB2;line-height:1.6">
        Hai preso la posizione <strong style="color:#F2EBE1">(${space.x}, ${space.y})</strong>,
        un blocco ${space.w}&times;${space.h}. Da adesso è permanente.
      </p>
      <p style="color:#C9BFB2;line-height:1.6">
        Ultimo passo: carica il logo e scrivi la tua descrizione.
      </p>
      <p style="margin:32px 0">
        <a href="${magicLink}"
           style="background:#B4232A;color:#fff;text-decoration:none;padding:16px 28px;display:inline-block;letter-spacing:.05em">
          COMPLETA IL TUO SPAZIO
        </a>
      </p>
      <p style="color:#7C7264;font-size:13px;line-height:1.6">
        Il link vale una volta sola. Se scade, richiedine uno nuovo da
        <a href="${siteUrl()}/entra" style="color:#D6A44C">${siteUrl()}/entra</a>.
      </p>
    </div>
  </div>`

  await send({
    to: space.claim_email,
    subject: 'Il tuo spazio su Verona Wall è attivo',
    html,
  })
}
