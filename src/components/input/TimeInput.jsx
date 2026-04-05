/** Two-field HH:MM input */
export default function TimeInput({ hVal, mVal, onHChange, onMChange, placeholder = ['22','30'] }) {
  function clamp(v, min, max) { return Math.max(min, Math.min(max, parseInt(v) || 0)) }

  const fieldStyle = {
    background: 'none', border: 'none', outline: 'none',
    color: '#f1f5f9', fontFamily: 'inherit',
    fontSize: '1.5rem', fontWeight: 800,
    width: 48, textAlign: 'center', padding: '4px 0',
    fontVariantNumeric: 'tabular-nums',
  }

  return (
    <div
      className="flex items-center gap-2 rounded-xl px-3 py-1 transition-all duration-150"
      style={{ background: '#191928', border: '1px solid rgba(255,255,255,0.07)' }}
      onFocusCapture={e => { e.currentTarget.style.borderColor = '#7c3aed'; e.currentTarget.style.boxShadow = '0 0 0 3px rgba(124,58,237,0.22)' }}
      onBlurCapture={e  => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.07)'; e.currentTarget.style.boxShadow = 'none' }}
    >
      <div className="flex flex-col items-center gap-0.5">
        <input
          type="number" min="0" max="23"
          value={hVal === '' || hVal == null ? '' : hVal}
          placeholder={placeholder[0]}
          onChange={e => onHChange(e.target.value === '' ? '' : clamp(e.target.value, 0, 23))}
          style={fieldStyle}
        />
        <span style={{ fontSize: '0.58rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.08em' }}>HH</span>
      </div>
      <span style={{ fontSize: '1.5rem', fontWeight: 800, color: '#475569', paddingBottom: 12 }}>:</span>
      <div className="flex flex-col items-center gap-0.5">
        <input
          type="number" min="0" max="59"
          value={mVal === '' || mVal == null ? '' : mVal}
          placeholder={placeholder[1]}
          onChange={e => onMChange(e.target.value === '' ? '' : clamp(e.target.value, 0, 59))}
          style={fieldStyle}
        />
        <span style={{ fontSize: '0.58rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.08em' }}>MM</span>
      </div>
    </div>
  )
}
