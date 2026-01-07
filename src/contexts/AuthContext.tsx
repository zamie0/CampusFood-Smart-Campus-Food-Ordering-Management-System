"use client";

import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { useUser, useClerk } from "@clerk/nextjs";

interface UserProfile {
  id: string;
  clerkId: string;
  email: string;
  fullName: string;
  avatarUrl?: string;
  studentId?: string;
  notificationsEnabled: boolean;
  promoNotifications: boolean;
  orderNotifications: boolean;
  createdAt: Date;
  updatedAt: Date;
}

interface AuthContextType {
  user: UserProfile | null;
  loading: boolean;
  signOut: () => Promise<void>;
  updateProfile: (updates: Partial<UserProfile>) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const { user: clerkUser, isLoaded: clerkLoaded } = useUser();
  const { signOut: clerkSignOut } = useClerk();
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  // Sync Clerk user with MongoDB profile
  useEffect(() => {
    if (!clerkLoaded) return;

    if (clerkUser) {
      // User is signed in with Clerk, sync with MongoDB
      syncUserWithMongoDB(clerkUser);
    } else {
      // User is signed out
      setUser(null);
      setLoading(false);
    }
  }, [clerkUser, clerkLoaded]);

  const syncUserWithMongoDB = async (clerkUser: any) => {
    try {
      // Check if user profile exists in MongoDB
      const response = await fetch('/api/user/profile', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const profile = await response.json();
        setUser(profile);
      } else {
        // Create new profile in MongoDB
        const newProfile = {
          clerkId: clerkUser.id,
          email: clerkUser.primaryEmailAddress?.emailAddress || '',
          fullName: clerkUser.fullName || `${clerkUser.firstName || ''} ${clerkUser.lastName || ''}`.trim() || '',
          avatarUrl: clerkUser.imageUrl,
          notificationsEnabled: true,
          promoNotifications: true,
          orderNotifications: true,
        };

        const createResponse = await fetch('/api/user/profile', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(newProfile),
        });

        if (createResponse.ok) {
          const createdProfile = await createResponse.json();
          setUser(createdProfile);
        }
      }
    } catch (error) {
      console.error('Error syncing user with MongoDB:', error);
    } finally {
      setLoading(false);
    }
  };

  const signOut = async () => {
    await clerkSignOut();
    setUser(null);
  };

  const updateProfile = async (updates: Partial<UserProfile>) => {
    if (!user) return;

    try {
      const response = await fetch('/api/user/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updates),
      });

      if (response.ok) {
        const updatedProfile = await response.json();
        setUser(updatedProfile);
      }
    } catch (error) {
      console.error('Error updating profile:', error);
      throw error;
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, signOut, updateProfile }}>
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
