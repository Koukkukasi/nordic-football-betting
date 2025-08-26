# Nordic Football Betting - Production Deployment Guide

## 🔐 Environment Configuration Specialist

This guide provides comprehensive instructions for setting up all production environment variables for the Nordic Football Betting platform.

## 📋 Quick Setup Checklist

### 1. Environment Variables Setup
- [ ] Copy `.env.production.template` to `.env.production`
- [ ] Generate secure secrets using provided scripts
- [ ] Configure database connections (Supabase/PostgreSQL)
- [ ] Set up Stripe payment integration
- [ ] Configure authentication secrets
- [ ] Validate environment before deployment

### 2. Secret Generation
```bash
# For Linux/Mac/WSL
npm run generate-secrets

# For Windows
npm run generate-secrets:win
```

### 3. Environment Validation
```bash
npm run validate-env
```

## 🔑 Required Environment Variables

### Critical Variables (Must be set)
| Variable | Description | Example |
|----------|-------------|---------|
| `NODE_ENV` | Application environment | `production` |
| `DATABASE_URL` | Primary database connection | `postgresql://user:pass@host:5432/db` |
| `DIRECT_URL` | Direct database connection | `postgresql://user:pass@host:5432/db` |
| `NEXTAUTH_SECRET` | JWT signing secret (64+ chars) | Generated via script |
| `NEXTAUTH_URL` | Production domain URL | `https://yourdomain.com` |
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase project URL | `https://xxx.supabase.co` |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase anonymous key | From Supabase dashboard |
| `STRIPE_SECRET_KEY` | Stripe secret key | `sk_live_...` |
| `STRIPE_WEBHOOK_SECRET` | Stripe webhook secret | `whsec_...` |
| `ADMIN_PASSWORD` | Admin interface password | Strong password |

### Recommended Variables
| Variable | Description | Default Behavior |
|----------|-------------|------------------|
| `ENCRYPTION_KEY` | Data encryption key (64 hex chars) | Auto-generated (not persistent) |
| `ADMIN_EMAIL` | Admin email for privilege checks | No admin email validation |
| `ADMIN_SECRET_KEY` | API admin access key | Uses ADMIN_PASSWORD |

### Optional Variables
| Variable | Description | Impact if Missing |
|----------|-------------|-------------------|
| `NEXT_PUBLIC_API_FOOTBALL_KEY` | Real sports data API | Uses mock/generated data |

## 🛠️ Setup Instructions

### Step 1: Clone Template
```bash
cp .env.production.template .env.production
```

### Step 2: Generate Secrets
Run the secret generation script:

**Linux/Mac/WSL:**
```bash
chmod +x scripts/generate-secrets.sh
npm run generate-secrets
```

**Windows:**
```bash
npm run generate-secrets:win
```

### Step 3: Database Setup
1. Create PostgreSQL database (recommended: Supabase)
2. Update `DATABASE_URL` and `DIRECT_URL` in `.env.production`
3. Run migrations:
```bash
npx prisma migrate deploy
```

### Step 4: Supabase Configuration
1. Create Supabase project
2. Copy URL and anon key to environment variables
3. Set up Row Level Security (RLS) policies

### Step 5: Stripe Setup
1. Create Stripe account
2. Get live API keys (production)
3. Set up webhook endpoint
4. Configure products and prices

### Step 6: Validate Configuration
```bash
npm run validate-env
```

## 🔒 Security Best Practices

### Secret Management
- **Never commit** `.env.production` to version control
- Use **different secrets** for staging and production
- **Rotate secrets** quarterly
- Store secrets in **secure environment** (deployment platform)

### Database Security
- Use **SSL/TLS** connections (`sslmode=require`)
- **Restrict access** to production database
- Use **connection pooling** for better performance
- Regular **backups** and disaster recovery

### Authentication Security
- **NEXTAUTH_SECRET** must be 64+ characters
- Use **HTTPS** for all production URLs
- Enable **secure headers** (handled by middleware)
- Implement **rate limiting** (handled by middleware)

### Payment Security
- Use **live Stripe keys** in production
- Verify **webhook signatures**
- **Monitor** payment events
- Follow **PCI compliance** guidelines

## 🚀 Deployment Process

### 1. Pre-deployment
```bash
# Validate environment
npm run validate-env

# Build application
npm run build

# Test build locally
npm run start
```

### 2. Database Migration
```bash
# Deploy schema changes
npx prisma migrate deploy

# Seed initial data (if needed)
npm run db:seed
```

### 3. Environment Variables
Set all environment variables in your deployment platform:
- Vercel: Project Settings → Environment Variables
- Netlify: Site Settings → Environment Variables  
- Railway: Project → Variables
- Docker: Environment file or container configuration

### 4. SSL/HTTPS Setup
Ensure your deployment platform provides SSL certificates.

### 5. Domain Configuration
- Update `NEXTAUTH_URL` to your production domain
- Configure DNS records
- Set up CDN if needed

## 🔍 Monitoring & Validation

### Environment Validation Endpoint
GET `/api/admin/environment-check` - Validates current environment configuration

### Health Checks
- Database connectivity
- Stripe integration
- Supabase connection
- Authentication flow

### Logs Monitoring
Monitor application logs for:
- Authentication failures
- Payment processing errors
- Database connection issues
- Rate limiting events

## 🆘 Troubleshooting

### Common Issues

**Authentication Errors:**
- Check `NEXTAUTH_SECRET` length (64+ chars)
- Verify `NEXTAUTH_URL` matches domain
- Ensure HTTPS in production

**Database Connection:**
- Verify `DATABASE_URL` format
- Check SSL requirements
- Test connection from deployment environment

**Payment Issues:**
- Confirm live Stripe keys in production
- Verify webhook endpoint configuration
- Check webhook secret format

**Missing Dependencies:**
```bash
npm install dotenv  # For validation script
```

### Support Commands
```bash
# Check environment validation
npm run validate-env

# Generate new secrets
npm run generate-secrets

# Database status
npx prisma db seed

# View current configuration
npx prisma studio
```

## 📚 Additional Resources

- [Next.js Deployment Guide](https://nextjs.org/docs/deployment)
- [Prisma Production Guide](https://www.prisma.io/docs/guides/deployment)
- [Supabase Production Setup](https://supabase.com/docs/guides/platform/going-into-prod)
- [Stripe Production Checklist](https://stripe.com/docs/development/checklist)
- [NextAuth.js Configuration](https://next-auth.js.org/configuration/options)

## 🎯 Post-Deployment

1. **Test all functionality** thoroughly
2. **Monitor performance** and error rates
3. **Set up alerts** for critical failures
4. **Document** any environment-specific configurations
5. **Plan backup** and recovery procedures

---

**Security Notice:** This application handles user data and payments. Ensure all security measures are properly implemented before going live.