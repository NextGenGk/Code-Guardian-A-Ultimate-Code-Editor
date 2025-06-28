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
}

const Header: React.FC<HeaderProps> = ({
  timeLeft,
  lastSaved,
  hasSubmitted,
  onAddQuestion,
  appTheme = 'light'
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
    <header className={`${appTheme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} shadow-sm border-b transition-colors duration-200`}>
      <div className="flex items-center justify-between px-6 py-4">
        <div className="flex items-center space-x-6">
          {user ? (
            <Link to="/" className={`flex items-center space-x-2 text-xl font-semibold ${appTheme === 'dark' ? 'text-white hover:text-gray-300' : 'text-gray-900 hover:text-gray-800'} transition-colors`}>
              <Logo size="md" variant={appTheme === 'dark' ? 'white' : 'black'} />
              <span>CodeSprint</span>
            </Link>
          ) : (
            <div className="flex items-center space-x-2">
              <Logo size="md" variant={appTheme === 'dark' ? 'white' : 'black'} />
              <h1 className={`text-xl font-semibold ${appTheme === 'dark' ? 'text-white' : 'text-gray-900'}`}>Code</h1>
            </div>
          )}
          
          {isAdmin && (
            <Badge variant="secondary" className={`${appTheme === 'dark' ? 'bg-purple-900 text-purple-200' : 'bg-purple-100 text-purple-800'}`}>
              Admin
            </Badge>
          )}
        </div>

        <div className="flex items-center space-x-6">
          {/* Timer */}
          <div className="flex items-center space-x-2">
            <Clock className={`w-4 h-4 ${appTheme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`} />
            <span className={`font-mono text-sm ${timeLeft < 300 ? 'text-red-500' : appTheme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
              {formatTime(timeLeft)}
            </span>
          </div>

          {/* Last saved */}
          <div className="flex items-center space-x-2">
            <Save className={`w-4 h-4 ${appTheme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`} />
            <span className={`text-sm ${appTheme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
              {formatLastSaved(lastSaved)}
            </span>
          </div>

          {/* Submission status */}
          {hasSubmitted && (
            <Badge variant="default" className={`${appTheme === 'dark' ? 'bg-green-900 text-green-200' : 'bg-green-100 text-green-800'}`}>
              Submitted
            </Badge>
          )}

          {/* Admin controls */}
          {isAdmin && onAddQuestion && (
            <div className="flex space-x-2">
              <Button onClick={() => navigate('/')} size="sm" variant="outline" className={`${appTheme === 'dark' ? 'border-gray-600 text-gray-300 hover:bg-gray-700' : ''}`}>
                Home
              </Button>
              <Button onClick={onAddQuestion} size="sm" variant="outline" className={`${appTheme === 'dark' ? 'border-gray-600 text-gray-300 hover:bg-gray-700' : ''}`}>
                <Plus className="w-4 h-4 mr-1" />
                Add Question
              </Button>
            </div>
          )}

          {/* Non-admin users get a home button too */}
          {!isAdmin && (
            <Button onClick={() => navigate('/')} size="sm" variant="outline" className={`${appTheme === 'dark' ? 'border-gray-600 text-gray-300 hover:bg-gray-700' : ''}`}>
              Home
            </Button>
          )}

          {/* User menu */}
          <div className="flex items-center space-x-3">
            <span className={`text-sm ${appTheme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
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