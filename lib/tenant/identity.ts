import type { TenantIdentity } from "@/lib/types";

export const MAX_LOGO_SIZE_BYTES = 512 * 1024;

export type IdentityFormErrors = Partial<
  Record<"slug" | "brandName" | "logo" | "accentBg" | "accentText", string>
>;

export const DEFAULT_TENANT_IDENTITY: TenantIdentity = {
  slug: "sysnotes",
  brandName: "Sysnotes by JFL",
  logoUrl: null,
  accentBg: "#d7ef7d",
  accentText: "#263400",
  colorScheme: "light",
  fontFamily: "sans",
  badgePosition: "right",
  comingSoon: false,
  webhookUrl: "",
};

export const TENANT_IDENTITY_STORAGE_KEY = "sysnotes:tenant-identity:v1";
export const TENANT_SLUG_PATTERN = /^[a-z0-9-]+$/;

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
  const accentText = normalizeHexColor(identity.accentText);
  const slug = identity.slug.trim();

  if (
    !slug ||
    !TENANT_SLUG_PATTERN.test(slug) ||
    !identity.brandName.trim() ||
    !accentBg ||
    !accentText
  ) {
    return null;
  }

  return {
    slug,
    brandName: identity.brandName.trim(),
    logoUrl: identity.logoUrl?.trim() || null,
    accentBg,
    accentText,
    colorScheme: identity.colorScheme ?? DEFAULT_TENANT_IDENTITY.colorScheme,
    fontFamily: identity.fontFamily ?? DEFAULT_TENANT_IDENTITY.fontFamily,
    badgePosition:
      identity.badgePosition ?? DEFAULT_TENANT_IDENTITY.badgePosition,
    comingSoon: identity.comingSoon ?? DEFAULT_TENANT_IDENTITY.comingSoon,
    webhookUrl: identity.webhookUrl?.trim() || "",
  };
}

export function parseStoredTenantIdentity(value: string | null) {
  if (!value) {
    return DEFAULT_TENANT_IDENTITY;
  }

  try {
    const parsed = JSON.parse(value) as Partial<TenantIdentity>;
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
  } catch (err) {
    console.warn(err);
    return DEFAULT_TENANT_IDENTITY;
  }
}

export function validateIdentity(identity: TenantIdentity): IdentityFormErrors {
  const errors: IdentityFormErrors = {};

  if (!identity.brandName.trim()) {
    errors.brandName = "Brand name is required.";
  }

  if (!identity.slug.trim()) {
    errors.slug = "Page slug is required.";
  } else if (!TENANT_SLUG_PATTERN.test(identity.slug.trim())) {
    errors.slug = "Use lowercase letters, numbers, and hyphens only.";
  }

  if (!normalizeHexColor(identity.accentBg)) {
    errors.accentBg = "Enter a valid hex color.";
  }

  if (!normalizeHexColor(identity.accentText)) {
    errors.accentText = "Enter a valid hex color.";
  }

  return errors;
}
