import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { useApp, toast } from '../App'
import {
  MORNING_ROUTINE, WEEKLY_PLAN, PUSHUP_ROTATION, PROGRESSION,
  DAY_KEYS, DAY_LABELS, getDayKey, getWeekNumber,
} from '../data/trainingPlan'

const card = { background:'#111120', border:'1px solid rgba(255,255,255,0.07)', borderRadius:16, padding:20, marginBottom:12, boxShadow:'0 4px 24px rgba(0,0,0,0.4)' }
const cardTitle = { fontSize:'0.68rem', fontWeight:700, textTransform:'uppercase', letterSpacing:'0.1em', color:'#94a3b8', marginBottom:16, display:'flex', alignItems:'center', gap:8 }

function todayStr() { return new Date().toISOString().split('T')[0] }

/** Get the Monday of the current week */
function weekStart(date = new Date()) {
  const d = new Date(date)
  const day = d.getDay()
  const diff = (day === 0 ? -6 : 1 - day)
  d.setDate(d.getDate() + diff)
  return d.toISOString().split('T')[0]
}

function addDays(dateStr, n) {
  const d = new Date(dateStr + 'T12:00:00')
  d.setDate(d.getDate() + n)
  return d.toISOString().split('T')[0]
}

const focusBadgeColor = {
  Skill: '#9d5ff5', Strength: '#3b82f6', Hypertrophy: '#ec4899',
  Isolation: '#f59e0b', Shoulder: '#14b8a6', Back: '#22c55e',
  Core: '#f97316', Physio: '#10b981', Padel: '#6366f1',
  Explosive: '#ef4444', Hamstrings: '#f97316', 'Shin Splints': '#ef4444',
  'Skill prep': '#a855f7',
}
const focusColor = (f) => focusBadgeColor[f] || '#94a3b8'

