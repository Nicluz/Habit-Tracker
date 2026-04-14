/* ─── Daily Morning Routine (kept, updated) ───────── */
export const MORNING_ROUTINE = {
  name: 'Daily Morning Routine',
  duration: '~18–20 min',
  blocks: [
    {
      id: 'b1',
      name: 'Block 1 – Push-Ups & Plank',
      duration: '5 min',
      exercises: [
        {
          name: 'Push-Up Variation',
          sets: 3, reps: 'max',
          note: 'Pick one variation per day and rotate',
          examples: [
            'Standard Push-Up — base, chest mass',
            'Wide Grip Push-Up — outer chest, shoulder',
            'Diamond Push-Up — triceps, inner chest',
            'Archer Push-Up — unilateral, calisthenics base',
            'Decline Push-Up — upper chest, shoulder',
            'Pseudo Planche Push-Up — wrist + HSPU prep',
            'Explosive / Clap Push-Up — explosive power → Padel',
            'Pike Push-Up — shoulder, direct HSPU precursor',
          ],
        },
        {
          name: 'Plank',
          sets: 2, reps: '60 sec',
          note: 'Neutral spine, maintain tension',
          examples: [
            'Standard Plank — forearms, full body tension',
            'RKC Plank — squeeze glutes + fists, max tension',
            'Side Plank — lateral core, hip abductors',
            'Plank to Push-Up — dynamic, shoulder stability',
          ],
        },
      ],
    },
    {
      id: 'b2',
      name: 'Block 2 – Rehab & Activation',
      duration: '5 min',
      exercises: [
        { name: 'Glute Bridge',          sets: 3, reps: '15',         note: 'Glutes / hip stability' },
        { name: 'Side-Lying Leg Raise',  sets: 3, reps: '15 each',   note: 'Hip abductors / shin splints' },
        { name: 'Toe Raises (Tibialis)', sets: 2, reps: '20',         note: 'Tibialis anterior / shin splints — heels on wall, lift toes max' },
      ],
    },
    {
      id: 'b3',
      name: 'Block 3 – Stretching',
      duration: '10 min',
      exercises: [
        { name: "World's Greatest Stretch",   sets: 1, reps: '5 each side', note: 'Full body mobility — lunge + thoracic rotation + reach' },
        { name: 'Soleus Stretch (knee bent)', sets: 1, reps: '60 sec each', note: 'Deep calf / shin splints — knee bent, heel on floor, lean into wall' },
        { name: '90/90 Hip Stretch',          sets: 1, reps: '60 sec each', note: 'Hip internal + external rotation / Padel' },
        { name: 'Gluteus Stretch (Figure-4)', sets: 1, reps: '60 sec each', note: 'Lying figure-4 — glutes / hips / lower back' },
      ],
    },
    {
      id: 'b4',
      name: 'Block 4 – Meditation',
      duration: '5 min',
      exercises: [
        { name: 'Seated Meditation', sets: 1, reps: '5 min', note: 'Quiet seated position, focus on breath' },
      ],
    },
  ],
  optional: [
    { name: 'Dead Bug',      sets: 2, reps: '10 each', note: 'Deep core, anti-extension' },
    { name: 'Dragon Flag',   sets: 2, reps: '3–5',     note: 'Full anterior chain' },
    { name: 'Pistol Squat',  sets: 2, reps: '5 each',  note: 'Unilateral / Padel' },
    { name: 'Burpee',        sets: 2, reps: '10',       note: 'Full body conditioning' },
  ],
}

