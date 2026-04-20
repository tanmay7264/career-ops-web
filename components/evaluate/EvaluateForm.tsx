'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'

interface EvaluateFormProps {
  onComplete?: (reportId: string | null) => void
  onLoadingChange?: (loading: boolean) => void
  onCompletionChange?: (completion: string) => void
}

export function EvaluateForm({ onComplete, onLoadingChange, onCompletionChange }: EvaluateFormProps) {
  const [url, setUrl] = useState('')
  const [jdText, setJdText] = useState('')
  const [validationError, setValidationError] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setValidationError('')

    if (!url.trim() && !jdText.trim()) {
      setValidationError('Please provide a job URL or paste the job description text.')
      return
    }

    setIsLoading(true)
    onLoadingChange?.(true)
    onCompletionChange?.('')

    try {
      const res = await fetch('/api/evaluate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          url: url.trim() || undefined,
          jdText: jdText.trim() || undefined,
        }),
      })

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}))
        setValidationError(errorData?.error ?? `Request failed with status ${res.status}`)
        return
      }

      if (!res.body) {
        setValidationError('No response body received.')
        return
      }

      const reader = res.body.getReader()
      const decoder = new TextDecoder()
      let accumulated = ''

      while (true) {
        const { done, value } = await reader.read()
        if (done) break

        const chunk = decoder.decode(value, { stream: true })

        accumulated += chunk
        onCompletionChange?.(accumulated)
      }

      // Extract REPORT_ID from full accumulated text
      const reportIdMatch = accumulated.match(/\nREPORT_ID:([a-zA-Z0-9]+)$/)
      const reportId = reportIdMatch ? reportIdMatch[1] : null
      // Strip the REPORT_ID line from displayed text
      const cleanText = accumulated.replace(/\nREPORT_ID:[a-zA-Z0-9]+$/, '')
      onCompletionChange?.(cleanText)
      onComplete?.(reportId)
    } catch (err) {
      setValidationError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setIsLoading(false)
      onLoadingChange?.(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div>
        <label htmlFor="job-url" className="block text-sm font-medium text-gray-700 mb-1">
          Job URL
        </label>
        <input
          id="job-url"
          type="url"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          placeholder="https://..."
          className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
        />
      </div>

      <div>
        <label htmlFor="jd-text" className="block text-sm font-medium text-gray-700 mb-1">
          Job Description (paste text)
        </label>
        <textarea
          id="jd-text"
          value={jdText}
          onChange={(e) => setJdText(e.target.value)}
          placeholder="Paste the full job description here..."
          rows={10}
          className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 resize-y"
          style={{ minHeight: '200px' }}
        />
      </div>

      {validationError && (
        <p className="text-sm text-red-600">{validationError}</p>
      )}

      <Button
        type="submit"
        disabled={isLoading}
        className="bg-indigo-600 hover:bg-indigo-700 text-white disabled:opacity-60"
      >
        {isLoading ? 'Evaluating...' : 'Evaluate'}
      </Button>
    </form>
  )
}
