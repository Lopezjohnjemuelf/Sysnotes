import "server-only";

import { getReleaseService } from "@/lib/releases/service";
import { getTenantService } from "@/lib/tenant/service";
import type { Release, TenantIdentity } from "@/lib/types";

type TenantPageData = {
  identity: TenantIdentity;
  releases: Release[];
};

type ReleasePageData = TenantPageData & {
  release: Release;
};

export async function loadTenantPage(
  slug: string,
): Promise<TenantPageData | null> {
  const [identity, releases] = await Promise.all([
    getTenantService(slug).load(),
    getReleaseService(slug).getPublished(),
  ]);

  if (!identity || identity.slug !== slug) {
    return null;
  }

  return { identity, releases };
}

export async function loadReleasePage(
  slug: string,
  version: string,
): Promise<ReleasePageData | null> {
  const releaseService = getReleaseService(slug);
  const [identity, release, releases] = await Promise.all([
    getTenantService(slug).load(),
    releaseService.getById(version),
    releaseService.getAll(),
  ]);

  if (!identity || identity.slug !== slug || !release) {
    return null;
  }

  return {
    identity,
    release,
    releases,
  };
}
