import {
  readPublishedTenantReleases,
  readTenantIdentity,
  readTenantReleases,
} from "@/lib/db/tenant-data";
import type { Release, TenantIdentity } from "@/lib/types";

export async function loadTenantPage(
  slug: string,
): Promise<{ identity: TenantIdentity; releases: Release[] } | null> {
  const identity = readTenantIdentity(slug);

  if (!identity || identity.slug !== slug) {
    return null;
  }

  const releases = readPublishedTenantReleases(slug);

  return { identity, releases };
}

export async function loadReleasePage(
  slug: string,
  version: string,
): Promise<{ identity: TenantIdentity; release: Release } | null> {
  const tenantPage = await loadTenantPage(slug);

  if (!tenantPage) {
    return null;
  }

  const release =
    readTenantReleases(slug).find(
      (currentRelease) =>
        currentRelease.id === version || currentRelease.version === version,
    ) ?? null;

  if (!release) {
    return null;
  }

  return {
    identity: tenantPage.identity,
    release,
  };
}
