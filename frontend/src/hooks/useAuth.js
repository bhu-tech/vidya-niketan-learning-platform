import { createContext, useState, useContext, useEffect } from 'react';
import * as authAPI from '../utils/api';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (token) {
      fetchUserProfile();
    }
  }, [token]);

  const fetchUserProfile = async () => {
    try {
      const profile = await authAPI.userAPI.getProfile();
      setUser(profile);
    } catch (error) {
      console.error('Error fetching profile:', error);
      logout();
    }
  };

  const signup = async (name, email, password, role = 'student') => {
    setLoading(true);
    try {
      const response = await authAPI.authAPI.signup({ name, email, password, role });
      
      if (response.error) {
        throw new Error(response.error);
      }

      // If server issued a token (e.g., admin signup), persist and set user.
      if (response.token && response.user) {
        localStorage.setItem('token', response.token);
        setToken(response.token);
        setUser(response.user);
        return response;
      }

      // Account created but awaiting approval — return response for UI handling
      if (response.user) {
        return response;
      }

      throw new Error('Invalid response from server');
    } catch (error) {
      throw new Error(error.message || 'Signup failed');
    } finally {
      setLoading(false);
    }
  };

  const login = async (email, password) => {
    setLoading(true);
    try {
      const response = await authAPI.authAPI.login({ email, password });
      
      if (response.error) {
        throw new Error(response.error);
      }
      
      if (!response.token || !response.user) {
        throw new Error('Invalid response from server');
      }
      
      localStorage.setItem('token', response.token);
      setToken(response.token);
      setUser(response.user);
      return response;
    } catch (error) {
      throw new Error(error.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    setToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, token, loading, signup, login, logout, setUser }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
