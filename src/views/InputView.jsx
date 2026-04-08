import { useState, useEffect, useCallback } from 'react'
import { supabase } from '../lib/supabase'
import { useApp, toast } from '../App'
import { getDayKey, WEEKLY_PLAN } from '../data/trainingPlan'
import TimePicker       from '../components/input/TimePicker'
import Toggle           from '../components/input/Toggle'
import RatingGrid       from '../components/input/RatingGrid'
import QualityPicker    from '../components/input/QualityPicker'
import Counter          from '../components/input/Counter'
import CalendarOverview from '../components/CalendarOverview'

/* ── Activities (alphabetical) ────────────────────── */
const BUILT_IN_ACTIVITIES = [
  'Cycling', 'Gym', 'Home Gym', 'Other', 'Padel',
  'Rest Day', 'Running', 'Swim', 'Tennis',
]

/* ── Gym session selector ─────────────────────────── */
const GYM_SESSIONS = [
  { key: 'upper_a',  label: 'Upper Body A', desc: 'Mon · Push + Skill'   },
  { key: 'legs',     label: 'Legs',          desc: 'Tue · Strength + Physio' },
  { key: 'upper_b',  label: 'Upper Body B',  desc: 'Thu · Pull + Skill'  },
  { key: 'legs_fri', label: 'Legs',          desc: 'Fri · Strength + Physio' },
]

/* ── Feelings (5 user-rated, overall auto) ────────── */
const FEELING_KEYS = [
  { key: 'feel_physical', label: 'Physical' },
  { key: 'feel_social',   label: 'Social'   },
  { key: 'feel_work',     label: 'Work'     },
  { key: 'feel_leisure',  label: 'Leisure'  },
  { key: 'feel_inner',    label: 'Inner'    },
]

function todayStr() { return new Date().toISOString().split('T')[0] }

function fmtDate(str) {
  const d = new Date(str + 'T12:00:00')
  const isToday = str === todayStr()
  const label = d.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })
  return isToday ? `Today · ${label}` : label
}

const EMPTY = {
  /* sleep_h / sleep_m now store DURATION (not time-of-day) */
  sleep_h: 7,  sleep_m: 30,
  wake_h: 7,   wake_m: 0,
  sleep_quality: null, morning_routine: false,
  activity: '', gym_session: '',
  pushups: 0, stretching: false,
  day_rating: null,
  screen_h: 0, screen_m: 0,
  social_h: 0, social_m: 0,
  reading: false, alcohol: false, num_drinks: 0,
  feel_physical: null, feel_social: null, feel_work: null,
  feel_leisure: null,  feel_inner: null,  feel_overall: null,
}

/* ── Shared styles ────────────────────────────────── */
const card      = { background:'#111120', border:'1px solid rgba(255,255,255,0.07)', borderRadius:16, padding:20, marginBottom:12 }
const cardTitle = { fontSize:'0.68rem', fontWeight:700, textTransform:'uppercase', letterSpacing:'0.1em', color:'#94a3b8', marginBottom:16, display:'flex', alignItems:'center', gap:8 }
const iconBox   = (bg) => ({ width:28, height:28, borderRadius:8, display:'flex', alignItems:'center', justifyContent:'center', fontSize:14, background:bg, flexShrink:0 })
const fLabel    = { fontSize:'0.8125rem', fontWeight:600, color:'#cbd5e1', marginBottom:8, display:'flex', alignItems:'center', gap:6 }
const dot       = { width:6, height:6, borderRadius:'50%', background:'#7c3aed', flexShrink:0 }

/* ── Overall feeling rating bar (display only) ──────── */
const FEEL_COLORS = ['#ef4444','#f97316','#f59e0b','#eab308','#84cc16','#22c55e','#10b981','#14b8a6','#3b82f6','#8b5cf6']

function OverallBar({ value }) {
  if (!value) return (
    <div style={{ fontSize:'0.8rem', color:'#475569', fontStyle:'italic' }}>
      Fill in the 5 ratings above to auto-calculate
    </div>
  )
  const color = FEEL_COLORS[value - 1]
  return (
    <div style={{ display:'flex', alignItems:'center', gap:12 }}>
      <div style={{ flex:1, height:8, borderRadius:4, background:'rgba(255,255,255,0.05)', overflow:'hidden' }}>
        <div style={{ width:`${value * 10}%`, height:'100%', borderRadius:4, background:color, transition:'width 0.3s ease' }}/>
      </div>
      <span style={{ fontSize:'1.2rem', fontWeight:800, color, minWidth:32, textAlign:'right' }}>{value}<span style={{ fontSize:'0.7rem', color:'#64748b', fontWeight:400 }}>/10</span></span>
    </div>
  )
}

