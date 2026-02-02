# Online Learning Platform - Frontend

## Setup Instructions

### Prerequisites
- Node.js (v14+)
- npm or yarn

### Installation

1. Install dependencies:
```bash
npm install
```

2. Create `.env` file:
```
REACT_APP_API_URL=http://localhost:5000/api
```

3. Start development server:
```bash
npm start
```

Server will run on `http://localhost:3000`

## Project Structure

- `src/pages/` - Page components (Login, SignUp, ClassDetail)
- `src/dashboards/` - Dashboard components (Student, Teacher, Admin)
- `src/components/` - Reusable components (PrivateRoute)
- `src/hooks/` - Custom hooks (useAuth)
- `src/utils/` - Utility functions (API calls)
- `src/styles/` - CSS stylesheets

## Features

- Google OAuth authentication
- Regular email/password signup and login
- Student dashboard with class enrollment
- Teacher dashboard with class creation
- Admin dashboard with user management
- Zoom integration for online classes
- PDF file sharing for study materials
- Responsive design

## Key Components

### Authentication
- Login page with Google Sign-In option
- Sign-up form for new users
- Auth context for managing user state

### Dashboards
- **Student**: View enrolled classes, browse available classes
- **Teacher**: Create and manage classes, upload study materials, create Zoom meetings
- **Admin**: View statistics, manage users and their roles

### Class Management
- Class detail page with Zoom meeting controls
- Material upload and download
- Student enrollment system
