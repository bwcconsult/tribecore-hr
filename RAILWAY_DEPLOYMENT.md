# Railway Deployment Guide for TribeCore

## Environment Variables Setup

After deploying to Railway, you **MUST** set these environment variables in your Railway project:

### Critical Variables (Required for App to Start)

1. **Go to Railway Dashboard** → Your Project → Variables Tab

2. **Add these essential variables:**

```env
# Database (Railway will auto-provide these if using Railway PostgreSQL)
DATABASE_HOST=your_postgres_host
DATABASE_PORT=5432
DATABASE_NAME=railway
DATABASE_USER=postgres
DATABASE_PASSWORD=your_postgres_password
DATABASE_SSL=true
DATABASE_SYNC=true  # Set to false after first deployment
DATABASE_LOGGING=false

# JWT Security (CHANGE THESE!)
JWT_SECRET=change-this-to-a-random-64-char-string
JWT_EXPIRATION=7d
JWT_REFRESH_SECRET=change-this-to-another-random-64-char-string
JWT_REFRESH_EXPIRATION=30d

# Application
NODE_ENV=production
PORT=3000
API_PREFIX=api/v1

# CORS - CRITICAL for login to work!
FRONTEND_URL=https://your-frontend-app.up.railway.app
CORS_ORIGIN=https://your-frontend-app.up.railway.app
CORS_CREDENTIALS=true

# Encryption
ENCRYPTION_KEY=your-32-character-encryption-key
```

### How to Get Your Frontend URL

1. Deploy your **frontend** to Railway first
2. Copy the Railway-generated URL (e.g., `https://tribecore-production.up.railway.app`)
3. Add it to **both** `FRONTEND_URL` and `CORS_ORIGIN` in backend variables

---

## Fix Database Index Error

If you see: `relation "IDX_05ba2e256c86180a7855f9de2c" already exists`

**Option 1: Fresh Database (Recommended for Development)**
1. In Railway Dashboard → PostgreSQL → Data tab
2. Drop and recreate the database
3. Redeploy the backend

**Option 2: Manual Index Cleanup**
Connect to your Railway PostgreSQL and run:
```sql
-- List all indexes
SELECT indexname FROM pg_indexes WHERE tablename IN ('departments', 'positions', 'org_chart_nodes');

-- Drop problematic indexes (if any duplicates)
DROP INDEX IF EXISTS "IDX_05ba2e256c86180a7855f9de2c";
```

---

## Fix CORS/Login Issues

The fixes in the latest commit should resolve this. Ensure:

1. ✅ `FRONTEND_URL` is set to your exact Railway frontend URL
2. ✅ `CORS_ORIGIN` is set to your exact Railway frontend URL  
3. ✅ Both URLs use `https://` (Railway uses HTTPS by default)
4. ✅ No trailing slashes in the URLs

### Example Configuration:
```
Frontend URL: https://tribecore-frontend.up.railway.app
Backend URL: https://tribecore-backend.up.railway.app

Backend Environment Variables:
FRONTEND_URL=https://tribecore-frontend.up.railway.app
CORS_ORIGIN=https://tribecore-frontend.up.railway.app
```

---

## Deployment Checklist

- [ ] PostgreSQL service added to Railway project
- [ ] Backend deployed with all environment variables set
- [ ] Frontend deployed
- [ ] Frontend `.env` has `VITE_API_URL=https://your-backend.up.railway.app/api/v1`
- [ ] Backend `FRONTEND_URL` matches frontend Railway URL
- [ ] `DATABASE_SYNC=true` for first deploy (change to false after)
- [ ] JWT secrets are set to secure random strings
- [ ] Test login functionality

---

## Testing After Deployment

1. Open browser DevTools → Network tab
2. Try to login
3. Check for CORS errors - should be gone now
4. If still failing, verify:
   - Backend logs in Railway dashboard
   - Environment variables are correctly set
   - Frontend is making requests to correct backend URL

---

## Common Issues

### Issue: "Login Failed" with CORS errors
**Solution:** Double-check `FRONTEND_URL` and `CORS_ORIGIN` in backend variables

### Issue: Database connection timeout
**Solution:** Ensure `DATABASE_SSL=true` for Railway PostgreSQL

### Issue: 502 Bad Gateway
**Solution:** Check backend logs in Railway dashboard for startup errors

### Issue: Index already exists error
**Solution:** Set `DATABASE_SYNC=false` or recreate the database

---

## Security Reminders

- ⚠️ **NEVER commit `.env` files** to Git
- ⚠️ **Always use strong JWT secrets** (minimum 32 characters)
- ⚠️ Set `DATABASE_SYNC=false` after initial deployment
- ⚠️ Restrict CORS origins in production (currently allowing all for testing)

---

## Need Help?

1. Check Railway logs: Dashboard → Deployments → Click latest → View Logs
2. Check backend health: `https://your-backend.up.railway.app/api/v1/health`
3. Check frontend build: Ensure no environment variable issues

---

**Last Updated:** October 2025
**Version:** 1.0
