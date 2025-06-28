
import React from 'react'
import { SignIn, SignUp } from '@clerk/clerk-react'

const ClerkAuthPage: React.FC = () => {
  return (
    <div className='flex justify-center items-center h-screen'>
        <SignIn />
    </div>
  )
}

export default ClerkAuthPage