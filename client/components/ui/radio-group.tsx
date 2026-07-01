// Thin wrapper around Radix UI's RadioGroup primitive.
// Radix handles keyboard nav, accessibility, and checked state for us.
// We just pass our own className on top.

import * as RadioGroupPrimitive from '@radix-ui/react-radio-group'
import * as React from 'react'
import { cn } from '@/lib/utils'

// RadioGroup = the container that holds all the radio options
const RadioGroup = React.forwardRef<
  React.ElementRef<typeof RadioGroupPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof RadioGroupPrimitive.Root>
>(({ className, ...props }, ref) => {
  return <RadioGroupPrimitive.Root className={cn('grid gap-3', className)} {...props} ref={ref} />
})
RadioGroup.displayName = RadioGroupPrimitive.Root.displayName

// RadioGroupItem = a single radio option (the actual clickable dot)
const RadioGroupItem = React.forwardRef<
  React.ElementRef<typeof RadioGroupPrimitive.Item>,
  React.ComponentPropsWithoutRef<typeof RadioGroupPrimitive.Item>
>(({ className, ...props }, ref) => {
  return (
    <RadioGroupPrimitive.Item
      ref={ref}
      className={cn(
        'aspect-square size-4 rounded-full border border-slate-600 outline-offset-2 focus-visible:outline focus-visible:outline-2 focus-visible:outline-violet-500/70 disabled:cursor-not-allowed disabled:opacity-50 data-[state=checked]:border-violet-600 data-[state=checked]:bg-violet-600 data-[state=checked]:text-white',
        className,
      )}
      {...props}
    >
      {/* The dot shown inside the radio circle when checked */}
      <RadioGroupPrimitive.Indicator className="flex items-center justify-center text-current">
        <svg width="6" height="6" viewBox="0 0 6 6" fill="currentcolor">
          <circle cx="3" cy="3" r="3" />
        </svg>
      </RadioGroupPrimitive.Indicator>
    </RadioGroupPrimitive.Item>
  )
})
RadioGroupItem.displayName = RadioGroupPrimitive.Item.displayName

export { RadioGroup, RadioGroupItem }
