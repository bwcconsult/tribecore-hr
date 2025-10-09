# TribeCore Development Guide

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ and npm
- PostgreSQL 14+
- Redis
- Docker (optional)

### Local Development Setup

#### 1. Clone and Install

```bash
cd TribeCore

# Install backend dependencies
cd backend
npm install

# Install frontend dependencies
cd ../frontend
npm install
```

#### 2. Setup Environment Variables

**Backend (.env)**
```bash
cd backend
cp .env.example .env
# Edit .env with your configuration
```

**Frontend (.env)**
```bash
cd frontend
cp .env.example .env
# Edit .env with your configuration
```

#### 3. Database Setup

```bash
# Start PostgreSQL and Redis
# Option 1: Using Docker
docker-compose up -d postgres redis

# Option 2: Use local installations
```

#### 4. Run Development Servers

```bash
# Terminal 1 - Backend
cd backend
npm run start:dev

# Terminal 2 - Frontend
cd frontend
npm run dev
```

Access the application:
- Frontend: http://localhost:5173
- Backend API: http://localhost:3000/api/v1
- API Documentation: http://localhost:3000/api/v1/docs

## 📁 Project Structure

```
TribeCore/
├── backend/              # NestJS Backend
│   ├── src/
│   │   ├── modules/     # Feature modules
│   │   ├── common/      # Shared utilities
│   │   └── config/      # Configuration
│   └── package.json
├── frontend/            # React Frontend
│   ├── src/
│   │   ├── components/  # UI components
│   │   ├── pages/       # Page components
│   │   ├── services/    # API services
│   │   ├── stores/      # State management
│   │   └── lib/         # Utilities
│   └── package.json
└── docker-compose.yml
```

## 🛠️ Available Scripts

### Backend
- `npm run start:dev` - Start development server
- `npm run build` - Build for production
- `npm run test` - Run tests
- `npm run migration:generate` - Generate migration
- `npm run migration:run` - Run migrations

### Frontend
- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build

## 📊 Database Migrations

```bash
cd backend

# Generate migration
npm run migration:generate -- -n MigrationName

# Run migrations
npm run migration:run

# Revert migration
npm run migration:revert
```

## 🧪 Testing

```bash
# Backend tests
cd backend
npm run test
npm run test:e2e

# Frontend tests
cd frontend
npm run test
```

## 🐳 Docker Deployment

```bash
# Build and run all services
docker-compose up -d

# View logs
docker-compose logs -f

# Stop services
docker-compose down
```

## 📝 Code Style

- ESLint for code linting
- Prettier for code formatting

```bash
# Backend
cd backend
npm run lint
npm run format

# Frontend
cd frontend
npm run lint
```

## 🔐 Security Best Practices

1. Never commit .env files
2. Use environment variables for secrets
3. Implement rate limiting
4. Use HTTPS in production
5. Keep dependencies updated

## 📚 Additional Resources

- [NestJS Documentation](https://docs.nestjs.com)
- [React Documentation](https://react.dev)
- [TailwindCSS Documentation](https://tailwindcss.com/docs)
