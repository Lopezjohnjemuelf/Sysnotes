import { getTenantService as getTenantPersistenceService } from "./persistence";
import {
  readTenantIdentity,
  tenantIdentityFile,
} from "@/lib/db/tenant-data";
import { write } from "@/lib/db/file-store";
import {
  DEFAULT_TENANT_IDENTITY,
  normalizeTenantIdentity,
} from "@/lib/tenant/identity";
import type { TenantIdentity } from "@/lib/types";

export {
  ApiTenantService,
  NotImplementedError,
  type TenantPersistenceService,
} from "./persistence";

class FileTenantService {
  constructor(private readonly slug: string) {}

  async load() {
    return readTenantIdentity(this.slug);
  }

  async save(identity: TenantIdentity) {
    const normalizedIdentity = normalizeTenantIdentity(identity);

    if (!normalizedIdentity) {
      return;
    }

    write(tenantIdentityFile(normalizedIdentity.slug), normalizedIdentity);
  }
}

export function getTenantService(slug = DEFAULT_TENANT_IDENTITY.slug) {
  if (typeof window !== "undefined") {
    throw new Error("Service called on client — use server components only.");
  }

  if (process.env.TENANT_API === "true") {
    return getTenantPersistenceService(slug);
  }

  return new FileTenantService(slug);
}
