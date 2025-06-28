'use client'

import React from 'react'
import { SignInButton, SignUpButton, UserButton, useUser } from '@clerk/clerk-react'
import HeroSectionOne from '@/components/ui/hero-section-demo-1'

const HomeHeader: React.FC = () => {
  const { isSignedIn, user } = useUser()

  return (
    <div className="min-h-screen bg-background w-full">
      <HeroSectionOne />
    </div>
  )
}

export default HomeHeader 