'use client'

import { useState } from 'react'
import { toast } from 'sonner'
import type { Profile } from '@/lib/generated/prisma'

type Tab = 'profile' | 'cv' | 'portals'

interface SettingsTabsProps {
  profile: Profile
}

export function SettingsTabs({ profile: initialProfile }: SettingsTabsProps) {
  const [activeTab, setActiveTab] = useState<Tab>('profile')
  const [profile, setProfile] = useState(initialProfile)

  // Profile tab state
  const [fullName, setFullName] = useState(profile.fullName ?? '')
  const [location, setLocation] = useState(profile.location ?? '')
  const [targetRoles, setTargetRoles] = useState(profile.targetRoles ?? '')
  const [seniority, setSeniority] = useState(profile.seniority ?? '')
  const [salaryMin, setSalaryMin] = useState(String(profile.salaryMin ?? ''))
  const [salaryMax, setSalaryMax] = useState(String(profile.salaryMax ?? ''))
  const [currency, setCurrency] = useState(profile.currency ?? 'INR')
  const [superpower, setSuperpower] = useState(profile.superpower ?? '')
  const [profileSaving, setProfileSaving] = useState(false)

  // CV tab state
  const [cvMarkdown, setCvMarkdown] = useState(profile.cvMarkdown ?? '')
  const [cvSaving, setCvSaving] = useState(false)

  // Portals tab state
  const [portalsYaml, setPortalsYaml] = useState(profile.portalsYaml ?? '')
  const [portalsSaving, setPortalsSaving] = useState(false)

  const putProfile = async (data: Record<string, unknown>) => {
    const res = await fetch('/api/profile', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    })
    if (!res.ok) {
      const body = await res.json().catch(() => ({}))
      throw new Error(body.error ? JSON.stringify(body.error) : 'Save failed')
    }
    return res.json()
  }

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault()
    setProfileSaving(true)
    try {
      const updated = await putProfile({
        fullName,
        location,
        targetRoles,
        seniority,
        salaryMin: salaryMin ? Number(salaryMin) : undefined,
        salaryMax: salaryMax ? Number(salaryMax) : undefined,
        currency,
        superpower,
      })
      setProfile(updated)
      toast.success('Profile saved')
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Save failed')
    } finally {
      setProfileSaving(false)
    }
  }

  const handleSaveCv = async (e: React.FormEvent) => {
    e.preventDefault()
    setCvSaving(true)
    try {
      const updated = await putProfile({ cvMarkdown })
      setProfile(updated)
      toast.success('CV saved')
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Save failed')
    } finally {
      setCvSaving(false)
    }
  }

  const handleSavePortals = async (e: React.FormEvent) => {
    e.preventDefault()
    setPortalsSaving(true)
    try {
      const updated = await putProfile({ portalsYaml })
      setProfile(updated)
      toast.success('Portals config saved')
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Save failed')
    } finally {
      setPortalsSaving(false)
    }
  }

  const tabs: { id: Tab; label: string }[] = [
    { id: 'profile', label: 'Profile' },
    { id: 'cv', label: 'CV' },
    { id: 'portals', label: 'Portals' },
  ]

  return (
    <div className="flex-1 overflow-y-auto p-7">
      <div className="max-w-2xl">
        {/* Tab buttons */}
        <div className="flex gap-1 border-b border-gray-200 mb-6">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-2 text-sm font-medium border-b-2 -mb-px transition-colors ${
                activeTab === tab.id
                  ? 'border-indigo-600 text-indigo-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Profile tab */}
        {activeTab === 'profile' && (
          <form onSubmit={handleSaveProfile} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                <input
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
                <input
                  type="text"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Target Roles</label>
              <input
                type="text"
                value={targetRoles}
                onChange={(e) => setTargetRoles(e.target.value)}
                placeholder="e.g. Head of AI, Staff Engineer"
                className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Seniority</label>
              <input
                type="text"
                value={seniority}
                onChange={(e) => setSeniority(e.target.value)}
                placeholder="e.g. Senior, Principal, Director"
                className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
              />
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Salary Min (₹ LPA)</label>
                <input
                  type="number"
                  value={salaryMin}
                  onChange={(e) => setSalaryMin(e.target.value)}
                  className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Salary Max (₹ LPA)</label>
                <input
                  type="number"
                  value={salaryMax}
                  onChange={(e) => setSalaryMax(e.target.value)}
                  className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Currency</label>
                <input
                  type="text"
                  value={currency}
                  onChange={(e) => setCurrency(e.target.value)}
                  placeholder="INR"
                  className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Superpower</label>
              <textarea
                value={superpower}
                onChange={(e) => setSuperpower(e.target.value)}
                placeholder="What makes you unique as a candidate..."
                rows={4}
                className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 resize-y"
              />
            </div>

            <button
              type="submit"
              disabled={profileSaving}
              className="rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700 disabled:opacity-60"
            >
              {profileSaving ? 'Saving...' : 'Save Profile'}
            </button>
          </form>
        )}

        {/* CV tab */}
        {activeTab === 'cv' && (
          <form onSubmit={handleSaveCv} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">CV (Markdown)</label>
              <textarea
                value={cvMarkdown}
                onChange={(e) => setCvMarkdown(e.target.value)}
                rows={20}
                className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm font-mono shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 resize-y"
                style={{ minHeight: '400px' }}
              />
            </div>
            <button
              type="submit"
              disabled={cvSaving}
              className="rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700 disabled:opacity-60"
            >
              {cvSaving ? 'Saving...' : 'Save CV'}
            </button>
          </form>
        )}

        {/* Portals tab */}
        {activeTab === 'portals' && (
          <form onSubmit={handleSavePortals} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Portals Config (YAML)
              </label>
              <textarea
                value={portalsYaml}
                onChange={(e) => setPortalsYaml(e.target.value)}
                rows={20}
                className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm font-mono shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 resize-y"
                style={{ minHeight: '400px' }}
              />
            </div>
            <button
              type="submit"
              disabled={portalsSaving}
              className="rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700 disabled:opacity-60"
            >
              {portalsSaving ? 'Saving...' : 'Save Portals Config'}
            </button>
          </form>
        )}
      </div>
    </div>
  )
}