export default function InputView() {
  const { session, customActivities, addCustomActivity } = useApp()
  const [date,    setDate]    = useState(todayStr())
  const [form,    setForm]    = useState(EMPTY)
  const [saving,  setSaving]  = useState(false)
  const [saved,   setSaved]   = useState(false)
  const [newAct,  setNewAct]  = useState('')
  const [entryId, setEntryId] = useState(null)

  const daySession = WEEKLY_PLAN[getDayKey(date)]

  /* ── Load entry for date ── */
  const loadEntry = useCallback(async (d) => {
    const { data } = await supabase
      .from('daily_entries')
      .select('*')
      .eq('user_id', session.user.id)
      .eq('date', d)
      .maybeSingle()

    if (data) {
      setEntryId(data.id)
      const { id, user_id, created_at, updated_at, date: _d, ...rest } = data
      setForm({ ...EMPTY, ...Object.fromEntries(Object.entries(rest).map(([k,v]) => [k, v ?? EMPTY[k]])) })
    } else {
      setEntryId(null)
      setForm(EMPTY)
    }
    setSaved(false)
  }, [session.user.id])

  useEffect(() => { loadEntry(date) }, [date, loadEntry])

  function set(key, val) { setForm(f => ({ ...f, [key]: val })) }

  /* ── Auto-calculate overall feeling ── */
  const autoOverall = (() => {
    const vals = FEELING_KEYS.map(f => form[f.key]).filter(v => v != null)
    if (!vals.length) return null
    return Math.round(vals.reduce((s,v) => s + v, 0) / vals.length)
  })()

  useEffect(() => {
    set('feel_overall', autoOverall)
  }, [form.feel_physical, form.feel_social, form.feel_work, form.feel_leisure, form.feel_inner])  // eslint-disable-line

  /* ── Save ── */
  async function handleSave(e) {
    e?.preventDefault()
    setSaving(true)
    const payload = {
      user_id: session.user.id,
      date,
      ...form,
      feel_overall: autoOverall,
      updated_at: new Date().toISOString(),
    }
    const { error } = entryId
      ? await supabase.from('daily_entries').update(payload).eq('id', entryId)
      : await supabase.from('daily_entries').insert(payload)
    if (error) { toast(error.message, 'error') }
    else { setSaved(true); toast('Entry saved!'); if (!entryId) loadEntry(date) }
    setSaving(false)
  }

  /* ── Reset day (delete entry) ── */
  async function handleReset() {
    if (!entryId) return
    if (!window.confirm('Delete all data for this day?')) return
    await supabase.from('daily_entries').delete().eq('id', entryId)
    setEntryId(null)
    setForm(EMPTY)
    setSaved(false)
    toast('Day reset', 'info')
  }

  async function handleAddActivity() {
    const t = newAct.trim()
    if (!t) return
    await addCustomActivity(t)
    setNewAct('')
    set('activity', t)
  }

  /* ── Sorted activity list ── */
  const customNames = customActivities.map(a => a.name)
  const allActivities = [...new Set([...BUILT_IN_ACTIVITIES, ...customNames])].sort()

  return (
    <div style={{ maxWidth: 640, margin: '0 auto', padding: '0 16px' }}>

      {/* ── Header ── */}
      <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', padding:'20px 0 16px' }}>
        <div>
          <h1 style={{ fontSize:'1.5rem', fontWeight:800, letterSpacing:'-0.03em' }}>Daily Log</h1>
          <p style={{ fontSize:'0.8rem', color:'#94a3b8', marginTop:2 }}>{fmtDate(date)}</p>
        </div>
        <div style={{ display:'flex', alignItems:'center', gap:8 }}>
          {saved && <span style={{ fontSize:'0.78rem', color:'#10b981', fontWeight:600 }}>✓ Saved</span>}
          {entryId && (
            <button onClick={handleReset}
              style={{ background:'rgba(239,68,68,0.1)', border:'1px solid rgba(239,68,68,0.25)', borderRadius:8, color:'#ef4444', fontFamily:'inherit', fontSize:'0.75rem', fontWeight:600, padding:'6px 10px', cursor:'pointer' }}>
              Reset day
            </button>
          )}
        </div>
      </div>

      {/* ── Calendar ── */}
      <CalendarOverview selectedDate={date} onSelectDate={setDate} onReset={entryId ? handleReset : null} />

      {/* ── Training hint ── */}
      {daySession?.type === 'gym' && (
        <div style={{ background:'rgba(124,58,237,0.1)', border:'1px solid rgba(124,58,237,0.25)', borderRadius:12, padding:'10px 14px', marginBottom:12, display:'flex', alignItems:'center', gap:10 }}>
          <span style={{ fontSize:'1.2rem' }}>{daySession.emoji}</span>
          <div>
            <div style={{ fontSize:'0.8rem', fontWeight:700, color:'#9d5ff5' }}>Today's session</div>
            <div style={{ fontSize:'0.76rem', color:'#94a3b8' }}>{daySession.name} — {daySession.subtitle}</div>
          </div>
        </div>
      )}

      <form onSubmit={handleSave}>

        {/* ══ SLEEP ══ */}
        <div style={card}>
          <div style={cardTitle}><span style={iconBox('rgba(59,130,246,0.15)')}>😴</span>Sleep</div>

          {/* Duration + Wake side by side */}
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:12, marginBottom:16 }}>
            <div>
              <div style={fLabel}><span style={dot}/>Sleep Duration</div>
              <TimePicker maxH={14} hVal={form.sleep_h} mVal={form.sleep_m}
                onHChange={v => set('sleep_h', v)} onMChange={v => set('sleep_m', v)} />
            </div>
            <div>
              <div style={fLabel}><span style={dot}/>Wake Up Time</div>
              <TimePicker hVal={form.wake_h} mVal={form.wake_m}
                onHChange={v => set('wake_h', v)} onMChange={v => set('wake_m', v)} />
            </div>
          </div>

          <div style={{ marginBottom:16 }}>
            <div style={fLabel}><span style={dot}/>Sleep Quality</div>
            <QualityPicker value={form.sleep_quality} onChange={v => set('sleep_quality', v)} />
          </div>

          <Toggle label="Morning routine completed" checked={form.morning_routine} onChange={v => set('morning_routine', v)} />
        </div>

        {/* ══ TRAINING ══ */}
        <div style={card}>
          <div style={cardTitle}><span style={iconBox('rgba(239,68,68,0.15)')}>🏋️</span>Training</div>

          <div style={{ marginBottom:16 }}>
            <div style={fLabel}><span style={dot}/>Activity</div>
            <select value={form.activity} onChange={e => set('activity', e.target.value)} style={selectStyle}>
              <option value="">— Select activity —</option>
              {allActivities.map(a => <option key={a} value={a}>{a}</option>)}
            </select>
            <div style={{ display:'flex', gap:8, marginTop:8 }}>
              <input type="text" placeholder="Add custom activity…" value={newAct}
                onChange={e => setNewAct(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), handleAddActivity())}
                style={inputStyle} />
              <button type="button" onClick={handleAddActivity} style={addBtnStyle}>Add</button>
            </div>
          </div>

          {/* Gym session selector */}
          {form.activity === 'Gym' && (
            <div style={{ marginBottom:16 }}>
              <div style={fLabel}><span style={dot}/>Which Session?</div>
              <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:8 }}>
                {GYM_SESSIONS.map(s => (
                  <button key={s.key} type="button" onClick={() => set('gym_session', s.key)}
                    style={{
                      padding:'10px 12px', borderRadius:10, border:`1px solid ${form.gym_session === s.key ? 'rgba(124,58,237,0.5)' : 'rgba(255,255,255,0.07)'}`,
                      background: form.gym_session === s.key ? 'rgba(124,58,237,0.18)' : '#191928',
                      color: form.gym_session === s.key ? '#9d5ff5' : '#94a3b8',
                      fontFamily:'inherit', cursor:'pointer', textAlign:'left', transition:'all 0.15s',
                    }}>
                    <div style={{ fontSize:'0.8rem', fontWeight:700 }}>{s.label}</div>
                    <div style={{ fontSize:'0.7rem', color:'#64748b', marginTop:2 }}>{s.desc}</div>
                  </button>
                ))}
              </div>
            </div>
          )}

          <div style={{ marginBottom:16 }}>
            <div style={fLabel}><span style={dot}/>Push-up Count</div>
            <Counter value={form.pushups} onChange={v => set('pushups', v)} />
          </div>

          <Toggle label="Stretching done" checked={form.stretching} onChange={v => set('stretching', v)} />
        </div>

        {/* ══ GENERAL ══ */}
        <div style={card}>
          <div style={cardTitle}><span style={iconBox('rgba(245,158,11,0.15)')}>📊</span>General</div>

          <div style={{ marginBottom:16 }}>
            <RatingGrid label="Day Rating" value={form.day_rating} onChange={v => set('day_rating', v)} />
          </div>

          {/* Screen time + Social media side by side */}
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:12, marginBottom:16 }}>
            <div>
              <div style={fLabel}><span style={dot}/>Screen Time</div>
              <TimePicker hVal={form.screen_h} mVal={form.screen_m}
                onHChange={v => set('screen_h', v)} onMChange={v => set('screen_m', v)} />
            </div>
            <div>
              <div style={fLabel}><span style={dot}/>Social Media</div>
              <TimePicker hVal={form.social_h} mVal={form.social_m}
                onHChange={v => set('social_h', v)} onMChange={v => set('social_m', v)} />
            </div>
          </div>

          <div style={{ marginBottom:14 }}>
            <Toggle label="Reading" checked={form.reading} onChange={v => set('reading', v)} />
          </div>

          <Toggle label="Alcohol" checked={form.alcohol} onChange={v => set('alcohol', v)} />

          {form.alcohol && (
            <div style={{ marginTop:14 }}>
              <div style={fLabel}><span style={dot}/>Number of Drinks</div>
              <Counter value={form.num_drinks} onChange={v => set('num_drinks', v)} />
            </div>
          )}
        </div>

        {/* ══ HOW I FEEL ══ */}
        <div style={card}>
          <div style={cardTitle}><span style={iconBox('rgba(16,185,129,0.15)')}>💭</span>How I Feel</div>

          {/* 5 user-rated feelings — 1 col on mobile, 2 col on wider */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4" style={{ marginBottom:20 }}>
            {FEELING_KEYS.map(f => (
              <div key={f.key}>
                <RatingGrid label={f.label} value={form[f.key]} onChange={v => set(f.key, v)} />
              </div>
            ))}
          </div>

          {/* Auto-calculated overall */}
          <div style={{ borderTop:'1px solid rgba(255,255,255,0.07)', paddingTop:14 }}>
            <div style={{ ...fLabel, marginBottom:10 }}>
              <span style={dot}/>Overall
              <span style={{ fontSize:'0.7rem', color:'#475569', fontWeight:400, marginLeft:4 }}>· auto-calculated</span>
            </div>
            <OverallBar value={autoOverall} />
          </div>
        </div>

        {/* Save */}
        <button type="submit" disabled={saving}
          style={{ width:'100%', padding:'14px', borderRadius:12, border:'none',
            background: saving ? '#2a1a5e' : 'linear-gradient(135deg,#7c3aed 0%,#9d5ff5 100%)',
            color:'#fff', fontFamily:'inherit', fontSize:'0.9375rem', fontWeight:700,
            cursor: saving ? 'not-allowed' : 'pointer', boxShadow:'0 4px 16px rgba(124,58,237,0.3)',
            marginBottom:8, opacity: saving ? 0.7 : 1, transition:'all 0.15s' }}>
          {saving ? 'Saving…' : entryId ? 'Update Entry' : 'Save Entry'}
        </button>
        <div style={{ textAlign:'center', fontSize:'0.78rem', color:'#64748b', minHeight:20, marginBottom:24 }}>
          {saved && '✓ Saved successfully'}
        </div>
      </form>
    </div>
  )
}

