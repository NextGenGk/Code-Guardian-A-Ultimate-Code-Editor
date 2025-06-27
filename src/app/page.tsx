
'use client'

import { useUser } from '@clerk/clerk-react'
import CodeEditor from '@/components/CodeEditor'
import ClerkAuthPage from '@/components/auth/ClerkAuthPage'

export default function Home() {
  const { isLoaded, isSignedIn } = useUser()

  if (!isLoaded) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-lg">Loading...</div>
      </div>
    )
  }

  if (!isSignedIn) {
    return <ClerkAuthPage />
  }

  return <CodeEditor />
}
