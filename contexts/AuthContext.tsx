import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { AuthContextType, AppUser } from '../types.ts';
import { supabase } from '../lib/supabaseClient.ts';
// Removed unused 'User' import

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<AppUser | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    // Check for an active session on initial load
    supabase.auth.getSession().then(({ data: { session } }) => {
      setCurrentUser(session?.user as AppUser | null);
      setIsAuthenticated(!!session);
      setIsLoading(false);
    });

    // Listen for authentication state changes (login, logout, etc.)
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setCurrentUser(session?.user as AppUser | null);
      setIsAuthenticated(!!session);
    });

    // Cleanup subscription on unmount
    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const login = async (email: string, passwordPlainText: string) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password: passwordPlainText,
    });

    if (error) {
      return { success: false, error: error.message };
    }
    return { success: !!data.user, error: null };
  };

  const register = async (name: string, email: string, passwordPlainText: string) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password: passwordPlainText,
      options: {
        data: {
          name: name, // This will be stored in the user's user_metadata
        },
      },
    });

    if (error) {
      return { success: false, error: error.message };
    }
    
    // Supabase handles sending a confirmation email by default.
    // The UI layer (RegisterPage) will inform the user.
    return { success: !!data.user, error: null };
  };

  const logout = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      console.error("Error logging out:", error.message);
    }
    // The onAuthStateChange listener will handle state updates automatically
  };

  return (
    <AuthContext.Provider value={{ currentUser, isAuthenticated, isLoading, login, register, logout }}>
      {!isLoading && children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};