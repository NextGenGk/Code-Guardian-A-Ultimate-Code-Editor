import React from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { TooltipProvider } from '@/components/ui/tooltip'
import { Toaster } from '@/components/ui/toaster'
import { Toaster as Sonner } from '@/components/ui/sonner'
import { ThemeProvider } from '@/components/theme-provider'
import { ReactQueryProvider } from '@/components/providers/react-query-provider'
import { useUser } from '@clerk/clerk-react'
import CodeEditor from '@/components/CodeEditor'
import HomeHeader from '@/components/layout/HomeHeader'
import SignInPage from '@/components/auth/SignInPage'
import SignUpPage from '@/components/auth/SignUpPage'

function HomePage() {
  const { isSignedIn } = useUser()

  return <HomeHeader />
}

function CodeEditorPage() {
  const { isSignedIn } = useUser()

  if (!isSignedIn) {
    return <HomeHeader />
  }

  return <CodeEditor />
}

function App() {
  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="light"
      enableSystem
      disableTransitionOnChange
    >
      <ReactQueryProvider>
        <TooltipProvider>
          <Router>
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/editor" element={<CodeEditorPage />} />
              <Route path="/sign-in" element={<SignInPage />} />
              <Route path="/sign-up" element={<SignUpPage />} />
              <Route path="*" element={<HomePage />} />
            </Routes>
          </Router>
          <Toaster />
          <Sonner />
        </TooltipProvider>
      </ReactQueryProvider>
    </ThemeProvider>
  )
}

export default App 