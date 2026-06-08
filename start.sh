#!/bin/bash
set -e

cd snipe-it-next

echo "Installing dependencies..."
npm ci

echo "Generating Prisma client..."
npx prisma generate

echo "Building Next.js app..."
npm run build

echo "Starting Next.js production server..."
exec npm start
