#!/bin/bash

# Backend Deployment Script
set -e

echo "🚀 Deploying Backend..."

# Pull latest changes
git pull origin main

# Install dependencies
cd hclBackend
pip install -r requirements.txt

# Run migrations
python manage.py migrate

# Collect static files
python manage.py collectstatic --noinput

# Restart Django service (adjust based on your deployment method)
# Example for systemd:
# sudo systemctl restart hcl-backend

# Example for Docker:
docker-compose up -d backend

echo "✅ Backend deployment complete!"
