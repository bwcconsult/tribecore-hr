# 🚨 URGENT: Database Migration Required

## Issue
Login is failing with error: `column User.orgUnit does not exist`

## Cause
New expense management fields were added to the User entity but the database schema wasn't updated:
- `orgUnit` - Organizational unit
- `managerId` - Reference to manager (for approval workflow)
- `bankAccount` - Bank account for reimbursements
- `timezone` - User timezone (defaults to 'Europe/London')

## Solution

### Option 1: Run Migration SQL (RECOMMENDED for Production)

**File:** `backend/database-migrations/add-expense-user-fields.sql`

**Steps:**

1. **On Railway (Production):**
   - Go to your Railway project
   - Click on the PostgreSQL database service
   - Go to "Data" tab or use "Connect"
   - Run the SQL migration script

2. **Or use psql command:**
   ```bash
   psql postgresql://[your-connection-string] < backend/database-migrations/add-expense-user-fields.sql
   ```

3. **Or connect via Railway CLI:**
   ```bash
   railway connect
   # Then paste the SQL from the migration file
   ```

### Option 2: Enable Synchronize (ONLY for Development)

**NOT recommended for production!**

Edit `backend/src/database/data-source.ts` or your TypeORM config:
```typescript
synchronize: true  // Change from false to true temporarily
```

Then restart the backend. **Remember to set it back to `false` after!**

### Option 3: Manual SQL Execution

Connect to your PostgreSQL database and run:

```sql
ALTER TABLE users ADD COLUMN IF NOT EXISTS "orgUnit" VARCHAR(255);
ALTER TABLE users ADD COLUMN IF NOT EXISTS "managerId" UUID;
ALTER TABLE users ADD COLUMN IF NOT EXISTS "bankAccount" VARCHAR(255);
ALTER TABLE users ADD COLUMN IF NOT EXISTS "timezone" VARCHAR(100) DEFAULT 'Europe/London';

UPDATE users SET timezone = 'Europe/London' WHERE timezone IS NULL;

CREATE INDEX IF NOT EXISTS idx_users_manager_id ON users("managerId");
CREATE INDEX IF NOT EXISTS idx_users_org_unit ON users("orgUnit");
```

## After Migration

1. **Verify the columns exist:**
   ```sql
   SELECT column_name, data_type 
   FROM information_schema.columns 
   WHERE table_name = 'users' 
   AND column_name IN ('orgUnit', 'managerId', 'bankAccount', 'timezone');
   ```

2. **Restart the backend service** (it should auto-restart on Railway)

3. **Test login** - Should work now!

## Prevention

For future schema changes, always:
1. Create migrations before deploying
2. Run migrations before starting the application
3. Use TypeORM migration CLI: `npm run migration:generate`

## Rollback (if needed)

```sql
ALTER TABLE users DROP COLUMN IF EXISTS "orgUnit";
ALTER TABLE users DROP COLUMN IF EXISTS "managerId";
ALTER TABLE users DROP COLUMN IF EXISTS "bankAccount";
ALTER TABLE users DROP COLUMN IF EXISTS "timezone";

DROP INDEX IF EXISTS idx_users_manager_id;
DROP INDEX IF EXISTS idx_users_org_unit;
```
