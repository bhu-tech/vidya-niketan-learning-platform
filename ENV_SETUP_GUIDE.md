# 🔧 Environment Setup Guide

Your `.env` file is ready at `backend/.env`. Follow these steps to get actual credentials:

---

## 1️⃣ **MongoDB URI** (Database)

### Option A: Local MongoDB (Easiest for Development)
- Install MongoDB: https://www.mongodb.com/try/download/community
- Start MongoDB service (Windows: `mongod` in PowerShell)
- Use: `MONGODB_URI=mongodb://localhost:27017/online-learning` ✅ (Already set)

### Option B: MongoDB Atlas (Cloud - Recommended)
1. Go to https://www.mongodb.com/cloud/atlas
2. Sign up (free tier available)
3. Create a cluster
4. Click "Connect" → "Drivers" → Copy connection string
5. Replace `<username>`, `<password>`, `<dbname>` with your values
6. Example: `mongodb+srv://admin:password123@cluster0.abcd.mongodb.net/online-learning`

---

## 2️⃣ **JWT_SECRET** (Authentication Key)

Run this in your terminal to generate a secure secret:
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```
Copy the output and replace `your_jwt_secret_key_here_change_in_production` in `.env`

---

## 3️⃣ **Google OAuth** (Login with Google)

1. Go to: https://console.cloud.google.com/
2. Create a new project (top left dropdown)
3. Search for "Google+ API" and enable it
4. Go to "Credentials" → Create OAuth 2.0 credentials (Web Application)
5. Add authorized redirect URI: `http://localhost:5000/api/auth/google/callback`
6. Copy:
   - **Client ID** → `GOOGLE_CLIENT_ID`
   - **Client Secret** → `GOOGLE_CLIENT_SECRET`

---

## 4️⃣ **Zoom API** (Video Meetings)

1. Go to: https://marketplace.zoom.us/
2. Sign in with Zoom account (create if needed)
3. Go to "Develop" → "Build App"
4. Choose "Server-to-Server OAuth"
5. Fill form and create
6. Copy and save:
   - **Account ID** → `ZOOM_ACCOUNT_ID`
   - **Client ID** → `ZOOM_CLIENT_ID`
   - **Client Secret** → `ZOOM_CLIENT_SECRET`

---

## 5️⃣ **SMTP** (Email Notifications)

### Option A: SendGrid (Recommended - Free tier)
1. Go to: https://sendgrid.com/
2. Sign up (free)
3. Go to Settings → API Keys
4. Create new API key (full access)
5. Copy the key
6. Update `.env`:
   ```
   SMTP_HOST=smtp.sendgrid.net
   SMTP_PORT=587
   SMTP_USER=apikey
   SMTP_PASS=SG.xxxxxxxxxxxxx (your API key)
   SMTP_FROM=noreply@yourdomain.com
   ```

### Option B: Gmail App Password (Simple)
1. Enable 2-Factor Authentication on Gmail
2. Go to: https://myaccount.google.com/apppasswords
3. Select "Mail" and "Windows Computer"
4. Generate password
5. Update `.env`:
   ```
   SMTP_HOST=smtp.gmail.com
   SMTP_PORT=587
   SMTP_USER=your_email@gmail.com
   SMTP_PASS=your_app_password (16 chars, no spaces)
   SMTP_FROM=your_email@gmail.com
   ```

---

## 📝 Minimal Setup for Quick Testing

If you just want to test **without** external services:

```env
# Required
MONGODB_URI=mongodb://localhost:27017/online-learning
JWT_SECRET=test_secret_key_123456789_make_it_longer
PORT=5000
NODE_ENV=development

# Optional (leave as placeholders for now)
GOOGLE_CLIENT_ID=test_google_id
GOOGLE_CLIENT_SECRET=test_google_secret
ZOOM_CLIENT_ID=test_zoom_id
ZOOM_CLIENT_SECRET=test_zoom_secret
ZOOM_ACCOUNT_ID=test_zoom_account
SMTP_HOST=smtp.sendgrid.net
SMTP_PORT=587
SMTP_USER=apikey
SMTP_PASS=test_key
SMTP_FROM=test@example.com

# URLs
FRONTEND_URL=http://localhost:3000
REACT_APP_API_URL=http://localhost:5000/api
GOOGLE_CALLBACK_URL=http://localhost:5000/api/auth/google/callback
```

---

## ✅ Verification Checklist

After updating `.env`, verify all fields are set:
```bash
cd backend
cat .env
```

Should show all variables with values (not placeholders).

---

## 🚀 Next Steps

1. Update `.env` with your credentials
2. Run `npm install` in backend folder
3. Run `npm run dev` to start backend
4. Run `npm install && npm start` in frontend folder
5. Test the app at `http://localhost:3000`

---

## 🆘 Troubleshooting

| Error | Solution |
|-------|----------|
| MongoDB connection error | Ensure MongoDB is running locally or Atlas URI is correct |
| "Cannot find module" | Run `npm install` in backend folder |
| Port 5000 already in use | Change `PORT=5000` to `PORT=5001` in `.env` |
| Google/Zoom login fails | Check credentials are correct and redirect URIs match |
| Emails not sending | Verify SMTP credentials and sender email is allowed |

---

Done! Your `.env` file is ready. Update it with actual credentials and you're good to go! 🎉
