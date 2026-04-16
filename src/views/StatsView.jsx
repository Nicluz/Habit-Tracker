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

/* Okabe-Ito colorblind-safe palette */
const CB_COLORS = ['#56B4E9', '#E69F00', '#009E73', '#F0E442', '#D55E00', '#CC79A7']

Chart.defaults.color = '#94a3b8'
Chart.defaults.borderColor = 'rgba(255,255,255,0.06)'
Chart.defaults.font.family = 'Inter, system-ui, sans-serif'

/* Reusable average-line dataset */
function avgDataset(data, label, color = 'rgba(255,255,255,0.5)') {
  const vals = data.filter(v => v != null)
  if (!vals.length) return null
  const avg = vals.reduce((s, v) => s + v, 0) / vals.length
  return {
    type: 'line',
    label,
    data: data.map(v => (v != null ? avg : null)),
    borderColor: color,
    borderDash: [6, 3],
    borderWidth: 2,
    pointRadius: 0,
    fill: false,
    spanGaps: true,
    order: 0,
  }
}

function useChart(ref, config, deps) {
  useEffect(() => {
    if (!ref.current) return
    const chart = new Chart(ref.current, config)
    return () => chart.destroy()
  }, deps) // eslint-disable-line
}

function StatChip({ label, value, sub, color = '#f1f5f9', large = false }) {
  return (
    <div style={{ background: '#111120', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 16, padding: large ? '20px 24px' : 16, boxShadow: '0 4px 24px rgba(0,0,0,0.4)' }}>
      <div style={{ fontSize: '0.68rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: '#94a3b8', marginBottom: 6 }}>{label}</div>
      <div style={{ fontSize: large ? '2.6rem' : '1.6rem', fontWeight: 800, letterSpacing: '-0.03em', color }}>{value ?? '—'}</div>
      {sub && <div style={{ fontSize: '0.73rem', color: '#64748b', marginTop: 2 }}>{sub}</div>}
    </div>
  )
}

function SleepRow({ bedTime, wakeTime, sleepDur }) {
  const items = [
    { label: 'Avg Bed Time',  value: bedTime,   color: '#818cf8' },
    { label: 'Avg Wake Up',   value: wakeTime,  color: '#06b6d4' },
    { label: 'Avg Sleep',     value: sleepDur,  color: '#3b82f6' },
  ]
  return (
    <div style={{ background: '#111120', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 16, padding: 16, boxShadow: '0 4px 24px rgba(0,0,0,0.4)', display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 0 }}>
      {items.map((it, i) => (
        <div key={it.label} style={{ textAlign: 'center', borderLeft: i > 0 ? '1px solid rgba(255,255,255,0.07)' : 'none', padding: '0 8px' }}>
          <div style={{ fontSize: '0.62rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: '#94a3b8', marginBottom: 6 }}>{it.label}</div>
          <div style={{ fontSize: '1.25rem', fontWeight: 800, letterSpacing: '-0.02em', color: it.color }}>{it.value ?? '—'}</div>
        </div>
      ))}
    </div>
  )
}

function ChartCard({ title, children, avg }) {
  return (
    <div style={{ background: '#111120', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 16, padding: 20, marginBottom: 12, boxShadow: '0 4px 24px rgba(0,0,0,0.4)' }}>
      <div style={{ fontSize: '0.9rem', fontWeight: 700, color: '#f1f5f9', marginBottom: 16 }}>{title}</div>
      {children}
      {avg && (
        <div style={{ marginTop: 10, paddingTop: 10, borderTop: '1px solid rgba(255,255,255,0.06)', fontSize: '0.75rem', color: '#64748b', textAlign: 'center' }}>
          {avg}
        </div>
      )}
    </div>
  )
}

export default function StatsView() {
  const { session } = useApp()
  const [mode,       setMode]       = useState('preset')
  const [periodIdx,  setPeriodIdx]  = useState(0)
  const [customFrom, setCustomFrom] = useState('')
  const [customTo,   setCustomTo]   = useState('')
  const [entries,    setEntries]    = useState([])
  const [loading,    setLoading]    = useState(true)
  const [allEntries, setAllEntries] = useState([])

  useEffect(() => {
    async function load() {
      setLoading(true)
      let from, to
      if (mode === 'custom') {
        if (!customFrom || !customTo) { setLoading(false); return }
        from = customFrom
        to   = customTo
      } else {
        const d = new Date()
        d.setDate(d.getDate() - PERIODS[periodIdx].days + 1)
        from = d.toISOString().split('T')[0]
        to   = new Date().toISOString().split('T')[0]
      }
      const { data } = await supabase
        .from('daily_entries')
        .select('*')
        .eq('user_id', session.user.id)
        .gte('date', from)
        .lte('date', to)
        .order('date')
      setEntries(data || [])
      setLoading(false)
    }
    load()
  }, [mode, periodIdx, customFrom, customTo, session.user.id])

  /* ─── Load ALL entries for sleep model (no date filter) ── */
  useEffect(() => {
    async function loadAll() {
      const { data } = await supabase
        .from('daily_entries')
        .select('sleep_h, sleep_m, wake_h, wake_m, energy_level, day_rating')
        .eq('user_id', session.user.id)
        .not('energy_level', 'is', null)
      setAllEntries(data || [])
    }
    loadAll()
  }, [session.user.id])

  /* ─── Computed stats ─────────────────────────────── */
  const n = entries.length

  const avgOf = (key) => {
    const vals = entries.map(e => e[key]).filter(v => v != null)
    return vals.length ? vals.reduce((s, v) => s + Number(v), 0) / vals.length : null
  }
  const sumOf  = (key) => entries.reduce((s, e) => s + (Number(e[key]) || 0), 0)
  const countOf = (key) => entries.filter(e => e[key]).length

  const avgDayRatingNum = avgOf('day_rating')
  const avgDayRating    = avgDayRatingNum != null ? avgDayRatingNum.toFixed(1) : null

  const fmtHM = (totalMins) => {
    const t = ((Math.round(totalMins) % 1440) + 1440) % 1440
    return `${String(Math.floor(t / 60)).padStart(2,'0')}:${String(t % 60).padStart(2,'0')}`
  }

  const avgSleep = (() => {
    const es = entries.filter(e => (e.sleep_h || 0) * 60 + (e.sleep_m || 0) > 0)
    if (!es.length) return null
    const m = es.reduce((s, e) => s + (e.sleep_h || 0) * 60 + (e.sleep_m || 0), 0) / es.length
    return `${Math.floor(m / 60)}h ${Math.round(m % 60)}m`
  })()

  const avgWake = (() => {
    const es = entries.filter(e => (e.wake_h || 0) * 60 + (e.wake_m || 0) > 0)
    if (!es.length) return null
    const m = es.reduce((s, e) => s + (e.wake_h || 0) * 60 + (e.wake_m || 0), 0) / es.length
    return fmtHM(m)
  })()

  const avgBedTime = (() => {
    // Only entries where both wake and sleep duration are set
    const es = entries.filter(e =>
      (e.wake_h || 0) * 60 + (e.wake_m || 0) > 0 &&
      (e.sleep_h || 0) * 60 + (e.sleep_m || 0) > 0
    )
    if (!es.length) return null
    // Compute raw bed time for each entry, wrapped 0-1439
    const mins = es.map(e => {
      const raw = (e.wake_h || 0) * 60 + (e.wake_m || 0) - ((e.sleep_h || 0) * 60 + (e.sleep_m || 0))
      return ((raw % 1440) + 1440) % 1440
    })
    // Circular mean: shift times before noon (+12h) so all bed times cluster near midnight
    const shifted = mins.map(m => m < 720 ? m + 1440 : m)
    const avg = shifted.reduce((s, v) => s + v, 0) / shifted.length
    return fmtHM(avg)
  })()

  const trainingSessions = entries.filter(e => e.activity && e.activity !== 'Rest Day').length

  const morningStreak = (() => {
    const sorted = [...entries].sort((a, b) => b.date.localeCompare(a.date))
    let streak = 0
    let prev = null
    for (const e of sorted) {
      const done = e.morning_routine && e.morning_routine !== 'no'
      if (!done) break
      if (prev !== null) {
        const diff = (new Date(prev + 'T12:00:00') - new Date(e.date + 'T12:00:00')) / 86400000
        if (diff !== 1) break
      }
      streak++
      prev = e.date
    }
    return streak
  })()

  const avgPushups = (() => {
    const es = entries.filter(e => (e.pushups || 0) > 0)
    if (!es.length) return null
    return Math.round(es.reduce((s, e) => s + (e.pushups || 0), 0) / es.length)
  })()

  const avgScreen = (() => {
    const es = entries.filter(e => e.screen_h != null)
    if (!es.length) return null
    const m = es.reduce((s, e) => s + (e.screen_h || 0) * 60 + (e.screen_m || 0), 0) / es.length
    return `${Math.floor(m / 60)}h ${Math.round(m % 60)}m`
  })()

  const avgSocial = (() => {
    const es = entries.filter(e => e.social_h != null)
    if (!es.length) return null
    const m = es.reduce((s, e) => s + (e.social_h || 0) * 60 + (e.social_m || 0), 0) / es.length
    return `${Math.floor(m / 60)}h ${Math.round(m % 60)}m`
  })()

  /* ─── Optimal sleep model (all data) ────────────── */
  const ENERGY_VAL = { exhausted: 1, tired: 2, neutral: 3, good: 4, energized: 5 }

  const sleepModel = (() => {
    const valid = allEntries.filter(e => {
      const dur  = (e.sleep_h || 0) * 60 + (e.sleep_m || 0)
      const wake = (e.wake_h  || 0) * 60 + (e.wake_m  || 0)
      // Require realistic values: 3–12h sleep, wake between 4am–12pm
      return ENERGY_VAL[e.energy_level] && dur >= 180 && dur <= 720 && wake >= 240 && wake <= 720
    })
    if (valid.length < 5) return null

    // Group by 30-min sleep duration buckets
    const durBuckets = {}
    const bedBuckets = {}
    for (const e of valid) {
      const durMins = (e.sleep_h || 0) * 60 + (e.sleep_m || 0)
      const wakeMins = (e.wake_h || 0) * 60 + (e.wake_m || 0)
      const rawBed = wakeMins - durMins
      const bedMins = ((rawBed % 1440) + 1440) % 1440
      const energy = ENERGY_VAL[e.energy_level]

      const durKey = Math.floor(durMins / 30) * 30
      if (!durBuckets[durKey]) durBuckets[durKey] = []
      durBuckets[durKey].push(energy)

      const bedKey = Math.floor(bedMins / 30) * 30
      if (!bedBuckets[bedKey]) bedBuckets[bedKey] = []
      bedBuckets[bedKey].push(energy)
    }

    const bestBucket = (buckets, minCount = 3) => {
      let best = null, bestAvg = -1
      for (const [key, vals] of Object.entries(buckets)) {
        if (vals.length < minCount) continue
        const avg = vals.reduce((s, v) => s + v, 0) / vals.length
        if (avg > bestAvg) { bestAvg = avg; best = { key: Number(key), avg, count: vals.length } }
      }
      return best
    }

    const bestDur = bestBucket(durBuckets)
    const bestBed = bestBucket(bedBuckets)

    const fmtDur = mins => {
      const h = Math.floor(mins / 60), m = mins % 60
      return m ? `${h}h ${m}m – ${h}h ${m + 30}m` : `${h}h – ${h}h 30m`
    }
    const fmtBed = mins => {
      const fmt = m => `${String(Math.floor(m / 60)).padStart(2,'0')}:${String(m % 60).padStart(2,'0')}`
      return `${fmt(mins)} – ${fmt((mins + 30) % 1440)}`
    }
    const energyLabel = avg => avg >= 4.5 ? 'Energized' : avg >= 3.5 ? 'Good' : avg >= 2.5 ? 'Neutral' : 'Tired'

    return {
      n: valid.length,
      dur: bestDur ? { range: fmtDur(bestDur.key), avg: bestDur.avg, count: bestDur.count, label: energyLabel(bestDur.avg) } : null,
      bed: bestBed ? { range: fmtBed(bestBed.key), avg: bestBed.avg, count: bestBed.count, label: energyLabel(bestBed.avg) } : null,
    }
  })()

  const alcoholDays     = entries.filter(e => e.alcohol).length
  const alcoholFreeDays = entries.filter(e => !e.alcohol).length
  const totalDrinks     = entries.filter(e => e.alcohol).reduce((s, e) => s + (Number(e.num_drinks) || 0), 0)
  const readingDays     = countOf('reading')

  /* ─── Chart data arrays ──────────────────────────── */
  const labels = entries.map(e => {
    const d = new Date(e.date + 'T12:00:00')
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
  })

  const ratingsData = entries.map(e => e.day_rating ?? null)
  const sleepData   = entries.map(e => e.sleep_h != null ? +((e.sleep_h || 0) + (e.sleep_m || 0) / 60).toFixed(2) : null)
  const wakeData    = entries.map(e => e.wake_h  != null ? +((e.wake_h  || 0) + (e.wake_m  || 0) / 60).toFixed(2) : null)

  /* Numeric averages for average-line datasets */
  const numAvg = (arr) => {
    const v = arr.filter(x => x != null)
    return v.length ? v.reduce((s, x) => s + x, 0) / v.length : null
  }
  const avgRatingH = numAvg(ratingsData)
  const avgSleepH  = numAvg(sleepData)
  const avgWakeH   = numAvg(wakeData)

  /* ─── Chart refs ─────────────────────────────────── */
  const ratingsRef  = useRef(null)
  const sleepRef    = useRef(null)
  const wakeRef     = useRef(null)
  const feelingsRef = useRef(null)
  const activRef    = useRef(null)
  const screenRef   = useRef(null)

  const chartDeps = [entries]

  /* Day rating – line + avg */
  useChart(ratingsRef, {
    type: 'line',
    data: {
      labels,
      datasets: [
        {
          label: 'Day Rating',
          data: ratingsData,
          borderColor: '#9d5ff5',
          backgroundColor: 'rgba(124,58,237,0.12)',
          borderWidth: 2.5,
          pointBackgroundColor: '#9d5ff5',
          pointRadius: 4,
          fill: true,
          tension: 0.35,
          spanGaps: true,
          order: 1,
        },
        avgRatingH != null && avgDataset(ratingsData, `Avg ${avgRatingH.toFixed(1)}`, 'rgba(255,255,255,0.5)'),
      ].filter(Boolean),
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

  /* Sleep duration – bar + avg */
  useChart(sleepRef, {
    type: 'bar',
    data: {
      labels,
      datasets: [
        {
          label: 'Sleep (hrs)',
          data: sleepData,
          backgroundColor: 'rgba(59,130,246,0.6)',
          borderColor: '#3b82f6',
          borderWidth: 1,
          borderRadius: 4,
          order: 1,
        },
        avgSleepH != null && avgDataset(sleepData, `Avg ${avgSleepH.toFixed(1)}h`, 'rgba(255,255,255,0.5)'),
      ].filter(Boolean),
    },
    options: {
      responsive: true,
      plugins: { legend: { display: false } },
      scales: {
        y: { min: 5, max: 10, ticks: { stepSize: 1 }, grid: { color: 'rgba(255,255,255,0.05)' } },
        x: { grid: { display: false } },
      },
    },
  }, chartDeps)

  /* Wake up time – bar + avg */
  useChart(wakeRef, {
    type: 'bar',
    data: {
      labels,
      datasets: [
        {
          label: 'Wake Up',
          data: wakeData,
          backgroundColor: 'rgba(16,185,129,0.55)',
          borderColor: '#10b981',
          borderWidth: 1,
          borderRadius: 4,
          order: 1,
        },
        avgWakeH != null && avgDataset(
          wakeData,
          `Avg ${Math.floor(avgWakeH)}:${String(Math.round((avgWakeH % 1) * 60)).padStart(2, '0')}`,
          'rgba(255,255,255,0.5)',
        ),
      ].filter(Boolean),
    },
    options: {
      responsive: true,
      plugins: { legend: { display: false } },
      scales: {
        y: {
          min: 5, max: 10,
          ticks: {
            stepSize: 1,
            callback: v => `${Math.floor(v)}:00`,
          },
          grid: { color: 'rgba(255,255,255,0.05)' },
        },
        x: { grid: { display: false } },
      },
    },
  }, chartDeps)

  /* Feelings radar */
  const feelingKeys   = ['feel_physical', 'feel_social', 'feel_work', 'feel_leisure', 'feel_inner', 'feel_overall']
  const feelingLabels = ['Physical', 'Social', 'Work', 'Leisure', 'Inner', 'Overall']
  const avgFeelings   = feelingKeys.map(k => {
    const v = avgOf(k)
    return v != null ? +v.toFixed(1) : null
  })

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

  /* Activity breakdown */
  const activityCounts = entries.reduce((acc, e) => {
    if (e.activity) acc[e.activity] = (acc[e.activity] || 0) + 1
    return acc
  }, {})
  const actLabels = Object.keys(activityCounts)
  const actColors = ['#9d5ff5', '#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#ec4899', '#14b8a6', '#f97316']

  useChart(activRef, {
    type: 'bar',
    data: {
      labels: actLabels,
      datasets: [{
        data: actLabels.map(k => activityCounts[k]),
        backgroundColor: actLabels.map((_, i) => actColors[i % actColors.length] + '99'),
        borderColor:     actLabels.map((_, i) => actColors[i % actColors.length]),
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

  /* Screen vs social */
  useChart(screenRef, {
    type: 'line',
    data: {
      labels,
      datasets: [
        {
          label: 'Screen Time (h)',
          data: entries.map(e => e.screen_h != null ? +((e.screen_h || 0) + (e.screen_m || 0) / 60).toFixed(2) : null),
          borderColor: '#f59e0b',
          backgroundColor: 'rgba(245,158,11,0.1)',
          borderWidth: 2, pointRadius: 3, tension: 0.35, fill: true, spanGaps: true,
        },
        {
          label: 'Social Media (h)',
          data: entries.map(e => e.social_h != null ? +((e.social_h || 0) + (e.social_m || 0) / 60).toFixed(2) : null),
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

  /* ─── Loading spinner ────────────────────────────── */
  if (loading) {
    return (
      <div className="flex items-center justify-center" style={{ height: '60vh' }}>
        <div className="w-8 h-8 rounded-full spin" style={{ border: '3px solid rgba(124,58,237,0.2)', borderTopColor: '#7c3aed' }} />
      </div>
    )
  }

  const tabStyle = (active) => ({
    flex: 1, padding: '8px', borderRadius: 8, border: 'none', fontFamily: 'inherit',
    fontSize: '0.875rem', fontWeight: 600, cursor: 'pointer', transition: 'all 0.15s',
    background: active ? 'linear-gradient(135deg,#7c3aed,#9d5ff5)' : 'transparent',
    color:      active ? '#fff' : '#64748b',
    boxShadow:  active ? '0 2px 10px rgba(124,58,237,0.3)' : 'none',
  })

  const dateInputStyle = {
    flex: 1, background: '#191928', border: '1px solid rgba(255,255,255,0.07)',
    borderRadius: 10, color: '#f1f5f9', fontFamily: 'inherit', fontSize: '0.875rem',
    padding: '9px 12px', outline: 'none', colorScheme: 'dark',
  }

  const noData = mode === 'custom' && (!customFrom || !customTo)

  return (
    <div style={{ maxWidth: 640, margin: '0 auto', padding: '0 16px' }}>
      <div className="py-5">
        <h1 style={{ fontSize: '1.5rem', fontWeight: 800, letterSpacing: '-0.03em' }}>Statistics</h1>
        <p style={{ fontSize: '0.8rem', color: '#94a3b8', marginTop: 2 }}>Track your progress over time</p>
      </div>

      {/* ── Period tabs ── */}
      <div className="flex gap-1.5 rounded-xl p-1.5 mb-2" style={{ background: '#111120', border: '1px solid rgba(255,255,255,0.07)' }}>
        {PERIODS.map((p, i) => (
          <button key={p.label} onClick={() => { setMode('preset'); setPeriodIdx(i) }}
            style={tabStyle(mode === 'preset' && periodIdx === i)}
          >{p.label}</button>
        ))}
        <button onClick={() => setMode('custom')} style={tabStyle(mode === 'custom')}>Custom</button>
      </div>

      {/* ── Custom date range ── */}
      {mode === 'custom' && (
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
          <input
            type="date"
            value={customFrom}
            onChange={e => setCustomFrom(e.target.value)}
            style={dateInputStyle}
          />
          <span style={{ color: '#475569', flexShrink: 0, fontSize: '1rem' }}>→</span>
          <input
            type="date"
            value={customTo}
            onChange={e => setCustomTo(e.target.value)}
            style={dateInputStyle}
          />
        </div>
      )}

      {/* ── Empty state ── */}
      {(noData || n === 0) ? (
        <div className="text-center py-20" style={{ color: '#64748b' }}>
          <div style={{ fontSize: '3rem', marginBottom: 12 }}>📊</div>
          <p style={{ lineHeight: 1.6 }}>
            {noData
              ? 'Pick a start and end date above.'
              : 'No entries found for this period.\nStart logging your days!'}
          </p>
        </div>
      ) : (
        <>
          {/* ── Summary chips ── */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 12 }}>
            {/* Day rating — full width, large */}
            <StatChip label="Avg Day Rating" value={avgDayRating} color="#9d5ff5" sub={`over ${n} days`} large />

            {/* Sleep row — 3 stats in one card */}
            <SleepRow bedTime={avgBedTime} wakeTime={avgWake} sleepDur={avgSleep} />

            {/* Screen + Social */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
              <StatChip label="Avg Screen Time"  value={avgScreen} color="#f97316" />
              <StatChip label="Avg Social Media" value={avgSocial} color="#ec4899" />
            </div>

            {/* Morning streak + Reading */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
              <StatChip label="Morning Streak" value={morningStreak} color="#f59e0b" sub="consecutive days" />
              <StatChip label="Reading Days"   value={readingDays}   color="#14b8a6" sub={`of ${n} days`}  />
            </div>

            {/* Training + Push-ups */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
              <StatChip label="Training Sessions" value={trainingSessions} color="#10b981" sub="excl. rest days" />
              <StatChip label="Avg Push-ups"      value={avgPushups}       color="#ef4444" sub="on active days"  />
            </div>

            {/* Alcohol — bottom */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
              <StatChip label="Alcohol-Free Days" value={alcoholFreeDays} color="#22c55e" sub={`of ${n} days`} />
              <StatChip label="Pints Drunk"       value={totalDrinks}     color="#94a3b8" sub={alcoholDays > 0 ? `across ${alcoholDays} days` : 'none this period'} />
            </div>
          </div>

          {/* ── Day Rating ── */}
          <ChartCard title="Day Rating" avg={avgDayRating ? `Avg ${avgDayRating} / 10` : null}>
            <div style={{ height: 180 }}><canvas ref={ratingsRef} /></div>
          </ChartCard>

          {/* ── Sleep Duration ── */}
          <ChartCard title="Sleep Duration (hours)" avg={avgSleep ? `Avg ${avgSleep}` : null}>
            <div style={{ height: 180 }}><canvas ref={sleepRef} /></div>
          </ChartCard>

          {/* ── Wake Up Time ── */}
          <ChartCard title="Wake Up Time" avg={avgWake ? `Avg ${avgWake}` : null}>
            <div style={{ height: 180 }}><canvas ref={wakeRef} /></div>
          </ChartCard>

          {/* ── Avg Well-being Radar ── */}
          <ChartCard title="Avg Well-being (Radar)">
            <div style={{ height: 260, maxWidth: 320, margin: '0 auto' }}><canvas ref={feelingsRef} /></div>
          </ChartCard>

          {/* ── Well-being Over Time ── */}
          <WellbeingChart entries={entries} labels={labels} />

          {/* ── Activities ── */}
          {actLabels.length > 0 && (
            <ChartCard title="Activities Breakdown">
              <div style={{ height: 180 }}><canvas ref={activRef} /></div>
            </ChartCard>
          )}

          {/* ── Screen & Social ── */}
          <ChartCard title="Screen & Social Media Time" avg={[avgScreen && `Screen avg ${avgScreen}`, avgSocial && `Social avg ${avgSocial}`].filter(Boolean).join(' · ') || null}>
            <div style={{ height: 180 }}><canvas ref={screenRef} /></div>
          </ChartCard>

          {/* ── Optimal Sleep Model ── */}
          {sleepModel ? (
            <ChartCard title={`Optimal Sleep Model · based on ${sleepModel.n} nights`}>
              <p style={{ fontSize: '0.75rem', color: '#64748b', marginBottom: 14 }}>
                Calculated from all your logged nights with an energy level. Shows which sleep duration and bed time correlate with the highest energy the next day.
              </p>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                {sleepModel.dur && (
                  <div style={{ background: '#191928', borderRadius: 12, padding: 14, border: '1px solid rgba(59,130,246,0.2)' }}>
                    <div style={{ fontSize: '0.63rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: '#94a3b8', marginBottom: 8 }}>Optimal Duration</div>
                    <div style={{ fontSize: '1.1rem', fontWeight: 800, color: '#3b82f6', marginBottom: 4 }}>{sleepModel.dur.range}</div>
                    <div style={{ fontSize: '0.72rem', color: '#64748b' }}>avg energy: <span style={{ color: '#10b981', fontWeight: 600 }}>{sleepModel.dur.label}</span></div>
                    <div style={{ fontSize: '0.68rem', color: '#475569', marginTop: 2 }}>{sleepModel.dur.count} nights sampled</div>
                  </div>
                )}
                {sleepModel.bed && (
                  <div style={{ background: '#191928', borderRadius: 12, padding: 14, border: '1px solid rgba(129,140,248,0.2)' }}>
                    <div style={{ fontSize: '0.63rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: '#94a3b8', marginBottom: 8 }}>Optimal Bed Time</div>
                    <div style={{ fontSize: '1.1rem', fontWeight: 800, color: '#818cf8', marginBottom: 4 }}>{sleepModel.bed.range}</div>
                    <div style={{ fontSize: '0.72rem', color: '#64748b' }}>avg energy: <span style={{ color: '#10b981', fontWeight: 600 }}>{sleepModel.bed.label}</span></div>
                    <div style={{ fontSize: '0.68rem', color: '#475569', marginTop: 2 }}>{sleepModel.bed.count} nights sampled</div>
                  </div>
                )}
              </div>
            </ChartCard>
          ) : (
            <ChartCard title="Optimal Sleep Model">
              <p style={{ fontSize: '0.78rem', color: '#64748b' }}>
                Log at least 3 nights with an energy level to unlock your personal sleep model.
              </p>
            </ChartCard>
          )}

          {/* ── Sleep Quality Distribution ── */}
          <ChartCard title="Sleep Quality Distribution">
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              {['poor', 'low', 'fair', 'good', 'great'].map(q => {
                const c = entries.filter(e => e.sleep_quality === q).length
                const colors = { poor: '#ef4444', low: '#f97316', fair: '#f59e0b', good: '#22c55e', great: '#10b981' }
                return (
                  <div key={q} style={{ flex: 1, minWidth: 60, background: '#191928', borderRadius: 10, padding: '10px 8px', textAlign: 'center', border: `1px solid ${colors[q]}33` }}>
                    <div style={{ fontSize: '1.2rem', fontWeight: 800, color: colors[q] }}>{c}</div>
                    <div style={{ fontSize: '0.68rem', fontWeight: 600, color: '#64748b', textTransform: 'capitalize', marginTop: 2 }}>{q}</div>
                  </div>
                )
              })}
            </div>
          </ChartCard>
        </>
      )}
    </div>
  )
}

/* ── Well-being Over Time (colorblind-safe) ─────── */
function WellbeingChart({ entries, labels }) {
  const ref = useRef(null)

  useEffect(() => {
    if (!ref.current) return
    const KEYS = ['feel_physical', 'feel_social', 'feel_work', 'feel_leisure', 'feel_inner', 'feel_overall']
    const LBLS = ['Physical', 'Social', 'Work', 'Leisure', 'Inner', 'Overall']
    const chart = new Chart(ref.current, {
      type: 'line',
      data: {
        labels,
        datasets: KEYS.map((k, i) => ({
          label: LBLS[i],
          data: entries.map(e => e[k] ?? null),
          borderColor: CB_COLORS[i],
          backgroundColor: 'transparent',
          borderWidth: 2,
          pointRadius: 2.5,
          tension: 0.35,
          spanGaps: true,
        })),
      },
      options: {
        responsive: true,
        plugins: {
          legend: {
            labels: { boxWidth: 10, padding: 12, color: '#94a3b8', font: { size: 11 } },
          },
        },
        scales: {
          y: { min: 1, max: 10, ticks: { stepSize: 2 }, grid: { color: 'rgba(255,255,255,0.05)' } },
          x: { grid: { display: false } },
        },
      },
    })
    return () => chart.destroy()
  }, [entries]) // eslint-disable-line

  return (
    <div style={{ background: '#111120', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 16, padding: 20, marginBottom: 12, boxShadow: '0 4px 24px rgba(0,0,0,0.4)' }}>
      <div style={{ fontSize: '0.9rem', fontWeight: 700, color: '#f1f5f9', marginBottom: 16 }}>Well-being Over Time</div>
      <div style={{ height: 220 }}><canvas ref={ref} /></div>
    </div>
  )
}
