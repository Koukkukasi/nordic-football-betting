'use client'

import { ReactNode } from 'react'

interface FuturisticButtonProps {
  children: ReactNode
  onClick?: () => void
  variant?: 'primary' | 'secondary' | 'neon' | 'liquid'
  size?: 'sm' | 'md' | 'lg'
  disabled?: boolean
  className?: string
  glowColor?: 'blue' | 'purple' | 'green' | 'pink'
}

export default function FuturisticButton({
  children,
  onClick,
  variant = 'primary',
  size = 'md',
  disabled = false,
  className = '',
  glowColor = 'blue'
}: FuturisticButtonProps) {
  
  const getVariantClasses = () => {
    switch (variant) {
      case 'liquid':
        return 'liquid-button'
      case 'neon':
        return 'neon-border bg-transparent border border-electric-blue text-electric-blue hover:bg-electric-blue/10'
      case 'secondary':
        return 'glass-card-2025 border border-holographic-silver/30 text-holographic-silver hover:border-electric-blue/50'
      default:
        return 'nordic-button-primary'
    }
  }

  const getSizeClasses = () => {
    switch (size) {
      case 'sm':
        return 'px-4 py-2 text-sm'
      case 'lg':
        return 'px-8 py-4 text-lg'
      default:
        return 'px-6 py-3 text-base'
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
    <button
      onClick={onClick}
      disabled={disabled}
      className={`
        ${getVariantClasses()}
        ${getSizeClasses()}
        ${getGlowClasses()}
        ripple magnetic-hover font-bold uppercase tracking-wide
        transition-all duration-300 transform hover:scale-105
        disabled:opacity-50 disabled:cursor-not-allowed
        relative overflow-hidden
        ${className}
      `}
    >
      {children}
    </button>
  )
}