#!/bin/bash
# Custom build script for Render deployment

echo "Starting Render build process..."

# Ensure we're using the right npm version
echo "Node version: $(node -v)"
echo "NPM version: $(npm -v)"

# Clean install dependencies
echo "Installing dependencies..."
npm ci || npm install

# Generate Prisma client
echo "Generating Prisma client..."
./node_modules/.bin/prisma generate || npx prisma generate || prisma generate

# Push database schema
echo "Pushing database schema to Supabase..."
./node_modules/.bin/prisma db push || npx prisma db push || prisma db push

# Build Next.js application
echo "Building Next.js application..."
npm run build

echo "Build complete!"