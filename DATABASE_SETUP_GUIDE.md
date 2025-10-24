# Database Setup Guide for Vercel Production

## 🚨 Problem Summary

Your Vercel deployment is showing this error:
```
The table `public.rate_limit_records` does not exist in the current database.
The table `public.users` does not exist in the current database.
```

**What this means:** Your production PostgreSQL database is **empty** - it has no tables yet. The database connection works, but the schema (table structure) hasn't been created.

**What you need to do:** Deploy the database schema to your production database so all 11 required tables are created.

---

## 📋 Required Tables (11 Total)

Your app needs these tables in the database:
1. `users` - User accounts
2. `accounts` - OAuth accounts
3. `sessions` - User sessions
4. `verification_tokens` - Email verification
5. `password_reset_tokens` - Password resets
6. `rate_limit_records` - Security rate limiting
7. `assessments` - Leadership assessments
8. `assessment_questions` - Question bank
9. `lasbi_items` - LASBI item metadata
10. `lasbi_responses` - Assessment responses
11. `leadership_personas` - Persona definitions

---

## ✅ Solution Options

Choose ONE of these methods to deploy your database schema:

### **Option 1: Automatic Migration (RECOMMENDED - Easiest)**

This adds automatic database migration to your Vercel build process.

#### Step 1: Update package.json

Edit `/home/ubuntu/ntaqv2/package.json` and change the `build` script:

**Current:**
```json
"build": "next build",
```

**Change to:**
```json
"build": "prisma migrate deploy && next build",
```

#### Step 2: Commit and push to Git

```bash
cd /home/ubuntu/ntaqv2
git add package.json
git commit -m "Add automatic database migration to build process"
git push origin main
```

#### Step 3: Redeploy on Vercel

Vercel will automatically redeploy. The migration will run first, creating all tables, then the app will build.

**⚠️ Important:** Make sure your `DATABASE_URL` environment variable in Vercel is correct!

#### Pros:
- ✅ Automatic - runs on every deployment
- ✅ Safe - only runs pending migrations
- ✅ No manual steps needed
- ✅ Works for future updates

#### Cons:
- ⚠️ Requires initial migration to be created first (see Option 2 if this fails)

---

### **Option 2: Create Migration Locally, Deploy via Git**

This creates a migration file that will be deployed with your code.

#### Step 1: Create the initial migration

```bash
cd /home/ubuntu/ntaqv2

# Create a migration based on your current schema
npx prisma migrate dev --name initial_schema
```

This will:
- Create a `prisma/migrations/` folder
- Generate SQL files that create all tables
- Apply the migration to your local database (if connected)

#### Step 2: Commit and push

```bash
git add prisma/migrations/
git add package.json  # if you updated it in Option 1
git commit -m "Add initial database migration"
git push origin main
```

#### Step 3: Deploy migration on Vercel

After Vercel rebuilds, the migration will run automatically (if you updated `package.json` as in Option 1), OR you can run it manually via Vercel CLI:

```bash
# Install Vercel CLI if needed
npm install -g vercel

# Login to Vercel
vercel login

# Link to your project
cd /home/ubuntu/ntaqv2
vercel link

# Run migration command
vercel env pull .env.production  # Download production DATABASE_URL
DATABASE_URL=$(grep DATABASE_URL .env.production | cut -d '=' -f2-) npx prisma migrate deploy
```

---

### **Option 3: Direct Database Migration (Advanced)**

Connect directly to your production database from your local machine.

#### Step 1: Get your production DATABASE_URL from Vercel

1. Go to your Vercel project dashboard
2. Navigate to **Settings** → **Environment Variables**
3. Copy the `DATABASE_URL` value

#### Step 2: Run migration against production database

```bash
cd /home/ubuntu/ntaqv2

# Set production database URL temporarily
export DATABASE_URL="your-production-database-url-here"

# Deploy the migration
npx prisma migrate deploy

# Or, if no migrations exist yet, push the schema directly
npx prisma db push
```

