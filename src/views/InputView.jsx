import { useState, useEffect, useCallback } from 'react'
import { supabase } from '../lib/supabase'
import { useApp, toast } from '../App'
import { getDayKey, WEEKLY_PLAN } from '../data/trainingPlan'
import TimeInput    from '../components/input/TimeInput'
import Toggle       from '../components/input/Toggle'
import RatingGrid   from '../components/input/RatingGrid'
import QualityPicker from '../components/input/QualityPicker'
import Counter      from '../components/input/Counter'

const BUILT_IN_ACTIVITIES = ['Running','Cycling','Gym','Padel','Home Gym','Tennis','Rest Day']

const FEELINGS = [
  { key: 'feel_physical', label: 'Physical'  },
  { key: 'feel_social',   label: 'Social'    },
  { key: 'feel_work',     label: 'Work'      },
  { key: 'feel_leisure',  label: 'Leisure'   },
  { key: 'feel_inner',    label: 'Inner'     },
  { key: 'feel_overall',  label: 'Overall'   },
]

function todayStr() { return new Date().toISOString().split('T')[0] }

function fmtDate(str) {
  const d = new Date(str + 'T12:00:00')
  const isToday = str === todayStr()
  const label = d.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })
  return isToday ? `Today · ${label}` : label
}

const EMPTY = {
  sleep_h: '', sleep_m: '', wake_h: '', wake_m: '',
  sleep_quality: null, morning_routine: false,
  activity: '', pushups: 0, stretching: false,
  day_rating: null,
  screen_h: '', screen_m: '', social_h: '', social_m: '',
  reading: false, alcohol: false,
  feel_physical: null, feel_social: null, feel_work: null,
  feel_leisure: null, feel_inner: null, feel_overall: null,
}

const card = { background:'#111120', border:'1px solid rgba(255,255,255,0.07)', borderRadius:16, padding:20, marginBottom:12 }
const cardTitle = { fontSize:'0.68rem', fontWeight:700, textTransform:'uppercase', letterSpacing:'0.1em', color:'#94a3b8', marginBottom:16, display:'flex', alignItems:'center', gap:8 }
const iconBox = (bg) => ({ width:28, height:28, borderRadius:8, display:'flex', alignItems:'center', justifyContent:'center', fontSize:14, background:bg, flexShrink:0 })
const fieldLabel = { fontSize:'0.8125rem', fontWeight:600, color:'#cbd5e1', marginBottom:8, display:'flex', alignItems:'center', gap:6 }
const dot = { width:6, height:6, borderRadius:'50%', background:'#7c3aed', flexShrink:0 }

