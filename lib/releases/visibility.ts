import type { Release } from "@/lib/types";

export function hasPrivateReleaseAccess(
  release: Release | null,
  token?: string,
) {
  return (
    release?.status === "private" &&
    typeof release.shareToken === "string" &&
    token === release.shareToken
  );
}

export function canViewTenantRelease(release: Release | null, token?: string) {
  if (!release || release.status === "draft") {
    return false;
  }

  return release.status === "published" || hasPrivateReleaseAccess(release, token);
}
