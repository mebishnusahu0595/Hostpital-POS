#!/bin/bash

# Centralized Medical Solutions - Production Deployment Script

echo "🚀 Starting Deployment..."

# Navigate to project root
cd /var/www/cms-platform

# Pull latest changes (optional if running locally)
# git pull origin main

# Backend Deployment
echo "📦 Building Backend..."
cd backend
npm install
npm run build
pm2 delete cms-backend || true
pm2 start dist/server.js --name "cms-backend"

# Frontend Deployment
echo "📦 Building Frontend..."
cd ../frontend
npm install
npm run build
pm2 delete cms-frontend || true
pm2 start npm --name "cms-frontend" -- start

echo "✅ Deployment Complete!"
pm2 save
pm2 status
