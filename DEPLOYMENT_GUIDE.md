# 🚀 TribeCore HR - Deployment Guide

## 📋 **Prerequisites**

Before deploying TribeCore, ensure you have:

- ✅ Railway account (for backend)
- ✅ Netlify account (for frontend)
- ✅ PostgreSQL database (Railway provides this)
- ✅ Git repository (GitHub)

---

## 🔧 **BACKEND DEPLOYMENT (Railway)**

### **Step 1: Create Railway Project**

1. Go to https://railway.app
2. Click "New Project"
3. Select "Deploy from GitHub repo"
4. Choose your repository: `bwcconsult/tribecore-hr`
5. Select the `main` branch

### **Step 2: Configure Environment Variables**

Add these environment variables in Railway:

```env
# Application
NODE_ENV=production
PORT=3000
API_PREFIX=api/v1

# Database (Railway will auto-generate these)
DATABASE_HOST=[Railway will provide]
DATABASE_PORT=5432
DATABASE_USER=[Railway will provide]
DATABASE_PASSWORD=[Railway will provide]
DATABASE_NAME=[Railway will provide]
DATABASE_SSL=true
DATABASE_LOGGING=false

# JWT Authentication
JWT_SECRET=[Generate a secure random string - use: openssl rand -base64 32]
JWT_EXPIRATION_TIME=7d

# Frontend URL
FRONTEND_URL=https://your-netlify-app.netlify.app
```

### **Step 3: Configure Build Settings**

**Build Command:**
```bash
cd backend && npm install && npm run build
```

**Start Command:**
```bash
cd backend && npm run start:prod
```

**Root Directory:** `/`

### **Step 4: Add PostgreSQL Database**

1. In Railway project, click "New"
2. Select "Database" → "PostgreSQL"
3. Railway will auto-configure the DATABASE_* variables

### **Step 5: Run Database Migrations**

⚠️ **IMPORTANT:** Since we have `synchronize: false` in production, you need to create tables manually.

**Option 1: Enable synchronize temporarily (NOT RECOMMENDED)**
- Set `synchronize: true` in Railway for FIRST deployment only
- After tables are created, set it back to `false`

**Option 2: Create migration files (RECOMMENDED)**
```bash
# In your local development
cd backend
npm run typeorm migration:generate -- -n InitialSchema
npm run typeorm migration:run
```

Then commit and push the migration files.

### **Step 6: Seed Initial Data**

After tables are created, you need to seed:
1. **Absence Plans** (5 plans)
2. **Permissions** (40+ permissions)
3. **Initial Admin User**

**Create a seed endpoint (temporary):**

Add to `backend/src/app.module.ts`:
```typescript
// Add to imports
import { seedAbsencePlans } from './database/seeds/absence-plans.seed';
import { seedPermissions } from './database/seeds/permissions.seed';

// In AppModule class, add:
async onModuleInit() {
  if (process.env.NODE_ENV === 'production' && process.env.RUN_SEEDS === 'true') {
    const dataSource = this.dataSource;
    await seedAbsencePlans(dataSource);
    await seedPermissions(dataSource);
  }
}
```

Then set `RUN_SEEDS=true` in Railway, deploy, then remove it.

### **Step 7: Get Backend URL**

Railway will provide a URL like:
```
https://tribecore-hr-production.up.railway.app
```

Your API will be available at:
```
https://tribecore-hr-production.up.railway.app/api/v1
```

---

## 🎨 **FRONTEND DEPLOYMENT (Netlify)**

### **Step 1: Create Netlify Site**

1. Go to https://app.netlify.com
2. Click "Add new site" → "Import an existing project"
3. Choose GitHub
4. Select your repository: `bwcconsult/tribecore-hr`
5. Configure build settings:

**Build Command:**
```bash
cd frontend && npm install && npm run build
```

**Publish Directory:**
```
frontend/dist
```

**Base Directory:**
```
/
```

### **Step 2: Configure Environment Variables**

Add this in Netlify:

```env
VITE_API_URL=https://tribecore-hr-production.up.railway.app/api/v1
```

⚠️ **CRITICAL:** Replace with YOUR Railway backend URL!

### **Step 3: Configure Redirects**

Create `frontend/public/_redirects`:
```
/*    /index.html   200
```

This ensures React Router works correctly.

### **Step 4: Deploy**

Netlify will automatically deploy on push to `main` branch.

Your frontend will be available at:
```
https://amazing-squirrel-174d09.netlify.app
```

---

## ✅ **POST-DEPLOYMENT CHECKLIST**

### **1. Test Backend Health**

```bash
curl https://YOUR-RAILWAY-URL.up.railway.app/api/v1/health
```

Expected: `{ "status": "ok" }`

### **2. Test Authentication**

**Register a test user:**
```bash
curl -X POST https://YOUR-RAILWAY-URL.up.railway.app/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@test.com",
    "password": "SecurePass123!",
    "firstName": "Admin",
    "lastName": "User"
  }'
```

**Login:**
```bash
curl -X POST https://YOUR-RAILWAY-URL.up.railway.app/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@test.com",
    "password": "SecurePass123!"
  }'
```

