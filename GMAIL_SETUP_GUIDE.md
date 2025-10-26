# Gmail SMTP Setup Guide for Vercel

**Last Updated:** October 22, 2025  
**App:** NTAQV2 - Inner Personas Assessment  
**Purpose:** Configure Gmail to send verification and password reset emails on Vercel

---

## 📋 What You Need

Your NTAQV2 app needs to send emails for:
- ✉️ **Email verification** when users register
- 🔑 **Password reset** when users forget their password
- ✅ **Password change confirmation** for security

This guide will help you set up Gmail to send these emails from your Vercel deployment.

---

## 🔐 Required Environment Variables

Your app needs these 4 environment variables to send emails:

| Variable | Description | Example Value |
|----------|-------------|---------------|
| `SMTP_HOST` | Gmail's SMTP server | `smtp.gmail.com` |
| `SMTP_PORT` | Gmail's SMTP port | `587` |
| `SMTP_USER` | Your Gmail address | `yourname@gmail.com` |
| `SMTP_PASS` | Gmail App Password (NOT your regular Gmail password) | `abcd efgh ijkl mnop` |
| `EMAIL_FROM` | Optional - Email address shown in "From" field | `noreply@yourdomain.com` |

> **Important:** The app uses `SMTP_*` variables (not `EMAIL_SERVER_*`). Make sure you use the exact names above!

---

## 📝 Step-by-Step Setup

### Part 1: Create a Gmail App Password

Gmail requires a special "App Password" for apps like yours. You **cannot** use your regular Gmail password.

#### 1.1 Enable 2-Factor Authentication

1. **Go to your Google Account:**
   - Visit: https://myaccount.google.com/
   - Or click your profile picture in Gmail → "Manage your Google Account"

2. **Navigate to Security:**
   - Click "Security" in the left sidebar
   
3. **Enable 2-Step Verification:**
   - Scroll down to "How you sign in to Google"
   - Click "2-Step Verification"
   - Click "Get Started" and follow the instructions
   - You'll need your phone to verify

#### 1.2 Generate App Password

Once 2-Factor Authentication is enabled:

1. **Go to App Passwords page:**
   - Visit: https://myaccount.google.com/apppasswords
   - Or: Google Account → Security → 2-Step Verification → App passwords (at bottom)

2. **Create a new App Password:**
   - **Select app:** Choose "Mail" or "Other (Custom name)"
   - **Type name:** Enter "NTAQV2" or "Leadership App"
   - Click "Generate"

