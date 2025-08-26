#!/bin/bash
# Custom build script for Render deployment

echo "Starting Render build process..."

# Ensure we're using the right npm version
echo "Node version: $(node -v)"
echo "NPM version: $(npm -v)"

# Clean install dependencies with legacy peer deps to handle React 19 RC
echo "Installing dependencies with legacy peer deps..."
npm install --legacy-peer-deps

# Generate Prisma client
echo "Generating Prisma client..."
./node_modules/.bin/prisma generate || npx prisma generate || prisma generate

# Push database schema with force accept data loss for initial deployment
echo "Pushing database schema to Supabase..."
./node_modules/.bin/prisma db push --accept-data-loss || npx prisma db push --accept-data-loss || prisma db push --accept-data-loss

# Build Next.js application
echo "Building Next.js application..."
./node_modules/.bin/next build || npx next build || npm run build

echo "Verifying build artifacts..."
if [ -d ".next" ]; then
    echo "Build artifacts found in .next directory"
    ls -la .next/
else
    echo "WARNING: .next directory not found!"
    echo "Attempting alternative build..."
    npm run build
fi

echo "Build complete!"