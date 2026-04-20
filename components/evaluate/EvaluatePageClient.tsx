'use client'

import { useState } from 'react'
import { EvaluateForm } from './EvaluateForm'
import { StreamingEvaluation } from './StreamingEvaluation'

export function EvaluatePageClient() {
  const [completion, setCompletion] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [reportId, setReportId] = useState<string | null>(null)

  return (
    <div className="flex-1 overflow-y-auto p-7 space-y-8">
      <div className="max-w-3xl">
        <EvaluateForm
          onComplete={(id) => setReportId(id)}
          onLoadingChange={(l) => setIsLoading(l)}
          onCompletionChange={(c) => setCompletion(c)}
        />
      </div>

      {(isLoading || completion) && (
        <div className="max-w-3xl">
          <StreamingEvaluation completion={completion} isLoading={isLoading} reportId={reportId} />
        </div>
      )}
    </div>
  )
}
