# 🚀 Quick Start - Running the Application

## Prerequisites
- Node.js installed (v14+)
- MongoDB running (local or Atlas)
- `.env` file configured in `backend/` folder

---

## Step 1: Start Backend Server

### Windows (PowerShell or CMD):
```bash
cd backend
npm run dev
```

You should see:
```
Server running on port 5000
MongoDB connected
```

### Mac/Linux:
```bash
cd backend
npm run dev
```

---

## Step 2: Start Frontend (New Terminal)

### Windows:
```bash
cd frontend
npm start
```

Browser will auto-open at `http://localhost:3000`

### Mac/Linux:
```bash
cd frontend
npm start
```

---

## ✅ What to Verify

### Backend Running ✓
- Terminal shows: `Server running on port 5000`
- Terminal shows: `MongoDB connected`
- Try: `http://localhost:5000/api/auth/login` (will show 405 but API is working)

### Frontend Running ✓
- Browser opens to `http://localhost:3000`
- Landing page loads
- Navbar shows "Login" and "Sign Up" buttons

---

## 🧪 Quick Test

### 1. Signup Test
```
1. Go to http://localhost:3000/signup
2. Fill form:
   - Name: Test User
   - Email: test@example.com
   - Password: Test@123
   - Role: Student
3. Click "Sign Up"
Expected: See message about awaiting admin approval (or redirect if auto-approved)
```

### 2. Admin Test
```
1. Go to http://localhost:3000/signup
2. Fill form with:
   - Role: Admin
3. After signup, go to http://localhost:3000/login
4. Login with admin credentials
5. Should see Admin Dashboard (no approval needed for admin)
```

### 3. Class Test
```
1. Login as teacher
2. Click "Classes" in navbar
3. Click "+ Create Class"
4. Fill form and create
5. Should appear in class list
```

---

## 🔍 Debugging

### MongoDB Connection Error
```
Check:
1. MONGODB_URI in .env is correct
2. If local: Run `mongod` in separate terminal
3. If Atlas: Check username/password and IP whitelist
```

### Port Already in Use
```
# Find process using port 5000
netstat -ano | findstr :5000

# Kill it (replace PID with number)
taskkill /PID <PID> /F

# Or change PORT in .env to 5001
```

### npm modules not found
```
cd backend
npm install
npm install nodemailer  # if missing

cd ../frontend
npm install
```

### Google/Zoom/SMTP Errors
```
These are optional for initial testing
Leave as placeholder values in .env for now
They'll show errors only when you try to use them
```

---

## 📊 Expected Features Working Now

✅ User Signup (email/password)
✅ User Login
✅ Email/Password Auth
✅ Role Selection
✅ Admin Approval Flow
✅ Admin Dashboard
✅ User Management
✅ Disable/Enable Users
✅ In-app Notifications
✅ Class Creation (Teachers)
✅ Class List & Browse
✅ PDF Upload (Materials)
✅ Landing Page

⏳ Not Yet Tested:
- Google OAuth (needs credentials)
- Zoom Meetings (needs API setup)
- Email Notifications (needs SMTP)

---

## 🎯 Common Issues & Fixes

| Issue | Fix |
|-------|-----|
| Blank page | Check browser console (F12), check terminal for errors |
| Cannot POST /api/auth/signup | Backend not running, or wrong API URL |
| "Cannot find module" | Run `npm install` in the folder |
| EADDRINUSE | Port in use, change PORT in .env |
| CORS error | Check FRONTEND_URL and REACT_APP_API_URL in .env |

---

## 📞 Getting Help

Check these files for more info:
- `README.md` - Overview
- `ENV_SETUP_GUIDE.md` - Credential setup
- `DEPLOYMENT.md` - Production deployment
- `FEATURE_CHECKLIST.md` - All features list

---

🎉 **You're ready to go!** Start both servers and test the app.
