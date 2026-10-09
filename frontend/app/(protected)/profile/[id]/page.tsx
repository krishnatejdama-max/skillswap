'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import { api } from '@/lib/api'
import { useAuth } from '@/context/AuthContext'
import type { User, Skill, SwapRequest } from '@/types'
import SkillCard from '@/components/SkillCard'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select } from '@/components/ui/select'
import { Card, CardContent } from '@/components/ui/card'
import { Loader2, MapPin, RefreshCcw } from 'lucide-react'

export default function PublicProfilePage() {
  const { id } = useParams<{ id: string }>()
  const { user: currentUser } = useAuth()

  const [profile, setProfile] = useState<User | null>(null)
  const [theirSkills, setTheirSkills] = useState<Skill[]>([])
  const [mySkills, setMySkills] = useState<Skill[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const [showForm, setShowForm] = useState(false)
  const [offeredSkillId, setOfferedSkillId] = useState('')
  const [requestedSkillId, setRequestedSkillId] = useState('')
  const [message, setMessage] = useState('')
  const [sending, setSending] = useState(false)
  const [swapError, setSwapError] = useState('')
  const [swapSuccess, setSwapSuccess] = useState(false)

  useEffect(() => {
    if (!currentUser) return
    Promise.all([
      api.get<User>(`/api/profiles/${id}`),
      api.get<Skill[]>(`/api/skills?user_id=${id}`),
      api.get<Skill[]>(`/api/skills?user_id=${currentUser.id}`),
    ])
      .then(([prof, their, mine]) => {
        setProfile(prof)
        setTheirSkills(their ?? [])
        setMySkills(mine ?? [])
      })
      .catch(() => setError('Failed to load profile.'))
      .finally(() => setLoading(false))
  }, [id, currentUser])

  async function handleSendRequest(e: React.FormEvent) {
    e.preventDefault()
    setSwapError('')
    if (!offeredSkillId) return setSwapError('Select a skill you are offering.')
    if (!requestedSkillId) return setSwapError('Select a skill you want from them.')
    setSending(true)
    try {
      await api.post<SwapRequest>('/api/swap-requests', {
        receiver_id: id,
        offered_skill_id: offeredSkillId,
        requested_skill_id: requestedSkillId,
        message: message.trim() || null,
      })
      setSwapSuccess(true)
      setShowForm(false)
    } catch (err: unknown) {
      setSwapError(err instanceof Error ? err.message : 'Failed to send request.')
    } finally {
      setSending(false)
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center py-16">
        <Loader2 className="h-6 w-6 animate-spin text-blue-500" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="flex items-center gap-3 text-red-600 bg-red-50 border border-red-200 rounded-md p-4">
          <span className="text-sm flex-1">{error}</span>
          <Button size="sm" variant="outline" onClick={() => window.location.reload()} className="gap-1 shrink-0">
            <RefreshCcw className="h-3 w-3" /> Retry
          </Button>
        </div>
      </div>
    )
  }

  const isOwnProfile = currentUser?.id === id
  const myOfferSkills = mySkills.filter((s) => s.type === 'offer')

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 space-y-6">
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-start justify-between gap-4">
            <div className="min-w-0">
              <h1 className="text-xl font-bold">{profile?.full_name || 'Anonymous'}</h1>
              {profile?.location && (
                <p className="text-sm text-muted-foreground flex items-center gap-1 mt-1">
                  <MapPin className="h-3 w-3 shrink-0" /> {profile.location}
                </p>
              )}
              {profile?.bio && (
                <p className="text-sm text-gray-600 mt-2 max-w-xl">{profile.bio}</p>
              )}
            </div>
            {!isOwnProfile && (
              <Button size="sm" onClick={() => { setShowForm(!showForm); setSwapError('') }} className="shrink-0">
                {showForm ? 'Cancel' : 'Propose Swap'}
              </Button>
            )}
          </div>

          {swapSuccess && (
            <p className="mt-4 text-sm text-green-700 bg-green-50 border border-green-200 rounded p-3">
              Swap request sent successfully!
            </p>
          )}

          {showForm && (
            <form onSubmit={handleSendRequest} className="mt-6 space-y-3 border-t pt-4">
              <h3 className="font-medium text-sm">Propose a Swap</h3>
              {swapError && (
                <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded p-2">{swapError}</p>
              )}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label>I&apos;m offering</Label>
                  <Select value={offeredSkillId} onChange={(e) => setOfferedSkillId(e.target.value)}>
                    <option value="">Select your skill…</option>
                    {myOfferSkills.map((s) => (
                      <option key={s.id} value={s.id}>{s.title}</option>
                    ))}
                  </Select>
                  {myOfferSkills.length === 0 && (
                    <p className="text-xs text-muted-foreground">Add an &quot;offering&quot; skill first.</p>
                  )}
                </div>
                <div className="space-y-1.5">
                  <Label>I want</Label>
                  <Select value={requestedSkillId} onChange={(e) => setRequestedSkillId(e.target.value)}>
                    <option value="">Select their skill…</option>
                    {theirSkills.map((s) => (
                      <option key={s.id} value={s.id}>{s.title}</option>
                    ))}
                  </Select>
                </div>
              </div>
              <div className="space-y-1.5">
                <Label>Message (optional)</Label>
                <Textarea placeholder="Say hi and explain why you'd like to swap…" value={message} onChange={(e) => setMessage(e.target.value)} rows={2} />
              </div>
              <Button type="submit" size="sm" disabled={sending}>
                {sending ? 'Sending…' : 'Send Request'}
              </Button>
            </form>
          )}
        </CardContent>
      </Card>

      <div>
        <h2 className="text-lg font-semibold mb-3">Skills</h2>
        {theirSkills.length === 0 ? (
          <p className="text-sm text-muted-foreground">No skills listed yet.</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {theirSkills.map((skill) => (
              <SkillCard key={skill.id} skill={skill} />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
