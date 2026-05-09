"use client";

import { usePathname } from "next/navigation";
import { TenantReleaseCard } from "@/components/tenant/tenant-release-card";
import { toPersistedStatus } from "@/lib/releases/admin";
import type { Release } from "@/lib/types";
import type { AdminPreviewRelease } from "./admin-preview-context";
import { useAdminPreview } from "./admin-preview-context";
import {
  getTenantIdentityStyle,
  useTenantIdentity,
} from "./tenant-identity-ui";

function hasPreviewContent(release: AdminPreviewRelease | null) {
  return Boolean(
    release &&
      (release.version.trim() ||
        release.title.trim() ||
        release.summary.trim() ||
        release.tags.length > 0),
  );
}

function toReleasePreview(release: AdminPreviewRelease): Release {
  return {
    id: release.version.trim() || "preview-release",
    version: release.version.trim() || "v0.0.0",
    date: release.date,
    title: release.title.trim() || "Untitled release",
    summary: release.summary.trim() || "Add a summary to preview it here.",
    body: release.body,
    tags: release.tags,
    status: toPersistedStatus(release.status),
    shareToken: release.shareToken,
  };
}

export function AdminPreviewPane() {
  const pathname = usePathname();
  const { isPreviewVisible, previewRelease } = useAdminPreview();
  const identity = useTenantIdentity();

  if (!pathname.startsWith("/admin/releases") || !isPreviewVisible) {
    return null;
  }

  return (
    <aside className="flex h-screen w-[320px] shrink-0 flex-col border-l border-[var(--border-subtle)] bg-[var(--surface-card)] p-5">
      <header>
        <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[var(--text-muted-4)]">
          Preview
        </p>
        <p className="mt-1 text-[11px] text-[var(--text-muted-4)]">
          What you see is what you get.
        </p>
      </header>

      <div
        className="mt-6 flex-1 overflow-y-auto"
        style={getTenantIdentityStyle(identity)}
      >
        {hasPreviewContent(previewRelease) && previewRelease ? (
          <TenantReleaseCard
            identity={identity}
            release={toReleasePreview(previewRelease)}
          />
        ) : (
          <div className="grid min-h-48 place-items-center rounded-lg border border-dashed border-[var(--border-subtle)] p-5 text-center text-[13px] text-[var(--text-muted-4)]">
            Start writing to see a preview.
          </div>
        )}
      </div>
    </aside>
  );
}
