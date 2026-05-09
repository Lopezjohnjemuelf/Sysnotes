export const ADMIN_SETTINGS_STORAGE_KEY = "sysnotes:admin-settings:v1";

export type AdminSettings = {
  workspaceLabel: string;
  releasesPerPage: number;
};

export const DEFAULT_ADMIN_SETTINGS: AdminSettings = {
  workspaceLabel: "Sysnotes admin",
  releasesPerPage: 8,
};

export const RELEASES_PER_PAGE_OPTIONS = [5, 8, 12, 20] as const;

export function normalizeAdminSettings(value: unknown): AdminSettings {
  if (!value || typeof value !== "object") {
    return DEFAULT_ADMIN_SETTINGS;
  }

  const parsed = value as Partial<AdminSettings>;
  const workspaceLabel =
    typeof parsed.workspaceLabel === "string" && parsed.workspaceLabel.trim()
      ? parsed.workspaceLabel.trim()
      : DEFAULT_ADMIN_SETTINGS.workspaceLabel;
  const releasesPerPage = RELEASES_PER_PAGE_OPTIONS.includes(
    parsed.releasesPerPage as (typeof RELEASES_PER_PAGE_OPTIONS)[number],
  )
    ? Number(parsed.releasesPerPage)
    : DEFAULT_ADMIN_SETTINGS.releasesPerPage;

  return {
    workspaceLabel,
    releasesPerPage,
  };
}

export function parseStoredAdminSettings(value: string | null): AdminSettings {
  if (!value) {
    return DEFAULT_ADMIN_SETTINGS;
  }

  try {
    return normalizeAdminSettings(JSON.parse(value));
  } catch (err) {
    console.warn(err);
    return DEFAULT_ADMIN_SETTINGS;
  }
}
