# Gmail SMTP Setup Guide for Vercel

## 📧 What is This Guide For?

This guide will help you set up email functionality for your NTAQV2 app on Vercel using Gmail. The app needs to send emails for:
- **Email verification** when new users register (24-hour expiration)
- **Password reset** when users forget their password (15-minute expiration)
- **Password change confirmation** for security

**Important:** You'll use Gmail's SMTP service to send these emails. This is a standard, secure way to send emails from web applications.

---

## 📋 What You'll Need

Before you start, make sure you have:
- ✅ A Gmail account (the one you want to send emails from)
- ✅ Access to your Vercel project dashboard
- ✅ Your app already deployed on Vercel

**Time Required:** About 10-15 minutes

---

## 🔑 Required Environment Variables

Your app needs these 5 environment variables to send emails:

| Variable Name | Description | Example |
|---------------|-------------|---------|
| `SMTP_HOST` | Gmail's SMTP server address | `smtp.gmail.com` |
| `SMTP_PORT` | Gmail's SMTP port number | `587` |
| `SMTP_USER` | Your full Gmail address | `yourname@gmail.com` |
| `SMTP_PASS` | Gmail App Password (NOT your regular password) | `abcd efgh ijkl mnop` |
| `EMAIL_FROM` | The "from" address shown in emails | `yourname@gmail.com` |

**⚠️ Critical:** You MUST use a Gmail **App Password**, not your regular Gmail password. Regular passwords won't work and are less secure.

---

## 📝 Step-by-Step Setup Instructions

### Step 1: Create a Gmail App Password

A Gmail App Password is a special 16-character password that lets applications like your app send emails through your Gmail account securely.

#### 1.1 Enable 2-Step Verification (Required)

Before you can create an App Password, you need to enable 2-Step Verification on your Gmail account.

1. Go to your Google Account: https://myaccount.google.com/
2. Click on **"Security"** in the left sidebar
3. Under "Signing in to Google", find **"2-Step Verification"**
4. If it says "Off", click on it and follow the setup wizard
5. Choose your preferred verification method (phone text, authenticator app, etc.)
6. Complete the setup

**Screenshot Reference:** You should see "2-Step Verification: On" in the Security section.

#### 1.2 Generate the App Password

1. After enabling 2-Step Verification, go back to: https://myaccount.google.com/security
2. Scroll down to **"2-Step Verification"** section
3. At the bottom, click on **"App passwords"**
   - If you don't see this option, make sure 2-Step Verification is enabled
4. You may be asked to sign in again for security
5. Under "Select app", choose **"Mail"**
6. Under "Select device", choose **"Other (Custom name)"**
7. Type a name like: `NTAQV2 Vercel App`
8. Click **"Generate"**

**Important:** You'll see a 16-character password displayed in a yellow box, like: `abcd efgh ijkl mnop`

⚠️ **Copy this password immediately and save it somewhere safe!** You won't be able to see it again. If you lose it, you'll need to generate a new one.

---

### Step 2: Add Environment Variables to Vercel

Now you'll add the email settings to your Vercel project so the app can send emails.

#### 2.1 Access Your Vercel Project Settings

1. Go to https://vercel.com/ and sign in
2. Click on your **NTAQV2** project from your dashboard
3. Click on the **"Settings"** tab at the top
4. In the left sidebar, click on **"Environment Variables"**

#### 2.2 Add Each Environment Variable

You'll add 5 environment variables. For each one:

**Variable 1: SMTP_HOST**
1. In the "Key" field, type: `SMTP_HOST`
2. In the "Value" field, type: `smtp.gmail.com`
3. Under "Environment", make sure all three are checked:
   - ✅ Production
   - ✅ Preview
   - ✅ Development
4. Click **"Save"**

**Variable 2: SMTP_PORT**
1. Click **"Add Another"** or start a new variable
2. Key: `SMTP_PORT`
3. Value: `587`
4. Check all three environments: Production, Preview, Development
5. Click **"Save"**

**Variable 3: SMTP_USER**
1. Click **"Add Another"**
2. Key: `SMTP_USER`
3. Value: Your full Gmail address (e.g., `yourname@gmail.com`)
4. Check all three environments
5. Click **"Save"**

**Variable 4: SMTP_PASS**
1. Click **"Add Another"**
2. Key: `SMTP_PASS`
3. Value: The 16-character App Password you generated (e.g., `abcd efgh ijkl mnop`)
   - ⚠️ **Important:** Paste the App Password exactly as shown (with or without spaces, both work)
   - This is NOT your regular Gmail password
4. Check all three environments
5. Click **"Save"**

