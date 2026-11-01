import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api';
import { useToast } from './ToastContext';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token') || null);
  const [loading, setLoading] = useState(true);
  const toast = useToast();

  // Load user on startup if token exists
  useEffect(() => {
    const loadUser = async () => {
      if (!token) {
        setLoading(false);
        return;
      }

      try {
        const res = await api.get('/auth/me');
        if (res.data.success) {
          setUser(res.data.data.user);
        }
      } catch (err) {
        console.error('Failed to authenticate session:', err);
        localStorage.removeItem('token');
        setToken(null);
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    loadUser();
  }, [token]);

  // Login
  const login = async (email, password) => {
    try {
      const res = await api.post('/auth/login', { email, password });
      if (res.data.success) {
        const { token: newToken, user: userData } = res.data.data;
        localStorage.setItem('token', newToken);
        setToken(newToken);
        setUser(userData);
        toast.success(`Welcome back, ${userData.name}!`);
        return { success: true, user: userData };
      }
    } catch (err) {
      const msg = err.response?.data?.error || 'Invalid email or password';
      toast.error(msg);
      return { success: false, error: msg };
    }
  };

  // Register Student
  const registerStudent = async (studentData) => {
    try {
      const res = await api.post('/auth/register-student', studentData);
      if (res.data.success) {
        const { token: newToken, user: userData } = res.data.data;
        localStorage.setItem('token', newToken);
        setToken(newToken);
        setUser(userData);
        toast.success('Registration successful! Welcome to CampusVoice.');
        return { success: true, user: userData };
      }
    } catch (err) {
      const msg = err.response?.data?.error || 'Student registration failed';
      toast.error(msg);
      return { success: false, error: msg };
    }
  };

  // Register Staff
  const registerStaff = async (staffData) => {
    try {
      const res = await api.post('/auth/register-staff', staffData);
      if (res.data.success) {
        toast.success(res.data.message || 'Staff registration submitted for admin approval.');
        return { success: true, pendingApproval: true };
      }
    } catch (err) {
      const msg = err.response?.data?.error || 'Staff registration failed';
      toast.error(msg);
      return { success: false, error: msg };
    }
  };

  // Logout
  const logout = () => {
    localStorage.removeItem('token');
    setToken(null);
    setUser(null);
    toast.info('You have been signed out.');
  };

  // Update Profile
  const updateProfile = async (formData) => {
    try {
      const res = await api.put('/auth/profile', formData);
      if (res.data.success) {
        setUser(res.data.data.user);
        toast.success('Profile details updated successfully.');
        return { success: true };
      }
    } catch (err) {
      const msg = err.response?.data?.error || 'Profile update failed';
      toast.error(msg);
      return { success: false, error: msg };
    }
  };

  // Change Password
  const changePassword = async (passwords) => {
    try {
      const res = await api.put('/auth/change-password', passwords);
      if (res.data.success) {
        toast.success('Password changed successfully.');
        return { success: true };
      }
    } catch (err) {
      const msg = err.response?.data?.error || 'Password update failed';
      toast.error(msg);
      return { success: false, error: msg };
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        isAuthenticated: Boolean(user),
        role: user?.role || null,
        login,
        registerStudent,
        registerStaff,
        logout,
        updateProfile,
        changePassword,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

