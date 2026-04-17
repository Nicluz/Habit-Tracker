import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { useApp, toast } from '../App'

const LEVELS = [
  { level: 1, label: 'Today',           color: '#ef4444', bg: 'rgba(239,68,68,0.12)',    border: 'rgba(239,68,68,0.25)'    },
  { level: 2, label: 'Within Few Days', color: '#f97316', bg: 'rgba(249,115,22,0.12)',   border: 'rgba(249,115,22,0.25)'   },
  { level: 3, label: 'Within a Week',   color: '#f59e0b', bg: 'rgba(245,158,11,0.12)',   border: 'rgba(245,158,11,0.25)'   },
  { level: 4, label: 'When Time',       color: '#3b82f6', bg: 'rgba(59,130,246,0.12)',   border: 'rgba(59,130,246,0.25)'   },
  { level: 5, label: 'Keep in Mind',    color: '#94a3b8', bg: 'rgba(148,163,184,0.08)',  border: 'rgba(148,163,184,0.15)'  },
]

function genId() { return Math.random().toString(36).slice(2) }

export default function PrioritiesView() {
  const { session } = useApp()
  const [data, setData]     = useState({ 1: [], 2: [], 3: [], 4: [], 5: [] })
  const [drafts, setDrafts] = useState({ 1: '', 2: '', 3: '', 4: '', 5: '' })
  const [saving, setSaving] = useState(false)

  /* ── Load ── */
  useEffect(() => {
    async function load() {
      const { data: row } = await supabase
        .from('priorities')
        .select('data')
        .eq('user_id', session.user.id)
        .maybeSingle()
      if (row?.data) {
        setData(prev => ({ ...prev, ...row.data }))
      }
    }
    load()
  }, [session.user.id])

  /* ── Save to Supabase ── */
  async function persist(newData) {
    setSaving(true)
    await supabase.from('priorities').upsert(
      { user_id: session.user.id, data: newData, updated_at: new Date().toISOString() },
      { onConflict: 'user_id' }
    )
    setSaving(false)
  }

  function addItem(level) {
    const text = drafts[level].trim()
    if (!text) return
    const newData = { ...data, [level]: [...(data[level] || []), { id: genId(), text }] }
    setData(newData)
    setDrafts(d => ({ ...d, [level]: '' }))
    persist(newData)
  }

  function removeItem(level, id) {
    const newData = { ...data, [level]: data[level].filter(i => i.id !== id) }
    setData(newData)
    persist(newData)
  }

  function editItem(level, id, text) {
    const newData = { ...data, [level]: data[level].map(i => i.id === id ? { ...i, text } : i) }
    setData(newData)
    persist(newData)
  }

  function moveItem(level, id, direction) {
    const items = [...(data[level] || [])]
    const idx = items.findIndex(i => i.id === id)
    if (idx < 0) return
    const newIdx = idx + direction
    if (newIdx < 0 || newIdx >= items.length) return
    const tmp = items[idx]; items[idx] = items[newIdx]; items[newIdx] = tmp
    const newData = { ...data, [level]: items }
    setData(newData)
    persist(newData)
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

      {LEVELS.map(({ level, label, color, bg, border }) => {
        const items = data[level] || []
        return (
          <div key={level} style={{ background: '#111120', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 16, padding: 16, marginBottom: 12 }}>
            {/* Header */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: items.length ? 12 : 0 }}>
              <div style={{ width: 24, height: 24, borderRadius: 8, background: bg, border: `1px solid ${border}`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <span style={{ fontSize: '0.7rem', fontWeight: 800, color }}>{level}</span>
              </div>
              <span style={{ fontSize: '0.8rem', fontWeight: 700, color: '#f1f5f9' }}>{label}</span>
              {items.length > 0 && (
                <span style={{ marginLeft: 'auto', fontSize: '0.68rem', color: '#475569', fontWeight: 600 }}>{items.length}</span>
              )}
            </div>

            {/* Items */}
            {items.map((item, idx) => (
              <BulletItem
                key={item.id}
                item={item}
                color={color}
                isFirst={idx === 0}
                isLast={idx === items.length - 1}
                onRemove={() => removeItem(level, item.id)}
                onEdit={text => editItem(level, item.id, text)}
                onMoveUp={() => moveItem(level, item.id, -1)}
                onMoveDown={() => moveItem(level, item.id, 1)}
              />
            ))}

            {/* Add input */}
            <div style={{ display: 'flex', gap: 8, marginTop: items.length ? 8 : 12 }}>
              <input
                value={drafts[level]}
                onChange={e => setDrafts(d => ({ ...d, [level]: e.target.value }))}
                onKeyDown={e => { if (e.key === 'Enter') addItem(level) }}
                placeholder="Add bullet…"
                style={{
                  flex: 1, background: '#191928', border: '1px solid rgba(255,255,255,0.07)',
                  borderRadius: 8, color: '#f1f5f9', fontFamily: 'inherit', fontSize: '0.875rem',
                  padding: '8px 12px', outline: 'none',
                }}
              />
              <button
                onClick={() => addItem(level)}
                disabled={!drafts[level].trim()}
                style={{
                  background: drafts[level].trim() ? bg : 'rgba(255,255,255,0.04)',
                  border: `1px solid ${drafts[level].trim() ? border : 'rgba(255,255,255,0.07)'}`,
                  borderRadius: 8, color: drafts[level].trim() ? color : '#475569',
                  fontFamily: 'inherit', fontSize: '0.875rem', fontWeight: 700,
                  padding: '8px 14px', cursor: drafts[level].trim() ? 'pointer' : 'default',
                  transition: 'all 0.15s',
                }}
              >Add</button>
            </div>
          </div>
        )
      })}
    </div>
  )
}

function BulletItem({ item, color, isFirst, isLast, onRemove, onEdit, onMoveUp, onMoveDown }) {
  const [editing, setEditing] = useState(false)
  const [val, setVal]         = useState(item.text)

  function save() {
    const t = val.trim()
    if (t && t !== item.text) onEdit(t)
    else setVal(item.text)
    setEditing(false)
  }

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '6px 0', borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
      <span style={{ width: 6, height: 6, borderRadius: '50%', background: color, flexShrink: 0 }} />
      {editing ? (
        <input
          autoFocus
          value={val}
          onChange={e => setVal(e.target.value)}
          onBlur={save}
          onKeyDown={e => { if (e.key === 'Enter') save(); if (e.key === 'Escape') { setVal(item.text); setEditing(false) } }}
          style={{ flex: 1, background: 'transparent', border: 'none', borderBottom: `1px solid ${color}`, color: '#f1f5f9', fontFamily: 'inherit', fontSize: '0.875rem', padding: '2px 0', outline: 'none' }}
        />
      ) : (
        <span onDoubleClick={() => setEditing(true)} style={{ flex: 1, fontSize: '0.875rem', color: '#cbd5e1', cursor: 'text', wordBreak: 'break-word' }}>{item.text}</span>
      )}
      <div style={{ display: 'flex', gap: 2, flexShrink: 0 }}>
        {!isFirst && <NavBtn onClick={onMoveUp} label="↑" />}
        {!isLast  && <NavBtn onClick={onMoveDown} label="↓" />}
        <NavBtn onClick={onRemove} label="×" danger />
      </div>
    </div>
  )
}

function NavBtn({ onClick, label, danger }) {
  return (
    <button onClick={onClick} style={{
      width: 22, height: 22, borderRadius: 5, border: 'none',
      background: danger ? 'rgba(239,68,68,0.12)' : 'rgba(255,255,255,0.05)',
      color: danger ? '#ef4444' : '#64748b',
      fontFamily: 'inherit', fontSize: '0.8rem', fontWeight: 700,
      cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
    }}>{label}</button>
  )
}
