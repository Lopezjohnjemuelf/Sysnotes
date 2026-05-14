"use client";

import { useEffect, useState } from "react";
import {
  BrandIdentityForm,
  DEFAULT_TENANT_IDENTITY,
  TENANT_IDENTITY_CHANGE_EVENT,
} from "@/components/admin";
import { ErrorStateCard, InlineErrorBanner } from "@/components/admin/state";
import { getTenantService } from "@/lib/tenant/persistence";
import type { TenantIdentity } from "@/lib/types";

type IdentityLoadState = "loading" | "ready" | "failed";

function refreshPage() {
  window.location.reload();
}

export function IdentityClient() {
  const [identity, setIdentity] = useState(DEFAULT_TENANT_IDENTITY);
  const [loadState, setLoadState] = useState<IdentityLoadState>("loading");
  const [isTenantMissing, setIsTenantMissing] = useState(false);
  const [isOffline, setIsOffline] = useState(false);

  useEffect(() => {
    let isMounted = true;

    async function loadIdentity() {
      try {
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

        setLoadState("failed");
      }
    }

    void loadIdentity();

    return () => {
      isMounted = false;
    };
  }, []);

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

  if (loadState === "loading") {
    return (
      <div className="border border-[var(--admin-preview-border)] bg-[var(--surface-card)] p-6 text-sm text-[var(--text-muted-4)]">
        Loading identity settings...
      </div>
    );
  }

  if (loadState === "failed") {
    return (
      <ErrorStateCard
        eyebrow="Failed load"
        description="The tenant identity form could not be loaded. Retry the page or return to releases."
        icon="settings"
        primaryAction={{
          icon: "settings",
          label: "Retry",
          onClick: refreshPage,
        }}
        secondaryAction={{
          href: "/admin/releases",
          icon: "release",
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
          description="You appear to be offline. Identity saves and refreshes can fail until the connection returns."
          icon="settings"
          primaryAction={{
            icon: "settings",
            label: "Retry",
            onClick: refreshPage,
          }}
          secondaryAction={{
            href: "/admin/releases",
            icon: "dashboard",
            label: "Go to dashboard",
          }}
          title="Network connection is offline"
        />
      ) : null}

      {isTenantMissing ? (
        <InlineErrorBanner
          description="No tenant identity is saved for this tenant yet. Save the default identity or adjust the form below before publishing releases."
          icon="identity"
          primaryAction={{
            icon: "identity",
            label: "Configure tenant identity",
            onClick: () => void saveIdentity(DEFAULT_TENANT_IDENTITY),
          }}
          secondaryAction={{
            href: "/admin/releases",
            icon: "release",
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