/* ─── 5 Sessions (user picks freely each day) ─────── */
export const SESSIONS = {
  upper_a: {
    id: 'upper_a',
    name: 'Session 1 — Upper A',
    subtitle: 'Push + Horizontal Calisthenics',
    duration: '65–70 min',
    warmup: 'Band pull-aparts — 2×20 · Face pulls (band) — 2×15 · Arm circles + thoracic rotation — 2 min',
    exercises: [
      { name: 'Barbell Bench Press',     category: 'Strength',     sets: '3/4/4-5/3', reps: 'W1:8-10  W2:6-8  W3:4-6  W4:10',         rest: '2.5–3 min', note: 'Full ROM, 2s descent. Start ~45-50 kg.',           alt: 'DB Bench Press'    },
      { name: 'Weighted Dips',           category: 'Calisthenics', sets: '3/4/4-5/3', reps: 'W1:8  W2:6-8  W3:5-6  W4:8',             rest: '2 min',     note: 'Start +10 kg. Lean fwd=chest; upright=triceps.',   alt: 'Ring Dips'         },
      { name: 'Incline DB Press',        category: 'Strength',     sets: '3',         reps: 'W1:10-12  W2:10-12  W3:8-10  W4:12-15',   rest: '90s',       note: '30-45 deg. Control the eccentric.',                alt: 'Cable Fly'         },
      { name: 'DB Shoulder Press',       category: 'Strength',     sets: '3',         reps: 'W1:10-12  W2:10-12  W3:8-10  W4:12',      rest: '90s',       note: 'No flaring; controlled descent.',                  alt: 'Arnold Press'      },
      { name: 'Cable Lateral Raise [SS]',category: 'Strength',     sets: '3',         reps: 'W1:12-15  W2:12-15  W3:12  W4:15',        rest: '60s',       note: 'Superset with Face Pulls.',                        alt: 'DB Lateral Raise'  },
      { name: 'Face Pulls (cable) [SS]', category: 'Strength',     sets: '3',         reps: 'W1:15-20  W2:15-20  W3:15  W4:20',        rest: '60s',       note: 'External rotation at end. Shoulder health.',       alt: 'Band Face Pulls'   },
      { name: 'Cable Wood Chop',         category: 'Padel',        sets: '3',         reps: 'W1:12/s  W2:12/s  W3:10/s  W4:12/s',     rest: '60s',       note: 'High-to-low. Mimics smash drive. Full hip rotation.',alt: 'Band Wood Chop'   },
      { name: 'Tricep OH Extension',     category: 'Strength',     sets: '3',         reps: 'W1:12-15  W2:12-15  W3:10-12  W4:15',    rest: '60s',       note: 'Cable or EZ-bar. Long head stretch.',              alt: 'Skull Crushers'    },
    ],
  },
  lower_a: {
    id: 'lower_a',
    name: 'Session 2 — Lower A',
    subtitle: 'Quad Dominant + Physio',
    duration: '65–70 min',
    warmup: 'Hip circles — 10 each direction · Leg swings (front/back + lateral) — 10 each · Glute bridges — 2×15 · Side-lying leg raise — 2×15/side',
    exercises: [
      { name: 'Back Squat',             category: 'Strength', sets: '3/4/4-5/3', reps: 'W1:8-10  W2:6-8  W3:5-6  W4:10',        rest: '3 min',  note: 'Start 60 kg. Prioritize depth.',                         alt: 'Safety Bar / Goblet Squat' },
      { name: 'Bulgarian Split Squat',  category: 'Strength', sets: '3',         reps: 'W1:10/L  W2:8/L  W3:6/L  W4:10/L',      rest: '90s',    note: 'DB or barbell. Unilateral stability.',                   alt: 'Reverse Lunge'             },
      { name: 'Romanian Deadlift',      category: 'Strength', sets: '3',         reps: 'W1:10-12  W2:10  W3:8  W4:12',           rest: '2 min',  note: 'Start 50-60 kg. Hip hinge, neutral spine.',              alt: 'Single-Leg RDL'            },
      { name: 'Leg Curl (machine)',     category: 'Strength', sets: '3',         reps: 'W1:12-15  W2:12  W3:10-12  W4:15',       rest: '90s',    note: 'Slow eccentric (3s).',                                   alt: 'Nordic Curl'               },
      { name: 'Pistol Squat',           category: 'Physio',   sets: '3',         reps: 'W1:5-8/L  W2:5-8/L  W3:6-8/L  W4:8/L', rest: '90s',    note: 'TRX/pole-assisted → unassisted.',                        alt: 'Assisted Pistol'           },
      { name: 'Single-Leg Calf Raise',  category: 'Physio',   sets: '3',         reps: 'W1:15-20  W2:15-20  W3:15  W4:20',       rest: '60s',    note: 'Tempo 2-2-3. Shin splint prevention.',                   alt: 'Seated Calf Raise'         },
      { name: 'Tibialis Raise (wall)',  category: 'Physio',   sets: '3',         reps: 'W1:15-20  W2:15-20  W3:20  W4:20',       rest: '45s',    note: 'Heels on wall, lift toes max. Add band to progress.',    alt: 'Tibialis machine'          },
      { name: 'Side-Lying Leg Raise',   category: 'Physio',   sets: '2',         reps: '15/s all weeks',                          rest: '45s',    note: 'No hip rotation. Add ankle weight at 3×20.',             alt: 'Cable Hip Abduction'       },
      { name: 'Pallof Press',           category: 'Core',     sets: '3',         reps: 'W1:10-12/s  W2:12/s  W3:10/s  W4:12/s', rest: '60s',    note: 'Anti-rotation core. Padel-relevant stability.',          alt: 'Band Pallof Press'         },
    ],
  },
  upper_b: {
    id: 'upper_b',
    name: 'Session 3 — Upper B',
    subtitle: 'Pull + Vertical Calisthenics',
    duration: '65–70 min',
    warmup: 'Dead hang — 2×30s · Scapular pull-ups — 2×10 · Band dislocates — 2×10 · Wrist circles — 1 min',
    sessionNote: 'If Padel is in the evening — keep shoulder volume within limits',
    exercises: [
      { name: 'Weighted Pull-ups',         category: 'Calisthenics', sets: '4',         reps: 'W1:6-8  W2:5-6  W3:4-5  W4:8',           rest: '3 min',    note: 'Start +5 kg → +20 kg goal. Pronated grip.',       alt: 'Archer Pull-ups'       },
      { name: 'Muscle-Up Practice',        category: 'Calisthenics', sets: '3',         reps: 'W1:Max+neg  W2:Max+band  W3:Max Q  W4:2-3',rest: '3–4 min',  note: 'See Progression Roadmap. Skill priority.',         alt: 'Band-assisted MU'      },
      { name: 'Pendlay Row',               category: 'Strength',     sets: '3/4/4-5/3', reps: 'W1:8-10  W2:6-8  W3:5-6  W4:10',         rest: '2.5 min',  note: 'Bar to floor each rep. Explosive concentric.',     alt: 'DB Row'                },
      { name: 'Wall HSPU Progression',     category: 'Calisthenics', sets: '3',         reps: 'W1:Max½  W2:Max¾  W3:Max full  W4:Max easy',rest: '2 min',   note: 'Phase goal: head to ab mat. 3s descent.',          alt: 'Pike Push-ups'         },
      { name: 'Chest-Supported Row',       category: 'Strength',     sets: '3',         reps: 'W1:12-15  W2:12  W3:10-12  W4:15',        rest: '90s',      note: 'Machine or incline DB. Target rhomboids.',         alt: 'Seated Cable Row'      },
      { name: 'Face Pulls + Band PA [SS]', category: 'Strength',     sets: '3',         reps: '15 each all weeks',                         rest: '60s',      note: 'Superset. Rotator cuff before Padel PM.',          alt: 'Band External Rot.'    },
      { name: 'Y / T / W Raises',          category: 'Padel',        sets: '2',         reps: 'W1:12ea  W2:12ea  W3:10ea  W4:12ea',       rest: '60s',      note: 'Overhead endurance + rotator cuff for smash.',     alt: 'Band Y-T-W'            },
      { name: 'Hammer Curl',               category: 'Strength',     sets: '3',         reps: 'W1:12-15  W2:12  W3:10-12  W4:15',        rest: '60s',      note: 'Brachialis + forearm. Improves Padel grip.',       alt: 'Zottman Curl'          },
    ],
  },
  lower_b: {
    id: 'lower_b',
    name: 'Session 4 — Lower B',
    subtitle: 'Posterior Chain + Padel Power',
    duration: '65–70 min',
    warmup: 'Hip 90/90 stretch — 2 min · Glute bridges — 2×15 · Monster walks (band) — 2×10m · Lateral lunge BW — 2×10/side',
    exercises: [
      { name: 'Hip Thrust (Barbell)',       category: 'Strength', sets: '4', reps: 'W1:10  W2:8  W3:6  W4:12',                rest: '2 min', note: 'Start 60-80 kg. Drive heels. Key Padel hip power.',       alt: 'Single-Leg Hip Thrust'   },
      { name: 'Explosive Lateral Step-Up', category: 'Padel',    sets: '3', reps: 'W1:8-10/s  W2:8/s  W3:8/s  W4:10/s',     rest: '90s',   note: 'Box 40-50 cm. Explosive drive, knee high. Shin-safe.',   alt: 'Lateral Lunge'           },
      { name: 'Nordic Hamstring Curl',     category: 'Strength', sets: '3', reps: 'W1:6  W2:5  W3:4  W4:6',                  rest: '2 min', note: 'Partner or lat pulldown machine. Best hamstring prehab.', alt: 'Glute-Ham Raise'         },
      { name: 'Lateral Band Walk (heavy)', category: 'Padel',    sets: '3', reps: 'W1:15/s  W2:15/s  W3:12/s  W4:15/s',     rest: '60s',   note: 'Hip abductor strength. Lateral court coverage.',         alt: 'Cable Hip Abduction'     },
      { name: 'Landmine Rotation',         category: 'Padel',    sets: '3', reps: 'W1:12/s  W2:12/s  W3:10/s  W4:12/s',     rest: '60s',   note: 'Rotational power. Mirrors Padel groundstroke.',          alt: 'Cable Woodchop'          },
      { name: 'Explosive Reverse Lunge',   category: 'Padel',    sets: '3', reps: 'W1:8/L  W2:8/L  W3:6/L  W4:10/L',        rest: '90s',   note: 'Drive knee up at top. Mimics recovery step.',            alt: 'Split Jump'              },
      { name: 'Pistol Squat',              category: 'Physio',   sets: '3', reps: 'W1:5-8/L  W2:5-8/L  W3:6-8/L  W4:8/L',  rest: '90s',   note: 'Same progression as Lower A.',                           alt: 'Assisted Pistol'         },
      { name: 'Single-Leg Calf Raise',     category: 'Physio',   sets: '2', reps: '20 all weeks',                             rest: '45s',   note: 'Eccentric focus: 3s down.',                              alt: '—'                       },
      { name: 'Tibialis Raise',            category: 'Physio',   sets: '2', reps: '20 all weeks',                             rest: '45s',   note: '—',                                                      alt: '—'                       },
      { name: 'Side-Lying Leg Raise',      category: 'Physio',   sets: '2', reps: '15/s all weeks',                           rest: '45s',   note: 'Controlled, no hip rotation.',                           alt: '—'                       },
    ],
  },
  upper_c: {
    id: 'upper_c',
    name: 'Session 5 — Upper C',
    subtitle: 'Push + Pull Combined (optional)',
    duration: '65–70 min',
    warmup: 'Band pull-aparts — 2×20 · Dead hang — 2×20s · Arm circles + shoulder CARs — 2 min',
    sessionNote: 'Moderate intensity (RPE 6-7). Cables / DBs / machines — no heavy barbell compounds.',
    exercises: [
      { name: 'Muscle-Up Practice',          category: 'Calisthenics', sets: '4', reps: 'W1:Max+neg  W2:Max+band  W3:Max Q  W4:2-3', rest: '3–4 min', note: 'Skill priority — fresh CNS.',                                  alt: 'Band-assisted MU'  },
      { name: 'Handstand / Wall HSPU',       category: 'Calisthenics', sets: '3', reps: 'W1:30s  W2:30-45s  W3:45s/reps  W4:30s easy',rest: '2 min',  note: 'Per Progression Roadmap.',                                     alt: '—'                 },
      { name: 'Neutral-Grip Pull-ups (wtd)', category: 'Calisthenics', sets: '4', reps: 'W1:6-8  W2:5-6  W3:4-5  W4:8',              rest: '2.5 min', note: 'Neutral/supinated grip — different from Upper B.',             alt: 'Lat Pulldown'      },
      { name: 'Cable Fly or Pec Deck',       category: 'Strength',     sets: '3', reps: 'W1:12-15  W2:12-15  W3:10-12  W4:15',        rest: '75s',     note: 'Chest isolation. 2nd chest stimulus after Upper A.',           alt: 'DB Fly'            },
      { name: 'DB Overhead Press',           category: 'Strength',     sets: '3', reps: 'W1:10-12  W2:10-12  W3:8-10  W4:12',         rest: '75s',     note: '2nd shoulder press stimulus.',                                 alt: 'Cable OH Press'    },
      { name: 'Seated Cable Row',            category: 'Strength',     sets: '3', reps: 'W1:12-15  W2:12  W3:10-12  W4:15',           rest: '75s',     note: 'Horizontal pull — complements Upper B Pendlay Row.',           alt: 'Machine Row'       },
      { name: 'Lateral Raise + Face Pull [SS]',category:'Strength',    sets: '3', reps: 'W1:12-15ea  W2:12-15ea  W3:12ea  W4:15ea',   rest: '60s',     note: 'Superset. Shoulder health + volume.',                          alt: '—'                 },
      { name: 'L-Sit Progression',           category: 'Calisthenics', sets: '3', reps: 'W1:Max hold  W2:Max hold  W3:Max hold  W4:10s',rest:'90s',     note: 'Tuck → L-sit. Core compression.',                              alt: 'Hanging L-sit'     },
      { name: 'Bicep + Tricep SS',           category: 'Strength',     sets: '3', reps: 'W1:12ea  W2:12ea  W3:10ea  W4:12ea',         rest: '60s',     note: 'DB curl + cable pushdown. Arms finisher.',                     alt: '—'                 },
    ],
  },
}

