export { AdminLogoutButton } from "./admin-logout-button";
export { AdminFooter } from "./admin-footer";
export { AdminPreviewPane } from "./admin-preview-pane";
export {
  AdminPreviewProvider,
  useAdminPreview,
  useOptionalAdminPreview,
} from "./admin-preview-context";
export { AdminSidebar } from "./admin-sidebar";
export { AdminSegmentedControl, getAdminSegmentButtonClass } from "./admin-ui";
export { BrandIdentityForm } from "./brand-identity-form";
export { BrandIdentityPreview } from "./brand-identity-preview";
export {
  AdminAccessGate,
  EmptyStateCard,
  ErrorStateCard,
  InlineErrorBanner,
  InlineActionLink,
  RetryActionRow,
  type AdminStateAction,
} from "./state";
export {
  DestructiveSettingRow,
  SettingRow,
  SettingsSection,
} from "./settings";
export {
  TENANT_IDENTITY_CHANGE_EVENT,
  SysnotesWordmark,
  TenantIdentityScope,
  TenantWordmark,
  getTenantIdentityStyle,
  useTenantIdentity,
} from "./tenant-identity-ui";
export {
  DEFAULT_TENANT_IDENTITY,
  MAX_LOGO_SIZE_BYTES,
  TENANT_IDENTITY_STORAGE_KEY,
  getReadableTextColor,
  normalizeTenantIdentity,
  normalizeHexColor,
  parseStoredTenantIdentity,
  validateIdentity,
  type IdentityFormErrors,
} from "@/lib/tenant/identity";
export type { TenantIdentity } from "@/lib/types";
