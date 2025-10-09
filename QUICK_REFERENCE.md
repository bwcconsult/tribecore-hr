# ⚡ TribeCore Quick Reference Card

## 🎯 One-Command Setup

```bash
# Windows
.\setup.ps1

# Mac/Linux  
chmod +x setup.sh && ./setup.sh

# With npm
npm run setup
```

---

## 🚀 Start Commands

```bash
# Docker (Easiest)
docker-compose up -d

# Manual (Two terminals)
cd backend && npm run start:dev    # Terminal 1
cd frontend && npm run dev          # Terminal 2

# Both at once (requires setup)
npm run dev
```

---

## 🌐 Access URLs

| Service | URL | Description |
|---------|-----|-------------|
| **Frontend** | http://localhost:5173 | Main Application |
| **Backend API** | http://localhost:3000/api/v1 | REST API |
| **API Docs** | http://localhost:3000/api/v1/docs | Swagger Documentation |
| **Database** | localhost:5432 | PostgreSQL |
| **Redis** | localhost:6379 | Cache |

---

## 📁 Project Structure

```
TribeCore/
├── backend/          # NestJS API
│   ├── src/
│   │   ├── modules/  # 15 Feature Modules
│   │   ├── common/   # Shared Code
│   │   └── main.ts   # Entry Point
│   └── .env          # Configuration
│
├── frontend/         # React UI
│   ├── src/
│   │   ├── pages/    # 15 Pages
│   │   ├── components/ # UI Components
│   │   └── services/ # API Calls
│   └── .env          # Configuration
│
└── docker-compose.yml # Docker Setup
```

---

## 🎨 15 Core Modules

| Module | Backend | Frontend | Description |
|--------|---------|----------|-------------|
| 👤 **Auth** | ✅ | ✅ | Login, Register, JWT |
| 👥 **Employees** | ✅ | ✅ | Employee Management |
| 💼 **Recruitment** | ✅ | ✅ | ATS, Job Postings |
| 🎯 **Onboarding** | ✅ | ✅ | Workflow Automation |
| ⏱️ **Time Tracking** | ✅ | ✅ | Project Time Tracking |
| 📅 **Attendance** | ✅ | ✅ | Clock In/Out |
| 🏖️ **Leave** | ✅ | ✅ | Leave Requests |
| 💰 **Payroll** | ✅ | ✅ | Multi-Country Payroll |
| ❤️ **Benefits** | ✅ | ✅ | Benefits Admin |
| 🧾 **Expenses** | ✅ | ✅ | Expense Management |
| ⭐ **Performance** | ✅ | ✅ | Reviews, 360° Feedback |
| 🎓 **Learning** | ✅ | ✅ | LMS, Courses |
| 📊 **Analytics** | ✅ | ✅ | AI Insights |
| 📈 **Reports** | ✅ | ✅ | Custom Reports |
| ⚙️ **Settings** | ✅ | ✅ | Configuration |

---

## 🔑 Environment Variables

### Backend (.env)
```env
DATABASE_HOST=localhost
DATABASE_PORT=5432
DATABASE_NAME=tribecore
DATABASE_USER=postgres
DATABASE_PASSWORD=your_password
JWT_SECRET=your-32-char-secret-key
REDIS_HOST=localhost
REDIS_PORT=6379
```

### Frontend (.env)
```env
VITE_API_URL=http://localhost:3000/api/v1
```

---

## 🛠️ Common Commands

### Development
```bash
# Install dependencies
cd backend && npm install
cd frontend && npm install

# Start development
npm run dev                    # Both services
docker-compose up -d          # With Docker

# View logs
docker-compose logs -f        # All services
docker-compose logs -f backend # Backend only
```

### Building
```bash
npm run build                 # Build both
npm run build:backend         # Backend only
npm run build:frontend        # Frontend only
```

### Testing
```bash
npm run test                  # Test both
npm run test:backend          # Backend tests
npm run test:frontend         # Frontend tests
```