/* ─── 4-Week Mesocycle ───────────────────────────── */
export const MESOCYCLE = [
  { week: 'W1', phase: 'Accumulation',    sets: '3',   reps: '8-10 / 10-12', rpe: '7'   },
  { week: 'W2', phase: 'Volume+',         sets: '4',   reps: '6-8 / 10-12',  rpe: '8'   },
  { week: 'W3', phase: 'Intensification', sets: '4-5', reps: '4-6 / 8-10',   rpe: '8-9' },
  { week: 'W4', phase: 'Deload',          sets: '2-3', reps: '8-10 / 12-15', rpe: '6'   },
]

/* ─── Calisthenics Progression Roadmap ──────────── */
export const PROGRESSION = [
  { skill: 'Pull-ups',    level: '12 BW unbroken', phases: [
    { phase: 'Mesocycle 1-2', desc: 'Weighted +5→10 kg, 4×5-6. Solidify mechanics and tendon adaptation.' },
    { phase: 'Mesocycle 3-4', desc: 'Weighted +12.5-15 kg. Introduce Archer Pull-ups for unilateral loading.' },
    { phase: 'Mesocycle 5+',  desc: 'Weighted +17.5-20 kg. Begin one-arm negative pull-up work.' },
  ]},
  { skill: 'Muscle-ups', level: '2 max', phases: [
    { phase: 'Weeks 1-4',  desc: '3× max reps + 3 band-assisted + 3 slow negatives from top.' },
    { phase: 'Weeks 5-8',  desc: '3-4 clean reps + weighted MU singles. Goal: consistent 4 clean.' },
    { phase: 'Weeks 9-12', desc: '4×4-5 clean reps. Begin kipping to strict. Target: 8-10 unbroken.' },
  ]},
  { skill: 'HSPU', level: 'Wall, halfway down', phases: [
    { phase: 'Phase 1 (Wks 1-4)',  desc: 'Full-range wall HSPU — head touches ab mat. 3s descent.' },
    { phase: 'Phase 2 (Wks 5-8)',  desc: '4-5 strict reps per set + freestanding kick-up practice.' },
    { phase: 'Phase 3 (Wks 9-12)', desc: '6-8 strict wall reps + freestanding balance holds. Milestone: freestanding HSPU.' },
  ]},
  { skill: 'Dips', level: '+10 kg', phases: [
    { phase: 'Mesocycle 1', desc: '+10 → +15 kg for 4×6-8. Controlled full ROM.' },
    { phase: 'Mesocycle 2', desc: '+15 → +20 kg for 4×5-6.' },
    { phase: 'Mesocycle 3', desc: 'Introduce ring dips (BW) — 1-2 sets alongside weighted bar dips.' },
    { phase: 'Mesocycle 4+',desc: 'Alternate ring + weighted. Target: 10+ strict ring dips.' },
  ]},
]

