"use client";

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
} from "react";
import { useWallet } from "@solana/wallet-adapter-react";
import { fetchProfileData, supabase } from "@/lib/supabaseClient";
import { useRouter, usePathname } from "next/navigation";

// Define the shape of the user profile
interface UserProfile {
  id: number;
  username: string;
  bio: string;
  email: string;
  avatar_url: string;
  x_username?: string | null;
  instagram_username?: string | null;
  linkedin_username?: string | null;
  farcaster_username?: string | null;
  wallet_address: string;
}

interface UserProfileContextType {
  userProfile: UserProfile | null;
  setUserProfile: React.Dispatch<React.SetStateAction<UserProfile | null>>;
  isLoading: boolean;
  loginUser: () => Promise<void>;
  handleDisconnect: () => void;
}

const UserProfileContext = createContext<UserProfileContextType | undefined>(
  undefined
);

export const UserProfileProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { publicKey, signMessage, disconnect, connected } = useWallet();
  const router = useRouter();

  const signAndSendMessage = async () => {
    const message = new TextEncoder().encode(
      "Please sign this message to authenticate"
    );
    const signature = await signMessage?.(message);
    const encodedSignature = signature
      ? Buffer.from(signature).toString("base64")
      : undefined;
    const encodedPublicKey = publicKey
      ? Buffer.from(publicKey.toBytes()).toString("base64")
      : undefined;

    return { publicKey: encodedPublicKey, signature: encodedSignature };
  };

  const loginUser = async () => {
    try {
      const { publicKey: encodedPublicKey, signature } =
        await signAndSendMessage();
      const response = await fetch("/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          publicKey: encodedPublicKey?.toString(),
          signature: signature,
          walletAddress: publicKey,
        }),
      });
      const data = await response.json();
      if (data.token) {
        localStorage.setItem("supabase_token", data.token);
      }
    } catch (error) {
      console.error("Error logging in:", error);
      disconnect();
    }
  };

  const fetchUserData = useCallback(async () => {
    setIsLoading(true);
    if (connected && publicKey) {
      let token = localStorage.getItem("supabase_token");
      let {
        data: { session },
        error,
      } = await supabase.auth.getSession();

      if (
        !token ||
        !session ||
        (session?.expires_at && session.expires_at * 1000 < Date.now())
      ) {
        await loginUser();
      }
      token = localStorage.getItem("supabase_token");
      if (token) {
        const { data, error } = await supabase.auth.setSession({
          access_token: token,
          refresh_token: token,
        });
        if (error) {
          console.error("Error setting Supabase session:", error);
          disconnect();
          return;
        }
        const {
          data: updatedUserProfile,
          error: updatedUserProfileError,
        }: { data: UserProfile | null; error: any } = await fetchProfileData();
        if (updatedUserProfileError) {
          console.error(
            "Error fetching user profile:",
            updatedUserProfileError
          );
          router.push("/dashboard");
        }
        setUserProfile(updatedUserProfile);
      } else {
        console.error("No token found after login attempt");
        disconnect();
        setUserProfile(null);
      }
    }
    setIsLoading(false);
  }, [connected]);

  useEffect(() => {
    fetchUserData();
  }, [fetchUserData]);

  const handleDisconnect = () => {
    localStorage.removeItem("supabase_token");
    disconnect();
    setUserProfile(null);
  };

  return (
    <UserProfileContext.Provider
      value={{
        userProfile,
        setUserProfile,
        isLoading,
        loginUser,
        handleDisconnect,
      }}
    >
      {children}
    </UserProfileContext.Provider>
  );
};

export const useUserProfile = () => {
  const context = useContext(UserProfileContext);
  if (context === undefined) {
    throw new Error("useUserProfile must be used within a UserProfileProvider");
  }
  return context;
};