Expected: JWT token in response

### **3. Test Absence Plans**

```bash
curl https://YOUR-RAILWAY-URL.up.railway.app/api/v1/absence/plans \
  -H "Authorization: Bearer YOUR_TOKEN"
```

Expected: Array of 5 absence plans

### **4. Test Frontend**

1. Go to your Netlify URL
2. Register a new account
3. Login
4. Navigate to "Tasks" page
5. Navigate to "Absence" page
6. Check "My Profile" page
7. Check "Calendar" page

### **5. Test Absence Request Workflow**

1. Login as Employee
2. Go to "Absence" page
3. Click "Request Absence"
4. Fill form and submit
5. Check that balance shows "Pending" days

---

## 🔐 **SECURITY CHECKLIST**

- [ ] JWT_SECRET is a strong random string (32+ characters)
- [ ] DATABASE_SSL is enabled (`true`)
- [ ] `synchronize: false` in production (NEVER use sync in prod)
- [ ] FRONTEND_URL is set correctly for CORS
- [ ] All sensitive data is in environment variables (not hardcoded)
- [ ] Admin passwords are strong
- [ ] API rate limiting is enabled (optional)
- [ ] HTTPS is enforced on both Railway and Netlify

---

## 🐛 **TROUBLESHOOTING**

### **Issue: "Cannot connect to backend"**

**Check:**
1. `VITE_API_URL` is set correctly in Netlify
2. Railway backend is running (check Railway logs)
3. CORS is enabled in `backend/src/main.ts`
4. No trailing slash in `VITE_API_URL`

**Fix:**
```env
# Correct
VITE_API_URL=https://YOUR-URL.up.railway.app/api/v1

# Wrong
VITE_API_URL=https://YOUR-URL.up.railway.app/api/v1/
```

### **Issue: "Relation does not exist" errors**

**Problem:** Database tables not created

**Fix:**
1. Set `synchronize: true` temporarily in Railway
2. Redeploy
3. Wait for deployment to complete
4. Set `synchronize: false` again
5. Redeploy

**Better Fix:** Use migrations (see Step 5 above)

### **Issue: "No absence plans found"**

**Problem:** Seed data not loaded

**Fix:** Run seed script (see Step 6 above)

### **Issue: "401 Unauthorized" on all requests**

**Problem:** JWT token invalid or expired

**Fix:**
1. Check `JWT_SECRET` is set in Railway
2. Logout and login again
3. Check token expiry time (`JWT_EXPIRATION_TIME`)

### **Issue: Frontend shows white screen**

**Problem:** Build error or routing issue

**Fix:**
1. Check Netlify deploy logs for errors
2. Ensure `_redirects` file exists
3. Check browser console for errors

---

## 📊 **MONITORING & LOGS**

### **Railway Logs**

View backend logs:
1. Go to Railway dashboard
2. Click your project
3. Click "Deployments" tab
4. Click latest deployment
5. View "Deploy Logs"

### **Netlify Logs**

View frontend deploy logs:
1. Go to Netlify dashboard
2. Click your site
3. Click "Deploys" tab
4. Click latest deploy
5. View "Deploy log"

### **Application Errors**

Backend logs will show:
- API request errors
- Database query errors
- Authentication errors
- Permission errors

---

## 🚀 **CONTINUOUS DEPLOYMENT**

Both Railway and Netlify auto-deploy on push to `main` branch.

**Workflow:**
1. Make changes locally
2. Test locally (`npm run dev`)
3. Commit changes
4. Push to GitHub: `git push origin main`
5. Railway auto-deploys backend (2-3 minutes)
6. Netlify auto-deploys frontend (1-2 minutes)

---

## 📝 **MANUAL DEPLOYMENT**

If auto-deploy fails, you can trigger manually:

**Railway:**
1. Go to project dashboard
2. Click "Deployments"
3. Click "Deploy" button

**Netlify:**
1. Go to site dashboard
2. Click "Deploys"
3. Click "Trigger deploy" → "Deploy site"

---

## 🎯 **NEXT STEPS AFTER DEPLOYMENT**

1. **Create Admin User**
   - Register first user
   - Manually update user roles in database to include `SUPER_ADMIN`

2. **Test All Features**
   - Absence requests
   - Task management
   - Profile editing
   - Calendar events

3. **Load Production Data**
   - Import employees
   - Configure absence plans
   - Set up bank holidays
   - Create checklists

4. **Configure Settings**
   - Dashboard widgets per role
   - Notification preferences
   - System settings

---

## 📧 **SUPPORT**

If you encounter issues:

1. Check Railway logs
2. Check Netlify logs
3. Check browser console
4. Verify environment variables
5. Test backend API directly with curl/Postman

---

## ✅ **DEPLOYMENT COMPLETE!**

Once both services are deployed and tested, your TribeCore HR platform is live! 🎉

**Access your platform:**
- Frontend: https://your-site.netlify.app
- Backend API: https://your-app.up.railway.app/api/v1
- API Docs: https://your-app.up.railway.app/api/v1/docs

---

**Last Updated:** 2025-10-11
