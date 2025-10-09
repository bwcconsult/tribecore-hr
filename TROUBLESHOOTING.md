# 🔧 TribeCore Troubleshooting Guide

**Having issues? This guide covers common problems and solutions.**

---

## 🎯 Quick Diagnostics

### Run the Verification Script

```bash
node verify-setup.js
```

This will check:
- ✅ Prerequisites (Node.js, npm)
- ✅ Project structure
- ✅ Dependencies installed
- ✅ Environment configuration
- ✅ Documentation files

---

## 🐛 Common Issues & Solutions

### Issue 1: TypeScript Errors in IDE

**Symptoms:**
```
Cannot find module '@nestjs/common'
Cannot find module 'react-router-dom'
Cannot find module 'lucide-react'
```

**Why This Happens:**
- Dependencies haven't been installed yet
- IDE is checking files before npm install completes

**Solution:**
```bash
# Install backend dependencies
cd backend
npm install

# Install frontend dependencies
cd ../frontend
npm install

# Restart your IDE/Editor
# Close and reopen VS Code/your editor
```

**✅ Expected Result:** All red squiggly lines disappear

---

### Issue 2: Port Already in Use

**Symptoms:**
```
Error: listen EADDRINUSE: address already in use :::3000
Error: Port 5173 is already in use
```

**Solution for Port 3000 (Backend):**

**Windows:**
```powershell
# Find the process
netstat -ano | findstr :3000

# Kill the process (replace PID with actual number)
taskkill /PID <PID> /F
```

**Mac/Linux:**
```bash
# Find and kill the process
lsof -ti:3000 | xargs kill -9
```

**Solution for Port 5173 (Frontend):**

Vite will automatically use the next available port (5174, 5175, etc.)

**Alternative:** Change the port in `frontend/vite.config.ts`:
```typescript
server: {
  port: 5174, // Use different port
}
```

---

### Issue 3: Database Connection Failed

**Symptoms:**
```
Error: connect ECONNREFUSED 127.0.0.1:5432
Unable to connect to the database
```

**Check PostgreSQL is Running:**

**Docker:**
```bash
docker ps | grep postgres
```

**Local PostgreSQL (Windows):**
1. Open Services (services.msc)
2. Find "PostgreSQL"
3. Ensure it's running

**Local PostgreSQL (Mac):**
```bash
brew services list
```

**Solution 1: Start PostgreSQL with Docker**
```bash
docker-compose up -d postgres
```

**Solution 2: Verify Credentials**

Check `backend/.env`:
```env
DATABASE_HOST=localhost
DATABASE_PORT=5432
DATABASE_NAME=tribecore
DATABASE_USER=postgres
DATABASE_PASSWORD=your_password  # ← Must match your database
```

**Solution 3: Create Database**
```bash
# Connect to PostgreSQL
psql -U postgres

# Create database
CREATE DATABASE tribecore;

# Exit
\q
```

**Solution 4: Check Database URL**

Test connection:
```bash
psql -h localhost -U postgres -d tribecore
```

---

### Issue 4: Redis Connection Failed

**Symptoms:**
```
Error: connect ECONNREFUSED 127.0.0.1:6379
Redis connection failed
```

**Solution 1: Start Redis with Docker**
```bash
docker-compose up -d redis
```

**Solution 2: Install Redis Locally**

**Windows:**
- Download from https://github.com/microsoftarchive/redis/releases

**Mac:**
```bash
brew install redis
brew services start redis
```

**Linux:**
```bash
sudo apt-get install redis-server
sudo systemctl start redis
```

**Solution 3: Disable Redis Temporarily**

Comment out Redis in `backend/src/app.module.ts` if not needed initially.

---

### Issue 5: npm install Fails

**Symptoms:**
```
npm ERR! code ERESOLVE
npm ERR! EACCES: permission denied
npm ERR! network timeout
```

**Solution 1: Clear npm Cache**
```bash
npm cache clean --force
```

**Solution 2: Delete node_modules**
```bash
# Windows PowerShell
Remove-Item -Recurse -Force node_modules
Remove-Item package-lock.json

# Mac/Linux
rm -rf node_modules package-lock.json

# Try again
npm install
```

**Solution 3: Use Different Registry**
```bash
npm install --registry=https://registry.npmjs.org/
```

**Solution 4: Check Node Version**
```bash
node --version  # Should be 18+

# Update if needed
# Download from nodejs.org
```

**Solution 5: Run as Administrator (Windows)**
```powershell
# Right-click PowerShell → Run as Administrator
npm install
```

---

### Issue 6: Frontend Shows Blank Page

**Symptoms:**
- Browser shows empty white screen
- Loading forever
- No content visible

