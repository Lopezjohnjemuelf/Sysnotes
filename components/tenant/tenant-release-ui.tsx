import Link from "next/link";
import type { Release } from "@/lib/types";

export function getUniqueReleaseTags(releases: Release[]) {
  return Array.from(
    new Set(releases.flatMap((release) => release.tags)),
  ).sort((firstTag, secondTag) => firstTag.localeCompare(secondTag));
}

export function getReleaseAnchor(release: Release) {
  return `v${release.id}`;
}

export function getTenantReleasePath(slug: string, version: string) {
  return `/${slug}/releases/${encodeURIComponent(version)}`;
}

export function getVisibleReleaseNavigation(
  releases: Release[],
  currentRelease: Release,
  hasPrivateAccess: boolean,
) {
  return releases.filter((release) => {
    if (release.status === "published") {
      return true;
    }

    return hasPrivateAccess && release.id === currentRelease.id;
  });
}

export function getAdjacentReleases(
  releases: Release[],
  currentRelease: Release,
) {
  const releaseIndex = releases.findIndex(
    (release) => release.id === currentRelease.id,
  );

  if (releaseIndex === -1) {
    return {
      previousRelease: null,
      nextRelease: null,
    };
  }

  return {
    previousRelease: releases[releaseIndex - 1] ?? null,
    nextRelease: releases[releaseIndex + 1] ?? null,
  };
}

export function TenantEyebrowPill({ children }: { children: string }) {
  return (
    <p className="w-fit max-w-full rounded-full bg-[var(--tenant-accent-bg,var(--accent-bg))] px-4 py-2 text-sm font-medium text-[var(--tenant-accent-text,var(--accent-text))]">
      {children}
    </p>
  );
}

export function ReleaseVersionChip({ version }: { version: string }) {
  return (
    <span className="max-w-full break-all rounded-full bg-[var(--tag-bg)] px-3 py-1 font-mono text-[13px] text-[var(--text-muted-5)]">
      {version}
    </span>
  );
}

export function LivePill() {
  return (
    <span className="rounded-full bg-[var(--tenant-accent-bg,var(--accent-bg))] px-3 py-1 text-xs font-medium text-[var(--tenant-accent-text,var(--accent-text))]">
      Live
    </span>
  );
}

export function ReleaseTagPill({ tag }: { tag: string }) {
  return (
    <span className="max-w-full break-words rounded-full bg-[var(--tag-bg)] px-3 py-1 text-sm text-[var(--text-muted-4)]">
      {tag}
    </span>
  );
}

export function ReleaseMetaRow({ release }: { release: Release }) {
  return (
    <div className="flex min-w-0 flex-wrap items-center gap-2">
      <ReleaseVersionChip version={release.version} />
      <LivePill />
      <span className="text-sm text-[var(--text-muted-4)]">
        {release.date}
      </span>
    </div>
  );
}

export function TenantReleaseLink({
  children,
  slug,
  version,
}: {
  children: string;
  slug: string;
  version: string;
}) {
  return (
    <Link
      className="mt-5 inline-flex min-h-10 items-center text-[13px] font-medium text-[var(--tenant-accent-text,var(--accent-text))] transition hover:underline"
      href={getTenantReleasePath(slug, version)}
    >
      {children}
    </Link>
  );
}
