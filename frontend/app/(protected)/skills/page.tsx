'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { api } from '@/lib/api'
import type { Skill } from '@/types'
import { useAuth } from '@/context/AuthContext'
import SkillCard from '@/components/SkillCard'
import { Button } from '@/components/ui/button'
import { Loader2, Pencil, Trash2, RefreshCcw } from 'lucide-react'

export default function MySkillsPage() {
  const { user } = useAuth()
  const [skills, setSkills] = useState<Skill[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [deleting, setDeleting] = useState<string | null>(null)

  async function fetchSkills() {
    if (!user) return
    setLoading(true)
    setError('')
    try {
      const data = await api.get<Skill[]>(`/api/skills?user_id=${user.id}`)
      setSkills(data ?? [])
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to load skills.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchSkills() }, [user])

  async function handleDelete(id: string) {
    if (!confirm('Delete this skill?')) return
    setDeleting(id)
    try {
      await api.delete(`/api/skills/${id}`)
      setSkills((prev) => prev.filter((s) => s.id !== id))
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : 'Failed to delete skill.')
    } finally {
      setDeleting(null)
    }
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">My Skills</h1>
        <Link href="/skills/new">
          <Button size="sm">+ Add Skill</Button>
        </Link>
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
          <p className="mb-3">You haven&apos;t added any skills yet.</p>
          <Link href="/skills/new">
            <Button variant="outline" size="sm">Add your first skill</Button>
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {skills.map((skill) => (
            <SkillCard
              key={skill.id}
              skill={skill}
              actions={
                <div className="flex gap-2 mt-auto">
                  <Link href={`/skills/${skill.id}/edit`}>
                    <Button size="sm" variant="outline" className="gap-1">
                      <Pencil className="h-3 w-3" /> Edit
                    </Button>
                  </Link>
                  <Button
                    size="sm"
                    variant="destructive"
                    onClick={() => handleDelete(skill.id)}
                    disabled={deleting === skill.id}
                    className="gap-1"
                  >
                    <Trash2 className="h-3 w-3" />
                    {deleting === skill.id ? 'Deleting…' : 'Delete'}
                  </Button>
                </div>
              }
            />
          ))}
        </div>
      )}
    </div>
  )
}
