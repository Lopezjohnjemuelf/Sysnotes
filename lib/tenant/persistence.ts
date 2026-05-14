import { normalizeTenantIdentity } from "@/lib/tenant/identity";
import { NotImplementedError } from "@/lib/persistence/errors";
import { resolveTenantApiUrl } from "@/lib/persistence/api-url";
import { PersistenceError } from "@/lib/errors";
import type { TenantIdentity } from "@/lib/types";

export { NotImplementedError };

export interface TenantPersistenceService {
  load(): Promise<TenantIdentity | null>;
  save(id: TenantIdentity): Promise<void>;
}

export class ApiTenantService implements TenantPersistenceService {
  constructor(private readonly slug: string) {}

  private get path() {
    return `/api/tenant/${encodeURIComponent(this.slug)}/identity`;
  }

  async load(): Promise<TenantIdentity | null> {
    const response = await fetch(resolveTenantApiUrl(this.path));

    if (response.status === 404) {
      return null;
    }

    if (!response.ok) {
      throw new PersistenceError(`Request failed with status ${response.status}.`);
    }

    return (await response.json()) as TenantIdentity;
  }

  async save(identity: TenantIdentity): Promise<void> {
    const response = await fetch(
      resolveTenantApiUrl(
        `/api/tenant/${encodeURIComponent(identity.slug)}/identity`,
      ),
      {
        body: JSON.stringify(identity),
        headers: {
          "Content-Type": "application/json",
        },
        method: "PUT",
      },
    );

    if (!response.ok) {
      throw new PersistenceError(`Request failed with status ${response.status}.`);
    }
  }
}

export function getTenantService(slug = "sysnotes"): TenantPersistenceService {
  return new ApiTenantService(slug);
}
