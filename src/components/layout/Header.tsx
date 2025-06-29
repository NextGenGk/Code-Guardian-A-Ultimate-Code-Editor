'use client'

import React from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Plus, Clock, Save } from 'lucide-react'
import { useUser, UserButton } from '@clerk/clerk-react'
import Logo from '@/components/ui/Logo'

interface HeaderProps {
  timeLeft: number
  lastSaved: Date | null
  hasSubmitted: boolean
  onAddQuestion?: () => void
  appTheme?: 'light' | 'dark'
  compact?: boolean
}

const Header: React.FC<HeaderProps> = ({
  timeLeft,
  lastSaved,
  hasSubmitted,
  onAddQuestion,
  appTheme = 'light',
  compact = false
}) => {
  const { user } = useUser()
  const navigate = useNavigate()

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
    <header className={`w-full ${compact ? 'h-12 py-0 px-4' : 'h-16 py-2 px-6'} flex items-center justify-between bg-background border-b border-gray-200 transition-all duration-200`}>
      <div className="flex items-center">
        {/* Logo and app name on the left */}
        <Logo className="h-8 w-8 mr-2" />
        <span className="font-bold text-lg tracking-wide">CodeSprint</span>
      </div>
      <div className="flex items-center space-x-4">
        {/* Timer */}
        <div className="flex items-center space-x-2 bg-gray-50 dark:bg-gray-800 px-3 py-2 rounded-lg">
          <Clock className={`w-4 h-4 ${appTheme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`} />
          <span className={`font-mono text-sm font-medium ${timeLeft < 300 ? 'text-red-500' : appTheme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
            {formatTime(timeLeft)}
          </span>
        </div>

        {/* Last saved */}
        <div className="flex items-center space-x-2 bg-gray-50 dark:bg-gray-800 px-3 py-2 rounded-lg">
          <Save className={`w-4 h-4 ${appTheme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`} />
          <span className={`text-sm font-medium ${appTheme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
            {formatLastSaved(lastSaved)}
          </span>
        </div>

        {/* Submission status */}
        {hasSubmitted && (
          <Badge variant="default" className={`${appTheme === 'dark' ? 'bg-green-900 text-green-200 border-green-700' : 'bg-green-100 text-green-800 border-green-200'} border`}>
            Submitted
          </Badge>
        )}

        {/* Admin controls */}
        {isAdmin && onAddQuestion && (
          <Button onClick={onAddQuestion} size="sm" variant="outline" className={`${appTheme === 'dark' ? 'border-gray-600 text-gray-300 hover:bg-gray-700 hover:border-gray-500' : 'border-gray-300 hover:border-gray-400'} transition-colors`}>
            <Plus className="w-4 h-4 mr-2" />
            Add Question
          </Button>
        )}

        {/* User menu */}
        <div className="flex items-center space-x-4 bg-gray-50 dark:bg-gray-800 px-4 py-2 rounded-lg">
          <span className={`text-sm font-medium ${appTheme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
            {user?.emailAddresses[0]?.emailAddress}
          </span>
          <div className="w-px h-6 bg-gray-300 dark:bg-gray-600"></div>
          <UserButton 
            appearance={{
              elements: {
                avatarBox: "w-8 h-8"
              }
            }}
          />
        </div>
      </div>
    </header>
  )
}

export default Header