"use client";

import { signOut } from "next-auth/react";
import { useEffect, useState } from "react";
import {
  DestructiveSettingRow,
  InlineErrorBanner,
  SettingRow,
  SettingsSection,
} from "@/components/admin";
import {
  ADMIN_SETTINGS_STORAGE_KEY,
  DEFAULT_ADMIN_SETTINGS,
  RELEASES_PER_PAGE_OPTIONS,
  type AdminSettings,
  parseStoredAdminSettings,
} from "@/lib/admin/settings";
import { RELEASES_STORAGE_KEY } from "@/lib/releases/persistence";
import { TENANT_IDENTITY_STORAGE_KEY } from "@/lib/tenant/identity";

const AUTH_SESSION_RESET_KEY = "sysnotes:auth-session";
const WELCOME_MODAL_KEY = "sysnotes:admin-welcome:v1";

type StorageStatus = "checking" | "available" | "unavailable";

function refreshPage() {
  window.location.reload();
}

function getStorageCount(key: string) {
  try {
    const value = window.localStorage.getItem(key);

    if (!value) {
      return 0;
    }

    const parsed = JSON.parse(value);

    return Array.isArray(parsed) ? parsed.length : 1;
  } catch (err) {
    console.warn(err);
    return null;
  }
}

export default function AdminSettingsPage() {
  const [storageStatus, setStorageStatus] =
    useState<StorageStatus>("checking");
  const [settings, setSettings] = useState<AdminSettings>(
    DEFAULT_ADMIN_SETTINGS,
  );
  const [draftSettings, setDraftSettings] = useState<AdminSettings>(
    DEFAULT_ADMIN_SETTINGS,
  );
  const [isEditing, setIsEditing] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [releaseCount, setReleaseCount] = useState<number | null>(0);
  const [hasIdentity, setHasIdentity] = useState(false);
  const [hasWelcomeFlag, setHasWelcomeFlag] = useState(false);
  const [confirmingReset, setConfirmingReset] = useState<string | null>(null);

  function syncStorageState() {
    try {
      const testKey = "sysnotes:admin-storage-check";
      window.localStorage.setItem(testKey, "ok");
      window.localStorage.removeItem(testKey);
      setStorageStatus("available");
      const storedSettings = parseStoredAdminSettings(
        window.localStorage.getItem(ADMIN_SETTINGS_STORAGE_KEY),
      );
      setSettings(storedSettings);
      setDraftSettings(storedSettings);
      setReleaseCount(getStorageCount(RELEASES_STORAGE_KEY));
      setHasIdentity(
        window.localStorage.getItem(TENANT_IDENTITY_STORAGE_KEY) !== null,
      );
      setHasWelcomeFlag(window.localStorage.getItem(WELCOME_MODAL_KEY) !== null);
    } catch (err) {
      console.warn(err);
      setStorageStatus("unavailable");
    }
  }

  useEffect(() => {
    syncStorageState();
  }, []);

  function resetKey(key: string) {
    window.localStorage.removeItem(key);
    setConfirmingReset(null);
    syncStorageState();
  }

  function saveSettings() {
    const nextSettings = {
      workspaceLabel:
        draftSettings.workspaceLabel.trim() ||
        DEFAULT_ADMIN_SETTINGS.workspaceLabel,
      releasesPerPage: draftSettings.releasesPerPage,
    };

    window.localStorage.setItem(
      ADMIN_SETTINGS_STORAGE_KEY,
      JSON.stringify(nextSettings),
    );
    setSettings(nextSettings);
    setDraftSettings(nextSettings);
    setIsEditing(false);
    setIsSaved(true);
    window.dispatchEvent(new Event("sysnotes:admin-settings-change"));
    window.setTimeout(() => setIsSaved(false), 2000);
  }

  function cancelEditing() {
    setDraftSettings(settings);
    setIsEditing(false);
  }

  function resetAdminSession() {
    window.localStorage.removeItem(WELCOME_MODAL_KEY);
    void signOut({ callbackUrl: "/login" });
  }

  const storageSummary =
    storageStatus === "checking"
      ? "Checking browser storage..."
      : storageStatus === "available"
        ? "Browser storage is available for this admin session."
        : "Browser storage is unavailable in this browser.";

  return (
    <section className="mx-auto max-w-5xl">
      <header className="mx-auto mb-8 max-w-2xl border-b border-[var(--border-light)] pb-6 text-center">
        <p className="text-sm font-medium uppercase tracking-[0.18em] text-[var(--text-muted-1)]">
          Admin Portal
        </p>
        <h1 className="mt-3 text-4xl font-semibold tracking-normal">
          Settings
        </h1>
        <p className="mt-4 text-base leading-7 text-[var(--text-muted-4)]">
          Manage admin-only preferences and local workspace data for this
          browser.
        </p>
      </header>

      <div className="mx-auto grid max-w-4xl gap-6">
        {storageStatus === "unavailable" ? (
          <InlineErrorBanner
            description="Admin settings rely on local browser storage. Enable storage for this site, then refresh the page."
            icon="ti-database-off"
            primaryAction={{
              icon: "ti-refresh",
              label: "Refresh page",
              onClick: refreshPage,
            }}
            secondaryAction={{
              href: "/admin/releases",
              icon: "ti-notes",
              label: "Back to releases",
            }}
            title="Local storage is unavailable"
          />
        ) : null}

        <SettingsSection
          action={
            isEditing
              ? {
                  label: "Cancel",
                  onClick: cancelEditing,
                }
              : {
                  label: "Edit",
                  onClick: () => setIsEditing(true),
                  variant: "primary",
                }
          }
          description="Edit admin-only preferences for this browser session."
          title="Workspace preferences"
        >
          <SettingRow
            action={
              isEditing
                ? {
                    label: "Save",
                    onClick: saveSettings,
                    variant: "primary",
                  }
                : undefined
            }
            description="Shown in the admin footer and useful when multiple local workspaces are open."
            title="Workspace label"
          >
            {isEditing ? (
              <input
                className="w-full max-w-sm rounded-md border border-[var(--admin-input-border)] bg-[var(--surface-card)] px-3 py-2 text-sm text-[var(--text-primary)] outline-none transition focus:border-[var(--admin-input-focus)]"
                onChange={(event) =>
                  setDraftSettings((currentSettings) => ({
                    ...currentSettings,
                    workspaceLabel: event.target.value,
                  }))
                }
                value={draftSettings.workspaceLabel}
              />
            ) : (
              <p className="text-sm font-medium text-[var(--text-primary)]">
                {settings.workspaceLabel}
              </p>
            )}
          </SettingRow>
          <SettingRow
            description="Controls how many releases appear per page in the admin releases table."
            title="Releases per page"
          >
            {isEditing ? (
              <select
                className="w-full max-w-[12rem] rounded-md border border-[var(--admin-input-border)] bg-[var(--surface-card)] px-3 py-2 text-sm text-[var(--text-primary)] outline-none transition focus:border-[var(--admin-input-focus)]"
                onChange={(event) =>
                  setDraftSettings((currentSettings) => ({
                    ...currentSettings,
                    releasesPerPage: Number(event.target.value),
                  }))
                }
                value={draftSettings.releasesPerPage}
              >
                {RELEASES_PER_PAGE_OPTIONS.map((option) => (
                  <option key={option} value={option}>
                    {option} releases
                  </option>
                ))}
              </select>
            ) : (
              <p className="text-sm font-medium text-[var(--text-primary)]">
                {settings.releasesPerPage} releases
              </p>
            )}
            {isSaved ? (
              <p className="mt-2 text-xs font-medium text-[var(--text-muted-5)]">
                Settings saved.
              </p>
            ) : null}
          </SettingRow>
        </SettingsSection>

        <SettingsSection
          description="Quick links for the admin surfaces that affect the tenant changelog."
          title="Workspace"
        >
          <SettingRow
            action={{
              href: "/admin/identity",
              label: "Open identity",
              variant: "primary",
            }}
            description="Update tenant brand, slug, colors, typography, and preview defaults."
            title="Tenant identity"
          />
          <SettingRow
            action={{ href: "/admin/releases", label: "Open releases" }}
            description="Create, edit, publish, draft, and delete admin release notes."
            title="Release management"
          />
        </SettingsSection>

        <SettingsSection
          description="Read-only status for admin data saved in this browser."
          title="Local data"
        >
          <SettingRow
            description={storageSummary}
            title="Storage status"
          >
            <div className="flex flex-wrap gap-2 text-xs text-[var(--text-muted-5)]">
              <span className="rounded-full bg-[var(--tag-bg)] px-2.5 py-1">
                Releases: {releaseCount === null ? "Unreadable" : releaseCount}
              </span>
              <span className="rounded-full bg-[var(--tag-bg)] px-2.5 py-1">
                Identity: {hasIdentity ? "Configured" : "Not configured"}
              </span>
              <span className="rounded-full bg-[var(--tag-bg)] px-2.5 py-1">
                Welcome modal: {hasWelcomeFlag ? "Tracked" : "Not tracked"}
              </span>
            </div>
          </SettingRow>
          <SettingRow
            action={{ label: "Refresh status", onClick: syncStorageState }}
            description="Re-check local admin data after another tab or browser tool changes storage."
            title="Refresh local data status"
          />
        </SettingsSection>

        <SettingsSection
          description="These actions affect only admin data in this browser."
          title="Reset"
        >
          <DestructiveSettingRow
            action={{
              disabled: storageStatus !== "available",
              label:
                confirmingReset === RELEASES_STORAGE_KEY
                  ? "Confirm reset"
                  : "Reset releases",
              onClick: () =>
                confirmingReset === RELEASES_STORAGE_KEY
                  ? resetKey(RELEASES_STORAGE_KEY)
                  : setConfirmingReset(RELEASES_STORAGE_KEY),
            }}
            description="Remove only locally saved admin releases. Tenant identity and sign-in state stay untouched."
            title="Reset release data"
          />
          <DestructiveSettingRow
            action={{
              disabled: storageStatus !== "available",
              label:
                confirmingReset === TENANT_IDENTITY_STORAGE_KEY
                  ? "Confirm reset"
                  : "Reset identity",
              onClick: () =>
                confirmingReset === TENANT_IDENTITY_STORAGE_KEY
                  ? resetKey(TENANT_IDENTITY_STORAGE_KEY)
                  : setConfirmingReset(TENANT_IDENTITY_STORAGE_KEY),
            }}
            description="Remove only the locally saved tenant identity. The identity page will return to default values."
            title="Reset tenant identity"
          />
          <DestructiveSettingRow
            action={{
              disabled: storageStatus !== "available",
              label:
                confirmingReset === AUTH_SESSION_RESET_KEY
                  ? "Confirm sign out"
                  : "Clear admin session",
              onClick: () =>
                confirmingReset === AUTH_SESSION_RESET_KEY
                  ? resetAdminSession()
                  : setConfirmingReset(AUTH_SESSION_RESET_KEY),
            }}
            description="Clear the admin session and welcome flag, then return to the login page."
            title="Clear admin session"
          />
        </SettingsSection>
      </div>
    </section>
  );
}
