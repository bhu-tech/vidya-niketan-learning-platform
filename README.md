# 🎓 Online Learning Platform - Complete Full-Stack Application

A comprehensive web application for conducting online classes, sharing study materials, and managing educational institutions with separate dashboards for teachers, students, and administrators.

## 🚀 Features

### Authentication & Security
- ✅ Google OAuth 2.0 Sign-In/Sign-Up
- ✅ Traditional Email/Password Authentication
- ✅ JWT Token-based authorization
- ✅ Role-based access control (Student, Teacher, Admin)

### Student Features
- ✅ Browse and enroll in available classes
- ✅ Access enrolled classes
- ✅ Download study materials (PDFs)
- ✅ View class schedules
- ✅ Join Zoom meetings

### Teacher Features
- ✅ Create and manage classes
- ✅ Schedule classes with date and time
- ✅ Upload study materials as PDFs
- ✅ Create Zoom meetings for classes
- ✅ Manage student enrollment
- ✅ View student progress

### Admin Features
- ✅ Dashboard with platform statistics
- ✅ Manage all users (view, edit, delete)
- ✅ Change user roles
- ✅ Monitor all classes
- ✅ Platform analytics

### Technical Features
- ✅ Zoom API integration for video conferencing
- ✅ File upload and management (PDFs)
- ✅ MongoDB database
- ✅ RESTful API architecture
- ✅ Responsive design (mobile, tablet, desktop)

## 📁 Project Structure

```
Bhuvan/
├── backend/
│   ├── src/
│   │   ├── config/
│   │   │   └── passport.js (Google OAuth configuration)
│   │   ├── controllers/
│   │   ├── middleware/
│   │   │   └── auth.js (Authentication & Authorization)
│   │   ├── models/
│   │   │   ├── User.js
│   │   │   ├── Class.js
│   │   │   └── Material.js
│   │   ├── routes/
│   │   │   ├── authRoutes.js
│   │   │   ├── userRoutes.js
│   │   │   ├── classRoutes.js
│   │   │   ├── materialRoutes.js
│   │   │   ├── zoomRoutes.js
│   │   │   └── adminRoutes.js
│   │   └── index.js (Main server file)
│   ├── uploads/
│   │   └── pdfs/ (Uploaded study materials)
│   ├── .env (Environment variables)
│   ├── package.json
│   └── README.md
│
└── frontend/
    ├── src/
    │   ├── pages/
    │   │   ├── Login.jsx
    │   │   ├── SignUp.jsx
    │   │   └── ClassDetail.jsx
    │   ├── dashboards/
    │   │   ├── StudentDashboard.jsx
    │   │   ├── TeacherDashboard.jsx
    │   │   └── AdminDashboard.jsx
    │   ├── components/
    │   │   └── PrivateRoute.jsx
    │   ├── hooks/
    │   │   └── useAuth.js
    │   ├── utils/
    │   │   └── api.js (API calls)
    │   ├── styles/
    │   │   ├── Auth.css
    │   │   ├── StudentDashboard.css
    │   │   ├── TeacherDashboard.css
    │   │   ├── AdminDashboard.css
    │   │   └── ClassDetail.css
    │   ├── App.jsx
    │   ├── App.css
    │   ├── index.jsx
    │   └── index.css
    ├── public/
    │   └── index.html
    ├── package.json
    └── README.md
```

## 🛠️ Tech Stack

### Backend
- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: MongoDB
- **Authentication**: Passport.js (Google OAuth, JWT)
- **File Upload**: Multer
- **API Integration**: Axios (for Zoom API)

### Frontend
- **Framework**: React 18
- **Routing**: React Router v6
- **HTTP Client**: Fetch API
- **Styling**: CSS3
- **State Management**: Context API

## 📋 Prerequisites

