import { useRef, useEffect } from 'react'

const ITEM_HEIGHT = 40

// Drum-roll scroll picker
function ScrollPicker({ values, selected, onChange, format = v => v }) {
  const ref = useRef(null)
  const isSyncing = useRef(false)

  const selectedIdx = values.indexOf(selected)

  // Scroll to selected value on mount or when selected changes externally
  useEffect(() => {
    if (!ref.current) return
    isSyncing.current = true
    ref.current.scrollTop = Math.max(0, selectedIdx) * ITEM_HEIGHT
    setTimeout(() => { isSyncing.current = false }, 100)
  }, [selected, selectedIdx])

  function handleScroll() {
    if (isSyncing.current || !ref.current) return
    const idx = Math.round(ref.current.scrollTop / ITEM_HEIGHT)
    const clamped = Math.max(0, Math.min(values.length - 1, idx))
    if (values[clamped] !== selected) {
      onChange(values[clamped])
    }
  }

  return (
    <div className="relative" style={{ height: ITEM_HEIGHT * 3 }}>
      {/* Highlight band */}
      <div
        className="absolute inset-x-0 pointer-events-none rounded-lg bg-indigo-50 border-y-2 border-indigo-300 z-10"
        style={{ top: ITEM_HEIGHT, height: ITEM_HEIGHT }}
      />
      {/* Top / bottom fade */}
      <div className="absolute inset-x-0 top-0 h-10 bg-gradient-to-b from-white to-transparent pointer-events-none z-20" />
      <div className="absolute inset-x-0 bottom-0 h-10 bg-gradient-to-t from-white to-transparent pointer-events-none z-20" />

      <div
        ref={ref}
        onScroll={handleScroll}
        className="h-full overflow-y-scroll scrollbar-hide"
        style={{ scrollSnapType: 'y mandatory' }}
      >
        {/* top padding so first item can center */}
        <div style={{ height: ITEM_HEIGHT, scrollSnapAlign: 'center', flexShrink: 0 }} />
        {values.map((v, i) => (
          <div
            key={i}
            style={{ height: ITEM_HEIGHT, scrollSnapAlign: 'center' }}
            className={`flex items-center justify-center text-base font-semibold transition-colors cursor-pointer select-none
              ${v === selected ? 'text-indigo-700' : 'text-gray-400'}
            `}
            onClick={() => {
              ref.current.scrollTo({ top: i * ITEM_HEIGHT, behavior: 'smooth' })
              onChange(v)
            }}
          >
            {format(v)}
          </div>
        ))}
        {/* bottom padding */}
        <div style={{ height: ITEM_HEIGHT, scrollSnapAlign: 'center', flexShrink: 0 }} />
      </div>
    </div>
  )
}

const HOURS_DURATION = Array.from({ length: 25 }, (_, i) => i)       // 0–24
const HOURS_TIME = Array.from({ length: 24 }, (_, i) => i)            // 0–23
const MINUTES_5 = Array.from({ length: 12 }, (_, i) => i * 5)        // 0,5,10,...,55

function pad(n) { return String(n).padStart(2, '0') }

function DurationPicker({ value, onChange }) {
  const [h, m] = value ? value.split(':').map(Number) : [0, 0]

  return (
    <div className="flex items-center justify-center gap-2 bg-gray-50 rounded-xl px-4 py-1 border border-gray-200">
      <div className="w-16">
        <ScrollPicker
          values={HOURS_DURATION}
          selected={h}
          onChange={val => onChange(`${val}:${pad(m)}`)}
          format={v => `${v}h`}
        />
      </div>
      <span className="text-2xl font-bold text-gray-300 mb-0.5">:</span>
      <div className="w-16">
        <ScrollPicker
          values={MINUTES_5}
          selected={MINUTES_5.includes(m) ? m : 0}
          onChange={val => onChange(`${h}:${pad(val)}`)}
          format={v => `${pad(v)}m`}
        />
      </div>
    </div>
  )
}

function WakeUpPicker({ value, onChange }) {
  const [h, m] = value ? value.split(':').map(Number) : [7, 0]
  const nearestMin = MINUTES_5.reduce((prev, curr) =>
    Math.abs(curr - m) < Math.abs(prev - m) ? curr : prev, 0)

  return (
    <div className="flex items-center justify-center gap-2 bg-gray-50 rounded-xl px-4 py-1 border border-gray-200">
      <div className="w-16">
        <ScrollPicker
          values={HOURS_TIME}
          selected={h}
          onChange={val => onChange(`${pad(val)}:${pad(nearestMin)}`)}
          format={v => `${pad(v)}`}
        />
      </div>
      <span className="text-2xl font-bold text-gray-300 mb-0.5">:</span>
      <div className="w-16">
        <ScrollPicker
          values={MINUTES_5}
          selected={nearestMin}
          onChange={val => onChange(`${pad(h)}:${pad(val)}`)}
          format={v => `${pad(v)}`}
        />
      </div>
    </div>
  )
}

const QUALITY_OPTIONS = [
  { value: 1, label: 'Poor' },
  { value: 2, label: 'Low' },
  { value: 3, label: 'Fair' },
  { value: 4, label: 'Good' },
  { value: 5, label: 'Great' },
]

