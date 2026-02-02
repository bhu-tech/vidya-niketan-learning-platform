# Quick Start Guide

## ⚡ 5-Minute Setup

### Prerequisites
- Node.js installed
- MongoDB running
- Google & Zoom OAuth credentials

### Backend Setup (Terminal 1)
```bash
cd backend
npm install
# Edit .env with your credentials
npm run dev
```

### Frontend Setup (Terminal 2)
```bash
cd frontend
npm install
npm start
```

### Access the App
- Frontend: http://localhost:3000
- Backend: http://localhost:5000

## 🔑 Test Credentials

### Admin Account (First Time)
1. Sign up as regular user
2. Login to backend MongoDB
3. Change role to "admin": `db.users.updateOne({email: "your@email.com"}, {$set: {role: "admin"}})`

### Test Flow
1. **Sign Up** → Student role
2. **Login** → Student Dashboard
3. **Admin Changes Role** → Teacher role
4. **Login** → Teacher Dashboard
5. **Create Class** → Schedule class
6. **Create Zoom Meeting** → Get meeting link
7. **Upload Materials** → Share PDFs
8. **Student Enrolls** → Can access class
9. **Download Materials** → Get PDFs

## 📚 Key Pages

- `/login` - Login page
- `/signup` - Sign up page
- `/student-dashboard` - Student view
- `/teacher-dashboard` - Teacher view
- `/admin-dashboard` - Admin view
- `/class/:id` - Class details & materials

## 🔗 Important Links

### Configuration Files
- Backend: `backend/.env`
- Frontend: Auto-configured

### Database
- MongoDB URI: `mongodb://localhost:27017/online-learning`

### API Documentation
- See `backend/README.md` for full API docs

## ✅ Checklist

- [ ] Node.js installed
- [ ] MongoDB running
- [ ] Google OAuth credentials configured
- [ ] Zoom OAuth credentials configured
- [ ] Backend .env configured
- [ ] Backend running on port 5000
- [ ] Frontend running on port 3000
- [ ] Can sign up and login
- [ ] Can create classes (as teacher)
- [ ] Can create Zoom meetings
- [ ] Can upload materials

## 🆘 Common Issues

| Issue | Solution |
|-------|----------|
| Port 5000 in use | Change PORT in .env |
| MongoDB error | Ensure mongod is running |
| Google OAuth fails | Check CLIENT_ID and SECRET |
| CORS error | Verify backend URL in frontend |
| PDF not uploading | Ensure file is .pdf and < 100MB |

## 📞 Next Steps

1. Read full README.md for complete documentation
2. Explore API endpoints in backend/README.md
3. Customize styling in frontend/src/styles/
4. Add features as needed
5. Deploy when ready

---

Happy coding! 🚀
