"use client";

import React, { createContext, useContext, useState, useEffect } from 'react';
import { useWallet } from "@solana/wallet-adapter-react";
import { Artist, fetchProfileData } from "@/lib/supabaseClient";

interface UserProfileContextType {
  userProfile: Artist | null;
  setUserProfile: React.Dispatch<React.SetStateAction<Artist | null>>;
  isLoading: boolean;
}

const UserProfileContext = createContext<UserProfileContextType | undefined>(undefined);

export const UserProfileProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [userProfile, setUserProfile] = useState<Artist | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { publicKey } = useWallet();

  useEffect(() => {
    const loadUserProfile = async () => {
      if (publicKey) {
        setIsLoading(true);
        const { exists, data } = await fetchProfileData();
        if (exists && data) {
          setUserProfile(data);
        } else {
          setUserProfile(null);
        }
        setIsLoading(false);
      } else {
        setUserProfile(null);
        setIsLoading(false);
      }
    };

    loadUserProfile();
  }, [publicKey]);

  return (
    <UserProfileContext.Provider value={{ userProfile, setUserProfile, isLoading }}>
      {children}
    </UserProfileContext.Provider>
  );
};

export const useUserProfile = () => {
  const context = useContext(UserProfileContext);
  if (context === undefined) {
    throw new Error('useUserProfile must be used within a UserProfileProvider');
  }
  return context;
};