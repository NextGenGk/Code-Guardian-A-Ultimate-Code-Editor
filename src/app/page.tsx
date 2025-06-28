'use client'

import { useUser } from '@clerk/clerk-react'
import CodeEditor from '@/components/CodeEditor'
import HomeHeader from '@/components/layout/HomeHeader'

export default function Home() {
  const { isLoaded, isSignedIn } = useUser()

  if (!isLoaded) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-lg">Loading...</div>
      </div>
    )
  }

  if (!isSignedIn) {
    return <HomeHeader />
  }

  return <CodeEditor />
}