/* ─── Overload rules ─────────────────────────────── */
export const OVERLOAD_RULES = [
  { rule: 'Compounds',    protocol: 'Add 2.5 kg when all reps are completed with good form for 2 consecutive sessions.' },
  { rule: 'Accessories',  protocol: 'Double progression: reach top of rep range across all sets → increase weight 2.5-5 kg.' },
  { rule: 'Calisthenics', protocol: 'Follow the Progression Roadmap. Quality over speed — never rush skill work.' },
  { rule: 'Deload (W4)',  protocol: 'Same weight. Reduce sets by 1-2, increase reps slightly. Never reduce load.' },
  { rule: 'Heavy Padel',  protocol: 'If Padel intensity is unusually high, reduce lower body gym volume 20% next session.' },
]

export const SESSION_ORDER = ['upper_a', 'lower_a', 'upper_b', 'lower_b', 'upper_c']

/* Keep these for utility use in other components */
export function getDayKey(dateStr) {
  const KEYS = ['monday','tuesday','wednesday','thursday','friday','saturday','sunday']
  const d = new Date(dateStr + 'T12:00:00')
  return KEYS[d.getDay() === 0 ? 6 : d.getDay() - 1]
}

export function getWeekNumber(dateStr) {
  const d = new Date(dateStr + 'T12:00:00')
  const start = new Date(d.getFullYear(), 0, 1)
  return Math.ceil(((d - start) / 86400000 + start.getDay() + 1) / 7)
}
