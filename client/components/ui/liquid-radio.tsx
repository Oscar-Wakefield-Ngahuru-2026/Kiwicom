// LiquidToggle — a sliding toggle between "Serious" and "Learning" modes.
//
// How the slide works:
//   1. The RadioGroup has a CSS `after:` pseudo-element — that's the sliding pill.
//   2. We put `data-state="serious"` or `data-state="learning"` on the RadioGroup.
//   3. Tailwind's data-[state=...] selectors move the pill left or right based on that value.
//   4. The GlassFilter SVG adds a subtle liquid distortion effect on top of the pill.

import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'

// GlassFilter — hidden SVG that defines a liquid distortion filter.
// The filter is referenced by id ("radio-glass") in the div below it.
export function GlassFilter() {
  return (
    <svg className="hidden">
      <defs>
        <filter
          id="radio-glass"
          x="0%"
          y="0%"
          width="100%"
          height="100%"
          colorInterpolationFilters="sRGB"
        >
          {/* Step 1: generate noise */}
          <feTurbulence
            type="fractalNoise"
            baseFrequency="0.05 0.05"
            numOctaves="1"
            seed="1"
            result="turbulence"
          />
          {/* Step 2: blur the noise so it feels smooth */}
          <feGaussianBlur in="turbulence" stdDeviation="2" result="blurredNoise" />
          {/* Step 3: use the noise to slightly displace the pixels */}
          <feDisplacementMap
            in="SourceGraphic"
            in2="blurredNoise"
            scale="30"
            xChannelSelector="R"
            yChannelSelector="B"
            result="displaced"
          />
          {/* Step 4: final blur to smooth out the displacement edges */}
          <feGaussianBlur in="displaced" stdDeviation="2" result="finalBlur" />
          <feComposite in="finalBlur" in2="finalBlur" operator="over" />
        </filter>
      </defs>
    </svg>
  )
}

interface LiquidToggleProps {
  value: boolean // false = Serious, true = Learning
  onChange: (v: boolean) => void
}

export function LiquidToggle({ value, onChange }: LiquidToggleProps) {
  // Convert our boolean to a string so data-state and RadioGroup both understand it
  const state = value ? 'learning' : 'serious'

  // The sliding pill is built with Tailwind's `after:` pseudo-element.
  // Splitting the long className into named chunks makes it easier to read.
  const pillBase = 'after:absolute after:inset-y-0 after:w-1/2 after:rounded-md after:bg-slate-700'
  const pillShadow =
    'after:shadow-[0_0_8px_rgba(0,0,0,0.03),0_2px_6px_rgba(0,0,0,0.08),inset_3px_3px_0.5px_-3.5px_rgba(255,255,255,0.09),inset_-3px_-3px_0.5px_-3.5px_rgba(255,255,255,0.85),inset_1px_1px_1px_-0.5px_rgba(255,255,255,0.6),inset_-1px_-1px_1px_-0.5px_rgba(255,255,255,0.6),inset_0_0_6px_6px_rgba(255,255,255,0.12),inset_0_0_2px_2px_rgba(255,255,255,0.06),0_0_12px_rgba(0,0,0,0.15)]'
  const pillAnimation =
    'after:transition-transform after:duration-300 after:[transition-timing-function:cubic-bezier(0.16,1,0.3,1)]'
  const pillPosition =
    'data-[state=serious]:after:translate-x-0 data-[state=learning]:after:translate-x-full'
  const pillFocus =
    'has-[:focus-visible]:after:outline has-[:focus-visible]:after:outline-2 has-[:focus-visible]:after:outline-violet-500/70'

  const radioGroupClass = [
    'group relative inline-grid grid-cols-[1fr_1fr] items-center gap-0 text-sm font-medium',
    pillBase,
    pillShadow,
    pillAnimation,
    pillPosition,
    pillFocus,
  ].join(' ')

  return (
    <div className="inline-flex h-9 rounded-lg bg-slate-800 p-0.5">
      <RadioGroup
        value={state}
        onValueChange={(v) => onChange(v === 'learning')}
        className={radioGroupClass}
        data-state={state}
      >
        {/* Liquid glass distortion layer — sits behind the pill */}
        <div
          className="absolute top-0 left-0 isolate -z-10 h-full w-full overflow-hidden rounded-md"
          style={{ filter: 'url("#radio-glass")' }}
        />

        {/* Left option: Serious — active when state is "serious" */}
        <label className="relative z-10 inline-flex h-full min-w-8 cursor-pointer select-none items-center justify-center whitespace-nowrap px-4 text-slate-400 transition-colors group-data-[state=serious]:text-slate-100">
          Serious
          <RadioGroupItem value="serious" className="sr-only" />
        </label>

        {/* Right option: Learning — active when state is "learning" */}
        <label className="relative z-10 inline-flex h-full min-w-8 cursor-pointer select-none items-center justify-center whitespace-nowrap px-4 text-slate-400 transition-colors group-data-[state=learning]:text-slate-100">
          Learning
          <RadioGroupItem value="learning" className="sr-only" />
        </label>

        <GlassFilter />
      </RadioGroup>
    </div>
  )
}
