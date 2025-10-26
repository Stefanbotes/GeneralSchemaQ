# GitHub Push & Vercel Deployment Guide for NTAQV2

## 🚨 Current Status

**Git Repository:** ✅ Initialized and configured  
**Remote Repository:** ✅ Connected to https://github.com/Stefanbotes/InnerPersona.git  
**GitHub Token:** ❌ Missing required permissions (needs `repo` scope)

---

## Part 1: Pushing Code to GitHub

### Step 1: Create a New Personal Access Token with Proper Permissions

The current token doesn't have the necessary permissions to push code. You need to create a new token:

1. **Go to GitHub Settings:**
   - Navigate to: https://github.com/settings/tokens
   - Or click your profile picture → Settings → Developer settings → Personal access tokens → Tokens (classic)

2. **Generate New Token (Classic):**
   - Click "Generate new token" → "Generate new token (classic)"
   - Name: `NTAQV2-Deployment`
   - Expiration: Choose your preferred duration (90 days recommended)

3. **Select Required Scopes:**
   - ✅ **`repo`** (Full control of private repositories) - **THIS IS REQUIRED**
     - This includes: repo:status, repo_deployment, public_repo, repo:invite, security_events
   - ✅ `workflow` (optional, if you plan to use GitHub Actions)

4. **Generate and Copy Token:**
   - Click "Generate token"
   - **⚠️ IMPORTANT:** Copy the token immediately - you won't be able to see it again!
   - The token will look like: `ghp_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx`

### Step 2: Configure Git with the New Token

Once you have a token with proper permissions, run these commands:

```bash
cd /home/ubuntu/ntaqv2

# Update the remote URL with your new token
git remote set-url origin https://YOUR_NEW_TOKEN@github.com/Stefanbotes/InnerPersona.git

# Verify the repository status
git status

# Add any untracked files if needed
git add .

# Create a commit if there are changes
git commit -m "Prepare NTAQV2 for Vercel deployment"

# Push to GitHub
git push -u origin master
```

**⚠️ Security Note:** The token is stored in the git config. Keep your development environment secure!

### Step 3: Verify the Push

After pushing, verify by visiting:
- **Repository URL:** https://github.com/Stefanbotes/InnerPersona
- Check that all files are present (except those in .gitignore)
- Verify the commit history is correct

---

## Part 2: Deploying to Vercel

### Prerequisites

