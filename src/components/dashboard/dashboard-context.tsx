"use client";

import { createContext, useContext } from "react";
import type { OwnerProfile, Tenant } from "@/lib/dashboard/types";

type DashboardState = {
  profile: OwnerProfile | null;
  tenant: Tenant | null;
  error: string | null;
  locked: boolean;
};

export const DashboardContext = createContext<DashboardState>({
  profile: null,
  tenant: null,
  error: null,
  locked: false,
});

export function useDashboard() {
  return useContext(DashboardContext);
}
