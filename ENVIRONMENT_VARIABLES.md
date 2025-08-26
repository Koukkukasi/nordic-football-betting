# Nordic Football Betting - Environment Variables Reference

## 📋 Complete Environment Variables List

This document provides a comprehensive reference for all environment variables used in the Nordic Football Betting platform.

## 🔴 Critical Variables (Required for Production)

### Application Environment
```bash
NODE_ENV=production
# Values: development | production | test
# Description: Determines application behavior and security settings
```

### Database Configuration
```bash
DATABASE_URL=postgresql://username:password@host:5432/database?sslmode=require
# Description: Primary PostgreSQL database connection string
# Format: postgresql://[user[:password]@][host][:port][/dbname][?param1=value1&...]
# Requirements: Must use SSL in production (sslmode=require)

DIRECT_URL=postgresql://username:password@host:5432/database?sslmode=require&connection_limit=1
# Description: Direct database connection for Prisma migrations
# Requirements: Same as DATABASE_URL but without connection pooling
```

### Authentication & Security
```bash
NEXTAUTH_SECRET=your-64-character-jwt-secret-here
# Description: JWT signing secret for NextAuth.js
# Requirements: Minimum 64 characters, cryptographically secure
# Generation: openssl rand -base64 64

NEXTAUTH_URL=https://your-production-domain.com
# Description: Canonical URL for authentication callbacks
# Requirements: Must be HTTPS in production, match actual domain
```

### Supabase Integration
```bash
NEXT_PUBLIC_SUPABASE_URL=https://your-project-ref.supabase.co
# Description: Supabase project URL
# Source: Supabase Project Settings → API
# Note: Public variable (NEXT_PUBLIC_), exposed to client

NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anonymous-key
# Description: Supabase anonymous/public key
# Source: Supabase Project Settings → API → anon/public key
# Note: Public variable, safe for client-side use
```

### Payment Processing
```bash
STRIPE_SECRET_KEY=sk_live_your_stripe_secret_key
# Description: Stripe secret key for payment processing
# Requirements: Use sk_live_ prefix for production, sk_test_ for testing
# Source: Stripe Dashboard → Developers → API Keys

STRIPE_WEBHOOK_SECRET=whsec_your_webhook_endpoint_secret
# Description: Stripe webhook signature verification secret
# Source: Stripe Dashboard → Developers → Webhooks → [endpoint] → Signing secret
# Requirements: Must start with whsec_
```

### Admin Access
```bash
ADMIN_PASSWORD=your-secure-admin-password
# Description: Password for admin interface access
# Requirements: Strong password, minimum 12 characters
# Security: Change from default value
```

## 🟡 Recommended Variables (Strongly Advised)

### Data Encryption
```bash
ENCRYPTION_KEY=your-64-character-hex-encryption-key
# Description: AES-256 encryption key for sensitive data
# Requirements: Exactly 64 hex characters (32 bytes)
# Generation: openssl rand -hex 32
# Behavior: Auto-generated if not provided (not persistent across restarts)
```

### Admin Configuration
```bash
ADMIN_EMAIL=admin@your-domain.com
# Description: Email for admin privilege checks
# Usage: Middleware admin validation
# Impact: Without this, admin routes use password-only authentication

ADMIN_SECRET_KEY=your-admin-api-secret
# Description: API key for admin endpoints
# Generation: openssl rand -base64 32
# Usage: Alternative to password authentication for API calls
```

## 🟢 Optional Variables (Enhanced Features)

### External APIs
```bash
NEXT_PUBLIC_API_FOOTBALL_KEY=your-api-football-key
# Description: API-Football service for real sports data
# Source: https://www.api-football.com/
# Impact: Without this, app uses mock/generated match data
# Note: Public variable (NEXT_PUBLIC_)
```

### Additional Security
```bash
RATE_LIMIT_ENABLED=true
# Description: Enable/disable rate limiting
# Default: true
# Values: true | false

MAX_REQUESTS_PER_MINUTE=60
# Description: Global rate limit per IP
# Default: 60
# Usage: Middleware rate limiting
```

### Session Management
```bash
SESSION_MAX_AGE=2592000
# Description: Session expiration time in seconds
# Default: 2592000 (30 days)
# Usage: NextAuth session configuration

SESSION_UPDATE_AGE=86400
# Description: Session update interval in seconds
# Default: 86400 (24 hours)
# Usage: How often to refresh session data
```

## 🔧 Development-Only Variables

These variables are only used in development and should NOT be set in production:

