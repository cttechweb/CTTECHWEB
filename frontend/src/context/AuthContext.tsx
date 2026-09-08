import React, { createContext, useContext, useEffect, useState } from "react";
import { 
  auth, 
  googleProvider, 
  signInWithPopup, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signOut, 
  onAuthStateChanged,
  sendPasswordResetEmail,
  sendEmailVerification,
  updateProfile as updateFirebaseProfile,
  getAdditionalUserInfo,
  FirebaseUser
} from "../lib/firebase";
import { UserProfile } from "../types";
import { apiClient } from "../services/apiClient";
import { sendEmailNotification } from "../services/emailService";

export type { UserProfile };

interface AuthContextType {
  user: FirebaseUser | null;
  profile: UserProfile | null;
  isLoading: boolean;
  isAdmin: boolean;
  isSales: boolean;
  isRetailer: boolean;
  loginWithEmail: (email: string, pass: string) => Promise<void>;
  signUpWithEmail: (email: string, pass: string, name: string) => Promise<void>;
  loginWithGoogle: () => Promise<void>;
  sendPasswordReset: (email: string) => Promise<void>;
  sendVerificationEmail: () => Promise<void>;
  logout: () => Promise<void>;
  refreshProfile: () => Promise<void>;
  updateCurrentProfile: (updates: Partial<UserProfile>) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

function mapBackendUserToProfile(rawUser: any): UserProfile {
  return {
    uid: rawUser.uid || rawUser.id,
    email: rawUser.email || "",
    name: rawUser.name || rawUser.email?.split("@")[0] || "Valued User",
    phone: rawUser.phone || undefined,
    address: rawUser.address || undefined,
    designation: rawUser.designation || undefined,
    defaultShippingAddress: rawUser.defaultShippingAddress || rawUser.default_shipping_address || undefined,
    billingAddress: rawUser.billingAddress || rawUser.billing_address || undefined,
    companyName: rawUser.companyName || rawUser.company_name || undefined,
    companyId: rawUser.companyId || rawUser.company_id || undefined,
    taxId: rawUser.taxId || rawUser.tax_id || undefined,
    role: rawUser.role || "customer",
    isVerifiedRetailer: rawUser.isVerifiedRetailer === true || rawUser.is_verified_retailer === 1,
    status: rawUser.status || "active",
    emailVerified: rawUser.emailVerified === true || rawUser.email_verified === 1,
    createdAt: rawUser.createdAt || rawUser.created_at,
    updatedAt: rawUser.updatedAt || rawUser.updated_at,
    lastLoginAt: rawUser.lastLoginAt || rawUser.last_login_at,
  };
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<FirebaseUser | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch or initialize user profile in Cloudflare D1 via Worker API
  const syncAndFetchD1Profile = async (displayName?: string): Promise<UserProfile | null> => {
    try {
      let res;
      if (displayName) {
        res = await apiClient.syncAuth(displayName);
      } else {
        res = await apiClient.getMe();
      }

      if (res?.user) {
        return mapBackendUserToProfile(res.user);
      } else if (res?.profile) {
        return mapBackendUserToProfile(res.profile);
      }
    } catch (err) {
      console.warn("[Auth] Profile synchronization with Cloudflare D1 deferred/notice:", err);
    }
    return null;
  };

  useEffect(() => {
    let isMounted = true;

    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (!isMounted) return;
      setUser(currentUser);

      if (currentUser) {
        // Immediate baseline profile to prevent loading freezes
        const fallbackProfile: UserProfile = {
          uid: currentUser.uid,
          email: currentUser.email || "",
          name: currentUser.displayName || currentUser.email?.split("@")[0] || "Valued User",
          role: "customer",
          isVerifiedRetailer: false,
          status: "active",
          emailVerified: currentUser.emailVerified,
        };

        if (isMounted) {
          setProfile((prev) => prev || fallbackProfile);
        }

        try {
          const d1Profile = await syncAndFetchD1Profile();
          if (isMounted && d1Profile) {
            setProfile(d1Profile);
          }
        } catch (err) {
          console.warn("[Auth] Background D1 profile fetch notice:", err);
        }
      } else {
        if (isMounted) setProfile(null);
      }

      if (isMounted) setIsLoading(false);
    });

    return () => {
      isMounted = false;
      unsubscribe();
    };
  }, []);

  const refreshProfile = async () => {
    if (auth.currentUser) {
      const d1Profile = await syncAndFetchD1Profile();
      if (d1Profile) {
        setProfile(d1Profile);
      }
    }
  };

  const updateCurrentProfile = async (updates: Partial<UserProfile>) => {
    if (!auth.currentUser) throw new Error("No authenticated user found.");

    const payload = {
      name: (updates.name ?? profile?.name ?? "").trim(),
      phone: updates.phone?.trim(),
      address: updates.address?.trim(),
      designation: updates.designation?.trim(),
      default_shipping_address: (updates.defaultShippingAddress ?? profile?.defaultShippingAddress)?.trim(),
      billing_address: (updates.billingAddress ?? profile?.billingAddress)?.trim(),
      company_name: (updates.companyName ?? profile?.companyName ?? "").trim(),
    };

    // 1. Update in Cloudflare D1 via Worker API
    const res = await apiClient.updateProfile(payload);

    // 2. Sync displayName in Firebase Auth if name was modified
    if (updates.name && updates.name.trim() && updates.name.trim() !== auth.currentUser.displayName) {
      try {
        await updateFirebaseProfile(auth.currentUser, { displayName: updates.name.trim() });
      } catch (authErr) {
        console.warn("[Auth] Failed to sync displayName in Firebase Auth:", authErr);
      }
    }

    if (res?.profile) {
      setProfile(mapBackendUserToProfile(res.profile));
    } else {
      setProfile((prev) =>
        prev
          ? { ...prev, ...updates }
          : ({ uid: auth.currentUser!.uid, email: auth.currentUser!.email || "", ...updates } as UserProfile)
      );
    }
  };

  const loginWithEmail = async (email: string, pass: string) => {
    const res = await signInWithEmailAndPassword(auth, email.trim(), pass);
    if (res.user) {
      setUser(res.user);
      setProfile((prev) => prev || {
        uid: res.user.uid,
        email: res.user.email || "",
        name: res.user.displayName || res.user.email?.split("@")[0] || "Valued User",
        role: "customer",
        isVerifiedRetailer: false,
        status: "active",
        emailVerified: res.user.emailVerified,
      });

      console.log("AUTH DEBUG:");
      console.log("Firebase authentication: SUCCESS");
      console.log("Firebase UID:", res.user.uid);
      console.log("Firebase email:", res.user.email);
      console.log("Provider:", res.user.providerData[0]?.providerId || "password");

      // D1 synchronization is secondary and non-blocking
      try {
        const prof = await syncAndFetchD1Profile();
        if (prof) {
          setProfile(prof);
          console.log("D1 PROFILE SYNC: Result: SUCCESS");
        } else {
          console.log("D1 PROFILE SYNC: Result: DEFERRED (fallback profile active)");
        }
      } catch (profileError) {
        console.warn("D1 PROFILE SYNC: Result: FAILED (non-blocking)", profileError);
      }

      // Dispatch real-time EmailJS notification for user login event
      sendEmailNotification({
        type: "auth_login",
        title: `User Login: ${email.trim()}`,
        senderName: res.user.displayName || email.split("@")[0],
        senderEmail: email.trim(),
        subject: `[Cool Technologies] User Login Notification - ${email.trim()}`,
        message: `A user has logged in to the Cool Technologies platform.`,
        detailsText: `User: ${res.user.displayName || email.split("@")[0]}\nEmail: ${email.trim()}\nAuth Method: Password Login\nTimestamp: ${new Date().toLocaleString("en-AE", { timeZone: "Asia/Dubai" })}\nUser UID: ${res.user.uid}`,
        customParams: {
          event_type: "user_login",
          user_uid: res.user.uid,
          auth_provider: "password"
        }
      }).catch((err) => console.warn("[Auth] Login email alert error:", err));
    }
  };

  const signUpWithEmail = async (email: string, pass: string, name: string) => {
    const res = await createUserWithEmailAndPassword(auth, email.trim(), pass);
    if (res.user) {
      setUser(res.user);
      setProfile((prev) => prev || {
        uid: res.user.uid,
        email: res.user.email || "",
        name: name.trim() || res.user.displayName || res.user.email?.split("@")[0] || "Valued User",
        role: "customer",
        isVerifiedRetailer: false,
        status: "active",
        emailVerified: res.user.emailVerified,
      });

      console.log("AUTH DEBUG:");
      console.log("Firebase authentication: SUCCESS");
      console.log("Firebase UID:", res.user.uid);
      console.log("Firebase email:", res.user.email);
      console.log("Provider: password");

      try {
        await updateFirebaseProfile(res.user, { displayName: name.trim() });
      } catch (pErr) {
        console.warn("[Auth] Firebase display name notice:", pErr);
      }

      // D1 synchronization is secondary and non-blocking
      try {
        const prof = await syncAndFetchD1Profile(name.trim());
        if (prof) {
          setProfile(prof);
          console.log("D1 PROFILE SYNC: Result: SUCCESS");
        } else {
          console.log("D1 PROFILE SYNC: Result: DEFERRED (fallback profile active)");
        }
      } catch (profileError) {
        console.warn("D1 PROFILE SYNC: Result: FAILED (non-blocking)", profileError);
      }

      // Dispatch real-time Brevo notification for new customer account creation
      try {
        await sendEmailNotification({
          type: "auth_signup",
          title: `New User Registration: ${name.trim() || email.trim()}`,
          senderName: name.trim() || email.split("@")[0],
          senderEmail: email.trim(),
          subject: `[Cool Technologies] New Account Registration - ${email.trim()}`,
          message: `A new customer account has been registered on the Cool Technologies website.`,
          detailsText: `User Full Name: ${name.trim() || "Not specified"}\nRegistered Email: ${email.trim()}\nAccount Type: Customer Account\nAuthentication Method: Email & Password\nTimestamp: ${new Date().toLocaleString("en-AE", { timeZone: "Asia/Dubai" })}\nUser UID: ${res.user.uid}`,
          customParams: {
            event_type: "account_signup",
            user_uid: res.user.uid,
            auth_provider: "password"
          }
        });
      } catch (err) {
        console.warn("[Auth] Signup email alert error:", err);
      }
    }
  };

  const dispatchGoogleAuthNotification = async (u: FirebaseUser, isNew: boolean) => {
    try {
      if (isNew) {
        await sendEmailNotification({
          type: "auth_signup",
          title: `New User Registration (Google): ${u.displayName || u.email || "Google Account"}`,
          senderName: u.displayName || u.email?.split("@")[0] || "Google User",
          senderEmail: u.email || "",
          subject: `[Cool Technologies] New Account Registration - ${u.email || "Google Account"}`,
          message: `A new customer account has been registered via Google Sign-In on the Cool Technologies website.`,
          detailsText: `User Full Name: ${u.displayName || "Google User"}\nRegistered Email: ${u.email || ""}\nAccount Type: Customer Account\nAuthentication Method: Google OAuth (New Registration)\nTimestamp: ${new Date().toLocaleString("en-AE", { timeZone: "Asia/Dubai" })}\nUser UID: ${u.uid}`,
          customParams: {
            event_type: "account_signup",
            user_uid: u.uid,
            auth_provider: "google.com"
          }
        });
        console.log("[Auth] ✓ New Google signup notification dispatched for:", u.email);
      } else {
        await sendEmailNotification({
          type: "auth_login",
          title: `Google Login: ${u.email || ""}`,
          senderName: u.displayName || u.email?.split("@")[0] || "Google User",
          senderEmail: u.email || "",
          subject: `[Cool Technologies] User Google Login Notification - ${u.email || "Google Account"}`,
          message: `User authenticated via Google Sign-In on Cool Technologies.`,
          detailsText: `User: ${u.displayName || "Google User"}\nEmail: ${u.email || ""}\nAuth Method: Google OAuth\nTimestamp: ${new Date().toLocaleString("en-AE", { timeZone: "Asia/Dubai" })}\nUser UID: ${u.uid}`,
          customParams: {
            event_type: "google_login",
            user_uid: u.uid,
            auth_provider: "google.com"
          }
        });
        console.log("[Auth] ✓ Google login notification dispatched for:", u.email);
      }
    } catch (err) {
      console.warn("[Auth] Google auth email error:", err);
    }
  };

  const checkIsNewUser = (resCredential: any, u: FirebaseUser): boolean => {
    try {
      if (resCredential) {
        const info = getAdditionalUserInfo(resCredential);
        if (info?.isNewUser) return true;
      }
    } catch (e) {}

    try {
      if (u?.metadata?.creationTime && u?.metadata?.lastSignInTime) {
        const created = new Date(u.metadata.creationTime).getTime();
        const signedIn = new Date(u.metadata.lastSignInTime).getTime();
        if (Math.abs(signedIn - created) < 45000) {
          return true;
        }
      }
    } catch (e) {}

    return false;
  };

  const loginWithGoogle = async () => {
    try {
      const res = await signInWithPopup(auth, googleProvider);
      if (res?.user) {
        const u = res.user;
        setUser(u);
        setProfile((prev) => prev || {
          uid: u.uid,
          email: u.email || "",
          name: u.displayName || u.email?.split("@")[0] || "Valued User",
          role: "customer",
          isVerifiedRetailer: false,
          status: "active",
          emailVerified: u.emailVerified,
        });

        // D1 synchronization is secondary and non-blocking
        try {
          const prof = await syncAndFetchD1Profile();
          if (prof) {
            setProfile(prof);
          }
        } catch (profileError) {
          console.warn("[Auth] D1 profile sync notice (non-blocking):", profileError);
        }

        const isNewUser = checkIsNewUser(res, u);
        await dispatchGoogleAuthNotification(u, isNewUser);
      }
    } catch (err: any) {
      // If Firebase Auth state already resolved the user despite popup COOP error
      if (auth.currentUser) {
        const u = auth.currentUser;
        setUser(u);
        setProfile((prev) => prev || {
          uid: u.uid,
          email: u.email || "",
          name: u.displayName || u.email?.split("@")[0] || "Valued User",
          role: "customer",
          isVerifiedRetailer: false,
          status: "active",
          emailVerified: u.emailVerified,
        });
        const isNewUser = checkIsNewUser(null, u);
        await dispatchGoogleAuthNotification(u, isNewUser);
        return;
      }
      throw err;
    }
  };

  const sendPasswordReset = async (email: string) => {
    await sendPasswordResetEmail(auth, email.trim());
  };

  const sendVerificationEmail = async () => {
    if (!auth.currentUser) throw new Error("No authenticated user active.");
    await sendEmailVerification(auth.currentUser);
  };

  const logout = async () => {
    await signOut(auth);
    setUser(null);
    setProfile(null);
  };

  const role = profile?.role || "customer";
  const isAdmin = role === "admin" || role === "superAdmin";
  const isSales = role === "sales" || isAdmin;
  const isRetailer = role === "retailer" || profile?.isVerifiedRetailer === true;

  return (
    <AuthContext.Provider
      value={{
        user,
        profile,
        isLoading,
        isAdmin,
        isSales,
        isRetailer,
        loginWithEmail,
        signUpWithEmail,
        loginWithGoogle,
        sendPasswordReset,
        sendVerificationEmail,
        logout,
        refreshProfile,
        updateCurrentProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
