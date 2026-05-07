"use client";

import { useEffect, useState } from "react";
import {
  BrandIdentityForm,
  DEFAULT_TENANT_IDENTITY,
  TENANT_IDENTITY_STORAGE_KEY,
  parseStoredTenantIdentity,
  type TenantIdentity,
} from "@/components/admin";

export function IdentityClient() {
  const [identity, setIdentity] = useState(DEFAULT_TENANT_IDENTITY);
  const [hasLoaded, setHasLoaded] = useState(false);

  useEffect(() => {
    setIdentity(
      parseStoredTenantIdentity(
        window.localStorage.getItem(TENANT_IDENTITY_STORAGE_KEY),
      ),
    );
    setHasLoaded(true);
  }, []);

  function saveIdentity(nextIdentity: TenantIdentity) {
    window.localStorage.setItem(
      TENANT_IDENTITY_STORAGE_KEY,
      JSON.stringify(nextIdentity),
    );
  }

  if (!hasLoaded) {
    return (
      <div className="border border-[var(--admin-preview-border)] bg-[var(--surface-card)] p-6 text-sm text-[var(--text-muted-4)]">
        Loading identity settings...
      </div>
    );
  }

  return (
    <BrandIdentityForm
      initialIdentity={identity}
      onSave={saveIdentity}
      showHeader={false}
    />
  );
}
