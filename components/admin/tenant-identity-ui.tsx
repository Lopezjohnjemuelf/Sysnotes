"use client";

import type { CSSProperties, ReactNode } from "react";
import { useEffect, useState } from "react";
import { getTenantTheme } from "@/components/tenant/tenant-theme";
import { DEFAULT_TENANT_IDENTITY } from "@/lib/tenant/identity";
import { getTenantService } from "@/lib/tenant/persistence";
import type { TenantIdentity } from "@/lib/types";

export const TENANT_IDENTITY_CHANGE_EVENT = "sysnotes:tenant-identity-change";

export function useTenantIdentity() {
  const [identity, setIdentity] = useState(DEFAULT_TENANT_IDENTITY);

  useEffect(() => {
    let isMounted = true;

    async function refreshIdentity() {
      const storedIdentity = await getTenantService().load();

      if (isMounted) {
        setIdentity(storedIdentity ?? DEFAULT_TENANT_IDENTITY);
      }
    }

    void refreshIdentity();
    window.addEventListener("storage", refreshIdentity);
    window.addEventListener(TENANT_IDENTITY_CHANGE_EVENT, refreshIdentity);

    return () => {
      isMounted = false;
      window.removeEventListener("storage", refreshIdentity);
      window.removeEventListener(TENANT_IDENTITY_CHANGE_EVENT, refreshIdentity);
    };
  }, []);

  return identity;
}

export function getTenantIdentityStyle(identity: TenantIdentity) {
  const tenantTheme = getTenantTheme(identity);

  return {
    "--tenant-accent-bg": tenantTheme.accentBg,
    "--tenant-accent-text": tenantTheme.accentText,
    fontFamily: tenantTheme.font,
  } as CSSProperties;
}

export function TenantIdentityScope({ children }: { children: ReactNode }) {
  const identity = useTenantIdentity();

  return <div style={getTenantIdentityStyle(identity)}>{children}</div>;
}

export function SysnotesWordmark() {
  return (
    <>
      <span className="font-semibold">Sysnotes</span>{" "}
      <span className="text-[0.85em] font-normal text-[var(--text-muted-4)]">
        by JFL
      </span>
    </>
  );
}

export function TenantWordmark() {
  return <SysnotesWordmark />;
}
