import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { UserProfile } from './types';
import { supabase } from './services/supabaseClient';
import { AuthUser } from './services/authService';

type UserContextType = {
  profile: UserProfile;
  updateProfile: (data: Partial<UserProfile>) => void;
  updatePreferences: (data: Partial<UserProfile['preferences']>) => void;
  isAuthenticated: boolean;
  isLoading: boolean;
};

const UserContext = createContext<UserContextType | undefined>(undefined);

const defaultProfile: UserProfile = {
  name: 'Student Alpha',
  email: 'alpha.student@edux.ai',
  title: 'Neural Architect',
  level: 'LVL 42',
  bio: 'Exploring the linguistic frontiers of the metaverse. Focused on mastering Asian dialects.',
  phone: '+1 (555) 019-2834',
  location: 'Neo-Tokyo, Digital Realm',
  avatar: undefined,
  preferences: {
    soundEnabled: true,
    notifications: true,
    hapticFeedback: true,
    difficulty: 'Intermediate',
    focusMode: false
  }
};

export const UserProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [profile, setProfile] = useState<UserProfile>(defaultProfile);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check active session
    const checkSession = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (session) {
          setIsAuthenticated(true);
          // Update profile with user data
          setProfile(prev => ({
            ...prev,
            email: session.user.email || prev.email,
            name: session.user.user_metadata?.name || prev.name
          }));
        }
      } catch (error) {
        console.error('Error checking session:', error);
      } finally {
        setIsLoading(false);
      }
    };

    checkSession();

    // Listen for auth state changes
    const { data: authListener } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_IN') {
        setIsAuthenticated(true);
        if (session?.user) {
          setProfile(prev => ({
            ...prev,
            email: session.user.email || prev.email,
            name: session.user.user_metadata?.name || prev.name
          }));
        }
      } else if (event === 'SIGNED_OUT') {
        setIsAuthenticated(false);
        setProfile(defaultProfile);
      }
    });

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, []);

  const updateProfile = (data: Partial<UserProfile>) => {
    setProfile(prev => ({ ...prev, ...data }));
  };

  const updatePreferences = (data: Partial<UserProfile['preferences']>) => {
    setProfile(prev => ({
      ...prev,
      preferences: { ...prev.preferences, ...data }
    }));
  };

  return (
    <UserContext.Provider value={{ profile, updateProfile, updatePreferences, isAuthenticated, isLoading }}>
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => {
  const context = useContext(UserContext);
  if (!context) throw new Error('useUser must be used within a UserProvider');
  return context;
};