# CI/CD Pipeline Documentation

## Overview

This project uses GitHub Actions for continuous integration and deployment. The CI/CD pipeline automatically tests, builds, and deploys both the frontend React application and the Django backend.

## Workflow Files

### 1. Frontend CI/CD (`frontend-ci.yml`)

**Triggers:** 
- Push to `main` or `develop` branches (Frontend changes only)
- Pull requests to `main` or `develop`

**Jobs:**
- **test-and-build**: Tests on Node.js 18.x and 20.x
  - Installs dependencies
  - Runs ESLint linting
  - Builds the Vite application
  - Uploads build artifacts

- **deploy**: Runs on successful main branch push
  - Downloads build artifacts
  - Deploys to production

**Node.js Versions:** 18.x, 20.x

### 2. Backend CI/CD (`backend-ci.yml`)

**Triggers:**
- Push to `main` or `develop` branches (Backend changes only)
- Pull requests to `main` or `develop`

**Jobs:**
- **test-and-lint**: Tests on Python 3.10, 3.11, 3.12
  - Installs dependencies
  - Runs Flake8 linting
  - Checks code formatting with Black
  - Runs database migrations
  - Executes pytest test suite
  - Uploads coverage reports to Codecov

- **build**: Builds Docker image and collects static files

- **deploy**: Runs on successful main branch push
  - Downloads build artifacts
  - Deploys to production

**Python Versions:** 3.10, 3.11, 3.12

**Database:** PostgreSQL 16 (test instance)

### 3. Security Scan (`security-scan.yml`)

**Triggers:**
- Push to `main` or `develop`
- Pull requests
- Weekly schedule (Sunday at 00:00 UTC)

**Jobs:**
- **backend-security**: Runs Bandit and Safety checks
- **frontend-security**: Runs npm audit
- **dependency-check**: Checks for outdated dependencies

## Setup Instructions

### 1. GitHub Repository Setup

1. Push your code to GitHub
2. Ensure your repository has the `.github/workflows/` directory
3. No additional setup needed - workflows start automatically

### 2. Environment Variables

Set the following secrets in your GitHub repository settings (Settings → Secrets and variables → Actions):

#### Backend Secrets
- `DB_PASSWORD`: Database password for production
- `SECRET_KEY`: Django secret key
- `JWT_SECRET_KEY`: JWT secret key for authentication
- `CORS_ALLOWED_ORIGINS`: Allowed CORS origins

#### Frontend Secrets
- `VITE_API_BASE_URL`: API base URL for production

#### Deployment Secrets (optional)
- `DEPLOY_KEY`: SSH key for deployment server
- `DEPLOY_HOST`: Deployment server hostname
- `DEPLOY_USER`: Deployment user
- `AWS_ACCESS_KEY_ID`: AWS credentials (if using S3)
- `AWS_SECRET_ACCESS_KEY`: AWS credentials (if using S3)

### 3. Local Development

#### Prerequisites
- Docker and Docker Compose installed
- Node.js 18+ and Python 3.10+ for local development without Docker

#### Using Docker Compose

```bash
# Copy environment files
cp Frontend/.env.example Frontend/.env
cp hclBackend/.env.example hclBackend/.env

# Start all services
docker-compose up -d

# Access services
# Frontend: http://localhost:3000
# Backend API: http://localhost:8000
# Database: localhost:5432
```

#### Without Docker

**Backend:**
```bash
cd hclBackend
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt
python manage.py migrate
python manage.py runserver
```

**Frontend:**
```bash
cd Frontend
npm install
npm run dev
```

## Testing

### Backend Tests

```bash
cd hclBackend

# Install test dependencies
pip install pytest pytest-django pytest-cov

# Run all tests
pytest

# Run with coverage
pytest --cov=. --cov-report=html
```

### Frontend Tests

```bash
cd Frontend

# Run linting
npm run lint

# Build
npm run build
```

## Code Quality

### Backend

- **Linter**: Flake8 (max line length: 120)
- **Formatter**: Black (line length: 120)
- **Tests**: pytest with Django

Configuration files:
- `.flake8`: Flake8 configuration
- `pyproject.toml`: Black, isort, and pytest configuration
- `pytest.ini`: pytest configuration

### Frontend

- **Linter**: ESLint
- **Formatter**: Prettier (via Tailwind and PostCSS)
- **Build Tool**: Vite

## Deployment

### Manual Deployment

**Backend:**
```bash
chmod +x hclBackend/deploy.sh
./hclBackend/deploy.sh
```

**Frontend:**
```bash
chmod +x Frontend/deploy.sh
./Frontend/deploy.sh
```

### Automated Deployment

The CI/CD pipeline automatically deploys to production when:
1. Code is pushed to the `main` branch
2. All tests pass
3. Build succeeds

To customize deployment, edit the `deploy` job in the respective workflow file.

### Docker Deployment

```bash
# Build images
docker-compose build

# Start services
docker-compose up -d

# Run migrations
docker-compose exec backend python manage.py migrate

# Create admin user (if needed)
docker-compose exec backend python manage.py createsuperuser
```

## Monitoring & Artifacts

### Build Artifacts

- **Frontend**: Stored for 5 days (Node.js 18.x, 20.x builds)
- **Backend**: Stored for 5 days

### Code Coverage

- Backend coverage reports uploaded to Codecov
- Coverage badge available in README

### Logs

- View workflow logs in GitHub Actions tab
- Failed jobs send notifications (configure in GitHub repository settings)

## Troubleshooting

### Frontend Build Fails

```bash
# Clear cache and reinstall
rm -rf Frontend/node_modules Frontend/package-lock.json
npm ci
npm run build
```

### Backend Tests Fail

```bash
# Check database connection
python manage.py dbshell

# Clear migrations
python manage.py migrate --zero
python manage.py migrate

# Run tests with verbose output
pytest -vv
```

### Docker Issues

```bash
# Rebuild containers
docker-compose down
docker-compose build --no-cache
docker-compose up -d
```

## Best Practices

1. **Feature Branches**: Create feature branches from `develop`
2. **Pull Requests**: All PRs require CI/CD to pass
3. **Commit Messages**: Use conventional commits (feat:, fix:, docs:, etc.)
4. **Testing**: Write tests for new features
5. **Dependencies**: Keep dependencies up-to-date (security scan checks this)

## Additional Resources

- [GitHub Actions Documentation](https://docs.github.com/en/actions)
- [Django Testing](https://docs.djangoproject.com/en/stable/topics/testing/)
- [Vite Documentation](https://vitejs.dev/)
- [Docker Documentation](https://docs.docker.com/)
- [pytest Documentation](https://docs.pytest.org/)

## Support

For issues with CI/CD:
1. Check GitHub Actions logs
2. Review workflow files in `.github/workflows/`
3. Ensure all environment variables are set
4. Test locally with Docker Compose first
