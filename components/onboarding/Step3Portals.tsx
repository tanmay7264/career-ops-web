'use client'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { profileStep3Schema, type ProfileStep3, type ProfileStep1, type ProfileStep2 } from '@/lib/validations'
import type { z } from 'zod'

type ProfileStep3Input = z.input<typeof profileStep3Schema>
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { AlertCircle } from 'lucide-react'
import { cn } from '@/lib/utils'
import { toast } from 'sonner'

const DEFAULT_PORTALS_YAML = `title_filter:
  positive: [AI, LLM, "Machine Learning", "Applied AI", "ML Platform", "AI Platform"]
  negative: [Junior, Intern, ".NET", PHP, "Data Entry", WordPress]

companies:
  - name: Anthropic
    url: https://boards.greenhouse.io/anthropic
  - name: OpenAI
    url: https://boards.greenhouse.io/openai
  - name: Google DeepMind
    url: https://boards.greenhouse.io/deepmind
  - name: Mistral AI
    url: https://boards.greenhouse.io/mistral
  - name: Cohere
    url: https://boards.greenhouse.io/cohere
  - name: Scale AI
    url: https://boards.greenhouse.io/scaleai
  - name: Hugging Face
    url: https://boards.greenhouse.io/huggingface
  - name: Stability AI
    url: https://boards.greenhouse.io/stabilityai
`

interface AllData {
  step1?: ProfileStep1
  step2?: ProfileStep2
}

interface Props {
  onNext: (d: ProfileStep3) => void
  onBack: () => void
  defaultValues?: ProfileStep3
  allData: AllData
}

export function Step3Portals({ onNext, onBack, defaultValues, allData }: Props) {
  const [saving, setSaving] = useState(false)
  const [useDefault, setUseDefault] = useState(true)

  const { register, handleSubmit, setValue, formState: { errors } } = useForm<ProfileStep3Input, unknown, ProfileStep3>({
    resolver: zodResolver(profileStep3Schema),
    defaultValues: defaultValues ?? {
      includeKw: 'AI, LLM, Machine Learning, Applied AI',
      excludeKw: 'Junior, Intern, .NET, PHP',
      portalsYaml: DEFAULT_PORTALS_YAML,
    },
  })

  const onSubmit = async (d: ProfileStep3) => {
    setSaving(true)
    try {
      const payload = {
        ...allData.step1,
        cvMarkdown: allData.step2?.cvMarkdown,
        ...d,
      }
      const res = await fetch('/api/profile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
      if (!res.ok) {
        const err = await res.json()
        throw new Error(err.error || 'Failed to save profile')
      }
      onNext(d)
    } catch (err) {
      toast.error('Error saving profile', { description: String(err) })
    } finally {
      setSaving(false)
    }
  }

  const selectDefault = () => {
    setUseDefault(true)
    setValue('portalsYaml', DEFAULT_PORTALS_YAML)
    setValue('includeKw', 'AI, LLM, Machine Learning, Applied AI')
  }

  return (
    <div className="w-full max-w-lg">
      <div className="bg-white border border-gray-200 rounded-2xl shadow-sm p-10">
        <h2 className="text-xl font-bold mb-1">Job portals config</h2>
        <p className="text-sm text-gray-500 mb-8">45+ companies pre-configured. Tune keywords to match your roles.</p>

        {Object.keys(errors).length > 0 && (
          <div className="flex items-center gap-2 bg-red-50 border border-red-200 rounded-lg px-4 py-3 mb-6 text-sm text-red-600 font-medium">
            <AlertCircle size={15} /> Please add at least one include keyword.
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid grid-cols-2 gap-3 mb-4">
            <button
              type="button"
              onClick={selectDefault}
              className={cn(
                'p-3 rounded-xl border-2 text-left transition-all',
                useDefault ? 'border-indigo-500 bg-indigo-50' : 'border-gray-200 hover:border-gray-300'
              )}
            >
              <div className={cn('text-sm font-bold', useDefault ? 'text-indigo-600' : 'text-gray-700')}>
                {useDefault ? '✓ ' : ''}Use default template
              </div>
              <div className="text-xs text-gray-500 mt-0.5">45 companies, AI/ML keywords</div>
            </button>
            <label className={cn('p-3 rounded-xl border-2 text-left cursor-pointer transition-all', !useDefault ? 'border-indigo-500 bg-indigo-50' : 'border-gray-200 hover:border-gray-300')}>
              <div className="text-sm font-bold text-gray-700">Upload portals.yml</div>
              <div className="text-xs text-gray-500 mt-0.5">Use your existing config</div>
              <input
                type="file"
                accept=".yml,.yaml"
                className="hidden"
                onChange={e => {
                  setUseDefault(false)
                  const f = e.target.files?.[0]
                  if (f) {
                    const r = new FileReader()
                    r.onload = ev => setValue('portalsYaml', ev.target?.result as string, { shouldValidate: true })
                    r.readAsText(f)
                  }
                }}
              />
            </label>
          </div>

          <div className="space-y-1.5">
            <label className="text-[11px] font-bold uppercase tracking-wide text-gray-500">Include Keywords *</label>
            <Input
              {...register('includeKw')}
              placeholder="AI, LLM, Machine Learning, Applied AI"
              className={cn(errors.includeKw && 'border-red-400 bg-red-50')}
            />
            {errors.includeKw && <p className="text-xs text-red-500">{errors.includeKw.message}</p>}
          </div>

          <div className="space-y-1.5">
            <label className="text-[11px] font-bold uppercase tracking-wide text-gray-500">Exclude Keywords</label>
            <Input {...register('excludeKw')} placeholder="Junior, Intern, .NET" />
          </div>

          <div className="p-3 bg-gray-50 border border-gray-200 rounded-lg text-xs text-gray-500">
            Pre-loaded: Anthropic · OpenAI · Google DeepMind · Mistral · Cohere · Scale AI · Hugging Face · +38 more
          </div>

          <div className="flex justify-between pt-4">
            <Button type="button" variant="outline" onClick={onBack}>← Back</Button>
            <Button type="submit" className="bg-indigo-600 hover:bg-indigo-700 text-white" disabled={saving}>
              {saving ? 'Saving...' : 'Finish Setup →'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}
