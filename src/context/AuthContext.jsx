import React, { createContext, useState, useContext, useEffect, useCallback } from 'react';

const AuthContext = createContext();

// Token storage helpers
const TOKEN_KEY = 'medster_access_token';
const REFRESH_KEY = 'medster_refresh_token';
const USER_KEY = 'medster_user';

function getStoredToken() {
  return localStorage.getItem(TOKEN_KEY);
}

function getStoredRefreshToken() {
  return localStorage.getItem(REFRESH_KEY);
}

function storeTokens(accessToken, refreshToken) {
  if (accessToken) localStorage.setItem(TOKEN_KEY, accessToken);
  if (refreshToken) localStorage.setItem(REFRESH_KEY, refreshToken);
}

function clearTokens() {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(REFRESH_KEY);
  localStorage.removeItem(USER_KEY);
}

function getStoredUser() {
  try {
    const stored = localStorage.getItem(USER_KEY);
    return stored ? JSON.parse(stored) : null;
  } catch {
    return null;
  }
}

function storeUser(user) {
  if (user) {
    localStorage.setItem(USER_KEY, JSON.stringify(user));
  } else {
    localStorage.removeItem(USER_KEY);
  }
}

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(getStoredUser);
  const [loading, setLoading] = useState(true);

  // Initialize auth state from stored tokens
  useEffect(() => {
    const initAuth = async () => {
      const token = getStoredToken();
      if (token) {
        try {
          // Verify token by fetching user profile
          const response = await fetch('/api/auth/me', {
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json',
            },
          });

          if (response.ok) {
            const data = await response.json();
            const userData = { ...data.user, token };
            setUser(userData);
            storeUser(userData);
          } else {
            // Token expired, try refresh
            const refreshed = await attemptTokenRefresh();
            if (!refreshed) {
              clearTokens();
              setUser(null);
            }
          }
        } catch {
          // Network error - use stored user if available
          const storedUser = getStoredUser();
          if (storedUser) {
            setUser({ ...storedUser, token });
          }
        }
      }
      setLoading(false);
    };

    initAuth();
  }, []);

  // Token refresh function
  const attemptTokenRefresh = useCallback(async () => {
    const refreshToken = getStoredRefreshToken();
    if (!refreshToken) return false;

    try {
      const response = await fetch('/api/auth/refresh', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refreshToken }),
      });

      if (response.ok) {
        const data = await response.json();
        storeTokens(data.accessToken, data.refreshToken);
        
        // Update stored user with new token
        const currentUser = getStoredUser();
        if (currentUser) {
          const updatedUser = { ...currentUser, token: data.accessToken };
          storeUser(updatedUser);
          setUser(updatedUser);
        }
        return true;
      }
    } catch (err) {
      console.error('Token refresh failed:', err);
    }
    return false;
  }, []);

  // Register
  const signUp = async (email, password, userData) => {
    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email,
          password,
          fullName: userData?.fullName || `${userData?.firstName || ''} ${userData?.lastName || ''}`.trim(),
          phone: userData?.phone || '',
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        return { success: false, error: data.message || 'Registration failed' };
      }

      // Store tokens and user
      storeTokens(data.accessToken, data.refreshToken);
      const userWithToken = { ...data.user, token: data.accessToken };
      storeUser(userWithToken);
      setUser(userWithToken);

      return { success: true, data };
    } catch (error) {
      return { success: false, error: error.message || 'Network error' };
    }
  };

  // Login
  const signIn = async (email, password) => {
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        return { success: false, error: data.message || 'Login failed' };
      }

      // Store tokens and user
      storeTokens(data.accessToken, data.refreshToken);
      const userWithToken = { ...data.user, token: data.accessToken };
      storeUser(userWithToken);
      setUser(userWithToken);

      return { success: true, data };
    } catch (error) {
      return { success: false, error: error.message || 'Network error' };
    }
  };

  // Logout
  const signOut = async () => {
    try {
      const token = getStoredToken();
      if (token) {
        await fetch('/api/auth/logout', {
          method: 'POST',
          headers: { 'Authorization': `Bearer ${token}` },
        });
      }
    } catch (err) {
      console.error('Logout error:', err);
    } finally {
      clearTokens();
      setUser(null);
    }
    return { success: true };
  };

  // Check if user is admin
  const isAdmin = user?.role === 'admin' || user?.role === 'pharmacist';

  const value = {
    user,
    loading,
    signUp,
    signIn,
    signOut,
    isAdmin,
    token: getStoredToken(),
    refreshToken: getStoredRefreshToken(),
    attemptTokenRefresh,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
};

