#!/usr/bin/env node

/**
 * Nordic Football Betting - Environment Validation Script
 * 
 * This script validates all environment variables before deployment
 * Can be run as: node scripts/validate-environment.js
 */

const crypto = require('crypto');
const url = require('url');

// Color codes for console output
const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
  bold: '\x1b[1m'
};

function colorize(text, color) {
  return `${colors[color]}${text}${colors.reset}`;
}

function logSuccess(message) {
  console.log(`${colorize('✅', 'green')} ${message}`);
}

function logWarning(message) {
  console.log(`${colorize('⚠️', 'yellow')} ${message}`);
}

function logError(message) {
  console.log(`${colorize('❌', 'red')} ${message}`);
}

function logInfo(message) {
  console.log(`${colorize('ℹ️', 'blue')} ${message}`);
}

// Load environment variables
require('dotenv').config({ path: '.env.production' });

console.log(colorize('\n🔐 Nordic Football Betting - Environment Validation', 'bold'));
console.log(colorize('====================================================', 'cyan'));

let errors = 0;
let warnings = 0;
let validations = 0;

function validateRequired(name, value, description) {
  validations++;
  if (!value) {
    logError(`${name} is required - ${description}`);
    errors++;
    return false;
  }
  logSuccess(`${name} is set`);
  return true;
}

function validateOptional(name, value, description) {
  validations++;
  if (!value) {
    logWarning(`${name} is not set - ${description}`);
    warnings++;
    return false;
  }
  logSuccess(`${name} is set`);
  return true;
}

function validateFormat(name, value, validator, description) {
  if (!value) return false;
  
  validations++;
  if (!validator(value)) {
    logError(`${name} has invalid format - ${description}`);
    errors++;
    return false;
  }
  logSuccess(`${name} format is valid`);
  return true;
}

function validateURL(value) {
  try {
    new URL(value);
    return true;
  } catch {
    return false;
  }
}

function validateStripeKey(value, type) {
  const prefix = type === 'secret' ? 'sk_' : 'pk_';
  return value && value.startsWith(prefix) && value.length > 20;
}

function validateWebhookSecret(value) {
  return value && value.startsWith('whsec_') && value.length > 20;
}

function validateBase64(value, minLength = 32) {
  try {
    const decoded = Buffer.from(value, 'base64');
    return decoded.length >= minLength;
  } catch {
    return false;
  }
}

function validateHex(value, exactLength) {
  const hexRegex = /^[0-9a-fA-F]+$/;
  return hexRegex.test(value) && (!exactLength || value.length === exactLength);
}

console.log('\n' + colorize('1. Application Environment', 'bold'));
console.log('─'.repeat(30));

validateRequired('NODE_ENV', process.env.NODE_ENV, 'Application environment');
if (process.env.NODE_ENV) {
  if (!['development', 'production', 'test'].includes(process.env.NODE_ENV)) {
    logError('NODE_ENV must be one of: development, production, test');
    errors++;
  }
}

console.log('\n' + colorize('2. Database Configuration', 'bold'));
console.log('─'.repeat(30));

const dbValid = validateRequired('DATABASE_URL', process.env.DATABASE_URL, 'Primary database connection');
if (dbValid) {
  validateFormat('DATABASE_URL', process.env.DATABASE_URL, validateURL, 'Must be valid PostgreSQL URL');
  
  if (process.env.NODE_ENV === 'production' && process.env.DATABASE_URL.includes('localhost')) {
    logWarning('Using localhost database in production environment');
    warnings++;
  }
}

const directValid = validateRequired('DIRECT_URL', process.env.DIRECT_URL, 'Direct database connection for migrations');
if (directValid) {
  validateFormat('DIRECT_URL', process.env.DIRECT_URL, validateURL, 'Must be valid PostgreSQL URL');
}

console.log('\n' + colorize('3. Authentication & Security', 'bold'));
console.log('─'.repeat(30));

const authSecretValid = validateRequired('NEXTAUTH_SECRET', process.env.NEXTAUTH_SECRET, 'JWT signing secret');
if (authSecretValid) {
  if (process.env.NEXTAUTH_SECRET.length < 32) {
    logError('NEXTAUTH_SECRET must be at least 32 characters long');
    errors++;
  } else if (process.env.NEXTAUTH_SECRET === 'your-secret-key-here') {
    logError('NEXTAUTH_SECRET is still using default value');
    errors++;
  }
}

const authUrlValid = validateRequired('NEXTAUTH_URL', process.env.NEXTAUTH_URL, 'Authentication callback URL');
if (authUrlValid) {
  validateFormat('NEXTAUTH_URL', process.env.NEXTAUTH_URL, validateURL, 'Must be valid HTTPS URL');
  
  if (process.env.NODE_ENV === 'production' && !process.env.NEXTAUTH_URL.startsWith('https://')) {
    logError('NEXTAUTH_URL must use HTTPS in production');
    errors++;
  }
}

const encryptionValid = validateOptional('ENCRYPTION_KEY', process.env.ENCRYPTION_KEY, 'Data encryption key (recommended)');
if (encryptionValid) {
  validateFormat('ENCRYPTION_KEY', process.env.ENCRYPTION_KEY, (v) => validateHex(v, 64), 'Must be 64-character hex string (32 bytes)');
}

console.log('\n' + colorize('4. Admin Configuration', 'bold'));
console.log('─'.repeat(30));

