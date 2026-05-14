import {
  ApiReleaseService,
  NotImplementedError,
  type ReleasePersistenceService,
} from "./persistence";
import {
  readTenantReleases,
  tenantReleasesFile,
} from "@/lib/db/tenant-data";
import { write } from "@/lib/db/file-store";
import type { Release, ReleaseStatus } from "@/lib/types";

export type { Release, ReleasePersistenceService, ReleaseStatus };
export { ApiReleaseService, NotImplementedError };

export interface ReleaseQueryService extends ReleasePersistenceService {
  getPublished(): Promise<Release[]>;
  getById(version: string, token?: string): Promise<Release | null>;
}

type ReleasePersistenceServiceWithQueries = ReleasePersistenceService &
  Partial<Pick<ReleaseQueryService, "getPublished" | "getById">>;

class ReleaseServiceWithQueries implements ReleaseQueryService {
  constructor(
    private readonly persistenceService: ReleasePersistenceServiceWithQueries,
  ) {}

  getAll() {
    return this.persistenceService.getAll();
  }

  save(release: Release) {
    return this.persistenceService.save(release);
  }

  delete(id: string) {
    return this.persistenceService.delete(id);
  }

  async getPublished() {
    if (this.persistenceService.getPublished) {
      return this.persistenceService.getPublished();
    }

    const releases = await this.getAll();

    return releases.filter((release) => release.status === "published");
  }

  async getById(version: string, token?: string) {
    if (this.persistenceService.getById) {
      return this.persistenceService.getById(version, token);
    }

    const releases = await this.getAll();

    return (
      releases.find(
        (release) => release.id === version || release.version === version,
      ) ?? null
    );
  }
}

class FileReleaseService implements ReleaseQueryService {
  constructor(private readonly slug: string) {}

  async getAll() {
    return readTenantReleases(this.slug);
  }

  async save(release: Release) {
    const releases = await this.getAll();
    const nextReleases = releases.some(
      (currentRelease) => currentRelease.id === release.id,
    )
      ? releases.map((currentRelease) =>
          currentRelease.id === release.id ? release : currentRelease,
        )
      : [release, ...releases];

    write(tenantReleasesFile(this.slug), nextReleases);
  }

  async delete(id: string) {
    const releases = await this.getAll();

    write(
      tenantReleasesFile(this.slug),
      releases.filter((release) => release.id !== id),
    );
  }

  async getPublished() {
    const releases = await this.getAll();

    return releases.filter((release) => release.status === "published");
  }

  async getById(version: string, token?: string) {
    const releases = await this.getAll();
    const release =
      releases.find(
        (currentRelease) =>
          currentRelease.id === version || currentRelease.version === version,
      ) ?? null;

    if (!release || release.status === "draft") {
      return null;
    }

    if (
      release.status === "private" &&
      (!token || token !== release.shareToken)
    ) {
      return null;
    }

    return release;
  }
}

export function getReleaseService(slug = "sysnotes"): ReleaseQueryService {
  if (typeof window !== "undefined") {
    throw new Error("Service called on client — use server components only.");
  }

  if (process.env.TENANT_API === "true") {
    return new ReleaseServiceWithQueries(new ApiReleaseService(slug));
  }

  return new FileReleaseService(slug);
}
