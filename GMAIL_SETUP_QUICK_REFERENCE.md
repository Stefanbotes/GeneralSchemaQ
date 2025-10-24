# Gmail Setup - Quick Reference

**⚡ Fast setup guide for NTAQV2 email configuration**

---

## 🎯 What You Need

4 environment variables in Vercel:

```env
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-16-char-app-password
```

Optional:
```env
EMAIL_FROM=your-email@gmail.com
```

---

## 🔑 Get Gmail App Password (2 minutes)

1. **Enable 2FA:** https://myaccount.google.com/security
2. **Create App Password:** https://myaccount.google.com/apppasswords
3. **Copy the 16-character password**

---

## ⚙️ Add to Vercel (3 minutes)

1. Open your Vercel project
2. Go to: **Settings** → **Environment Variables**
3. Add each variable (click all 3 environments)
4. Click **Save** for each

---

## 🚀 Redeploy (2 minutes)

1. Go to **Deployments** tab
2. Click **•••** on latest deployment
3. Click **Redeploy**
4. Wait for "✓ Ready"

---

## ✅ Test

1. **Register a new account** → Check email inbox
2. **Request password reset** → Check email inbox

---

## 🚨 Troubleshooting

- **No emails?** → Check spam folder, verify variables in Vercel
- **Auth failed?** → Must use App Password (not regular Gmail password)
- **Still broken?** → Check Runtime Logs in Vercel

---

## 📖 Full Guide

See `GMAIL_SETUP_GUIDE.md` for detailed instructions, screenshots, and troubleshooting.

---

**Total Setup Time:** ~7 minutes ⏱️
