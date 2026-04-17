import { useState, useEffect, useRef } from 'react'
import { supabase } from '../lib/supabase'
import { useApp } from '../App'

const LEVELS = [
  { key: '1', label: 'Today',           color: '#ef4444', bg: 'rgba(239,68,68,0.12)',   border: 'rgba(239,68,68,0.25)'   },
  { key: '2', label: 'Within Few Days', color: '#f97316', bg: 'rgba(249,115,22,0.12)',  border: 'rgba(249,115,22,0.25)'  },
  { key: '3', label: 'Within a Week',   color: '#f59e0b', bg: 'rgba(245,158,11,0.12)',  border: 'rgba(245,158,11,0.25)'  },
  { key: '4', label: 'When Time',       color: '#3b82f6', bg: 'rgba(59,130,246,0.12)',  border: 'rgba(59,130,246,0.25)'  },
  { key: '5', label: 'Keep in Mind',    color: '#94a3b8', bg: 'rgba(148,163,184,0.08)', border: 'rgba(148,163,184,0.15)' },
]

const EXTRA_SECTIONS = [
  { key: 'shopping',       label: 'Shopping List',              color: '#f97316', bg: 'rgba(249,115,22,0.12)',  border: 'rgba(249,115,22,0.25)'  },
  { key: 'spare_time',     label: 'Spare Time Activities',     color: '#10b981', bg: 'rgba(16,185,129,0.12)',  border: 'rgba(16,185,129,0.25)'  },
  { key: 'friends',        label: 'Meet Friends',               color: '#8b5cf6', bg: 'rgba(139,92,246,0.12)', border: 'rgba(139,92,246,0.25)'  },
  { key: 'sursee_luzern',  label: 'Transfer Sursee → Lucerne', color: '#06b6d4', bg: 'rgba(6,182,212,0.12)',  border: 'rgba(6,182,212,0.25)'   },
  { key: 'luzern_sursee',  label: 'Transfer Lucerne → Sursee', color: '#06b6d4', bg: 'rgba(6,182,212,0.12)',  border: 'rgba(6,182,212,0.25)'   },
]

const ALL_KEYS = [...LEVELS.map(l => l.key), ...EXTRA_SECTIONS.map(s => s.key)]
const EMPTY_DATA = Object.fromEntries(ALL_KEYS.map(k => [k, []]))

function genId() { return Math.random().toString(36).slice(2) }

/* iOS zoom prevention: font-size must be ≥ 16px on inputs */
const inputStyle = {
  flex: 1, background: '#191928', border: '1px solid rgba(255,255,255,0.07)',
  borderRadius: 8, color: '#f1f5f9', fontFamily: 'inherit', fontSize: '16px',
  padding: '8px 12px', outline: 'none',
}

