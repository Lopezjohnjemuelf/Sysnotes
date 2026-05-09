import {
  DEFAULT_TENANT_IDENTITY,
  TENANT_IDENTITY_STORAGE_KEY,
  normalizeTenantIdentity,
} from "@/lib/tenant/identity";
import {
  NotImplementedError,
  shouldUseTenantApi,
} from "@/lib/persistence/errors";
import { PersistenceError } from "@/lib/errors";
import type { TenantIdentity } from "@/lib/types";

export { NotImplementedError };

export interface TenantPersistenceService {
  load(): Promise<TenantIdentity | null>;
  save(id: TenantIdentity): Promise<void>;
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

function normalizeStoredTenantIdentity(value: unknown) {
  if (!value || typeof value !== "object") {
    return DEFAULT_TENANT_IDENTITY;
  }

  const parsed = value as Partial<TenantIdentity>;
  const candidate: TenantIdentity = {
    slug:
      typeof parsed.slug === "string"
        ? parsed.slug
        : DEFAULT_TENANT_IDENTITY.slug,
    brandName:
      typeof parsed.brandName === "string"
        ? parsed.brandName
        : DEFAULT_TENANT_IDENTITY.brandName,
    logoUrl: typeof parsed.logoUrl === "string" ? parsed.logoUrl : null,
    accentBg:
      typeof parsed.accentBg === "string"
        ? parsed.accentBg
        : DEFAULT_TENANT_IDENTITY.accentBg,
    accentText:
      typeof parsed.accentText === "string"
        ? parsed.accentText
        : DEFAULT_TENANT_IDENTITY.accentText,
    colorScheme: parsed.colorScheme,
    fontFamily: parsed.fontFamily,
    badgePosition: parsed.badgePosition,
    comingSoon: parsed.comingSoon,
    webhookUrl:
      typeof parsed.webhookUrl === "string"
        ? parsed.webhookUrl
        : DEFAULT_TENANT_IDENTITY.webhookUrl,
  };

  return normalizeTenantIdentity(candidate) ?? DEFAULT_TENANT_IDENTITY;
}

export class LocalStorageTenantService implements TenantPersistenceService {
  async load() {
    if (typeof window === "undefined") {
      return null;
    }

    try {
      const storedValue = window.localStorage.getItem(
        TENANT_IDENTITY_STORAGE_KEY,
      );

      if (!storedValue) {
        return null;
      }

      try {
        return normalizeStoredTenantIdentity(JSON.parse(storedValue));
      } catch (err) {
        console.warn(err);
        return null;
      }
    } catch (err) {
      console.warn(err);
      return null;
    }
  }

  async save(identity: TenantIdentity) {
    if (typeof window === "undefined") {
      return;
    }

    try {
      const normalizedIdentity = normalizeTenantIdentity(identity);

      if (!normalizedIdentity) {
        return;
      }

      setStorageItem(
        TENANT_IDENTITY_STORAGE_KEY,
        JSON.stringify(normalizedIdentity),
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

export class ApiTenantService implements TenantPersistenceService {
  constructor(private readonly slug: string) {}

  private get path() {
    return `/api/tenant/${encodeURIComponent(this.slug)}/identity`;
  }

  async load(): Promise<TenantIdentity | null> {
    const response = await fetch(this.path);

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
      `/api/tenant/${encodeURIComponent(identity.slug)}/identity`,
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

export function getTenantService(slug = DEFAULT_TENANT_IDENTITY.slug): TenantPersistenceService {
  if (shouldUseTenantApi()) {
    return new ApiTenantService(slug);
  }

  return new LocalStorageTenantService();
}
