'use client'

interface NeuralDataDisplayProps {
  label: string
  value: string | number
  subValue?: string
  icon?: string
  color?: 'blue' | 'purple' | 'green' | 'pink'
  animationDelay?: number
}

export default function NeuralDataDisplay({
  label,
  value,
  subValue,
  icon,
  color = 'blue',
  animationDelay = 0
}: NeuralDataDisplayProps) {
  
  const getColorClasses = () => {
    const colors = {
      blue: 'text-electric-blue border-electric-blue/30',
      purple: 'text-neon-purple border-neon-purple/30',
      green: 'text-aurora-green border-aurora-green/30',
      pink: 'text-plasma-pink border-plasma-pink/30'
    }
    return colors[color]
  }

  return (
    <div 
      className={`
        card-3d glass-card-2025 p-6 data-glow magnetic-hover
        border ${getColorClasses().split(' ')[1]}
      `}
      style={{ animationDelay: `${animationDelay}s` }}
    >
      <div className="text-center">
        {icon && (
          <div className="text-5xl mb-4 filter drop-shadow-2xl">
            {icon}
          </div>
        )}
        <div className="text-sm font-bold text-holographic-silver/70 mb-2 uppercase tracking-wide">
          {label}
        </div>
        <div className={`text-4xl font-black mb-2 holographic-text ${getColorClasses().split(' ')[0]}`}>
          {value}
        </div>
        {subValue && (
          <div className={`text-xs font-semibold ${getColorClasses().split(' ')[0]}/80`}>
            {subValue}
          </div>
        )}
      </div>
    </div>
  )
}