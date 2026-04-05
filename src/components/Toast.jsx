const ICONS = { success: '✓', error: '✕', info: 'ℹ' }
const COLORS = {
  success: { border: 'rgba(16,185,129,0.4)',  icon: '#10b981' },
  error:   { border: 'rgba(239,68,68,0.4)',   icon: '#ef4444' },
  info:    { border: 'rgba(59,130,246,0.4)',  icon: '#3b82f6' },
}

export default function Toast({ toasts }) {
  if (!toasts.length) return null
  return (
    <div className="fixed top-4 left-4 right-4 z-[999] flex flex-col gap-2 pointer-events-none" style={{ maxWidth: 420, margin: '0 auto' }}>
      {toasts.map(t => {
        const c = COLORS[t.type] || COLORS.success
        return (
          <div
            key={t.id}
            className="toast-enter toast-leave flex items-center gap-3 rounded-xl px-4 py-3 pointer-events-auto"
            style={{
              background: '#21213a',
              border: `1px solid ${c.border}`,
              boxShadow: '0 4px 24px rgba(0,0,0,0.4)',
              fontSize: '0.875rem',
              fontWeight: 500,
              color: '#f1f5f9',
            }}
          >
            <span style={{ color: c.icon, fontWeight: 700 }}>{ICONS[t.type] || '✓'}</span>
            <span>{t.msg}</span>
          </div>
        )
      })}
    </div>
  )
}
