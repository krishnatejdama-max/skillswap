'use client'

import Link from 'next/link'
import { useAuth } from '@/context/AuthContext'
import { Button } from '@/components/ui/button'
import { LogOut, Zap } from 'lucide-react'

export default function Navbar() {
  const { user, logout } = useAuth()

  return (
    <nav className="border-b bg-white sticky top-0 z-50">
      <div className="max-w-6xl mx-auto px-4 h-14 flex items-center justify-between">
        <Link href={user ? '/dashboard' : '/'} className="flex items-center gap-2 font-bold text-blue-600">
          <Zap className="h-5 w-5" />
          SkillSwap
        </Link>

        {user ? (
          <div className="flex items-center gap-1 sm:gap-3">
            <Link href="/dashboard">
              <Button variant="ghost" size="sm">Browse</Button>
            </Link>
            <Link href="/skills">
              <Button variant="ghost" size="sm">My Skills</Button>
            </Link>
            <Link href="/swap-requests">
              <Button variant="ghost" size="sm">Requests</Button>
            </Link>
            <Link href="/profile">
              <Button variant="ghost" size="sm">Profile</Button>
            </Link>
            <Button variant="ghost" size="sm" onClick={logout} className="gap-2 text-gray-500">
              <LogOut className="h-4 w-4" />
              <span className="hidden sm:inline">Logout</span>
            </Button>
          </div>
        ) : (
          <div className="flex items-center gap-2">
            <Link href="/login">
              <Button variant="ghost" size="sm">Log in</Button>
            </Link>
            <Link href="/signup">
              <Button size="sm">Sign up</Button>
            </Link>
          </div>
        )}
      </div>
    </nav>
  )
}
