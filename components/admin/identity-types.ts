export const MAX_LOGO_SIZE_BYTES = 512 * 1024;

export type TenantIdentity = {
  brandName: string;
  logoUrl: string | null;
  accentBg: string;
  accentText: string;
};

export type IdentityFormErrors = Partial<
  Record<"brandName" | "logo" | "accentBg", string>
>;

export const DEFAULT_TENANT_IDENTITY: TenantIdentity = {
  brandName: "Sysnotes by JFL",
  logoUrl: null,
  accentBg: "#d7ef7d",
  accentText: "#263400",
};

export const TENANT_IDENTITY_STORAGE_KEY = "sysnotes:tenant-identity:v1";

export function normalizeHexColor(value: string) {
  const trimmed = value.trim();
  const withHash = trimmed.startsWith("#") ? trimmed : `#${trimmed}`;

  if (/^#[0-9a-fA-F]{3}$/.test(withHash)) {
    const [, r, g, b] = withHash;

    return `#${r}${r}${g}${g}${b}${b}`.toLowerCase();
  }

  if (/^#[0-9a-fA-F]{6}$/.test(withHash)) {
    return withHash.toLowerCase();
  }

  return null;
}

export function getReadableTextColor(background: string) {
  const normalized = normalizeHexColor(background);

  if (!normalized) {
    return DEFAULT_TENANT_IDENTITY.accentText;
  }

  const red = parseInt(normalized.slice(1, 3), 16);
  const green = parseInt(normalized.slice(3, 5), 16);
  const blue = parseInt(normalized.slice(5, 7), 16);
  const luminance = (0.299 * red + 0.587 * green + 0.114 * blue) / 255;

  return luminance > 0.56 ? "#171717" : "#ffffff";
}

export function normalizeTenantIdentity(
  identity: TenantIdentity,
): TenantIdentity | null {
  const accentBg = normalizeHexColor(identity.accentBg);

  if (!identity.brandName.trim() || !accentBg) {
    return null;
  }

  return {
    brandName: identity.brandName.trim(),
    logoUrl: identity.logoUrl,
    accentBg,
    accentText: getReadableTextColor(accentBg),
  };
}

export function parseStoredTenantIdentity(value: string | null) {
  if (!value) {
    return DEFAULT_TENANT_IDENTITY;
  }

  try {
    const parsed = JSON.parse(value) as Partial<TenantIdentity>;
    const candidate: TenantIdentity = {
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
    };

    return normalizeTenantIdentity(candidate) ?? DEFAULT_TENANT_IDENTITY;
  } catch {
    return DEFAULT_TENANT_IDENTITY;
  }
}

export function validateIdentity(identity: TenantIdentity): IdentityFormErrors {
  const errors: IdentityFormErrors = {};

  if (!identity.brandName.trim()) {
    errors.brandName = "Brand name is required.";
  }

  if (!normalizeHexColor(identity.accentBg)) {
    errors.accentBg = "Enter a valid hex color.";
  }

  return errors;
}
