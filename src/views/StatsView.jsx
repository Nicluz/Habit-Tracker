import { useState, useEffect, useRef } from 'react'
import { supabase } from '../lib/supabase'
import { useApp } from '../App'
import {
  Chart, LineElement, BarElement, PointElement,
  LineController, BarController, RadarController,
  CategoryScale, LinearScale, RadialLinearScale,
  Filler, Tooltip, Legend,
} from 'chart.js'

Chart.register(
  LineElement, BarElement, PointElement,
  LineController, BarController, RadarController,
  CategoryScale, LinearScale, RadialLinearScale,
  Filler, Tooltip, Legend
)

const PERIODS = [
  { label: 'Week',  days: 7   },
  { label: 'Month', days: 30  },
  { label: 'Year',  days: 365 },
]

const QUALITY_MAP = { poor: 1, low: 2, fair: 3, good: 4, great: 5 }
const QUALITY_LABELS = ['', 'Poor', 'Low', 'Fair', 'Good', 'Great']

Chart.defaults.color = '#94a3b8'
Chart.defaults.borderColor = 'rgba(255,255,255,0.06)'
Chart.defaults.font.family = 'Inter, system-ui, sans-serif'

function useChart(ref, config, deps) {
  useEffect(() => {
    if (!ref.current) return
    const chart = new Chart(ref.current, config)
    return () => chart.destroy()
  }, deps)  // eslint-disable-line
}

function StatChip({ label, value, sub, color = '#f1f5f9' }) {
  return (
    <div style={{ background:'#111120', border:'1px solid rgba(255,255,255,0.07)', borderRadius:16, padding:16, boxShadow:'0 4px 24px rgba(0,0,0,0.4)' }}>
      <div style={{ fontSize:'0.68rem', fontWeight:700, textTransform:'uppercase', letterSpacing:'0.08em', color:'#94a3b8', marginBottom:6 }}>{label}</div>
      <div style={{ fontSize:'1.6rem', fontWeight:800, letterSpacing:'-0.03em', color }}>{value ?? '—'}</div>
      {sub && <div style={{ fontSize:'0.73rem', color:'#64748b', marginTop:2 }}>{sub}</div>}
    </div>
  )
}

function ChartCard({ title, children }) {
  return (
    <div style={{ background:'#111120', border:'1px solid rgba(255,255,255,0.07)', borderRadius:16, padding:20, marginBottom:12, boxShadow:'0 4px 24px rgba(0,0,0,0.4)' }}>
      <div style={{ fontSize:'0.9rem', fontWeight:700, color:'#f1f5f9', marginBottom:16 }}>{title}</div>
      {children}
    </div>
  )
}

