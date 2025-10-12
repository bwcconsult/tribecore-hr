# 🚨 QUICK FIX - Database Schema Errors

## Problem
Your app is crashing with: `column employee.taxReference does not exist`

## Solution - Run Migrations Now

### Step 1: Fix Missing Employee Columns (URGENT)
```bash
# If using local PostgreSQL
psql -h localhost -U your_username -d your_database_name -f backend/migrations/add-missing-employee-columns.sql

# If using Docker
docker exec -i your-postgres-container psql -U postgres -d tribecore < backend/migrations/add-missing-employee-columns.sql
```

### Step 2: Create New Feature Tables
```bash
# If using local PostgreSQL
psql -h localhost -U your_username -d your_database_name -f backend/migrations/create-new-feature-tables.sql

# If using Docker
docker exec -i your-postgres-container psql -U postgres -d tribecore < backend/migrations/create-new-feature-tables.sql
```

### Step 3: Restart Your Backend
```bash
# Stop and start your backend application
docker-compose restart backend
# OR
npm run start:dev
```

## Alternative: Quick Manual Fix (If you can't run migration files)

Connect to your database and run:

```sql
-- Fix Employee table
ALTER TABLE employees ADD COLUMN IF NOT EXISTS "taxReference" VARCHAR;
ALTER TABLE employees ADD COLUMN IF NOT EXISTS "niNumber" VARCHAR;
ALTER TABLE employees ADD COLUMN IF NOT EXISTS "taxDistrict" VARCHAR;
ALTER TABLE employees ADD COLUMN IF NOT EXISTS "officeLocation" VARCHAR;
ALTER TABLE employees ADD COLUMN IF NOT EXISTS "bankRoutingNumber" VARCHAR;
```

Then run the full migration SQL from `backend/migrations/create-new-feature-tables.sql`

## Verify It Worked

After running migrations, check your app logs. You should see:
- ✅ No more "column does not exist" errors
- ✅ Backend starts successfully
- ✅ API endpoints respond correctly

## What These Migrations Do

1. **add-missing-employee-columns.sql**
   - Adds missing columns to existing `employees` table
   - Safe to run multiple times (uses `IF NOT EXISTS`)

2. **create-new-feature-tables.sql**
   - Creates 13 new tables for:
     - Shifts & Rotas (3 tables)
     - Employee Recognition (5 tables)
     - Offboarding (3 tables)
     - Overtime (2 tables)
   - Creates indexes for performance
   - Safe to run multiple times

## Need Help?

See `DATABASE_FIX.md` for more detailed troubleshooting options.

## Production Deployment

For production, use proper TypeORM migrations:
```bash
npm run typeorm migration:run
```

But for quick fix in development, the SQL migrations above work perfectly!
