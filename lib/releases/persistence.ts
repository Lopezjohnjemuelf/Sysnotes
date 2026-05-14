import { NotImplementedError } from "@/lib/persistence/errors";
import { resolveTenantApiUrl } from "@/lib/persistence/api-url";
import { PersistenceError } from "@/lib/errors";
import type { Release, ReleaseStatus } from "@/lib/types";

export { NotImplementedError };

export interface ReleasePersistenceService {
  getAll(): Promise<Release[]>;
  save(r: Release): Promise<void>;
  delete(id: string): Promise<void>;
}

function normalizeStatus(status: unknown): ReleaseStatus | null {
  if (typeof status !== "string") {
    return null;
  }

  const normalizedStatus = status.toLowerCase();

  if (
    normalizedStatus === "published" ||
    normalizedStatus === "draft" ||
    normalizedStatus === "private"
  ) {
    return normalizedStatus;
  }

  return null;
}

export function normalizeRelease(value: unknown): Release | null {
  if (!value || typeof value !== "object") {
    return null;
  }

  const release = value as Partial<Release>;
  const status = normalizeStatus(release.status);

  if (
    !status ||
    typeof release.id !== "string" ||
    typeof release.version !== "string" ||
    typeof release.date !== "string" ||
    typeof release.title !== "string" ||
    typeof release.summary !== "string" ||
    !Array.isArray(release.tags) ||
    !release.tags.every((tag) => typeof tag === "string")
  ) {
    return null;
  }

  return {
    id: release.id,
    version: release.version,
    date: release.date,
    title: release.title,
    summary: release.summary,
    body: typeof release.body === "string" ? release.body : undefined,
    tags: release.tags,
    status,
    shareToken:
      typeof release.shareToken === "string" ? release.shareToken : undefined,
  };
}

async function fetchJson<T>(url: string, init?: RequestInit): Promise<T> {
  const response = await fetch(resolveTenantApiUrl(url), init);

  if (!response.ok) {
    throw new PersistenceError(`Request failed with status ${response.status}.`);
  }

  return (await response.json()) as T;
}

export class ApiReleaseService implements ReleasePersistenceService {
  constructor(private readonly slug: string) {}

  private get basePath() {
    return `/api/tenant/${encodeURIComponent(this.slug)}/releases`;
  }

  async getAll(): Promise<Release[]> {
    return fetchJson<Release[]>(this.basePath);
  }

  async getPublished(): Promise<Release[]> {
    const releases = await this.getAll();

    return releases.filter((release) => release.status === "published");
  }

  async getById(version: string, token?: string): Promise<Release | null> {
    const path = `${this.basePath}/${encodeURIComponent(version)}`;
    const url = token ? `${path}?token=${encodeURIComponent(token)}` : path;
    const response = await fetch(resolveTenantApiUrl(url));

    if (response.status === 404) {
      return null;
    }

    if (!response.ok) {
      throw new PersistenceError(`Request failed with status ${response.status}.`);
    }

    return (await response.json()) as Release;
  }

  async save(release: Release): Promise<void> {
    const releases = await this.getAll();
    const existingRelease = releases.find(
      (currentRelease) => currentRelease.id === release.id,
    );

    if (!existingRelease) {
      await fetchJson<Release>(this.basePath, {
        body: JSON.stringify(release),
        headers: {
          "Content-Type": "application/json",
        },
        method: "POST",
      });
      return;
    }

    await fetchJson<Release>(
      `${this.basePath}/${encodeURIComponent(release.id)}`,
      {
        body: JSON.stringify(release),
        headers: {
          "Content-Type": "application/json",
        },
        method: "PUT",
      },
    );
  }

  async delete(id: string): Promise<void> {
    const response = await fetch(
      resolveTenantApiUrl(`${this.basePath}/${encodeURIComponent(id)}`),
      {
        method: "DELETE",
      },
    );

    if (!response.ok && response.status !== 404) {
      throw new PersistenceError(`Request failed with status ${response.status}.`);
    }
  }
}

export function getReleaseService(slug = "sysnotes"): ReleasePersistenceService {
  return new ApiReleaseService(slug);
}
