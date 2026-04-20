'use client'

import { useState } from 'react'
import { EvaluateForm } from './EvaluateForm'
import { StreamingEvaluation } from './StreamingEvaluation'

export function EvaluatePageClient() {
  const [completion, setCompletion] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  return (
    <div className="flex-1 overflow-y-auto p-7 space-y-8">
      <div className="max-w-3xl">
        <EvaluateForm
          onComplete={(c) => setCompletion(c)}
          onLoadingChange={(l) => setIsLoading(l)}
          onCompletionChange={(c) => setCompletion(c)}
        />
      </div>

      {(isLoading || completion) && (
        <div className="max-w-3xl">
          <StreamingEvaluation completion={completion} isLoading={isLoading} />
        </div>
      )}
    </div>
  )
}
