"use client";

import React, { createContext, useContext, useEffect, useState, useCallback } from "react";
import { Organization, Category } from "./types";
import { api } from "./api";

const STORAGE_KEY = "ledgerpilot_active_org_id";

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
  const [activeOrg, setActiveOrg] = useState<Organization | null>(null);
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchCategoriesForOrg = useCallback(async (orgId: string) => {
    try {
      const cats = await api.getCategories(orgId);
      setCategories(cats);
    } catch (err: any) {
      console.error("Failed to load categories:", err);
    }
  }, []);

  const bootstrapOrg = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const orgList = await api.getOrganizations();
      setOrganizations(orgList);

      const savedOrgId = typeof window !== "undefined" ? localStorage.getItem(STORAGE_KEY) : null;
      let targetOrg: Organization | null = null;

      if (savedOrgId) {
        targetOrg = orgList.find((o) => o.id === savedOrgId) || null;
      }

      if (!targetOrg) {
        if (orgList.length > 0) {
          targetOrg = orgList[0];
        } else {
          // List-first-then-create pattern: only create if DB has 0 orgs
          targetOrg = await api.createOrganization("LedgerPilot Demo Org");
          setOrganizations([targetOrg]);
        }

        if (typeof window !== "undefined" && targetOrg) {
          localStorage.setItem(STORAGE_KEY, targetOrg.id);
        }
      }

      setActiveOrg(targetOrg);
      if (targetOrg) {
        await fetchCategoriesForOrg(targetOrg.id);
      }
    } catch (err: any) {
      setError(err.message || "Failed to initialize organization context");
    } finally {
      setLoading(false);
    }
  }, [fetchCategoriesForOrg]);

  useEffect(() => {
    bootstrapOrg();
  }, [bootstrapOrg]);

  const selectOrganization = (orgId: string) => {
    const selected = organizations.find((o) => o.id === orgId);
    if (selected) {
      setActiveOrg(selected);
      if (typeof window !== "undefined") {
        localStorage.setItem(STORAGE_KEY, selected.id);
      }
      fetchCategoriesForOrg(selected.id);
    }
  };

  const refreshCategories = async () => {
    if (activeOrg) {
      await fetchCategoriesForOrg(activeOrg.id);
    }
  };

  const createOrg = async (name: string): Promise<Organization> => {
    const newOrg = await api.createOrganization(name);
    setOrganizations((prev) => [newOrg, ...prev]);
    selectOrganization(newOrg.id);
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