**Variable 5: EMAIL_FROM**
1. Click **"Add Another"**
2. Key: `EMAIL_FROM`
3. Value: Your full Gmail address (e.g., `yourname@gmail.com`)
   - This is the email address users will see as the sender
4. Check all three environments
5. Click **"Save"**

#### 2.3 Verify All Variables Are Added

After adding all 5 variables, you should see:
- `SMTP_HOST` = `smtp.gmail.com`
- `SMTP_PORT` = `587`
- `SMTP_USER` = `yourname@gmail.com`
- `SMTP_PASS` = `abcd efgh ijkl mnop` (your app password)
- `EMAIL_FROM` = `yourname@gmail.com`

All should show **"Production, Preview, Development"** in the Environment column.

---

### Step 3: Redeploy Your App

After adding environment variables, you need to redeploy your app for the changes to take effect.

#### Option A: Automatic Redeploy (Recommended)

1. Go to your Vercel project dashboard
2. Click on the **"Deployments"** tab
3. Find the most recent deployment (at the top)
4. Click the three dots (**⋯**) on the right side
5. Select **"Redeploy"**
6. A popup will appear, click **"Redeploy"** again to confirm
7. Wait 2-3 minutes for the deployment to complete
8. You'll see a green checkmark ✅ when it's done

#### Option B: Git Push (Alternative)

If you're comfortable with Git:
1. Make any small change to your code (even adding a comment)
2. Commit and push to your GitHub repository
3. Vercel will automatically redeploy

---

## ✅ Testing Your Email Setup

After redeploying, test that emails are working correctly.

### Test 1: New User Registration

1. Go to your live Vercel app URL (e.g., `https://ntaqv2.vercel.app`)
2. Click **"Sign Up"** or **"Create Account"**
3. Fill in the registration form with a test email address
4. Click **"Register"** or **"Sign Up"**
5. You should see a message: *"Registration successful! Please check your email to verify your account."*
6. **Check the email inbox** you used for registration
7. You should receive an email from your Gmail address with the subject: **"Verify Your Email - Inner Personas Assessment"**
8. Click the **"Verify Email Address"** button in the email
9. You should be redirected to the app and see: *"Email verified successfully!"*

### Test 2: Password Reset

1. Go to the login page
2. Click **"Forgot Password?"**
3. Enter a registered email address
4. Click **"Send Reset Link"**
5. Check the email inbox
6. You should receive an email with subject: **"Password Reset - Inner Personas Assessment"**
7. Click the **"Reset Password"** button
8. Enter a new password and confirm
9. You should be able to log in with the new password

### What to Expect

**✅ Successful Email:**
- Email arrives within 1-2 minutes
- Has proper formatting with colors and buttons
- Links work correctly and redirect to your app
- Email comes from the Gmail address you configured

