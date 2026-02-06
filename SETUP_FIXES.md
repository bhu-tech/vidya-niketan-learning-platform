# 🔧 Setup Fixes Applied

## ✅ Issues Fixed

### 1. ✅ Nodemailer Package Fixed
- **Changed**: Moved `nodemailer` from `optionalDependencies` to `dependencies` in `backend/package.json`
- **Action Required**: Run `npm install` in the backend folder to ensure it's properly installed

### 2. ✅ SMTP Configuration Updated
- **Changed**: Updated `backend/.env` with Gmail SMTP configuration template
- **Action Required**: Configure email notifications (choose one option):

#### Option A: Gmail (Recommended for Development)
1. Go to your Google Account: https://myaccount.google.com/
2. Enable 2-Factor Authentication if not already enabled
3. Generate an App Password:
   - Visit: https://myaccount.google.com/apppasswords
   - Select "Mail" and "Other (Custom name)"
   - Name it "Online Learning Platform"
   - Copy the 16-character password
4. Update in `backend/.env`:
   ```env
   SMTP_USER=vidyaniketanfoundation2025@gmail.com
   SMTP_PASS=your_16_character_app_password
   ```

#### Option B: SendGrid (For Production)
1. Sign up at https://sendgrid.com/
2. Create an API Key: https://app.sendgrid.com/settings/api_keys
3. Update in `backend/.env`:
   ```env
   SMTP_HOST=smtp.sendgrid.net
   SMTP_PORT=587
   SMTP_SECURE=false
   SMTP_USER=apikey
   SMTP_PASS=your_sendgrid_api_key
   SMTP_FROM=noreply@yourdomain.com
   ```

### 3. ✅ Google OAuth Instructions Added
- **Changed**: Added detailed instructions in `backend/.env`
- **Action Required**: Set up Google OAuth credentials:

1. Go to: https://console.cloud.google.com/
2. Create a new project or select existing one
3. Enable Google+ API (or Google Identity Services)
4. Go to "Credentials" → "Create Credentials" → "OAuth 2.0 Client ID"
5. Configure OAuth consent screen if prompted
6. For Application type, select "Web application"
7. Add authorized redirect URIs:
   - Development: `http://localhost:5000/api/auth/google/callback`
   - Production: `https://your-domain.com/api/auth/google/callback`
8. Add authorized JavaScript origins:
   - Development: `http://localhost:3000`
   - Production: `https://your-domain.com`
9. Copy the Client ID and Client Secret
10. Update in `backend/.env`:
    ```env
    GOOGLE_CLIENT_ID=your_actual_client_id
    GOOGLE_CLIENT_SECRET=your_actual_client_secret
    ```

### 4. ✅ API URL Consistency Fixed
- **Changed**: Updated `REACT_APP_API_URL` in `backend/.env` from `http://localhost:5000` to `http://localhost:5000/api`
- **Result**: Now consistent with frontend configuration

## 📋 Quick Start After Fixes

### Backend Setup
```bash
cd backend
npm install
npm run dev
```

### Frontend Setup
```bash
cd frontend
npm install
npm start
```

## 🎯 What Will Work Now

### Without Google OAuth & Email (Basic Testing)
✅ Manual signup/login with email and password  
✅ All dashboard features  
✅ Class management  
✅ File uploads  
✅ Attendance tracking  
❌ Google Sign-In  
❌ Email notifications  

### With Google OAuth Configured
✅ Everything above +  
✅ Google Sign-In/Sign-Up  

### With Email Configured
✅ Everything above +  
✅ Admin notifications for new signups  
✅ Class reminder emails  
✅ Scheduled notifications  

## 🔍 Testing the Application

1. **Start MongoDB** (if using local):
   ```bash
   mongod
   ```

2. **Start Backend**:
   ```bash
   cd backend
   npm run dev
   ```
   You should see:
   - `MongoDB connected`
   - `Server running on port 5000`

3. **Start Frontend**:
   ```bash
   cd frontend
   npm start
   ```
   Opens at: http://localhost:3000

4. **Create Admin Account**:
   ```bash
   cd backend
   node seed-admin.js
   ```
   This creates an admin account with email: `vidyaniketanfoundation2025@gmail.com`

## 🐛 Troubleshooting

### If email notifications fail:
- Check that `SMTP_USER` and `SMTP_PASS` are correctly set
- If using Gmail, ensure you created an App Password (not your regular password)
- Check backend console for error messages

### If Google Sign-In fails:
- Verify `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET` are correct
- Ensure redirect URI matches exactly (including http/https)
- Check that the OAuth consent screen is configured

### If API calls fail:
- Verify backend is running on port 5000
- Check that `REACT_APP_API_URL=http://localhost:5000/api` in frontend/.env
- Clear browser cache and localStorage

## 📝 Next Steps

1. ✅ Run `npm install` in backend folder
2. ⚠️ Configure Gmail App Password for email notifications
3. ⚠️ Set up Google OAuth credentials for Google Sign-In
4. ✅ Test the application with manual signup/login
5. 🎯 Deploy when ready
