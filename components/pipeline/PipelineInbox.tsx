'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import type { PipelineItem } from '@/lib/generated/prisma'

const STATUS_STYLES: Record<string, string> = {
  pending: 'bg-gray-100 text-gray-700',
  evaluating: 'bg-yellow-100 text-yellow-800',
  done: 'bg-green-100 text-green-800',
  error: 'bg-red-100 text-red-800',
}

export function PipelineInbox() {
  const router = useRouter()
  const [items, setItems] = useState<PipelineItem[]>([])
  const [loading, setLoading] = useState(true)
  const [urlInput, setUrlInput] = useState('')
  const [bulkInput, setBulkInput] = useState('')
  const [showBulk, setShowBulk] = useState(false)
  const [addError, setAddError] = useState('')

  useEffect(() => {
    fetch('/api/pipeline')
      .then((r) => r.json())
      .then((data) => {
        if (Array.isArray(data)) setItems(data)
      })
      .catch(() => toast.error('Failed to load pipeline'))
      .finally(() => setLoading(false))
  }, [])

  const addUrl = async (url: string): Promise<PipelineItem | null> => {
    const res = await fetch('/api/pipeline', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ url: url.trim() }),
    })
    if (!res.ok) {
      const data = await res.json().catch(() => ({}))
      throw new Error(data.error ?? `Failed with status ${res.status}`)
    }
    return res.json()
  }

  const handleAddSingle = async (e: React.FormEvent) => {
    e.preventDefault()
    setAddError('')
    const trimmed = urlInput.trim()
    if (!trimmed) return

    try {
      const item = await addUrl(trimmed)
      if (item) {
        setItems((prev) => [...prev, item])
        setUrlInput('')
        toast.success('URL added to pipeline')
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Failed to add URL'
      setAddError(msg)
    }
  }

  const handleBulkPaste = async () => {
    setAddError('')
    const urls = bulkInput
      .split('\n')
      .map((u) => u.trim())
      .filter(Boolean)

    if (urls.length === 0) return

    const results = await Promise.allSettled(urls.map((u) => addUrl(u)))
    const added: PipelineItem[] = []
    let failCount = 0

    for (const result of results) {
      if (result.status === 'fulfilled' && result.value) {
        added.push(result.value)
      } else {
        failCount++
      }
    }

    if (added.length > 0) {
      setItems((prev) => [...prev, ...added])
      toast.success(`Added ${added.length} URL${added.length > 1 ? 's' : ''}`)
    }
    if (failCount > 0) {
      toast.error(`${failCount} URL${failCount > 1 ? 's' : ''} failed (duplicate or invalid)`)
    }
    setBulkInput('')
    setShowBulk(false)
  }

  const handleDelete = async (id: string) => {
    try {
      await fetch(`/api/pipeline?id=${id}`, { method: 'DELETE' })
      setItems((prev) => prev.filter((item) => item.id !== id))
      toast.success('Removed from pipeline')
    } catch {
      toast.error('Failed to delete item')
    }
  }

  const evaluateItem = async (item: PipelineItem) => {
    setItems((prev) =>
      prev.map((i) => (i.id === item.id ? { ...i, status: 'evaluating' } : i))
    )

    try {
      const res = await fetch('/api/evaluate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: item.url }),
      })

      if (!res.ok || !res.body) {
        throw new Error('Evaluate request failed')
      }

      const reader = res.body.getReader()
      const decoder = new TextDecoder()
      let accumulated = ''

      while (true) {
        const { done, value } = await reader.read()
        if (done) break
        accumulated += decoder.decode(value, { stream: true })
      }

      const reportIdMatch = accumulated.match(/\nREPORT_ID:([\w-]+)$/)
      const reportId = reportIdMatch ? reportIdMatch[1] : null

      setItems((prev) =>
        prev.map((i) => (i.id === item.id ? { ...i, status: 'done' } : i))
      )

      if (reportId) {
        router.push(`/reports/${reportId}`)
      } else {
        toast.success('Evaluation complete')
      }
    } catch {
      setItems((prev) =>
        prev.map((i) => (i.id === item.id ? { ...i, status: 'error' } : i))
      )
      toast.error('Evaluation failed')
    }
  }

  const processAllPending = async () => {
    const pending = items.filter((i) => i.status === 'pending')
    if (pending.length === 0) {
      toast.info('No pending items')
      return
    }
    for (const item of pending) {
      await evaluateItem(item)
    }
  }

  if (loading) {
    return (
      <div className="flex-1 overflow-y-auto p-7">
        <p className="text-sm text-gray-500">Loading pipeline...</p>
      </div>
    )
  }

  return (
    <div className="flex-1 overflow-y-auto p-7 space-y-6 max-w-3xl">
      {/* Add single URL */}
      <form onSubmit={handleAddSingle} className="flex gap-2">
        <input
          type="url"
          value={urlInput}
          onChange={(e) => setUrlInput(e.target.value)}
          placeholder="https://..."
          className="flex-1 rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
        />
        <button
          type="submit"
          className="rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700 disabled:opacity-60"
        >
          Add
        </button>
        <button
          type="button"
          onClick={() => setShowBulk((v) => !v)}
          className="rounded-md border border-gray-300 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50"
        >
          Paste multiple URLs
        </button>
      </form>

      {addError && <p className="text-sm text-red-600">{addError}</p>}

      {/* Bulk paste */}
      {showBulk && (
        <div className="space-y-2">
          <textarea
            value={bulkInput}
            onChange={(e) => setBulkInput(e.target.value)}
            placeholder="Paste one URL per line..."
            rows={6}
            className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 resize-y"
          />
          <div className="flex gap-2">
            <button
              type="button"
              onClick={handleBulkPaste}
              className="rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700"
            >
              Add all
            </button>
            <button
              type="button"
              onClick={() => { setShowBulk(false); setBulkInput('') }}
              className="rounded-md border border-gray-300 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Process all pending */}
      {items.some((i) => i.status === 'pending') && (
        <button
          type="button"
          onClick={processAllPending}
          className="rounded-md bg-green-600 px-4 py-2 text-sm font-medium text-white hover:bg-green-700"
        >
          Process all pending ({items.filter((i) => i.status === 'pending').length})
        </button>
      )}

      {/* Item cards */}
      {items.length === 0 ? (
        <p className="text-sm text-gray-500">No items in pipeline. Add a URL to get started.</p>
      ) : (
        <div className="space-y-3">
          {items.map((item) => (
            <div
              key={item.id}
              className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm flex items-center gap-4"
            >
              <div className="flex-1 min-w-0">
                <p
                  className="text-sm font-medium text-gray-900 truncate"
                  title={item.url}
                >
                  {item.url}
                </p>
                <p className="text-xs text-gray-400 mt-0.5">
                  {new Date(item.createdAt).toLocaleDateString()}
                </p>
              </div>

              <span
                className={`shrink-0 inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${STATUS_STYLES[item.status] ?? STATUS_STYLES.pending}`}
              >
                {item.status}
              </span>

              <button
                type="button"
                onClick={() => evaluateItem(item)}
                disabled={item.status === 'evaluating' || item.status === 'done'}
                className="shrink-0 rounded-md bg-indigo-50 px-3 py-1.5 text-xs font-medium text-indigo-700 hover:bg-indigo-100 disabled:opacity-40 disabled:cursor-not-allowed"
              >
                {item.status === 'evaluating' ? 'Evaluating...' : 'Evaluate'}
              </button>

              <button
                type="button"
                onClick={() => handleDelete(item.id)}
                aria-label="Remove"
                className="shrink-0 rounded-md p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50"
              >
                ×
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
