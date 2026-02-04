# HCL Library Management System - Quick Start Guide

## 🚀 Getting Started with CI/CD

This guide helps you set up and use the automated CI/CD pipeline for the HCL Library Management System.

## Prerequisites

- GitHub account with repository access
- Docker and Docker Compose (for local testing)
- Node.js 18+ (for frontend development)
- Python 3.10+ (for backend development)
- Git

## Quick Setup (5 minutes)

### 1. Clone the Repository

```bash
git clone https://github.com/your-username/HCL_Hackathon.git
cd HCL_Hackathon
```

### 2. Environment Configuration

**Backend:**
```bash
cp hclBackend/.env.example hclBackend/.env
# Edit hclBackend/.env with your settings
```

**Frontend:**
```bash
cp Frontend/.env.example Frontend/.env
# Edit Frontend/.env with your settings
```

### 3. Start with Docker Compose

```bash
docker-compose up -d
```

Access:
- Frontend: http://localhost:3000
- Backend: http://localhost:8000
- API Docs: http://localhost:8000/api/ (if available)

### 4. Configure GitHub Secrets

1. Go to GitHub repository → Settings → Secrets and variables → Actions
2. Add the following secrets:
   - `SECRET_KEY`: A random Django secret key
   - `JWT_SECRET_KEY`: A random JWT secret
   - `DB_PASSWORD`: Your database password

## Daily Development Workflow

### Starting Development

```bash
# Option 1: With Docker (recommended)
docker-compose up -d

# Option 2: Local development
# Terminal 1 - Backend
cd hclBackend
python -m venv venv
source venv/bin/activate
pip install -r requirements.txt
python manage.py migrate
python manage.py runserver

# Terminal 2 - Frontend
cd Frontend
npm install
npm run dev
```

### Making Changes

1. Create a feature branch:
   ```bash
   git checkout -b feature/your-feature-name
   ```

2. Make your changes

3. Test locally:
   ```bash
   # Backend
   cd hclBackend
   pytest

   # Frontend
   cd Frontend
   npm run lint
   npm run build
   ```

4. Commit with conventional commits:
   ```bash
   git add .
   git commit -m "feat: add new feature"
   # or: git commit -m "fix: resolve issue"
   # or: git commit -m "docs: update documentation"
   ```

5. Push and create a pull request:
   ```bash
   git push origin feature/your-feature-name
   ```

### CI/CD Process (Automatic)

When you push to GitHub:
1. ✅ Code is linted
2. ✅ Tests are run
3. ✅ Application is built
4. ✅ Security scan runs
5. ✅ Coverage reports generated
6. ✅ If main branch → automatically deployed

## Monitoring CI/CD

### View Pipeline Status

1. Go to GitHub repository
2. Click "Actions" tab
3. Select the workflow you want to monitor
4. Click on the specific run to see details

### Common Status Checks

| Status | Meaning |
|--------|---------|
| ✅ All checks passed | Ready to merge |
| ⏳ Some checks running | Wait for completion |
| ❌ Failed checks | Fix issues before merging |

## Troubleshooting

### Docker Won't Start

```bash
# Check logs
docker-compose logs

# Rebuild containers
docker-compose down
docker-compose build --no-cache
docker-compose up -d
```

### Tests Failing Locally

```bash
# Backend
cd hclBackend
pytest -vv  # Run with verbose output

# Frontend
cd Frontend
npm run lint
```

### CI/CD Failing on GitHub

1. Click on the failed workflow run
2. Review the error logs
3. Fix locally and test before pushing again

## Deployment

### Automatic Deployment (Main Branch)

When you merge to `main` and all checks pass, the application automatically deploys to production.

### Manual Deployment

```bash
# Backend
chmod +x hclBackend/deploy.sh
./hclBackend/deploy.sh

# Frontend
chmod +x Frontend/deploy.sh
./Frontend/deploy.sh
```

## Useful Commands

```bash
# View Docker logs
docker-compose logs -f backend
docker-compose logs -f frontend
docker-compose logs -f postgres

# Run Django commands
docker-compose exec backend python manage.py createsuperuser
docker-compose exec backend python manage.py migrate

# Access containers
docker-compose exec backend bash
docker-compose exec frontend sh

# Stop all services
docker-compose down

# Clean everything (careful!)
docker-compose down -v
```

## Documentation

- Full CI/CD documentation: See [CI-CD-DOCUMENTATION.md](CI-CD-DOCUMENTATION.md)
- Backend API documentation: `http://localhost:8000/api/` (when running)
- Frontend components: Check `Frontend/src/Components/`

## Need Help?

1. Check the [CI-CD-DOCUMENTATION.md](CI-CD-DOCUMENTATION.md) for detailed info
2. Review GitHub Actions logs for specific errors
3. Read workflow files in `.github/workflows/`

## Branch Strategy

```
main          → Production (auto-deploys)
   ↑
   ← (PR required, all checks must pass)
develop       → Staging/Testing
   ↑
   ← (feature branches)
feature/*     → Feature branches
```

## Best Practices

✅ **DO:**
- Write tests for new features
- Use feature branches for development
- Keep commits small and focused
- Update documentation
- Run tests locally before pushing

❌ **DON'T:**
- Push directly to main
- Ignore failing CI/CD checks
- Commit sensitive data (.env files)
- Leave debugging code
- Skip testing

## Happy Coding! 🎉

Your CI/CD pipeline is now ready to automate testing and deployment. Start coding, make pull requests, and let the pipeline handle the rest!
