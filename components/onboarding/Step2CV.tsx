'use client'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { profileStep2Schema, type ProfileStep2 } from '@/lib/validations'
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'
import { AlertCircle, Upload, Loader2, CheckCircle2 } from 'lucide-react'
import { cn } from '@/lib/utils'
import { toast } from 'sonner'

interface Props { onNext: (d: ProfileStep2) => void; onBack: () => void; defaultValues?: ProfileStep2 }

const ACCEPTED = '.md,.txt,.pdf,.docx'

export function Step2CV({ onNext, onBack, defaultValues }: Props) {
  const [parsing, setParsing] = useState(false)
  const [parsedFilename, setParsedFilename] = useState<string | null>(null)

  const { register, handleSubmit, setValue, watch, formState: { errors } } = useForm<ProfileStep2>({
    resolver: zodResolver(profileStep2Schema),
    defaultValues,
  })

  const cvValue = watch('cvMarkdown') || ''

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    const filename = file.name.toLowerCase()

    // Plain text / markdown — read directly, no server round-trip needed
    if (filename.endsWith('.md') || filename.endsWith('.txt')) {
      const reader = new FileReader()
      reader.onload = (ev) => {
        setValue('cvMarkdown', ev.target?.result as string, { shouldValidate: true })
        setParsedFilename(file.name)
      }
      reader.readAsText(file)
      return
    }

    // PDF / DOCX — send to server for parsing
    setParsing(true)
    try {
      const formData = new FormData()
      formData.append('file', file)

      const res = await fetch('/api/parse-cv', {
        method: 'POST',
        body: formData,
      })

      if (!res.ok) {
        const err = await res.json()
        throw new Error(err.error || 'Failed to parse file')
      }

      const { markdown } = await res.json()
      setValue('cvMarkdown', markdown, { shouldValidate: true })
      setParsedFilename(file.name)
      toast.success('CV extracted successfully', {
        description: `${file.name} converted to text`,
      })
    } catch (err) {
      toast.error('Could not parse file', { description: String(err) })
    } finally {
      setParsing(false)
    }
  }

  return (
    <div className="w-full max-w-lg">
      <div className="bg-white border border-gray-200 rounded-2xl shadow-sm p-10">
        <h2 className="text-xl font-bold mb-1">Your CV</h2>
        <p className="text-sm text-gray-500 mb-8">Used for fit scoring and tailored PDF generation per role</p>

        {errors.cvMarkdown && (
          <div className="flex items-center gap-2 bg-red-50 border border-red-200 rounded-lg px-4 py-3 mb-6 text-sm text-red-600 font-medium">
            <AlertCircle size={15} /> Please add your CV before continuing.
          </div>
        )}

        <form onSubmit={handleSubmit(onNext)} className="space-y-4">
          <label className={cn(
            'flex flex-col items-center gap-2 border-2 border-dashed rounded-xl p-6 cursor-pointer transition-colors',
            parsing && 'pointer-events-none opacity-60',
            errors.cvMarkdown ? 'border-red-300 bg-red-50' : 'border-gray-200 hover:border-indigo-400 hover:bg-indigo-50'
          )}>
            {parsing ? (
              <>
                <Loader2 size={22} className="text-indigo-500 animate-spin" />
                <div className="text-sm font-semibold text-indigo-600">Extracting text from file…</div>
                <div className="text-xs text-gray-400">This takes a few seconds</div>
              </>
            ) : parsedFilename ? (
              <>
                <CheckCircle2 size={22} className="text-green-500" />
                <div className="text-sm font-semibold text-green-600">{parsedFilename} loaded</div>
                <div className="text-xs text-gray-400">Click to replace</div>
              </>
            ) : (
              <>
                <Upload size={22} className="text-gray-400" />
                <div className="text-sm font-semibold text-gray-600">
                  <span className="text-indigo-600">Click to upload</span> or drag and drop
                </div>
                <div className="text-xs text-gray-400">.pdf · .docx · .md · .txt accepted</div>
              </>
            )}
            <input type="file" accept={ACCEPTED} className="hidden" onChange={handleFileUpload} />
          </label>

          <div className="text-center text-xs text-gray-400">— or paste your CV text directly —</div>

          <div className="space-y-1.5">
            <label className="text-[11px] font-bold uppercase tracking-wide text-gray-500">CV Content *</label>
            <Textarea
              {...register('cvMarkdown')}
              rows={12}
              placeholder={`# Rahul Sharma\nrahul@example.com · linkedin.com/in/rahulsharma\n\n## Experience\n**Senior AI Product Manager · Flipkart** (2022–2024)\n- Led 0→1 AI recommendation engine serving 50M users`}
              className={cn('font-mono text-xs', errors.cvMarkdown && 'border-red-400 bg-red-50')}
            />
            <p className="text-xs text-gray-400 text-right">{cvValue.length} chars</p>
          </div>

          <div className="flex justify-between pt-4">
            <Button type="button" variant="outline" onClick={onBack}>← Back</Button>
            <Button type="submit" className="bg-indigo-600 hover:bg-indigo-700 text-white" disabled={parsing}>
              Continue →
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}
