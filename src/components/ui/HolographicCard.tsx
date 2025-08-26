'use client'

import { ReactNode } from 'react'

interface HolographicCardProps {
  children: ReactNode
  className?: string
  variant?: 'glass' | 'neon' | 'data' | 'floating'
  glowColor?: 'blue' | 'purple' | 'green' | 'pink'
  hover3d?: boolean
}

export default function HolographicCard({
  children,
  className = '',
  variant = 'glass',
  glowColor = 'blue',
  hover3d = true
}: HolographicCardProps) {
  
  const getVariantClasses = () => {
    switch (variant) {
      case 'neon':
        return 'neon-border glass-card-2025'
      case 'data':
        return 'glass-card-2025 data-glow'
      case 'floating':
        return 'glass-card-2025 float-animation'
      default:
        return 'glass-card-2025'
    }
  }

  const getGlowClasses = () => {
    const glows = {
      blue: 'hover:shadow-[var(--glow-blue)]',
      purple: 'hover:shadow-[var(--glow-purple)]',
      green: 'hover:shadow-[var(--glow-green)]',
      pink: 'hover:shadow-[var(--glow-pink)]'
    }
    return glows[glowColor]
  }

  return (
    <div
      className={`
        ${getVariantClasses()}
        ${getGlowClasses()}
        ${hover3d ? 'card-3d magnetic-hover' : ''}
        transition-all duration-300
        ${className}
      `}
    >
      {children}
    </div>
  )
}