# Database Migrations for HR Modules

## 🚨 URGENT: Run This Migration First!

The backend errors you're seeing are because the database tables don't exist yet for the 3 new HR modules.

---

## **Quick Fix - Run This SQL**

### **Option 1: Railway Dashboard (Easiest)**

1. Go to your Railway dashboard
2. Click on your **PostgreSQL** service
3. Click **"Data"** tab
4. Click **"Query"** button
5. Copy and paste the entire contents of `create-hr-modules-tables.sql`
6. Click **"Run"**
7. Restart your backend service

### **Option 2: Railway CLI**

```bash
# Connect to Railway database
railway connect

# Run the migration
\i backend/migrations/create-hr-modules-tables.sql

# Or copy-paste the SQL directly
```

### **Option 3: Direct PostgreSQL Connection**

If you have `psql` installed:

```bash
psql postgresql://user:password@host:port/database -f backend/migrations/create-hr-modules-tables.sql
```

---

## **What This Migration Does**

✅ **Fixes taxReference error** - Adds UK tax fields to employees table  
✅ **Creates separation_cases** - Offboarding main table  
✅ **Creates notice_terms** - Notice period calculations  
✅ **Creates severance_calculations** - Final pay breakdown  
✅ **Creates redundancy_groups** - Collective consultation  
✅ **Creates separation_tasks** - Offboarding checklist  
✅ **Creates access_deprovision** - System access removal  
✅ **Creates onboarding_cases** - New hire pipeline  
✅ **Creates onboarding_checklists** - Task tracking  
✅ **Creates provisions** - Equipment/access requests  
✅ **Creates requisitions** - Headcount approval  
✅ **Creates job_postings** - Job ads  
✅ **Creates candidates** - Talent pool  
✅ **Creates applications** - Pipeline tracking  
✅ **Creates interviews** - Interview management  
✅ **Creates offers** - Offer letters  

**Total: 15 tables + indexes**

---

## **After Running Migration**

1. Restart your backend service on Railway
2. All errors will disappear
3. The 3 HR modules will work perfectly
4. You'll be able to access:
   - `/offboarding/dashboard`
   - `/onboarding/dashboard`
   - `/recruitment/dashboard`

---

## **Verification**

After running, verify tables exist:

```sql
SELECT table_name 
FROM information_schema.tables 
WHERE table_name IN (
  'separation_cases',
  'onboarding_cases',
  'requisitions',
  'job_postings',
  'candidates',
  'applications'
);
```

Should return 6 rows.

---

## **Rollback (if needed)**

If you need to undo this migration:

```sql
DROP TABLE IF EXISTS "access_deprovision" CASCADE;
DROP TABLE IF EXISTS "separation_tasks" CASCADE;
DROP TABLE IF EXISTS "severance_calculations" CASCADE;
DROP TABLE IF EXISTS "notice_terms" CASCADE;
DROP TABLE IF EXISTS "separation_cases" CASCADE;
DROP TABLE IF EXISTS "redundancy_groups" CASCADE;
DROP TABLE IF EXISTS "provisions" CASCADE;
DROP TABLE IF EXISTS "onboarding_checklists" CASCADE;
DROP TABLE IF EXISTS "onboarding_cases" CASCADE;
DROP TABLE IF EXISTS "offers" CASCADE;
DROP TABLE IF EXISTS "interviews" CASCADE;
DROP TABLE IF EXISTS "applications" CASCADE;
DROP TABLE IF EXISTS "candidates" CASCADE;
DROP TABLE IF EXISTS "job_postings" CASCADE;
DROP TABLE IF EXISTS "requisitions" CASCADE;

-- Optionally remove UK tax fields
ALTER TABLE employees DROP COLUMN IF EXISTS "taxReference";
ALTER TABLE employees DROP COLUMN IF EXISTS "niNumber";
ALTER TABLE employees DROP COLUMN IF EXISTS "taxDistrict";
```

---

**Questions? The migration is safe - it uses `IF NOT EXISTS` and won't overwrite existing data.**
