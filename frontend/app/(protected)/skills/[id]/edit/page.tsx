'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { api } from '@/lib/api'
import { useAuth } from '@/context/AuthContext'
import type { Skill } from '@/types'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select } from '@/components/ui/select'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Loader2 } from 'lucide-react'

export default function EditSkillPage() {
  const router = useRouter()
  const { id } = useParams<{ id: string }>()
  const { user } = useAuth()
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [category, setCategory] = useState('')
  const [type, setType] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [fetching, setFetching] = useState(true)

  useEffect(() => {
    if (!user) return
    api
      .get<Skill[]>(`/api/skills?user_id=${user.id}`)
      .then((skills) => {
        const skill = skills?.find((s) => s.id === id)
        if (!skill) { router.replace('/skills'); return }
        setTitle(skill.title)
        setDescription(skill.description ?? '')
        setCategory(skill.category ?? '')
        setType(skill.type)
      })
      .catch(() => router.replace('/skills'))
      .finally(() => setFetching(false))
  }, [user, id, router])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    if (!title.trim()) return setError('Title is required.')
    setLoading(true)
    try {
      await api.patch<Skill>(`/api/skills/${id}`, {
        title: title.trim(),
        description: description.trim() || null,
        category: category.trim() || null,
        type: type || undefined,
      })
      router.push('/skills')
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to update skill.')
    } finally {
      setLoading(false)
    }
  }

  if (fetching) {
    return (
      <div className="flex justify-center py-16">
        <Loader2 className="h-6 w-6 animate-spin text-blue-500" />
      </div>
    )
  }

  return (
    <div className="max-w-lg mx-auto px-4 py-8">
      <Card>
        <CardHeader><CardTitle>Edit Skill</CardTitle></CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-md p-3">{error}</p>
            )}
            <div className="space-y-1.5">
              <Label htmlFor="title">Title *</Label>
              <Input id="title" value={title} onChange={(e) => setTitle(e.target.value)} required />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="type">Type *</Label>
              <Select id="type" value={type} onChange={(e) => setType(e.target.value)}>
                <option value="offer">I&apos;m offering this skill</option>
                <option value="want">I want to learn this</option>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="category">Category</Label>
              <Input id="category" value={category} onChange={(e) => setCategory(e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="description">Description</Label>
              <Textarea id="description" value={description} onChange={(e) => setDescription(e.target.value)} rows={3} />
            </div>
            <div className="flex gap-3 pt-2">
              <Button type="submit" disabled={loading}>{loading ? 'Saving…' : 'Save Changes'}</Button>
              <Button type="button" variant="outline" onClick={() => router.back()}>Cancel</Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
