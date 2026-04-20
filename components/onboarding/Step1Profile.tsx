'use client'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { profileStep1Schema, type ProfileStep1 } from '@/lib/validations'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'
import { AlertCircle } from 'lucide-react'
import { cn } from '@/lib/utils'

interface Props { onNext: (d: ProfileStep1) => void; defaultValues?: ProfileStep1 }

function Field({ label, error, children }: { label: string; error?: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <label className="text-[11px] font-bold uppercase tracking-wide text-gray-500">{label}</label>
      {children}
      {error && <p className="text-xs text-red-500 font-medium">{error}</p>}
    </div>
  )
}

export function Step1Profile({ onNext, defaultValues }: Props) {
  const { register, handleSubmit, formState: { errors } } = useForm<ProfileStep1>({
    resolver: zodResolver(profileStep1Schema),
    defaultValues,
  })

  const hasErrors = Object.keys(errors).length > 0

  return (
    <div className="w-full max-w-lg">
      <div className="bg-white border border-gray-200 rounded-2xl shadow-sm p-10">
        <h2 className="text-xl font-bold mb-1">Your profile</h2>
        <p className="text-sm text-gray-500 mb-8">Personalizes AI evaluations and CV generation for every role</p>

        {hasErrors && (
          <div className="flex items-center gap-2 bg-red-50 border border-red-200 rounded-lg px-4 py-3 mb-6 text-sm text-red-600 font-medium">
            <AlertCircle size={15} />
            Please fill in all required fields before continuing.
          </div>
        )}

        <form onSubmit={handleSubmit(onNext)} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <Field label="Full Name *" error={errors.fullName?.message}>
              <Input {...register('fullName')} placeholder="Rahul Sharma" className={cn(errors.fullName && 'border-red-400 bg-red-50')} />
            </Field>
            <Field label="Location *" error={errors.location?.message}>
              <Input {...register('location')} placeholder="Bengaluru, India" className={cn(errors.location && 'border-red-400 bg-red-50')} />
            </Field>
            <Field label="Target Role(s) *" error={errors.targetRoles?.message}>
              <Input {...register('targetRoles')} placeholder="AI Product Manager, Head of AI" className={cn(errors.targetRoles && 'border-red-400 bg-red-50')} />
            </Field>
            <Field label="Seniority *" error={errors.seniority?.message}>
              <Input {...register('seniority')} placeholder="Senior / Lead / Director / VP" className={cn(errors.seniority && 'border-red-400 bg-red-50')} />
            </Field>
            <Field label="Min Salary (₹ LPA) *" error={errors.salaryMin?.message}>
              <Input {...register('salaryMin', { valueAsNumber: true })} type="number" placeholder="20" className={cn(errors.salaryMin && 'border-red-400 bg-red-50')} />
            </Field>
            <Field label="Max Salary (₹ LPA) *" error={errors.salaryMax?.message}>
              <Input {...register('salaryMax', { valueAsNumber: true })} type="number" placeholder="40" className={cn(errors.salaryMax && 'border-red-400 bg-red-50')} />
            </Field>
          </div>
          <Field label="Your Superpower *" error={errors.superpower?.message}>
            <Textarea
              {...register('superpower')}
              rows={3}
              placeholder="I build AI-led products that move business metrics across India's fastest-growing tech companies..."
              className={cn(errors.superpower && 'border-red-400 bg-red-50')}
            />
          </Field>

          <div className="flex justify-between items-center pt-4">
            <span className="text-xs text-gray-400">Step 1 of 4</span>
            <Button type="submit" className="bg-indigo-600 hover:bg-indigo-700 text-white">Continue →</Button>
          </div>
        </form>
      </div>
    </div>
  )
}
