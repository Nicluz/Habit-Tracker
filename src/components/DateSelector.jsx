import { useMemo } from 'react'

function todayStr() {
  return new Date().toISOString().split('T')[0]
}

function buildDays() {
  const days = []
  const today = new Date()
  for (let i = 6; i >= 0; i--) {
    const d = new Date(today)
    d.setDate(today.getDate() - i)
    days.push(d.toISOString().split('T')[0])
  }
  return days
}

function formatDay(dateStr) {
  const date = new Date(dateStr + 'T12:00:00')
  return {
    weekday: date.toLocaleDateString('en-US', { weekday: 'short' }),
    day: date.getDate(),
  }
}

export default function DateSelector({ selectedDate, onChange }) {
  const today = todayStr()
  const days = useMemo(() => buildDays(), [])

  return (
    <div className="bg-white rounded-xl border border-gray-200 px-3 py-3 shadow-sm">
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs font-semibold text-gray-400 uppercase tracking-wide">Select Day</span>
        {selectedDate !== today && (
          <button
            onClick={() => onChange(today)}
            className="text-xs font-medium text-indigo-600 hover:text-indigo-700 bg-indigo-50 hover:bg-indigo-100 px-2.5 py-0.5 rounded-full transition-colors"
          >
            Today
          </button>
        )}
      </div>
      <div className="flex gap-1 justify-between">
        {days.map(dateStr => {
          const { weekday, day } = formatDay(dateStr)
          const isSelected = dateStr === selectedDate
          const isToday = dateStr === today

          return (
            <button
              key={dateStr}
              onClick={() => onChange(dateStr)}
              className={`
                flex flex-col items-center flex-1 py-1.5 rounded-lg transition-all duration-150
                ${isSelected
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'text-gray-500 hover:bg-gray-100'
                }
              `}
            >
              <span className={`text-[9px] font-semibold uppercase ${isSelected ? 'text-indigo-200' : 'text-gray-400'}`}>
                {weekday}
              </span>
              <span className={`text-sm font-bold leading-tight mt-0.5 ${isSelected ? 'text-white' : 'text-gray-800'}`}>
                {day}
              </span>
              <span className={`w-1 h-1 rounded-full mt-1 ${isToday ? (isSelected ? 'bg-indigo-300' : 'bg-indigo-500') : 'bg-transparent'}`} />
            </button>
          )
        })}
      </div>
    </div>
  )
}
