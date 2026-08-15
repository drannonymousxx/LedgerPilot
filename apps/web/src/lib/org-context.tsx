"use client";

import React, { createContext, useContext, useEffect, useState, useCallback } from "react";
import { Organization, Category } from "./types";
import { api } from "./api";
import { useAuth } from "./auth-context";

interface OrgContextType {
  activeOrg: Organization | null;
  organizations: Organization[];
  categories: Category[];
  loading: boolean;
  error: string | null;
  selectOrganization: (orgId: string) => void;
  refreshCategories: () => Promise<void>;
  createOrg: (name: string) => Promise<Organization>;
}

const OrgContext = createContext<OrgContextType | undefined>(undefined);

export function OrganizationProvider({ children }: { children: React.ReactNode }) {
  const { activeOrg, memberships, token, selectOrg, createOrg: createOrgAuth, loading: authLoading } = useAuth();
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const organizations: Organization[] = memberships.map((m) => ({
    id: m.organization_id,
    name: m.organization_name,
    invite_code: m.invite_code,
    role: m.role,
  }));

  const fetchCategoriesForOrg = useCallback(
    async (orgId: string, authToken?: string | null) => {
      try {
        const cats = await api.getCategories(orgId, authToken);
        setCategories(cats);
      } catch (err: any) {
        console.error("Failed to load categories for active org:", err);
      }
    },
    []
  );

  useEffect(() => {
    if (activeOrg) {
      setLoading(true);
      fetchCategoriesForOrg(activeOrg.id, token).finally(() => setLoading(false));
    } else {
      setCategories([]);
      setLoading(authLoading);
    }
  }, [activeOrg, token, authLoading, fetchCategoriesForOrg]);

  const selectOrganization = (orgId: string) => {
    selectOrg(orgId);
  };

  const refreshCategories = async () => {
    if (activeOrg) {
      await fetchCategoriesForOrg(activeOrg.id, token);
    }
  };

  const createOrg = async (name: string): Promise<Organization> => {
    const mem = await createOrgAuth(name);
    const newOrg: Organization = {
      id: mem.organization_id,
      name: mem.organization_name,
      invite_code: mem.invite_code,
      role: mem.role,
    };
    return newOrg;
  };

  return (
    <OrgContext.Provider
      value={{
        activeOrg,
        organizations,
        categories,
        loading,
        error,
        selectOrganization,
        refreshCategories,
        createOrg,
      }}
    >
      {children}
    </OrgContext.Provider>
  );
}

export function useOrg(): OrgContextType {
  const context = useContext(OrgContext);
  if (!context) {
    throw new Error("useOrg must be used within an OrganizationProvider");
  }
  return context;
}
