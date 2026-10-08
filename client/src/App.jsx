import React, { Suspense, lazy } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import SpiritOSApp from './SpiritOSApp'
import LandingLayout from './landing/components/LandingLayout'

// Lazy-load landing pages for fast initial load
const HomePage         = lazy(() => import('./landing/pages/HomePage'))
const HowToStartPage   = lazy(() => import('./landing/pages/HowToStartPage'))
const HowToBuildPage   = lazy(() => import('./landing/pages/HowToBuildPage'))
const HowToSellPage    = lazy(() => import('./landing/pages/HowToSellPage'))
const HowToScalePage   = lazy(() => import('./landing/pages/HowToScalePage'))
const LandingLoginPage = lazy(() => import('./landing/pages/LandingLoginPage'))
const ResourcesPage    = lazy(() => import('./landing/pages/ResourcesPage'))

// Minimal fallback shown while lazy chunks load
function PageLoader() {
  return (
    <div style={{
      minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
      background: '#f5f5f2', fontFamily: "'TT Neoris', system-ui, sans-serif",
      color: 'rgba(38,35,35,0.5)', fontSize: 14,
    }}>
      Loading…
    </div>
  )
}

// Wraps a landing page component with the LandingLayout scope
function LandingPage({ Component }) {
  return (
    <LandingLayout>
      <Suspense fallback={<PageLoader />}>
        <Component />
      </Suspense>
    </LandingLayout>
  )
}

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* ── Landing page routes ─────────────────────────────── */}
        <Route path="/"              element={<LandingPage Component={HomePage} />} />
        <Route path="/how-to/start"  element={<LandingPage Component={HowToStartPage} />} />
        <Route path="/how-to/build"  element={<LandingPage Component={HowToBuildPage} />} />
        <Route path="/how-to/sell"   element={<LandingPage Component={HowToSellPage} />} />
        <Route path="/how-to/scale"  element={<LandingPage Component={HowToScalePage} />} />
        <Route path="/login"         element={<LandingPage Component={LandingLoginPage} />} />
        <Route path="/resources"     element={<LandingPage Component={ResourcesPage} />} />

        {/* ── Spirit OS desktop ───────────────────────────────── */}
        <Route path="/app" element={<SpiritOSApp />} />

        {/* ── Catch-all: redirect unknown paths to landing ────── */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
