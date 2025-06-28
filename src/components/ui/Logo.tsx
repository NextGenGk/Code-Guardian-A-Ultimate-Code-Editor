import React from 'react'

interface LogoProps {
  size?: 'sm' | 'md' | 'lg'
  className?: string
  variant?: 'white' | 'black'
}

const Logo: React.FC<LogoProps> = ({ size = 'md', className = '', variant = 'white' }) => {
  const sizeClasses = {
    sm: 'w-6 h-6',
    md: 'w-8 h-8',
    lg: 'w-10 h-10'
  }

  const bgColor = variant === 'black' ? 'bg-black' : 'bg-white'

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <div className={`${sizeClasses[size]} rounded-lg ${bgColor} flex items-center justify-center shadow-sm`}>
        {/* Logo image */}
        <img 
          src="/logo.png"
          alt="CodeSprint Logo"
          className={`${size === 'sm' ? 'w-4 h-4' : size === 'md' ? 'w-5 h-5' : 'w-6 h-6'} object-contain`}
        />
      </div>
    </div>
  )
}

export default Logo 