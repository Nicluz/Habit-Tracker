import { useRef, useEffect } from 'react'

const ITEM_H  = 44
const VISIBLE = 5
const MINS    = Array.from({ length: 12 }, (_, i) => i * 5)   // 0,5,10…55

function ScrollDrum({ items, value, onChange, label }) {
  const ref      = useRef(null)
  const timer    = useRef(null)
  const didInit  = useRef(false)

  /* Set initial scroll position once */
  useEffect(() => {
    if (!ref.current || didInit.current) return
    const idx = items.indexOf(Number(value))
    if (idx >= 0) ref.current.scrollTop = idx * ITEM_H
    didInit.current = true
  })

  /* When value changes externally (e.g. loading saved entry), re-scroll */
  useEffect(() => {
    if (!ref.current) return
    const idx = items.indexOf(Number(value))
    if (idx >= 0) ref.current.scrollTop = idx * ITEM_H
  }, [value])   // eslint-disable-line

  function onScroll() {
    clearTimeout(timer.current)
    timer.current = setTimeout(() => {
      if (!ref.current) return
      const idx  = Math.round(ref.current.scrollTop / ITEM_H)
      const safe = Math.max(0, Math.min(idx, items.length - 1))
      ref.current.scrollTop = safe * ITEM_H   // snap
      onChange(items[safe])
    }, 90)
  }

  return (
    <div style={{ position: 'relative', width: 60 }}>
      {/* Selection highlight bar */}
      <div
        style={{
          position: 'absolute',
          top: ITEM_H * 2,
          left: 0, right: 0,
          height: ITEM_H,
          background: 'rgba(124,58,237,0.15)',
          borderRadius: 10,
          border: '1px solid rgba(124,58,237,0.35)',
          pointerEvents: 'none',
          zIndex: 1,
        }}
      />
      {/* Fade top */}
      <div style={{ position:'absolute', top:0, left:0, right:0, height: ITEM_H * 1.5,
        background:'linear-gradient(to bottom, #191928 20%, transparent)', pointerEvents:'none', zIndex:2 }}/>
      {/* Fade bottom */}
      <div style={{ position:'absolute', bottom:0, left:0, right:0, height: ITEM_H * 1.5,
        background:'linear-gradient(to top, #191928 20%, transparent)', pointerEvents:'none', zIndex:2 }}/>

      <div
        ref={ref}
        onScroll={onScroll}
        className="scrollbar-hide"
        style={{
          height: ITEM_H * VISIBLE,
          overflowY: 'scroll',
          scrollSnapType: 'y mandatory',
        }}
      >
        <div style={{ height: ITEM_H * 2 }} />
        {items.map(v => (
          <div
            key={v}
            style={{
              height: ITEM_H,
              scrollSnapAlign: 'center',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '1.4rem',
              fontWeight: 700,
              fontVariantNumeric: 'tabular-nums',
              color: value === v ? '#f1f5f9' : '#334155',
              transition: 'color 0.1s',
              cursor: 'pointer',
              userSelect: 'none',
            }}
            onClick={() => {
              ref.current.scrollTo({ top: items.indexOf(v) * ITEM_H, behavior: 'smooth' })
              onChange(v)
            }}
          >
            {String(v).padStart(2, '0')}
          </div>
        ))}
        <div style={{ height: ITEM_H * 2 }} />
      </div>

      {label && (
        <div style={{ textAlign:'center', fontSize:'0.58rem', fontWeight:700, color:'#475569',
          textTransform:'uppercase', letterSpacing:'0.08em', marginTop:4 }}>
          {label}
        </div>
      )}
    </div>
  )
}

export default function TimePicker({ hVal, mVal, onHChange, onMChange, maxH = 23 }) {
  const HOURS = Array.from({ length: maxH + 1 }, (_, i) => i)
  /* Round incoming minute to nearest 5 for display */
  const roundedM = mVal != null && mVal !== ''
    ? Math.round(Number(mVal) / 5) * 5 % 60
    : 0
  const h = hVal != null && hVal !== '' ? Math.min(Number(hVal), maxH) : 0

  return (
    <div
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 6,
        background: '#191928',
        border: '1px solid rgba(255,255,255,0.07)',
        borderRadius: 16,
        padding: '6px 20px 10px',
      }}
    >
      <ScrollDrum items={HOURS} value={h}        onChange={onHChange} label="HH" />
      <div style={{ fontSize:'1.8rem', fontWeight:800, color:'#334155', paddingBottom:14, userSelect:'none' }}>:</div>
      <ScrollDrum items={MINS}  value={roundedM} onChange={onMChange} label="MM" />
    </div>
  )
}
