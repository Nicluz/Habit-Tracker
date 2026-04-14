import { useState } from 'react'
import { supabase } from '../lib/supabase'
import { useApp, toast } from '../App'
import { getMesocycleWeek } from '../lib/settings'
import TimePicker from '../components/input/TimePicker'
import Toggle     from '../components/input/Toggle'

const card      = { background:'#111120', border:'1px solid rgba(255,255,255,0.07)', borderRadius:16, padding:20, marginBottom:12 }
const cardTitle = { fontSize:'0.68rem', fontWeight:700, textTransform:'uppercase', letterSpacing:'0.1em', color:'#94a3b8', marginBottom:16 }
const subTitle  = { fontSize:'0.72rem', fontWeight:700, textTransform:'uppercase', letterSpacing:'0.08em', color:'#475569', marginBottom:10, marginTop:20 }
const fLabel    = { fontSize:'0.8125rem', fontWeight:600, color:'#cbd5e1', marginBottom:8 }
const divider   = { borderTop:'1px solid rgba(255,255,255,0.06)', margin:'20px 0' }

const BUILT_IN = ['Cycling','Gym','Home Gym','Other','Padel','Rest Day','Running','Swim','Tennis']

function PillGroup({ options, value, onChange }) {
  return (
    <div style={{ display:'flex', gap:8, flexWrap:'wrap' }}>
      {options.map(o => (
        <button
          key={o.value}
          type="button"
          onClick={() => onChange(o.value)}
          style={{
            padding:'7px 16px', borderRadius:999, border:'none',
            fontFamily:'inherit', fontSize:'0.825rem', fontWeight:600,
            cursor:'pointer', transition:'all 0.15s',
            background: value === o.value ? 'linear-gradient(135deg,#7c3aed,#9d5ff5)' : '#191928',
            color:      value === o.value ? '#fff' : '#64748b',
            boxShadow:  value === o.value ? '0 2px 10px rgba(124,58,237,0.3)' : 'none',
          }}
        >{o.label}</button>
      ))}
    </div>
  )
}

