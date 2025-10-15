# Login Troubleshooting Guide

## ✅ Critical Fix Applied

I found the root cause! **`withCredentials: true` was missing from axios.**

This is now fixed in the latest commit. Follow these steps:

---

## 🔧 Step-by-Step Fix Process

### **Step 1: Wait for Railway Deployment**

After pushing the code, Railway will automatically redeploy both frontend and backend.

1. Go to Railway Dashboard
2. Check **Deployments** tab for both services
3. Wait for both to show "Success" status (usually 2-5 minutes)

---

### **Step 2: Verify Backend Environment Variables**

In Railway Dashboard → Backend Service → Variables tab, ensure you have:

```env
NODE_ENV=production
FRONTEND_URL=https://your-frontend.up.railway.app
CORS_ORIGIN=https://your-frontend.up.railway.app
JWT_SECRET=your-secret-here
DATABASE_SSL=true
```

**⚠️ IMPORTANT:** Replace `https://your-frontend.up.railway.app` with your **actual** Railway frontend URL

To find it:
- Railway Dashboard → Frontend Service → Settings → Copy the domain

---

### **Step 3: Test the Health Endpoint**

Before testing login, verify the backend is running:

1. Open browser
2. Go to: `https://your-backend.up.railway.app/api/v1/health`
3. You should see JSON like:

```json
{
  "status": "ok",
  "timestamp": "2025-10-15T...",
  "environment": "production",
  "cors": {
    "frontendUrl": "https://your-frontend.up.railway.app",
    "corsOrigin": "https://your-frontend.up.railway.app"
  }
}
```

**If you see HTML instead of JSON → Backend isn't running correctly**

---

### **Step 4: Test CORS Endpoint**

Go to: `https://your-backend.up.railway.app/api/v1/cors-test`

You should see:

```json
{
  "message": "CORS is working!",
  "timestamp": "...",
  "headers": "If you can see this, CORS is configured correctly"
}
```

---

### **Step 5: Check Frontend Environment**

Ensure your frontend has the correct backend URL:

In Railway Dashboard → Frontend Service → Variables:

```env
VITE_API_URL=https://your-backend.up.railway.app/api/v1
```

**No trailing slash!**

---

### **Step 6: Clear Browser Cache**

1. Open DevTools (F12)
2. Right-click the Refresh button
3. Click "Empty Cache and Hard Reload"

OR

1. Go to Settings → Privacy
2. Clear browsing data
3. Select "Cached images and files"

---

### **Step 7: Test Login**

1. Open your frontend: `https://your-frontend.up.railway.app`
2. Open DevTools → Network tab
3. Try to login with:
   - Email: `bill.essien@bwcconsult.com`
   - Password: (your password)

**Look for:**
- ✅ Request to `/api/v1/auth/login` should show status 200 or 201
- ✅ Response should be JSON with `accessToken` and `user` data
- ❌ If you see CORS errors → Check Step 2 again

---

## 🐛 If Still Not Working

### Debug Checklist:

1. **Check Backend Logs**
   - Railway Dashboard → Backend → Deployments → Latest → View Logs
   - Look for startup errors

2. **Verify CORS Headers in Response**
   - In Network tab, click on the failed login request
   - Go to "Headers" section
   - Check "Response Headers"
   - Should include:
     ```
     Access-Control-Allow-Origin: https://your-frontend.up.railway.app
     Access-Control-Allow-Credentials: true
     ```

3. **Check Request Headers**
   - Should include:
     ```
     Origin: https://your-frontend.up.railway.app
     ```

4. **Common Issues:**

   | Issue | Solution |
   |-------|----------|
   | "Failed to fetch" | Backend is down - check logs |
   | CORS error | `FRONTEND_URL` mismatch - must be EXACT |
   | 401 Unauthorized | Check if user exists in database |
   | 500 Server Error | Database connection issue - check `DATABASE_SSL=true` |
   | HTML response instead of JSON | Request not reaching NestJS - check API prefix |

---

## 🔑 What Changed in Latest Fix

1. **Added `withCredentials: true`** to axios instance
   - Location: `frontend/src/lib/axios.ts`
   - This tells the browser to include credentials in CORS requests

2. **Added health check endpoints**
   - `/health` - Shows environment and CORS config
   - `/cors-test` - Quick CORS test
   - `/` - Root endpoint

3. **Enhanced CORS configuration**
   - Dynamic origin checking
   - Development vs production handling
   - Better header support

---

## 📞 Need More Help?

1. Share screenshots of:
   - Network tab showing the login request/response
   - Backend logs from Railway
   - Environment variables (redact secrets!)

2. Try these debugging URLs:
   - `https://your-backend.up.railway.app/api/v1`
   - `https://your-backend.up.railway.app/api/v1/health`
   - `https://your-backend.up.railway.app/api/v1/cors-test`

---

**Last Updated:** October 15, 2025
