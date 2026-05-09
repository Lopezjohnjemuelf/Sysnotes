"use client";

import type { ReactNode } from "react";
import { useEffect } from "react";
import { useTenantIdentity } from "@/components/admin";
import { TenantFooter, TenantHeader, getTenantTheme } from "@/components/tenant";

type TenantLayoutProps = {
  children: ReactNode;
};

export function TenantLayoutClient({ children }: TenantLayoutProps) {
  const identity = useTenantIdentity();
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
      <div style={{ fontFamily: "var(--tenant-font)" }}>
        <TenantHeader identity={identity} />
        {children}
        <TenantFooter slug={identity.slug} />
      </div>
    </>
  );
}
