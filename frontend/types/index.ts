export interface User {
  id: string
  email: string
  full_name: string | null
  location: string | null
  bio: string | null
}

export interface Skill {
  id: string
  user_id: string
  title: string
  description: string | null
  category: string | null
  type: 'offer' | 'want'
  created_at: string
}

export interface SwapRequest {
  id: string
  requester_id: string
  receiver_id: string
  offered_skill_id: string
  requested_skill_id: string
  message: string | null
  status: 'pending' | 'accepted' | 'declined' | 'completed'
  created_at: string
}

export interface AuthResponse {
  access_token: string | null
  user: User
  message: string
}
