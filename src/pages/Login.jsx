import { useState } from 'react'
import { supabase, isConfigured } from '../lib/supabase'

/** Accesso senza password: link magico via email. */
export default function Login() {
  const [email, setEmail] = useState('')
  const [state, setState] = useState({ status: 'idle', message: '' })

  const submit = async (event) => {
    event.preventDefault()
    if (!isConfigured) {
      setState({ status: 'error', message: 'Backend non configurato in questa demo.' })
      return
    }

    setState({ status: 'loading', message: '' })
    const { error } = await supabase.auth.signInWithOtp({
      email: email.trim(),
      options: { emailRedirectTo: `${window.location.origin}/gestisci` },
    })

    if (error) {
      setState({ status: 'error', message: error.message })
      return
    }
    setState({
      status: 'sent',
      message: 'Ti abbiamo mandato un link. Aprilo da questo dispositivo.',
    })
  }

  return (
    <section className="section" style={{ minHeight: '70vh', display: 'grid', placeItems: 'center' }}>
      <div className="shell" style={{ maxWidth: 440 }}>
        <p className="eyebrow">Area proprietari</p>
        <h1 className="h-lg" style={{ margin: '1rem 0 1.5rem' }}>
          Entra nel tuo spazio.
        </h1>

        {state.status === 'sent' ? (
          <p className="notice notice-ok">{state.message}</p>
        ) : (
          <form onSubmit={submit}>
            <label className="field">
              <span>L'email con cui hai comprato</span>
              <input
                className="input"
                type="email"
                required
                autoComplete="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                placeholder="la-tua@email.it"
              />
            </label>

            <button className="btn btn-block" disabled={state.status === 'loading'}>
              {state.status === 'loading' ? 'Invio…' : 'Mandami il link'}
            </button>

            {state.status === 'error' && (
              <p className="notice notice-error" style={{ marginTop: '1rem' }}>
                {state.message}
              </p>
            )}
          </form>
        )}

        <p className="mono muted" style={{ marginTop: '1.5rem', fontSize: 11, lineHeight: 1.8 }}>
          NESSUNA PASSWORD DA RICORDARE. IL LINK VALE UNA VOLTA SOLA.
        </p>
      </div>
    </section>
  )
}
