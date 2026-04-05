export default function Toggle({ label, checked, onChange, sublabel }) {
  return (
    <div className="flex items-center justify-between gap-3">
      <div>
        <span style={{ fontSize: '0.8125rem', fontWeight: 600, color: '#cbd5e1' }}>{label}</span>
        {sublabel && <div style={{ fontSize: '0.75rem', color: '#64748b', marginTop: 1 }}>{sublabel}</div>}
      </div>
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        onClick={() => onChange(!checked)}
        className="relative flex-shrink-0 rounded-full transition-all duration-200"
        style={{
          width: 52, height: 30,
          background: checked ? 'rgba(16,185,129,0.15)' : '#21213a',
          border: `1px solid ${checked ? 'rgba(16,185,129,0.4)' : 'rgba(255,255,255,0.07)'}`,
          cursor: 'pointer',
        }}
      >
        <span
          className="absolute rounded-full transition-all duration-200"
          style={{
            top: 3, left: checked ? 21 : 3,
            width: 22, height: 22,
            background: checked ? '#10b981' : '#64748b',
            boxShadow: checked ? '0 0 8px rgba(16,185,129,0.5)' : '0 2px 4px rgba(0,0,0,0.4)',
          }}
        />
      </button>
    </div>
  )
}
