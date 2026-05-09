"use client";

import { useEffect, useState } from "react";
import {
  ADMIN_SETTINGS_STORAGE_KEY,
  DEFAULT_ADMIN_SETTINGS,
  parseStoredAdminSettings,
} from "@/lib/admin/settings";

export function AdminFooter() {
  const [workspaceLabel, setWorkspaceLabel] = useState(
    DEFAULT_ADMIN_SETTINGS.workspaceLabel,
  );

  useEffect(() => {
    function syncSettings() {
      setWorkspaceLabel(
        parseStoredAdminSettings(
          window.localStorage.getItem(ADMIN_SETTINGS_STORAGE_KEY),
        ).workspaceLabel,
      );
    }

    syncSettings();
    window.addEventListener("storage", syncSettings);
    window.addEventListener("sysnotes:admin-settings-change", syncSettings);

    return () => {
      window.removeEventListener("storage", syncSettings);
      window.removeEventListener("sysnotes:admin-settings-change", syncSettings);
    };
  }, []);

  return (
    <footer className="mt-10 border-t border-[var(--border-subtle)] px-1 py-5 text-xs text-[var(--text-muted-4)]">
      <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
        <p>
          <span className="font-semibold text-[var(--text-muted-5)]">
            {workspaceLabel}
          </span>{" "}
          · Admin portal
        </p>
        <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
          <a
            className="transition hover:text-[var(--text-primary)]"
            href="/admin/releases"
          >
            Releases
          </a>
          <a
            className="transition hover:text-[var(--text-primary)]"
            href="/admin/identity"
          >
            Identity
          </a>
          <a
            className="transition hover:text-[var(--text-primary)]"
            href="/admin/settings"
          >
            Settings
          </a>
        </div>
      </div>
    </footer>
  );
}
