# Quick Seeding Reference

## TL;DR - Fast Track

### 1️⃣ Add Environment Variable to Vercel
```
Name: ADMIN_SECRET_KEY
Value: prod_seed_secret_[YOUR_RANDOM_STRING]
Environment: Production
```

### 2️⃣ Deploy to Vercel
```bash
git add .
git commit -m "Add production database seeding endpoint"
git push origin main
```

### 3️⃣ Run Seeding (After Deployment Completes)

**Using the script:**
```bash
export PRODUCTION_URL="https://your-app.vercel.app"
export ADMIN_SECRET_KEY="prod_seed_secret_[YOUR_RANDOM_STRING]"
./scripts/seed-production.sh
```

**Or using cURL:**
```bash
curl -X POST "https://your-app.vercel.app/api/admin/seed-questions" \
  -H "x-admin-secret: prod_seed_secret_[YOUR_RANDOM_STRING]" \
  -H "Content-Type: application/json"
```

### 4️⃣ Verify
```bash
# Should return 108
curl "https://your-app.vercel.app/api/assessment/questions" | jq '.total'
```

---

## What This Does

Seeds **108 questions** and **108 LASBI items** into your production database.

**Source:** `/data/questionnaireData.js`
- 5 Domains
- 18 Schemas  
- 6 Questions per schema (Cognitive, Emotional, Belief)

---

## Endpoint Details

### GET `/api/admin/seed-questions`
Check seeding status (no authentication required)

**Response:**
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

### POST `/api/admin/seed-questions`
Seed the database (requires `x-admin-secret` header)

**Headers:**
```
x-admin-secret: [YOUR_ADMIN_SECRET_KEY]
Content-Type: application/json
```

**Success Response:**
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

**Already Seeded Response:**
```json
{
  "message": "Questions already exist in database. Use force=true to re-seed.",
  "success": true,
  "data": {
    "existingQuestions": 108,
    "existingLasbiItems": 108
  }
}
```

---

## Common Issues

| Error | Fix |
|-------|-----|
| `Unauthorized: Invalid admin secret` | Check that `ADMIN_SECRET_KEY` matches in Vercel and your request |
| `ADMIN_SECRET_KEY not set` | Add the environment variable to Vercel |
| `Questions already exist` | Already seeded! You're done ✅ |
| Connection refused | Deployment not complete yet, wait a minute |

---

## Security Note

The `ADMIN_SECRET_KEY` is only needed for seeding. After successfully seeding, you can:
- Delete it from Vercel (endpoint will be disabled)
- Keep it for future seeding operations

This is a **one-time operation**, so most users can delete it after seeding.

---

## Files Modified/Created

- ✅ `/app/api/admin/seed-questions/route.ts` - API endpoint
- ✅ `/scripts/seed-production.sh` - Helper script
- ✅ `PRODUCTION_SEED_GUIDE.md` - Full documentation
- ✅ `QUICK_SEED_REFERENCE.md` - This file

---

## Next Steps After Seeding

1. Test the assessment page: `https://your-app.vercel.app/assessment`
2. Verify all 108 questions appear
3. Complete a test assessment
4. Check that results are calculated correctly
5. (Optional) Delete `ADMIN_SECRET_KEY` from Vercel for security

---

**Full documentation:** See `PRODUCTION_SEED_GUIDE.md` for detailed explanations and troubleshooting.
