import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './hooks/useAuth';
import PrivateRoute from './components/PrivateRoute';
import Navbar from './components/Navbar';
import LandingPage from './pages/LandingPage';
import Login from './pages/Login';
import SignUp from './pages/SignUp';
import StudentDashboard from './dashboards/StudentDashboard';
import TeacherDashboard from './dashboards/TeacherDashboard';
import AdminDashboard from './dashboards/AdminDashboard';
import ClassDetail from './pages/ClassDetail';
import ClassList from './pages/ClassList';
import StudentProfile from './pages/StudentProfile';
import TeacherProfile from './pages/TeacherProfile';
import AdminProfile from './pages/AdminProfile';
import './App.css';

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Navbar />
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<SignUp />} />
          
          <Route 
            path="/student-dashboard" 
            element={
              <PrivateRoute requiredRole="student">
                <StudentDashboard />
              </PrivateRoute>
            } 
          />

          <Route 
            path="/student-profile" 
            element={
              <PrivateRoute requiredRole="student">
                <StudentProfile />
              </PrivateRoute>
            } 
          />
          
          <Route 
            path="/teacher-dashboard" 
            element={
              <PrivateRoute requiredRole="teacher">
                <TeacherDashboard />
              </PrivateRoute>
            } 
          />
          
          <Route 
            path="/teacher-profile" 
            element={
              <PrivateRoute requiredRole="teacher">
                <TeacherProfile />
              </PrivateRoute>
            } 
          />
          
          <Route 
            path="/admin-dashboard" 
            element={
              <PrivateRoute requiredRole="admin">
                <AdminDashboard />
              </PrivateRoute>
            } 
          />

          <Route 
            path="/admin-profile" 
            element={
              <PrivateRoute requiredRole="admin">
                <AdminProfile />
              </PrivateRoute>
            } 
          />
          
          <Route 
            path="/class/:classId" 
            element={
              <PrivateRoute>
                <ClassDetail />
              </PrivateRoute>
            } 
          />
          
          <Route 
            path="/classes" 
            element={
              <PrivateRoute>
                <ClassList />
              </PrivateRoute>
            } 
          />

          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
