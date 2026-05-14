"use client";

import type { ReactNode } from "react";
import { createContext, useContext, useEffect } from "react";
import { TenantFooter, TenantHeader, getTenantTheme } from "@/components/tenant";
import type { TenantIdentity } from "@/lib/types";

type TenantLayoutProps = {
  children: ReactNode;
  identity: TenantIdentity;
};

const TenantContext = createContext<TenantIdentity | null>(null);

export function useTenantContext() {
  const identity = useContext(TenantContext);

  if (!identity) {
    throw new Error("useTenantContext must be used inside TenantLayoutClient.");
  }

  return identity;
}

export function TenantLayoutClient({ children, identity }: TenantLayoutProps) {
  const tenantTheme = getTenantTheme(identity);

  useEffect(() => {
    document.documentElement.classList.toggle("dark", tenantTheme.isDark);
    document.body.style.fontFamily = "var(--tenant-font)";
  }, [tenantTheme.isDark]);

  return (
    <>
      <style
        dangerouslySetInnerHTML={{
          __html: `:root {
  --tenant-accent-bg: ${tenantTheme.accentBg};
  --tenant-accent-text: ${tenantTheme.accentText};
  --tenant-font: ${tenantTheme.font};
}`,
        }}
      />
      <TenantContext.Provider value={identity}>
        <div style={{ fontFamily: "var(--tenant-font)" }}>
          <TenantHeader identity={identity} />
          {children}
          <TenantFooter slug={identity.slug} />
        </div>
      </TenantContext.Provider>
    </>
  );
}
