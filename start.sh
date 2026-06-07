#!/bin/bash
set -e

cd /home/runner/workspace/snipe-it-next

# Set NEXTAUTH_URL for production (REPLIT_DOMAINS is set in deployed environments)
export NEXTAUTH_URL="https://${REPLIT_DOMAINS:-$REPLIT_DEV_DOMAIN}"

echo "Installing dependencies..."
npm install

echo "Generating Prisma client..."
npx prisma generate

echo "Building Next.js app..."
npm run build

echo "Starting Next.js production server on port 5000..."
exec npm start -- -p 5000
