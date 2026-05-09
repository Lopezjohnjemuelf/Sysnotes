"use client";

import {
  createContext,
  type Dispatch,
  useContext,
  useMemo,
  useState,
  type ReactNode,
  type SetStateAction,
} from "react";
import type { AdminReleaseStatus } from "@/lib/releases/admin";

export type AdminPreviewRelease = {
  version: string;
  date: string;
  title: string;
  summary: string;
  body?: string;
  tags: string[];
  status: AdminReleaseStatus;
  shareToken?: string;
};

type AdminPreviewContextValue = {
  isPreviewVisible: boolean;
  previewRelease: AdminPreviewRelease | null;
  setIsPreviewVisible: Dispatch<SetStateAction<boolean>>;
  setPreviewRelease: (release: AdminPreviewRelease | null) => void;
};

const AdminPreviewContext = createContext<AdminPreviewContextValue | null>(null);

export function AdminPreviewProvider({ children }: { children: ReactNode }) {
  const [isPreviewVisible, setIsPreviewVisible] = useState(true);
  const [previewRelease, setPreviewRelease] =
    useState<AdminPreviewRelease | null>(null);

  const contextValue = useMemo(
    () => ({
      isPreviewVisible,
      previewRelease,
      setIsPreviewVisible,
      setPreviewRelease,
    }),
    [isPreviewVisible, previewRelease],
  );

  return (
    <AdminPreviewContext.Provider value={contextValue}>
      {children}
    </AdminPreviewContext.Provider>
  );
}

export function useAdminPreview() {
  const context = useContext(AdminPreviewContext);

  if (!context) {
    throw new Error("useAdminPreview must be used inside AdminPreviewProvider.");
  }

  return context;
}

export function useOptionalAdminPreview() {
  return useContext(AdminPreviewContext);
}
