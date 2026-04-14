import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { useApp, toast } from '../App'
import { getMesocycleWeek } from '../lib/settings'
import {
  MORNING_ROUTINE, SESSIONS, SESSION_ORDER,
  MESOCYCLE, PROGRESSION, OVERLOAD_RULES,
} from '../data/trainingPlan'

const card = { background:'#111120', border:'1px solid rgba(255,255,255,0.07)', borderRadius:16, padding:20, marginBottom:12, boxShadow:'0 4px 24px rgba(0,0,0,0.4)' }
const cardTitle = { fontSize:'0.68rem', fontWeight:700, textTransform:'uppercase', letterSpacing:'0.1em', color:'#94a3b8', marginBottom:16, display:'flex', alignItems:'center', gap:8 }

const CATEGORY_COLOR = {
  Strength: '#3b82f6', Calisthenics: '#9d5ff5', Padel: '#f59e0b',
  Physio: '#10b981', Core: '#f97316',
}
const catColor = (c) => CATEGORY_COLOR[c] || '#94a3b8'

function todayStr() { return new Date().toISOString().split('T')[0] }

function fmtDate(str) {
  return new Date(str + 'T12:00:00').toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })
}

export default function TrainingView() {
  const { session, settings } = useApp()
  const today = todayStr()

  const [selectedSessionId, setSelectedSessionId] = useState(null)
  const [history,   setHistory]   = useState([])   // [{date, session_key}]
  const [todayDone, setTodayDone] = useState(null)  // session_key done today, or null
  const [openBlocks,   setOpenBlocks]   = useState({})
  const [morningOpen,  setMorningOpen]  = useState(false)
  const [examplesOpen, setExamplesOpen] = useState({})
  const [progOpen,     setProgOpen]     = useState(false)

  /* Load recent history (last 30 days) */
  async function loadHistory() {
    const from = new Date(); from.setDate(from.getDate() - 30)
    const { data } = await supabase
      .from('training_completions')
      .select('date, session_key')
      .eq('user_id', session.user.id)
      .gte('date', from.toISOString().split('T')[0])
      .order('date', { ascending: false })
    if (data) {
      setHistory(data)
      const t = data.find(r => r.date === today)
      setTodayDone(t?.session_key || null)
    }
  }

  useEffect(() => { loadHistory() }, []) // eslint-disable-line

  async function markComplete() {
    if (!selectedSessionId) return
    const { error } = await supabase
      .from('training_completions')
      .upsert(
        { user_id: session.user.id, date: today, session_key: selectedSessionId },
        { onConflict: 'user_id,date' }
      )
    if (!error) {
      setTodayDone(selectedSessionId)
      await supabase.from('daily_entries').upsert(
        { user_id: session.user.id, date: today, activity: 'Gym' },
        { onConflict: 'user_id,date', ignoreDuplicates: false }
      )
      await loadHistory()
      toast('Session logged')
    }
  }

  async function removeCompletion() {
    await supabase
      .from('training_completions')
      .delete()
      .eq('user_id', session.user.id)
      .eq('date', today)
    setTodayDone(null)
    await loadHistory()
    toast("Today's session removed", 'info')
  }

  /* Last time each session was done */
  const lastDone = {}
  SESSION_ORDER.forEach(id => {
    const hit = history.find(r => r.session_key === id)
    if (hit) lastDone[id] = hit.date
  })

  /* Suggested next session: the one done least recently */
  const suggested = SESSION_ORDER.slice().sort((a, b) => {
    const da = lastDone[a] || '0000-00-00'
    const db = lastDone[b] || '0000-00-00'
    return da.localeCompare(db)
  })[0]

  const activeSession = selectedSessionId ? SESSIONS[selectedSessionId] : null

  return (
    <div style={{ maxWidth: 640, margin: '0 auto', padding: '0 16px' }}>
      <div className="py-5">
        <h1 style={{ fontSize: '1.5rem', fontWeight: 800, letterSpacing: '-0.03em' }}>Training Plan</h1>
        <p style={{ fontSize: '0.8rem', color: '#94a3b8', marginTop: 2 }}>4-Day Split · Undulating Periodisation · Hypertrophy + Padel + Calisthenics</p>
      </div>

      {/* ── Mesocycle week ── */}
      {(() => {
        const w = getMesocycleWeek(settings.mesocycle_start)
        const phases = ['Accumulation','Volume+','Intensification','Deload']
        const phaseColors = ['#10b981','#3b82f6','#f59e0b','#9d5ff5']
        if (!w) return (
          <div style={{ background:'rgba(255,255,255,0.03)', border:'1px solid rgba(255,255,255,0.07)', borderRadius:12, padding:'10px 16px', marginBottom:12, fontSize:'0.76rem', color:'#475569' }}>
            Set your mesocycle start date in Profile to track your current week.
          </div>
        )
        const col = phaseColors[w - 1]
        return (
          <div style={{ background:`rgba(${w===1?'16,185,129':w===2?'59,130,246':w===3?'245,158,11':'157,95,245'},0.08)`, border:`1px solid ${col}33`, borderRadius:12, padding:'10px 16px', marginBottom:12, display:'flex', alignItems:'center', justifyContent:'space-between' }}>
            <div>
              <div style={{ fontSize:'0.65rem', fontWeight:700, textTransform:'uppercase', letterSpacing:'0.08em', color:col }}>Mesocycle Week {w} of 4</div>
              <div style={{ fontSize:'0.82rem', fontWeight:700, color:'#f1f5f9', marginTop:2 }}>{phases[w-1]}</div>
            </div>
            <div style={{ display:'flex', gap:6 }}>
              {[1,2,3,4].map(i => (
                <div key={i} style={{ width:28, height:6, borderRadius:3, background: i <= w ? col : 'rgba(255,255,255,0.07)' }}/>
              ))}
            </div>
          </div>
        )
      })()}

      {/* ── Today banner ── */}
      {todayDone ? (
        <div style={{ background:'rgba(16,185,129,0.08)', border:'1px solid rgba(16,185,129,0.25)', borderRadius:12, padding:'12px 16px', marginBottom:12, display:'flex', alignItems:'center', justifyContent:'space-between' }}>
          <div>
            <div style={{ fontSize:'0.75rem', fontWeight:700, color:'#10b981' }}>Today's session logged</div>
            <div style={{ fontSize:'0.8rem', color:'#94a3b8', marginTop:2 }}>{SESSIONS[todayDone]?.name}</div>
          </div>
          <button onClick={removeCompletion} style={{ background:'none', border:'none', color:'#64748b', fontSize:'0.75rem', cursor:'pointer', fontFamily:'inherit' }}>Remove</button>
        </div>
      ) : (
        <div style={{ background:'rgba(124,58,237,0.08)', border:'1px solid rgba(124,58,237,0.2)', borderRadius:12, padding:'12px 16px', marginBottom:12 }}>
          <div style={{ fontSize:'0.75rem', fontWeight:700, color:'#9d5ff5', marginBottom:2 }}>Pick today's session below</div>
          <div style={{ fontSize:'0.78rem', color:'#64748b' }}>Suggested: <span style={{ color:'#cbd5e1', fontWeight:600 }}>{SESSIONS[suggested]?.name}</span></div>
        </div>
      )}

      {/* ── Session picker ── */}
      <div style={{ display:'flex', flexDirection:'column', gap:8, marginBottom:16 }}>
        {SESSION_ORDER.map(id => {
          const s = SESSIONS[id]
          const last = lastDone[id]
          const isSelected = selectedSessionId === id
          const isSuggested = id === suggested && !todayDone
          return (
            <button
              key={id}
              onClick={() => setSelectedSessionId(isSelected ? null : id)}
              style={{
                display:'flex', alignItems:'center', gap:12, width:'100%', textAlign:'left',
                padding:'12px 14px', borderRadius:12, cursor:'pointer', fontFamily:'inherit',
                background: isSelected ? 'rgba(124,58,237,0.12)' : '#111120',
                border: `1px solid ${isSelected ? 'rgba(124,58,237,0.4)' : 'rgba(255,255,255,0.07)'}`,
                transition:'all 0.15s',
              }}
            >
              <div style={{ flex:1 }}>
                <div style={{ fontSize:'0.875rem', fontWeight:700, color: isSelected ? '#f1f5f9' : '#cbd5e1' }}>
                  {s.name}
                  {isSuggested && <span style={{ marginLeft:8, fontSize:'0.65rem', fontWeight:700, color:'#9d5ff5', background:'rgba(124,58,237,0.15)', border:'1px solid rgba(124,58,237,0.3)', borderRadius:999, padding:'2px 7px' }}>suggested</span>}
                </div>
                <div style={{ fontSize:'0.73rem', color:'#64748b', marginTop:1 }}>{s.subtitle} · {s.duration}</div>
              </div>
              <div style={{ textAlign:'right', flexShrink:0 }}>
                {last
                  ? <div style={{ fontSize:'0.7rem', color:'#475569' }}>Last: {fmtDate(last)}</div>
                  : <div style={{ fontSize:'0.7rem', color:'#334155' }}>Never done</div>
                }
              </div>
              <span style={{ color:'#64748b', fontSize:'0.85rem', marginLeft:4 }}>{isSelected ? '▾' : '▸'}</span>
            </button>
          )
        })}
      </div>

      {/* ── Session detail ── */}
      {activeSession && (
        <div style={{ ...card, borderColor: 'rgba(124,58,237,0.25)' }}>
          <div style={{ marginBottom:14 }}>
            <div style={{ fontSize:'1rem', fontWeight:800 }}>{activeSession.name}</div>
            <div style={{ fontSize:'0.78rem', color:'#64748b', marginTop:2 }}>{activeSession.subtitle} · {activeSession.duration}</div>
          </div>

          {/* Warmup */}
          <div style={{ background:'rgba(255,255,255,0.03)', borderRadius:10, padding:'10px 12px', marginBottom:14 }}>
            <div style={{ fontSize:'0.65rem', fontWeight:700, textTransform:'uppercase', letterSpacing:'0.08em', color:'#64748b', marginBottom:4 }}>Warm-up (7 min)</div>
            <div style={{ fontSize:'0.78rem', color:'#94a3b8', lineHeight:1.6 }}>{activeSession.warmup}</div>
          </div>

          {/* Session note */}
          {activeSession.sessionNote && (
            <div style={{ background:'rgba(245,158,11,0.08)', border:'1px solid rgba(245,158,11,0.2)', borderRadius:8, padding:'8px 12px', marginBottom:14, fontSize:'0.76rem', color:'#f59e0b' }}>
              ⚠ {activeSession.sessionNote}
            </div>
          )}

          {/* Category legend */}
          <div style={{ display:'flex', gap:8, flexWrap:'wrap', marginBottom:12 }}>
            {Object.entries(CATEGORY_COLOR).map(([cat, col]) => (
              <span key={cat} style={{ fontSize:'0.65rem', fontWeight:700, padding:'2px 8px', borderRadius:999, background:`${col}18`, color:col, border:`1px solid ${col}33` }}>{cat}</span>
            ))}
          </div>

          {/* Exercise list */}
          {activeSession.exercises.map((ex, i) => (
            <div key={i} style={{ display:'flex', alignItems:'flex-start', gap:10, padding:'10px 0', borderTop: i === 0 ? 'none' : '1px solid rgba(255,255,255,0.05)' }}>
              <span style={{ width:6, height:6, borderRadius:'50%', background: catColor(ex.category), marginTop:6, flexShrink:0 }}/>
              <div style={{ flex:1 }}>
                <div style={{ display:'flex', alignItems:'center', gap:8, flexWrap:'wrap' }}>
                  <span style={{ fontSize:'0.875rem', fontWeight:600 }}>{ex.name}</span>
                  <span style={{ fontSize:'0.65rem', fontWeight:700, padding:'1px 7px', borderRadius:999, background:`${catColor(ex.category)}18`, color:catColor(ex.category), border:`1px solid ${catColor(ex.category)}33` }}>{ex.category}</span>
                </div>
                <div style={{ fontSize:'0.72rem', color:'#64748b', marginTop:3, lineHeight:1.5 }}>
                  <span style={{ color:'#94a3b8', fontWeight:600 }}>{ex.sets} sets</span> · {ex.reps} · rest {ex.rest}
                </div>
                {ex.note && <div style={{ fontSize:'0.71rem', color:'#475569', marginTop:2 }}>{ex.note}</div>}
                {ex.alt && ex.alt !== '—' && <div style={{ fontSize:'0.71rem', color:'#334155', marginTop:1 }}>Alt: {ex.alt}</div>}
              </div>
            </div>
          ))}

          {/* Log button */}
          <div style={{ marginTop:16 }}>
            {todayDone === activeSession.id ? (
              <div style={{ textAlign:'center', padding:'12px', borderRadius:10, background:'rgba(16,185,129,0.1)', border:'1px solid rgba(16,185,129,0.3)', color:'#10b981', fontWeight:700, fontSize:'0.9rem' }}>
                This session logged today
              </div>
            ) : (
              <button
                onClick={markComplete}
                style={{ width:'100%', padding:'13px', borderRadius:10, border:'1px solid rgba(16,185,129,0.3)', background:'rgba(16,185,129,0.1)', color:'#10b981', fontFamily:'inherit', fontSize:'0.9rem', fontWeight:700, cursor:'pointer', transition:'all 0.15s' }}
              >
                Log as Today's Session
              </button>
            )}
          </div>
        </div>
      )}

      {/* ── Recent history ── */}
      {history.length > 0 && (
        <div style={card}>
          <div style={cardTitle}>Recent Sessions</div>
          {history.slice(0, 10).map((r, i) => {
            const s = SESSIONS[r.session_key]
            return (
              <div key={i} style={{ display:'flex', alignItems:'center', gap:10, padding:'8px 0', borderTop: i === 0 ? 'none' : '1px solid rgba(255,255,255,0.04)' }}>
                <div style={{ flex:1 }}>
                  <div style={{ fontSize:'0.8rem', fontWeight:600 }}>{s?.name || r.session_key}</div>
                  <div style={{ fontSize:'0.71rem', color:'#64748b' }}>{s?.subtitle}</div>
                </div>
                <div style={{ fontSize:'0.72rem', color:'#475569' }}>{fmtDate(r.date)}</div>
              </div>
            )
          })}
        </div>
      )}

      {/* ── Morning Routine ── */}
      <div style={{ ...card, background:'linear-gradient(135deg,rgba(124,58,237,0.08) 0%,rgba(59,130,246,0.06) 100%)', borderColor:'rgba(124,58,237,0.25)' }}>
        <div style={{ ...cardTitle, cursor:'pointer', marginBottom: morningOpen ? 16 : 0 }} onClick={() => setMorningOpen(o => !o)}>
          <span style={{ flex:1 }}>Daily Morning Routine</span>
          <span style={{ fontSize:'0.72rem', color:'#64748b' }}>~18–20 min</span>
          <span style={{ color:'#64748b', transition:'transform 0.2s', transform: morningOpen ? 'rotate(90deg)' : 'none' }}>▸</span>
        </div>

        {morningOpen && (
          <div>
            {MORNING_ROUTINE.blocks.map(block => (
              <div key={block.id} style={{ marginBottom:16 }}>
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
                  <div key={i} style={{ padding:'7px 0', borderTop:'1px solid rgba(255,255,255,0.04)' }}>
                    <div style={{ display:'flex', gap:10, alignItems:'flex-start' }}>
                      <span style={{ width:5, height:5, borderRadius:'50%', background:'#7c3aed', marginTop:7, flexShrink:0 }}/>
                      <div style={{ flex:1 }}>
                        <div style={{ fontSize:'0.8rem', fontWeight:600 }}>{ex.name}</div>
                        <div style={{ fontSize:'0.73rem', color:'#64748b', marginTop:1 }}>{ex.sets} × {ex.reps} · {ex.note}</div>

                        {/* Examples (Block 1) */}
                        {ex.examples && (
                          <div style={{ marginTop:6 }}>
                            <button
                              type="button"
                              onClick={(e) => { e.stopPropagation(); setExamplesOpen(o => ({ ...o, [`${block.id}_${i}`]: !o[`${block.id}_${i}`] })) }}
                              style={{ background:'none', border:'none', color:'#7c3aed', fontSize:'0.7rem', fontWeight:600, cursor:'pointer', fontFamily:'inherit', padding:0 }}
                            >
                              {examplesOpen[`${block.id}_${i}`] ? '▾ Hide variations' : '▸ Show variations'}
                            </button>
                            {examplesOpen[`${block.id}_${i}`] && (
                              <div style={{ marginTop:6, paddingLeft:8, borderLeft:'2px solid rgba(124,58,237,0.3)' }}>
                                {ex.examples.map((eg, j) => (
                                  <div key={j} style={{ fontSize:'0.72rem', color:'#64748b', padding:'3px 0', lineHeight:1.5 }}>
                                    <span style={{ color:'#9d5ff5', marginRight:6 }}>·</span>{eg}
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ))}

            {/* Optional extras */}
            <div style={{ borderTop:'1px solid rgba(255,255,255,0.07)', paddingTop:12, marginTop:4 }}>
              <div style={{ fontSize:'0.72rem', fontWeight:700, color:'#94a3b8', textTransform:'uppercase', letterSpacing:'0.07em', marginBottom:8 }}>Optional Extras (choose 1–2)</div>
              {MORNING_ROUTINE.optional.map((ex, i) => (
                <div key={i} style={{ display:'flex', gap:10, padding:'6px 0', borderTop:'1px solid rgba(255,255,255,0.04)' }}>
                  <span style={{ width:5, height:5, borderRadius:'50%', background:'#f59e0b', marginTop:6, flexShrink:0 }}/>
                  <div style={{ fontSize:'0.78rem', color:'#94a3b8' }}><strong style={{ color:'#cbd5e1' }}>{ex.name}</strong> · {ex.sets}×{ex.reps} · {ex.note}</div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* ── 4-Week Mesocycle ── */}
      <div style={card}>
        <div style={cardTitle}>4-Week Mesocycle</div>
        <div style={{ overflowX:'auto' }}>
          <table style={{ width:'100%', borderCollapse:'collapse', fontSize:'0.82rem' }}>
            <thead>
              <tr>
                {['Week','Phase','Sets','Reps (Compounds / Accessories)','RPE'].map(h => (
                  <th key={h} style={{ textAlign:'left', padding:'7px 10px', fontSize:'0.65rem', fontWeight:700, textTransform:'uppercase', letterSpacing:'0.07em', color:'#64748b', borderBottom:'1px solid rgba(255,255,255,0.07)', whiteSpace:'nowrap' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {MESOCYCLE.map((row, i) => (
                <tr key={i}>
                  <td style={{ padding:'8px 10px', fontWeight:700, color:'#9d5ff5', borderBottom:'1px solid rgba(255,255,255,0.04)' }}>{row.week}</td>
                  <td style={{ padding:'8px 10px', fontWeight:600, color:'#f1f5f9', borderBottom:'1px solid rgba(255,255,255,0.04)' }}>{row.phase}</td>
                  <td style={{ padding:'8px 10px', color:'#94a3b8', borderBottom:'1px solid rgba(255,255,255,0.04)' }}>{row.sets}</td>
                  <td style={{ padding:'8px 10px', color:'#94a3b8', borderBottom:'1px solid rgba(255,255,255,0.04)' }}>{row.reps}</td>
                  <td style={{ padding:'8px 10px', color:'#94a3b8', borderBottom:'1px solid rgba(255,255,255,0.04)' }}>{row.rpe}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* ── Progression Roadmap ── */}
      <div style={card}>
        <div
          style={{ ...cardTitle, cursor:'pointer', marginBottom: progOpen ? 16 : 0 }}
          onClick={() => setProgOpen(o => !o)}
        >
          <span style={{ flex:1 }}>Calisthenics Progression Roadmap</span>
          <span style={{ color:'#64748b', transition:'transform 0.2s', transform: progOpen ? 'rotate(90deg)' : 'none' }}>▸</span>
        </div>

        {progOpen && (
          <div>
            {PROGRESSION.map((skill, si) => (
              <div key={si} style={{ marginBottom:16 }}>
                <div style={{ display:'flex', alignItems:'baseline', gap:10, marginBottom:6 }}>
                  <span style={{ fontSize:'0.85rem', fontWeight:700, color:'#9d5ff5' }}>{skill.skill}</span>
                  <span style={{ fontSize:'0.72rem', color:'#475569', fontStyle:'italic' }}>Currently: {skill.level}</span>
                </div>
                {skill.phases.map((p, pi) => (
                  <div key={pi} style={{ display:'flex', gap:12, padding:'6px 0', borderTop:'1px solid rgba(255,255,255,0.04)', fontSize:'0.8rem' }}>
                    <span style={{ fontWeight:600, color:'#64748b', whiteSpace:'nowrap', minWidth:100, fontSize:'0.72rem' }}>{p.phase}</span>
                    <span style={{ color:'#94a3b8', lineHeight:1.5 }}>{p.desc}</span>
                  </div>
                ))}
              </div>
            ))}

            <div style={{ borderTop:'1px solid rgba(255,255,255,0.07)', paddingTop:12, marginTop:4 }}>
              <div style={{ fontSize:'0.72rem', fontWeight:700, color:'#94a3b8', textTransform:'uppercase', letterSpacing:'0.07em', marginBottom:8 }}>Progressive Overload Rules</div>
              {OVERLOAD_RULES.map((r, i) => (
                <div key={i} style={{ display:'flex', gap:12, padding:'7px 0', borderTop:'1px solid rgba(255,255,255,0.04)', fontSize:'0.8rem' }}>
                  <span style={{ fontWeight:700, color:'#9d5ff5', minWidth:90, fontSize:'0.72rem', whiteSpace:'nowrap' }}>{r.rule}</span>
                  <span style={{ color:'#94a3b8', lineHeight:1.5 }}>{r.protocol}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
