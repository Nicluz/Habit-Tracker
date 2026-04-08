import { useRef, useEffect } from 'react'

const ITEM_H  = 44
const VISIBLE = 5

export default function Counter({ value, onChange, step = 1, max = 20 }) {
  const items   = Array.from({ length: Math.floor(max / step) + 1 }, (_, i) => i * step)
  const ref     = useRef(null)
  const timer   = useRef(null)
  const didInit = useRef(false)

  /* Snap incoming value to nearest item */
  const nearest = items.reduce((prev, cur) =>
    Math.abs(cur - Number(value)) < Math.abs(prev - Number(value)) ? cur : prev, 0)

  /* Initial scroll position */
  useEffect(() => {
    if (!ref.current || didInit.current) return
    const idx = items.indexOf(nearest)
    if (idx >= 0) ref.current.scrollTop = idx * ITEM_H
    didInit.current = true
  })

  /* Re-scroll when value changes externally */
  useEffect(() => {
    if (!ref.current) return
    const idx = items.indexOf(nearest)
    if (idx >= 0) ref.current.scrollTop = idx * ITEM_H
  }, [value]) // eslint-disable-line

  function onScroll() {
    clearTimeout(timer.current)
    timer.current = setTimeout(() => {
      if (!ref.current) return
      const idx  = Math.round(ref.current.scrollTop / ITEM_H)
      const safe = Math.max(0, Math.min(idx, items.length - 1))
      ref.current.scrollTop = safe * ITEM_H
      onChange(items[safe])
    }, 90)
  }

  return (
    <div style={{ position: 'relative', background: '#191928', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 16, padding: '6px 0 10px', overflow: 'hidden' }}>

      {/* Selection highlight bar */}
      <div style={{
        position: 'absolute',
        top: ITEM_H * 2 + 6,
        left: 16, right: 16,
        height: ITEM_H,
        background: 'rgba(124,58,237,0.15)',
        borderRadius: 10,
        border: '1px solid rgba(124,58,237,0.35)',
        pointerEvents: 'none',
        zIndex: 1,
      }} />

      {/* Fade top */}
      <div style={{
        position: 'absolute', top: 6, left: 0, right: 0, height: ITEM_H * 1.5,
        background: 'linear-gradient(to bottom, #191928 20%, transparent)',
        pointerEvents: 'none', zIndex: 2,
      }} />
      {/* Fade bottom */}
      <div style={{
        position: 'absolute', bottom: 10, left: 0, right: 0, height: ITEM_H * 1.5,
        background: 'linear-gradient(to top, #191928 20%, transparent)',
        pointerEvents: 'none', zIndex: 2,
      }} />

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
            onClick={() => {
              ref.current.scrollTo({ top: items.indexOf(v) * ITEM_H, behavior: 'smooth' })
              onChange(v)
            }}
            style={{
              height: ITEM_H,
              scrollSnapAlign: 'center',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '1.6rem',
              fontWeight: 700,
              fontVariantNumeric: 'tabular-nums',
              color: nearest === v ? '#f1f5f9' : '#334155',
              transition: 'color 0.1s',
              cursor: 'pointer',
              userSelect: 'none',
            }}
          >
            {v}
          </div>
        ))}
        <div style={{ height: ITEM_H * 2 }} />
      </div>
    </div>
  )
}
