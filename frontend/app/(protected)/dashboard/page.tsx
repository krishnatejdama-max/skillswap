'use client'

import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import { api } from '@/lib/api'
import type { Skill } from '@/types'
import SkillCard from '@/components/SkillCard'
import { Select } from '@/components/ui/select'
import { Button } from '@/components/ui/button'
import { Loader2, RefreshCcw } from 'lucide-react'

export default function DashboardPage() {
  const [skills, setSkills] = useState<Skill[]>([])
  const [type, setType] = useState('')
  const [category, setCategory] = useState('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const fetchSkills = useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      const params = new URLSearchParams()
      if (type) params.set('type', type)
      if (category.trim()) params.set('category', category.trim())
      const q = params.toString() ? `?${params}` : ''
      const data = await api.get<Skill[]>(`/api/skills${q}`)
      setSkills(data ?? [])
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to load skills.')
    } finally {
      setLoading(false)
    }
  }, [type, category])

  useEffect(() => { fetchSkills() }, [fetchSkills])

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Browse Skills</h1>
        <Link href="/skills/new">
          <Button size="sm">+ Add Skill</Button>
        </Link>
      </div>

      <div className="flex flex-wrap gap-3 mb-6">
        <Select value={type} onChange={(e) => setType(e.target.value)} className="w-40">
          <option value="">All types</option>
          <option value="offer">Offering</option>
          <option value="want">Wanted</option>
        </Select>
        <input
          type="text"
          placeholder="Filter by category…"
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          className="flex h-10 rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        />
      </div>

      {error && (
        <div className="flex items-center gap-3 text-red-600 bg-red-50 border border-red-200 rounded-md p-4 mb-6">
          <span className="text-sm flex-1">{error}</span>
          <Button size="sm" variant="outline" onClick={fetchSkills} className="gap-1 shrink-0">
            <RefreshCcw className="h-3 w-3" /> Retry
          </Button>
        </div>
      )}

      {loading ? (
        <div className="flex justify-center py-16">
          <Loader2 className="h-6 w-6 animate-spin text-blue-500" />
        </div>
      ) : skills.length === 0 ? (
        <div className="text-center py-16 text-muted-foreground">
          <p className="mb-3">No skills found.</p>
          <Link href="/skills/new">
            <Button variant="outline" size="sm">Be the first to add one</Button>
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {skills.map((skill) => (
            <Link key={skill.id} href={`/profile/${skill.user_id}`} className="block hover:opacity-90 transition-opacity">
              <SkillCard skill={skill} />
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
