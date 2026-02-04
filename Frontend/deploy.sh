#!/bin/bash

# Frontend Deployment Script
set -e

echo "🚀 Deploying Frontend..."

# Pull latest changes
git pull origin main

# Install dependencies
cd Frontend
npm ci

# Build application
npm run build

# Deploy to static hosting
# Example for AWS S3:
# aws s3 sync dist/ s3://your-bucket-name --delete

# Example for Vercel:
# vercel deploy --prod

# Example for Netlify:
# netlify deploy --prod --dir=dist

# Copy to web server (example)
# sudo cp -r dist/* /var/www/hcl-frontend/

echo "✅ Frontend deployment complete!"