Before you begin, ensure you have:
- Node.js (v14 or higher)
- npm or yarn
- MongoDB (local or Atlas cloud)
- Google OAuth credentials from [Google Cloud Console](https://console.cloud.google.com/)
- Zoom OAuth credentials from [Zoom App Marketplace](https://marketplace.zoom.us/)

## 🚀 Installation & Setup

### Step 1: Clone or Download the Project

```bash
cd Bhuvan
```

### Step 2: Backend Setup

1. Navigate to backend folder:
```bash
cd backend
```

2. Install dependencies:
```bash
npm install
```

3. Create `.env` file and configure:
```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/online-learning
JWT_SECRET=your_secure_secret_key_here
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
GOOGLE_CALLBACK_URL=http://localhost:5000/api/auth/google/callback
ZOOM_CLIENT_ID=your_zoom_client_id
ZOOM_CLIENT_SECRET=your_zoom_client_secret
ZOOM_ACCOUNT_ID=your_zoom_account_id
REACT_APP_API_URL=http://localhost:3000
```

4. Start MongoDB:
```bash
# If using local MongoDB
mongod
```

5. Run backend server:
```bash
npm run dev
```

Backend will run on `http://localhost:5000`

### Step 3: Frontend Setup

1. Navigate to frontend folder (in new terminal):
```bash
cd frontend
```

2. Install dependencies:
```bash
npm install
```

3. Start development server:
```bash
npm start
```

Frontend will open on `http://localhost:3000`

## 🔐 Getting OAuth Credentials

### Google OAuth Setup
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project
3. Enable Google+ API
4. Create OAuth 2.0 credentials (Web application)
5. Add authorized redirect URI: `http://localhost:5000/api/auth/google/callback`
6. Copy Client ID and Client Secret to `.env`

### Zoom OAuth Setup
1. Go to [Zoom App Marketplace](https://marketplace.zoom.us/)
2. Create a new app (OAuth)
3. Copy Client ID, Client Secret, and Account ID
4. Add redirect URI: `http://localhost:5000/api/auth/google/callback`
5. Add to `.env`

## 📚 API Documentation

### Base URL: `http://localhost:5000/api`

### Authentication Endpoints
- `POST /auth/signup` - Register new user
- `POST /auth/login` - Login with email/password
- `GET /auth/google` - Google OAuth login
- `POST /auth/logout` - Logout

### User Endpoints
- `GET /users/profile` - Get current user profile
- `PUT /users/profile` - Update profile
- `POST /users/enroll/:classId` - Enroll in class

### Class Endpoints
- `POST /classes` - Create class (Teacher only)
- `GET /classes` - Get all classes
- `GET /classes/:id` - Get class details
- `PUT /classes/:id` - Update class (Teacher only)
- `DELETE /classes/:id` - Delete class (Teacher only)

### Material Endpoints
- `POST /materials/upload/:classId` - Upload PDF (Teacher only)
- `GET /materials/class/:classId` - Get class materials
- `DELETE /materials/:id` - Delete material (Teacher only)

### Zoom Endpoints
- `POST /zoom/create-meeting/:classId` - Create Zoom meeting (Teacher only)
- `GET /zoom/meeting/:meetingId` - Get meeting details

### Admin Endpoints
- `GET /admin/stats` - Get dashboard statistics
- `GET /admin/users` - Get all users
- `PUT /admin/users/:id/role` - Update user role
- `DELETE /admin/users/:id` - Delete user

## 👥 User Roles & Permissions

### Student
- View profile
- Enroll in classes
- Download study materials
- Join Zoom meetings
- View class details

### Teacher
- Create and manage classes
- Upload study materials
- Create Zoom meetings
- View enrolled students
- Schedule classes

### Admin
- View all users
- Change user roles
- Delete users
- View platform statistics
- Monitor all classes

## 🔄 Workflow

1. **User Registration**
   - Sign up with email/password or Google
   - Default role: Student

2. **Teacher Setup**
   - Admin changes user role to "Teacher"
   - Teacher can create classes

3. **Class Creation**
   - Teacher creates class with title, description, and schedule
   - Students can enroll in classes

4. **Zoom Meeting**
   - Teacher creates Zoom meeting for class
   - Students join via provided link

5. **Material Sharing**
   - Teacher uploads PDF materials
   - Students can download materials

## 📱 Features in Detail

### Authentication Flow
```
User Signs Up/Logs In
    ↓
Google OAuth or Email/Password
    ↓
JWT Token Generated
    ↓
Token Stored in LocalStorage
    ↓
Authenticated API Requests
```

### Class Enrollment Flow
```
Student Browses Classes
    ↓
Clicks "Enroll"
    ↓
Added to Class Students List
    ↓
Can Access Class Materials & Zoom
```

### Material Upload Flow
```
Teacher Clicks "Upload Material"
    ↓
Selects PDF File
    ↓
File Stored in Backend
    ↓
Material Record Created in DB
    ↓
Students Can Download
```

## 🐛 Troubleshooting

### Backend Issues

**MongoDB Connection Error**
- Ensure MongoDB is running: `mongod`
- Check connection string in `.env`

**Google OAuth Error**
- Verify credentials in `.env`
- Check redirect URI in Google Console

**Port Already in Use**
- Change PORT in `.env`
- Or kill process: `lsof -i :5000` then `kill -9 <PID>`

### Frontend Issues

**CORS Error**
- Ensure backend is running on `http://localhost:5000`
- Check REACT_APP_API_URL in `.env`

**Blank Page**
- Check browser console for errors
- Ensure all dependencies are installed

**Authentication Issues**
- Clear localStorage: `localStorage.clear()`
- Check token in browser DevTools

## 📝 Customization

### Change Port Numbers
- Backend: Modify `PORT` in `backend/.env`
- Frontend: `npm start -- --port 3001`

### Customize Colors
- Edit CSS files in `frontend/src/styles/`
- Main color: `#667eea`
- Secondary: `#764ba2`

### Add More Features
- Extend models in `backend/src/models/`
- Add new routes in `backend/src/routes/`
- Create components in `frontend/src/components/`

## 📦 Deployment

### Backend (using Heroku)
1. Create `Procfile`: `web: node src/index.js`
2. Push to Heroku: `git push heroku main`
3. Set environment variables on Heroku

### Frontend (using Netlify/Vercel)
1. Run: `npm run build`
2. Deploy the `build/` folder
3. Set API URL in environment variables

## 📄 License

This project is open source and available under the MIT License.

## 👨‍💻 Support

For issues, feature requests, or questions, please create an issue in the repository.

## 🎉 Happy Learning!

This platform is designed to make online education accessible and effective for everyone.

---

**Last Updated**: January 2026
**Version**: 1.0.0
