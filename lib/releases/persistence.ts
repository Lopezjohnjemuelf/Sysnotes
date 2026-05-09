import {
  NotImplementedError,
  shouldUseTenantApi,
} from "@/lib/persistence/errors";
import { PersistenceError } from "@/lib/errors";
import type { Release, ReleaseStatus } from "@/lib/types";

export { NotImplementedError };

export interface ReleasePersistenceService {
  getAll(): Promise<Release[]>;
  save(r: Release): Promise<void>;
  delete(id: string): Promise<void>;
}

export const RELEASES_STORAGE_KEY = "sysnotes:releases:v1";

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

function parseStoredReleases(value: string | null): Release[] {
  if (!value) {
    return [];
  }

  try {
    const parsed = JSON.parse(value);

    if (!Array.isArray(parsed)) {
      return [];
    }

    return parsed
      .map((release) => normalizeRelease(release))
      .filter((release): release is Release => release !== null);
  } catch (err) {
    console.warn(err);
    return [];
  }
}

function isQuotaExceededError(err: unknown) {
  return (
    err instanceof DOMException &&
    (err.name === "QuotaExceededError" || err.name === "NS_ERROR_DOM_QUOTA_REACHED")
  );
}

function setStorageItem(key: string, value: string) {
  try {
    window.localStorage.setItem(key, value);
  } catch (err) {
    if (isQuotaExceededError(err)) {
      throw new PersistenceError("Storage quota exceeded.");
    }

    console.warn(err);
  }
}

export class LocalStorageReleaseService implements ReleasePersistenceService {
  async getAll() {
    if (typeof window === "undefined") {
      return [];
    }

    try {
      const storedValue = window.localStorage.getItem(RELEASES_STORAGE_KEY);

      return parseStoredReleases(storedValue);
    } catch (err) {
      console.warn(err);
      return [];
    }
  }

  async save(release: Release) {
    if (typeof window === "undefined") {
      return;
    }

    try {
      const releases = await this.getAll();
      const nextReleases = releases.some(
        (currentRelease) => currentRelease.id === release.id,
      )
        ? releases.map((currentRelease) =>
            currentRelease.id === release.id ? release : currentRelease,
          )
        : [release, ...releases];

      setStorageItem(RELEASES_STORAGE_KEY, JSON.stringify(nextReleases));
    } catch (err) {
      if (err instanceof PersistenceError) {
        throw err;
      }

      console.warn(err);
      return;
    }
  }

  async delete(id: string) {
    if (typeof window === "undefined") {
      return;
    }

    try {
      const releases = await this.getAll();

      setStorageItem(
        RELEASES_STORAGE_KEY,
        JSON.stringify(releases.filter((release) => release.id !== id)),
      );
    } catch (err) {
      if (err instanceof PersistenceError) {
        throw err;
      }

      console.warn(err);
      return;
    }
  }
}

async function fetchJson<T>(url: string, init?: RequestInit): Promise<T> {
  const response = await fetch(url, init);

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
    const response = await fetch(`${this.basePath}/${encodeURIComponent(id)}`, {
      method: "DELETE",
    });

    if (!response.ok && response.status !== 404) {
      throw new PersistenceError(`Request failed with status ${response.status}.`);
    }
  }
}

export function getReleaseService(slug = "sysnotes"): ReleasePersistenceService {
  if (shouldUseTenantApi()) {
    return new ApiReleaseService(slug);
  }

  return new LocalStorageReleaseService();
}