**❌ If Email Doesn't Arrive:**
- Check your spam/junk folder
- Wait 5 minutes (sometimes there's a delay)
- Make sure all environment variables are correct in Vercel
- See the Troubleshooting section below

---

## 🔧 Troubleshooting Common Issues

### Issue 1: Email Not Received

**Possible Causes:**
- ❌ Wrong App Password (using regular Gmail password instead)
- ❌ App Password not copied correctly (extra spaces or missing characters)
- ❌ Environment variables not saved in Vercel
- ❌ App not redeployed after adding variables
- ❌ Email in spam/junk folder

**Solutions:**
1. Double-check the `SMTP_PASS` value in Vercel matches your App Password exactly
2. Make sure you didn't use your regular Gmail password
3. Verify all 5 environment variables are present in Vercel Settings → Environment Variables
4. Redeploy the app from Vercel dashboard
5. Check spam/junk folder in your email
6. Try with a different email address to see if it's an email provider issue

### Issue 2: "Invalid Credentials" Error

**Cause:** Using your regular Gmail password instead of an App Password, or App Password is incorrect.

**Solution:**
1. Go back to Google Account → Security → App Passwords
2. Delete the old App Password
3. Generate a new App Password
4. Update the `SMTP_PASS` environment variable in Vercel with the new password
5. Redeploy the app

### Issue 3: 2-Step Verification Can't Be Enabled

**Cause:** Some Google Workspace (business) accounts have restrictions.

**Solutions:**
1. Check with your Google Workspace administrator
2. Use a personal Gmail account instead (recommended for testing)
3. Consider using a different email service (requires code changes)

### Issue 4: "App Passwords" Option Not Visible

**Possible Causes:**
- 2-Step Verification is not enabled
- You're using a Google Workspace account with restrictions
- Your browser cached an old page

**Solutions:**
1. Make sure 2-Step Verification is enabled (see Step 1.1)
2. Try in an incognito/private browser window
3. Clear browser cache and try again
4. Use a personal Gmail account if on a restricted Workspace account

### Issue 5: Emails Go to Spam

**Cause:** Emails from new domains/apps often get marked as spam initially.

**Solutions:**
1. Mark the email as "Not Spam" in your email client
2. Add the sending email address to your contacts
3. For production, consider setting up SPF and DKIM records (advanced)
4. Gmail accounts sending to other Gmail accounts usually have fewer spam issues

### Issue 6: Vercel Deployment Fails After Adding Variables

**Cause:** This is unlikely, but could be an unrelated issue.

**Solution:**
1. Check the deployment logs in Vercel (click on the failed deployment)
2. Look for any error messages
3. The email environment variables themselves won't cause deployment failures
4. If issues persist, try redeploying the previous working version

---

## 🔒 Security Best Practices

### Do's ✅
- ✅ Always use App Passwords, never your regular Gmail password
- ✅ Generate a unique App Password for each application
- ✅ Keep your App Password secret (treat it like a password)
- ✅ Enable 2-Step Verification on your Gmail account
- ✅ Regularly review and delete unused App Passwords
- ✅ Use a dedicated Gmail account for sending app emails (optional but recommended)

### Don'ts ❌
- ❌ Never share your App Password with anyone
- ❌ Never commit App Passwords to Git repositories
- ❌ Never use your regular Gmail password in app code
- ❌ Never disable 2-Step Verification after creating App Passwords
- ❌ Don't reuse App Passwords across multiple applications

---

## 🎯 Quick Reference: Environment Variables

Copy these values to Vercel (replace with your actual values):

```
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=yourname@gmail.com
SMTP_PASS=abcd efgh ijkl mnop
EMAIL_FROM=yourname@gmail.com
```

**Remember:** Replace:
- `yourname@gmail.com` with your actual Gmail address
- `abcd efgh ijkl mnop` with your actual App Password

---

## 📞 Need More Help?

### Useful Links
- **Google App Passwords:** https://myaccount.google.com/apppasswords
- **Enable 2-Step Verification:** https://myaccount.google.com/security
- **Vercel Documentation:** https://vercel.com/docs/environment-variables
- **Gmail SMTP Settings:** https://support.google.com/a/answer/176600

### Still Having Issues?

If you've followed all the steps and emails still aren't working:

1. **Check Vercel Logs:**
   - Go to Vercel dashboard → Your project → Deployments
   - Click on the latest deployment
   - Click "Functions" tab to see runtime logs
   - Look for any email-related errors

2. **Test Locally First:**
   - Add the same environment variables to your local `.env` file
   - Run the app locally: `npm run dev`
   - Try the email functionality locally
   - Check the terminal for error messages

3. **Verify Gmail Settings:**
   - Make sure your Gmail account is active
   - Try sending a regular email from Gmail to verify account works
   - Check if there are any security alerts in your Google Account

---

## ✨ Success Checklist

Before considering the setup complete, verify:

- [ ] 2-Step Verification is enabled on your Gmail account
- [ ] App Password has been generated and saved
- [ ] All 5 environment variables are added in Vercel
- [ ] All environment variables are set for Production, Preview, and Development
- [ ] App has been redeployed after adding variables
- [ ] Deployment completed successfully (green checkmark in Vercel)
- [ ] Registration verification email is received and works
- [ ] Password reset email is received and works
- [ ] Emails have proper formatting and branding
- [ ] Links in emails work correctly

If all items are checked ✅, your Gmail SMTP setup is complete!

---

## 📚 Additional Notes

### Email Rate Limits

Gmail has sending limits for standard accounts:
- **Free Gmail:** Up to 500 emails per day
- **Google Workspace:** Up to 2,000 emails per day

For the NTAQV2 app, this should be more than sufficient. Each user registration generates 1 email, password resets generate 1-2 emails.

### Email Templates

The app sends beautifully formatted HTML emails with:
- Professional design with your app branding
- Clear call-to-action buttons
- Mobile-responsive layout
- Plain text fallback for email clients that don't support HTML

You can see the email templates in the code at: `/lib/email-service.ts`

### Development Mode

The app has a built-in development mode for emails:
- Set `EMAIL_DEBUG=true` in your local `.env` file
- Emails will be logged to the console instead of sent
- Useful for testing without sending real emails

**Don't enable this on Vercel** - only use it locally during development.

---

## 🎉 Congratulations!

You've successfully set up Gmail SMTP for your NTAQV2 app on Vercel! Users can now:
- Receive email verification when they register
- Reset their passwords via email
- Get confirmation when they change their password

Your app is now fully functional with email capabilities! 🚀

---

*Last Updated: October 23, 2025*  
*Guide Version: 1.0*
