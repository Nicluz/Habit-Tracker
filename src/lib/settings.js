const KEY = 'habitSettings'

export const DEFAULTS = {
  /* Goals */
  pushup_goal:     100,
  sleep_goal_h:    7,   sleep_goal_m:   30,
  screen_limit_h:  3,   screen_limit_m: 0,
  social_limit_h:  1,   social_limit_m: 0,
  /* Today tab visibility */
  show_alcohol:    true,
  show_reading:    true,
  show_stretching: true,
  /* Push-up counter */
  pushup_step: 10,
  pushup_max:  300,
  /* Mesocycle tracking */
  mesocycle_start: '',  // YYYY-MM-DD of Week 1 Day 1
}

/** Returns current mesocycle week number (1–4) or null if no start set */
export function getMesocycleWeek(startDate) {
  if (!startDate) return null
  const start = new Date(startDate + 'T12:00:00')
  const today = new Date()
  const diffDays = Math.floor((today - start) / 86400000)
  if (diffDays < 0) return null
  return ((Math.floor(diffDays / 7)) % 4) + 1
}

export function loadSettings() {
  try {
    const raw = localStorage.getItem(KEY)
    return raw ? { ...DEFAULTS, ...JSON.parse(raw) } : { ...DEFAULTS }
  } catch {
    return { ...DEFAULTS }
  }
}

export function saveSettings(s) {
  localStorage.setItem(KEY, JSON.stringify(s))
}
