export default function Counter({ value, onChange }) {
  function adjust(delta) {
    onChange(Math.max(0, (parseInt(value) || 0) + delta))
  }

  const btnStyle = (label) => ({
    width: label.length > 1 ? 46 : 38,
    height: 38,
    background: '#21213a',
    border: '1px solid rgba(255,255,255,0.07)',
    borderRadius: 8,
    color: '#f1f5f9',
    fontSize: label === '−' || label === '+' ? '1.3rem' : '0.8rem',
    fontWeight: 700,
    cursor: 'pointer',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    flexShrink: 0,
    fontFamily: 'inherit',
    transition: 'background 0.15s',
  })

  return (
    <div
      className="flex items-center gap-2 rounded-xl p-1.5"
      style={{ background: '#191928', border: '1px solid rgba(255,255,255,0.07)' }}
    >
      <button type="button" style={btnStyle('−10')} onClick={() => adjust(-10)}>−10</button>
      <button type="button" style={btnStyle('−')}   onClick={() => adjust(-1)}>−</button>
      <input
        type="number"
        min="0"
        value={value || 0}
        onChange={e => onChange(Math.max(0, parseInt(e.target.value) || 0))}
        className="flex-1 text-center outline-none"
        style={{
          background: 'none', border: 'none',
          color: '#f1f5f9', fontFamily: 'inherit',
          fontSize: '1.5rem', fontWeight: 800,
          fontVariantNumeric: 'tabular-nums',
        }}
      />
      <button type="button" style={btnStyle('+')}   onClick={() => adjust(1)}>+</button>
      <button type="button" style={btnStyle('+10')} onClick={() => adjust(10)}>+10</button>
    </div>
  )
}