```bash
# Development database (SQLite)
DATABASE_URL=file:./dev.db

# Development URLs
NEXTAUTH_URL=http://localhost:3001

# Test Stripe keys
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_test_...
```

## 📊 Environment Variable Categories

### By Security Level
- **🔴 Critical**: Must be set, production-ready values required
- **🟡 Recommended**: Should be set for security/functionality
- **🟢 Optional**: Enhanced features, fallbacks available

### By Visibility
- **Server-only**: Not exposed to client (most variables)
- **Public** (`NEXT_PUBLIC_`): Exposed to client-side code

### By Service
- **Database**: DATABASE_URL, DIRECT_URL
- **Authentication**: NEXTAUTH_SECRET, NEXTAUTH_URL
- **Payment**: STRIPE_SECRET_KEY, STRIPE_WEBHOOK_SECRET
- **Storage**: NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY
- **Admin**: ADMIN_PASSWORD, ADMIN_EMAIL, ADMIN_SECRET_KEY
- **Security**: ENCRYPTION_KEY
- **External**: NEXT_PUBLIC_API_FOOTBALL_KEY

## 🛠️ Setup Tools

### Secret Generation
```bash
# Generate all secrets
npm run generate-secrets        # Linux/Mac/WSL
npm run generate-secrets:win    # Windows

# Manual generation
openssl rand -base64 64         # NEXTAUTH_SECRET
openssl rand -hex 32            # ENCRYPTION_KEY
openssl rand -base64 32         # ADMIN_SECRET_KEY
```

### Environment Validation
```bash
# Validate current environment
npm run validate-env

# API endpoint validation
GET /api/admin/environment-check
Header: x-admin-password: your-admin-password
```

### Environment Files
```bash
.env.local              # Development (git-ignored)
.env.production         # Production (git-ignored)
.env.production.template # Template with examples (committed)
```

## 🔒 Security Best Practices

### Secret Management
1. **Never commit** production secrets to version control
2. **Use environment variables** or secure secret management
3. **Rotate secrets** regularly (quarterly recommended)
4. **Use different secrets** for staging and production
5. **Validate** environment before deployment

### Database Security
1. **Use SSL/TLS** connections (`sslmode=require`)
2. **Restrict network access** to database
3. **Use strong passwords** and dedicated database users
4. **Enable logging** and monitoring

### Authentication Security
1. **NEXTAUTH_SECRET** must be cryptographically secure
2. **Use HTTPS** for all authentication URLs
3. **Implement proper CORS** policies
4. **Enable secure headers** (handled by middleware)

### Payment Security
1. **Use live Stripe keys** only in production
2. **Verify webhook signatures** (STRIPE_WEBHOOK_SECRET)
3. **Monitor payment events** and failures
4. **Follow PCI compliance** guidelines

## 🚨 Common Issues & Solutions

### Authentication Failures
```bash
# Issue: JWT errors, session problems
# Check: NEXTAUTH_SECRET length (64+ chars)
# Check: NEXTAUTH_URL matches domain
# Check: HTTPS in production
```

### Database Connection Errors
```bash
# Issue: Connection refused, SSL errors
# Check: DATABASE_URL format
# Check: SSL requirements (sslmode=require)
# Check: Network connectivity
```

### Payment Processing Errors
```bash
# Issue: Stripe integration failures
# Check: Correct key prefix (sk_live_ vs sk_test_)
# Check: STRIPE_WEBHOOK_SECRET format (whsec_)
# Check: Webhook endpoint configuration
```

### Environment Validation Failures
```bash
# Issue: Missing or invalid variables
# Solution: Run npm run validate-env
# Solution: Check .env.production.template
# Solution: Generate new secrets if needed
```

## 📚 Related Documentation

- [DEPLOYMENT_GUIDE.md](./DEPLOYMENT_GUIDE.md) - Complete deployment instructions
- [.env.production.template](./.env.production.template) - Environment template
- [scripts/generate-secrets.sh](./scripts/generate-secrets.sh) - Secret generation
- [scripts/validate-environment.js](./scripts/validate-environment.js) - Validation script

## 🔄 Rotation Schedule

### Quarterly (Recommended)
- NEXTAUTH_SECRET
- ENCRYPTION_KEY
- ADMIN_SECRET_KEY

### As Needed
- ADMIN_PASSWORD (after security incidents)
- Database credentials (password changes)
- Stripe keys (security updates)

### Annual
- Review all environment variables
- Update security practices
- Audit access and permissions