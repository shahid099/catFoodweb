'use client';

import { createContext, useContext, useState, useEffect } from 'react';

const UserContext = createContext(null);

export function UserProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchUser = async () => {
    try {
      setLoading(true);
      setError(null);

      const res = await fetch('/api/auth/me');
      const data = await res.json();

      if (data.user) {
        setUser(data.user); // Database user object
      } else {
        setUser(null);
      }
    } catch (err) {
      console.error('Error fetching user context:', err);
      setError('Failed to load user authentication state.');
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  // Fetch user details from DB on component mount
  useEffect(() => {
    fetchUser();
  }, []);

  // Helper to clear state on logout
  const handleLogout = () => {
    setUser(null);
  };

  return (
    <UserContext.Provider
      value={{
        user,
        setUser,
        loading,
        error,
        refetchUser: fetchUser,
        handleLogout,
      }}
    >
      {children}
    </UserContext.Provider>
  );
}

// Custom Hook to consume data in any component
export function useUser() {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
}