"use client";

import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import {
  TenantComingSoon,
  TenantReleasesLandingPage,
} from "@/components/tenant";
import { getReleaseService } from "@/lib/releases/service";
import { getTenantService } from "@/lib/tenant/service";
import type { Release, TenantIdentity } from "@/lib/types";

function TenantRouteMessage({ children }: { children: string }) {
  return (
    <main className="grid min-h-[calc(100vh-56px-61px)] place-items-center bg-[var(--surface-page)] px-6 text-center text-[var(--text-primary)]">
      <p className="max-w-sm text-sm leading-6 text-[var(--text-muted-5)]">
        {children}
      </p>
    </main>
  );
}

export function TenantPageClient() {
  const params = useParams<{ slug: string }>();
  const slug = params.slug;
  const [identity, setIdentity] = useState<TenantIdentity | null>(null);
  const [publishedReleases, setPublishedReleases] = useState<Release[]>([]);
  const [hasLoaded, setHasLoaded] = useState(false);

  useEffect(() => {
    let isMounted = true;

    async function loadTenantPage() {
      const [storedIdentity, releases] = await Promise.all([
        getTenantService(slug).load(),
        getReleaseService(slug).getPublished(),
      ]);

      if (!isMounted) {
        return;
      }

      setIdentity(storedIdentity);
      setPublishedReleases(releases);
      setHasLoaded(true);
    }

    void loadTenantPage();

    return () => {
      isMounted = false;
    };
  }, [slug]);

  if (!hasLoaded) {
    return <TenantRouteMessage>Loading release notes...</TenantRouteMessage>;
  }

  if (!identity || identity.slug !== slug) {
    return <TenantRouteMessage>Tenant release page not found.</TenantRouteMessage>;
  }

  if (identity.comingSoon === true || publishedReleases.length === 0) {
    return <TenantComingSoon identity={identity} />;
  }

  return (
    <TenantReleasesLandingPage
      identity={identity}
      releases={publishedReleases}
    />
  );
}