export default function StatsView() {
  const { session } = useApp()
  const [periodIdx, setPeriodIdx] = useState(0)
  const [entries,   setEntries]   = useState([])
  const [loading,   setLoading]   = useState(true)

  const days = PERIODS[periodIdx].days

  useEffect(() => {
    async function load() {
      setLoading(true)
      const from = new Date(); from.setDate(from.getDate() - days + 1)
      const { data } = await supabase
        .from('daily_entries')
        .select('*')
        .eq('user_id', session.user.id)
        .gte('date', from.toISOString().split('T')[0])
        .order('date')
      setEntries(data || [])
      setLoading(false)
    }
    load()
  }, [days, session.user.id])

  /* ── Computed stats ── */
  const n = entries.length
  const avg  = (key) => n ? (entries.reduce((s,e) => s + (e[key] || 0), 0) / n).toFixed(1) : null
  const sum  = (key) => entries.reduce((s,e) => s + (e[key] || 0), 0)
  const count = (key) => entries.filter(e => e[key]).length
  const countVal = (key, val) => entries.filter(e => e[key] === val).length

  const avgDayRating  = avg('day_rating')
  const avgSleep      = (() => {
    const es = entries.filter(e => e.sleep_h != null)
    if (!es.length) return null
    const total = es.reduce((s,e) => s + (e.sleep_h||0)*60 + (e.sleep_m||0), 0) / es.length
    return `${Math.floor(total/60)}h ${Math.round(total%60)}m`
  })()
  const trainingSessions = entries.filter(e => e.activity && e.activity !== 'Rest Day').length
  const morningStreak    = (() => {
    let s = 0; const sorted = [...entries].sort((a,b) => b.date.localeCompare(a.date))
    for (const e of sorted) { if (e.morning_routine) s++; else break }
    return s
  })()
  const noAlcoholDays    = count('alcohol') === 0 ? n : entries.filter(e => !e.alcohol).length
  const readingDays      = count('reading')
  const avgScreen        = (() => {
    const es = entries.filter(e => e.screen_h != null)
    if (!es.length) return null
    const m = es.reduce((s,e) => s + (e.screen_h||0)*60 + (e.screen_m||0), 0) / es.length
    return `${Math.floor(m/60)}h ${Math.round(m%60)}m`
  })()
  const totalPushups = sum('pushups')

  /* ── Chart data ── */
  const labels = entries.map(e => {
    const d = new Date(e.date + 'T12:00:00')
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
  })

  const ratingsRef   = useRef(null)
  const sleepRef     = useRef(null)
  const feelingsRef  = useRef(null)
  const activRef     = useRef(null)
  const screenRef    = useRef(null)

  const chartDeps = [entries]

  /* Day rating line chart */
  useChart(ratingsRef, {
    type: 'line',
    data: {
      labels,
      datasets: [{
        label: 'Day Rating',
        data: entries.map(e => e.day_rating),
        borderColor: '#9d5ff5',
        backgroundColor: 'rgba(124,58,237,0.12)',
        borderWidth: 2.5,
        pointBackgroundColor: '#9d5ff5',
        pointRadius: 4,
        fill: true,
        tension: 0.35,
        spanGaps: true,
      }],
    },
    options: {
      responsive: true,
      plugins: { legend: { display: false } },
      scales: {
        y: { min: 1, max: 10, ticks: { stepSize: 1 }, grid: { color: 'rgba(255,255,255,0.05)' } },
        x: { grid: { display: false } },
      },
    },
  }, chartDeps)

  /* Sleep duration bar chart */
  useChart(sleepRef, {
    type: 'bar',
    data: {
      labels,
      datasets: [
        {
          label: 'Sleep (hrs)',
          data: entries.map(e => {
            if (e.sleep_h == null) return null
            return +((e.sleep_h||0) + (e.sleep_m||0)/60).toFixed(2)
          }),
          backgroundColor: 'rgba(59,130,246,0.6)',
          borderColor: '#3b82f6',
          borderWidth: 1,
          borderRadius: 4,
        },
      ],
    },
    options: {
      responsive: true,
      plugins: { legend: { display: false } },
      scales: {
        y: { min: 0, max: 12, ticks: { stepSize: 2 }, grid: { color: 'rgba(255,255,255,0.05)' } },
        x: { grid: { display: false } },
      },
    },
  }, chartDeps)

  /* Feelings radar */
  const feelingKeys = ['feel_physical','feel_social','feel_work','feel_leisure','feel_inner','feel_overall']
  const feelingLabels = ['Physical','Social','Work','Leisure','Inner','Overall']
  const avgFeelings = feelingKeys.map(k => avg(k))

  useChart(feelingsRef, {
    type: 'radar',
    data: {
      labels: feelingLabels,
      datasets: [{
        label: 'Avg Feeling',
        data: avgFeelings,
        backgroundColor: 'rgba(16,185,129,0.15)',
        borderColor: '#10b981',
        borderWidth: 2,
        pointBackgroundColor: '#10b981',
        pointRadius: 4,
      }],
    },
    options: {
      responsive: true,
      plugins: { legend: { display: false } },
      scales: {
        r: {
          min: 0, max: 10,
          ticks: { stepSize: 2, backdropColor: 'transparent' },
          grid: { color: 'rgba(255,255,255,0.07)' },
          angleLines: { color: 'rgba(255,255,255,0.07)' },
          pointLabels: { color: '#94a3b8', font: { size: 11 } },
        },
      },
    },
  }, chartDeps)

  /* Activity bar chart */
  const activityCounts = entries.reduce((acc, e) => {
    if (e.activity) acc[e.activity] = (acc[e.activity]||0) + 1
    return acc
  }, {})
  const actLabels = Object.keys(activityCounts)
  const actColors = ['#9d5ff5','#3b82f6','#10b981','#f59e0b','#ef4444','#ec4899','#14b8a6','#f97316']

  useChart(activRef, {
    type: 'bar',
    data: {
      labels: actLabels,
      datasets: [{
        data: actLabels.map(k => activityCounts[k]),
        backgroundColor: actLabels.map((_,i) => actColors[i % actColors.length] + '99'),
        borderColor:     actLabels.map((_,i) => actColors[i % actColors.length]),
        borderWidth: 1,
        borderRadius: 4,
      }],
    },
    options: {
      responsive: true,
      plugins: { legend: { display: false } },
      scales: {
        y: { beginAtZero: true, ticks: { stepSize: 1 }, grid: { color: 'rgba(255,255,255,0.05)' } },
        x: { grid: { display: false } },
      },
    },
  }, chartDeps)

  /* Screen vs social media line chart */
  useChart(screenRef, {
    type: 'line',
    data: {
      labels,
      datasets: [
        {
          label: 'Screen Time (h)',
          data: entries.map(e => e.screen_h != null ? +((e.screen_h + (e.screen_m||0)/60)).toFixed(2) : null),
          borderColor: '#f59e0b',
          backgroundColor: 'rgba(245,158,11,0.1)',
          borderWidth: 2, pointRadius: 3, tension: 0.35, fill: true, spanGaps: true,
        },
        {
          label: 'Social Media (h)',
          data: entries.map(e => e.social_h != null ? +((e.social_h + (e.social_m||0)/60)).toFixed(2) : null),
          borderColor: '#ef4444',
          backgroundColor: 'rgba(239,68,68,0.08)',
          borderWidth: 2, pointRadius: 3, tension: 0.35, fill: true, spanGaps: true,
        },
      ],
    },
    options: {
      responsive: true,
      plugins: { legend: { labels: { boxWidth: 10, padding: 12, color: '#94a3b8' } } },
      scales: {
        y: { beginAtZero: true, grid: { color: 'rgba(255,255,255,0.05)' } },
        x: { grid: { display: false } },
      },
    },
  }, chartDeps)

  if (loading) {
    return (
      <div className="flex items-center justify-center" style={{ height: '60vh' }}>
        <div className="w-8 h-8 rounded-full spin" style={{ border: '3px solid rgba(124,58,237,0.2)', borderTopColor: '#7c3aed' }} />
      </div>
    )
  }

  return (
    <div style={{ maxWidth: 640, margin: '0 auto', padding: '0 16px' }}>
      <div className="py-5">
        <h1 style={{ fontSize: '1.5rem', fontWeight: 800, letterSpacing: '-0.03em' }}>Statistics</h1>
        <p style={{ fontSize: '0.8rem', color: '#94a3b8', marginTop: 2 }}>Track your progress over time</p>
      </div>

      {/* Period tabs */}
      <div className="flex gap-1.5 rounded-xl p-1.5 mb-4" style={{ background: '#111120', border: '1px solid rgba(255,255,255,0.07)' }}>
        {PERIODS.map((p, i) => (
          <button key={p.label} onClick={() => setPeriodIdx(i)}
            style={{
              flex:1, padding:'8px', borderRadius:8, border:'none', fontFamily:'inherit',
              fontSize:'0.875rem', fontWeight:600, cursor:'pointer', transition:'all 0.15s',
              background: periodIdx === i ? 'linear-gradient(135deg,#7c3aed,#9d5ff5)' : 'transparent',
              color: periodIdx === i ? '#fff' : '#64748b',
              boxShadow: periodIdx === i ? '0 2px 10px rgba(124,58,237,0.3)' : 'none',
            }}
          >{p.label}</button>
        ))}
      </div>

      {n === 0 ? (
        <div className="text-center py-20" style={{ color: '#64748b' }}>
          <div style={{ fontSize: '3rem', marginBottom: 12 }}>📊</div>
          <p>No data for this period yet.<br/>Start logging your days!</p>
        </div>
      ) : (
        <>
          {/* Summary chips */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 12 }}>
            <StatChip label="Avg Day Rating"    value={avgDayRating}      color="#9d5ff5"  sub={`over ${n} days`}/>
            <StatChip label="Avg Sleep"         value={avgSleep}          color="#3b82f6"  />
            <StatChip label="Training Sessions" value={trainingSessions}  color="#10b981"  sub="excl. rest days"/>
            <StatChip label="Morning Streak"    value={morningStreak}     color="#f59e0b"  sub="consecutive days"/>
            <StatChip label="Total Push-ups"    value={totalPushups}      color="#ef4444"  />
            <StatChip label="Reading Days"      value={readingDays}       color="#14b8a6"  sub={`of ${n} days`}/>
            <StatChip label="Avg Screen Time"   value={avgScreen}         color="#f97316"  />
            <StatChip label="No-Alcohol Days"   value={noAlcoholDays}     color="#22c55e"  sub={`of ${n} days`}/>
          </div>

          {/* Day rating over time */}
          <ChartCard title="Day Rating">
            <div style={{ height: 180 }}><canvas ref={ratingsRef}/></div>
          </ChartCard>

          {/* Sleep duration */}
          <ChartCard title="Sleep Duration (hours)">
            <div style={{ height: 180 }}><canvas ref={sleepRef}/></div>
          </ChartCard>

          {/* Feelings radar */}
          <ChartCard title="Avg Well-being (Radar)">
            <div style={{ height: 260, maxWidth: 320, margin: '0 auto' }}><canvas ref={feelingsRef}/></div>
          </ChartCard>

          {/* Activities */}
          {actLabels.length > 0 && (
            <ChartCard title="Activities Breakdown">
              <div style={{ height: 180 }}><canvas ref={activRef}/></div>
            </ChartCard>
          )}

          {/* Screen time */}
          <ChartCard title="Screen & Social Media Time">
            <div style={{ height: 180 }}><canvas ref={screenRef}/></div>
          </ChartCard>

          {/* Sleep quality distribution */}
          <ChartCard title="Sleep Quality Distribution">
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              {['poor','low','fair','good','great'].map(q => {
                const c = countVal('sleep_quality', q)
                const colors = { poor:'#ef4444', low:'#f97316', fair:'#f59e0b', good:'#22c55e', great:'#10b981' }
                return (
                  <div key={q} style={{ flex: 1, minWidth: 60, background: '#191928', borderRadius: 10, padding: '10px 8px', textAlign: 'center', border: `1px solid ${colors[q]}33` }}>
                    <div style={{ fontSize: '1.2rem', fontWeight: 800, color: colors[q] }}>{c}</div>
                    <div style={{ fontSize: '0.68rem', fontWeight: 600, color: '#64748b', textTransform: 'capitalize', marginTop: 2 }}>{q}</div>
                  </div>
                )
              })}
            </div>
          </ChartCard>

          {/* Well-being over time (line per feeling) */}
          <WellbeingChart entries={entries} labels={labels}/>
        </>
      )}
    </div>
  )
}

