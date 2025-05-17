import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

type UserRole = 'lender' | 'borrower';

interface AuthContextType {
  isLoggedIn: boolean;
  setIsLoggedIn: (value: boolean) => void;
  role: UserRole;
  setRole: (role: UserRole) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [isLoggedIn, setIsLoggedIn] = useState(() => {
    // Initialize from localStorage
    const saved = localStorage.getItem('isLoggedIn');
    return saved === 'true';
  });

  const [role, setRole] = useState<UserRole>(() => {
    const saved = localStorage.getItem('userRole');
    return (saved as UserRole) || 'borrower';
  });

  // Update localStorage when isLoggedIn changes
  useEffect(() => {
    localStorage.setItem('isLoggedIn', isLoggedIn.toString());
  }, [isLoggedIn]);

  // Update localStorage when role changes
  useEffect(() => {
    localStorage.setItem('userRole', role);
  }, [role]);

  return (
    <AuthContext.Provider value={{ isLoggedIn, setIsLoggedIn, role, setRole }}>
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