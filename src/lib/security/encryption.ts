import crypto from 'crypto'

// Environment-based configuration
const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY || crypto.randomBytes(32).toString('hex')
const ALGORITHM = 'aes-256-gcm'
const IV_LENGTH = 16
const TAG_LENGTH = 16

/**
 * Encrypts sensitive data using AES-256-GCM
 * Returns base64 encoded string with IV and auth tag
 */
export function encrypt(text: string, key?: string): string {
  try {
    const encryptionKey = key ? Buffer.from(key, 'hex') : Buffer.from(ENCRYPTION_KEY, 'hex')
    const iv = crypto.randomBytes(IV_LENGTH)
    const cipher = crypto.createCipher(ALGORITHM, encryptionKey)
    cipher.setAutoPadding(true)
    
    let encrypted = cipher.update(text, 'utf8', 'hex')
    encrypted += cipher.final('hex')
    
    const tag = cipher.getAuthTag()
    
    // Combine IV + tag + encrypted data
    const combined = Buffer.concat([iv, tag, Buffer.from(encrypted, 'hex')])
    return combined.toString('base64')
  } catch (error) {
    console.error('Encryption error:', error)
    throw new Error('Failed to encrypt data')
  }
}

/**
 * Decrypts data encrypted with encrypt function
 */
export function decrypt(encryptedData: string, key?: string): string {
  try {
    const encryptionKey = key ? Buffer.from(key, 'hex') : Buffer.from(ENCRYPTION_KEY, 'hex')
    const combined = Buffer.from(encryptedData, 'base64')
    
    // Extract components
    const iv = combined.subarray(0, IV_LENGTH)
    const tag = combined.subarray(IV_LENGTH, IV_LENGTH + TAG_LENGTH)
    const encrypted = combined.subarray(IV_LENGTH + TAG_LENGTH)
    
    const decipher = crypto.createDecipher(ALGORITHM, encryptionKey)
    decipher.setAuthTag(tag)
    
    let decrypted = decipher.update(encrypted, undefined, 'utf8')
    decrypted += decipher.final('utf8')
    
    return decrypted
  } catch (error) {
    console.error('Decryption error:', error)
    throw new Error('Failed to decrypt data')
  }
}

/**
 * Generates a cryptographically secure random string
 */
export function generateSecureToken(length: number = 32): string {
  return crypto.randomBytes(length).toString('hex')
}

/**
 * Generates a secure random number within a range
 */
export function generateSecureRandomNumber(min: number, max: number): number {
  const range = max - min
  const bytesNeeded = Math.ceil(Math.log2(range) / 8)
  let randomNumber

  do {
    const randomBytes = crypto.randomBytes(bytesNeeded)
    randomNumber = randomBytes.reduce((acc, byte, index) => {
      return acc + byte * Math.pow(256, index)
    }, 0)
  } while (randomNumber >= Math.floor(Number.MAX_SAFE_INTEGER / range) * range)

  return min + (randomNumber % range)
}

/**
 * Creates a hash of sensitive data for comparison purposes
 */
export function hashSensitiveData(data: string, salt?: string): { hash: string; salt: string } {
  const actualSalt = salt || crypto.randomBytes(32).toString('hex')
  const hash = crypto.pbkdf2Sync(data, actualSalt, 100000, 64, 'sha512').toString('hex')
  return { hash, salt: actualSalt }
}

/**
 * Verifies hashed data
 */
export function verifyHashedData(data: string, hash: string, salt: string): boolean {
  const computedHash = crypto.pbkdf2Sync(data, salt, 100000, 64, 'sha512').toString('hex')
  return crypto.timingSafeEqual(Buffer.from(hash, 'hex'), Buffer.from(computedHash, 'hex'))
}

/**
 * Generates a secure API key
 */
export function generateApiKey(): string {
  const prefix = 'nfb_' // Nordic Football Betting
  const timestamp = Date.now().toString(36)
  const random = crypto.randomBytes(24).toString('base64url')
  return `${prefix}${timestamp}_${random}`
}

/**
 * Creates a JWT-safe secret
 */
export function generateJWTSecret(): string {
  return crypto.randomBytes(64).toString('base64url')
}

/**
 * Encrypts user PII data before storing in database
 */
export function encryptPII(data: Record<string, any>): Record<string, any> {
  const encryptedData: Record<string, any> = {}
  
  // Fields that should be encrypted
  const piiFields = ['email', 'phone', 'address', 'fullName', 'taxId']
  
  for (const [key, value] of Object.entries(data)) {
    if (piiFields.includes(key) && typeof value === 'string') {
      encryptedData[key] = encrypt(value)
    } else {
      encryptedData[key] = value
    }
  }
  
  return encryptedData
}

/**
 * Decrypts user PII data when retrieving from database
 */
export function decryptPII(data: Record<string, any>): Record<string, any> {
  const decryptedData: Record<string, any> = {}
  
  const piiFields = ['email', 'phone', 'address', 'fullName', 'taxId']
  
  for (const [key, value] of Object.entries(data)) {
    if (piiFields.includes(key) && typeof value === 'string') {
      try {
        decryptedData[key] = decrypt(value)
      } catch (error) {
        // If decryption fails, assume data is not encrypted
        decryptedData[key] = value
      }
    } else {
      decryptedData[key] = value
    }
  }
  
  return decryptedData
}

/**
 * Securely compares two strings to prevent timing attacks
 */
export function secureCompare(a: string, b: string): boolean {
  if (a.length !== b.length) {
    // Still perform comparison to prevent timing attacks
    crypto.timingSafeEqual(Buffer.alloc(32, 'a'), Buffer.alloc(32, 'b'))
    return false
  }
  
  return crypto.timingSafeEqual(Buffer.from(a), Buffer.from(b))
}

/**
 * Masks sensitive data for logging
 */
export function maskSensitiveData(data: any): any {
  if (typeof data !== 'object' || data === null) {
    return data
  }
  
  const masked = { ...data }
  const sensitiveFields = ['password', 'token', 'secret', 'key', 'email', 'phone']
  
  for (const key of Object.keys(masked)) {
    const lowerKey = key.toLowerCase()
    if (sensitiveFields.some(field => lowerKey.includes(field))) {
      if (typeof masked[key] === 'string') {
        masked[key] = masked[key].substring(0, 2) + '*'.repeat(masked[key].length - 2)
      }
    }
  }
  
  return masked
}