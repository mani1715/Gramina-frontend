import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import axios from 'axios';

const ENV_API_URL = process.env.REACT_APP_BACKEND_URL;
// If API_URL is undefined, default it to `/` so it doesn't use `undefined/`
const API_URL = ENV_API_URL === 'undefined' || !ENV_API_URL ? '' : ENV_API_URL;

// Configure axios defaults
axios.defaults.withCredentials = true;
axios.defaults.headers.common['Content-Type'] = 'application/json';
axios.defaults.headers.common['Accept'] = 'application/json';

// Key used to track whether the user has ever logged in this browser
const SESSION_KEY = 'gm_has_session';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null); // null = checking, false = not auth, object = auth
  const [loading, setLoading] = useState(true);

  const checkAuth = useCallback(async () => {
    // Only hit the server if we previously stored a session marker.
    // This prevents a pointless 401 error in the console every time
    // a visitor opens the app without being logged in.
    const hasSession = localStorage.getItem(SESSION_KEY);
    if (!hasSession) {
      setUser(false);
      setLoading(false);
      return;
    }

    try {
      const response = await axios.get(`${API_URL}/api/auth/me`, {
        withCredentials: true
      });
      if (typeof response.data === 'string') {
        throw new Error('Received HTML string instead of JSON. Check the Backend URL.');
      }
      setUser(response.data);
    } catch (error) {
      // Session expired or cookie gone — clear the marker
      localStorage.removeItem(SESSION_KEY);
      setUser(false);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  const login = async (email, password) => {
    const response = await axios.post(
      `${API_URL}/api/auth/login`,
      { email, password },
      { withCredentials: true }
    );
    if (typeof response.data === 'string') {
      throw new Error('Invalid backend response');
    }
    localStorage.setItem(SESSION_KEY, '1');
    setUser(response.data);
    return response.data;
  };

  const register = async (userData) => {
    const response = await axios.post(
      `${API_URL}/api/auth/register`,
      userData,
      { withCredentials: true }
    );
    if (typeof response.data === 'string') {
      throw new Error('Invalid backend response');
    }
    return response.data;
  };

  const verifyOTP = async (email, otp) => {
    const response = await axios.post(
      `${API_URL}/api/auth/verify-otp`,
      { email, otp },
      { withCredentials: true }
    );
    localStorage.setItem(SESSION_KEY, '1');
    setUser(response.data);
    return response.data;
  };

  const resendOTP = async (email) => {
    const response = await axios.post(
      `${API_URL}/api/auth/resend-otp`,
      { email },
      { withCredentials: true }
    );
    return response.data;
  };

  const logout = async () => {
    try {
      await axios.post(`${API_URL}/api/auth/logout`, {}, { withCredentials: true });
    } catch (error) {
      // Ignore logout errors silently
    }
    // Clear all local storage items related to session
    localStorage.removeItem(SESSION_KEY);
    // Clear any cached data
    sessionStorage.clear();
    // Force state update
    setUser(false);
    // Navigate to login page - handled by component calling logout
  };

  const updateProfile = async (profileData) => {
    const response = await axios.put(
      `${API_URL}/api/profile`,
      profileData,
      { withCredentials: true }
    );
    setUser(prev => ({ ...prev, ...response.data }));
    return response.data;
  };

  const changePassword = async (currentPassword, newPassword) => {
    const response = await axios.put(
      `${API_URL}/api/profile/change-password`,
      { current_password: currentPassword, new_password: newPassword },
      { withCredentials: true }
    );
    return response.data;
  };

  const changeEmail = async (newEmail, password) => {
    const response = await axios.put(
      `${API_URL}/api/profile/change-email`,
      { new_email: newEmail, password },
      { withCredentials: true }
    );
    return response.data;
  };

  const verifyEmailChange = async (newEmail, otp) => {
    const response = await axios.post(
      `${API_URL}/api/profile/verify-email-change`,
      { email: newEmail, otp },
      { withCredentials: true }
    );
    setUser(prev => ({ ...prev, email: newEmail }));
    return response.data;
  };

  const forgotPassword = async (email) => {
    const response = await axios.post(
      `${API_URL}/api/auth/forgot-password`,
      { email }
    );
    return response.data;
  };

  const resetPassword = async (email, otp, newPassword) => {
    const response = await axios.post(
      `${API_URL}/api/auth/reset-password`,
      { email, otp, new_password: newPassword }
    );
    return response.data;
  };

  return (
    <AuthContext.Provider value={{
      user,
      loading,
      login,
      register,
      verifyOTP,
      resendOTP,
      logout,
      updateProfile,
      changePassword,
      changeEmail,
      verifyEmailChange,
      forgotPassword,
      resetPassword,
      checkAuth,
      isAuthenticated: !!user
    }}>
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