1. ✅ Code pushed to GitHub (complete Part 1 first)
2. ✅ Vercel account (sign up at https://vercel.com if you don't have one)
3. ✅ PostgreSQL database ready (Vercel Postgres or external provider)

### Step 1: Connect GitHub Repository to Vercel

1. **Log in to Vercel:**
   - Go to https://vercel.com
   - Sign in (use GitHub account for easier integration)

2. **Import Project:**
   - Click "Add New..." → "Project"
   - Select "Import Git Repository"
   - Choose: **Stefanbotes/InnerPersona**
   - Click "Import"

3. **Configure Project Settings:**
   - **Framework Preset:** Next.js (should auto-detect)
   - **Root Directory:** `./` (leave as default)
   - **Build Command:** `npm run build` (auto-detected)
   - **Output Directory:** `.next` (auto-detected)
   - **Install Command:** `npm install` (auto-detected)

### Step 2: Configure Environment Variables

Add these environment variables in Vercel project settings:

#### Database Configuration
```env
DATABASE_URL="postgresql://username:password@host:port/database?sslmode=require"
DIRECT_URL="postgresql://username:password@host:port/database?sslmode=require"
```

**Options for PostgreSQL:**

**Option A: Vercel Postgres (Recommended for simplicity)**
1. In your Vercel project, go to "Storage" tab
2. Click "Create Database" → "Postgres"
3. Follow the setup wizard
4. Vercel will automatically add `DATABASE_URL` and `DIRECT_URL` to your project

**Option B: External PostgreSQL Provider**
- **Supabase:** https://supabase.com (free tier available)
- **Neon:** https://neon.tech (free tier with generous limits)
- **Railway:** https://railway.app (free tier available)
- **ElephantSQL:** https://www.elephantsql.com (free tier available)

For external providers, copy the connection string they provide and add it to Vercel.

#### Authentication & Security
```env
NEXTAUTH_URL="https://your-app-name.vercel.app"
NEXTAUTH_SECRET="your-super-secret-key-here"
```

**Generate NEXTAUTH_SECRET:**
```bash
# Run this locally to generate a secure random secret
openssl rand -base64 32
```

#### Email Configuration (for verification emails)
```env
EMAIL_SERVER_HOST="smtp.gmail.com"
EMAIL_SERVER_PORT="587"
EMAIL_SERVER_USER="your-email@gmail.com"
EMAIL_SERVER_PASSWORD="your-app-specific-password"
EMAIL_FROM="noreply@your-domain.com"
```

**For Gmail:**
1. Enable 2-factor authentication on your Google account
2. Generate an "App Password" at https://myaccount.google.com/apppasswords
3. Use this app password for `EMAIL_SERVER_PASSWORD`

**For SendGrid (Alternative - Recommended for production):**
```env
EMAIL_SERVER_HOST="smtp.sendgrid.net"
EMAIL_SERVER_PORT="587"
EMAIL_SERVER_USER="apikey"
EMAIL_SERVER_PASSWORD="your-sendgrid-api-key"
EMAIL_FROM="noreply@your-domain.com"
```

#### Application Settings
```env
NODE_ENV="production"
NEXT_PUBLIC_APP_URL="https://your-app-name.vercel.app"
```

### Step 3: Deploy the Application

1. **Initial Deployment:**
   - After configuring environment variables, click "Deploy"
   - Vercel will build and deploy your application
   - This may take 2-5 minutes

2. **Monitor Build Logs:**
   - Watch the build logs for any errors
   - Common issues:
     - Missing environment variables
     - TypeScript errors
     - Build failures

### Step 4: Run Database Migrations

After the first deployment, you need to initialize the database:

1. **Install Vercel CLI locally:**
```bash
npm install -g vercel
```

2. **Login to Vercel:**
```bash
vercel login
```

3. **Link your project:**
```bash
cd /home/ubuntu/ntaqv2
vercel link
```

4. **Run Prisma migrations:**
```bash
# Pull environment variables from Vercel
vercel env pull .env.production

# Generate Prisma client
npx prisma generate

# Run migrations
DATABASE_URL="$(grep DATABASE_URL .env.production | cut -d '=' -f2-)" npx prisma migrate deploy
```

**Alternative: Run migrations directly on Vercel**
```bash
# After linking your project
vercel env pull
npx prisma migrate deploy
```

5. **Seed the database (if needed):**
```bash
# The question data should be populated automatically
# Check the data/ directory structure is being loaded correctly
```

### Step 5: Verify Deployment

1. **Visit your deployed application:**
   - URL: `https://your-app-name.vercel.app`
   - Or the custom domain if configured

2. **Test critical features:**
   - ✅ Home page loads correctly
   - ✅ User registration works
   - ✅ Email verification is sent
   - ✅ User can log in
   - ✅ Questionnaire loads properly
   - ✅ Responses are saved to database
   - ✅ Results page displays correctly

3. **Check Vercel Logs:**
   - Go to Vercel Dashboard → Your Project → Logs
   - Monitor for any runtime errors

---

## Part 3: Post-Deployment Configuration

### Custom Domain (Optional)

1. **In Vercel Dashboard:**
   - Go to Settings → Domains
   - Click "Add Domain"
   - Enter your domain name
   - Follow DNS configuration instructions

2. **Update Environment Variables:**
   - Update `NEXTAUTH_URL` to your custom domain
   - Update `NEXT_PUBLIC_APP_URL` to your custom domain
   - Redeploy for changes to take effect

### Enable Preview Deployments

Vercel automatically creates preview deployments for:
- Every push to non-production branches
- Every pull request

Preview URLs look like: `https://your-app-git-branch-name-user.vercel.app`

### Set Up Continuous Deployment

By default, Vercel automatically deploys:
- **Production:** Every push to `master` branch
- **Preview:** Every push to other branches

To customize:
1. Go to Settings → Git
2. Configure production branch
3. Configure deployment protection

---

## Part 4: Troubleshooting Guide

### Build Failures

**Error: "Cannot find module 'xxx'"**
```bash
# Solution: Ensure all dependencies are in package.json
npm install <missing-package> --save
git add package.json package-lock.json
git commit -m "Add missing dependency"
git push
```

**Error: TypeScript type errors**
```bash
# Run TypeScript check locally first
npm run build

# Fix type errors before pushing
```

### Runtime Errors

**Error: "Prisma Client not initialized"**
```bash
# Add postinstall script to package.json
"scripts": {
  "postinstall": "prisma generate"
}
```

**Error: "Cannot connect to database"**
- Verify `DATABASE_URL` is correct in Vercel
- Check database is accessible from Vercel's network
- Ensure SSL mode is configured correctly
- For Vercel Postgres, use `POSTGRES_PRISMA_URL` instead

**Error: "NEXTAUTH_URL missing"**
- Add `NEXTAUTH_URL` environment variable in Vercel
- Format: `https://your-app-name.vercel.app`
- Redeploy after adding

### Email Issues

**Emails not sending:**
1. Verify email environment variables are correct
2. Check email provider credentials
3. For Gmail, ensure "Less secure apps" is enabled OR use App Password
4. Check Vercel logs for email errors

**Verification links not working:**
- Ensure `NEXTAUTH_URL` matches your actual domain
- Check email templates use the correct base URL

### Database Issues

**Migrations not applied:**
```bash
# Use Vercel CLI to run migrations
vercel env pull
npx prisma migrate deploy
```

**Database connection timeout:**
- Check connection pooling settings
- Vercel has connection limits (check your plan)
- Consider using Prisma Data Proxy for better connection management

### Performance Issues

**Slow page loads:**
- Enable Edge caching in Vercel
- Optimize database queries
- Add database indexes for frequently queried fields
- Consider implementing Redis for caching

**Cold starts:**
- Vercel hobby plan has cold starts after inactivity
- Upgrade to Pro plan for reduced cold starts
- Consider implementing a simple health check endpoint

---

## Part 5: Important Security Considerations

### 1. Environment Variables Security
- ✅ Never commit `.env` files to GitHub
- ✅ Rotate secrets regularly (NEXTAUTH_SECRET, database passwords)
- ✅ Use different secrets for development and production

### 2. Database Security
- ✅ Use SSL connections (sslmode=require)
- ✅ Use strong passwords
- ✅ Restrict database access to Vercel's IP ranges if possible
- ✅ Enable database backup and point-in-time recovery

### 3. Authentication Security
- ✅ NEXTAUTH_SECRET must be strong and random
- ✅ Implement rate limiting for login attempts
- ✅ Enable email verification before allowing access
- ✅ Consider adding 2FA in the future

### 4. API Security
- ✅ Validate all user inputs
- ✅ Implement CSRF protection (Next.js handles this)
- ✅ Use proper authorization checks on API routes
- ✅ Add rate limiting to prevent abuse

---

## Part 6: Monitoring and Maintenance

### Analytics and Monitoring

1. **Vercel Analytics (Recommended):**
   - Enable in Vercel Dashboard → Analytics
   - Track page views, performance metrics
   - Free tier available

2. **Error Tracking:**
   - Consider integrating Sentry: https://sentry.io
   - Real-time error tracking and alerting

3. **Uptime Monitoring:**
   - Use UptimeRobot: https://uptimerobot.com (free)
   - Get alerts if site goes down

### Regular Maintenance Tasks

**Weekly:**
- Check Vercel logs for errors
- Monitor database usage
- Review security alerts

**Monthly:**
- Update dependencies: `npm update`
- Review and rotate access tokens if needed
- Check database backup integrity

**Quarterly:**
- Audit security practices
- Review and optimize database queries
- Update Next.js and major dependencies

---

## Part 7: Helpful Vercel Commands

```bash
# Install Vercel CLI
npm install -g vercel

# Login to Vercel
vercel login

# Link local project to Vercel
vercel link

# Pull environment variables
vercel env pull

# Deploy to production
vercel --prod

# Deploy to preview
vercel

# View logs in real-time
vercel logs

# List all deployments
vercel list

# Remove a deployment
vercel remove [deployment-url]
```

---

## Part 8: Quick Reference - Environment Variables Checklist

Copy this checklist when setting up environment variables in Vercel:

### Required Variables
- [ ] `DATABASE_URL` - PostgreSQL connection string
- [ ] `DIRECT_URL` - PostgreSQL direct connection (for migrations)
- [ ] `NEXTAUTH_URL` - Full URL of your application
- [ ] `NEXTAUTH_SECRET` - Random secret key (generate with `openssl rand -base64 32`)

### Email Configuration (Required for auth)
- [ ] `EMAIL_SERVER_HOST` - SMTP host
- [ ] `EMAIL_SERVER_PORT` - SMTP port (usually 587)
- [ ] `EMAIL_SERVER_USER` - SMTP username
- [ ] `EMAIL_SERVER_PASSWORD` - SMTP password or app password
- [ ] `EMAIL_FROM` - From email address

### Application Settings
- [ ] `NODE_ENV` - Set to "production"
- [ ] `NEXT_PUBLIC_APP_URL` - Public-facing URL

---

## Part 9: Success Criteria

Your deployment is successful when:

✅ **Code is on GitHub:**
- Repository is accessible at https://github.com/Stefanbotes/InnerPersona
- All necessary files are pushed (excluding .env and ignored files)

✅ **Vercel Deployment Works:**
- Build completes without errors
- Application loads at your Vercel URL
- No 500 errors in production

✅ **Database is Connected:**
- Prisma migrations are applied
- User registration works
- Data persists correctly

✅ **Authentication Works:**
- Users can register
- Verification emails are sent and received
- Users can log in successfully

✅ **Questionnaire Functions:**
- Questions load properly
- Responses are saved
- Results are calculated and displayed

---

## Part 10: Next Steps After Deployment

1. **Test thoroughly:**
   - Register a new account
   - Complete the entire questionnaire
   - Verify results are accurate

2. **Share with beta testers:**
   - Get feedback on UX/UI
   - Identify any bugs in production environment

3. **Set up monitoring:**
   - Enable Vercel Analytics
   - Set up error tracking (Sentry)
   - Configure uptime monitoring

4. **Plan for scaling:**
   - Monitor database usage
   - Consider upgrading Vercel plan if needed
   - Optimize performance based on real user data

5. **Documentation:**
   - Create user guide
   - Document admin procedures
   - Maintain changelog

---

## Support Resources

- **Vercel Documentation:** https://vercel.com/docs
- **Next.js Documentation:** https://nextjs.org/docs
- **Prisma Documentation:** https://www.prisma.io/docs
- **NextAuth.js Documentation:** https://next-auth.js.org
- **Vercel Support:** https://vercel.com/support
- **Vercel Community:** https://github.com/vercel/vercel/discussions

---

## Notes

- This guide was created on October 21, 2025
- The application is configured to run on port 3000 (required for DeepAgent preview)
- The GitHub repository has a comprehensive .gitignore file
- Current git status: Repository initialized with 5 commits
- Latest commit: "Prepare NTAQV2 app for Vercel deployment"

---

**Need help?** If you encounter any issues not covered in this guide, check:
1. Vercel deployment logs
2. Browser console for client-side errors
3. Vercel function logs for API errors
4. Database logs (if accessible)

Good luck with your deployment! 🚀
