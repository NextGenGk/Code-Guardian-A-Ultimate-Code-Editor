import React from 'react'
import { SignUp } from '@clerk/clerk-react'
import { useNavigate } from 'react-router-dom'

const SignUpPage: React.FC = () => {
  const navigate = useNavigate()

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-800 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-white mb-2">Join CodeSprint</h1>
          <p className="text-gray-400">Create your account to get started</p>
        </div>
        
        <div className="flex justify-center">
          <SignUp />
        </div>
        
        <div className="text-center mt-6">
          <button 
            onClick={() => navigate('/')}
            className="text-gray-400 hover:text-white transition-colors"
          >
            ← Back to Home
          </button>
        </div>
      </div>
    </div>
  )
}

export default SignUpPage 