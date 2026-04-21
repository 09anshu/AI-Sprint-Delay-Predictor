import { createContext, useContext, useState, useEffect } from 'react';
import api from '../api/axios';
const AuthContext = createContext();
export const useAuth = () => useContext(AuthContext);
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    const token = localStorage.getItem('adminToken');
    const saved = localStorage.getItem('adminUser');
    if (token && saved) { try { setUser(JSON.parse(saved)); } catch { localStorage.clear(); } }
    setLoading(false);
  }, []);
  const login = async (email, password) => {
    const res = await api.post('/login', { email, password });
    localStorage.setItem('adminToken', res.data.token);
    localStorage.setItem('adminUser', JSON.stringify(res.data.user));
    setUser(res.data.user);
    return res.data;
  };
  const logout = () => { localStorage.removeItem('adminToken'); localStorage.removeItem('adminUser'); setUser(null); };
  return <AuthContext.Provider value={{ user, login, logout, isAuthenticated: !!user, loading }}>{children}</AuthContext.Provider>;
};
