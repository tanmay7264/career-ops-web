'use client'
import { useState } from 'react'
import { Stepper } from './Stepper'
import { Step1Profile } from './Step1Profile'
import { Step2CV } from './Step2CV'
import { Step3Portals } from './Step3Portals'
import { Step4Done } from './Step4Done'
import type { ProfileStep1, ProfileStep2, ProfileStep3 } from '@/lib/validations'

interface WizardData {
  step1?: ProfileStep1
  step2?: ProfileStep2
  step3?: ProfileStep3
}

export function OnboardingWizard() {
  const [step, setStep] = useState(1)
  const [data, setData] = useState<WizardData>({})

  const handleStep1 = (d: ProfileStep1) => { setData(p => ({ ...p, step1: d })); setStep(2) }
  const handleStep2 = (d: ProfileStep2) => { setData(p => ({ ...p, step2: d })); setStep(3) }
  const handleStep3 = (d: ProfileStep3) => { setData(p => ({ ...p, step3: d })); setStep(4) }

  return (
    <div className="min-h-screen bg-gray-50">
      <Stepper currentStep={step} />
      <div className="flex justify-center px-4 py-10">
        {step === 1 && <Step1Profile onNext={handleStep1} defaultValues={data.step1} />}
        {step === 2 && <Step2CV onNext={handleStep2} onBack={() => setStep(1)} defaultValues={data.step2} />}
        {step === 3 && <Step3Portals onNext={handleStep3} onBack={() => setStep(2)} defaultValues={data.step3} allData={data} />}
        {step === 4 && <Step4Done />}
      </div>
    </div>
  )
}
