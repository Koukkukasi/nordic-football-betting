# Security Best Practices - Nordic Football Betting Platform

## Overview

This document outlines the comprehensive security measures implemented in the Nordic Football Betting platform to protect user data, financial transactions, and system integrity.

## 🔒 Security Architecture

### 1. Authentication & Authorization
- **NextAuth.js Integration**: Secure session management with JWT tokens
- **Row Level Security (RLS)**: Database-level access control
- **Admin Role Management**: Separate admin privileges with audit trails
- **Account Lockout**: Automatic lockout after failed login attempts
- **Session Security**: Secure session configuration with proper expiration

### 2. API Security
- **Authentication Middleware**: All betting APIs require authentication
- **Input Validation**: Zod schemas validate all API inputs
- **Rate Limiting**: Configurable rate limits per endpoint category
- **CORS Configuration**: Secure cross-origin resource sharing
- **Request Sanitization**: SQL injection and XSS protection

### 3. Payment Security
- **Stripe Webhook Verification**: Proper signature validation
- **Payment Intent Validation**: Double verification of payment data
- **Idempotency**: Duplicate webhook event protection
- **Audit Logging**: Complete payment audit trail
- **Fraud Detection**: Suspicious transaction monitoring

### 4. Data Protection
- **PII Encryption**: Personal data encrypted at rest
- **Data Sanitization**: Input sanitization prevents injection attacks
- **Secure Error Handling**: No sensitive data in error messages
- **Audit Logging**: Comprehensive security event logging

## 🛡️ Security Components

### Middleware (`middleware.ts`)
```typescript
// Comprehensive security middleware including:
- Authentication validation
- Rate limiting
- CORS configuration  
- Security headers
- IP blocking
- Audit logging
```

### Validation Layer (`src/lib/validation/schemas.ts`)
```typescript
// Zod schemas for all API endpoints:
- Input sanitization
- Type validation
- Business rule enforcement
- Security constraint validation
```

### Security Utilities (`src/lib/security/`)
```
├── encryption.ts      # Data encryption/decryption
├── sanitization.ts    # Input sanitization
├── audit.ts          # Security event logging
├── environment.ts    # Environment validation
├── error-handling.ts # Secure error responses
└── rls-policies.sql  # Database security policies
```

## 🔐 Database Security

### Row Level Security (RLS) Policies
- **User Data**: Users can only access their own data
- **Betting Records**: Strict access controls on bet history
- **Financial Data**: Protected transaction records
- **Admin Functions**: Elevated privileges with audit trails

### Security Functions
```sql
-- Validate bet amounts and odds
validate_bet_amount(amount) 
validate_odds(odds_value)

-- Business rule enforcement
can_place_bet(match_id)

-- User context validation
current_user_id()
is_admin()
```

## 🚨 Threat Protection

### 1. SQL Injection Prevention
- **Parameterized Queries**: All database queries use parameters
- **Input Sanitization**: Special characters escaped
- **RLS Policies**: Additional database-level protection

### 2. XSS Protection
- **Content Security Policy**: Strict CSP headers
- **Input Sanitization**: HTML content sanitized
- **Output Encoding**: Safe data rendering

### 3. CSRF Protection
- **SameSite Cookies**: Prevent cross-site request forgery
- **Origin Validation**: Request origin verification
- **Token Validation**: CSRF token implementation

### 4. Rate Limiting
- **API Endpoints**: 60 requests/minute general limit
- **Authentication**: 10 attempts/minute
- **Payment**: 5 requests/minute
- **Betting**: 30 requests/minute

### 5. Brute Force Protection
- **Account Lockout**: 5 failed attempts = 15 minute lockout
- **IP Blocking**: Automatic IP blocking for violations
- **Progressive Delays**: Increasing delays for repeated failures

## 📊 Audit & Monitoring

### Security Event Logging
```typescript
// Comprehensive audit trail:
- Authentication events
- Authorization failures  
- Payment transactions
- Admin actions
- Security violations
- System errors
```

