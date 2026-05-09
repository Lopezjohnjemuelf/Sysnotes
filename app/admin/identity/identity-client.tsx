"use client";

import { useEffect, useState } from "react";
import {
  BrandIdentityForm,
  DEFAULT_TENANT_IDENTITY,
  TENANT_IDENTITY_CHANGE_EVENT,
} from "@/components/admin";
import { ErrorStateCard, InlineErrorBanner } from "@/components/admin/state";
import { shouldUseTenantApi } from "@/lib/persistence/errors";
import { TENANT_IDENTITY_STORAGE_KEY } from "@/lib/tenant/identity";
import { getTenantService } from "@/lib/tenant/persistence";
import type { TenantIdentity } from "@/lib/types";

type IdentityLoadState =
  | "loading"
  | "ready"
  | "failed"
  | "storage-unavailable"
  | "corrupt";

function refreshPage() {
  window.location.reload();
}

function isInvalidJson(value: string | null) {
  if (value === null) {
    return false;
  }

  try {
    JSON.parse(value);
    return false;
  } catch (err) {
    console.warn(err);
    return true;
  }
}

export function IdentityClient() {
  const [identity, setIdentity] = useState(DEFAULT_TENANT_IDENTITY);
  const [loadState, setLoadState] = useState<IdentityLoadState>("loading");
  const [isTenantMissing, setIsTenantMissing] = useState(false);
  const [isOffline, setIsOffline] = useState(false);
  const useTenantApi = shouldUseTenantApi();

  useEffect(() => {
    let isMounted = true;

    async function loadIdentity() {
      try {
        const storedValue = useTenantApi
          ? null
          : window.localStorage.getItem(TENANT_IDENTITY_STORAGE_KEY);

        if (isInvalidJson(storedValue)) {
          if (isMounted) {
            setLoadState("corrupt");
          }
          return;
        }

        const storedIdentity = await getTenantService().load();

        if (!isMounted) {
          return;
        }

        setIdentity(storedIdentity ?? DEFAULT_TENANT_IDENTITY);
        setIsTenantMissing(storedIdentity === null);
        setLoadState("ready");
      } catch (err) {
        console.warn(err);

        if (!isMounted) {
          return;
        }

        setLoadState(
          err instanceof DOMException ? "storage-unavailable" : "failed",
        );
      }
    }

    void loadIdentity();

    return () => {
      isMounted = false;
    };
  }, [useTenantApi]);

  useEffect(() => {
    function syncOnlineState() {
      setIsOffline(navigator.onLine === false);
    }

    syncOnlineState();
    window.addEventListener("online", syncOnlineState);
    window.addEventListener("offline", syncOnlineState);

    return () => {
      window.removeEventListener("online", syncOnlineState);
      window.removeEventListener("offline", syncOnlineState);
    };
  }, []);

  async function saveIdentity(nextIdentity: TenantIdentity) {
    await getTenantService().save(nextIdentity);
    setIdentity(nextIdentity);
    setIsTenantMissing(false);
    window.dispatchEvent(new Event(TENANT_IDENTITY_CHANGE_EVENT));
  }

  function resetCorruptedIdentity() {
    window.localStorage.removeItem(TENANT_IDENTITY_STORAGE_KEY);
    setIdentity(DEFAULT_TENANT_IDENTITY);
    setIsTenantMissing(true);
    setLoadState("ready");
  }

  if (loadState === "loading") {
    return (
      <div className="border border-[var(--admin-preview-border)] bg-[var(--surface-card)] p-6 text-sm text-[var(--text-muted-4)]">
        Loading identity settings...
      </div>
    );
  }

  if (loadState === "storage-unavailable") {
    return (
      <ErrorStateCard
        eyebrow="Local data unavailable"
        description="Sysnotes could not read tenant identity data from this browser. Enable local storage for the site, then refresh the admin portal."
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
        title="Tenant identity could not be loaded"
      />
    );
  }

  if (loadState === "corrupt") {
    return (
      <ErrorStateCard
        eyebrow="Local data fallback"
        description="Saved tenant identity data in this browser is not readable. Reset only the local identity data to continue configuring this tenant."
        icon="ti-database-exclamation"
        primaryAction={{
          icon: "ti-refresh",
          label: "Reset local data",
          onClick: resetCorruptedIdentity,
          variant: "destructive",
        }}
        secondaryAction={{
          icon: "ti-reload",
          label: "Refresh page",
          onClick: refreshPage,
        }}
        title="Tenant identity storage looks corrupted"
      />
    );
  }

  if (loadState === "failed") {
    return (
      <ErrorStateCard
        eyebrow="Failed load"
        description="The tenant identity form could not be loaded. Retry the page or return to releases."
        icon="ti-cloud-off"
        primaryAction={{
          icon: "ti-refresh",
          label: "Retry",
          onClick: refreshPage,
        }}
        secondaryAction={{
          href: "/admin/releases",
          icon: "ti-notes",
          label: "Back to releases",
        }}
        title="Identity settings could not be loaded"
      />
    );
  }

  return (
    <div className="grid gap-6">
      {isOffline ? (
        <InlineErrorBanner
          description="You appear to be offline. Local identity edits may still work, but network-backed saves and refreshes can fail until the connection returns."
          icon="ti-wifi-off"
          primaryAction={{
            icon: "ti-refresh",
            label: "Retry",
            onClick: refreshPage,
          }}
          secondaryAction={{
            href: "/admin/releases",
            icon: "ti-layout-dashboard",
            label: "Go to dashboard",
          }}
          title="Network connection is offline"
        />
      ) : null}

      {isTenantMissing ? (
        <InlineErrorBanner
          description="No tenant identity is saved in this browser yet. Save the default identity or adjust the form below before publishing releases."
          icon="ti-palette"
          primaryAction={{
            icon: "ti-device-floppy",
            label: "Configure tenant identity",
            onClick: () => void saveIdentity(DEFAULT_TENANT_IDENTITY),
          }}
          secondaryAction={{
            href: "/admin/releases",
            icon: "ti-notes",
            label: "Back to releases",
          }}
          title="Tenant identity is not configured"
        />
      ) : null}

      <BrandIdentityForm
        initialIdentity={identity}
        onSave={saveIdentity}
        showHeader={false}
      />
    </div>
  );
}
