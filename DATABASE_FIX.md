# Database Schema Fix - Missing Columns

## Problem
The application is crashing with error: `column employee.taxReference does not exist`

This happens when your database schema is out of sync with your TypeORM entities.

## Solutions (Choose One)

### Option 1: Run SQL Migration (RECOMMENDED)
Execute the migration file to add missing columns:

```bash
# Connect to your PostgreSQL database
psql -h your-host -U your-user -d your-database -f backend/migrations/add-missing-employee-columns.sql
```

Or if using Docker:
```bash
docker exec -i your-postgres-container psql -U your-user -d your-database < backend/migrations/add-missing-employee-columns.sql
```

### Option 2: Enable TypeORM Synchronize (DEVELOPMENT ONLY)
**⚠️ WARNING: Never use in production!**

Temporarily enable synchronize in `app.module.ts`:

```typescript
TypeOrmModule.forRootAsync({
  useFactory: (configService: ConfigService) => ({
    // ... other config
    synchronize: true, // ⚠️ Change to true temporarily
  }),
}),
```

After the app starts and creates the columns, **immediately change it back to `false`**!

### Option 3: Manual SQL (Quick Fix)
Run these SQL commands directly in your database:

```sql
ALTER TABLE employees ADD COLUMN IF NOT EXISTS "taxReference" VARCHAR;
ALTER TABLE employees ADD COLUMN IF NOT EXISTS "niNumber" VARCHAR;
ALTER TABLE employees ADD COLUMN IF NOT EXISTS "taxDistrict" VARCHAR;
ALTER TABLE employees ADD COLUMN IF NOT EXISTS "officeLocation" VARCHAR;
ALTER TABLE employees ADD COLUMN IF NOT EXISTS "bankRoutingNumber" VARCHAR;
```

### Option 4: TypeORM CLI Migration (Best Practice)
Generate a proper migration:

```bash
cd backend
npm run typeorm migration:generate -- -n AddMissingEmployeeColumns
npm run typeorm migration:run
```

## Verification
After applying the fix, verify the columns exist:

```sql
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'employees'
AND column_name IN ('taxReference', 'niNumber', 'taxDistrict', 'officeLocation', 'bankRoutingNumber')
ORDER BY column_name;
```

## Additional Missing Tables
You may also need to create tables for the new modules:

```sql
-- Check if these tables exist
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public'
AND table_name IN (
  'shifts', 
  'rotas', 
  'shift_templates',
  'recognitions',
  'badges',
  'employee_badges',
  'reward_points',
  'points_transactions',
  'offboarding_processes',
  'offboarding_tasks',
  'exit_interviews',
  'overtime_requests',
  'overtime_policies'
);
```

If any are missing, you'll need to run TypeORM synchronize once or create migrations for the new entities.

## After Fixing
1. Restart your backend application
2. Test the affected endpoints (employees, leave, onboarding)
3. Verify no more database errors in logs

## Prevention
Always use migrations for schema changes:
1. Never use `synchronize: true` in production
2. Create migrations for all schema changes
3. Version control your migrations
4. Test migrations before deploying