### Monitored Events
- Failed login attempts
- Unusual betting patterns
- Payment anomalies
- Admin privilege usage
- Security policy violations
- System errors and exceptions

## 🔧 Configuration

### Environment Variables
```bash
# Required security configurations
NEXTAUTH_SECRET=<64-char-random-string>
NEXTAUTH_URL=https://yourdomain.com
STRIPE_WEBHOOK_SECRET=whsec_...
ENCRYPTION_KEY=<32-byte-hex-key>
ADMIN_EMAIL=admin@yourdomain.com
```

### Security Headers
```typescript
// Implemented security headers:
'X-Frame-Options': 'DENY'
'X-Content-Type-Options': 'nosniff'  
'X-XSS-Protection': '1; mode=block'
'Strict-Transport-Security': 'max-age=31536000'
'Content-Security-Policy': '...'
'Referrer-Policy': 'origin-when-cross-origin'
```

## 🚀 Deployment Security

### Production Checklist
- [ ] HTTPS enforced everywhere
- [ ] Secure environment variables
- [ ] Database connection encryption
- [ ] Firewall configuration
- [ ] Security monitoring enabled
- [ ] Regular security updates
- [ ] Backup encryption
- [ ] Access key rotation

### Security Testing
- [ ] Penetration testing
- [ ] Vulnerability scanning
- [ ] Code security review
- [ ] Dependency security audit
- [ ] Configuration review

## 🔍 Security Monitoring

### Real-time Alerts
- Critical security events
- Failed authentication spikes
- Unusual payment patterns
- System errors and exceptions
- Database security violations

### Security Dashboards
- Authentication metrics
- API usage patterns
- Error rate monitoring
- Payment transaction status
- User behavior analytics

## 📋 Incident Response

### Security Incident Workflow
1. **Detection**: Automated monitoring alerts
2. **Assessment**: Severity and impact analysis  
3. **Containment**: Immediate threat mitigation
4. **Investigation**: Root cause analysis
5. **Recovery**: System restoration
6. **Documentation**: Incident documentation
7. **Prevention**: Security improvements

### Emergency Procedures
- **Account Compromise**: Immediate suspension
- **Payment Fraud**: Transaction blocking
- **Data Breach**: Containment and notification
- **System Compromise**: Service isolation

## 🔄 Maintenance

### Regular Security Tasks
- [ ] Weekly security log review
- [ ] Monthly vulnerability assessment
- [ ] Quarterly access review
- [ ] Annual penetration testing
- [ ] Continuous dependency updates

### Key Rotation Schedule
- JWT secrets: Every 6 months
- Database passwords: Every 3 months  
- API keys: Every 12 months
- SSL certificates: Before expiration

## 📞 Security Contacts

### Reporting Security Issues
- **Email**: security@nordicfootballbetting.com
- **Escalation**: Critical issues within 1 hour
- **Response**: Acknowledgment within 24 hours

### Responsible Disclosure
We encourage responsible disclosure of security vulnerabilities. Please:
1. Report privately to security team
2. Allow reasonable time for fixes
3. Avoid public disclosure until resolved

## 📚 Security Resources

### Documentation
- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [Next.js Security](https://nextjs.org/docs/advanced-features/security-headers)
- [Supabase RLS Guide](https://supabase.com/docs/guides/auth/row-level-security)
- [Stripe Security](https://stripe.com/docs/security)

### Tools Used
- Zod for input validation
- NextAuth.js for authentication
- Supabase for database security
- Stripe for payment security
- Custom middleware for API protection

---

## ⚠️ Important Security Notes

1. **Never commit secrets** to version control
2. **Rotate credentials** regularly
3. **Monitor security logs** continuously  
4. **Update dependencies** promptly
5. **Test security measures** regularly
6. **Train team members** on security practices
7. **Follow principle** of least privilege
8. **Encrypt sensitive data** at rest and in transit

This security implementation provides enterprise-grade protection for the Nordic Football Betting platform while maintaining excellent user experience. Regular reviews and updates ensure continued security effectiveness.

---
*Last Updated: 2025-01-13*
*Security Review: Pending*