import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext();
export const useAuth = () => useContext(AuthContext);

const defaultProfile = {
  exam: 'UPSC',
  topics: ['politics', 'economy', 'international'],
  targets: {},   // { topic: { 2024-07-20: true } } can be simplified
};

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);           // { email, name }
  const [profile, setProfile] = useState(defaultProfile);

  // Load user & profile from localStorage
  useEffect(() => {
    const stored = localStorage.getItem('currentUser');
    if (stored) {
      const parsed = JSON.parse(stored);
      setUser(parsed);
      const storedProfile = localStorage.getItem(`profile_${parsed.email}`);
      if (storedProfile) {
        setProfile(JSON.parse(storedProfile));
      }
    }
  }, []);

  // Save profile whenever it changes
  useEffect(() => {
    if (user) {
      localStorage.setItem(`profile_${user.email}`, JSON.stringify(profile));
    }
  }, [profile, user]);

  const login = (email, password) => {
    const users = JSON.parse(localStorage.getItem('users') || '{}');
    if (users[email] && users[email].password === password) {
      const loggedIn = { email, name: users[email].name };
      localStorage.setItem('currentUser', JSON.stringify(loggedIn));
      const storedProfile = localStorage.getItem(`profile_${email}`);
      if (storedProfile) setProfile(JSON.parse(storedProfile));
      else setProfile(defaultProfile);
      setUser(loggedIn);
      return true;
    }
    return false;
  };

  const signup = (name, email, password) => {
    const users = JSON.parse(localStorage.getItem('users') || '{}');
    if (users[email]) return false;
    users[email] = { name, password };
    localStorage.setItem('users', JSON.stringify(users));
    const loggedIn = { email, name };
    localStorage.setItem('currentUser', JSON.stringify(loggedIn));
    localStorage.setItem(`profile_${email}`, JSON.stringify(defaultProfile));
    setUser(loggedIn);
    setProfile(defaultProfile);
    return true;
  };

  const logout = () => {
    localStorage.removeItem('currentUser');
    setUser(null);
    setProfile(defaultProfile);
  };

  const updateProfile = (updates) => {
    setProfile(prev => ({ ...prev, ...updates }));
  };

  return (
    <AuthContext.Provider value={{ user, login, signup, logout, profile, updateProfile }}>
      {children}
    </AuthContext.Provider>
  );
}