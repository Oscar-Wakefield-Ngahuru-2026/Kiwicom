import { useState, useRef, useEffect } from 'react'

// --- slider colours: change these ---
const TRACK = 'bg-slate-800 border border-slate-700'
const INDICATOR = 'bg-violet-600'
const ACTIVE_TEXT = 'text-white font-semibold'
const INACTIVE_TEXT = 'text-slate-400'
const GLOW = 'shadow-[0_0_12px_rgba(124,58,237,0.55)]'
// ------------------------------------

interface DropdownProps {
  label: string
  options: string[]
  selected: string[]
  onChange: (val: string) => void
}

function Dropdown({ label, options, selected, onChange }: DropdownProps) {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  // close dropdown when clicking outside it (very fanccyyyy!!)
  useEffect(() => {
    function handleOutsideClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handleOutsideClick)
    return () => document.removeEventListener('mousedown', handleOutsideClick)
  }, [])

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen((prev) => !prev)}
        className="flex items-center gap-1 rounded border border-slate-600 bg-gray-800 px-3 py-1.5 text-sm text-slate-200 hover:bg-gray-700"
      >
        {label}
        {selected.length > 0 && (
          <span className="ml-1 rounded-full bg-blue-500 px-1.5 text-xs text-white">
            {selected.length}
          </span>
        )}
        <span className="ml-1 text-xs">{open ? '▲' : '▼'}</span>
      </button>

      {open && (
        <div className="absolute z-10 mt-1 min-w-40 rounded border border-slate-600 bg-gray-800 p-2 shadow-lg">
          {options.map((option) => (
            <label
              key={option}
              className="flex cursor-pointer items-center gap-2 rounded px-2 py-1 text-sm text-slate-200 hover:bg-gray-700"
            >
              <input
                type="checkbox"
                checked={selected.includes(option)}
                onChange={() => onChange(option)}
                className="accent-blue-500"
              />
              {option}
            </label>
          ))}
        </div>
      )}
    </div>
  )
}

interface SliderProps {
  value: boolean
  onChange: (v: boolean) => void
}

function LearningSlider({ value, onChange }: SliderProps) {
  const indicatorClass = [
    'absolute inset-0 w-1/2 rounded-lg transition-transform duration-300 ease-in-out',
    INDICATOR,
    value ? 'translate-x-full' : 'translate-x-0',
  ].join(' ')

  const seriousLabelClass = [
    'relative z-10 flex flex-1 items-center justify-center text-sm transition-colors duration-300',
    value ? INACTIVE_TEXT : ACTIVE_TEXT,
  ].join(' ')

  const learningLabelClass = [
    'relative z-10 flex flex-1 items-center justify-center text-sm transition-colors duration-300',
    value ? ACTIVE_TEXT : INACTIVE_TEXT,
  ].join(' ')

  const containerClass = [
    'relative flex h-9 w-48 cursor-pointer select-none overflow-hidden rounded-lg transition-shadow duration-300',
    TRACK,
    value ? GLOW : '',
  ].join(' ')

  return (
    <div
      className={containerClass}
      onClick={() => onChange(!value)}
      role="switch"
      aria-checked={value}
      tabIndex={0}
      onKeyDown={(e) => e.key === 'Enter' && onChange(!value)}
    >
      <span className={indicatorClass} />
      <span className={seriousLabelClass}>Serious</span>
      <span className={learningLabelClass}>Learning</span>
    </div>
  )
}

interface Props {
  languages: string[]
  topics: string[]
  selectedLanguages: string[]
  selectedTopics: string[]
  learningMode: boolean
  onLanguageChange: (lang: string) => void
  onTopicChange: (topic: string) => void
  onLearningChange: (val: boolean) => void
}

export default function FilterBar({
  languages,
  topics,
  selectedLanguages,
  selectedTopics,
  learningMode,
  onLanguageChange,
  onTopicChange,
  onLearningChange,
}: Props) {
  return (
    <div className="mb-6 flex flex-wrap items-center gap-4">
      <Dropdown
        label="Language"
        options={languages}
        selected={selectedLanguages}
        onChange={onLanguageChange}
      />
      <Dropdown
        label="Topics"
        options={topics}
        selected={selectedTopics}
        onChange={onTopicChange}
      />
      <LearningSlider value={learningMode} onChange={onLearningChange} />
    </div>
  )
}
