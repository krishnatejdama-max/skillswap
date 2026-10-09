'use client'

import { useState, useEffect } from 'react'
import { api } from '@/lib/api'
import { useAuth } from '@/context/AuthContext'
import type { User } from '@/types'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Loader2, Pencil, Check, X } from 'lucide-react'

export default function MyProfilePage() {
  const { user: authUser, loading: authLoading } = useAuth()
  const [profile, setProfile] = useState<User | null>(null)
  const [editing, setEditing] = useState(false)
  const [fullName, setFullName] = useState('')
  const [location, setLocation] = useState('')
  const [bio, setBio] = useState('')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    if (authLoading) return
    api
      .get<User>('/api/profiles/me')
      .then((data) => {
        setProfile(data)
        setFullName(data.full_name ?? '')
        setLocation(data.location ?? '')
        setBio(data.bio ?? '')
      })
      .catch(() => setError('Failed to load profile.'))
      .finally(() => setLoading(false))
  }, [authLoading])

  async function handleSave() {
    setSaving(true)
    setError('')
    try {
      const updated = await api.patch<User>('/api/profiles/me', {
        full_name: fullName.trim() || null,
        location: location.trim() || null,
        bio: bio.trim() || null,
      })
      setProfile(updated)
      setEditing(false)
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to save profile.')
    } finally {
      setSaving(false)
    }
  }

  function handleCancel() {
    setFullName(profile?.full_name ?? '')
    setLocation(profile?.location ?? '')
    setBio(profile?.bio ?? '')
    setEditing(false)
    setError('')
  }

  if (loading) {
    return (
      <div className="flex justify-center py-16">
        <Loader2 className="h-6 w-6 animate-spin text-blue-500" />
      </div>
    )
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>My Profile</CardTitle>
            {!editing && (
              <Button size="sm" variant="outline" onClick={() => setEditing(true)} className="gap-1">
                <Pencil className="h-3 w-3" /> Edit
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {error && (
            <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-md p-3">{error}</p>
          )}

          <div className="space-y-1">
            <Label>Email</Label>
            <p className="text-sm text-muted-foreground">{authUser?.email}</p>
          </div>

          {editing ? (
            <>
              <div className="space-y-1.5">
                <Label htmlFor="fullName">Full name</Label>
                <Input id="fullName" value={fullName} onChange={(e) => setFullName(e.target.value)} />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="location">Location</Label>
                <Input id="location" placeholder="e.g. Auckland, NZ" value={location} onChange={(e) => setLocation(e.target.value)} />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="bio">Bio</Label>
                <Textarea id="bio" placeholder="Tell others a bit about yourself…" value={bio} onChange={(e) => setBio(e.target.value)} rows={3} />
              </div>
              <div className="flex gap-2">
                <Button size="sm" onClick={handleSave} disabled={saving} className="gap-1">
                  <Check className="h-3 w-3" />
                  {saving ? 'Saving…' : 'Save'}
                </Button>
                <Button size="sm" variant="outline" onClick={handleCancel} className="gap-1">
                  <X className="h-3 w-3" /> Cancel
                </Button>
              </div>
            </>
          ) : (
            <>
              <div className="space-y-1">
                <Label>Full name</Label>
                <p className="text-sm">{profile?.full_name ?? <span className="italic text-muted-foreground">Not set</span>}</p>
              </div>
              <div className="space-y-1">
                <Label>Location</Label>
                <p className="text-sm">{profile?.location ?? <span className="italic text-muted-foreground">Not set</span>}</p>
              </div>
              <div className="space-y-1">
                <Label>Bio</Label>
                <p className="text-sm">{profile?.bio ?? <span className="italic text-muted-foreground">Not set</span>}</p>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
