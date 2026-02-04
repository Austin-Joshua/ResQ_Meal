import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

export type UserRole = 'restaurant' | 'ngo' | 'volunteer' | 'admin';

export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  profilePhoto?: string;
  location?: string;
  phone?: string;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  loginAsDemo: (role: UserRole) => void;
  signup: (email: string, password: string, name: string, role: UserRole) => Promise<void>;
  logout: () => void;
  updateUser: (updates: Partial<User>) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const DEMO_USERS: Record<UserRole, User> = {
  restaurant: {
    id: 'demo-restaurant-1',
    email: 'demo@restaurant.com',
    name: 'Green Kitchen Restaurant',
    role: 'restaurant',
    location: 'Downtown Food District',
    phone: '+1 555-0101',
  },
  ngo: {
    id: 'demo-ngo-1',
    email: 'demo@ngo.org',
    name: 'Food For All Foundation',
    role: 'ngo',
    location: 'Community Center',
    phone: '+1 555-0102',
  },
  volunteer: {
    id: 'demo-volunteer-1',
    email: 'demo@volunteer.com',
    name: 'Alex Johnson',
    role: 'volunteer',
    location: 'City Central',
    phone: '+1 555-0103',
  },
  admin: {
    id: 'demo-admin-1',
    email: 'admin@resqmeal.com',
    name: 'System Admin',
    role: 'admin',
    location: 'Headquarters',
    phone: '+1 555-0100',
  },
};

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const storedToken = localStorage.getItem('resqmeal_token');
    const storedUser = localStorage.getItem('resqmeal_user');
    
    if (storedToken && storedUser) {
      setToken(storedToken);
      setUser(JSON.parse(storedUser));
    }
    setIsLoading(false);
  }, []);

  const login = async (email: string, password: string) => {
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // For demo, accept any credentials and assign restaurant role
    const demoUser = DEMO_USERS.restaurant;
    const demoToken = `jwt-token-${Date.now()}`;
    
    setUser({ ...demoUser, email });
    setToken(demoToken);
    localStorage.setItem('resqmeal_token', demoToken);
    localStorage.setItem('resqmeal_user', JSON.stringify({ ...demoUser, email }));
  };

  const loginAsDemo = (role: UserRole) => {
    const demoUser = DEMO_USERS[role];
    const demoToken = `demo-jwt-${role}-${Date.now()}`;
    
    setUser(demoUser);
    setToken(demoToken);
    localStorage.setItem('resqmeal_token', demoToken);
    localStorage.setItem('resqmeal_user', JSON.stringify(demoUser));
  };

  const signup = async (email: string, password: string, name: string, role: UserRole) => {
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const newUser: User = {
      id: `user-${Date.now()}`,
      email,
      name,
      role,
    };
    const newToken = `jwt-token-${Date.now()}`;
    
    setUser(newUser);
    setToken(newToken);
    localStorage.setItem('resqmeal_token', newToken);
    localStorage.setItem('resqmeal_user', JSON.stringify(newUser));
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('resqmeal_token');
    localStorage.removeItem('resqmeal_user');
  };

  const updateUser = (updates: Partial<User>) => {
    if (user) {
      const updatedUser = { ...user, ...updates };
      setUser(updatedUser);
      localStorage.setItem('resqmeal_user', JSON.stringify(updatedUser));
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated: !!user,
        isLoading,
        login,
        loginAsDemo,
        signup,
        logout,
        updateUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
