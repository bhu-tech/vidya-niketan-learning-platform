# 📋 Environment Setup Checklist

## Step 1: Review Current .env
**Location:** `backend/.env`

Current values:
```
PORT=5000
MONGODB_URI=mongodb://localhost:27017/online-learning
JWT_SECRET=your_jwt_secret_key_here_change_in_production
...
```

---

## Step 2: Update Credentials (Follow this order)

### ☑️ 2.1 MongoDB URI
- **Status:** ✅ Already set to local
- **Change if:** Using MongoDB Atlas instead
- **How:** Copy connection string from Atlas and replace entire value
- **Example:** `mongodb+srv://user:pass@cluster.mongodb.net/online-learning`

### ☑️ 2.2 JWT_SECRET
- **Status:** ⚠️ Placeholder - Should be changed
- **How:** Run in terminal:
  ```bash
  node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
  ```
- **Then:** Replace `your_jwt_secret_key_here_change_in_production` with the output

### ☑️ 2.3 Google OAuth (Optional for now)
- **Status:** ⚠️ Placeholder
- **Get from:** https://console.cloud.google.com/
- **Fields to update:**
  - GOOGLE_CLIENT_ID
  - GOOGLE_CLIENT_SECRET
- **Skip for now?** Yes ✓ (Login still works with email/password)

### ☑️ 2.4 Zoom API (Optional for now)
- **Status:** ⚠️ Placeholder
- **Get from:** https://marketplace.zoom.us/
- **Fields to update:**
  - ZOOM_CLIENT_ID
  - ZOOM_CLIENT_SECRET
  - ZOOM_ACCOUNT_ID
- **Skip for now?** Yes ✓ (Classes work without Zoom)

### ☑️ 2.5 SMTP (Optional for now)
- **Status:** ⚠️ Placeholder
- **Get from:** https://sendgrid.com/ or Gmail
- **Fields to update:**
  - SMTP_HOST
  - SMTP_USER
  - SMTP_PASS
  - SMTP_FROM
- **Skip for now?** Yes ✓ (But approval notifications won't send email)

### ☑️ 2.6 Frontend URL
- **Status:** ✅ Already set correctly
- **Current:** `FRONTEND_URL=http://localhost:3000`
- **Change if:** Different dev port
- **Keep as is?** Yes ✓

---

## Step 3: Essential Changes (Do These)

### Must Do:
```bash
# Generate secure JWT_SECRET
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"

# Copy output and replace this line in backend/.env:
JWT_SECRET=<PASTE_OUTPUT_HERE>
```

### Can Do Later:
- [ ] Google OAuth setup
- [ ] Zoom API setup
- [ ] SendGrid/Gmail setup
- [ ] MongoDB Atlas setup (if not using local)

---

## Step 4: Verify .env is Valid

Run this in terminal to check:
```bash
cd backend
echo.
echo Checking .env file...
type .env
```

You should see all variables with values (not empty).

---

## Step 5: Save and Test

1. Save the `.env` file
2. Run: `cd backend && npm run dev`
3. Check terminal output:
   ```
   Server running on port 5000
   MongoDB connected
   ```

✅ = Ready to go!
❌ = Fix the error shown

---

## 🎯 Minimum Viable Setup

**To get started RIGHT NOW:**
1. Generate JWT_SECRET (see Step 3)
2. Replace in .env
3. Keep everything else as placeholders
4. Start servers

**What will work:**
- ✅ Email/password signup & login
- ✅ Admin approval
- ✅ Class creation
- ✅ PDF upload
- ✅ In-app notifications

**What won't work yet (optional):**
- ❌ Google login (will show error, but email login works)
- ❌ Zoom meetings (will show error, but class creation works)
- ❌ Email notifications (approvals work in-app instead)

---

## 📝 Your Current .env

```dotenv
PORT=5000
MONGODB_URI=mongodb://localhost:27017/online-learning
JWT_SECRET=your_jwt_secret_key_here_change_in_production
GOOGLE_CLIENT_ID=your_google_client_id_here
GOOGLE_CLIENT_SECRET=your_google_client_secret_here
GOOGLE_CALLBACK_URL=http://localhost:5000/api/auth/google/callback
ZOOM_CLIENT_ID=your_zoom_client_id_here
ZOOM_CLIENT_SECRET=your_zoom_client_secret_here
ZOOM_ACCOUNT_ID=your_zoom_account_id_here
REACT_APP_API_URL=http://localhost:5000
SMTP_HOST=smtp.sendgrid.net
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=apikey
SMTP_PASS=your_sendgrid_api_key_here
SMTP_FROM=noreply@yourdomain.com
FRONTEND_URL=http://localhost:3000
NODE_ENV=development
```

---

## ✅ Ready? Let's Go!

Once JWT_SECRET is updated:

**Terminal 1:**
```bash
cd backend
npm install
npm run dev
```

**Terminal 2:**
```bash
cd frontend
npm install
npm start
```

**Browser:**
Open `http://localhost:3000` and start testing! 🎉

---

**Questions?** Check `ENV_SETUP_GUIDE.md` for detailed credential guides.