export default function TrainingView() {
  const { session } = useApp()
  const today = todayStr()
  const todayDayKey = getDayKey(today)
  const [selectedDay, setSelectedDay] = useState(todayDayKey)
  const [completions,  setCompletions]  = useState({})   // date → true
  const [weekOffset,   setWeekOffset]   = useState(0)
  const [openBlocks,   setOpenBlocks]   = useState({})
  const [morningOpen,  setMorningOpen]  = useState(false)
  const [expandSession, setExpandSession] = useState(true)

  const ws = addDays(weekStart(), weekOffset * 7)

  /* Build the 7 dates for displayed week */
  const weekDates = DAY_KEYS.map((_, i) => addDays(ws, i))

  /* Load completions for visible week */
  useEffect(() => {
    async function load() {
      const { data } = await supabase
        .from('training_completions')
        .select('date')
        .eq('user_id', session.user.id)
        .gte('date', weekDates[0])
        .lte('date', weekDates[6])
      if (data) {
        const map = {}
        data.forEach(r => { map[r.date] = true })
        setCompletions(map)
      }
    }
    load()
  }, [weekOffset, session.user.id])  // eslint-disable-line

  async function markComplete(dateStr) {
    const dayKey = getDayKey(dateStr)
    const session_ = WEEKLY_PLAN[dayKey]
    if (!session_ || session_.type === 'rest') return

    const { error } = await supabase
      .from('training_completions')
      .upsert({ user_id: session.user.id, date: dateStr, session_key: dayKey }, { onConflict: 'user_id,date' })

    if (!error) {
      setCompletions(prev => ({ ...prev, [dateStr]: true }))
      /* Also update daily entry activity */
      await supabase.from('daily_entries').upsert(
        { user_id: session.user.id, date: dateStr, activity: 'Gym' },
        { onConflict: 'user_id,date', ignoreDuplicates: false }
      )
      toast('Session marked complete! ✓')
    }
  }

  async function unmarkComplete(dateStr) {
    await supabase
      .from('training_completions')
      .delete()
      .eq('user_id', session.user.id)
      .eq('date', dateStr)
    setCompletions(prev => { const n = {...prev}; delete n[dateStr]; return n })
    toast('Completion removed', 'info')
  }

  const selectedDate   = weekDates[DAY_KEYS.indexOf(selectedDay)]
  const selectedSession = WEEKLY_PLAN[selectedDay]
  const isDone = !!completions[selectedDate]
  const currentWeekNum = getWeekNumber(today)
  const pushupWeekIdx  = ((currentWeekNum - 1) % PUSHUP_ROTATION.length)

  return (
    <div style={{ maxWidth: 640, margin: '0 auto', padding: '0 16px' }}>
      <div className="py-5">
        <h1 style={{ fontSize: '1.5rem', fontWeight: 800, letterSpacing: '-0.03em' }}>Training Plan</h1>
        <p style={{ fontSize: '0.8rem', color: '#94a3b8', marginTop: 2 }}>Padel Performance · Hypertrophy · Calisthenics</p>
      </div>

      {/* Week navigation */}
      <div className="flex items-center justify-between mb-3">
        <button onClick={() => setWeekOffset(w => w - 1)} style={weekNavBtn}>‹ Prev</button>
        <span style={{ fontSize: '0.8rem', fontWeight: 600, color: '#94a3b8' }}>
          {weekOffset === 0 ? 'This Week' : weekOffset === -1 ? 'Last Week' : `${Math.abs(weekOffset)} weeks ${weekOffset < 0 ? 'ago' : 'ahead'}`}
        </span>
        <button onClick={() => setWeekOffset(w => w + 1)} style={weekNavBtn}>Next ›</button>
      </div>

      {/* Week strip */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 4, marginBottom: 16 }}>
        {DAY_KEYS.map((key, i) => {
          const date = weekDates[i]
          const isToday   = date === today
          const isSelected = key === selectedDay
          const done = !!completions[date]
          const session = WEEKLY_PLAN[key]
          return (
            <button
              key={key}
              onClick={() => setSelectedDay(key)}
              style={{
                display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4,
                padding: '8px 4px', borderRadius: 10, cursor: 'pointer',
                background: isSelected ? 'rgba(124,58,237,0.15)' : 'transparent',
                border: `1px solid ${isSelected ? 'rgba(124,58,237,0.4)' : 'transparent'}`,
                transition: 'all 0.15s',
                fontFamily: 'inherit',
              }}
            >
              <span style={{ fontSize: '0.62rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', color: isToday ? '#9d5ff5' : '#64748b' }}>
                {DAY_LABELS[i]}
              </span>
              <span style={{
                width: 8, height: 8, borderRadius: '50%', flexShrink: 0,
                background: done ? '#10b981' : session?.type === 'gym' ? 'rgba(124,58,237,0.4)' : 'rgba(255,255,255,0.07)',
                boxShadow: done ? '0 0 6px rgba(16,185,129,0.5)' : 'none',
                border: isToday && !done ? '1.5px solid #9d5ff5' : '1.5px solid transparent',
              }} />
            </button>
          )
        })}
      </div>

      {/* Selected session card */}
      {selectedSession && (
        <div style={card}>
          <div className="flex items-center gap-3 cursor-pointer" onClick={() => setExpandSession(e => !e)}>
            <div style={{ width:44, height:44, borderRadius:12, background:'#191928', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'1.4rem', flexShrink:0 }}>
              {selectedSession.emoji}
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize:'1rem', fontWeight:700 }}>{selectedSession.name}</div>
              <div style={{ fontSize:'0.78rem', color:'#94a3b8', marginTop:2 }}>{selectedSession.subtitle}{selectedSession.duration ? ` · ${selectedSession.duration}` : ''}</div>
            </div>
            {isDone && <span style={{ fontSize:'0.72rem', fontWeight:700, padding:'4px 10px', borderRadius:999, background:'rgba(16,185,129,0.15)', color:'#10b981', border:'1px solid rgba(16,185,129,0.3)' }}>✓ Done</span>}
            {!isDone && selectedSession.type === 'gym' && <span style={{ fontSize:'0.72rem', fontWeight:700, padding:'4px 10px', borderRadius:999, background:'#191928', color:'#64748b' }}>Pending</span>}
            {selectedSession.type === 'rest' && <span style={{ fontSize:'0.72rem', fontWeight:700, padding:'4px 10px', borderRadius:999, background:'rgba(59,130,246,0.12)', color:'#3b82f6' }}>Rest</span>}
            <span style={{ color:'#64748b', fontSize:'0.9rem', marginLeft:4 }}>{expandSession ? '▾' : '▸'}</span>
          </div>

          {expandSession && selectedSession.exercises.length > 0 && (
            <div style={{ marginTop: 16 }}>
              {selectedSession.exercises.map((ex, i) => (
                <div key={i} style={{ display:'flex', alignItems:'flex-start', gap:10, padding:'9px 0', borderTop: i === 0 ? 'none' : '1px solid rgba(255,255,255,0.05)' }}>
                  <span style={{ width:6, height:6, borderRadius:'50%', background:'#7c3aed', marginTop:6, flexShrink:0 }}/>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize:'0.875rem', fontWeight:600 }}>{ex.name}</div>
                    <div style={{ fontSize:'0.76rem', color:'#64748b', marginTop:2 }}>{ex.sets} sets × {ex.reps}{ex.alt && ex.alt !== '–' ? ` · Alt: ${ex.alt}` : ''}</div>
                  </div>
                  <span style={{ fontSize:'0.67rem', fontWeight:700, padding:'2px 8px', borderRadius:999, background:`${focusColor(ex.focus)}18`, color:focusColor(ex.focus), border:`1px solid ${focusColor(ex.focus)}33`, flexShrink:0, alignSelf:'flex-start', marginTop:2 }}>
                    {ex.focus}
                  </span>
                </div>
              ))}
            </div>
          )}

          {selectedSession.type === 'gym' && (
            <div style={{ marginTop: 16 }}>
              <button
                onClick={() => isDone ? unmarkComplete(selectedDate) : markComplete(selectedDate)}
                style={{
                  width:'100%', padding:'12px', borderRadius:10, border:`1px solid ${isDone ? 'rgba(239,68,68,0.3)' : 'rgba(16,185,129,0.3)'}`,
                  background: isDone ? 'rgba(239,68,68,0.1)' : 'rgba(16,185,129,0.1)',
                  color: isDone ? '#ef4444' : '#10b981',
                  fontFamily:'inherit', fontSize:'0.9rem', fontWeight:700, cursor:'pointer', transition:'all 0.15s',
                }}
              >
                {isDone ? 'Remove Completion' : 'Mark as Complete ✓'}
              </button>
            </div>
          )}
        </div>
      )}

      {/* Morning Routine accordion */}
      <div style={{ ...card, background: 'linear-gradient(135deg,rgba(124,58,237,0.08) 0%,rgba(59,130,246,0.06) 100%)', borderColor:'rgba(124,58,237,0.25)' }}>
        <div
          style={{ ...cardTitle, cursor:'pointer', marginBottom: morningOpen ? 16 : 0 }}
          onClick={() => setMorningOpen(o => !o)}
        >
          <span style={{ width:28, height:28, borderRadius:8, background:'rgba(124,58,237,0.2)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:14, flexShrink:0 }}>🌅</span>
          <span style={{ flex: 1 }}>Daily Morning Routine</span>
          <span style={{ fontSize:'0.72rem', color:'#64748b' }}>~18–20 min</span>
          <span style={{ color:'#64748b', transition:'transform 0.2s', transform: morningOpen ? 'rotate(90deg)' : 'none' }}>▸</span>
        </div>

        {morningOpen && (
          <div>
            {MORNING_ROUTINE.blocks.map(block => (
              <div key={block.id} style={{ marginBottom: 16 }}>
                <div
                  style={{ display:'flex', alignItems:'center', justifyContent:'space-between', cursor:'pointer', marginBottom: openBlocks[block.id] ? 8 : 0 }}
                  onClick={() => setOpenBlocks(o => ({ ...o, [block.id]: !o[block.id] }))}
                >
                  <div>
                    <div style={{ fontSize:'0.85rem', fontWeight:700, color:'#cbd5e1' }}>{block.name}</div>
                    <div style={{ fontSize:'0.73rem', color:'#64748b' }}>{block.duration}</div>
                  </div>
                  <span style={{ color:'#64748b', fontSize:'0.85rem' }}>{openBlocks[block.id] ? '▾' : '▸'}</span>
                </div>
                {openBlocks[block.id] && block.exercises.map((ex, i) => (
                  <div key={i} style={{ display:'flex', gap:10, padding:'7px 0', borderTop:'1px solid rgba(255,255,255,0.04)' }}>
                    <span style={{ width:5, height:5, borderRadius:'50%', background:'#7c3aed', marginTop:7, flexShrink:0 }}/>
                    <div>
                      <div style={{ fontSize:'0.8rem', fontWeight:600 }}>{ex.name}</div>
                      <div style={{ fontSize:'0.73rem', color:'#64748b', marginTop:1 }}>{ex.sets} × {ex.reps} · {ex.note}</div>
                    </div>
                  </div>
                ))}
              </div>
            ))}

            <div style={{ borderTop:'1px solid rgba(255,255,255,0.07)', paddingTop:12, marginTop:4 }}>
              <div style={{ fontSize:'0.72rem', fontWeight:700, color:'#94a3b8', textTransform:'uppercase', letterSpacing:'0.07em', marginBottom:8 }}>Optional Extras (choose 1–2)</div>
              {MORNING_ROUTINE.optional.map((ex, i) => (
                <div key={i} style={{ display:'flex', gap:10, padding:'6px 0', borderTop:'1px solid rgba(255,255,255,0.04)' }}>
                  <span style={{ width:5, height:5, borderRadius:'50%', background:'#f59e0b', marginTop:6, flexShrink:0 }}/>
                  <div style={{ fontSize:'0.78rem', color:'#94a3b8' }}><strong style={{color:'#cbd5e1'}}>{ex.name}</strong> · {ex.sets}×{ex.reps} · {ex.note}</div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Push-up rotation table */}
      <div style={card}>
        <div style={cardTitle}>
          <span style={{ width:28, height:28, borderRadius:8, background:'rgba(239,68,68,0.15)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:14, flexShrink:0 }}>💪</span>
          Push-Up Rotation
        </div>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width:'100%', borderCollapse:'collapse', fontSize:'0.82rem' }}>
            <thead>
              <tr>
                {['Week','Variation','Focus'].map(h => (
                  <th key={h} style={{ textAlign:'left', padding:'7px 10px', fontSize:'0.68rem', fontWeight:700, textTransform:'uppercase', letterSpacing:'0.07em', color:'#64748b', borderBottom:'1px solid rgba(255,255,255,0.07)' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {PUSHUP_ROTATION.map((row, i) => {
                const isCurrent = i === pushupWeekIdx
                return (
                  <tr key={row.week} style={{ background: isCurrent ? 'rgba(124,58,237,0.08)' : 'transparent' }}>
                    <td style={{ padding:'8px 10px', color: isCurrent ? '#9d5ff5' : '#64748b', fontWeight: isCurrent ? 700 : 400, borderBottom:'1px solid rgba(255,255,255,0.04)' }}>W{row.week}{isCurrent ? ' ←' : ''}</td>
                    <td style={{ padding:'8px 10px', color: isCurrent ? '#f1f5f9' : '#cbd5e1', fontWeight: isCurrent ? 600 : 400, borderBottom:'1px solid rgba(255,255,255,0.04)' }}>{row.variation}</td>
                    <td style={{ padding:'8px 10px', color:'#94a3b8', borderBottom:'1px solid rgba(255,255,255,0.04)' }}>{row.focus}</td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Progression notes */}
      <div style={card}>
        <div style={cardTitle}>
          <span style={{ width:28, height:28, borderRadius:8, background:'rgba(245,158,11,0.15)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:14, flexShrink:0 }}>📈</span>
          Progression & Periodisation
        </div>
        <ul style={{ listStyle:'none', padding:0 }}>
          {PROGRESSION.map((p, i) => (
            <li key={i} style={{ display:'flex', gap:12, padding:'10px 0', borderBottom: i < PROGRESSION.length-1 ? '1px solid rgba(255,255,255,0.05)' : 'none', fontSize:'0.875rem' }}>
              <span style={{ fontWeight:700, color:'#9d5ff5', whiteSpace:'nowrap', minWidth:110, fontSize:'0.8rem' }}>{p.phase}</span>
              <span style={{ color:'#94a3b8', lineHeight:1.5 }}>{p.desc}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}

const weekNavBtn = {
  background:'none', border:'none', color:'#64748b', fontFamily:'inherit',
  fontSize:'0.8rem', fontWeight:600, cursor:'pointer', padding:'4px 8px',
}
