# Vercel Build Error Fix Summary

**Date:** October 22, 2025  
**Issue:** Failed to collect page data for `/api/assessment/questions`  
**Status:** ✅ RESOLVED

---

## Problem Description

The Vercel build was failing during the "Collecting page data" phase with the following error:

```
Error: Failed to collect page data for /api/assessment/questions
    at /vercel/path0/node_modules/next/dist/build/utils.js:1269:15
```

This error occurred because the API route was attempting to execute database connection code at **build time** instead of at **runtime**.

---

## Root Cause Analysis

The `/app/api/assessment/questions/route.ts` file had two critical issues:

### 1. Module-Level PrismaClient Instantiation ❌

```typescript
// ❌ INCORRECT - Executes at build time
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();
```

This creates a Prisma client instance when the module loads, which happens during the build process. The database is not available at build time, causing the error.

### 2. Missing Dynamic Route Configuration ❌

The route lacked the `export const dynamic = 'force-dynamic'` declaration, which tells Next.js that this route must be rendered dynamically at runtime, not analyzed or pre-rendered at build time.

### 3. Incorrect Prisma Disconnect Pattern ❌

```typescript
finally {
  await prisma.$disconnect();
}
```

When using a singleton Prisma pattern, you should NOT disconnect after each request, as this defeats the purpose of the singleton and causes performance issues.

---

## The Solution

### Changes Made to `/app/api/assessment/questions/route.ts`

#### Before (Broken):
```typescript
// API route to fetch assessment questions from database (canonical source)
import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET(request: NextRequest) {
  try {
    const questions = await prisma.assessmentQuestion.findMany({
      // ... query logic
    });
    // ... response logic
  } catch (error) {
    // ... error handling
  } finally {
    await prisma.$disconnect();
  }
}
```

#### After (Fixed):
```typescript
// API route to fetch assessment questions from database (canonical source)
export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    const questions = await db.assessmentQuestion.findMany({
      // ... query logic
    });
    // ... response logic
  } catch (error) {
    // ... error handling
  }
}
```

### Key Changes:

1. ✅ **Added dynamic route configuration** at the top of the file
2. ✅ **Replaced module-level PrismaClient** with the shared `db` singleton from `/lib/db`
3. ✅ **Removed `prisma.$disconnect()`** from the finally block
4. ✅ **Updated all `prisma` references** to use `db` instead

---

## Understanding the Prisma Singleton Pattern

The app uses a proper Prisma singleton pattern in `/lib/db.ts`:

```typescript
import { PrismaClient } from '@prisma/client'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

export const prisma = globalForPrisma.prisma ?? new PrismaClient()
export const db = prisma  // Export as db for consistency

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma
```

**Why This Pattern?**
- Prevents multiple Prisma client instances from being created
- Reuses the same connection pool across requests (better performance)
- Prevents connection exhaustion in serverless environments
- Avoids build-time database access issues

---

## Verification

### Local Build Test

```bash
cd /home/ubuntu/ntaqv2
rm -rf .next
npm run vercel:build
```

**Result:** ✅ Build completed successfully!

```
✓ Compiled successfully
✓ Generating static pages (14/14)
Route (app)                               Size     First Load JS
...
├ ƒ /api/assessment/questions             0 B                0 B
...
```

The route now appears as `ƒ` (dynamic), indicating it's properly configured for runtime execution.

### Warnings (Non-Critical)

The build shows some warnings about Node.js modules and bcryptjs not being supported in Edge Runtime. These are **not errors** and won't affect deployment because:
- Our routes use `force-dynamic` which runs in the Node.js runtime, not Edge Runtime
- These are expected warnings for routes that use Node.js-specific features
- The app is designed to run in the Node.js runtime on Vercel

---

## Git Commit

**Commit Hash:** `d797436`  
**Message:** "Fix: Resolve build error in /api/assessment/questions route"

**Changes:**
- 1 file changed
- 4 insertions(+), 6 deletions(-)

**Pushed to:** `https://github.com/Stefanbotes/InnerPersona.git`

---

## Verification Checklist for Other Routes

All other API routes were checked and verified:

✅ No other routes create `new PrismaClient()` at the module level  
✅ All routes (except NextAuth) have `export const dynamic = 'force-dynamic'`  
✅ All routes use the shared `db` instance from `/lib/db`  
✅ NextAuth route uses its own handler pattern (which is correct)

---

## Best Practices for Next.js API Routes with Prisma

### ✅ DO:
1. Always add `export const dynamic = 'force-dynamic'` for database routes
2. Use the shared Prisma singleton from `/lib/db`
3. Import as: `import { db } from '@/lib/db'`
4. Let the singleton manage connections (don't call `$disconnect()`)
5. Handle errors gracefully with try-catch blocks

### ❌ DON'T:
1. Create `new PrismaClient()` at the module level in route files
2. Call `await prisma.$disconnect()` after each request
3. Execute database queries outside of the route handler function
4. Forget to add the `dynamic` export configuration

---

## Next Steps for Vercel Deployment

1. The fix has been pushed to GitHub: ✅
2. Vercel will automatically detect the new commit
3. Vercel will trigger a new build with the fixed code
4. The build should now complete successfully

**Expected Outcome:**
- ✅ Build completes without errors
- ✅ `/api/assessment/questions` route works correctly
- ✅ App deploys successfully to Vercel

---

## Impact on Application

### What Was Fixed:
- Vercel build process now completes successfully
- `/api/assessment/questions` route can be analyzed and built correctly
- Route will execute properly at runtime with database access

### What Was NOT Changed:
- No changes to route functionality or API response format
- No changes to frontend code or database queries
- No changes to authentication or other API routes
- The app's behavior at runtime remains identical

---

## Conclusion

The Vercel build error was caused by improper Prisma client instantiation in the `/api/assessment/questions` route. By following Next.js best practices and using the app's existing Prisma singleton pattern, the build now completes successfully. The fix has been tested locally and pushed to GitHub, ready for Vercel deployment.

**Key Takeaway:** Always use the shared Prisma singleton (`db`) and mark database routes as dynamic with `export const dynamic = 'force-dynamic'` to prevent build-time execution issues.

---

## Related Documentation

- [CHECKPOINT_INFO.md](./CHECKPOINT_INFO.md) - Version control and checkpoint information
- [UI_REGRESSION_FIX_SUMMARY.md](./UI_REGRESSION_FIX_SUMMARY.md) - Previous port 3000 fix
- [QUICK_START.md](./QUICK_START.md) - App setup and deployment guide
- [lib/db.ts](./lib/db.ts) - Prisma singleton implementation

---

**Fixed by:** DeepAgent  
**Date:** October 22, 2025  
**Build Status:** ✅ SUCCESSFUL
