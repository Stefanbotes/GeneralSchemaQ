# Production Database Seeding Guide

## 📋 Issue Summary

**Problem:** Assessment questions are not appearing in the production app on Vercel.

**Root Cause:** The production database has the correct schema (tables) but no question data. The questions were never seeded into production after deployment.

**Current Status:**
- ✅ Database schema exists (created by migrations)
- ✅ API endpoints work correctly
- ✅ Questions exist in source code (`/data/questionnaireData.js` - 108 questions)
- ❌ Questions NOT in production database

**Expected Behavior:**
- API endpoint `/api/assessment/questions` should return 108 questions
- Assessment page should display all questions to users

---

## 🔧 Solution Overview

We've created a secure API endpoint that seeds the questions into the production database. This is a **one-time operation** that you'll run after deployment.

### Files Created:
1. **`/app/api/admin/seed-questions/route.ts`** - Protected API endpoint for seeding
2. **`/scripts/seed-production.sh`** - Helper script to call the endpoint

---

## 🚀 Deployment Steps

### Step 1: Add Environment Variable to Vercel

1. Go to your [Vercel Dashboard](https://vercel.com/dashboard)
2. Select your NTAQV2 project
3. Go to **Settings** → **Environment Variables**
4. Add a new environment variable:
   - **Name:** `ADMIN_SECRET_KEY`
   - **Value:** `prod_seed_secret_[RANDOM_STRING]` 
     - Generate a secure random string (e.g., use a password generator)
     - Example: `prod_seed_secret_x8Kp2mN9qR7vL3wY4tZ6`
   - **Environment:** Production (check the box)
5. Click **Save**

> ⚠️ **Important:** Keep this secret key safe! Anyone with this key can trigger the seeding operation.

### Step 2: Deploy the Code Changes

```bash
# Make sure you're in the project directory
cd /home/ubuntu/ntaqv2

# Add and commit the changes
git add .
git commit -m "Add production database seeding endpoint"

# Push to your repository
git push origin main
```

Your Vercel deployment will automatically trigger and the new API endpoint will be deployed.

### Step 3: Wait for Deployment to Complete

1. Go to your Vercel dashboard
2. Wait for the deployment to show "Ready"
3. Note your production URL (e.g., `https://your-app.vercel.app`)

### Step 4: Seed the Production Database

You have **two options** to run the seeding:

#### Option A: Using the Shell Script (Recommended)

```bash
# Set your production URL
export PRODUCTION_URL="https://your-app.vercel.app"

# Set your admin secret (use the same value you added to Vercel)
export ADMIN_SECRET_KEY="prod_seed_secret_x8Kp2mN9qR7vL3wY4tZ6"

# Run the seeding script
./scripts/seed-production.sh
```

#### Option B: Using cURL Directly

```bash
# Replace with your actual values
PRODUCTION_URL="https://your-app.vercel.app"
ADMIN_SECRET="prod_seed_secret_x8Kp2mN9qR7vL3wY4tZ6"

# Check status first
curl -s "$PRODUCTION_URL/api/admin/seed-questions" | jq .

# Seed the database
curl -X POST "$PRODUCTION_URL/api/admin/seed-questions" \
  -H "x-admin-secret: $ADMIN_SECRET" \
  -H "Content-Type: application/json" | jq .
```

### Step 5: Verify Questions Are Loaded

Visit your production assessment page:
```
https://your-app.vercel.app/assessment
```

You should now see all 108 questions displayed!

You can also verify via the API:
```bash
curl -s "https://your-app.vercel.app/api/assessment/questions" | jq '.total'
# Should return: 108
```

---

## 🔒 Security Features

1. **Protected Endpoint:** Requires `ADMIN_SECRET_KEY` to execute
2. **Idempotent:** Won't duplicate data if questions already exist
3. **Server-Side Only:** Runs on Vercel's server, not exposed to clients
4. **Error Handling:** Provides detailed feedback if something goes wrong

---

## 📊 What Gets Seeded

The endpoint seeds **two tables**:

1. **`assessment_questions`** (108 records)
   - Question text
   - Domain (5 domains)
   - Schema (18 schemas)
   - Persona information
   - Question order

2. **`lasbi_items`** (108 records)
   - LASBI item identifiers
   - Canonical IDs
   - Variable mappings
   - Question numbers

**Data Source:** `/data/questionnaireData.js`
- Version: 2.0.0-leadership
- 108 Questions total
- 5 Domains
- 18 Schemas
- 6 Questions per schema (2 Cognitive, 2 Emotional, 2 Belief)

---

## 🐛 Troubleshooting

### Error: "Unauthorized: Invalid admin secret"
- **Cause:** The secret key doesn't match
- **Fix:** Make sure the `ADMIN_SECRET_KEY` in Vercel matches what you're using in the script

### Error: "Server configuration error: ADMIN_SECRET_KEY not set"
- **Cause:** Environment variable not set in Vercel
- **Fix:** Go back to Step 1 and add the environment variable

### Error: "Failed to load questionnaire data"
- **Cause:** The `/data/questionnaireData.js` file is missing or corrupted
- **Fix:** Verify the file exists and is properly formatted

### Questions Already Exist
- If you see "Questions already exist in database", that's good! It means seeding already happened.
- The endpoint won't duplicate data, so it's safe to call multiple times.

### Still Not Seeing Questions?
1. Check the browser console for errors
2. Check Vercel function logs for errors
3. Verify the API response: `curl https://your-app.vercel.app/api/assessment/questions`
4. Make sure you're testing on the production URL, not localhost

---

## 📝 Technical Details

### Why This Solution?

We chose an API-based approach because:
1. **Easy for non-technical users** - Just call a URL
2. **Works on Vercel** - No need for CLI access or manual SQL
3. **Secure** - Protected with secret key
4. **Safe** - Won't duplicate data or cause errors
5. **Verifiable** - Easy to check if it worked

### Alternative: Prisma Seed via CLI

If you prefer using the Prisma CLI:

```bash
# Install Vercel CLI
npm i -g vercel

# Login to Vercel
vercel login

# Link to your project
vercel link

# Set environment variable temporarily
vercel env pull .env.production

# Run seed (this requires proper setup)
npx prisma db seed
```

This is more complex and requires CLI access, which is why we recommend the API approach.

---

## ✅ Success Checklist

- [ ] Added `ADMIN_SECRET_KEY` to Vercel environment variables
- [ ] Deployed code with new API endpoint
- [ ] Ran seeding script or cURL command
- [ ] Verified 108 questions in API response
- [ ] Tested assessment page in production
- [ ] Questions are displaying correctly
- [ ] Removed or secured the `ADMIN_SECRET_KEY` after seeding

---

## 🔐 Post-Seeding Security

After successfully seeding:

1. **Option 1:** Delete the `ADMIN_SECRET_KEY` from Vercel
   - The endpoint will stop working, which is fine since you only need it once

2. **Option 2:** Keep it for future use
   - Useful if you need to re-seed or seed a different environment
   - Make sure it's a strong secret

---

## 📞 Need Help?

If you encounter any issues:
1. Check the Vercel function logs
2. Review the error messages from the API response
3. Verify all environment variables are set correctly
4. Ensure the deployment completed successfully

---

## 🎯 Summary

**Before:** Production database had no questions ❌  
**After:** Production database has 108 questions ✅

The fix is simple:
1. Add secret key to Vercel
2. Deploy the code
3. Run the seeding script
4. Verify questions appear

Total time: ~5 minutes 🚀