**Solution 1: Check Browser Console**
1. Press F12 to open Developer Tools
2. Go to Console tab
3. Look for error messages

**Solution 2: Verify API URL**

Check `frontend/.env`:
```env
VITE_API_URL=http://localhost:3000/api/v1
```

**Solution 3: Check Backend is Running**
```bash
# Test backend
curl http://localhost:3000/health

# Should return: {"status":"ok"}
```

**Solution 4: Clear Browser Cache**
- Chrome: Ctrl+Shift+Delete
- Clear "Cached images and files"
- Reload page (Ctrl+R)

**Solution 5: Check Network Tab**
1. F12 → Network tab
2. Reload page
3. Look for failed requests (red)
4. Check if API calls are reaching backend

---

### Issue 7: Docker Issues

**Symptoms:**
```
docker: Error response from daemon
docker-compose: command not found
Cannot connect to Docker daemon
```

**Solution 1: Start Docker Desktop**
- Windows/Mac: Open Docker Desktop application
- Wait for Docker to start (whale icon)

**Solution 2: Check Docker is Running**
```bash
docker --version
docker-compose --version
docker ps
```

**Solution 3: Restart Docker**
- Close Docker Desktop
- Reopen Docker Desktop
- Wait 2-3 minutes

**Solution 4: Check Docker Resources**
- Docker Desktop → Settings → Resources
- Increase CPU/Memory if needed
- Minimum: 2GB RAM, 2 CPUs

**Solution 5: Rebuild Containers**
```bash
# Stop and remove everything
docker-compose down -v

# Rebuild and start
docker-compose up -d --build
```

---

### Issue 8: CORS Errors

**Symptoms:**
```
Access to fetch at 'http://localhost:3000' from origin 'http://localhost:5173' has been blocked by CORS policy
```

**Solution:** Check `backend/src/main.ts`:
```typescript
app.enableCors({
  origin: 'http://localhost:5173',
  credentials: true,
});
```

If using different ports, update the origin.

---

### Issue 9: JWT Token Issues

**Symptoms:**
```
401 Unauthorized
Invalid token
Token expired
```

**Solution 1: Check JWT Secret**

Verify `backend/.env` has JWT_SECRET set:
```env
JWT_SECRET=your-32-character-secret-key-here
```

**Solution 2: Clear localStorage**

In browser console (F12):
```javascript
localStorage.clear()
```

Then refresh and login again.

**Solution 3: Check Token Expiration**

Default is 7 days. Change in `backend/.env`:
```env
JWT_EXPIRATION=7d
```

---

### Issue 10: Build Fails

**Symptoms:**
```
npm run build fails
TypeScript compilation errors
Module not found in production
```

**Solution 1: Check TypeScript Errors**
```bash
cd backend
npm run build

# Fix any TypeScript errors shown
```

**Solution 2: Clean Build**
```bash
# Backend
cd backend
rm -rf dist
npm run build

# Frontend
cd frontend
rm -rf dist
npm run build
```

**Solution 3: Check tsconfig.json**

Ensure `backend/tsconfig.json` is correct:
```json
{
  "compilerOptions": {
    "module": "commonjs",
    "target": "ES2021",
    "outDir": "./dist"
  }
}
```

---

### Issue 11: Module Import Errors

**Symptoms:**
```
Error: Cannot find module '@/components/...'
Error: Cannot resolve path alias
```

**Solution:** Check path aliases:

**Backend (`backend/tsconfig.json`):**
```json
{
  "compilerOptions": {
    "baseUrl": "./",
    "paths": {
      "@/*": ["src/*"]
    }
  }
}
```

**Frontend (`frontend/vite.config.ts`):**
```typescript
resolve: {
  alias: {
    '@': path.resolve(__dirname, './src'),
  },
},
```

---

### Issue 12: Environment Variables Not Working

**Symptoms:**
- Config values are undefined
- Environment variables not loading
- Default values being used

**Solution 1: Check File Names**
- Backend: `backend/.env` (not .env.example)
- Frontend: `frontend/.env` (not .env.example)

**Solution 2: Restart Servers**

Environment changes require restart:
```bash
# Stop servers (Ctrl+C)
# Start again
npm run dev
```

**Solution 3: Check Variable Names**

**Backend:** Use as-is
```env
DATABASE_HOST=localhost
```

**Frontend:** Must start with `VITE_`
```env
VITE_API_URL=http://localhost:3000
```

**Solution 4: No Quotes Needed**
```env
# ✅ Correct
DATABASE_HOST=localhost

# ❌ Wrong
DATABASE_HOST="localhost"
```

---

### Issue 13: Database Migrations Failed

**Symptoms:**
```
Error: Relation does not exist
Table not found
Migration failed
```