3. **Save the password:**
   - Google will show a 16-character password like: `abcd efgh ijkl mnop`
   - **COPY THIS PASSWORD** - you won't see it again!
   - Save it in a safe place (you'll paste it into Vercel next)

> **Troubleshooting:** Don't see "App passwords"?
> - Make sure 2-Step Verification is fully enabled (not just started)
> - Try signing out and back in to Google
> - Some organizations disable this feature for work/school accounts

---

### Part 2: Add Variables to Vercel

Now we'll add your Gmail information to your Vercel project.

#### 2.1 Log in to Vercel

1. Go to: https://vercel.com/
2. Sign in with your account
3. Find and click on your **NTAQV2** project

#### 2.2 Add Environment Variables

1. **Open Settings:**
   - Click "Settings" tab (top navigation)
   - Click "Environment Variables" in the left sidebar

2. **Add each variable:**

   **Variable 1 - SMTP_HOST:**
   - Name: `SMTP_HOST`
   - Value: `smtp.gmail.com`
   - Click "Production", "Preview", and "Development" checkboxes
   - Click "Save"

   **Variable 2 - SMTP_PORT:**
   - Name: `SMTP_PORT`
   - Value: `587`
   - Check all environments (Production, Preview, Development)
   - Click "Save"

   **Variable 3 - SMTP_USER:**
   - Name: `SMTP_USER`
   - Value: Your Gmail address (e.g., `yourname@gmail.com`)
   - Check all environments
   - Click "Save"

   **Variable 4 - SMTP_PASS:**
   - Name: `SMTP_PASS`
   - Value: The 16-character App Password you copied earlier
     - Paste it exactly as shown by Google (spaces are OK)
     - Example: `abcd efgh ijkl mnop`
   - Check all environments
   - Click "Save"

   **Variable 5 - EMAIL_FROM (Optional but recommended):**
   - Name: `EMAIL_FROM`
   - Value: The "from" address shown to users
     - Use your Gmail: `yourname@gmail.com`
     - Or a custom domain: `noreply@yourdomain.com`
   - Check all environments
   - Click "Save"

3. **Verify all variables are added:**
   - You should see 4-5 variables listed
   - All should be checked for "Production"

#### 2.3 Important Notes

- ✅ **Always check all three environments:** Production, Preview, and Development
- 🔒 **Values are hidden** after saving (this is normal for security)
- ✏️ **To edit:** Click the three dots (•••) next to a variable, then "Edit"
- 🗑️ **To delete:** Click the three dots, then "Delete"

---

### Part 3: Redeploy Your App

After adding environment variables, you **must redeploy** for them to take effect.

#### Option A: Automatic Redeploy (Recommended)

1. **Go to your project's main page** in Vercel
2. **Click the "Deployments" tab**
3. **Find the latest deployment** (at the top)
4. **Click the three dots (•••)** on the right side
5. **Click "Redeploy"**
6. **Select "Use existing Build Cache"** (faster)
7. **Click "Redeploy"**

#### Option B: Git Commit (Alternative)

If you have the code connected to GitHub/GitLab:

1. Make any small change to your code (e.g., add a space to README.md)
2. Commit and push to your repository
3. Vercel will automatically deploy

#### Verify Deployment

1. Wait for deployment to complete (2-5 minutes)
2. Look for "✓ Ready" status
3. Click "Visit" to open your deployed app

---

## 🧪 Test Your Email Setup

After redeploying, test that emails are working:

### Test 1: Registration Email

1. **Go to your deployed app** (e.g., `https://your-app.vercel.app`)
2. **Click "Register" or "Sign Up"**
3. **Fill in the registration form** with a valid email address
4. **Submit the form**
5. **Check your email inbox** (and spam folder!)
6. **You should receive:** "Email Verification" email from your app
7. **Click the verification link** to complete registration

### Test 2: Password Reset Email

1. **Go to the login page**
2. **Click "Forgot Password?"**
3. **Enter your email address**
4. **Check your email**
5. **You should receive:** "Password Reset" email
6. **Click the reset link** to set a new password

---

## 🚨 Troubleshooting

### Problem: "Not receiving verification emails"

**Check these things:**

1. **Check spam/junk folder** - Gmail sometimes flags these emails
2. **Wait a few minutes** - Email delivery can take 1-5 minutes
3. **Verify environment variables in Vercel:**
   - Settings → Environment Variables
   - Make sure all 4 variables are there
   - Make sure "Production" is checked
4. **Check Vercel deployment logs:**
   - Deployments tab → Click latest deployment
   - Click "Logs" or "Runtime Logs"
   - Look for email-related errors
5. **Verify you redeployed** after adding variables

### Problem: "Gmail authentication failed"

**Common causes:**

- ❌ **Using your regular Gmail password** instead of App Password
  - Solution: Generate a new App Password (Part 1) and update `SMTP_PASS`
- ❌ **App Password was copied incorrectly**
  - Solution: Spaces are OK, but make sure no extra characters
- ❌ **2-Factor Authentication not fully enabled**
  - Solution: Complete 2FA setup, wait 10 minutes, try again
- ❌ **Using a work/school Google account** with restrictions
  - Solution: Contact your IT admin or use a personal Gmail

### Problem: "Error: Missing environment variables"

**Fix:**

1. Go to Vercel → Settings → Environment Variables
2. Check that these variables exist:
   - `SMTP_HOST`
   - `SMTP_PORT`
   - `SMTP_USER`
   - `SMTP_PASS`
3. Make sure "Production" is checked for each
4. Redeploy the app (Part 3)

### Problem: "Emails work locally but not on Vercel"

**This means:**

- Your local `.env` file has the variables
- But Vercel doesn't have them yet

**Fix:**

1. Add all variables to Vercel (Part 2)
2. Make sure "Production" environment is selected
3. Redeploy (Part 3)

### Problem: "Daily sending limit exceeded"

Gmail has sending limits:
- **Personal Gmail:** 500 emails per day
- **Google Workspace:** 2000 emails per day

**Solutions:**
- Use a different Gmail account
- Consider using SendGrid or AWS SES for production (see below)
- Spread out email sending

---

## 🔍 How to View Email Logs

To see if emails are being sent:

### In Vercel Runtime Logs:

1. Go to your Vercel project
2. Click "Deployments" tab
3. Click your latest deployment
4. Click "Runtime Logs" or "Functions" tab
5. Look for:
   - `"=== EMAIL DEBUG MODE ==="` - means email variables are missing
   - `"Failed to send email"` - indicates an error
   - No errors = emails are sending successfully

### Enable Debug Mode (Development Only):

If you're testing locally or want to see email content without sending:

1. Add to your `.env` file: `EMAIL_DEBUG=true`
2. Emails will be printed to console instead of sent
3. **Never use this in Production!**

---

## 📊 Environment Variables Summary

Copy-paste this checklist into Vercel:

```
Required Variables (4):
☐ SMTP_HOST = smtp.gmail.com
☐ SMTP_PORT = 587
☐ SMTP_USER = your-email@gmail.com
☐ SMTP_PASS = your-16-character-app-password

Optional Variables (1):
☐ EMAIL_FROM = your-email@gmail.com

Already Configured (should exist):
☐ DATABASE_URL = (your Neon database)
☐ NEXTAUTH_URL = (your Vercel app URL)
☐ NEXTAUTH_SECRET = (your auth secret)
```

---

## 🚀 Alternative: Using SendGrid (For High Volume)

If you expect to send many emails or want better deliverability, consider SendGrid:

### Why SendGrid?
- ✅ Free tier: 100 emails/day forever
- ✅ Better deliverability (less likely to go to spam)
- ✅ Email analytics and tracking
- ✅ No daily limits after upgrading

### Quick Setup:

1. **Sign up:** https://sendgrid.com/
2. **Create an API key:**
   - Settings → API Keys → Create API Key
   - Full Access
   - Copy the key
3. **Update Vercel variables:**
   - `SMTP_HOST` = `smtp.sendgrid.net`
   - `SMTP_PORT` = `587`
   - `SMTP_USER` = `apikey` (exactly this word)
   - `SMTP_PASS` = (your SendGrid API key)
   - `EMAIL_FROM` = (your verified sender email)
4. **Verify your sender email** in SendGrid
5. **Redeploy on Vercel**

---

## ✅ Success Checklist

Before you finish, make sure:

- [ ] 2-Factor Authentication is enabled on Gmail
- [ ] Gmail App Password is created and saved
- [ ] All 4 required variables are added to Vercel
- [ ] "Production" environment is checked for all variables
- [ ] App has been redeployed after adding variables
- [ ] Registration email test passed
- [ ] Password reset email test passed
- [ ] No errors in Vercel runtime logs

---

## 📞 Need Help?

### Common Questions:

**Q: Can I use a different email provider (not Gmail)?**  
A: Yes! Just update the SMTP_HOST, SMTP_PORT, and authentication details for your provider.

**Q: How many emails can I send?**  
A: Gmail allows 500/day for personal accounts, 2000/day for Google Workspace.

**Q: Do I need a custom domain for EMAIL_FROM?**  
A: No, you can use your Gmail address. A custom domain is just more professional.

**Q: Are my Gmail credentials secure on Vercel?**  
A: Yes, Vercel encrypts all environment variables. They're never exposed in your code or to users.

**Q: What if I change my Gmail password?**  
A: App Passwords are independent - changing your Gmail password won't affect them.

---

## 📚 Related Documentation

- **Main Deployment Guide:** `GITHUB_PUSH_AND_VERCEL_DEPLOYMENT_GUIDE.md`
- **Database Setup:** Check your `.env` for `DATABASE_URL`
- **Local Development:** Use `.env.local` for local testing

---

## 🔄 What Happens When Someone Registers?

Understanding the email flow:

1. **User fills registration form** → Submits
2. **App creates user account** → Stores in database (unverified)
3. **App generates verification token** → Secure 24-hour token
4. **App sends email via Gmail** → Using your SMTP credentials
5. **User receives email** → Clicks verification link
6. **App verifies token** → Marks account as verified
7. **User can now log in** → Full access granted

---

**🎉 You're Done!**

Once you've completed all the steps above, your NTAQV2 app will be able to send:
- Registration verification emails
- Password reset emails  
- Password change confirmations

All email templates are professionally designed and mobile-responsive.

---

**Made with ❤️ for NTAQV2**  
*Last Updated: October 22, 2025*
