import { DEFAULT_TENANT_IDENTITY } from "@/lib/tenant/identity";
import type { TenantIdentity } from "@/lib/types";

export function getTenantFont(fontFamily: TenantIdentity["fontFamily"]) {
  if (fontFamily === "serif") {
    return "Georgia, serif";
  }

  if (fontFamily === "mono") {
    return "monospace";
  }

  return "inherit";
}

export function getTenantTheme(identity: TenantIdentity) {
  return {
    accentBg: identity.accentBg || DEFAULT_TENANT_IDENTITY.accentBg,
    accentText: identity.accentText || DEFAULT_TENANT_IDENTITY.accentText,
    font: getTenantFont(identity.fontFamily),
    isDark: identity.colorScheme === "dark",
  };
}
