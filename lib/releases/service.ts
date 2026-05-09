import {
  ApiReleaseService,
  LocalStorageReleaseService,
  NotImplementedError,
  getReleaseService as getReleasePersistenceService,
  type ReleasePersistenceService,
} from "./persistence";
import type { Release, ReleaseStatus } from "@/lib/types";

export type { Release, ReleasePersistenceService, ReleaseStatus };
export { ApiReleaseService, LocalStorageReleaseService, NotImplementedError };

export interface ReleaseQueryService extends ReleasePersistenceService {
  getPublished(): Promise<Release[]>;
  getById(version: string): Promise<Release | null>;
}

class ReleaseServiceWithQueries implements ReleaseQueryService {
  constructor(private readonly persistenceService: ReleasePersistenceService) {}

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
    const releases = await this.getAll();

    return releases.filter((release) => release.status === "published");
  }

  async getById(version: string) {
    const releases = await this.getAll();

    return (
      releases.find(
        (release) => release.id === version || release.version === version,
      ) ?? null
    );
  }
}

export function getReleaseService(_slug?: string): ReleaseQueryService {
  return new ReleaseServiceWithQueries(getReleasePersistenceService(_slug));
}
