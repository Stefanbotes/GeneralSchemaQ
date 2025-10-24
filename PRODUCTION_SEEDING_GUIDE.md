# Production Seeding Guide for NTAQV2

## Overview
This guide provides step-by-step instructions for seeding your production database with questions after deploying to Vercel.

---

## Step 1: Verify Vercel Deployment

### Check Deployment Status
1. Go to your Vercel dashboard: https://vercel.com/dashboard
2. Locate your NLPQV2 project
3. Verify that the latest deployment shows as "Ready" or "Success"
4. The deployment should be using the latest commit: `5e3c60d` (or newer)

### Test Production URL
1. Visit your production URL: **https://nlpqv2.vercel.app**
2. Verify the homepage loads correctly
3. Check that styling and UI elements are working
4. Try navigating to different pages (login, signup, etc.)

**✅ If the site loads correctly, proceed to Step 2**  
**❌ If there are errors, check the Vercel deployment logs for issues**

---

## Step 2: Prepare Environment Variables

You'll need two environment variables to run the seeding script:

### 1. PRODUCTION_URL (Already Known)
```bash
PRODUCTION_URL="https://nlpqv2.vercel.app"
```

### 2. ADMIN_SECRET_KEY (You Need to Provide This)

**Where to find it:**
- Check your Vercel project settings → Environment Variables
- Look for `ADMIN_SECRET_KEY` or similar
- If you don't have one set, you can use any secure string (minimum 32 characters)

**To set it in Vercel (if not already set):**
1. Go to your Vercel project settings
2. Navigate to "Environment Variables"
3. Add a new variable:
   - **Name:** `ADMIN_SECRET_KEY`
   - **Value:** Your secure secret key
   - **Environments:** Production (checked)
4. Click "Save"
5. **Important:** Redeploy your project for the new variable to take effect

---

## Step 3: Run the Production Seeding Script

### Prerequisites
- You must be in the `/home/ubuntu/ntaqv2` directory
- The production deployment must be live and accessible
- You must have the `ADMIN_SECRET_KEY` value

### Running the Script

**Option A: With Inline Environment Variables**
```bash
cd /home/ubuntu/ntaqv2
PRODUCTION_URL="https://nlpqv2.vercel.app" ADMIN_SECRET_KEY="your-actual-secret-key" ./scripts/seed-production.sh
```

**Option B: Export Variables First**
```bash
cd /home/ubuntu/ntaqv2
export PRODUCTION_URL="https://nlpqv2.vercel.app"
export ADMIN_SECRET_KEY="your-actual-secret-key"
./scripts/seed-production.sh
```

**Replace `your-actual-secret-key` with your actual admin secret key!**

---

## Step 4: What to Expect

### During Execution
The script will:
1. Display the production URL being used
2. Make an HTTP POST request to: `https://nlpqv2.vercel.app/api/seed-questions`
3. Send the admin secret key for authentication
4. Wait for the response

### Successful Output
```
🌱 Seeding production database...
Production URL: https://nlpqv2.vercel.app

Response:
{
  "success": true,
  "message": "Questions seeded successfully",
  "count": 125
}

✅ Seeding completed successfully!
```

### Error Scenarios

#### 1. Missing Environment Variables
```
❌ Error: PRODUCTION_URL is not set
Please set both PRODUCTION_URL and ADMIN_SECRET_KEY environment variables
```
**Fix:** Make sure you've exported or passed both variables

#### 2. Authentication Failed
```
Response:
{
  "error": "Unauthorized - Invalid or missing admin secret"
}
```
**Fix:** Check that your `ADMIN_SECRET_KEY` matches the one set in Vercel

#### 3. Questions Already Exist
```
Response:
{
  "success": false,
  "message": "Questions already exist in database"
}
```
**Fix:** This is expected if you've already run the script. The database won't be seeded twice.

#### 4. Network or Server Error
```
curl: (7) Failed to connect to nlpqv2.vercel.app
```
**Fix:** Check that:
- Your production site is deployed and accessible
- You have internet connectivity
- The Vercel deployment hasn't failed

---

## Step 5: Verify Seeding Success

### Check via Application
1. Log into your production site: https://nlpqv2.vercel.app
2. Navigate to the questionnaire section
3. Verify that questions are visible and can be answered

### Check via Database (Optional)
If you have access to your production database:
```sql
SELECT COUNT(*) FROM "Question";
```
Should return approximately 125 questions (or the expected count for your questionnaire).

---

## Troubleshooting

### Issue: Script Permission Denied
```bash
bash: ./scripts/seed-production.sh: Permission denied
```
**Fix:**
```bash
chmod +x scripts/seed-production.sh
./scripts/seed-production.sh
```

### Issue: Endpoint Not Found (404)
```
Response: 404 Not Found
```
**Fix:**
- Verify the latest code was deployed to Vercel
- Check that `app/api/seed-questions/route.ts` exists in your repository
- Trigger a manual redeploy in Vercel if needed

### Issue: Questions Not Appearing in App
**Possible causes:**
1. Seeding failed silently - check the API response
2. Database connection issue - check Vercel logs
3. Questions seeded to wrong database - verify `DATABASE_URL` in Vercel

**Fix:**
- Review Vercel function logs for the seed-questions endpoint
- Verify all environment variables are correct
- Check that the production database is the one your app is using

---

## Important Notes

### 🔐 Security
- **Never commit** your `ADMIN_SECRET_KEY` to Git
- Keep the secret key secure and private
- The seeding endpoint is protected by this key to prevent unauthorized access

### 🔄 Re-running the Script
- The script is designed to be **idempotent**
- It will check if questions already exist before seeding
- You can safely run it multiple times without duplicating data

### 📊 Database State
- After successful seeding, your production database will contain:
  - All questions from `data/questions.json`
  - Proper category associations
  - Correct ordering and display logic

---

## Quick Reference Command

Once you have your admin secret key, use this command:

```bash
cd /home/ubuntu/ntaqv2 && PRODUCTION_URL="https://nlpqv2.vercel.app" ADMIN_SECRET_KEY="your-secret-key-here" ./scripts/seed-production.sh
```

---

## Next Steps After Seeding

1. ✅ Test the questionnaire flow in production
2. ✅ Verify all questions display correctly
3. ✅ Test user registration and login
4. ✅ Check that responses are saved properly
5. ✅ Review any console errors in browser dev tools
6. ✅ Monitor Vercel function logs for any runtime errors

---

## Support

If you encounter issues:
1. Check the Vercel deployment logs
2. Review the function logs for the `/api/seed-questions` endpoint
3. Verify all environment variables are set correctly
4. Ensure the production database is accessible

---

**Last Updated:** October 23, 2025  
**Deployment Commit:** 5e3c60d  
**Production URL:** https://nlpqv2.vercel.app