/* ── Shared inline styles ── */
const selectStyle = {
  width:'100%', background:'#191928', border:'1px solid rgba(255,255,255,0.07)',
  borderRadius:10, color:'#f1f5f9', fontFamily:'inherit', fontSize:'0.9375rem',
  padding:'12px 36px 12px 14px', outline:'none', cursor:'pointer',
  WebkitAppearance:'none', appearance:'none',
  backgroundImage:`url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='8' viewBox='0 0 12 8'%3E%3Cpath d='M1 1l5 5 5-5' stroke='%2364748b' stroke-width='1.5' fill='none' stroke-linecap='round'/%3E%3C/svg%3E")`,
  backgroundRepeat:'no-repeat', backgroundPosition:'right 14px center',
}
const inputStyle = {
  flex:1, background:'#191928', border:'1px solid rgba(255,255,255,0.07)',
  borderRadius:10, color:'#f1f5f9', fontFamily:'inherit', fontSize:'0.875rem',
  padding:'9px 12px', outline:'none',
}
const addBtnStyle = {
  background:'#21213a', border:'1px solid rgba(255,255,255,0.07)', borderRadius:10,
  color:'#cbd5e1', fontFamily:'inherit', fontSize:'0.875rem', fontWeight:600,
  padding:'9px 14px', cursor:'pointer', whiteSpace:'nowrap',
}
