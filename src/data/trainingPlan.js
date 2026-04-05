export const MORNING_ROUTINE = {
  name: 'Daily Morning Routine',
  duration: '~18–20 min',
  blocks: [
    {
      id: 'b1',
      name: 'Block 1 – Push-Ups, Plank & L-Sit',
      duration: '8 min',
      exercises: [
        { name: 'Push-Up Variation (Rotation)', sets: 3, reps: 'max', note: 'See rotation table below' },
        { name: 'Plank', sets: 2, reps: '60 sec', note: 'Neutral spine, maintain tension' },
        { name: 'L-Sit Hold (Dip Bars / Floor)', sets: 3, reps: 'max sec', note: 'Core / Calisthenics Skill' },
      ],
    },
    {
      id: 'b2',
      name: 'Block 2 – Rehab & Activation',
      duration: '5 min',
      exercises: [
        { name: 'Glute Bridge', sets: 3, reps: '15', note: 'Glutes / hip stability' },
        { name: 'Side-Lying Leg Raise', sets: 3, reps: '15 each side', note: 'Hip abductors / Shin Splints' },
        { name: 'Toe Raises', sets: 2, reps: '20', note: 'Tibialis / Shin Splints' },
      ],
    },
    {
      id: 'b3',
      name: 'Block 3 – Handstand Progression',
      duration: '5 min',
      exercises: [
        { name: 'Wall Handstand Hold', sets: 2, reps: '30–45 sec', note: 'Stable wall contact, body tension' },
        { name: 'Negative HSPU at Wall', sets: 3, reps: '3–5', note: '5 sec descent, rest at bottom then climb back up' },
      ],
    },
    {
      id: 'b4',
      name: 'Block 4 – Stretching',
      duration: '10 min',
      exercises: [
        { name: "World's Greatest Stretch", sets: 1, reps: '5 each side', note: 'Full body mobility' },
        { name: 'Soleus Stretch (knee bent, wall)', sets: 1, reps: '60 sec each', note: 'Deep calf / Shin Splints' },
        { name: '90/90 Hip Stretch', sets: 1, reps: '60 sec each', note: 'Hip rotation / Padel' },
        { name: 'Gluteus Stretch (Figure-4, lying)', sets: 1, reps: '60 sec each', note: 'Glutes / hips' },
      ],
    },
  ],
  optional: [
    { name: 'Dead Bug', sets: 2, reps: '10 each', note: 'Deep core' },
    { name: 'Dragon Flag', sets: 2, reps: '3–5', note: 'Full anterior chain' },
    { name: 'Pistol Squat', sets: 2, reps: '5 each', note: 'Unilateral / Padel' },
    { name: 'Burpee', sets: 2, reps: '10', note: 'Full body conditioning' },
  ],
}

export const PUSHUP_ROTATION = [
  { week: 1, variation: 'Standard Push-Up',           focus: 'Base, chest mass' },
  { week: 2, variation: 'Wide Grip Push-Up',          focus: 'Outer chest, shoulder' },
  { week: 3, variation: 'Diamond Push-Up',            focus: 'Triceps, inner chest' },
  { week: 4, variation: 'Archer Push-Up',             focus: 'Unilateral, calisthenics base' },
  { week: 5, variation: 'Decline Push-Up',            focus: 'Upper chest, shoulder' },
  { week: 6, variation: 'Pseudo Planche Push-Up',     focus: 'Wrist + HSPU prep' },
  { week: 7, variation: 'Explosive / Clap Push-Up',   focus: 'Explosive power → Padel' },
  { week: 8, variation: 'Pike Push-Up',               focus: 'Shoulder, direct HSPU precursor' },
]

const LEGS = {
  name: 'Legs',
  subtitle: 'Strength + Padel + Physio',
  emoji: '🦵',
  type: 'gym',
  duration: '60–75 min',
  exercises: [
    { name: 'Box Jump',               sets: 4, reps: '5',       alt: 'Lateral Bound',             focus: 'Explosive' },
    { name: 'Squat',                  sets: 4, reps: '5',       alt: 'Bulgarian Split Squat',     focus: 'Strength' },
    { name: 'Nordic Curl / Leg Curl', sets: 3, reps: '8',       alt: '–',                         focus: 'Hamstrings' },
    { name: 'Romanian Deadlift',      sets: 3, reps: '10',      alt: 'Glute Ham Raise',           focus: 'Physio' },
    { name: 'Lateral Lunge',          sets: 3, reps: '10 each', alt: 'Pistol Squat Progression', focus: 'Padel' },
    { name: 'Lateral Band Walk',      sets: 3, reps: '12',      alt: 'Sumo Squat',                focus: 'Padel' },
    { name: 'Side-Lying Leg Raise',   sets: 3, reps: '15',      alt: '–',                         focus: 'Physio' },
    { name: 'Tibialis Raise',         sets: 3, reps: '20',      alt: '–',                         focus: 'Shin Splints' },
    { name: 'Calf Raises',            sets: 3, reps: '15',      alt: 'Single Leg Calf Raise',     focus: 'Physio' },
  ],
}

