# Online Learning Platform - Backend

## Setup Instructions

### Prerequisites
- Node.js (v14+)
- MongoDB
- Zoom Account with OAuth credentials
- Google OAuth credentials

### Installation

1. Install dependencies:
```bash
npm install
```

2. Configure environment variables in `.env`:
```
PORT=5000
MONGODB_URI=mongodb://localhost:27017/online-learning
JWT_SECRET=your_secret_key
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
GOOGLE_CALLBACK_URL=http://localhost:5000/api/auth/google/callback
ZOOM_CLIENT_ID=your_zoom_client_id
ZOOM_CLIENT_SECRET=your_zoom_client_secret
ZOOM_ACCOUNT_ID=your_zoom_account_id
REACT_APP_API_URL=http://localhost:3000
```

3. Start MongoDB server

4. Run development server:
```bash
npm run dev
```

## API Endpoints

### Authentication
- `POST /api/auth/signup` - User registration
- `POST /api/auth/login` - User login
- `GET /api/auth/google` - Google OAuth
- `GET /api/auth/google/callback` - Google OAuth callback

### Users
- `GET /api/users/profile` - Get user profile
- `PUT /api/users/profile` - Update profile
- `POST /api/users/enroll/:classId` - Enroll in class

### Classes
- `POST /api/classes` - Create class (Teacher)
- `GET /api/classes` - Get all classes
- `GET /api/classes/:id` - Get class details
- `PUT /api/classes/:id` - Update class (Teacher)
- `DELETE /api/classes/:id` - Delete class (Teacher)

### Materials
- `POST /api/materials/upload/:classId` - Upload PDF
- `GET /api/materials/class/:classId` - Get class materials
- `DELETE /api/materials/:id` - Delete material

### Zoom
- `POST /api/zoom/create-meeting/:classId` - Create Zoom meeting
- `GET /api/zoom/meeting/:meetingId` - Get meeting details

### Admin
- `GET /api/admin/stats` - Dashboard statistics
- `GET /api/admin/users` - Get all users
- `PUT /api/admin/users/:id/role` - Update user role
- `DELETE /api/admin/users/:id` - Delete user
