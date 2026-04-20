'use client'

import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import Link from 'next/link'
import { Button } from '@/components/ui/button'

interface StreamingEvaluationProps {
  completion: string
  isLoading: boolean
}

export function StreamingEvaluation({ completion, isLoading }: StreamingEvaluationProps) {
  if (!completion && !isLoading) return null

  const scoreMatch = completion.match(/SCORE:\s*(\d+\.?\d*)/)
  const score = scoreMatch ? parseFloat(scoreMatch[1]) : null

  const isDone = !isLoading && completion.length > 0

  function scoreColor(s: number) {
    if (s >= 4.0) return 'bg-green-100 text-green-800 border-green-300'
    if (s >= 3.0) return 'bg-yellow-100 text-yellow-800 border-yellow-300'
    return 'bg-red-100 text-red-800 border-red-300'
  }

  return (
    <div className="space-y-4">
      {isLoading && !completion && (
        <div className="flex items-center gap-2 text-gray-500 text-sm">
          <span className="animate-spin inline-block w-4 h-4 border-2 border-indigo-400 border-t-transparent rounded-full" />
          Analyzing...
        </div>
      )}

      {score !== null && (
        <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full border text-sm font-semibold ${scoreColor(score)}`}>
          Score: {score.toFixed(1)} / 5.0
        </div>
      )}

      {completion && (
        <div className="prose prose-sm max-w-none text-gray-800">
          <ReactMarkdown remarkPlugins={[remarkGfm]}>
            {completion}
          </ReactMarkdown>
        </div>
      )}

      {isDone && (
        <div className="pt-2 border-t border-gray-200 flex items-center gap-3">
          <p className="text-sm text-green-700 font-medium">Evaluation complete.</p>
          <Link href="/applications">
            <Button variant="outline" size="sm">
              View saved report
            </Button>
          </Link>
        </div>
      )}
    </div>
  )
}
