# 🔧 Production Database Fix Guide

## 🚨 **Current Issue**

Your production backend is throwing errors because the database is missing several tables and columns:

**Missing Tables:**
- `absence_plans`
- `objectives`
- `nudges`
- `equality_cases`
- `legal_advice_requests`

**Missing Columns:**
- `employee.taxReference`

---

## ✅ **Solution: Run Migration Script**

I've created a comprehensive migration script that will add all missing tables and columns.

**File:** `backend/migrations/fix-missing-tables-and-columns.sql`

---

## 🚀 **How to Apply the Fix**

### **Option 1: Direct Database Connection (Recommended)**

If you have direct access to your production PostgreSQL database:

```bash
# Connect to your production database
psql -h YOUR_DB_HOST -U YOUR_DB_USER -d YOUR_DB_NAME -f backend/migrations/fix-missing-tables-and-columns.sql

# Or if using connection string
psql "postgresql://user:pass@host:5432/dbname" -f backend/migrations/fix-missing-tables-and-columns.sql
```

### **Option 2: Via Render Dashboard**

If your backend is on Render.com:

1. Go to your Render dashboard
2. Click on your PostgreSQL database
3. Click "Connect" → "External Connection"
4. Copy the External Database URL
5. Run:
```bash
psql "YOUR_EXTERNAL_DATABASE_URL" -f backend/migrations/fix-missing-tables-and-columns.sql
```

### **Option 3: Render Shell**

1. Go to Render dashboard
2. Select your backend service
3. Click "Shell" tab
4. Run:
```bash
cd /app
cat backend/migrations/fix-missing-tables-and-columns.sql | psql $DATABASE_URL
```

### **Option 4: Add Migration Runner to Backend**

Create a manual migration endpoint (temporary, remove after use):

**backend/src/app.controller.ts:**
```typescript
import { Controller, Post } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import * as fs from 'fs';
import * as path from 'path';

@Controller()
export class AppController {
  constructor(
    @InjectDataSource() private dataSource: DataSource
  ) {}

  @Post('run-migration') // REMOVE THIS AFTER USE!
  async runMigration() {
    const sqlFile = path.join(__dirname, '../migrations/fix-missing-tables-and-columns.sql');
    const sql = fs.readFileSync(sqlFile, 'utf8');
    
    await this.dataSource.query(sql);
    
    return { message: 'Migration executed successfully' };
  }
}
```

Then call:
```bash
curl -X POST https://your-backend.onrender.com/run-migration
```

**⚠️ IMPORTANT: Remove this endpoint immediately after use!**

---

## 🔍 **Verify the Fix**

After running the migration, verify all tables exist:

```sql
-- Check if tables exist
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
  AND table_name IN (
    'absence_plans',
    'objectives',
    'nudges',
    'equality_cases',
    'legal_advice_requests'
  )
ORDER BY table_name;

-- Should return 5 rows

-- Check if column exists
SELECT column_name 
FROM information_schema.columns 
WHERE table_name = 'employee' 
  AND column_name = 'taxreference';

-- Should return 1 row
```

---

## 📋 **What the Migration Does**

1. ✅ Adds `taxReference` column to `employee` table (if missing)
2. ✅ Creates `absence_plans` table for leave policies
3. ✅ Creates `objectives` table for performance objectives
4. ✅ Creates `nudges` table for user notifications/prompts
5. ✅ Creates `equality_cases` table for equality/discrimination cases
6. ✅ Creates `legal_advice_requests` table for legal service requests

**All operations use `IF NOT EXISTS`** - safe to run multiple times!

---

## 🚨 **After Fixing Database**

Once the migration completes:

1. **Restart your backend service** (Render will auto-restart on deploy)
2. **Check logs** - errors should be gone
3. **Test affected pages:**
   - Leave/Absence management
   - Performance objectives
   - Legal services dashboard
   - Notifications

---

## 🔄 **Prevent Future Issues**

### **Set up proper migration workflow:**

1. **Use TypeORM CLI for migrations:**
```bash
# Generate migration from entity changes
npm run migration:generate -- -n MigrationName

# Run migrations
npm run migration:run
```

2. **Add to package.json:**
```json
{
  "scripts": {
    "migration:generate": "typeorm-ts-node-esm migration:generate",
    "migration:run": "typeorm-ts-node-esm migration:run",
    "migration:revert": "typeorm-ts-node-esm migration:revert"
  }
}
```

3. **In CI/CD pipeline, always run:**
```bash
npm run migration:run
```

Before starting the application.

---

## 🆘 **Troubleshooting**

### **Error: "uuid_generate_v4() does not exist"**

Run this first:
```sql
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
```

### **Error: "permission denied"**

Your database user needs CREATE TABLE permissions:
```sql
GRANT CREATE ON SCHEMA public TO your_db_user;
```

### **Still seeing errors after migration**

1. Check migration actually ran:
```sql
\dt -- List all tables
```

2. Check backend is using correct database:
```bash
# In Render Shell
echo $DATABASE_URL
```

3. Restart backend service completely

---

## 📞 **Need Help?**

If you encounter issues:

1. Check the backend logs for specific errors
2. Verify database connection string
3. Ensure migration file is in correct location
4. Confirm you have database admin permissions

---

## ✅ **Commit This Fix**

Don't forget to commit and push the migration file:

```bash
git add backend/migrations/fix-missing-tables-and-columns.sql
git add PRODUCTION_DATABASE_FIX.md
git commit -m "fix: Add missing database tables and columns migration"
git push origin main
```

---

**After running this migration, your production errors should be resolved!** ✨
