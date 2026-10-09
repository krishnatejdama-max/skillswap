'use client'

import { useState, useEffect, useCallback } from 'react'
import { api } from '@/lib/api'
import { useAuth } from '@/context/AuthContext'
import type { SwapRequest } from '@/types'
import SwapRequestCard from '@/components/SwapRequestCard'
import { Select } from '@/components/ui/select'
import { Button } from '@/components/ui/button'
import { Loader2, RefreshCcw } from 'lucide-react'
import Link from 'next/link'

export default function SwapRequestsPage() {
  const { user } = useAuth()
  const [requests, setRequests] = useState<SwapRequest[]>([])
  const [direction, setDirection] = useState('all')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const fetchRequests = useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      const data = await api.get<SwapRequest[]>(`/api/swap-requests?direction=${direction}`)
      setRequests(data ?? [])
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to load requests.')
    } finally {
      setLoading(false)
    }
  }, [direction])

  useEffect(() => { fetchRequests() }, [fetchRequests])

  async function handleStatusChange(id: string, status: 'accepted' | 'declined' | 'completed') {
    try {
      const updated = await api.patch<SwapRequest>(`/api/swap-requests/${id}/status`, { status })
      setRequests((prev) => prev.map((r) => (r.id === id ? updated : r)))
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : 'Failed to update request.')
    }
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Swap Requests</h1>
        <Select value={direction} onChange={(e) => setDirection(e.target.value)} className="w-40">
          <option value="all">All</option>
          <option value="received">Received</option>
          <option value="sent">Sent</option>
        </Select>
      </div>

      {error && (
        <div className="flex items-center gap-3 text-red-600 bg-red-50 border border-red-200 rounded-md p-4 mb-6">
          <span className="text-sm flex-1">{error}</span>
          <Button size="sm" variant="outline" onClick={fetchRequests} className="gap-1 shrink-0">
            <RefreshCcw className="h-3 w-3" /> Retry
          </Button>
        </div>
      )}

      {loading ? (
        <div className="flex justify-center py-16">
          <Loader2 className="h-6 w-6 animate-spin text-blue-500" />
        </div>
      ) : requests.length === 0 ? (
        <div className="text-center py-16 text-muted-foreground">
          <p className="mb-1">No swap requests yet.</p>
          <p className="text-sm mb-4">Browse skills and propose a swap from someone&apos;s profile.</p>
          <Link href="/dashboard">
            <Button variant="outline" size="sm">Browse Skills</Button>
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {requests.map((req) => (
            <SwapRequestCard
              key={req.id}
              request={req}
              currentUserId={user?.id ?? ''}
              onStatusChange={handleStatusChange}
            />
          ))}
        </div>
      )}
    </div>
  )
}
