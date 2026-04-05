const COLORS = [
  '#ef4444','#f97316','#f59e0b','#eab308','#84cc16',
  '#22c55e','#10b981','#14b8a6','#3b82f6','#8b5cf6',
]

export default function RatingGrid({ value, onChange, label }) {
  return (
    <div>
      {label && (
        <div className="flex items-center gap-1.5 mb-2">
          <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#7c3aed', flexShrink: 0, display: 'inline-block' }} />
          <span style={{ fontSize: '0.8125rem', fontWeight: 600, color: '#cbd5e1' }}>{label}</span>
          {value && <span style={{ fontSize: '0.8125rem', fontWeight: 700, color: COLORS[value - 1], marginLeft: 'auto' }}>{value}/10</span>}
        </div>
      )}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(10, 1fr)', gap: 4 }}>
        {Array.from({ length: 10 }, (_, i) => {
          const n = i + 1
          const active = value === n
          return (
            <button
              key={n}
              type="button"
              onClick={() => onChange(active ? null : n)}
              className="flex items-center justify-center transition-all duration-150"
              style={{
                aspectRatio: '1',
                borderRadius: 6,
                border: `1px solid ${active ? COLORS[i] : 'rgba(255,255,255,0.07)'}`,
                background: active ? `${COLORS[i]}22` : '#191928',
                color: active ? COLORS[i] : '#64748b',
                fontSize: '0.8rem',
                fontWeight: 700,
                cursor: 'pointer',
                boxShadow: active ? `0 0 8px ${COLORS[i]}44` : 'none',
                fontFamily: 'inherit',
              }}
            >
              {n}
            </button>
          )
        })}
      </div>
    </div>
  )
}
