import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import '../styles/Navbar.css';

const Navbar = () => {
  const [menuOpen, setMenuOpen] = useState(false);
  const navigate = useNavigate();
  const { user, token, logout } = useAuth();

  const handleLogout = () => {
    logout();
    navigate('/');
    setMenuOpen(false);
  };

  const navigateTo = (path) => {
    navigate(path);
    setMenuOpen(false);
  };

  return (
    <nav className="navbar">
      <div className="nav-container">
        <div className="logo" onClick={() => navigateTo('/')}>
          <img src="/images/logo.png" alt="Vidya Niketan Logo" className="logo-img" />
          <span className="logo-text">Vidya Niketan</span>
        </div>

        <div className={`nav-menu ${menuOpen ? 'active' : ''}`}>
          <a href="#features" className="nav-link">Features</a>
          <a href="#about" className="nav-link">About</a>
          <a href="#contact" className="nav-link">Contact</a>
          
          {token && user ? (
            <>
              <span className="nav-user">Welcome, {user.name}</span>
              <button className="nav-btn" onClick={() => navigateTo('/classes')}>
                📚 Classes
              </button>
              {user.role === 'student' && (
                <button className="nav-btn" onClick={() => navigateTo('/student-dashboard')}>
                  📊 Dashboard
                </button>
              )}
              {user.role === 'teacher' && (
                <button className="nav-btn" onClick={() => navigateTo('/teacher-dashboard')}>
                  📊 Dashboard
                </button>
              )}
              {user.role === 'admin' && (
                <button className="nav-btn" onClick={() => navigateTo('/admin-dashboard')}>
                  🔒 Admin
                </button>
              )}
              <button className="nav-btn logout-btn" onClick={handleLogout}>
                Logout
              </button>
            </>
          ) : (
            <>
              <button className="nav-btn" onClick={() => navigateTo('/login')}>
                Login
              </button>
              <button className="nav-btn primary-btn" onClick={() => navigateTo('/signup')}>
                Sign Up
              </button>
            </>
          )}
        </div>

        <div className="hamburger" onClick={() => setMenuOpen(!menuOpen)}>
          <span></span>
          <span></span>
          <span></span>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
