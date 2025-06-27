
import React from 'react'
import { SignIn, SignUp } from '@clerk/clerk-react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

const ClerkAuthPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-2xl text-center">DSA Code Editor</CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="signin" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="signin">Sign In</TabsTrigger>
              <TabsTrigger value="signup">Sign Up</TabsTrigger>
            </TabsList>
            
            <TabsContent value="signin" className="mt-4">
              <SignIn 
                fallbackRedirectUrl="/"
                appearance={{
                  elements: {
                    formButtonPrimary: 'bg-primary text-primary-foreground hover:bg-primary/90',
                    card: 'shadow-none border-0 p-0',
                  }
                }}
              />
            </TabsContent>
            
            <TabsContent value="signup" className="mt-4">
              <SignUp 
                fallbackRedirectUrl="/"
                appearance={{
                  elements: {
                    formButtonPrimary: 'bg-primary text-primary-foreground hover:bg-primary/90',
                    card: 'shadow-none border-0 p-0',
                  }
                }}
              />
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  )
}

export default ClerkAuthPage
