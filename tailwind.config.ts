import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        // 2025 Futuristic Color Palette
        'deep-space': '#0A0A0F',
        'space-gray': '#1A1B23',
        'electric-blue': '#00D4FF',
        'neon-purple': '#B026FF',
        'aurora-green': '#00FF94',
        'plasma-pink': '#FF006E',
        'holographic-silver': '#E8E8F0',
        
        // Nordic Blue Harmony (Primary Brand)
        'nordic-blue': {
          50: '#e6f2ff',
          100: '#cce6ff',
          200: '#99ccff',
          300: '#66b3ff',
          400: '#3399ff',
          500: '#0066cc', // Main brand color
          600: '#0052a3', // Hover state
          700: '#003d7a', // Dark accent
          800: '#002952',
          900: '#001429',
        },
        
        // Nordic Gold (Premium/Secondary)
        'nordic-gold': {
          50: '#fff9e6',
          100: '#fff3cc',
          200: '#ffe799',
          300: '#ffdb66',
          400: '#ffcf33',
          500: '#ffd700', // Main gold
          600: '#ffcd00', // Gold hover
          700: '#cc9900',
          800: '#997300',
          900: '#664d00',
        },

        // Country-Specific Colors
        'finnish-blue': '#003d82',
        'swedish-blue': '#006aa7',
        'swedish-yellow': '#fecc00',

        // Enhanced Gaming Colors - Softer
        'enhanced-odds': '#86b374',
        'regular-odds': '#6b7280',
        'premium-odds': '#8b5cf6',
        
        // Success states (winning bets) - Softer
        success: {
          50: '#f6f9f4',
          100: '#eaf2e6',
          200: '#d4e5cc',
          300: '#b8d5a8',
          400: '#9cc584',
          500: '#86b374', // Main success - muted sage
          600: '#6b8e5a',
          700: '#5a7a4e',
          800: '#4a6641',
          900: '#3a5235',
        },

        // Warning states (pending bets) - Muted
        warning: {
          50: '#fffbeb',
          100: '#fef8f0',
          200: '#feebc8',
          300: '#fbd38d',
          400: '#f5b855',
          500: '#ea9a3e', // Main warning - muted
          600: '#d4893b',
          700: '#b17127',
          800: '#8e5a1f',
          900: '#6b4318',
        },

        // Error states (losing bets)
        error: {
          50: '#fef2f2',
          100: '#fee2e2',
          200: '#fecaca',
          300: '#fca5a5',
          400: '#f87171',
          500: '#ef4444', // Main error
          600: '#dc2626',
          700: '#b91c1c',
          800: '#991b1b',
          900: '#7f1d1d',
        },

        // Live betting colors
        live: {
          50: '#fff7ed',
          100: '#ffedd5',
          200: '#fed7aa',
          300: '#fdba74',
          400: '#fb923c',
          500: '#ff6b35', // Main live color
          600: '#e55527',
          700: '#c2410c',
          800: '#9a3412',
          900: '#7c2d12',
        },

        // Diamond system colors
        diamond: {
          50: '#eff6ff',
          100: '#dbeafe',
          200: '#bfdbfe',
          300: '#93c5fd',
          400: '#60a5fa',
          500: '#3b82f6', // Main diamond blue
          600: '#2563eb',
          700: '#1d4ed8',
          800: '#1e40af',
          900: '#1e3a8a',
        },

        // Country highlight colors
        'finland-highlight': '#e6f2ff',
        'sweden-highlight': '#fff9e6',
      },

      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'sans-serif'],
        mono: ['JetBrains Mono', 'Monaco', 'Cascadia Code', 'monospace'],
        display: ['Inter', 'system-ui', 'sans-serif'],
      },

      fontSize: {
        'odds': ['1.125rem', { lineHeight: '1.2', letterSpacing: '-0.025em' }],
        'currency': ['1rem', { lineHeight: '1.4', letterSpacing: '0' }],
        'betpoints': ['1.25rem', { lineHeight: '1.3', fontWeight: '600' }],
      },

      animation: {
        // Nordic-themed animations
        'nordic-aurora': 'nordic-aurora 15s ease infinite',
        'sparkle': 'sparkle 1.5s ease-in-out infinite',
        'enhanced-pulse': 'enhanced-pulse 2s infinite',
        'live-heartbeat': 'live-heartbeat 1.5s ease-in-out infinite',
        'shimmer': 'shimmer 2s ease-in-out infinite',
        'pulse-derby': 'pulse-derby 2s ease-in-out infinite',
        
        // 2025 Futuristic animations
        'glitch': 'glitch 2s ease-in-out infinite',
        'holographic-shift': 'holographic-shift 3s ease-in-out infinite',
        'neon-pulse': 'neon-pulse 2s ease-in-out infinite',
        'neural-flow': 'neural-flow 4s linear infinite',
        'quantum-spin': 'quantum-spin 3s linear infinite',
        'data-stream': 'data-stream 1.5s ease-in-out infinite',
        
        // Betting-specific animations
        'odds-change': 'odds-change 0.3s ease-out',
        'bet-placed': 'bet-placed 0.6s ease-out',
        'diamond-collect': 'diamond-collect 1s ease-out',
      },

      keyframes: {
        // Aurora background effect
        'nordic-aurora': {
          '0%': { backgroundPosition: '0% 50%' },
          '50%': { backgroundPosition: '100% 50%' },
          '100%': { backgroundPosition: '0% 50%' },
        },
        
        // Diamond sparkle effect
        'sparkle': {
          '0%, 100%': { transform: 'scale(1) rotate(0deg)', opacity: '1' },
          '50%': { transform: 'scale(1.2) rotate(180deg)', opacity: '0.8' },
        },
        
        // Enhanced odds pulse
        'enhanced-pulse': {
          '0%': { boxShadow: '0 0 0 0 rgba(134, 179, 116, 0.4)' },
          '70%': { boxShadow: '0 0 0 10px rgba(134, 179, 116, 0)' },
          '100%': { boxShadow: '0 0 0 0 rgba(134, 179, 116, 0)' },
        },
        
        // Live match heartbeat
        'live-heartbeat': {
          '0%': { transform: 'scale(1)' },
          '14%': { transform: 'scale(1.1)' },
          '28%': { transform: 'scale(1)' },
          '42%': { transform: 'scale(1.1)' },
          '70%': { transform: 'scale(1)' },
        },
        
        // Premium shimmer effect
        'shimmer': {
          '0%': { transform: 'translateX(-100%)' },
          '100%': { transform: 'translateX(100%)' },
        },
        
        // Derby match pulse
        'pulse-derby': {
          '0%, 100%': { transform: 'scale(1)', opacity: '1' },
          '50%': { transform: 'scale(1.02)', opacity: '0.9' },
        },
        
        // Odds change animation
        'odds-change': {
          '0%': { transform: 'scale(1)', backgroundColor: 'transparent' },
          '50%': { transform: 'scale(1.03)', backgroundColor: 'rgba(134, 179, 116, 0.08)' },
          '100%': { transform: 'scale(1)', backgroundColor: 'transparent' },
        },
        
        // Bet placed confirmation
        'bet-placed': {
          '0%': { transform: 'scale(1)', backgroundColor: 'transparent' },
          '30%': { transform: 'scale(1.05)', backgroundColor: 'rgba(134, 179, 116, 0.1)' },
          '100%': { transform: 'scale(1)', backgroundColor: 'transparent' },
        },
        
        // Diamond collection effect
        'diamond-collect': {
          '0%': { transform: 'scale(1) translateY(0)', opacity: '1' },
          '50%': { transform: 'scale(1.5) translateY(-10px)', opacity: '0.8' },
          '100%': { transform: 'scale(0.8) translateY(-30px)', opacity: '0' },
        },
        
        // 2025 Futuristic keyframes
        'glitch': {
          '0%, 100%': { transform: 'translate(0)' },
          '20%': { transform: 'translate(-2px, 2px)' },
          '40%': { transform: 'translate(-2px, -2px)' },
          '60%': { transform: 'translate(2px, 2px)' },
          '80%': { transform: 'translate(2px, -2px)' },
        },
        
        'holographic-shift': {
          '0%, 100%': { 
            backgroundPosition: '0% 50%',
            filter: 'hue-rotate(0deg)'
          },
          '50%': { 
            backgroundPosition: '100% 50%',
            filter: 'hue-rotate(180deg)'
          },
        },
        
        'neon-pulse': {
          '0%, 100%': { 
            boxShadow: '0 0 20px var(--electric-blue)',
            filter: 'brightness(1)'
          },
          '50%': { 
            boxShadow: '0 0 30px var(--electric-blue), 0 0 40px var(--neon-purple)',
            filter: 'brightness(1.2)'
          },
        },
        
        'neural-flow': {
          '0%': { 
            backgroundPosition: '0% 0%',
            transform: 'translateX(-100%)'
          },
          '100%': { 
            backgroundPosition: '100% 100%',
            transform: 'translateX(100%)'
          },
        },
        
        'quantum-spin': {
          '0%': { 
            transform: 'rotateY(0deg) rotateX(0deg)',
            filter: 'hue-rotate(0deg)'
          },
          '100%': { 
            transform: 'rotateY(360deg) rotateX(360deg)',
            filter: 'hue-rotate(360deg)'
          },
        },
        
        'data-stream': {
          '0%, 100%': { 
            opacity: '0.3',
            transform: 'translateY(0px)'
          },
          '50%': { 
            opacity: '1',
            transform: 'translateY(-10px)'
          },
        },
      },

      spacing: {
        '18': '4.5rem',
        '88': '22rem',
        '128': '32rem',
      },

      borderRadius: {
        '4xl': '2rem',
      },

      boxShadow: {
        'nordic': '0 10px 15px -3px rgba(0, 102, 204, 0.08), 0 4px 6px -2px rgba(0, 102, 204, 0.04)',
        'betting': '0 10px 15px -3px rgba(0, 0, 0, 0.08), 0 4px 6px -2px rgba(0, 0, 0, 0.04)',
        'live': '0 0 20px rgba(255, 107, 53, 0.15)',
        'diamond': '0 4px 14px 0 rgba(59, 130, 246, 0.1)',
        'enhanced': '0 0 25px rgba(34, 197, 94, 0.12)',
        'premium': '0 0 30px rgba(139, 92, 246, 0.18)',
      },

      backdropBlur: {
        xs: '2px',
      },

      screens: {
        'xs': '475px',
        '3xl': '1680px',
      },

      // Safe area padding for mobile devices
      padding: {
        'safe-top': 'env(safe-area-inset-top)',
        'safe-bottom': 'env(safe-area-inset-bottom)',
        'safe-left': 'env(safe-area-inset-left)',
        'safe-right': 'env(safe-area-inset-right)',
      },

      // Aspect ratios for cards
      aspectRatio: {
        'match': '4 / 3',
        'bet-slip': '3 / 4',
        'country': '16 / 9',
      },

      // Gradient stops for Nordic themes - Softer
      backgroundImage: {
        'nordic-gradient': 'linear-gradient(-45deg, #0066cc, #006aa7, #003d82, #f5b855)',
        'finland-gradient': 'linear-gradient(135deg, #003d82, #f0f7ff)',
        'sweden-gradient': 'linear-gradient(135deg, #006aa7, #f5b855)',
        'diamond-gradient': 'linear-gradient(135deg, #3b82f6, #8b5cf6)',
        'enhanced-gradient': 'linear-gradient(135deg, #86b374, #6b8e5a)',
      },
    },
  },
  plugins: [
    // Add custom utilities for Nordic features
    function({ addUtilities }: any) {
      const newUtilities = {
        // Safe area utilities
        '.safe-area-padding-bottom': {
          paddingBottom: 'env(safe-area-inset-bottom)',
        },
        '.safe-area-padding-top': {
          paddingTop: 'env(safe-area-inset-top)',
        },
        
        // Nordic-specific utilities
        '.nordic-grid': {
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
          gap: '1.5rem',
        },
        
        '.country-grid': {
          display: 'grid',
          gridTemplateColumns: 'repeat(2, 1fr)',
          gap: '2rem',
        },
        
        '.odds-grid': {
          display: 'grid',
          gridTemplateColumns: 'repeat(3, 1fr)',
          gap: '0.75rem',
        },
        
        // Enhanced odds utilities - Softer
        '.enhanced-glow': {
          boxShadow: '0 0 20px rgba(134, 179, 116, 0.2)',
        },
        
        '.premium-glow': {
          boxShadow: '0 0 25px rgba(139, 92, 246, 0.5)',
        },
        
        // Country-specific utilities
        '.finnish-accent': {
          borderLeft: '4px solid #003d82',
          backgroundColor: '#e6f2ff',
        },
        
        '.swedish-accent': {
          borderLeft: '4px solid #006aa7',
          backgroundColor: '#fff9e6',
        },
        
        // Derby match styling
        '.derby-highlight': {
          background: 'linear-gradient(90deg, #ffd700, #fff, #ffd700)',
          border: '2px solid #ffd700',
          animation: 'pulse-derby 2s ease-in-out infinite',
        },
        
        // Live indicator
        '.live-indicator': {
          position: 'relative',
          '&::before': {
            content: '""',
            position: 'absolute',
            top: '0',
            left: '0',
            right: '0',
            height: '3px',
            backgroundColor: '#ff6b35',
            animation: 'live-heartbeat 1.5s ease-in-out infinite',
          },
        },
        
        // Shimmer effect for premium content
        '.shimmer': {
          position: 'relative',
          overflow: 'hidden',
          '&::before': {
            content: '""',
            position: 'absolute',
            top: '0',
            left: '-100%',
            width: '100%',
            height: '100%',
            background: 'linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.2), transparent)',
            animation: 'shimmer 2s ease-in-out infinite',
          },
        },
      };
      addUtilities(newUtilities);
    },
  ],
};

export default config;