export default function PrioritiesView() {
  const { session } = useApp()
  const [data, setData]     = useState(EMPTY_DATA)
  const [drafts, setDrafts] = useState(Object.fromEntries(ALL_KEYS.map(k => [k, ''])))
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    async function load() {
      const { data: row } = await supabase
        .from('priorities').select('data')
        .eq('user_id', session.user.id).maybeSingle()
      if (row?.data) setData(prev => ({ ...EMPTY_DATA, ...prev, ...row.data }))
    }
    load()
  }, [session.user.id])

  async function persist(newData) {
    setSaving(true)
    await supabase.from('priorities').upsert(
      { user_id: session.user.id, data: newData, updated_at: new Date().toISOString() },
      { onConflict: 'user_id' }
    )
    setSaving(false)
  }

  function addItem(key) {
    const text = drafts[key].trim()
    if (!text) return
    const newData = { ...data, [key]: [...(data[key] || []), { id: genId(), text }] }
    setData(newData)
    setDrafts(d => ({ ...d, [key]: '' }))
    persist(newData)
  }

  function removeItem(key, id) {
    const newData = { ...data, [key]: data[key].filter(i => i.id !== id) }
    setData(newData)
    persist(newData)
  }

  function editItem(key, id, text) {
    const newData = { ...data, [key]: data[key].map(i => i.id === id ? { ...i, text } : i) }
    setData(newData)
    persist(newData)
  }

  function reorderItem(key, id, direction) {
    const items = [...(data[key] || [])]
    const idx = items.findIndex(i => i.id === id)
    const newIdx = idx + direction
    if (newIdx < 0 || newIdx >= items.length) return
    const tmp = items[idx]; items[idx] = items[newIdx]; items[newIdx] = tmp
    const newData = { ...data, [key]: items }
    setData(newData)
    persist(newData)
  }

  function moveToLevel(fromKey, id, toKey) {
    const item = data[fromKey]?.find(i => i.id === id)
    if (!item) return
    const newData = {
      ...data,
      [fromKey]: data[fromKey].filter(i => i.id !== id),
      [toKey]:   [...(data[toKey] || []), item],
    }
    setData(newData)
    persist(newData)
  }

  function renderSection({ key, label, color, bg, border }, isPriority = false) {
    const items = data[key] || []
    return (
      <div key={key} style={{ background: '#111120', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 16, padding: 16, marginBottom: 12 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: items.length ? 12 : 8 }}>
          <div style={{ width: 24, height: 24, borderRadius: 8, background: bg, border: `1px solid ${border}`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            {isPriority
              ? <span style={{ fontSize: '0.7rem', fontWeight: 800, color }}>{key}</span>
              : <span style={{ width: 8, height: 8, borderRadius: '50%', background: color, display: 'inline-block' }} />
            }
          </div>
          <span style={{ fontSize: '0.8rem', fontWeight: 700, color: '#f1f5f9' }}>{label}</span>
          {items.length > 0 && <span style={{ marginLeft: 'auto', fontSize: '0.68rem', color: '#475569', fontWeight: 600 }}>{items.length}</span>}
        </div>

        {items.map((item, idx) => (
          <BulletItem
            key={item.id}
            item={item}
            color={color}
            isFirst={idx === 0}
            isLast={idx === items.length - 1}
            currentKey={key}
            isPriority={isPriority}
            onRemove={() => removeItem(key, item.id)}
            onEdit={text => editItem(key, item.id, text)}
            onMoveUp={() => reorderItem(key, item.id, -1)}
            onMoveDown={() => reorderItem(key, item.id, 1)}
            onMoveTo={toKey => moveToLevel(key, item.id, toKey)}
          />
        ))}

        <div style={{ display: 'flex', gap: 8, marginTop: items.length ? 8 : 0 }}>
          <input
            value={drafts[key]}
            onChange={e => setDrafts(d => ({ ...d, [key]: e.target.value }))}
            onKeyDown={e => { if (e.key === 'Enter') addItem(key) }}
            placeholder="Add bullet…"
            style={inputStyle}
          />
          <button
            onClick={() => addItem(key)}
            disabled={!drafts[key].trim()}
            style={{
              background: drafts[key].trim() ? bg : 'rgba(255,255,255,0.04)',
              border: `1px solid ${drafts[key].trim() ? border : 'rgba(255,255,255,0.07)'}`,
              borderRadius: 8, color: drafts[key].trim() ? color : '#475569',
              fontFamily: 'inherit', fontSize: '0.875rem', fontWeight: 700,
              padding: '8px 14px', cursor: drafts[key].trim() ? 'pointer' : 'default',
              transition: 'all 0.15s', flexShrink: 0,
            }}
          >Add</button>
        </div>
      </div>
    )
  }

  return (
    <div style={{ maxWidth: 640, margin: '0 auto', padding: '0 16px' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '20px 0 16px' }}>
        <div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 800, letterSpacing: '-0.03em' }}>Priorities</h1>
          <p style={{ fontSize: '0.8rem', color: '#94a3b8', marginTop: 2 }}>What matters right now</p>
        </div>
        {saving && <span style={{ fontSize: '0.73rem', color: '#64748b' }}>Saving…</span>}
      </div>

      {LEVELS.map(s => renderSection(s, true))}

      <div style={{ height: 1, background: 'rgba(255,255,255,0.06)', margin: '4px 0 16px' }} />

      {EXTRA_SECTIONS.map(s => renderSection(s, false))}

      <div style={{ height: 24 }} />
    </div>
  )
}