**⚠️ Warning:** This requires careful handling of credentials. Don't commit your production `DATABASE_URL` to Git!

---

## 🔍 How to Verify Schema Was Created

After deploying via any method, verify the tables were created:

### Method 1: Try registering on your app
Go to your Vercel URL and try to register a new user. If registration works without database errors, the schema is deployed!

### Method 2: Check database directly with Prisma Studio

```bash
cd /home/ubuntu/ntaqv2
export DATABASE_URL="your-production-database-url"
npx prisma studio
```

This opens a web interface where you can see all tables.

### Method 3: Use SQL query (if you have database access)

Connect to your database and run:
```sql
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public';
```

You should see all 11 tables listed.

---

## 🛠️ Troubleshooting

### Problem: "No migration found"

**Solution:** Create the initial migration first (see Option 2, Step 1):
```bash
npx prisma migrate dev --name initial_schema
```

### Problem: "Migration failed" or SQL errors

**Possible causes:**
1. Database already has some tables with different structure
2. DATABASE_URL is incorrect
3. Database permissions issue

**Solution:** Reset the database (⚠️ DELETES ALL DATA):
```bash
npx prisma migrate reset
```

Or drop all tables manually and try again.

### Problem: Build succeeds but tables still missing

**Check:**
1. Verify `prisma migrate deploy` actually ran in Vercel build logs
2. Check that `DATABASE_URL` in Vercel matches your actual database
3. Make sure there are no typos in the environment variable name

### Problem: "Column not found" or schema mismatch

**Solution:** Your local schema might be different from what was deployed. Regenerate the Prisma client:
```bash
npx prisma generate
```

---

## 📝 Recommended Setup Process (Step-by-Step)

For first-time deployment, follow this sequence:

1. ✅ **Create initial migration locally**
   ```bash
   cd /home/ubuntu/ntaqv2
   npx prisma migrate dev --name initial_schema
   ```

2. ✅ **Update package.json for automatic migrations**
   Change `"build": "next build"` to `"build": "prisma migrate deploy && next build"`

3. ✅ **Commit everything to Git**
   ```bash
   git add prisma/migrations/ package.json
   git commit -m "Add database migration and auto-deploy"
   git push origin main
   ```

4. ✅ **Verify in Vercel build logs**
   Watch for messages like:
   ```
   Running prisma migrate deploy...
   Applying migration 20241023_initial_schema
   ✓ Migration applied successfully
   ```

5. ✅ **Test registration**
   Go to your Vercel URL and try registering a new user.

---

## 🎯 Next Steps After Schema Is Deployed

Once your database schema is deployed and registration works:

1. **Seed the database** (optional but recommended)
   - The app needs initial data like assessment questions
   - See `scripts/seed.ts` for the seeding script
   - Run: `npx prisma db seed`

2. **Monitor for errors**
   - Check Vercel logs regularly
   - Set up error tracking (Sentry, etc.)

3. **Backup your database**
   - Set up automatic backups on your PostgreSQL provider
   - Test restore procedures

---

## 📚 Additional Resources

- [Prisma Migrate Docs](https://www.prisma.io/docs/concepts/components/prisma-migrate)
- [Vercel Environment Variables](https://vercel.com/docs/concepts/projects/environment-variables)
- [Prisma Deploy Guide](https://www.prisma.io/docs/guides/deployment/deployment-guides/deploying-to-vercel)

---

## ✅ Quick Reference Commands

```bash
# Create migration
npx prisma migrate dev --name initial_schema

# Deploy migration to production
npx prisma migrate deploy

# Push schema without migration (quick but not recommended for prod)
npx prisma db push

# Open database browser
npx prisma studio

# Regenerate Prisma client
npx prisma generate

# Reset database (⚠️ DELETES ALL DATA)
npx prisma migrate reset
```

---

**Last Updated:** October 23, 2025  
**App:** NTAQV2 Leadership Questionnaire  
**Database:** PostgreSQL with Prisma ORM
