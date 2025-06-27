
'use client'

import React from 'react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Plus, Clock, Save } from 'lucide-react'
import { useUser, UserButton } from '@clerk/clerk-react'

interface HeaderProps {
  timeLeft: number
  lastSaved: Date | null
  hasSubmitted: boolean
  onAddQuestion?: () => void
}

const Header: React.FC<HeaderProps> = ({
  timeLeft,
  lastSaved,
  hasSubmitted,
  onAddQuestion
}) => {
  const { user } = useUser()

  // Check if user is admin based on metadata or role
  const isAdmin = user?.publicMetadata?.role === 'admin' || false

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600)
    const minutes = Math.floor((seconds % 3600) / 60)
    const secs = seconds % 60
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  }

  const formatLastSaved = (date: Date | null) => {
    if (!date) return 'Never'
    const now = new Date()
    const diff = Math.floor((now.getTime() - date.getTime()) / 1000)
    if (diff < 60) return 'Just now'
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`
    return date.toLocaleTimeString()
  }

  return (
    <header className="bg-white shadow-sm border-b">
      <div className="flex items-center justify-between px-6 py-4">
        <div className="flex items-center space-x-6">
          <h1 className="text-xl font-semibold text-gray-900">Code Practice Platform</h1>
          
          {isAdmin && (
            <Badge variant="secondary" className="bg-purple-100 text-purple-800">
              Admin
            </Badge>
          )}
        </div>

        <div className="flex items-center space-x-6">
          {/* Timer */}
          <div className="flex items-center space-x-2">
            <Clock className="w-4 h-4 text-gray-500" />
            <span className={`font-mono text-sm ${timeLeft < 300 ? 'text-red-600' : 'text-gray-700'}`}>
              {formatTime(timeLeft)}
            </span>
          </div>

          {/* Last saved */}
          <div className="flex items-center space-x-2">
            <Save className="w-4 h-4 text-gray-500" />
            <span className="text-sm text-gray-600">
              {formatLastSaved(lastSaved)}
            </span>
          </div>

          {/* Submission status */}
          {hasSubmitted && (
            <Badge variant="default" className="bg-green-100 text-green-800">
              Submitted
            </Badge>
          )}

          {/* Admin controls */}
          {isAdmin && onAddQuestion && (
            <Button onClick={onAddQuestion} size="sm" variant="outline">
              <Plus className="w-4 h-4 mr-1" />
              Add Question
            </Button>
          )}

          {/* User menu */}
          <div className="flex items-center space-x-3">
            <span className="text-sm text-gray-700">
              {user?.emailAddresses[0]?.emailAddress}
            </span>
            <UserButton 
              appearance={{
                elements: {
                  avatarBox: "w-8 h-8"
                }
              }}
            />
          </div>
        </div>
      </div>
    </header>
  )
}

export default Header
