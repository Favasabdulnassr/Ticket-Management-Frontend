import { createContext, useState, useEffect, useContext } from 'react';
import { getCurrentUser, logout as logoutApi } from '../services/authService';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Try to fetch current user (backend will check for the cookie)
    getCurrentUser()
      .then((res) => setUser(res.data))
      .catch(() => {
        setUser(null);
      })
      .finally(() => setLoading(false));
  }, []);

  const login = (userData) => {
    setUser(userData);
  };

  const logout = async () => {
    try {
      await logoutApi();
    } catch (error) {
      console.error('Logout error', error);
    }
    setUser(null);
  };

  const isAdmin = () => user?.role === 'ADMIN' || user?.is_staff || user?.is_superuser;

  return (
    <AuthContext.Provider value={{ user, loading, login, logout, isAdmin }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);

export default AuthContext;
