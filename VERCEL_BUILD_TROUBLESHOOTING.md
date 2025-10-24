# Vercel Build Troubleshooting Guide

**Last Updated:** October 22, 2025  
**Issue:** Persistent `ENOENT: no such file or directory, mkdir '/vercel/path0/.next'` error on Vercel

---

## ✅ Verification: Local Setup is Correct

### Confirmed Working Configuration:
- ✅ `.next` is a **directory** (not a symlink)
- ✅ `next.config.js` is **simplified** (no custom `distDir`, `output`, or `outputFileTracingRoot`)
- ✅ `.gitignore` properly excludes `/.next/`
- ✅ Latest fix committed and pushed to GitHub: `155c795 fix: resolve Vercel build error`
- ✅ Build script is standard: `"build": "next build"`
- ✅ Repository is accessible and up-to-date

### Environment Variables Required:
```
DATABASE_URL="postgresql://..."  # Required
NODE_ENV="production"             # Optional, Vercel sets this automatically
NEXT_PUBLIC_APP_URL="https://..."  # Optional
```

---

## 🔧 Troubleshooting Steps for Vercel

### Step 1: Clear Vercel Build Cache
Vercel may be using a cached version of your project that still has the old symlink issue.

**Actions:**
1. Go to your Vercel project dashboard: https://vercel.com/dashboard
2. Navigate to your project: **NLPQV2**
3. Go to **Settings** → **General**
4. Scroll down to find **Build & Development Settings**
5. Look for **"Clear Build Cache"** or **"Reset Build Cache"** button
6. Click it to clear the cache

**Alternative Method:**
- In your project settings, find the **"Redeploy"** option
- Select **"Redeploy with Clear Cache"**

---

### Step 2: Force a Fresh Deployment
After clearing the cache, trigger a new deployment:

**Option A: Via Vercel Dashboard**
1. Go to **Deployments** tab
2. Click on the **latest deployment**
3. Click the **three dots menu** (⋯)
4. Select **"Redeploy"**
5. Check **"Use existing Build Cache"** = **OFF**

**Option B: Via Git Push**
```bash
cd /home/ubuntu/ntaqv2
git commit --allow-empty -m "trigger: force Vercel rebuild"
git push origin master
```

---

### Step 3: Verify Vercel Project Settings

#### 3.1 Check Root Directory
1. Go to **Settings** → **General**
2. Ensure **Root Directory** is set to: `./` (root) or leave it blank
3. **Do NOT** set it to any subdirectory like `.next` or `nextjs_space`

#### 3.2 Verify Build & Output Settings
1. Go to **Settings** → **General** → **Build & Development Settings**
2. Ensure the following:
   ```
   Framework Preset: Next.js
   Build Command: npm run build  (or leave default)
   Output Directory: (leave blank, Next.js uses .next by default)
   Install Command: npm install  (or leave default)
   Development Command: npm run dev
   ```
3. **Important:** Do NOT override the Output Directory

#### 3.3 Check Node.js Version
1. Go to **Settings** → **General** → **Node.js Version**
2. Set to: **18.x** or **20.x** (recommended for Next.js 13+)
3. Avoid using Node.js 22.x as it may have compatibility issues

---

### Step 4: Verify Environment Variables
1. Go to **Settings** → **Environment Variables**
2. Add the following variables for **Production**, **Preview**, and **Development**:
   ```
   DATABASE_URL = postgresql://role_d33891b70:yZgqW9srRELW3S460ZMgKwFRPNDyzBgU@db-d33891b70.db002.hosteddb.reai.io:5432/d33891b70?connect_timeout=15
   ```
3. **Optional:** Add these if needed:
   ```
   NEXT_PUBLIC_APP_URL = https://your-app.vercel.app
   NODE_ENV = production
   ```

---

### Step 5: Check GitHub Repository Settings

#### 5.1 Verify Branch Connection
1. Go to Vercel project **Settings** → **Git**
2. Ensure it's connected to: `Stefanbotes/NLPQV2`
3. Ensure it's deploying from: `master` branch
4. Verify **Production Branch** is set to `master`

#### 5.2 Check GitHub Permissions
1. Go to **Settings** → **Git** → **Connected Git Repository**
2. Verify Vercel has access to the repository
3. If not, click **"Reconnect"** and grant permissions

---

### Step 6: Examine Vercel Build Logs
1. Go to **Deployments** tab
2. Click on the **failed deployment**
3. Look for the **Build Logs** section
4. Check for:
   - **Exact error location**: Which step fails?
   - **File system errors**: Any permissions issues?
   - **Dependency errors**: Are all packages installing correctly?
   - **Prisma errors**: Is Prisma generating correctly?

**Common Log Patterns to Look For:**
```
❌ Error: ENOENT: no such file or directory, mkdir '/vercel/path0/.next'
✅ Should see: Creating an optimized production build...
✅ Should see: Compiled successfully
```

---

### Step 7: Check for Vercel-Specific Issues

#### 7.1 Verify Project Type
- Ensure your project is set up as a **Next.js** project, not a static site

#### 7.2 Check for .vercelignore
Currently, there's no `.vercelignore` file in the project. This is correct.
- **Do NOT** create a `.vercelignore` that excludes `.next` (this would cause the build to fail)

