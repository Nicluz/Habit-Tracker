import { useState, useEffect, createContext, useContext, useCallback } from 'react'
import { supabase } from './lib/supabase'
import { loadSettings, saveSettings } from './lib/settings'
import LoginView    from './views/LoginView'
import InputView    from './views/InputView'
import StatsView    from './views/StatsView'
import TrainingView from './views/TrainingView'
import SettingsView from './views/SettingsView'
import BottomNav    from './components/BottomNav'
import Toast        from './components/Toast'

/* ─── App-level context ──────────────────────────────── */
export const AppCtx = createContext(null)
export const useApp = () => useContext(AppCtx)

/* ─── Toast helper (global) ─────────────────────────── */
let _addToast = null
export function toast(msg, type = 'success') {
  _addToast?.(msg, type)
}

export default function App() {
  const [session,          setSession]          = useState(undefined)  // undefined = loading
  const [activeView,       setActiveView]        = useState('input')
  const [toasts,           setToasts]            = useState([])
  const [customActivities, setCustomActivities]  = useState([])
  const [settings,         setSettings]          = useState(loadSettings)

  function updateSettings(patch) {
    setSettings(prev => {
      const next = { ...prev, ...patch }
      saveSettings(next)
      return next
    })
  }

  /* ── Auth init ── */
  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => setSession(data.session ?? null))
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_, s) => {
      setSession(s ?? null)
    })
    return () => subscription.unsubscribe()
  }, [])

  /* ── Load custom activities once logged in ── */
  useEffect(() => {
    if (!session) return
    loadCustomActivities()
  }, [session])

  async function loadCustomActivities() {
    const { data } = await supabase
      .from('custom_activities')
      .select('id, name')
      .order('created_at')
    if (data) setCustomActivities(data)
  }

  async function addCustomActivity(name) {
    const trimmed = name.trim()
    if (!trimmed) return
    const { data, error } = await supabase
      .from('custom_activities')
      .insert({ name: trimmed, user_id: session.user.id })
      .select()
      .single()
    if (!error && data) {
      setCustomActivities(prev => [...prev, data])
      toast(`"${trimmed}" added`)
    }
  }

  async function deleteCustomActivity(id) {
    await supabase.from('custom_activities').delete().eq('id', id)
    setCustomActivities(prev => prev.filter(a => a.id !== id))
    toast('Activity removed', 'info')
  }

  /* ── Toast system ── */
  const addToast = useCallback((msg, type = 'success') => {
    const id = Date.now()
    setToasts(prev => [...prev, { id, msg, type }])
    setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 3000)
  }, [])

  useEffect(() => { _addToast = addToast }, [addToast])

  /* ── Loading ── */
  if (session === undefined) {
    return (
      <div className="fixed inset-0 flex items-center justify-center" style={{ background: '#09090f' }}>
        <div className="w-10 h-10 border-3 border-[#7c3aed]/30 border-t-[#7c3aed] rounded-full spin" />
      </div>
    )
  }

  /* ── Unauthenticated ── */
  if (!session) return <LoginView />

  /* ── Authenticated app ── */
  const views = { input: InputView, stats: StatsView, training: TrainingView, settings: SettingsView }
  const View = views[activeView] || InputView

  return (
    <AppCtx.Provider value={{ session, customActivities, addCustomActivity, deleteCustomActivity, setActiveView, settings, updateSettings }}>
      <div style={{ background: '#09090f', minHeight: '100vh', paddingBottom: 'calc(72px + env(safe-area-inset-bottom, 0px))' }}>
        <View />
        <BottomNav active={activeView} onChange={setActiveView} />
        <Toast toasts={toasts} />
      </div>
    </AppCtx.Provider>
  )
}
