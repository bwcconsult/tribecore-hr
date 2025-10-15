# 🔧 Deployment Fix Guide

## Issues Found

### ❌ Issue 1: Backend Database Sync Error
```
QueryFailedError: relation "IDX_05ba2e256c86180a7855f9de2c" already exists
```

### ❌ Issue 2: Frontend Missing Dependencies
```
[vite]: Rollup failed to resolve import "@hello-pangea/dnd"
```

---

## ✅ SOLUTIONS

### **Solution 1: Fix Frontend (DONE)**

Added missing dependency to `frontend/package.json`:
```json
"@hello-pangea/dnd": "^16.5.0"
```

**Action Required:**
```bash
cd frontend
npm install
git add package.json
git commit -m "fix: add missing @hello-pangea/dnd dependency"
git push origin main
```

---

### **Solution 2: Fix Backend Database Sync**

The issue occurs because `DATABASE_SYNC=true` is trying to recreate indexes that already exist in the database.

#### **Option A: Disable Auto-Sync (RECOMMENDED)**

Set environment variable in Railway/Netlify:
```bash
DATABASE_SYNC=false
```

This is the **safest option** for production since your database schema already exists.

#### **Option B: Drop Conflicting Index**

If you need to run migrations, first drop the conflicting index:

```sql
-- Connect to your PostgreSQL database
DROP INDEX IF EXISTS "IDX_05ba2e256c86180a7855f9de2c";

-- Then restart the backend with DATABASE_SYNC=true
```

#### **Option C: Fresh Database (NUCLEAR OPTION)**

⚠️ **WARNING: This will DELETE ALL DATA** ⚠️

Only do this in development/staging:

```sql
-- Drop all recruitment tables
DROP TABLE IF EXISTS recruitment_attachments CASCADE;
DROP TABLE IF EXISTS recruitment_watchers CASCADE;
DROP TABLE IF EXISTS recruitment_stage_logs CASCADE;
DROP TABLE IF EXISTS recruitment_notes CASCADE;
DROP TABLE IF EXISTS recruitment_checks CASCADE;
DROP TABLE IF EXISTS recruitment_scorecards CASCADE;
DROP TABLE IF EXISTS recruitment_interviews CASCADE;
DROP TABLE IF EXISTS recruitment_offers CASCADE;
DROP TABLE IF EXISTS recruitment_applications CASCADE;
DROP TABLE IF EXISTS recruitment_job_postings CASCADE;
DROP TABLE IF EXISTS recruitment_candidates CASCADE;
DROP TABLE IF EXISTS recruitment_requisitions CASCADE;

-- Restart backend with DATABASE_SYNC=true to recreate
```

---

## 🚀 **RECOMMENDED FIX (FASTEST)**

### Step 1: Update Environment Variables

**In Railway (Backend):**
1. Go to your Railway project
2. Click on Variables
3. Set: `DATABASE_SYNC=false`
4. Redeploy

**In Netlify (Frontend):**
- Already configured correctly with `VITE_API_URL`

### Step 2: Install Frontend Dependencies & Deploy

```bash
cd frontend
npm install
git add package.json package-lock.json
git commit -m "fix: add missing dependencies for recruitment module"
git push origin main
```

### Step 3: Verify Deployment

```bash
# Check backend logs in Railway
# Should see: "Application is running on: http://0.0.0.0:3000"

# Check frontend build in Netlify
# Should see: "✓ built in X.XXs"
```

---

## 📋 **QUICK CHECKLIST**

- [ ] Set `DATABASE_SYNC=false` in Railway
- [ ] Run `npm install` in frontend directory
- [ ] Commit and push package.json changes
- [ ] Wait for auto-deploy
- [ ] Check deployment logs
- [ ] Test application

---

## 🔍 **WHY THIS HAPPENED**

### Backend Issue
- The database already had recruitment tables from a previous deployment
- `DATABASE_SYNC=true` tried to recreate indexes
- TypeORM doesn't handle "IF NOT EXISTS" well for indexes
- **Solution**: Use `DATABASE_SYNC=false` in production

### Frontend Issue
- The PipelinePage uses `@hello-pangea/dnd` for drag-and-drop
- This dependency was mentioned in docs but not added to package.json
- **Solution**: Added to dependencies

---

## ✅ **EXPECTED RESULT AFTER FIX**

### Backend
```
[Nest] INFO  [NestApplication] Nest application successfully started
[Nest] INFO  [RoutesResolver] RecruitmentController {/api/v1/recruitment}
[Nest] INFO  Application is running on: http://0.0.0.0:3000
```

### Frontend
```
vite v5.4.20 building for production...
✓ 1234 modules transformed.
✓ built in 8.45s
Build complete!
```

---

## 📞 **IF ISSUES PERSIST**

1. **Check Railway Logs**: Look for actual errors (not retries)
2. **Check Database**: Verify tables exist with `\dt` in psql
3. **Clear Build Cache**: Redeploy with clear cache
4. **Verify Environment**: All env variables set correctly

---

## 🎯 **FINAL VERIFICATION**

After deployment succeeds:

```bash
# Test backend
curl https://your-backend-url.railway.app/health

# Test frontend
curl https://your-frontend-url.netlify.app

# Test recruitment endpoints
curl https://your-backend-url.railway.app/api/v1/recruitment/requisitions
```

---

**Status: FIXES READY TO APPLY** ✅
