# 🚀 TribeCore Complete Deployment Guide

## Overview
This document provides a comprehensive, step-by-step guide for deploying TribeCore's frontend and backend to production. Follow these instructions exactly to avoid any deployment issues.

---

## Table of Contents
1. [Prerequisites](#prerequisites)
2. [Frontend Deployment - Netlify](#frontend-deployment---netlify)
3. [Backend Deployment - Railway](#backend-deployment---railway)
4. [Database Configuration](#database-configuration)
5. [Environment Variables](#environment-variables)
6. [Common Issues & Solutions](#common-issues--solutions)
7. [Testing & Verification](#testing--verification)

---

## Prerequisites

Before starting, ensure you have:

### Accounts Required
- ✅ **GitHub Account** - Repository hosting
- ✅ **Netlify Account** (free tier) - Frontend hosting
- ✅ **Railway Account** (free tier) - Backend hosting

### Local Development Tools
- ✅ **Node.js 18+** installed
- ✅ **Git** installed and configured
- ✅ **PowerShell** or Terminal access

### Repository Setup
```bash
# Ensure code is committed and pushed to GitHub
git add .
git commit -m "Ready for deployment"
git push origin main
```

---

## Frontend Deployment - Netlify

### Step 1: Initial Setup

1. **Go to Netlify**: https://app.netlify.com
2. Click **"Add new site"** → **"Import an existing project"**
3. Choose **"Deploy with GitHub"**
4. Authorize Netlify to access your GitHub account
5. Select your **TribeCore** repository

### Step 2: Build Configuration

Configure the following settings:

**Base directory:**
```
frontend
```

**Build command:**
```
npm run build
```

**Publish directory:**
```
frontend/dist
```

**Node version:** `18`

### Step 3: Environment Variables

Go to **Site configuration** → **Environment variables**

Add the following variable (will be updated after backend deployment):

| Key | Value | Scope |
|-----|-------|-------|
| `VITE_API_URL` | `https://placeholder.com/api/v1` | All scopes |

### Step 4: Deploy

1. Click **"Deploy site"**
2. Wait 3-5 minutes for build completion
3. **Copy your Netlify URL** (e.g., `https://adorable-parfait-185cbf.netlify.app`)
4. Keep this URL - you'll need it for backend CORS configuration

### Step 5: Custom Domain (Optional)

1. Go to **Domain management**
2. Click **"Add custom domain"**
3. Enter your domain (e.g., `app.yourcompany.com`)
4. Follow DNS configuration instructions
5. SSL certificate is automatically provisioned

---

## Backend Deployment - Railway

### Step 1: Create Railway Project

1. **Go to Railway**: https://railway.app
2. Sign in with GitHub
3. Click **"New Project"**
4. Select **"Deploy from GitHub repo"**
5. Choose your **TribeCore** repository
6. Railway will detect and start deploying

### Step 2: Configure Root Directory

1. Click on your deployed service
2. Go to **"Settings"** tab
3. Find **"Service Settings"** section
4. Set **Root Directory:** `backend`
5. Set **Start Command:** `npm run start:prod`

### Step 3: Add PostgreSQL Database

1. In your Railway project dashboard (left sidebar)
2. Click **"+ New"** button
3. Select **"Database"** → **"Add PostgreSQL"**
4. Railway automatically provisions the database
5. `DATABASE_URL` is automatically linked to your backend service

### Step 4: Generate Public Domain

1. Go to **Settings** tab
2. Scroll to **"Networking"** section
3. Under **"Public Networking"**, click **"Generate Domain"**
4. **Copy the generated URL** (e.g., `https://tribecore-hr-production.up.railway.app`)
5. This is your backend API URL

### Step 5: Configure Environment Variables

Go to **"Variables"** tab and add these **critical** variables:

#### Core Variables

```env
NODE_ENV=development
```
**Why:** Enables TypeORM auto-synchronize to create database tables

```env
CORS_ORIGIN=https://your-netlify-url.netlify.app
```
**Why:** Allows frontend to communicate with backend (replace with your actual Netlify URL)

```env
JWT_SECRET=your-super-secret-jwt-key-change-in-production-min-32-chars
```
**Why:** Secures user authentication tokens

```env
NODE_TLS_REJECT_UNAUTHORIZED=0
```
**Why:** Allows connection to Railway PostgreSQL with self-signed SSL certificates

#### Auto-Generated Variables

These are automatically set by Railway:
- ✅ `DATABASE_URL` - PostgreSQL connection string
- ✅ `PORT` - Server port

### Complete Environment Variables List

| Variable | Value | Purpose |
|----------|-------|---------|
| `NODE_ENV` | `development` | Enable database auto-sync |
| `CORS_ORIGIN` | `https://your-frontend.netlify.app` | CORS configuration |
| `JWT_SECRET` | Random 32+ char string | JWT token security |
| `JWT_EXPIRATION` | `7d` | Token lifetime |
| `NODE_TLS_REJECT_UNAUTHORIZED` | `0` | SSL certificate handling |
| `DATABASE_URL` | Auto-generated | Database connection |
| `PORT` | Auto-set by Railway | Server port |

### Step 6: Monitor Deployment

1. Go to **"Deployments"** tab
2. Watch the deployment progress:
   - ✅ **Initialization** - Setting up environment
   - ✅ **Build** - Running `npm install` and `npm run build`
   - ✅ **Deploy** - Starting the server
   - ✅ **Post-deploy** - Health checks

3. Check **Deploy Logs** for errors
4. Ensure status shows **"ACTIVE"** (green)

### Step 7: Verify Database Connection

Check logs for:
```
✅ PostgreSQL connected successfully
✅ Database synchronized
✅ 🚀 TribeCore API is running on port 3000
```

---

## Database Configuration

### Automatic Table Creation

With `NODE_ENV=development`, TypeORM automatically creates these tables:

| Table | Purpose |
|-------|---------|
| `users` | User accounts & authentication |
| `organizations` | Company/organization data |
| `employees` | Employee profiles |
| `payroll` | Payroll records |
| `leave_requests` | Leave/vacation tracking |
| `attendance` | Clock in/out records |
| `performance_reviews` | Performance evaluations |
| `compliance_records` | Compliance audit trail |
| `documents` | Document metadata |

### Production Migration Strategy

For production deployments:

1. **Change** `NODE_ENV` to `production`
2. **Disable synchronize** in `backend/src/app.module.ts`:
```typescript
synchronize: false,
migrationsRun: true,
```
3. **Generate migrations** locally:
```bash
cd backend
npm run typeorm migration:generate -- -n InitialSchema
```
4. **Commit migrations** to Git
5. **Deploy** - migrations run automatically

---

## Environment Variables

### Frontend (.env files)

Create `.env.production` in `frontend/`:

```env
VITE_API_URL=https://tribecore-hr-production.up.railway.app/api/v1
```

### Backend (Railway Dashboard)

All backend environment variables are configured in Railway's Variables tab. **Never commit sensitive data to Git!**

---

## Final Integration

### Step 1: Update Frontend Environment Variable

1. Go back to **Netlify** dashboard
2. Navigate to **Site configuration** → **Environment variables**
3. Edit `VITE_API_URL`
4. Update value to: `https://your-railway-domain.up.railway.app/api/v1`
5. **Important:** Include `/api/v1` at the end
6. Save changes

### Step 2: Redeploy Frontend

1. Go to **Deploys** tab in Netlify
2. Click **"Trigger deploy"** → **"Clear cache and deploy site"**
3. Wait 2-3 minutes for deployment

---

## Common Issues & Solutions

### Issue 1: CORS Error
**Symptom:** `Access-Control-Allow-Origin` error in browser console

**Solution:**
1. Verify `CORS_ORIGIN` in Railway matches your Netlify URL exactly
2. No trailing slash in the URL
3. Redeploy backend after changing

### Issue 2: Database Connection Failed
**Symptom:** `Unable to connect to the database` errors

**Solution:**
1. Add `NODE_TLS_REJECT_UNAUTHORIZED=0` to Railway variables
2. Verify `DATABASE_URL` is set (auto-set by PostgreSQL service)
3. Check PostgreSQL service is running

### Issue 3: Tables Don't Exist
**Symptom:** `relation "users" does not exist`

**Solution:**
1. Ensure `NODE_ENV=development` in Railway
2. Redeploy backend
3. Check logs for "Database synchronized" message

### Issue 4: 502 Bad Gateway
**Symptom:** Frontend shows 502 error

**Solution:**
1. Check Railway deployment logs for crashes
2. Verify all required environment variables are set
3. Ensure backend shows "ACTIVE" status

### Issue 5: Build Fails with TypeScript Errors
**Symptom:** Build fails with type checking errors

**Solution:**
1. Verify `nest-cli.json` has `"builder": "swc"` and `"typeCheck": false`
2. Check `package.json` has SWC dependencies
3. Regenerate `package-lock.json` if needed:
```bash
cd backend
npm install
git add package-lock.json
git commit -m "Update package-lock.json"
git push
```

---

## Testing & Verification

### Step 1: Test Registration

1. Open your Netlify URL
2. Click **"Sign up"**
3. Fill in the form:
   - First Name
   - Last Name
   - Email
   - Password (min 8 characters)
4. Click **"Create Account"**

**Expected:** Redirected to dashboard, logged in successfully

### Step 2: Test Login/Logout

1. Logout from dashboard
2. Return to login page
3. Enter credentials
4. Click **"Sign In"**

**Expected:** Successfully logged in

### Step 3: Test Core Features

Test each module:
- ✅ **Dashboard** - View analytics
- ✅ **Employees** - List employees
- ✅ **Payroll** - Access payroll data
- ✅ **Leave** - View leave requests
- ✅ **Attendance** - Check attendance records
- ✅ **Performance** - Performance reviews
- ✅ **Reports** - Generate reports
- ✅ **Settings** - Organization settings

### Step 4: Browser Console Check

Press **F12** to open Developer Tools:
- ✅ No CORS errors
- ✅ No 502/500 errors
- ✅ API calls return 200 OK
- ✅ No JavaScript errors

---

## Post-Deployment Checklist

### Security
- [ ] Change `JWT_SECRET` to a strong random value (32+ characters)
- [ ] Review CORS settings
- [ ] Enable 2FA for Railway and Netlify accounts
- [ ] Set up API rate limiting (if needed)

### Performance
- [ ] Enable Netlify CDN (automatic)
- [ ] Configure caching headers
- [ ] Monitor Railway resource usage
- [ ] Set up database indexing (auto-handled by TypeORM)

### Monitoring
- [ ] Set up error tracking (Sentry, LogRocket)
- [ ] Configure uptime monitoring (UptimeRobot, Pingdom)
- [ ] Set up alerting for critical errors
- [ ] Enable Railway metrics dashboard

### Backups
- [ ] Enable PostgreSQL automated backups in Railway
- [ ] Document backup restoration procedure
- [ ] Test database restore process
- [ ] Set up off-site backups (optional)

---

## URLs & Access

### Production URLs

- **Frontend:** `https://your-site.netlify.app`
- **Backend API:** `https://your-service.up.railway.app`
- **API Documentation:** `https://your-service.up.railway.app/api/v1/docs`

### Admin Access

- **Railway Dashboard:** https://railway.app
- **Netlify Dashboard:** https://app.netlify.com
- **GitHub Repository:** https://github.com/your-username/tribecore

---

## Support & Maintenance

### Regular Maintenance Tasks

**Weekly:**
- Check Railway resource usage
- Monitor error logs
- Review failed login attempts

**Monthly:**
- Update dependencies
- Review and rotate secrets
- Check database size and performance
- Review user feedback

### Getting Help

- **Documentation:** Check all `.md` files in repository
- **Issues:** GitHub Issues tab
- **Community:** Create discussions in GitHub

---

## Success Criteria

Your deployment is successful when:

✅ Frontend loads without errors  
✅ User registration works  
✅ Login/logout functionality works  
✅ All 15 modules are accessible  
✅ API calls return valid data  
✅ No CORS errors in browser console  
✅ Database connections are stable  
✅ No 500/502 errors  

**Congratulations! Your TribeCore platform is now live!** 🎉

---

*Last Updated: October 10, 2025*
*Version: 1.0.0*
