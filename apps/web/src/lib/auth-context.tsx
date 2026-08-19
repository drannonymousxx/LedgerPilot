"use client";

import React, { createContext, useContext, useEffect, useState, useCallback } from "react";
import { Session } from "@supabase/supabase-js";
import { supabase } from "./supabase";
import { UserProfile, OrgMembership, Organization, InitialInviteRequest } from "./types";
import { api } from "./api";

const STORAGE_ACTIVE_ORG = "ledgerpilot_active_org_id";

interface AuthContextType {
  session: Session | null;
  token: string | null;
  user: UserProfile | null;
  memberships: OrgMembership[];
  activeOrg: Organization | null;
  hasOrg: boolean;
  loading: boolean;
  signInWithGoogle: () => Promise<void>;
  signOut: () => Promise<void>;
  createOrg: (name: string, password?: string, initialInvitations?: InitialInviteRequest[]) => Promise<OrgMembership>;
  joinOrg: (nameOrCode: string, password?: string, requestedRole?: string) => Promise<OrgMembership>;
  selectOrg: (orgId: string) => void;
  refreshAuth: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<UserProfile | null>(null);
  const [memberships, setMemberships] = useState<OrgMembership[]>([]);
  const [activeOrg, setActiveOrg] = useState<Organization | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  const token = session?.access_token || null;

  const syncBackendUser = useCallback(async (authToken: string) => {
    try {
      const authData = await api.getAuthMe(authToken);
      setUser(authData.user);
      setMemberships(authData.memberships);

      if (authData.memberships.length > 0) {
        const savedOrgId = typeof window !== "undefined" ? localStorage.getItem(STORAGE_ACTIVE_ORG) : null;
        let matched = authData.memberships.find((m) => m.organization_id === savedOrgId);
        if (!matched) {
          matched = authData.memberships[0];
        }

        const selected: Organization = {
          id: matched.organization_id,
          name: matched.organization_name,
          invite_code: matched.invite_code,
          has_password: matched.has_password,
          role: matched.role,
        };
        setActiveOrg(selected);
        if (typeof window !== "undefined") {
          localStorage.setItem(STORAGE_ACTIVE_ORG, selected.id);
        }
      } else {
        setActiveOrg(null);
      }
    } catch (err: any) {
      console.error("Failed to sync authenticated backend user profile:", err);
      setActiveOrg(null);
    }
  }, []);

  useEffect(() => {
    // 1. Fetch initial session
    supabase.auth.getSession().then(({ data: { session: initSession } }) => {
      setSession(initSession);
      if (initSession?.access_token) {
        syncBackendUser(initSession.access_token).finally(() => setLoading(false));
      } else {
        setLoading(false);
      }
    });

    // 2. Listen for auth state changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (_event, newSession) => {
      setSession(newSession);
      if (newSession?.access_token) {
        setLoading(true);
        await syncBackendUser(newSession.access_token);
        setLoading(false);
      } else {
        setUser(null);
        setMemberships([]);
        setActiveOrg(null);
        setLoading(false);
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [syncBackendUser]);

  const signInWithGoogle = async () => {
    const redirectUrl =
      typeof window !== "undefined"
        ? `${window.location.origin}/auth`
        : "http://localhost:3000/auth";

    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: redirectUrl,
      },
    });

    if (error) {
      console.error("Google OAuth Sign-In Error:", error.message);
      throw error;
    }
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    if (typeof window !== "undefined") {
      localStorage.removeItem(STORAGE_ACTIVE_ORG);
    }
    setUser(null);
    setMemberships([]);
    setActiveOrg(null);
  };

  const createOrg = async (
    name: string,
    password?: string,
    initialInvitations?: InitialInviteRequest[]
  ): Promise<OrgMembership> => {
    if (!token) throw new Error("Authentication required");
    const newMembership = await api.createOrgAuth(token, name, password, initialInvitations);
    setMemberships((prev) => [newMembership, ...prev]);

    const newOrg: Organization = {
      id: newMembership.organization_id,
      name: newMembership.organization_name,
      invite_code: newMembership.invite_code,
      has_password: newMembership.has_password,
      role: newMembership.role,
    };
    setActiveOrg(newOrg);
    if (typeof window !== "undefined") {
      localStorage.setItem(STORAGE_ACTIVE_ORG, newOrg.id);
    }
    return newMembership;
  };

  const joinOrg = async (
    nameOrCode: string,
    password?: string,
    requestedRole?: string
  ): Promise<OrgMembership> => {
    if (!token) throw new Error("Authentication required");
    const newMembership = await api.joinOrgAuth(token, nameOrCode, password, requestedRole);
    setMemberships((prev) => [newMembership, ...prev.filter((m) => m.id !== newMembership.id)]);

    const newOrg: Organization = {
      id: newMembership.organization_id,
      name: newMembership.organization_name,
      invite_code: newMembership.invite_code,
      has_password: newMembership.has_password,
      role: newMembership.role,
    };
    setActiveOrg(newOrg);
    if (typeof window !== "undefined") {
      localStorage.setItem(STORAGE_ACTIVE_ORG, newOrg.id);
    }
    return newMembership;
  };

  const selectOrg = (orgId: string) => {
    const found = memberships.find((m) => m.organization_id === orgId);
    if (found) {
      const selected: Organization = {
        id: found.organization_id,
        name: found.organization_name,
        invite_code: found.invite_code,
        has_password: found.has_password,
        role: found.role,
      };
      setActiveOrg(selected);
      if (typeof window !== "undefined") {
        localStorage.setItem(STORAGE_ACTIVE_ORG, selected.id);
      }
    }
  };

  const refreshAuth = async () => {
    if (token) {
      await syncBackendUser(token);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        session,
        token,
        user,
        memberships,
        activeOrg,
        hasOrg: memberships.length > 0,
        loading,
        signInWithGoogle,
        signOut,
        createOrg,
        joinOrg,
        selectOrg,
        refreshAuth,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
