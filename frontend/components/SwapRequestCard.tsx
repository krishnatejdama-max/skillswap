'use client'

import type { SwapRequest } from '@/types'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'

type StatusVariant = 'default' | 'success' | 'destructive' | 'warning' | 'outline' | 'secondary'

const STATUS_VARIANT: Record<string, StatusVariant> = {
  pending: 'warning',
  accepted: 'success',
  declined: 'destructive',
  completed: 'secondary',
}

interface Props {
  request: SwapRequest
  currentUserId: string
  onStatusChange: (id: string, status: 'accepted' | 'declined' | 'completed') => Promise<void>
}

export default function SwapRequestCard({ request, currentUserId, onStatusChange }: Props) {
  const isReceiver = request.receiver_id === currentUserId

  return (
    <Card>
      <CardContent className="pt-4 space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-xs text-muted-foreground font-medium uppercase tracking-wide">
            {isReceiver ? 'Received' : 'Sent'}
          </span>
          <Badge variant={STATUS_VARIANT[request.status] ?? 'outline'}>
            {request.status}
          </Badge>
        </div>

        <div className="text-xs space-y-1 text-muted-foreground">
          <p>Offering: <span className="text-foreground font-medium">{request.offered_skill_id}</span></p>
          <p>Requesting: <span className="text-foreground font-medium">{request.requested_skill_id}</span></p>
        </div>

        {request.message && (
          <p className="text-sm text-gray-700 bg-gray-50 rounded p-2 border">{request.message}</p>
        )}

        {request.status === 'pending' && isReceiver && (
          <div className="flex gap-2 pt-1">
            <Button size="sm" onClick={() => onStatusChange(request.id, 'accepted')}>Accept</Button>
            <Button size="sm" variant="outline" onClick={() => onStatusChange(request.id, 'declined')}>Decline</Button>
          </div>
        )}

        {request.status === 'accepted' && (
          <Button size="sm" variant="outline" onClick={() => onStatusChange(request.id, 'completed')}>
            Mark Complete
          </Button>
        )}
      </CardContent>
    </Card>
  )
}