export default function InputView() {
  const { session, customActivities, addCustomActivity } = useApp()
  const [date,   setDate]   = useState(todayStr())
  const [form,   setForm]   = useState(EMPTY)
  const [saving, setSaving] = useState(false)
  const [saved,  setSaved]  = useState(false)
  const [newAct, setNewAct] = useState('')
  const [entryId, setEntryId] = useState(null)

  const daySession = WEEKLY_PLAN[getDayKey(date)]

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
      // Merge nulls → empty strings for time fields
      setForm({
        ...EMPTY,
        ...Object.fromEntries(Object.entries(rest).map(([k,v]) => [k, v ?? EMPTY[k]])),
      })
    } else {
      setEntryId(null)
      setForm(EMPTY)
    }
    setSaved(false)
  }, [session.user.id])

  useEffect(() => { loadEntry(date) }, [date, loadEntry])

  function set(key, val) { setForm(f => ({ ...f, [key]: val })) }

  async function handleSave(e) {
    e?.preventDefault()
    setSaving(true)
    const payload = {
      user_id: session.user.id,
      date,
      ...form,
      sleep_h:  form.sleep_h  === '' ? null : Number(form.sleep_h),
      sleep_m:  form.sleep_m  === '' ? null : Number(form.sleep_m),
      wake_h:   form.wake_h   === '' ? null : Number(form.wake_h),
      wake_m:   form.wake_m   === '' ? null : Number(form.wake_m),
      screen_h: form.screen_h === '' ? null : Number(form.screen_h),
      screen_m: form.screen_m === '' ? null : Number(form.screen_m),
      social_h: form.social_h === '' ? null : Number(form.social_h),
      social_m: form.social_m === '' ? null : Number(form.social_m),
      updated_at: new Date().toISOString(),
    }

    const { error } = entryId
      ? await supabase.from('daily_entries').update(payload).eq('id', entryId)
      : await supabase.from('daily_entries').insert(payload)

    if (error) {
      toast(error.message, 'error')
    } else {
      setSaved(true)
      toast('Entry saved!')
      if (!entryId) loadEntry(date)
    }
    setSaving(false)
  }

  async function handleAddActivity() {
    const t = newAct.trim()
    if (!t) return
    await addCustomActivity(t)
    setNewAct('')
    set('activity', t)
  }

  const allActivities = [...BUILT_IN_ACTIVITIES, ...customActivities.map(a => a.name)]

  /* ── Derived: sleep duration ── */
  const sleepDuration = (() => {
    if (form.sleep_h === '' || form.wake_h === '') return null
    const s = (Number(form.sleep_h) || 0) * 60 + (Number(form.sleep_m) || 0)
    let w = (Number(form.wake_h) || 0) * 60 + (Number(form.wake_m) || 0)
    if (w <= s) w += 24 * 60
    const diff = w - s
    return `${Math.floor(diff / 60)}h ${diff % 60}m`
  })()

  return (
    <div style={{ maxWidth: 640, margin: '0 auto', padding: '0 16px' }}>
      {/* Header */}
      <div className="flex items-center justify-between py-5">
        <div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 800, letterSpacing: '-0.03em' }}>Daily Log</h1>
          <p style={{ fontSize: '0.8rem', color: '#94a3b8', marginTop: 2 }}>{fmtDate(date)}</p>
        </div>
        {saved && <span style={{ fontSize: '0.78rem', color: '#10b981', fontWeight: 600 }}>✓ Saved</span>}
      </div>

      {/* Date navigator */}
      <div className="flex items-center justify-between rounded-xl px-4 py-2.5 mb-4" style={{ background: '#111120', border: '1px solid rgba(255,255,255,0.07)' }}>
        <button onClick={() => setDate(d => { const n = new Date(d + 'T12:00:00'); n.setDate(n.getDate()-1); return n.toISOString().split('T')[0] })}
          style={{ ...navBtnStyle }}>‹</button>
        <span style={{ fontSize: '0.875rem', fontWeight: 600, color: '#cbd5e1' }}>{fmtDate(date).split(' · ').pop()}</span>
        <button onClick={() => setDate(d => { const n = new Date(d + 'T12:00:00'); if (d === todayStr()) return d; n.setDate(n.getDate()+1); return n.toISOString().split('T')[0] })}
          style={{ ...navBtnStyle, opacity: date === todayStr() ? 0.3 : 1 }}>›</button>
      </div>

      {/* Today's training hint */}
      {daySession && daySession.type === 'gym' && (
        <div className="rounded-xl px-4 py-3 mb-3 flex items-center gap-3" style={{ background: 'rgba(124,58,237,0.1)', border: '1px solid rgba(124,58,237,0.25)' }}>
          <span style={{ fontSize: '1.25rem' }}>{daySession.emoji}</span>
          <div>
            <div style={{ fontSize: '0.8rem', fontWeight: 700, color: '#9d5ff5' }}>Today's session</div>
            <div style={{ fontSize: '0.78rem', color: '#94a3b8' }}>{daySession.name} — {daySession.subtitle}</div>
          </div>
        </div>
      )}

      <form onSubmit={handleSave}>

        {/* ── SLEEP ── */}
        <div style={card}>
          <div style={cardTitle}>
            <span style={iconBox('rgba(59,130,246,0.15)')}>😴</span>
            Sleep
          </div>

          <div style={{ marginBottom: 18 }}>
            <div style={fieldLabel}><span style={dot}/>Sleep Time</div>
            <TimeInput hVal={form.sleep_h} mVal={form.sleep_m} onHChange={v=>set('sleep_h',v)} onMChange={v=>set('sleep_m',v)} placeholder={['22','30']}/>
          </div>

          <div style={{ marginBottom: 18 }}>
            <div style={fieldLabel}><span style={dot}/>Wake Up Time</div>
            <TimeInput hVal={form.wake_h} mVal={form.wake_m} onHChange={v=>set('wake_h',v)} onMChange={v=>set('wake_m',v)} placeholder={['07','00']}/>
            {sleepDuration && <p style={{ fontSize:'0.78rem', color:'#94a3b8', marginTop:6 }}>Sleep duration: <strong style={{color:'#f1f5f9'}}>{sleepDuration}</strong></p>}
          </div>

          <div style={{ marginBottom: 18 }}>
            <div style={fieldLabel}><span style={dot}/>Sleep Quality</div>
            <QualityPicker value={form.sleep_quality} onChange={v=>set('sleep_quality',v)}/>
          </div>

          <Toggle label="Morning routine completed" checked={form.morning_routine} onChange={v=>set('morning_routine',v)}/>
        </div>

        {/* ── TRAINING ── */}
        <div style={card}>
          <div style={cardTitle}>
            <span style={iconBox('rgba(239,68,68,0.15)')}>🏋️</span>
            Training
          </div>

          <div style={{ marginBottom: 18 }}>
            <div style={fieldLabel}><span style={dot}/>Activity</div>
            <select
              value={form.activity}
              onChange={e => set('activity', e.target.value)}
              style={{
                width:'100%', background:'#191928', border:'1px solid rgba(255,255,255,0.07)',
                borderRadius:10, color:'#f1f5f9', fontFamily:'inherit', fontSize:'0.9375rem',
                padding:'12px 36px 12px 14px', outline:'none', cursor:'pointer',
                WebkitAppearance:'none', appearance:'none',
                backgroundImage:`url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='8' viewBox='0 0 12 8'%3E%3Cpath d='M1 1l5 5 5-5' stroke='%2364748b' stroke-width='1.5' fill='none' stroke-linecap='round'/%3E%3C/svg%3E")`,
                backgroundRepeat:'no-repeat', backgroundPosition:'right 14px center',
              }}
            >
              <option value="">— Select activity —</option>
              {allActivities.map(a => <option key={a} value={a}>{a}</option>)}
            </select>
            <div style={{ display:'flex', gap:8, marginTop:8 }}>
              <input
                type="text" placeholder="Add custom activity…"
                value={newAct} onChange={e => setNewAct(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), handleAddActivity())}
                style={{ flex:1, background:'#191928', border:'1px solid rgba(255,255,255,0.07)', borderRadius:10, color:'#f1f5f9', fontFamily:'inherit', fontSize:'0.875rem', padding:'9px 12px', outline:'none' }}
              />
              <button type="button" onClick={handleAddActivity}
                style={{ background:'#21213a', border:'1px solid rgba(255,255,255,0.07)', borderRadius:10, color:'#cbd5e1', fontFamily:'inherit', fontSize:'0.875rem', fontWeight:600, padding:'9px 14px', cursor:'pointer', whiteSpace:'nowrap' }}>
                Add
              </button>
            </div>
          </div>

          <div style={{ marginBottom: 18 }}>
            <div style={fieldLabel}><span style={dot}/>Push-up Count</div>
            <Counter value={form.pushups} onChange={v=>set('pushups',v)}/>
          </div>

          <Toggle label="Stretching done" checked={form.stretching} onChange={v=>set('stretching',v)}/>
        </div>

        {/* ── GENERAL ── */}
        <div style={card}>
          <div style={cardTitle}>
            <span style={iconBox('rgba(245,158,11,0.15)')}>📊</span>
            General
          </div>

          <div style={{ marginBottom: 18 }}>
            <RatingGrid label="Day Rating" value={form.day_rating} onChange={v=>set('day_rating',v)}/>
          </div>

          <div style={{ marginBottom: 18 }}>
            <div style={fieldLabel}><span style={dot}/>Overall Screen Time</div>
            <TimeInput hVal={form.screen_h} mVal={form.screen_m} onHChange={v=>set('screen_h',v)} onMChange={v=>set('screen_m',v)} placeholder={['04','30']}/>
          </div>

          <div style={{ marginBottom: 18 }}>
            <div style={fieldLabel}><span style={dot}/>Social Media Time</div>
            <TimeInput hVal={form.social_h} mVal={form.social_m} onHChange={v=>set('social_h',v)} onMChange={v=>set('social_m',v)} placeholder={['01','00']}/>
          </div>

          <div style={{ marginBottom: 14 }}>
            <Toggle label="Reading" checked={form.reading} onChange={v=>set('reading',v)}/>
          </div>
          <Toggle label="Alcohol" checked={form.alcohol} onChange={v=>set('alcohol',v)}/>
        </div>

        {/* ── FEELINGS ── */}
        <div style={card}>
          <div style={cardTitle}>
            <span style={iconBox('rgba(16,185,129,0.15)')}>💭</span>
            How I Felt
          </div>
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:16 }}>
            {FEELINGS.map(f => (
              <div key={f.key}>
                <RatingGrid label={f.label} value={form[f.key]} onChange={v=>set(f.key,v)}/>
              </div>
            ))}
          </div>
        </div>

        {/* Save */}
        <button
          type="submit"
          disabled={saving}
          style={{
            width:'100%', padding:'14px', borderRadius:12, border:'none',
            background: saving ? '#2a1a5e' : 'linear-gradient(135deg, #7c3aed 0%, #9d5ff5 100%)',
            color:'#fff', fontFamily:'inherit', fontSize:'0.9375rem', fontWeight:700,
            cursor: saving ? 'not-allowed' : 'pointer',
            boxShadow:'0 4px 16px rgba(124,58,237,0.3)',
            marginBottom: 8, opacity: saving ? 0.7 : 1,
            transition:'all 0.15s',
          }}
        >
          {saving ? 'Saving…' : entryId ? 'Update Entry' : 'Save Entry'}
        </button>
        <div style={{ textAlign:'center', fontSize:'0.78rem', color:'#64748b', minHeight:20, marginBottom:24 }}>
          {saved && '✓ Saved successfully'}
        </div>

      </form>
    </div>
  )
}

const navBtnStyle = {
  width: 30, height: 30,
  background: '#191928', border: '1px solid rgba(255,255,255,0.07)',
  borderRadius: 8, color: '#94a3b8', fontSize: '1.1rem',
  cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
  fontFamily: 'inherit',
}
