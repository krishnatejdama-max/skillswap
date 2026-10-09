'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/context/AuthContext'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card'

export default function SignupPage() {
  const { signup, user } = useAuth()
  const router = useRouter()
  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (user) router.replace('/dashboard')
  }, [user, router])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setMessage('')
    if (fullName.trim().length < 2) return setError('Full name must be at least 2 characters.')
    if (!email.includes('@')) return setError('Please enter a valid email address.')
    if (password.length < 8) return setError('Password must be at least 8 characters.')
    setLoading(true)
    try {
      const msg = await signup(email, password, fullName.trim())
      if (msg && msg !== 'OK') setMessage(msg)
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Signup failed. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex items-center justify-center p-4 py-16">
      <Card className="w-full max-w-sm">
        <CardHeader>
          <CardTitle>Create an account</CardTitle>
          <CardDescription>Join SkillSwap and start swapping</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-md p-3">{error}</p>
            )}
            {message && (
              <p className="text-sm text-blue-700 bg-blue-50 border border-blue-200 rounded-md p-3">{message}</p>
            )}
            <div className="space-y-1.5">
              <Label htmlFor="fullName">Full name</Label>
              <Input id="fullName" placeholder="Jane Smith" value={fullName} onChange={(e) => setFullName(e.target.value)} required />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" placeholder="you@example.com" value={email} onChange={(e) => setEmail(e.target.value)} required />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="password">Password</Label>
              <Input id="password" type="password" placeholder="••••••••" value={password} onChange={(e) => setPassword(e.target.value)} required />
              <p className="text-xs text-muted-foreground">Minimum 8 characters</p>
            </div>
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? 'Creating account…' : 'Create account'}
            </Button>
          </form>
          <p className="text-center text-sm text-muted-foreground mt-4">
            Already have an account?{' '}
            <Link href="/login" className="text-blue-600 hover:underline">Log in</Link>
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