#### 7.3 Prisma Considerations
If using Prisma, ensure the build process can generate the Prisma client:
1. Vercel should automatically run `prisma generate` during build
2. If not, add a `postinstall` script to `package.json`:
   ```json
   "scripts": {
     "postinstall": "prisma generate"
   }
   ```

---

### Step 8: Create vercel.json (If Needed)
If the issue persists, create a `vercel.json` file to explicitly configure the build:

```json
{
  "buildCommand": "next build",
  "devCommand": "next dev",
  "installCommand": "npm install",
  "framework": "nextjs",
  "outputDirectory": ".next"
}
```

**To create this file:**
```bash
cd /home/ubuntu/ntaqv2
cat > vercel.json << 'EOF'
{
  "buildCommand": "next build",
  "devCommand": "next dev",
  "installCommand": "npm install",
  "framework": "nextjs",
  "outputDirectory": ".next"
}
EOF
git add vercel.json
git commit -m "Add explicit Vercel configuration"
git push origin master
```

---

### Step 9: Try Vercel CLI Deployment (Advanced)
If the dashboard deployment still fails, try deploying via CLI:

```bash
# Install Vercel CLI
npm install -g vercel

# Login to Vercel
vercel login

# Deploy from local directory
cd /home/ubuntu/ntaqv2
vercel --prod

# This will show real-time build output and help identify the exact issue
```

---

## 🐛 Debugging: What to Look For in Logs

### Successful Build Should Show:
```
✓ Compiled successfully
✓ Creating an optimized production build
✓ Generating static pages
✓ Finalizing page optimization
```

### Failed Build Patterns:

#### Pattern 1: Permission/Directory Error
```
Error: ENOENT: no such file or directory, mkdir '/vercel/path0/.next'
```
**Solution:** Clear cache and redeploy (Steps 1-2)

#### Pattern 2: Symlink Error
```
Error: ELOOP: too many symbolic links encountered
```
**Solution:** Verify .next is not a symlink (already fixed locally)

#### Pattern 3: Dependency Error
```
Error: Cannot find module 'next'
```
**Solution:** Check `package.json` dependencies and `node_modules`

#### Pattern 4: Prisma Error
```
Error: Cannot find module '@prisma/client'
```
**Solution:** Add postinstall script (Step 7.3)

---

## 📋 Quick Checklist

Before seeking further support, verify:

- [ ] Cleared Vercel build cache
- [ ] Redeployed with cleared cache
- [ ] Root directory is set to `./` or blank
- [ ] Build command is `npm run build` or default
- [ ] Output directory is blank
- [ ] Node.js version is 18.x or 20.x
- [ ] Environment variable `DATABASE_URL` is set
- [ ] Connected to correct GitHub repo and branch
- [ ] Checked build logs for specific error messages
- [ ] Local build works: `npm run build` succeeds locally

---

## 🆘 Still Having Issues?

If the error persists after trying all steps:

### Option 1: Check Vercel Status
- Visit: https://www.vercel-status.com/
- Verify there are no ongoing platform issues

### Option 2: Contact Vercel Support (Pro Plan)
Since you have a Vercel Pro plan, you have access to priority support:
1. Go to https://vercel.com/support
2. Submit a ticket with:
   - Project name: **NLPQV2**
   - Error message: `ENOENT: no such file or directory, mkdir '/vercel/path0/.next'`
   - Repository: https://github.com/Stefanbotes/NLPQV2
   - Mention: "Cleared cache, verified configuration, local build works"
   - Attach build logs

### Option 3: Try Alternative Deployment
As a temporary workaround, consider deploying to:
- **Railway**: https://railway.app/
- **Render**: https://render.com/
- **Fly.io**: https://fly.io/

---

## 📝 Important Notes

### What Was Already Fixed:
1. ✅ Removed `.next` symbolic link (commit `155c795`)
2. ✅ Simplified `next.config.js` (no custom distDir)
3. ✅ Updated `.gitignore` to exclude `/.next/`
4. ✅ Verified local build works correctly
5. ✅ Pushed all fixes to GitHub

### Why This Might Still Fail on Vercel:
- **Cached Build**: Vercel might be using an old cached version
- **Stale File System**: The build environment might have old files
- **Platform Issue**: Rare Vercel platform-specific bug
- **Hidden Configuration**: Some project setting in Vercel dashboard might be incorrect

### Next Steps:
1. **Start with Step 1-2** (Clear cache and redeploy) - This fixes 80% of cases
2. **Then verify Step 3** (Project settings) - Ensures correct configuration
3. **If still failing**, try Step 8 (Add vercel.json) - Explicit configuration
4. **Last resort**: Contact Vercel Pro support

---

## 🎯 Expected Outcome

After following these steps, your deployment should:
1. Build successfully on Vercel
2. Deploy to production
3. Be accessible at your Vercel URL (e.g., `https://nlpqv2.vercel.app`)

---

**Repository:** https://github.com/Stefanbotes/NLPQV2  
**Local Path:** `/home/ubuntu/ntaqv2`  
**Latest Fix Commit:** `155c795 fix: resolve Vercel build error`  
**Vercel Pro Plan:** Active ✅
