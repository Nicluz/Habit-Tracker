import { useState } from 'react'
import { supabase } from '../lib/supabase'

export default function LoginView() {
  const [email,    setEmail]    = useState('')
  const [password, setPassword] = useState('')
  const [error,    setError]    = useState('')
  const [loading,  setLoading]  = useState(false)

  async function handleLogin(e) {
    e.preventDefault()
    setError('')
    setLoading(true)
    const { error: err } = await supabase.auth.signInWithPassword({ email, password })
    if (err) setError(err.message)
    setLoading(false)
  }

  return (
    <div
      className="min-h-screen flex items-center justify-center px-4"
      style={{
        background: 'radial-gradient(ellipse 80% 60% at 50% 0%, rgba(124,58,237,0.18) 0%, transparent 70%), #09090f',
      }}
    >
      <div className="w-full" style={{ maxWidth: 380 }}>
        {/* Logo */}
        <div className="text-center mb-10">
          <div
            className="w-16 h-16 rounded-2xl flex items-center justify-center text-3xl mx-auto mb-4"
            style={{
              background: 'linear-gradient(135deg, #7c3aed 0%, #a855f7 100%)',
              boxShadow: '0 0 30px rgba(124,58,237,0.3)',
            }}
          >
            🔥
          </div>
          <h1 className="text-2xl font-extrabold tracking-tight">Habit Tracker</h1>
          <p style={{ color: '#94a3b8', fontSize: '0.875rem', marginTop: 4 }}>
            Your daily progress, visualised
          </p>
        </div>

        {/* Card */}
        <form
          onSubmit={handleLogin}
          className="rounded-2xl p-7"
          style={{ background: '#111120', border: '1px solid rgba(255,255,255,0.07)', boxShadow: '0 4px 32px rgba(0,0,0,0.45)' }}
        >
          <label className="block mb-2" style={{ fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.07em', color: '#94a3b8' }}>
            Email
          </label>
          <input
            type="email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            placeholder="you@email.com"
            autoComplete="email"
            required
            className="w-full rounded-xl px-4 py-3 mb-4 outline-none transition-all duration-150"
            style={{
              background: '#191928', border: '1px solid rgba(255,255,255,0.07)',
              color: '#f1f5f9', fontSize: '1rem', fontFamily: 'inherit',
            }}
            onFocus={e => { e.target.style.borderColor = '#7c3aed'; e.target.style.boxShadow = '0 0 0 3px rgba(124,58,237,0.22)' }}
            onBlur={e  => { e.target.style.borderColor = 'rgba(255,255,255,0.07)'; e.target.style.boxShadow = 'none' }}
          />

          <label className="block mb-2" style={{ fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.07em', color: '#94a3b8' }}>
            Password
          </label>
          <input
            type="password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            placeholder="••••••••"
            autoComplete="current-password"
            required
            className="w-full rounded-xl px-4 py-3 mb-4 outline-none transition-all duration-150"
            style={{
              background: '#191928', border: '1px solid rgba(255,255,255,0.07)',
              color: '#f1f5f9', fontSize: '1rem', fontFamily: 'inherit',
            }}
            onFocus={e => { e.target.style.borderColor = '#7c3aed'; e.target.style.boxShadow = '0 0 0 3px rgba(124,58,237,0.22)' }}
            onBlur={e  => { e.target.style.borderColor = 'rgba(255,255,255,0.07)'; e.target.style.boxShadow = 'none' }}
          />

          {error && (
            <p className="text-center mb-3" style={{ color: '#ef4444', fontSize: '0.85rem' }}>{error}</p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-xl py-3 font-semibold transition-all duration-150"
            style={{
              background: loading ? '#2a1a5e' : 'linear-gradient(135deg, #7c3aed 0%, #9d5ff5 100%)',
              color: '#fff',
              border: 'none',
              cursor: loading ? 'not-allowed' : 'pointer',
              fontSize: '0.9375rem',
              boxShadow: '0 4px 16px rgba(124,58,237,0.3)',
              opacity: loading ? 0.7 : 1,
              fontFamily: 'inherit',
            }}
          >
            {loading ? 'Signing in…' : 'Sign In'}
          </button>
        </form>
      </div>
    </div>
  )
}