const adminPassValid = validateRequired('ADMIN_PASSWORD', process.env.ADMIN_PASSWORD, 'Admin authentication password');
if (adminPassValid) {
  if (process.env.ADMIN_PASSWORD === 'your-admin-password-here') {
    logError('ADMIN_PASSWORD is still using default value');
    errors++;
  } else if (process.env.ADMIN_PASSWORD.length < 12) {
    logWarning('ADMIN_PASSWORD should be at least 12 characters long');
    warnings++;
  }
}

validateOptional('ADMIN_EMAIL', process.env.ADMIN_EMAIL, 'Admin email for privilege checks');
validateOptional('ADMIN_SECRET_KEY', process.env.ADMIN_SECRET_KEY, 'Admin API access key');

console.log('\n' + colorize('5. Supabase Configuration', 'bold'));
console.log('─'.repeat(30));

const supabaseUrlValid = validateRequired('NEXT_PUBLIC_SUPABASE_URL', process.env.NEXT_PUBLIC_SUPABASE_URL, 'Supabase project URL');
if (supabaseUrlValid) {
  validateFormat('NEXT_PUBLIC_SUPABASE_URL', process.env.NEXT_PUBLIC_SUPABASE_URL, validateURL, 'Must be valid Supabase URL');
  
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL.includes('.supabase.co')) {
    logWarning('NEXT_PUBLIC_SUPABASE_URL should be a Supabase URL (.supabase.co)');
    warnings++;
  }
}

const supabaseKeyValid = validateRequired('NEXT_PUBLIC_SUPABASE_ANON_KEY', process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY, 'Supabase anonymous key');
if (supabaseKeyValid && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY.length < 100) {
  logWarning('NEXT_PUBLIC_SUPABASE_ANON_KEY seems too short for a valid Supabase key');
  warnings++;
}

console.log('\n' + colorize('6. Payment Configuration', 'bold'));
console.log('─'.repeat(30));

const stripeSecretValid = validateRequired('STRIPE_SECRET_KEY', process.env.STRIPE_SECRET_KEY, 'Stripe secret key');
if (stripeSecretValid) {
  validateFormat('STRIPE_SECRET_KEY', process.env.STRIPE_SECRET_KEY, (v) => validateStripeKey(v, 'secret'), 'Must start with sk_ and be valid Stripe key');
  
  if (process.env.NODE_ENV === 'production' && process.env.STRIPE_SECRET_KEY.startsWith('sk_test_')) {
    logError('Using test Stripe key in production environment');
    errors++;
  }
}

const webhookSecretValid = validateRequired('STRIPE_WEBHOOK_SECRET', process.env.STRIPE_WEBHOOK_SECRET, 'Stripe webhook signature verification');
if (webhookSecretValid) {
  validateFormat('STRIPE_WEBHOOK_SECRET', process.env.STRIPE_WEBHOOK_SECRET, validateWebhookSecret, 'Must start with whsec_ and be valid webhook secret');
}

console.log('\n' + colorize('7. External APIs', 'bold'));
console.log('─'.repeat(30));

validateOptional('NEXT_PUBLIC_API_FOOTBALL_KEY', process.env.NEXT_PUBLIC_API_FOOTBALL_KEY, 'API-Football service key (optional)');

console.log('\n' + colorize('8. Security Checks', 'bold'));
console.log('─'.repeat(30));

// Check for common insecure values
const insecureValues = ['password', '123456', 'secret', 'changeme', 'admin', 'test'];
let insecureFound = false;

Object.entries(process.env).forEach(([key, value]) => {
  if (value && insecureValues.includes(value.toLowerCase())) {
    logError(`${key} contains an insecure value: ${value}`);
    errors++;
    insecureFound = true;
  }
});

if (!insecureFound) {
  logSuccess('No obvious insecure values detected');
}

// Check for exposed secrets in client environment
const clientSecrets = Object.keys(process.env).filter(key => {
  return key.startsWith('NEXT_PUBLIC_') && 
         /(secret|password|private|token)/i.test(key) &&
         !key.includes('SUPABASE') && 
         !key.includes('API_FOOTBALL');
});

if (clientSecrets.length > 0) {
  clientSecrets.forEach(secret => {
    logError(`Potentially sensitive variable exposed to client: ${secret}`);
    errors++;
  });
} else {
  logSuccess('No sensitive variables exposed to client');
}

console.log('\n' + colorize('Validation Summary', 'bold'));
console.log('═'.repeat(50));

console.log(`Total validations: ${validations}`);
console.log(`${colorize('Errors: ' + errors, errors > 0 ? 'red' : 'green')}`);
console.log(`${colorize('Warnings: ' + warnings, warnings > 0 ? 'yellow' : 'green')}`);

if (errors === 0 && warnings === 0) {
  console.log('\n' + colorize('🎉 Environment validation passed! Ready for deployment.', 'green'));
} else if (errors === 0) {
  console.log('\n' + colorize('✅ Environment validation passed with warnings.', 'yellow'));
  console.log(colorize('Consider addressing warnings before deployment.', 'yellow'));
} else {
  console.log('\n' + colorize('❌ Environment validation failed!', 'red'));
  console.log(colorize('Please fix all errors before deployment.', 'red'));
}

console.log('\n' + colorize('Next Steps:', 'bold'));
if (errors > 0) {
  console.log('1. Fix all validation errors listed above');
  console.log('2. Re-run this validation script');
} else {
  console.log('1. Deploy to your hosting platform');
  console.log('2. Run database migrations: npx prisma migrate deploy');
  console.log('3. Test the application thoroughly');
}

console.log('4. Monitor logs for any runtime issues');
console.log('5. Set up monitoring and alerting');

// Exit with error code if validation failed
process.exit(errors > 0 ? 1 : 0);