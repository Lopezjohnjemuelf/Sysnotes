import type { ReleaseBodyBlock } from "@/data/releases";
import type {
  Release,
  ReleaseStatus as PersistedReleaseStatus,
} from "@/lib/types";

export type AdminReleaseStatus = "Published" | "Draft" | "Private";

export type AdminRelease = {
  id: string;
  version: string;
  date: string;
  title: string;
  summary: string;
  body?: string;
  tags: string[];
  status: AdminReleaseStatus;
  shareToken?: string;
};

export function bodyBlocksToMarkdown(blocks: ReleaseBodyBlock[]) {
  return blocks
    .map((block) => {
      if (block.type === "paragraph") {
        return block.text;
      }

      if (block.type === "heading") {
        return `## ${block.text}`;
      }

      return block.items.map((item) => `- ${item}`).join("\n");
    })
    .join("\n\n");
}

export function toAdminStatus(
  status: PersistedReleaseStatus,
): AdminReleaseStatus {
  if (status === "published") {
    return "Published";
  }

  if (status === "private") {
    return "Private";
  }

  return "Draft";
}

export function toPersistedStatus(
  status: AdminReleaseStatus,
): PersistedReleaseStatus {
  if (status === "Published") {
    return "published";
  }

  if (status === "Private") {
    return "private";
  }

  return "draft";
}

export function toAdminRelease(release: Release): AdminRelease {
  return {
    id: release.id,
    version: release.version,
    date: release.date,
    title: release.title,
    summary: release.summary,
    body: release.body,
    tags: release.tags,
    status: toAdminStatus(release.status),
    shareToken: release.shareToken,
  };
}

export function prepareAdminReleaseForSave(release: AdminRelease): AdminRelease {
  if (release.status === "Private") {
    return {
      ...release,
      shareToken: release.shareToken?.trim() || crypto.randomUUID(),
    };
  }

  return {
    ...release,
    shareToken: undefined,
  };
}

export function toPersistedRelease(release: AdminRelease): Release {
  return {
    id: release.id,
    version: release.version,
    date: release.date,
    title: release.title,
    summary: release.summary,
    body: release.body,
    tags: release.tags,
    status: toPersistedStatus(release.status),
    shareToken: release.status === "Private" ? release.shareToken : undefined,
  };
}

export function getTenantReleaseUrl(slug: string, release: AdminRelease) {
  return `/${slug}/releases/${encodeURIComponent(release.version)}`;
}

export function getPrivateReleaseUrl(slug: string, release: AdminRelease) {
  if (!release.shareToken) {
    return null;
  }

  return `${getTenantReleaseUrl(slug, release)}?token=${encodeURIComponent(
    release.shareToken,
  )}`;
}
