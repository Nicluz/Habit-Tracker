const items = [
  {
    id: 'input',
    label: 'Today',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" className="w-6 h-6">
        <path d="M12 5v14M5 12h14"/>
      </svg>
    ),
  },
  {
    id: 'stats',
    label: 'Stats',
    icon: (
      <svg viewBox="0 0 24 24" fill="currentColor" stroke="none" className="w-6 h-6">
        <rect x="3"  y="13" width="3" height="8" rx="1"/>
        <rect x="8"  y="9"  width="3" height="12" rx="1"/>
        <rect x="13" y="6"  width="3" height="15" rx="1"/>
        <rect x="18" y="11" width="3" height="10" rx="1"/>
      </svg>
    ),
  },
  {
    id: 'training',
    label: 'Training',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" className="w-6 h-6">
        <path d="M6 4v16M18 4v16M3 8h4m10 0h4M3 16h4m10 0h4"/>
      </svg>
    ),
  },
  {
    id: 'settings',
    label: 'Profile',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" className="w-6 h-6">
        <circle cx="12" cy="8" r="3"/>
        <path d="M6 20v-2a6 6 0 0 1 12 0v2"/>
      </svg>
    ),
  },
]

export default function BottomNav({ active, onChange }) {
  return (
    <nav
      className="fixed bottom-0 left-0 right-0 flex items-stretch border-t"
      style={{
        height: 'calc(72px + env(safe-area-inset-bottom, 0px))',
        paddingBottom: 'env(safe-area-inset-bottom, 0px)',
        background: 'rgba(17,17,32,0.92)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        borderColor: 'rgba(255,255,255,0.07)',
        zIndex: 100,
      }}
    >
      {items.map(item => {
        const isActive = active === item.id
        return (
          <button
            key={item.id}
            onClick={() => onChange(item.id)}
            className="flex-1 flex flex-col items-center justify-center gap-1 transition-all duration-150"
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              color: isActive ? '#9d5ff5' : '#64748b',
              padding: '8px 4px',
            }}
          >
            <span style={{ filter: isActive ? 'drop-shadow(0 0 6px #7c3aed)' : 'none' }}>
              {item.icon}
            </span>
            <span style={{ fontSize: '0.67rem', fontWeight: 600, letterSpacing: '0.02em' }}>
              {item.label}
            </span>
          </button>
        )
      })}
    </nav>
  )
}
