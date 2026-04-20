import { cn } from '@/lib/utils'
import { Check } from 'lucide-react'

const STEPS = ['Profile', 'CV', 'Portals', 'Done']

interface StepperProps {
  currentStep: number // 1-based
}

export function Stepper({ currentStep }: StepperProps) {
  return (
    <div className="bg-white border-b border-gray-200 px-8 py-5">
      <div className="text-[11px] font-bold tracking-widest text-gray-400 uppercase mb-5">
        career<span className="text-indigo-600">ops</span> &nbsp;·&nbsp; Setup
      </div>

      <div className="flex items-start">
        {STEPS.map((label, i) => {
          const stepNum = i + 1
          const isCompleted = stepNum < currentStep
          const isActive = stepNum === currentStep
          const isLast = i === STEPS.length - 1

          return (
            <div key={label} className="flex items-start flex-1">
              <div className="flex flex-col items-center">
                <div className={cn(
                  'w-8 h-8 rounded-full border-2 flex items-center justify-center text-xs font-bold transition-all',
                  isCompleted && 'bg-indigo-600 border-indigo-600 text-white',
                  isActive && 'bg-indigo-600 border-indigo-600 text-white ring-4 ring-indigo-100',
                  !isCompleted && !isActive && 'border-gray-300 text-gray-400'
                )}>
                  {isCompleted ? <Check size={14} /> : stepNum}
                </div>
                <div className={cn(
                  'text-[11px] font-semibold mt-2',
                  isActive ? 'text-indigo-600' : isCompleted ? 'text-gray-500' : 'text-gray-400'
                )}>
                  {label}
                </div>
              </div>
              {!isLast && (
                <div className="flex-1 mt-4 mx-2">
                  <div className="h-0.5 bg-gray-200 rounded">
                    <div
                      className="h-full bg-indigo-600 rounded transition-all duration-500"
                      style={{ width: isCompleted ? '100%' : '0%' }}
                    />
                  </div>
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
