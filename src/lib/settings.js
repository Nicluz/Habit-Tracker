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
