# CORS Fix - Exact Configuration

## ✅ Your Deployment URLs (Based on Screenshots)

- **Frontend (Netlify):** `https://amazing-squirrel-174009.netlify.app`
- **Backend (Railway):** `https://tribecore-hr-production.up.railway.app`

---

## 🔧 Railway Backend Environment Variables

**Go to:** Railway Dashboard → tribecore-hr → Variables

**Set these EXACTLY:**

```env
FRONTEND_URL=https://amazing-squirrel-174009.netlify.app
CORS_ORIGIN=https://amazing-squirrel-174009.netlify.app
NODE_ENV=production
DATABASE_SSL=true
JWT_SECRET=your-secure-secret-here
JWT_EXPIRATION=7d
```

**⚠️ CRITICAL:** No trailing slashes! Must match Netlify URL exactly!

---

## 🌐 Netlify Frontend Environment Variables

**Go to:** Netlify Dashboard → Site Settings → Environment Variables

**Set this EXACTLY:**

```env
VITE_API_URL=https://tribecore-hr-production.up.railway.app/api/v1
```

**⚠️ NO trailing slash after `/api/v1`**

---

## 📝 Step-by-Step Fix Process

### ✅ Step 1: Update Railway Variables (2 minutes)

1. Open Railway Dashboard
2. Click on your backend service
3. Go to "Variables" tab
4. Click "+ New Variable"
5. Add `FRONTEND_URL` = `https://amazing-squirrel-174009.netlify.app`
6. Add `CORS_ORIGIN` = `https://amazing-squirrel-174009.netlify.app`
7. Click "Add" or "Save"

### ✅ Step 2: Wait for Railway Redeploy (2-3 minutes)

Railway will automatically redeploy after changing variables. Watch the "Deployments" tab.

### ✅ Step 3: Verify Backend is Running

Open in browser:
```
https://tribecore-hr-production.up.railway.app/api/v1/health
```

**Expected response:**
```json
{
  "status": "ok",
  "environment": "production",
  "cors": {
    "frontendUrl": "https://amazing-squirrel-174009.netlify.app",
    "corsOrigin": "https://amazing-squirrel-174009.netlify.app"
  }
}
```

**If you see:**
- ❌ HTML page → Backend not running, check Railway logs
- ✅ JSON above → Backend is configured correctly!

### ✅ Step 4: Verify Netlify Environment

1. Netlify Dashboard → Your site → Site Settings
2. Build & Deploy → Environment Variables
3. Confirm `VITE_API_URL` is set to Railway backend URL
4. If changed, trigger redeploy: Deploys → Trigger deploy

### ✅ Step 5: Clear Browser Cache

**Important:** Your browser may have cached the CORS error!

**Chrome/Edge:**
1. Press F12 (open DevTools)
2. Right-click the refresh button
3. Click "Empty Cache and Hard Reload"

**Firefox:**
1. Ctrl+Shift+Delete
2. Check "Cache"
3. Click "Clear Now"

### ✅ Step 6: Test Login

1. Go to: `https://amazing-squirrel-174009.netlify.app`
2. Open DevTools (F12) → Network tab
3. Enter credentials and click "Sign In"
4. Check the `/auth/login` request

**Success looks like:**
- Status: `200 OK` or `201 Created`
- Response Type: `json` (not `html`)
- Response body contains: `accessToken`, `user`
- No CORS errors in console

---

## 🔍 Troubleshooting

### Issue: Still getting CORS error

**Check:**
1. Did Railway finish redeploying? (Check Deployments tab)
2. Did you clear browser cache?
3. Are the URLs EXACTLY matching (no typos, no trailing slashes)?

**Verify in DevTools:**
1. Network tab → Click failed request
2. Headers section → Request Headers
3. Should show: `Origin: https://amazing-squirrel-174009.netlify.app`
4. Response Headers should show:
   ```
   Access-Control-Allow-Origin: https://amazing-squirrel-174009.netlify.app
   Access-Control-Allow-Credentials: true
   ```

### Issue: "Failed to fetch"

**Backend is down. Check Railway logs:**
1. Railway Dashboard → Backend → Deployments
2. Click latest deployment → View Logs
3. Look for errors (database connection, missing env vars, etc.)

### Issue: 401 Unauthorized

**User doesn't exist in database:**
1. You need to create a user first
2. Or check if the database was reset
3. Check backend logs for "User not found" errors

---

## 🎯 Quick Verification Commands

Run these in your browser console while on the frontend:

```javascript
// Check current backend URL
console.log(import.meta.env.VITE_API_URL);

// Test CORS
fetch('https://tribecore-hr-production.up.railway.app/api/v1/cors-test', {
  method: 'GET',
  credentials: 'include'
})
  .then(r => r.json())
  .then(console.log)
  .catch(console.error);
```

---

## 📞 If Nothing Works

Screenshot and share:
1. Railway environment variables page (redact secrets)
2. Netlify environment variables page
3. Browser DevTools → Network tab (showing failed login request)
4. Browser DevTools → Console (showing errors)
5. Railway backend logs (Deployments → Latest → Logs)

---

**This WILL fix your login issue if you follow it exactly!** 🚀
