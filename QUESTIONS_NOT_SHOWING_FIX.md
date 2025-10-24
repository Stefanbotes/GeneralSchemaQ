# Fix: 108 Questions Not Appearing on Vercel Deployment

## 🔍 Problem Analysis

### What Was Discovered

**Issue**: The 108 questions are not appearing on the Vercel deployment at https://nlpqv-2.vercel.app

**Root Cause**: 
- ✅ Questions data file (`data/questionnaireData.js`) **EXISTS** in the repository with all 108 questions
- ✅ Questions data file **HAS BEEN PUSHED** to GitHub  
- ✅ The API endpoint `/api/assessment/questions` **WORKS CORRECTLY** - returns 200 OK
- ❌ The **Vercel production database is EMPTY** - has 0 questions seeded

### How the App Works

1. **Questions Source**: Questions are stored in `/data/questionnaireData.js` (108 questions, 18 schemas, 5 domains)
2. **API Behavior**: The `/api/assessment/questions` endpoint fetches from the **PostgreSQL database**, NOT the file
3. **Local vs Production**: 
   - **Local**: Database was seeded → 108 questions appear ✅
   - **Vercel**: Database is empty → 0 questions appear ❌

### Verification

Current Vercel database status:
```bash
curl -s https://nlpqv-2.vercel.app/api/admin/seed-questions | jq
```

Result:
```json
{
  "success": true,
  "data": {
    "questionsInDatabase": 0,
    "lasbiItemsInDatabase": 0,
    "isSeeded": false,
    "status": "empty"
  }
}
```

---

## ✅ Solution: Seed the Vercel Production Database

### Prerequisites

1. **ADMIN_SECRET_KEY must be set in Vercel**
   - Go to: Vercel Dashboard → Your Project → Settings → Environment Variables
   - Add: `ADMIN_SECRET_KEY` with value: `ImcgFbgrtF7utKk0aNWwHShxISztiQBaMUZVRW2m3gA=`
   - Enable for: Production, Preview, Development
   - **Important**: After adding, you MUST redeploy for it to take effect

2. **Redeploy the application**
   - Go to: Deployments tab → Latest deployment → Three dots → Redeploy
   - Wait for "Ready" status

### Seeding Command

The admin seeding endpoint uses **header-based authentication** with the `x-admin-secret` header:

```bash
curl -X POST https://nlpqv-2.vercel.app/api/admin/seed-questions \
  -H "x-admin-secret: ImcgFbgrtF7utKk0aNWwHShxISztiQBaMUZVRW2m3gA=" \
  -H "Content-Type: application/json"
```

### Expected Success Response

```json
{
  "success": true,
  "message": "Questions and LASBI items seeded successfully",
  "data": {
    "questionsCreated": 108,
    "lasbiItemsCreated": 108,
    "version": "2.0.0-leadership",
    "domains": 5
  }
}
```

### Verify Seeding

After seeding, verify the questions are now in the database:

```bash
curl -s https://nlpqv-2.vercel.app/api/admin/seed-questions | jq
```

Expected result:
```json
{
  "success": true,
  "data": {
    "questionsInDatabase": 108,
    "lasbiItemsInDatabase": 108,
    "isSeeded": true,
    "status": "seeded"
  }
}
```

Then check the questions endpoint:

```bash
curl -s https://nlpqv-2.vercel.app/api/assessment/questions | jq '.total'
```

Expected: `108`

---

## 🛠️ Troubleshooting

### Error: "Unauthorized: Invalid admin secret"

**Problem**: The ADMIN_SECRET_KEY doesn't match or isn't set
**Solution**:
1. Check Vercel Environment Variables for `ADMIN_SECRET_KEY`
2. Verify the value matches: `ImcgFbgrtF7utKk0aNWwHShxISztiQBaMUZVRW2m3gA=`
3. Ensure you redeployed after adding the variable
4. Wait a few minutes after redeployment before trying again

### Error: "Server configuration error: ADMIN_SECRET_KEY not set"

**Problem**: Environment variable wasn't added or deployment hasn't picked it up
**Solution**:
1. Add ADMIN_SECRET_KEY to Vercel Environment Variables
2. Trigger a new deployment
3. Wait for "Ready" status
4. Try the seeding command again

### Error: "Questions already exist in database"

**Problem**: Database has already been seeded
**Solution**: This is actually good! Your database already has questions. Verify with:
```bash
curl -s https://nlpqv-2.vercel.app/api/assessment/questions | jq '.total'
```

### Error: Database connection issues

**Problem**: DATABASE_URL is incorrect or database is unreachable
**Solution**:
1. Check DATABASE_URL in Vercel Environment Variables
2. Verify your database provider (Supabase/Neon) is accessible
3. Check database provider logs for connection issues

---

## 📊 Technical Details

### Database Schema

Questions are stored in two tables:

1. **assessment_questions**: Main question data
   - `id`: Canonical ID (e.g., "1.1.1")
   - `order`: Display order (1-108)
   - `domain`: Domain name (5 domains)
   - `schema`: Schema name (18 schemas)
   - `persona`: Schema persona label
   - `healthyPersona`: Healthy functioning label
   - `statement`: Question text
   - `isActive`: Boolean flag

2. **lasbi_items**: LASBI scoring reference
   - `item_id`: Modern ID format (e.g., "cmf1_1_1")
   - `canonical_id`: Links to assessment_questions
   - `variable_id`: Schema ID (e.g., "1.1")
   - `question_number`: Question number within schema
   - `schema_label`: Schema name

### API Endpoints

1. **GET /api/assessment/questions**
   - Public endpoint
   - Returns all active questions from database
   - Used by the assessment form

2. **GET /api/admin/seed-questions**
   - Public status check
   - Returns database seed status
   - Shows question and LASBI item counts

3. **POST /api/admin/seed-questions**
   - Protected endpoint (requires x-admin-secret header)
   - Seeds the database from questionnaireData.js
   - One-time operation (won't re-seed if data exists)

---

## 🎯 Quick Reference

### Check Seed Status
```bash
curl -s https://nlpqv-2.vercel.app/api/admin/seed-questions | jq
```

### Seed Production Database
```bash
curl -X POST https://nlpqv-2.vercel.app/api/admin/seed-questions \
  -H "x-admin-secret: ImcgFbgrtF7utKk0aNWwHShxISztiQBaMUZVRW2m3gA=" \
  -H "Content-Type: application/json"
```

### Verify Questions Appear
```bash
curl -s https://nlpqv-2.vercel.app/api/assessment/questions | jq '{total: .total, firstQuestion: .questions[0].statement, lastQuestion: .questions[107].statement}'
```

---

## ✅ Step-by-Step Checklist

Complete these steps in order:

1. [ ] Verify ADMIN_SECRET_KEY is in Vercel Environment Variables
2. [ ] If not set, add ADMIN_SECRET_KEY (value: `ImcgFbgrtF7utKk0aNWwHShxISztiQBaMUZVRW2m3gA=`)
3. [ ] Redeploy the application from Vercel Dashboard
4. [ ] Wait for "Ready" status (1-2 minutes)
5. [ ] Check current seed status with GET request
6. [ ] If status is "empty", run the POST seeding command
7. [ ] Verify seeding success (should show 108 questions created)
8. [ ] Check questions endpoint returns 108 questions
9. [ ] Visit https://nlpqv-2.vercel.app/assessment to see questions live

---

**Issue Identified**: October 23, 2025  
**Resolution Status**: ✅ Root cause identified, solution documented  
**Next Action**: Execute seeding command with proper ADMIN_SECRET_KEY
