const OPTIONS = [
  { val: 'poor',  label: 'Poor',  color: '#ef4444', bg: 'rgba(239,68,68,0.18)'   },
  { val: 'low',   label: 'Low',   color: '#f97316', bg: 'rgba(249,115,22,0.18)'  },
  { val: 'fair',  label: 'Fair',  color: '#f59e0b', bg: 'rgba(245,158,11,0.18)'  },
  { val: 'good',  label: 'Good',  color: '#22c55e', bg: 'rgba(34,197,94,0.18)'   },
  { val: 'great', label: 'Great', color: '#10b981', bg: 'rgba(16,185,129,0.18)'  },
]

export default function QualityPicker({ value, onChange }) {
  return (
    <div style={{ display: 'flex', gap: 6 }}>
      {OPTIONS.map(o => {
        const active = value === o.val
        return (
          <button
            key={o.val}
            type="button"
            onClick={() => onChange(active ? null : o.val)}
            className="flex-1 transition-all duration-150"
            style={{
              padding: '9px 4px',
              borderRadius: 10,
              border: `1px solid ${active ? o.color + '80' : 'rgba(255,255,255,0.07)'}`,
              background: active ? o.bg : '#191928',
              color: active ? o.color : '#64748b',
              fontSize: '0.72rem',
              fontWeight: 700,
              cursor: 'pointer',
              textTransform: 'capitalize',
              fontFamily: 'inherit',
            }}
          >
            {o.label}
          </button>
        )
      })}
    </div>
  )
}