export const WEEKLY_PLAN = {
  monday: {
    key: 'monday',
    name: 'Upper Body A',
    subtitle: 'Push + Calisthenics Skill',
    emoji: '💪',
    type: 'gym',
    duration: '60–75 min',
    exercises: [
      { name: 'Muscle-Up Progression', sets: 4, reps: '3–5',  alt: 'Jumping → Banded → Kipping', focus: 'Skill' },
      { name: 'Weighted Dips',         sets: 4, reps: '4–6',  alt: 'Ring Dips',                  focus: 'Strength' },
      { name: 'Bench Press',           sets: 4, reps: '6–8',  alt: 'Dumbbell Press',             focus: 'Hypertrophy' },
      { name: 'Incline Dumbbell Press',sets: 3, reps: '10',   alt: 'Cable Fly',                  focus: 'Isolation' },
      { name: 'Face Pulls',            sets: 3, reps: '15',   alt: '–',                          focus: 'Shoulder' },
    ],
  },
  tuesday: { ...LEGS, key: 'tuesday' },
  wednesday: {
    key: 'wednesday',
    name: 'Rest Day',
    subtitle: 'Recovery',
    emoji: '😴',
    type: 'rest',
    duration: null,
    exercises: [],
  },
  thursday: {
    key: 'thursday',
    name: 'Upper Body B',
    subtitle: 'Pull + Calisthenics Skill',
    emoji: '💪',
    type: 'gym',
    duration: '60–75 min',
    exercises: [
      { name: 'Weighted Pull-Up',       sets: 4, reps: '4–6',      alt: 'Typewriter Pull-Up', focus: 'Strength' },
      { name: 'Overhead Press',         sets: 4, reps: '6–8',      alt: 'Arnold Press',       focus: 'Shoulder' },
      { name: 'Chest-Supported Row',    sets: 3, reps: '10',       alt: 'Cable Row',          focus: 'Back' },
      { name: 'Tricep Pushdown',        sets: 3, reps: '12',       alt: 'Skull Crusher',      focus: 'Isolation' },
      { name: 'Hollow Body Hold',       sets: 3, reps: '30–45 sec',alt: '–',                  focus: 'Core' },
      { name: 'Scapular Pull-Up',       sets: 3, reps: '10',       alt: '–',                  focus: 'Skill prep' },
    ],
  },
  friday: { ...LEGS, key: 'friday' },
  saturday: {
    key: 'saturday',
    name: 'Rest / Padel',
    subtitle: 'Optional: Block 1 + Stretching only',
    emoji: '🎾',
    type: 'rest',
    duration: null,
    exercises: [],
  },
  sunday: {
    key: 'sunday',
    name: 'Rest Day',
    subtitle: 'Stretching only',
    emoji: '🧘',
    type: 'rest',
    duration: null,
    exercises: [],
  },
}

export const PROGRESSION = [
  { phase: 'Weeks 1–4',         desc: 'Solidify technique, moderate weights. Movement quality before load.' },
  { phase: 'Week 5+',           desc: 'Progressive Overload (+2.5 kg when all reps are clean).' },
  { phase: 'Calisthenics',      desc: 'Advance one progression level per month (Muscle-Up, HSPU, Pistol Squat).' },
  { phase: 'Deload',            desc: 'Every 8 weeks: deload week (50% volume, same weight).' },
  { phase: 'Shin Splints',      desc: 'Tibialis Raise + Calf/Soleus Stretch daily — never skip these exercises.' },
]

export const DAY_KEYS = ['monday','tuesday','wednesday','thursday','friday','saturday','sunday']
export const DAY_LABELS = ['Mon','Tue','Wed','Thu','Fri','Sat','Sun']

/** Returns the weekday key for a given date string "YYYY-MM-DD" */
export function getDayKey(dateStr) {
  const d = new Date(dateStr + 'T12:00:00')
  return DAY_KEYS[d.getDay() === 0 ? 6 : d.getDay() - 1]
}

/** Returns week number within year (ISO-ish, 1-based) */
export function getWeekNumber(dateStr) {
  const d = new Date(dateStr + 'T12:00:00')
  const start = new Date(d.getFullYear(), 0, 1)
  return Math.ceil(((d - start) / 86400000 + start.getDay() + 1) / 7)
}
