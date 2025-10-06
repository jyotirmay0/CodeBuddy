import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { apiClient } from '@/lib/api';

interface AuthContextType {
  isLoggedIn: boolean;
  setIsLoggedIn: (value: boolean) => void;
  checkAuth: () => Promise<void>;
}

const Authcontext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isChecking, setIsChecking] = useState(true);

  const checkAuth = async () => {
    try {
      await apiClient.get('/user/details');
      setIsLoggedIn(true);
    } catch {
      setIsLoggedIn(false);
    } finally {
      setIsChecking(false);
    }
  };

  useEffect(() => {
    checkAuth();
  }, []);

  if (isChecking) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-muted-foreground">Loading...</div>
      </div>
    );
  }

  return (
    <Authcontext.Provider value={{ isLoggedIn, setIsLoggedIn, checkAuth }}>
      {children}
    </Authcontext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(Authcontext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
};