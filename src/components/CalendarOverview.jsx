import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { useApp } from '../App'

const DAY_HEADERS = ['Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa', 'Su']

function todayStr() { return new Date().toISOString().split('T')[0] }

function pad(n) { return String(n).padStart(2, '0') }

export default function CalendarOverview({ selectedDate, onSelectDate, onReset }) {
  const { session } = useApp()
  const today = todayStr()

  const initDate = new Date(selectedDate + 'T12:00:00')
  const [view, setView] = useState({ year: initDate.getFullYear(), month: initDate.getMonth() })
  const [entryDates, setEntryDates] = useState({})
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      setLoading(true)
      const from = `${view.year}-${pad(view.month + 1)}-01`
      const lastDay = new Date(view.year, view.month + 1, 0).getDate()
      const to   = `${view.year}-${pad(view.month + 1)}-${pad(lastDay)}`
      const { data } = await supabase
        .from('daily_entries')
        .select('date, sleep_h, wake_h, day_rating, activity, feel_overall, energy_level, sleep_quality')
        .eq('user_id', session.user.id)
        .gte('date', from)
        .lte('date', to)
      const map = {}
      for (const e of (data || [])) map[e.date] = e
      setEntryDates(map)
      setLoading(false)
    }
    load()
  }, [view, session.user.id])

  /* Build grid cells */
  const firstDow = new Date(view.year, view.month, 1).getDay()  // 0=Sun
  const startOffset = firstDow === 0 ? 6 : firstDow - 1         // make Mon=0
  const daysInMonth = new Date(view.year, view.month + 1, 0).getDate()

  const cells = [
    ...Array(startOffset).fill(null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
  ]

  const monthLabel = new Date(view.year, view.month, 1).toLocaleDateString('en-US', {
    month: 'long', year: 'numeric',
  })

  function prevMonth() {
    setView(v => {
      const d = new Date(v.year, v.month - 1)
      return { year: d.getFullYear(), month: d.getMonth() }
    })
  }

  function nextMonth() {
    setView(v => {
      const d = new Date(v.year, v.month + 1)
      return { year: d.getFullYear(), month: d.getMonth() }
    })
  }

  function goToday() {
    const d = new Date()
    setView({ year: d.getFullYear(), month: d.getMonth() })
    onSelectDate(today)
  }

  return (
    <div style={{
      background: '#111120',
      border: '1px solid rgba(255,255,255,0.07)',
      borderRadius: 16,
      padding: '14px 12px',
      marginBottom: 12,
    }}>
      {/* Header row */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
        <button onClick={prevMonth} style={navBtnStyle}>‹</button>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ fontSize: '0.9rem', fontWeight: 700, color: '#f1f5f9' }}>{monthLabel}</span>
          {loading && <div style={{ width: 10, height: 10, borderRadius: '50%', border: '2px solid rgba(124,58,237,0.3)', borderTopColor: '#7c3aed' }} className="spin"/>}
        </div>
        <button onClick={nextMonth} style={navBtnStyle}>›</button>
      </div>

      {/* Day-of-week headers */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 2, marginBottom: 4 }}>
        {DAY_HEADERS.map(d => (
          <div key={d} style={{ textAlign: 'center', fontSize: '0.63rem', fontWeight: 700, color: '#475569', padding: '2px 0' }}>
            {d}
          </div>
        ))}
      </div>

      {/* Day cells */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 2 }}>
        {cells.map((day, i) => {
          if (!day) return <div key={`e-${i}`} />

          const dateStr  = `${view.year}-${pad(view.month + 1)}-${pad(day)}`
          const isToday    = dateStr === today
          const isSelected = dateStr === selectedDate
          const entry      = entryDates[dateStr]
          const hasEntry   = !!entry
          const isComplete = hasEntry && (entry.sleep_h || 0) > 0 && (entry.wake_h || 0) > 0 && entry.day_rating != null && entry.feel_overall != null
          const isPartial  = hasEntry && !isComplete
          const isFuture   = dateStr > today

          return (
            <button
              key={dateStr}
              onClick={() => { if (!isFuture) onSelectDate(dateStr) }}
              style={{
                aspectRatio: '1',
                borderRadius: 8,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 2,
                border: `1px solid ${
                  isSelected ? '#9d5ff5' :
                  isToday    ? 'rgba(124,58,237,0.35)' :
                  'transparent'
                }`,
                background: isSelected
                  ? 'linear-gradient(135deg,#7c3aed,#9d5ff5)'
                  : isToday
                  ? 'rgba(124,58,237,0.12)'
                  : isComplete
                  ? 'rgba(16,185,129,0.1)'
                  : isPartial
                  ? 'rgba(245,158,11,0.08)'
                  : 'transparent',
                color: isSelected ? '#fff' : isFuture ? '#1e293b' : isToday ? '#9d5ff5' : '#94a3b8',
                cursor: isFuture ? 'default' : 'pointer',
                fontSize: '0.78rem',
                fontWeight: isSelected || isToday ? 700 : 400,
                fontFamily: 'inherit',
                transition: 'all 0.12s',
                padding: 0,
              }}
              onMouseOver={e => { if (!isFuture && !isSelected) e.currentTarget.style.background = 'rgba(255,255,255,0.05)' }}
              onMouseOut={e  => { if (!isFuture && !isSelected) e.currentTarget.style.background = isComplete ? 'rgba(16,185,129,0.1)' : isPartial ? 'rgba(245,158,11,0.08)' : 'transparent' }}
            >
              <span>{day}</span>
              {hasEntry && (
                <div style={{
                  width: 4, height: 4, borderRadius: '50%',
                  background: isSelected ? 'rgba(255,255,255,0.75)' : isComplete ? '#10b981' : '#f59e0b',
                  flexShrink: 0,
                }} />
              )}
            </button>
          )
        })}
      </div>

      {/* Legend + today shortcut + reset */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 10 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: '0.68rem', color: '#475569' }}>
          <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
            <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#10b981', display: 'inline-block' }}/>
            complete
          </span>
          <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
            <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#f59e0b', display: 'inline-block' }}/>
            partial
          </span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          {onReset && !!entryDates[selectedDate] && (
            <button
              onClick={() => onReset()}
              style={{ background: 'none', border: 'none', color: '#ef4444', fontSize: '0.75rem', fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit', opacity: 0.8 }}>
              Reset day
            </button>
          )}
          {selectedDate !== today && (
            <button onClick={goToday} style={{ background: 'none', border: 'none', color: '#7c3aed', fontSize: '0.75rem', fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit' }}>
              Go to today
            </button>
          )}
        </div>
      </div>
    </div>
  )
}

const navBtnStyle = {
  width: 28, height: 28,
  background: '#191928',
  border: '1px solid rgba(255,255,255,0.07)',
  borderRadius: 8,
  color: '#94a3b8',
  fontSize: '1rem',
  cursor: 'pointer',
  display: 'flex', alignItems: 'center', justifyContent: 'center',
  fontFamily: 'inherit',
  transition: 'all 0.12s',
}
