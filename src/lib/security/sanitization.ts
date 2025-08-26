import { z } from 'zod'

/**
 * Sanitizes HTML input to prevent XSS attacks
 */
export function sanitizeHtml(input: string): string {
  if (typeof input !== 'string') {
    return String(input)
  }

  // Remove script tags and their content
  const scriptRegex = /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi
  let sanitized = input.replace(scriptRegex, '')

  // Remove dangerous HTML attributes
  const dangerousAttributes = [
    'onload', 'onclick', 'onmouseover', 'onfocus', 'onblur', 'onchange',
    'onsubmit', 'onreset', 'onkeydown', 'onkeyup', 'onkeypress',
    'onmousedown', 'onmouseup', 'onmousemove', 'onmouseout',
    'ondblclick', 'oncontextmenu', 'oninput', 'oninvalid',
    'onselect', 'ondrag', 'ondrop', 'onscroll'
  ]

  const attributeRegex = new RegExp(`\\s(${dangerousAttributes.join('|')})\\s*=\\s*["'][^"']*["']`, 'gi')
  sanitized = sanitized.replace(attributeRegex, '')

  // Remove javascript: and data: URLs
  const jsUrlRegex = /href\s*=\s*["']?\s*javascript:/gi
  const dataUrlRegex = /src\s*=\s*["']?\s*data:/gi
  sanitized = sanitized.replace(jsUrlRegex, 'href="#"')
  sanitized = sanitized.replace(dataUrlRegex, 'src=""')

  // Remove potentially dangerous tags
  const dangerousTags = [
    'script', 'object', 'embed', 'link', 'style', 'meta', 'iframe',
    'frame', 'frameset', 'applet', 'base', 'form', 'input', 'button',
    'textarea', 'select', 'option'
  ]

  const tagRegex = new RegExp(`<\/?(?:${dangerousTags.join('|')})(?:\s[^>]*)?\/?>`, 'gi')
  sanitized = sanitized.replace(tagRegex, '')

  return sanitized.trim()
}

/**
 * Sanitizes text input for safe database storage
 */
export function sanitizeText(input: string, maxLength: number = 1000): string {
  if (typeof input !== 'string') {
    return String(input).substring(0, maxLength)
  }

  // Remove null bytes and control characters (except tabs and newlines)
  let sanitized = input.replace(/[\x00-\x08\x0B-\x0C\x0E-\x1F\x7F]/g, '')

  // Normalize whitespace
  sanitized = sanitized.replace(/\s+/g, ' ')

  // Trim and limit length
  sanitized = sanitized.trim().substring(0, maxLength)

  return sanitized
}

/**
 * Sanitizes username input
 */
export function sanitizeUsername(username: string): string {
  if (typeof username !== 'string') {
    return ''
  }

  // Allow only alphanumeric characters, underscores, and hyphens
  const sanitized = username.replace(/[^a-zA-Z0-9_-]/g, '')
  
  // Ensure it doesn't start with special characters
  return sanitized.replace(/^[_-]+/, '').substring(0, 50)
}

/**
 * Sanitizes email input
 */
export function sanitizeEmail(email: string): string {
  if (typeof email !== 'string') {
    return ''
  }

  // Basic email sanitization
  const sanitized = email.toLowerCase().trim()
  
  // Remove any characters that shouldn't be in an email
  return sanitized.replace(/[^\w.@+-]/g, '').substring(0, 320)
}

/**
 * Sanitizes numeric input
 */
export function sanitizeNumber(input: any, min?: number, max?: number): number {
  const num = parseFloat(input)
  
  if (isNaN(num) || !isFinite(num)) {
    return 0
  }

  let sanitized = num
  
  if (min !== undefined && sanitized < min) {
    sanitized = min
  }
  
  if (max !== undefined && sanitized > max) {
    sanitized = max
  }

  return sanitized
}

/**
 * Sanitizes currency amounts (bet points, diamonds)
 */
export function sanitizeCurrencyAmount(amount: any): number {
  const num = sanitizeNumber(amount, 0, 1000000)
  
  // Round to prevent decimal manipulation
  return Math.round(num)
}

/**
 * Sanitizes odds values
 */
export function sanitizeOdds(odds: any): number {
  const num = sanitizeNumber(odds, 100, 10000) // 1.00 to 100.00 in integer format
  
  // Ensure odds are reasonable for betting
  if (num < 100) return 100
  if (num > 10000) return 10000
  
  return Math.round(num)
}

/**
 * Sanitizes file paths to prevent directory traversal
 */
export function sanitizeFilePath(path: string): string {
  if (typeof path !== 'string') {
    return ''
  }

  // Remove null bytes and control characters
  let sanitized = path.replace(/[\x00-\x1F\x7F]/g, '')
  
  // Remove directory traversal attempts
  sanitized = sanitized.replace(/\.\./g, '')
  sanitized = sanitized.replace(/[\/\\]+/g, '/')
  
  // Remove leading slashes and normalize
  sanitized = sanitized.replace(/^\/+/, '')
  
  return sanitized
}

/**
 * Sanitizes SQL identifiers (table names, column names)
 */
export function sanitizeSqlIdentifier(identifier: string): string {
  if (typeof identifier !== 'string') {
    return ''
  }

  // Allow only alphanumeric characters and underscores
  const sanitized = identifier.replace(/[^a-zA-Z0-9_]/g, '')
  
  // Ensure it doesn't start with a number
  return sanitized.replace(/^[0-9]+/, '').substring(0, 63)
}

/**
 * Removes potentially dangerous content from user input
 */
export function removeDangerousContent(input: string): string {
  if (typeof input !== 'string') {
    return String(input)
  }

  let cleaned = input

  // Remove potential SQL injection patterns
  const sqlPatterns = [
    /(\b(SELECT|INSERT|UPDATE|DELETE|DROP|CREATE|ALTER|EXEC|EXECUTE|UNION|SCRIPT)\b)/gi,
    /(;|\-\-|\/\*|\*\/)/g,
    /('|(\\x27)|(\\x2D\\x2D))/gi
  ]

  sqlPatterns.forEach(pattern => {
    cleaned = cleaned.replace(pattern, '')
  })

  // Remove potential NoSQL injection
  cleaned = cleaned.replace(/\$where|\$ne|\$gt|\$lt|\$gte|\$lte|\$in|\$nin|\$regex/gi, '')

  // Remove potential command injection
  cleaned = cleaned.replace(/[;&|`$(){}[\]]/g, '')

  return cleaned
}

/**
 * Validates and sanitizes match selection input
 */
export function sanitizeMatchSelection(selection: string): string {
  if (typeof selection !== 'string') {
    return ''
  }

  // Allowed selections for betting
  const allowedSelections = [
    '1', 'X', '2', // Match result
    'Over', 'Under', // Totals
    'Yes', 'No', // Both teams score
    'Home', 'Away', 'Draw', // Alternative format
    '0-0', '1-0', '0-1', '1-1', '2-0', '0-2', '2-1', '1-2', '2-2', '3-0', '0-3' // Correct scores
  ]

  const normalized = selection.trim()
  
  if (allowedSelections.includes(normalized)) {
    return normalized
  }

  // Check if it's a valid score pattern
  if (/^\d{1,2}-\d{1,2}$/.test(normalized)) {
    const [home, away] = normalized.split('-').map(Number)
    if (home >= 0 && home <= 10 && away >= 0 && away <= 10) {
      return normalized
    }
  }

  // Default to empty string if invalid
  return ''
}

/**
 * Comprehensive input sanitization for API requests
 */
export function sanitizeApiInput(data: Record<string, any>): Record<string, any> {
  const sanitized: Record<string, any> = {}

  for (const [key, value] of Object.entries(data)) {
    const sanitizedKey = sanitizeSqlIdentifier(key)
    
    if (typeof value === 'string') {
      switch (key) {
        case 'email':
          sanitized[sanitizedKey] = sanitizeEmail(value)
          break
        case 'username':
          sanitized[sanitizedKey] = sanitizeUsername(value)
          break
        case 'selection':
          sanitized[sanitizedKey] = sanitizeMatchSelection(value)
          break
        case 'odds':
          sanitized[sanitizedKey] = sanitizeOdds(value)
          break
        case 'stake':
        case 'amount':
        case 'betPoints':
        case 'diamonds':
          sanitized[sanitizedKey] = sanitizeCurrencyAmount(value)
          break
        default:
          if (key.toLowerCase().includes('html') || key.toLowerCase().includes('content')) {
            sanitized[sanitizedKey] = sanitizeHtml(value)
          } else {
            sanitized[sanitizedKey] = sanitizeText(value)
          }
      }
    } else if (typeof value === 'number') {
      sanitized[sanitizedKey] = sanitizeNumber(value)
    } else if (typeof value === 'boolean') {
      sanitized[sanitizedKey] = Boolean(value)
    } else if (Array.isArray(value)) {
      sanitized[sanitizedKey] = value.map(item => 
        typeof item === 'object' ? sanitizeApiInput(item) : sanitizeText(String(item))
      )
    } else if (typeof value === 'object' && value !== null) {
      sanitized[sanitizedKey] = sanitizeApiInput(value)
    } else {
      sanitized[sanitizedKey] = value
    }
  }

  return sanitized
}

/**
 * Validates and sanitizes bet market types
 */
export function sanitizeBetMarket(market: string): string {
  const allowedMarkets = [
    'match_result',
    'both_teams_score',
    'total_goals',
    'asian_handicap',
    'correct_score',
    'next_goal',
    'halftime_result',
    'player_to_score'
  ]

  const sanitized = sanitizeText(market, 50).toLowerCase().replace(/\s+/g, '_')
  
  return allowedMarkets.includes(sanitized) ? sanitized : 'match_result'
}