function GoalStepper({ value, onChange, step = 10, min = 0, max = 500, unit = '' }) {
  return (
    <div style={{ display:'flex', alignItems:'center', gap:12 }}>
      <button
        type="button"
        onClick={() => onChange(Math.max(min, value - step))}
        style={{ width:36, height:36, borderRadius:10, background:'#191928', border:'1px solid rgba(255,255,255,0.07)', color:'#f1f5f9', fontSize:'1.2rem', fontWeight:700, cursor:'pointer', fontFamily:'inherit', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}
      >−</button>
      <span style={{ fontSize:'1.4rem', fontWeight:800, color:'#f1f5f9', fontVariantNumeric:'tabular-nums', minWidth:52, textAlign:'center' }}>
        {value}{unit && <span style={{ fontSize:'0.8rem', color:'#64748b', fontWeight:400, marginLeft:2 }}>{unit}</span>}
      </span>
      <button
        type="button"
        onClick={() => onChange(Math.min(max, value + step))}
        style={{ width:36, height:36, borderRadius:10, background:'#191928', border:'1px solid rgba(255,255,255,0.07)', color:'#f1f5f9', fontSize:'1.2rem', fontWeight:700, cursor:'pointer', fontFamily:'inherit', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}
      >+</button>
    </div>
  )
}

export default function SettingsView() {
  const { session, customActivities, addCustomActivity, deleteCustomActivity, settings, updateSettings } = useApp()
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

  function set(key, val) { updateSettings({ [key]: val }) }

  return (
    <div style={{ maxWidth: 640, margin: '0 auto', padding: '0 16px' }}>
      <div className="py-5">
        <h1 style={{ fontSize: '1.5rem', fontWeight: 800, letterSpacing: '-0.03em' }}>Profile</h1>
      </div>

      {/* ── Settings ── */}
      <div style={card}>
        <div style={cardTitle}>⚙️ &nbsp;Settings</div>

        {/* Goals */}
        <div style={{ ...subTitle, marginTop: 0 }}>Goals</div>

        <div style={{ marginBottom: 16 }}>
          <div style={fLabel}>Daily Push-up Goal</div>
          <GoalStepper
            value={settings.pushup_goal}
            onChange={v => set('pushup_goal', v)}
            step={10} min={0} max={500}
          />
        </div>

        <div style={{ marginBottom: 16 }}>
          <div style={fLabel}>Sleep Target</div>
          <TimePicker
            fullWidth maxH={14}
            hVal={settings.sleep_goal_h} mVal={settings.sleep_goal_m}
            onHChange={v => set('sleep_goal_h', v)}
            onMChange={v => set('sleep_goal_m', v)}
          />
        </div>

        <div style={{ marginBottom: 16 }}>
          <div style={fLabel}>Daily Screen Time Limit</div>
          <TimePicker
            fullWidth
            hVal={settings.screen_limit_h} mVal={settings.screen_limit_m}
            onHChange={v => set('screen_limit_h', v)}
            onMChange={v => set('screen_limit_m', v)}
          />
        </div>

        <div>
          <div style={fLabel}>Social Media Limit</div>
          <TimePicker
            fullWidth
            hVal={settings.social_limit_h} mVal={settings.social_limit_m}
            onHChange={v => set('social_limit_h', v)}
            onMChange={v => set('social_limit_m', v)}
          />
        </div>

        <div style={divider}/>

        {/* Mesocycle */}
        <div style={{ ...subTitle, marginTop: 0 }}>Mesocycle Tracking</div>
        <div style={{ marginBottom: 14 }}>
          <div style={fLabel}>Week 1 Start Date</div>
          <input
            type="date"
            value={settings.mesocycle_start}
            onChange={e => set('mesocycle_start', e.target.value)}
            style={{ width:'100%', background:'#191928', border:'1px solid rgba(255,255,255,0.07)', borderRadius:10, color:'#f1f5f9', fontFamily:'inherit', fontSize:'0.875rem', padding:'9px 12px', outline:'none', colorScheme:'dark', boxSizing:'border-box' }}
          />
          <div style={{ marginTop:10, padding:'10px 14px', borderRadius:10, background:'rgba(124,58,237,0.08)', border:'1px solid rgba(124,58,237,0.15)' }}>
            {settings.mesocycle_start ? (() => {
              const w = getMesocycleWeek(settings.mesocycle_start)
              const phases = ['Accumulation','Volume+','Intensification','Deload']
              return (
                <p style={{ fontSize:'0.8rem', color:'#9d5ff5', margin:0, fontWeight:600 }}>
                  Currently: Week {w} — {phases[w - 1]}
                </p>
              )
            })() : (
              <p style={{ fontSize:'0.75rem', color:'#475569', margin:0 }}>
                Set the start date to track your mesocycle week automatically.
              </p>
            )}
          </div>
        </div>

        <div style={divider}/>

        {/* Visibility */}
        <div style={{ ...subTitle, marginTop: 0 }}>Today Tab — Show / Hide</div>
        <div style={{ display:'flex', flexDirection:'column', gap:14 }}>
          <Toggle label="Alcohol tracking" checked={settings.show_alcohol}   onChange={v => set('show_alcohol', v)} />
          <Toggle label="Reading habit"    checked={settings.show_reading}   onChange={v => set('show_reading', v)} />
          <Toggle label="Stretching"       checked={settings.show_stretching} onChange={v => set('show_stretching', v)} />
        </div>

        <div style={divider}/>

        {/* Push-up counter */}
        <div style={{ ...subTitle, marginTop: 0 }}>Push-up Counter</div>

        <div style={{ marginBottom: 16 }}>
          <div style={fLabel}>Step size</div>
          <PillGroup
            value={settings.pushup_step}
            onChange={v => set('pushup_step', v)}
            options={[{ label:'5', value:5 }, { label:'10', value:10 }, { label:'25', value:25 }]}
          />
        </div>

        <div>
          <div style={fLabel}>Maximum</div>
          <PillGroup
            value={settings.pushup_max}
            onChange={v => set('pushup_max', v)}
            options={[
              { label:'100',  value:100  },
              { label:'200',  value:200  },
              { label:'300',  value:300  },
              { label:'500',  value:500  },
            ]}
          />
        </div>

        <div style={{ marginTop:16, padding:'10px 14px', borderRadius:10, background:'rgba(124,58,237,0.08)', border:'1px solid rgba(124,58,237,0.15)' }}>
          <p style={{ fontSize:'0.75rem', color:'#7c6aad', lineHeight:1.6, margin:0 }}>
            Settings are saved automatically and applied instantly to the Today tab.
          </p>
        </div>
      </div>

      {/* ── Account ── */}
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

      {/* ── Activity List ── */}
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
            >Add</button>
          </div>
        </div>
      </div>

      {/* ── App info ── */}
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