### Docker
```bash
docker-compose up -d          # Start all
docker-compose down           # Stop all
docker-compose ps             # Check status
docker-compose logs -f        # View logs
docker-compose restart        # Restart all
```

---

## 🐛 Troubleshooting

### TypeScript Errors?
```bash
# Install dependencies (fixes all TS errors)
cd backend && npm install
cd frontend && npm install
```

### Port Already in Use?
```bash
# Windows - Find and kill process
netstat -ano | findstr :3000
taskkill /PID <PID> /F

# Mac/Linux
lsof -ti:3000 | xargs kill -9
```

### Database Connection Failed?
```bash
# Check PostgreSQL is running
docker ps | grep postgres

# Or start database only
docker-compose up -d postgres
```

### Can't Access Frontend?
```bash
# Clear browser cache
# Check console for errors
# Verify API URL in frontend/.env
```

---

## 📊 Tech Stack

### Backend
- **Framework:** NestJS
- **Language:** TypeScript
- **Database:** PostgreSQL
- **ORM:** TypeORM
- **Cache:** Redis
- **Auth:** JWT + Passport

### Frontend
- **Framework:** React 18
- **Language:** TypeScript
- **Styling:** TailwindCSS
- **State:** Zustand
- **Data:** React Query
- **Router:** React Router v6

---

## 🎯 Key Features vs Competitors

| Feature | TribeCore | Workday | ADP | Rippling |
|---------|-----------|---------|-----|----------|
| **Modules** | 15 | 12 | 10 | 11 |
| **Price** | $19+ | $99+ | $60+ | $35+ |
| **Setup** | 30 min | 6 mo | 4 mo | 1 wk |
| **Africa** | ✅ | ❌ | ❌ | ❌ |
| **LMS** | ✅ | ✅ | ❌ | ❌ |
| **ATS** | ✅ | ✅ | ❌ | ❌ |

---

## 📚 Documentation Files

| File | Purpose |
|------|---------|
| `README.md` | Project overview |
| `INSTALLATION_GUIDE.md` | Detailed setup |
| `DEVELOPMENT.md` | Development workflow |
| `DEPLOYMENT.md` | Production deployment |
| `API_DOCUMENTATION.md` | API reference |
| `FEATURE_COMPARISON.md` | vs Competitors |
| `SECURITY.md` | Security practices |
| `ROADMAP.md` | Future plans |
| `FINAL_SUMMARY.md` | Complete overview |

---

## 🔐 Default Credentials

**No defaults - you create the first account at:**
http://localhost:5173/register

---

## 📞 Need Help?

1. Check `INSTALLATION_GUIDE.md` for step-by-step setup
2. Read `TROUBLESHOOTING.md` for common issues
3. Review logs: `docker-compose logs -f`
4. Check browser console for frontend errors
5. Verify environment variables are set correctly

---

## ✅ Launch Checklist

- [ ] Dependencies installed (`npm install` in both folders)
- [ ] Environment files configured (`.env` in both folders)
- [ ] Database running (PostgreSQL)
- [ ] Redis running (optional)
- [ ] Backend started (port 3000)
- [ ] Frontend started (port 5173)
- [ ] Can access http://localhost:5173
- [ ] Can register a new account
- [ ] Can login successfully
- [ ] All modules accessible

---

## 🚀 Production Deployment

```bash
# 1. Build for production
npm run build

# 2. Use production Docker Compose
docker-compose -f docker-compose.prod.yml up -d

# 3. Or follow DEPLOYMENT.md for AWS/Azure/GCP
```

---

## 💡 Pro Tips

1. **Use Docker** - Easiest way to get started
2. **Setup scripts** - Run `setup.ps1` or `setup.sh` for auto-install
3. **API Docs** - Visit `/api/v1/docs` for interactive API testing
4. **Hot Reload** - Code changes auto-reload in dev mode
5. **Type Safety** - TypeScript catches errors before runtime

---

**⚡ TribeCore - The World's Best HR Platform**

*Installation: 5 minutes | Setup: 30 minutes | Domination: Immediate*