function BulletItem({ item, color, isFirst, isLast, currentKey, isPriority, onRemove, onEdit, onMoveUp, onMoveDown, onMoveTo }) {
  const [editing,    setEditing]    = useState(false)
  const [val,        setVal]        = useState(item.text)
  const [confirming, setConfirming] = useState(false)
  const [showMove,   setShowMove]   = useState(false)
  const confirmTimer = useRef(null)

  function save() {
    const t = val.trim()
    if (t && t !== item.text) onEdit(t)
    else setVal(item.text)
    setEditing(false)
  }

  function askDelete() {
    setConfirming(true)
    clearTimeout(confirmTimer.current)
    confirmTimer.current = setTimeout(() => setConfirming(false), 4000)
  }

  function confirmDelete() {
    clearTimeout(confirmTimer.current)
    onRemove()
  }

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '5px 0', borderBottom: '1px solid rgba(255,255,255,0.04)' }}>

      {/* Reorder arrows — left side */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 1, flexShrink: 0 }}>
        <SmallBtn onClick={onMoveUp} disabled={isFirst} label="↑" />
        <SmallBtn onClick={onMoveDown} disabled={isLast} label="↓" />
      </div>

      {/* Bullet dot */}
      <span style={{ width: 6, height: 6, borderRadius: '50%', background: color, flexShrink: 0 }} />

      {/* Text */}
      {editing ? (
        <input
          autoFocus
          value={val}
          onChange={e => setVal(e.target.value)}
          onBlur={save}
          onKeyDown={e => { if (e.key === 'Enter') save(); if (e.key === 'Escape') { setVal(item.text); setEditing(false) } }}
          style={{ flex: 1, background: 'transparent', border: 'none', borderBottom: `1px solid ${color}`, color: '#f1f5f9', fontFamily: 'inherit', fontSize: '16px', padding: '2px 0', outline: 'none' }}
        />
      ) : (
        <span onDoubleClick={() => setEditing(true)} style={{ flex: 1, fontSize: '0.875rem', color: '#cbd5e1', cursor: 'text', wordBreak: 'break-word', lineHeight: 1.4 }}>
          {item.text}
        </span>
      )}

      {/* Move to level — only for priority sections */}
      {isPriority && (
        <div style={{ position: 'relative', flexShrink: 0 }}>
          <SmallBtn onClick={() => setShowMove(s => !s)} label="→" title="Move to level" />
          {showMove && (
            <div style={{ position: 'absolute', right: 0, bottom: '100%', marginBottom: 4, background: '#1e1e35', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 10, padding: 6, display: 'flex', gap: 4, zIndex: 10 }}>
              {LEVELS.filter(l => l.key !== currentKey).map(l => (
                <button key={l.key} onClick={() => { onMoveTo(l.key); setShowMove(false) }}
                  style={{ width: 24, height: 24, borderRadius: 6, border: `1px solid ${l.border}`, background: l.bg, color: l.color, fontFamily: 'inherit', fontSize: '0.7rem', fontWeight: 800, cursor: 'pointer' }}>
                  {l.key}
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Delete — with inline confirmation */}
      {confirming ? (
        <div style={{ display: 'flex', gap: 3, flexShrink: 0 }}>
          <button onClick={confirmDelete} style={{ padding: '2px 7px', borderRadius: 5, border: '1px solid rgba(239,68,68,0.4)', background: 'rgba(239,68,68,0.15)', color: '#ef4444', fontFamily: 'inherit', fontSize: '0.72rem', fontWeight: 700, cursor: 'pointer' }}>Yes</button>
          <button onClick={() => setConfirming(false)} style={{ padding: '2px 7px', borderRadius: 5, border: '1px solid rgba(255,255,255,0.08)', background: 'rgba(255,255,255,0.05)', color: '#64748b', fontFamily: 'inherit', fontSize: '0.72rem', fontWeight: 700, cursor: 'pointer' }}>No</button>
        </div>
      ) : (
        <SmallBtn onClick={askDelete} label="×" danger />
      )}
    </div>
  )
}

function SmallBtn({ onClick, label, danger, disabled, title }) {
  return (
    <button
      onClick={onClick}
      title={title}
      disabled={disabled}
      style={{
        width: 20, height: 20, borderRadius: 4, border: 'none',
        background: disabled ? 'transparent' : danger ? 'rgba(239,68,68,0.12)' : 'rgba(255,255,255,0.05)',
        color: disabled ? 'transparent' : danger ? '#ef4444' : '#64748b',
        fontFamily: 'inherit', fontSize: '0.72rem', fontWeight: 700,
        cursor: disabled ? 'default' : 'pointer',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        flexShrink: 0,
      }}
    >{label}</button>
  )
}
