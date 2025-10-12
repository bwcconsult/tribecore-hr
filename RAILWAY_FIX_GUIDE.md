# 🚨 RAILWAY DATABASE FIX - IMMEDIATE ACTION REQUIRED

**Error:** `column User.preferredName does not exist`

**Cause:** Railway database schema is outdated and missing columns.

---

## ✅ QUICK FIX (2 Minutes)

### **Option 1: Run SQL Script in Railway Dashboard** (EASIEST)

1. **Go to Railway Dashboard:**
   ```
   https://railway.app/dashboard
   ```

2. **Navigate to PostgreSQL Database:**
   - Click on your project
   - Find the **PostgreSQL** service (database icon)
   - Click on it

3. **Open Query Tab:**
   - Click "**Query**" or "**Data**" tab
   - You should see an SQL editor

4. **Copy and paste this SQL:**
   ```sql
   -- Add missing columns to users table
   ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "preferredName" VARCHAR;
   ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "pronouns" VARCHAR;
   ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "dateOfBirth" DATE;
   ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "gender" VARCHAR;
   ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "nationality" VARCHAR;
   ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "maritalStatus" VARCHAR;
   ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "personalEmail" VARCHAR;
   ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "workPhone" VARCHAR;
   ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "personalPhone" VARCHAR;
   ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "addressLine1" VARCHAR;
   ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "addressLine2" VARCHAR;
   ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "city" VARCHAR;
   ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "state" VARCHAR;
   ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "postcode" VARCHAR;
   ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "country" VARCHAR;
   ```

5. **Click "Run" or "Execute"**

6. **You should see:** `ALTER TABLE` success messages

7. **Restart your backend service:**
   - Go back to backend service in Railway
   - Click "**⋯**" (three dots)
   - Click "**Restart**"

8. **Wait 30 seconds** for backend to restart

9. **Try login again!** Should work now! ✅

---

### **Option 2: Using Railway CLI** (IF YOU HAVE IT INSTALLED)

```bash
# Connect to database
railway connect postgres

# When psql opens, paste the SQL from Option 1
# Then type \q to exit

# Restart backend
railway restart
```

---

### **Option 3: Connect with psql Directly**

1. **Get DATABASE_URL from Railway:**
   - Railway Dashboard → PostgreSQL service
   - Click "**Variables**" tab
   - Copy `DATABASE_URL` value

2. **Connect with psql:**
   ```bash
   psql "YOUR_DATABASE_URL_HERE"
   ```

3. **Paste the SQL from Option 1**

4. **Type `\q` to exit**

5. **Restart backend in Railway dashboard**

---

## 🧪 VERIFY IT WORKED

After running the SQL and restarting:

1. **Check Railway Logs:**
   - Backend service → Deployments → View Logs
   - Should see: `Nest application successfully started`
   - Should NOT see: `column User.preferredName does not exist`

2. **Test Login:**
   - Go to: `https://zealous-journal-17ad09.netlify.app`
   - Email: `brianna@tribecore.com`
   - Password: `password123`
   - Should redirect to dashboard! ✅

---

## ❓ TROUBLESHOOTING

### **If SQL fails with "table doesn't exist":**

The entire `users` table is missing. Run this instead:

```sql
-- Create users table from scratch
CREATE TABLE IF NOT EXISTS "users" (
  "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "email" VARCHAR UNIQUE NOT NULL,
  "password" VARCHAR NOT NULL,
  "firstName" VARCHAR NOT NULL,
  "lastName" VARCHAR NOT NULL,
  "roles" VARCHAR[] DEFAULT ARRAY['EMPLOYEE']::VARCHAR[],
  "phoneNumber" VARCHAR,
  "isEmailVerified" BOOLEAN DEFAULT false,
  "isActive" BOOLEAN DEFAULT true,
  "lastLoginAt" TIMESTAMP,
  "organizationId" VARCHAR,
  "metadata" JSONB,
  "preferredName" VARCHAR,
  "pronouns" VARCHAR,
  "dateOfBirth" DATE,
  "gender" VARCHAR,
  "nationality" VARCHAR,
  "maritalStatus" VARCHAR,
  "personalEmail" VARCHAR,
  "workPhone" VARCHAR,
  "personalPhone" VARCHAR,
  "addressLine1" VARCHAR,
  "addressLine2" VARCHAR,
  "city" VARCHAR,
  "state" VARCHAR,
  "postcode" VARCHAR,
  "country" VARCHAR,
  "createdAt" TIMESTAMP DEFAULT NOW(),
  "updatedAt" TIMESTAMP DEFAULT NOW()
);
```

Then create a test user:

```sql
INSERT INTO "users" 
  (email, password, "firstName", "lastName", roles, "isActive")
VALUES
  ('test@tribecore.com', '$2b$10$EixZaYVK1fsbw1ZfbX3OXePaWxn96p36WQoeG6Lruj3vjPGga31lW', 'Test', 'User', ARRAY['EMPLOYEE'], true);
```

Password for test@tribecore.com: `password123`

---

### **If login still fails after SQL update:**

**Check if backend restarted:**
- Railway Dashboard → Backend → Latest deployment should be recent

**Check environment variables:**
- `JWT_SECRET` should be set
- `DATABASE_*` variables should be correct

**Create a test user manually:**

```sql
-- Insert test user (password: password123)
INSERT INTO "users" 
  (email, password, "firstName", "lastName", "isActive")
VALUES
  ('admin@test.com', 
   '$2b$10$EixZaYVK1fsbw1ZfbX3OXePaWxn96p36WQoeG6Lruj3vjPGga31lW',
   'Admin', 
   'User',
   true)
ON CONFLICT (email) DO NOTHING;
```

Then login with:
- Email: `admin@test.com`
- Password: `password123`

---

## 📋 SUMMARY

**What happened:**
- Backend code has User entity with `preferredName` column
- Railway database doesn't have that column
- Login fails when trying to query user

**The fix:**
- Add missing columns with SQL ALTER TABLE
- Restart backend
- Login should work

**Time required:** 2-3 minutes

---

## 🎯 AFTER THIS WORKS

Once login is working, you should also:

1. **Run the seeder** (creates sample expense data):
   ```bash
   railway run npm run seed
   ```

2. **Or manually create expense categories:**
   ```sql
   INSERT INTO expense_category (id, name, type, "isActive")
   VALUES 
     ('cat-travel', 'Travel', 'TRAVEL', true),
     ('cat-meals', 'Meals & Entertainment', 'MEALS', true),
     ('cat-office', 'Office Supplies', 'OFFICE_SUPPLIES', true);
   ```

---

**This SQL fix is safe - it only ADDS columns, doesn't delete anything!**

✅ Run the SQL → ✅ Restart backend → ✅ Login should work!
