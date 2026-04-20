'use client'

import { useState, useMemo } from 'react'
import Link from 'next/link'
import { ChevronUp, ChevronDown, ChevronsUpDown, Download } from 'lucide-react'
import { scoreColorClass } from '@/lib/dashboard-utils'
import {
  filterByStatus,
  filterByScore,
  sortApplications,
  CANONICAL_STATUSES,
  type ApplicationWithReport,
  type SortKey,
  type SortDir,
} from '@/lib/applications-utils'

interface ApplicationsTableProps {
  initialApplications: ApplicationWithReport[]
}

export function ApplicationsTable({ initialApplications }: ApplicationsTableProps) {
  const [applications, setApplications] = useState<ApplicationWithReport[]>(initialApplications)
  const [selectedStatuses, setSelectedStatuses] = useState<string[]>([])
  const [scoreMin, setScoreMin] = useState<string>('')
  const [scoreMax, setScoreMax] = useState<string>('')
  const [sortKey, setSortKey] = useState<SortKey>('num')
  const [sortDir, setSortDir] = useState<SortDir>('desc')
  const [editingStatus, setEditingStatus] = useState<string | null>(null)

  const filtered = useMemo(() => {
    let result = applications
    result = filterByStatus(result, selectedStatuses)
    result = filterByScore(
      result,
      scoreMin !== '' ? parseFloat(scoreMin) : null,
      scoreMax !== '' ? parseFloat(scoreMax) : null,
    )
    result = sortApplications(result, sortKey, sortDir)
    return result
  }, [applications, selectedStatuses, scoreMin, scoreMax, sortKey, sortDir])

  function toggleStatus(status: string) {
    setSelectedStatuses((prev) =>
      prev.includes(status) ? prev.filter((s) => s !== status) : [...prev, status],
    )
  }

  function handleSort(key: SortKey) {
    if (sortKey === key) {
      setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'))
    } else {
      setSortKey(key)
      setSortDir('asc')
    }
  }

  function SortIcon({ col }: { col: SortKey }) {
    if (sortKey !== col) return <ChevronsUpDown className="inline w-3 h-3 ml-1 text-gray-300" />
    return sortDir === 'asc' ? (
      <ChevronUp className="inline w-3 h-3 ml-1 text-indigo-500" />
    ) : (
      <ChevronDown className="inline w-3 h-3 ml-1 text-indigo-500" />
    )
  }

  async function handleStatusChange(id: string, newStatus: string) {
    // optimistic update
    setApplications((prev) =>
      prev.map((a) => (a.id === id ? { ...a, status: newStatus } : a)),
    )
    setEditingStatus(null)

    try {
      const res = await fetch(`/api/applications/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      })
      if (!res.ok) {
        // revert on failure
        setApplications(initialApplications)
      }
    } catch {
      setApplications(initialApplications)
    }
  }

  function exportCsv() {
    const headers = ['#', 'Date', 'Company', 'Role', 'Score', 'Status', 'Report', 'Notes']
    const rows = filtered.map((a) => [
      a.num,
      new Date(a.createdAt).toISOString().slice(0, 10),
      `"${a.company.replace(/"/g, '""')}"`,
      `"${a.role.replace(/"/g, '""')}"`,
      a.score != null ? a.score.toFixed(1) : '',
      a.status,
      a.report?.id ? `${window.location.origin}/reports/${a.report.id}` : '',
      `"${(a.notes ?? '').replace(/"/g, '""')}"`,
    ])
    const csv = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n')
    const blob = new Blob([csv], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'applications.csv'
    a.click()
    URL.revokeObjectURL(url)
  }

  const columns: { label: string; key: SortKey }[] = [
    { label: '#', key: 'num' },
    { label: 'Company', key: 'company' },
    { label: 'Role', key: 'role' },
    { label: 'Score', key: 'score' },
    { label: 'Status', key: 'status' },
  ]

  return (
    <div className="p-6 space-y-4">
      {/* Filters */}
      <div className="bg-white rounded-lg border border-gray-200 p-4 space-y-3">
        {/* Status chips */}
        <div className="flex flex-wrap gap-2">
          {CANONICAL_STATUSES.map((s) => (
            <button
              key={s}
              onClick={() => toggleStatus(s)}
              className={`px-3 py-1 rounded-full text-xs font-medium border transition-colors ${
                selectedStatuses.includes(s)
                  ? 'bg-indigo-600 text-white border-indigo-600'
                  : 'bg-white text-gray-600 border-gray-300 hover:border-indigo-400'
              }`}
            >
              {s}
            </button>
          ))}
          {selectedStatuses.length > 0 && (
            <button
              onClick={() => setSelectedStatuses([])}
              className="px-3 py-1 rounded-full text-xs font-medium border border-gray-200 text-gray-400 hover:text-gray-600"
            >
              Clear
            </button>
          )}
        </div>

        {/* Score range + export */}
        <div className="flex items-center gap-3 flex-wrap">
          <span className="text-xs text-gray-500 font-medium">Score:</span>
          <input
            type="number"
            min={0}
            max={5}
            step={0.1}
            placeholder="Min"
            value={scoreMin}
            onChange={(e) => setScoreMin(e.target.value)}
            className="w-20 border border-gray-300 rounded px-2 py-1 text-xs"
          />
          <span className="text-xs text-gray-400">—</span>
          <input
            type="number"
            min={0}
            max={5}
            step={0.1}
            placeholder="Max"
            value={scoreMax}
            onChange={(e) => setScoreMax(e.target.value)}
            className="w-20 border border-gray-300 rounded px-2 py-1 text-xs"
          />

          <div className="ml-auto">
            <button
              onClick={exportCsv}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium border border-gray-300 rounded-md text-gray-600 hover:bg-gray-50 transition-colors"
            >
              <Download className="w-3.5 h-3.5" />
              Export CSV
            </button>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200 text-sm">
          <thead className="bg-gray-50">
            <tr>
              {columns.map(({ label, key }) => (
                <th
                  key={key}
                  onClick={() => handleSort(key)}
                  className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide cursor-pointer select-none hover:text-gray-800"
                >
                  {label}
                  <SortIcon col={key} />
                </th>
              ))}
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">
                Date
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">
                Report
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">
                Notes
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-100">
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={8} className="px-4 py-8 text-center text-sm text-gray-400">
                  No applications match the current filters.
                </td>
              </tr>
            ) : (
              filtered.map((app) => (
                <tr key={app.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-4 py-3 text-gray-400 font-mono text-xs">{app.num}</td>
                  <td className="px-4 py-3 font-medium text-gray-900">{app.company}</td>
                  <td className="px-4 py-3 text-gray-600 max-w-[200px] truncate">{app.role}</td>
                  <td className="px-4 py-3">
                    {app.score != null ? (
                      <span
                        className={`inline-block px-2 py-0.5 rounded-full text-xs font-semibold ${scoreColorClass(app.score)}`}
                      >
                        {app.score.toFixed(1)}
                      </span>
                    ) : (
                      <span className="text-gray-300">—</span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    {editingStatus === app.id ? (
                      <select
                        autoFocus
                        defaultValue={app.status}
                        onChange={(e) => handleStatusChange(app.id, e.target.value)}
                        onBlur={() => setEditingStatus(null)}
                        className="text-xs border border-indigo-300 rounded px-1 py-0.5 bg-white"
                      >
                        {CANONICAL_STATUSES.map((s) => (
                          <option key={s} value={s}>
                            {s}
                          </option>
                        ))}
                      </select>
                    ) : (
                      <button
                        onClick={() => setEditingStatus(app.id)}
                        className="text-xs text-gray-600 hover:text-indigo-600 hover:underline cursor-pointer"
                        title="Click to edit status"
                      >
                        {app.status}
                      </button>
                    )}
                  </td>
                  <td className="px-4 py-3 text-xs text-gray-500">
                    {new Date(app.createdAt).toISOString().slice(0, 10)}
                  </td>
                  <td className="px-4 py-3">
                    {app.report?.id ? (
                      <Link
                        href={`/reports/${app.report.id}`}
                        className="text-indigo-600 hover:text-indigo-800 hover:underline font-medium text-xs"
                      >
                        View
                      </Link>
                    ) : (
                      <span className="text-gray-300">—</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-xs text-gray-500 max-w-[200px] truncate">
                    {app.notes ?? '—'}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <p className="text-xs text-gray-400">
        {filtered.length} of {applications.length} applications
      </p>
    </div>
  )
}
