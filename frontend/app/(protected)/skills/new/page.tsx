'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { api } from '@/lib/api'
import type { Skill } from '@/types'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select } from '@/components/ui/select'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'

export default function NewSkillPage() {
  const router = useRouter()
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [category, setCategory] = useState('')
  const [type, setType] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    if (!title.trim()) return setError('Title is required.')
    if (!type) return setError('Please select a skill type.')
    setLoading(true)
    try {
      await api.post<Skill>('/api/skills', {
        title: title.trim(),
        description: description.trim() || null,
        category: category.trim() || null,
        type,
      })
      router.push('/skills')
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to create skill.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-lg mx-auto px-4 py-8">
      <Card>
        <CardHeader><CardTitle>Add a Skill</CardTitle></CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-md p-3">{error}</p>
            )}
            <div className="space-y-1.5">
              <Label htmlFor="title">Title *</Label>
              <Input id="title" placeholder="e.g. Python programming" value={title} onChange={(e) => setTitle(e.target.value)} required />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="type">Type *</Label>
              <Select id="type" value={type} onChange={(e) => setType(e.target.value)} required>
                <option value="">Select type…</option>
                <option value="offer">I&apos;m offering this skill</option>
                <option value="want">I want to learn this</option>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="category">Category</Label>
              <Input id="category" placeholder="e.g. Technology, Music, Languages" value={category} onChange={(e) => setCategory(e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="description">Description</Label>
              <Textarea id="description" placeholder="Describe your skill or what you're looking for…" value={description} onChange={(e) => setDescription(e.target.value)} rows={3} />
            </div>
            <div className="flex gap-3 pt-2">
              <Button type="submit" disabled={loading}>{loading ? 'Saving…' : 'Add Skill'}</Button>
              <Button type="button" variant="outline" onClick={() => router.back()}>Cancel</Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
