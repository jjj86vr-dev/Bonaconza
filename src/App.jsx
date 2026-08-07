import { Suspense, lazy, useEffect } from 'react'
import { Route, Routes, useLocation } from 'react-router-dom'
import Nav from './components/Nav'
import Footer from './components/Footer'
import Landing from './pages/Landing'
import { captureReferral } from './lib/format'
import { supabase } from './lib/supabase'

const Wall = lazy(() => import('./pages/Wall'))
const Claim = lazy(() => import('./pages/Claim'))
const Success = lazy(() => import('./pages/Success'))
const Manage = lazy(() => import('./pages/Manage'))
const Login = lazy(() => import('./pages/Login'))
const Legal = lazy(() => import('./pages/Legal'))
const NotFound = lazy(() => import('./pages/NotFound'))

function ScrollToTop() {
  const { pathname } = useLocation()
  useEffect(() => {
    window.scrollTo(0, 0)
  }, [pathname])
  return null
}

export default function App() {
  const { pathname } = useLocation()
  const bare = pathname === '/wall'

  useEffect(() => {
    const code = captureReferral()
    if (code && supabase) {
      supabase.rpc('track_referral_click', { p_code: code }).catch(() => {})
    }
  }, [])

  return (
    <>
      <ScrollToTop />
      <Nav />
      <main id="contenuto">
        <Suspense fallback={<div style={{ minHeight: '60vh' }} />}>
          <Routes>
            <Route path="/" element={<Landing />} />
            <Route path="/wall" element={<Wall />} />
            <Route path="/prendi-posto" element={<Claim />} />
            <Route path="/successo" element={<Success />} />
            <Route path="/gestisci" element={<Manage />} />
            <Route path="/entra" element={<Login />} />
            <Route path="/note-legali" element={<Legal />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </Suspense>
      </main>
      {!bare && <Footer />}
    </>
  )
}
