#!/bin/bash

# ===============================================
# Nordic Football Betting - Secret Generation Script
# ===============================================
# 
# This script generates secure secrets for production deployment
# 
# Usage:
#   chmod +x scripts/generate-secrets.sh
#   ./scripts/generate-secrets.sh
# 
# Windows users can run this in Git Bash or WSL

echo "🔐 Nordic Football Betting - Secret Generation"
echo "=============================================="
echo ""

# Check if OpenSSL is available
if ! command -v openssl &> /dev/null; then
    echo "❌ OpenSSL is required but not installed."
    echo "Please install OpenSSL and try again."
    exit 1
fi

echo "Generating secure secrets for production deployment..."
echo ""

# Generate NEXTAUTH_SECRET (64 characters base64)
echo "🔑 NEXTAUTH_SECRET (64 characters, base64):"
NEXTAUTH_SECRET=$(openssl rand -base64 64 | tr -d '\n')
echo "NEXTAUTH_SECRET=$NEXTAUTH_SECRET"
echo ""

# Generate ENCRYPTION_KEY (32 bytes = 64 hex characters)
echo "🔒 ENCRYPTION_KEY (32 bytes, hex encoded):"
ENCRYPTION_KEY=$(openssl rand -hex 32)
echo "ENCRYPTION_KEY=$ENCRYPTION_KEY"
echo ""

# Generate ADMIN_SECRET_KEY
echo "🔐 ADMIN_SECRET_KEY (API access):"
ADMIN_SECRET_KEY=$(openssl rand -base64 32 | tr -d '\n')
echo "ADMIN_SECRET_KEY=$ADMIN_SECRET_KEY"
echo ""

# Generate a secure admin password suggestion
echo "🛡️  ADMIN_PASSWORD (suggestion):"
ADMIN_PASSWORD=$(openssl rand -base64 24 | tr -d '\n' | sed 's/[+/=]//g' | head -c 20)
echo "ADMIN_PASSWORD=${ADMIN_PASSWORD}@2024!"
echo ""

# Generate JWT secret for additional security
echo "🎫 Additional JWT Secret (if needed):"
JWT_SECRET=$(openssl rand -base64 48 | tr -d '\n')
echo "JWT_SECRET=$JWT_SECRET"
echo ""

echo "=============================================="
echo "✅ Secret generation complete!"
echo ""
echo "📝 Next steps:"
echo "1. Copy the secrets above to your .env.production file"
echo "2. Set up your database connection string"
echo "3. Configure Supabase URL and keys"
echo "4. Set up Stripe keys and webhook secret"
echo "5. Run environment validation: npm run validate-env"
echo ""
echo "⚠️  Security reminders:"
echo "- Never commit these secrets to version control"
echo "- Store them securely in your deployment platform"
echo "- Rotate secrets regularly (quarterly recommended)"
echo "- Use different secrets for staging and production"
echo ""

# Optional: Save to a secure file
read -p "💾 Save secrets to secure file? (y/N): " save_file
if [[ $save_file =~ ^[Yy]$ ]]; then
    TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
    SECRET_FILE="secrets_${TIMESTAMP}.txt"
    
    cat > "$SECRET_FILE" << EOF
# Nordic Football Betting - Generated Secrets
# Generated: $(date)
# 
# IMPORTANT: Store these securely and delete this file after use

NEXTAUTH_SECRET=$NEXTAUTH_SECRET
ENCRYPTION_KEY=$ENCRYPTION_KEY
ADMIN_SECRET_KEY=$ADMIN_SECRET_KEY
ADMIN_PASSWORD=${ADMIN_PASSWORD}@2024!
JWT_SECRET=$JWT_SECRET

# Additional notes:
# - Use these in your .env.production file
# - Never commit to version control
# - Rotate quarterly for security
EOF

    echo "💾 Secrets saved to: $SECRET_FILE"
    echo "🗑️  Remember to delete this file after copying to your environment!"
fi

echo ""
echo "🚀 Ready for production deployment!"