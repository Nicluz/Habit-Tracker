import { supabase } from '../lib/supabase'
import { useApp, toast } from '../App'
import { useState } from 'react'

const card = { background:'#111120', border:'1px solid rgba(255,255,255,0.07)', borderRadius:16, padding:20, marginBottom:12 }
const cardTitle = { fontSize:'0.68rem', fontWeight:700, textTransform:'uppercase', letterSpacing:'0.1em', color:'#94a3b8', marginBottom:16 }

const BUILT_IN = ['Running','Cycling','Gym','Padel','Home Gym','Tennis','Rest Day']

export default function SettingsView() {
  const { session, customActivities, addCustomActivity, deleteCustomActivity } = useApp()
  const [newAct, setNewAct] = useState('')

  async function handleLogout() {
    await supabase.auth.signOut()
  }

  async function handleAdd() {
    const t = newAct.trim()
    if (!t) return
    await addCustomActivity(t)
    setNewAct('')
  }

  return (
    <div style={{ maxWidth: 640, margin: '0 auto', padding: '0 16px' }}>
      <div className="py-5">
        <h1 style={{ fontSize: '1.5rem', fontWeight: 800, letterSpacing: '-0.03em' }}>Profile</h1>
      </div>

      {/* Account */}
      <div style={card}>
        <div style={cardTitle}>Account</div>
        <p style={{ fontSize:'0.875rem', color:'#94a3b8', marginBottom:16 }}>{session.user.email}</p>
        <button
          onClick={handleLogout}
          style={{
            background:'rgba(239,68,68,0.1)', border:'1px solid rgba(239,68,68,0.25)',
            borderRadius:10, color:'#ef4444', fontFamily:'inherit', fontSize:'0.875rem',
            fontWeight:600, padding:'9px 16px', cursor:'pointer', transition:'all 0.15s',
          }}
          onMouseOver={e => { e.currentTarget.style.background='#ef4444'; e.currentTarget.style.color='#fff' }}
          onMouseOut={e  => { e.currentTarget.style.background='rgba(239,68,68,0.1)'; e.currentTarget.style.color='#ef4444' }}
        >
          Sign Out
        </button>
      </div>

      {/* Activities */}
      <div style={card}>
        <div style={cardTitle}>Activity List</div>

        <div style={{ marginBottom: 12 }}>
          <div style={{ fontSize:'0.72rem', fontWeight:600, color:'#64748b', textTransform:'uppercase', letterSpacing:'0.06em', marginBottom:8 }}>Built-in</div>
          <div style={{ display:'flex', flexWrap:'wrap', gap:8, marginBottom:16 }}>
            {BUILT_IN.map(a => (
              <span key={a} style={{ padding:'5px 12px', borderRadius:999, background:'#191928', border:'1px solid rgba(255,255,255,0.07)', fontSize:'0.8rem', color:'#64748b' }}>{a}</span>
            ))}
          </div>

          <div style={{ fontSize:'0.72rem', fontWeight:600, color:'#64748b', textTransform:'uppercase', letterSpacing:'0.06em', marginBottom:8 }}>Custom</div>
          {customActivities.length === 0 && (
            <p style={{ fontSize:'0.82rem', color:'#475569', marginBottom:12 }}>No custom activities yet.</p>
          )}
          <div style={{ display:'flex', flexWrap:'wrap', gap:8, marginBottom:14 }}>
            {customActivities.map(a => (
              <div key={a.id} style={{ display:'flex', alignItems:'center', gap:6, padding:'5px 12px 5px 14px', borderRadius:999, background:'rgba(124,58,237,0.1)', border:'1px solid rgba(124,58,237,0.3)', fontSize:'0.8rem', color:'#cbd5e1' }}>
                {a.name}
                <button
                  onClick={() => deleteCustomActivity(a.id)}
                  style={{ background:'none', border:'none', color:'#64748b', cursor:'pointer', fontSize:'1rem', lineHeight:1, padding:'0 0 1px', fontFamily:'inherit' }}
                  title="Remove"
                >×</button>
              </div>
            ))}
          </div>

          <div style={{ display:'flex', gap:8 }}>
            <input
              type="text"
              value={newAct}
              onChange={e => setNewAct(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleAdd()}
              placeholder="New activity…"
              style={{ flex:1, background:'#191928', border:'1px solid rgba(255,255,255,0.07)', borderRadius:10, color:'#f1f5f9', fontFamily:'inherit', fontSize:'0.875rem', padding:'9px 12px', outline:'none' }}
            />
            <button
              onClick={handleAdd}
              style={{ background:'linear-gradient(135deg,#7c3aed,#9d5ff5)', border:'none', borderRadius:10, color:'#fff', fontFamily:'inherit', fontSize:'0.875rem', fontWeight:600, padding:'9px 16px', cursor:'pointer' }}
            >
              Add
            </button>
          </div>
        </div>
      </div>

      {/* App info */}
      <div style={card}>
        <div style={cardTitle}>App Info</div>
        <p style={{ fontSize:'0.8rem', color:'#475569', lineHeight:1.7 }}>
          Habit Tracker · Personal Edition<br/>
          Built with React + Vite + Supabase + Netlify
        </p>
      </div>
    </div>
  )
}
