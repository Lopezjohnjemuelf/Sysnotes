import "server-only";

import { read, safeFilename } from "@/lib/db/file-store";
import { normalizeRelease } from "@/lib/releases/persistence";
import {
  normalizeTenantIdentity,
} from "@/lib/tenant/identity";
import type { Release, TenantIdentity } from "@/lib/types";
import { validateSlug } from "@/lib/validate";

export function tenantIdentityFile(slug: string) {
  return `tenant-${safeFilename(slug)}.json`;
}

export function tenantReleasesFile(slug: string) {
  return `releases-${safeFilename(slug)}.json`;
}

export function tenantSubscribersFile(slug: string) {
  return `subscribers-${safeFilename(slug)}.json`;
}

export function isValidTenantSlug(slug: string) {
  return validateSlug(slug);
}

export function readTenantIdentity(slug: string): TenantIdentity | null {
  if (!isValidTenantSlug(slug)) {
    return null;
  }

  const identity = read<TenantIdentity>(tenantIdentityFile(slug));

  return identity ? normalizeTenantIdentity(identity) : null;
}

export function readTenantReleases(slug: string): Release[] {
  if (!isValidTenantSlug(slug)) {
    return [];
  }

  const releases = read<unknown[]>(tenantReleasesFile(slug)) ?? [];

  if (!Array.isArray(releases)) {
    return [];
  }

  return releases
    .map((release) => normalizeRelease(release))
    .filter((release): release is Release => release !== null);
}

export function readPublishedTenantReleases(slug: string): Release[] {
  return readTenantReleases(slug).filter(
    (release) => release.status === "published",
  );
}
