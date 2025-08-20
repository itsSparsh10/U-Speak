'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

interface User {
  id: string;
  email: string;
  role: string;
  firstName: string;
  lastName: string;
  corporateAccountId?: string;
  companyName?: string;
  jobTitle?: string;
  department?: string;
  employeeId?: string;
}

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    // Check localStorage for authentication
    const storedToken = localStorage.getItem('uspeak_token');
    const storedUser = localStorage.getItem('uspeak_user');
    const storedRole = localStorage.getItem('uspeak_role');

    if (storedToken && storedUser && storedRole) {
      try {
        const userData = JSON.parse(storedUser);
        setUser(userData);
        setToken(storedToken);
      } catch (error) {
        console.error('Error parsing stored user data:', error);
        // Clear invalid data
        localStorage.removeItem('uspeak_token');
        localStorage.removeItem('uspeak_user');
        localStorage.removeItem('uspeak_role');
      }
    }
    
    setIsLoading(false);
  }, []);

  const logout = async () => {
    console.log('Logout function called');
    
    try {
      // Call logout API to log the action
      if (token) {
        await fetch('/api/auth/logout', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });
      }
    } catch (error) {
      console.error('Failed to log logout action:', error);
      // Continue with logout even if API call fails
    }
    
    // Clear all authentication data
    localStorage.removeItem('uspeak_token');
    localStorage.removeItem('uspeak_user');
    localStorage.removeItem('uspeak_role');
    
    console.log('LocalStorage cleared');
    
    // Clear state
    setUser(null);
    setToken(null);
    
    console.log('State cleared, redirecting to /auth');
    
    // Force redirect to login page using full page navigation
    window.location.href = '/auth';
  };

  const isAuthenticated = !!token && !!user;

  return {
    user,
    token,
    isAuthenticated,
    isLoading,
    logout
  };
}