**Solution 1: Let TypeORM Auto-Create**

In development, set in `backend/.env`:
```env
NODE_ENV=development
```

TypeORM will auto-create tables.

**Solution 2: Manual Migration**
```bash
cd backend
npm run typeorm migration:run
```

**Solution 3: Reset Database**

**WARNING: This deletes all data!**
```bash
# Drop and recreate database
psql -U postgres -c "DROP DATABASE tribecore;"
psql -U postgres -c "CREATE DATABASE tribecore;"

# Restart backend (tables will be created)
npm run start:dev
```

---

### Issue 14: File Upload Issues

**Symptoms:**
```
File upload fails
413 Payload Too Large
No file received
```

**Solution 1: Check File Size Limit**

Backend (`backend/src/main.ts`):
```typescript
app.use(json({ limit: '50mb' }));
app.use(urlencoded({ extended: true, limit: '50mb' }));
```

**Solution 2: Check Multer Config**

See `backend/src/modules/documents/documents.controller.ts`

**Solution 3: Check Storage**

Ensure upload directory exists and is writable.

---

### Issue 15: Performance Issues

**Symptoms:**
- Slow API responses
- High memory usage
- Database queries taking too long

**Solution 1: Add Database Indexes**

Check entities have proper indexes:
```typescript
@Index(['email'])
@Index(['organizationId'])
```

**Solution 2: Enable Query Logging**

In `backend/.env`:
```env
DATABASE_LOGGING=true
```

Check for slow queries in logs.

**Solution 3: Optimize Queries**

Use select to fetch only needed fields:
```typescript
.select(['employee.id', 'employee.firstName'])
```

**Solution 4: Use Pagination**

Always paginate large result sets.

**Solution 5: Enable Redis Caching**

Cache frequently accessed data in Redis.

---

## 🔍 Debugging Tools

### Backend Debugging

**Enable Debug Logging:**
```env
# backend/.env
NODE_ENV=development
LOG_LEVEL=debug
```

**View All Logs:**
```bash
# Docker
docker-compose logs -f backend

# Manual
# Check terminal output
```

**Test API Endpoints:**
```bash
# Health check
curl http://localhost:3000/health

# Swagger UI
# Open: http://localhost:3000/api/v1/docs
```

### Frontend Debugging

**React Developer Tools:**
- Install Chrome extension
- Inspect component state

**Redux DevTools (if using Redux):**
- Install browser extension

**Network Debugging:**
1. F12 → Network tab
2. Filter by "XHR"
3. Check API requests/responses

**Console Logging:**
```javascript
console.log('Debug info:', data);
```

---

## 📞 Getting More Help

### Check Documentation
- `INSTALLATION_GUIDE.md` - Full setup guide
- `GETTING_STARTED.md` - Step-by-step tutorial
- `DEVELOPMENT.md` - Development workflow
- `API_DOCUMENTATION.md` - API reference

### Run Verification
```bash
node verify-setup.js
```

### Check Logs
```bash
# Docker logs
docker-compose logs -f

# Backend logs
cd backend && npm run start:dev

# Frontend logs
cd frontend && npm run dev
```

### Community Resources
- NestJS Docs: https://docs.nestjs.com
- React Docs: https://react.dev
- TypeORM Docs: https://typeorm.io
- Stack Overflow: Search for specific errors

---

## ✅ Prevention Checklist

To avoid common issues:

- [ ] Always run `npm install` after git pull
- [ ] Restart servers after changing .env
- [ ] Clear browser cache when frontend changes
- [ ] Check Docker has enough resources
- [ ] Keep Node.js updated (18+)
- [ ] Backup database before migrations
- [ ] Use version control (git)
- [ ] Test in clean environment occasionally

---

## 🆘 Still Stuck?

### Step-by-Step Debugging:

1. **Run verification script**
   ```bash
   node verify-setup.js
   ```

2. **Check prerequisites**
   ```bash
   node --version  # 18+
   npm --version
   docker --version
   ```

3. **Verify dependencies**
   ```bash
   ls backend/node_modules
   ls frontend/node_modules
   ```

4. **Check environment**
   ```bash
   cat backend/.env
   cat frontend/.env
   ```

5. **Test database**
   ```bash
   psql -h localhost -U postgres -d tribecore
   ```

6. **Check logs**
   ```bash
   docker-compose logs -f
   ```

7. **Try clean install**
   ```bash
   npm run clean
   npm run setup
   ```

---

**Most issues are solved by:**
1. ✅ Running `npm install` in both folders
2. ✅ Configuring `.env` files correctly
3. ✅ Ensuring database is running
4. ✅ Restarting servers after changes

**Good luck! 🚀**

---

*Last Updated: January 9, 2025*
