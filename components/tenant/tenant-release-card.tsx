"use client";

import type { CSSProperties } from "react";
import type { Release, TenantIdentity } from "@/lib/types";
import {
  LivePill,
  ReleaseTagPill,
  ReleaseVersionChip,
  TenantReleaseLink,
} from "./tenant-release-ui";

type TenantReleaseCardProps = {
  release: Release;
  identity: Pick<TenantIdentity, "accentBg" | "accentText" | "slug">;
};

export function TenantReleaseCard({
  identity,
  release,
}: TenantReleaseCardProps) {
  const tenantAccentStyle = {
    "--tenant-accent-bg": identity.accentBg,
    "--tenant-accent-text": identity.accentText,
  } as CSSProperties;

  return (
    <article
      className="overflow-hidden border-b border-[var(--border-subtle)] py-6 sm:py-7"
      style={tenantAccentStyle}
    >
      <div className="flex min-w-0 flex-wrap items-center gap-2">
        <ReleaseVersionChip version={release.version} />
        <LivePill />
        <span className="text-sm text-[var(--text-muted-4)]">
          {release.date}
        </span>
      </div>

      <h2 className="mt-4 break-words text-lg font-semibold tracking-normal text-[var(--text-primary)]">
        {release.title}
      </h2>
      <p className="mt-3 line-clamp-3 max-w-3xl break-words text-sm leading-6 text-[var(--text-muted-5)]">
        {release.summary}
      </p>

      <div className="mt-5 flex min-w-0 flex-wrap gap-2">
        {release.tags.map((tag) => (
          <ReleaseTagPill key={`${release.id}-${tag}`} tag={tag} />
        ))}
      </div>

      <TenantReleaseLink slug={identity.slug} version={release.version}>
        Read more →
      </TenantReleaseLink>
    </article>
  );
}