function WellbeingChart({ entries, labels }) {
  const ref = useRef(null)
  const COLORS = ['#9d5ff5','#3b82f6','#10b981','#f59e0b','#ef4444','#ec4899']
  const KEYS   = ['feel_physical','feel_social','feel_work','feel_leisure','feel_inner','feel_overall']
  const LBLS   = ['Physical','Social','Work','Leisure','Inner','Overall']

  useEffect(() => {
    if (!ref.current) return
    const chart = new Chart(ref.current, {
      type: 'line',
      data: {
        labels,
        datasets: KEYS.map((k, i) => ({
          label: LBLS[i],
          data: entries.map(e => e[k]),
          borderColor: COLORS[i],
          backgroundColor: 'transparent',
          borderWidth: 1.8,
          pointRadius: 2,
          tension: 0.35,
          spanGaps: true,
        })),
      },
      options: {
        responsive: true,
        plugins: {
          legend: { labels: { boxWidth: 8, padding: 10, color: '#94a3b8', font: { size: 11 } } },
        },
        scales: {
          y: { min: 1, max: 10, ticks: { stepSize: 2 }, grid: { color: 'rgba(255,255,255,0.05)' } },
          x: { grid: { display: false } },
        },
      },
    })
    return () => chart.destroy()
  }, [entries])  // eslint-disable-line

  return (
    <div style={{ background:'#111120', border:'1px solid rgba(255,255,255,0.07)', borderRadius:16, padding:20, marginBottom:12 }}>
      <div style={{ fontSize:'0.9rem', fontWeight:700, color:'#f1f5f9', marginBottom:16 }}>Well-being Over Time</div>
      <div style={{ height: 220 }}><canvas ref={ref}/></div>
    </div>
  )
}