function SleepQualityPicker({ value, onChange }) {
  return (
    <div className="flex gap-2">
      {QUALITY_OPTIONS.map(opt => (
        <button
          key={opt.value}
          type="button"
          onClick={() => onChange(opt.value)}
          className={`
            flex-1 py-2 rounded-xl border-2 text-xs font-semibold transition-all duration-150
            ${value === opt.value
              ? 'border-indigo-500 bg-indigo-600 text-white shadow-sm'
              : 'border-gray-200 bg-gray-50 text-gray-500 hover:border-gray-300 hover:bg-white'
            }
          `}
        >
          {opt.label}
        </button>
      ))}
    </div>
  )
}

function ToggleCheck({ checked, onChange, label, description }) {
  return (
    <button
      type="button"
      onClick={() => onChange(!checked)}
      className={`
        w-full flex items-center justify-between px-4 py-3 rounded-xl border-2 transition-all duration-150 text-left
        ${checked
          ? 'border-indigo-500 bg-indigo-50'
          : 'border-gray-200 bg-gray-50 hover:border-gray-300 hover:bg-white'
        }
      `}
    >
      <div>
        <p className={`text-sm font-semibold ${checked ? 'text-indigo-800' : 'text-gray-700'}`}>{label}</p>
        {description && <p className="text-xs text-gray-400 mt-0.5">{description}</p>}
      </div>
      <div className={`
        w-7 h-7 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-all ml-3
        ${checked ? 'bg-indigo-600 border-indigo-600' : 'border-gray-300 bg-white'}
      `}>
        {checked && (
          <svg className="w-3.5 h-3.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
          </svg>
        )}
      </div>
    </button>
  )
}

function FieldLabel({ children, hint }) {
  return (
    <div className="mb-2">
      <label className="block text-sm font-semibold text-gray-700">{children}</label>
      {hint && <p className="text-xs text-gray-400 mt-0.5">{hint}</p>}
    </div>
  )
}

function qualityLabel(val) {
  return QUALITY_OPTIONS.find(o => o.value === val)?.label || ''
}

export default function SleepTracker({ data, onChange }) {
  function update(key, value) {
    onChange({ [key]: value })
  }

  const hasDuration = data.duration != null
  const hasWakeUp = !!data.wakeUpTime
  const hasMorning = !!data.morningRoutine
  const hasQuality = data.quality != null
  const completedCount = [hasDuration, hasWakeUp, hasMorning].filter(Boolean).length

  return (
    <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-3.5 border-b border-gray-100 bg-indigo-50">
        <h2 className="text-sm font-bold text-indigo-800 tracking-tight uppercase">Sleep Tracker</h2>
        <div className="flex gap-1">
          {[0, 1, 2].map(i => (
            <div
              key={i}
              className={`h-1.5 w-8 rounded-full transition-all duration-300 ${i < completedCount ? 'bg-indigo-500' : 'bg-indigo-200'}`}
            />
          ))}
        </div>
      </div>

      <div className="px-5 py-5 space-y-5">
        {/* Sleep Duration */}
        <div>
          <FieldLabel hint="Scroll to set hours and minutes">Sleep Duration</FieldLabel>
          <DurationPicker
            value={data.duration ?? '7:00'}
            onChange={val => update('duration', val)}
          />
        </div>

        {/* Wake Up Time */}
        <div>
          <FieldLabel hint="Scroll to set wake-up time">Wake Up Time</FieldLabel>
          <WakeUpPicker
            value={data.wakeUpTime || '07:00'}
            onChange={val => update('wakeUpTime', val)}
          />
        </div>

        {/* Sleep Quality */}
        <div>
          <FieldLabel hint="How well did you sleep?">Sleep Quality</FieldLabel>
          <SleepQualityPicker
            value={data.quality ?? null}
            onChange={val => update('quality', val)}
          />
        </div>

        {/* Morning Routine */}
        <div>
          <FieldLabel>Morning Routine</FieldLabel>
          <ToggleCheck
            checked={!!data.morningRoutine}
            onChange={val => update('morningRoutine', val)}
            label="Morning routine completed"
            description="Exercise, journaling, meditation, or whatever your routine is"
          />
        </div>

        {/* Summary */}
        {(hasDuration || hasWakeUp || hasMorning || hasQuality) && (
          <div className="rounded-xl bg-gray-50 border border-gray-100 px-4 py-3 space-y-1">
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2">Summary</p>
            <div className="flex flex-wrap gap-x-5 gap-y-1.5">
              {hasDuration && (
                <span className="text-sm text-gray-700">
                  Slept <span className="font-semibold">{data.duration?.replace(':', 'h ')}m</span>
                </span>
              )}
              {hasWakeUp && (
                <span className="text-sm text-gray-700">
                  Up at <span className="font-semibold">{data.wakeUpTime}</span>
                </span>
              )}
              {hasQuality && (
                <span className="text-sm text-gray-700">
                  Quality: <span className="font-semibold">{qualityLabel(data.quality)}</span>
                </span>
              )}
              {hasMorning && (
                <span className="text-sm text-gray-700">
                  Morning routine <span className="font-semibold text-indigo-600">done</span>
                </span>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
