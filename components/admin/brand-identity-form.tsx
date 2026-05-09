"use client";

import {
  type ChangeEvent,
  type FormEvent,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { AdminSegmentedControl } from "./admin-ui";
import { BrandIdentityPreview } from "./brand-identity-preview";
import { InlineErrorBanner } from "./state";
import {
  DEFAULT_TENANT_IDENTITY,
  MAX_LOGO_SIZE_BYTES,
  TENANT_SLUG_PATTERN,
  getReadableTextColor,
  normalizeTenantIdentity,
  normalizeHexColor,
  validateIdentity,
  type IdentityFormErrors,
} from "@/lib/tenant/identity";
import { PersistenceError } from "@/lib/errors";
import type { TenantIdentity } from "@/lib/types";

type BrandIdentityFormProps = {
  initialIdentity?: TenantIdentity;
  onSave?: (identity: TenantIdentity) => Promise<void> | void;
  showHeader?: boolean;
};

const acceptedLogoTypes = ["image/png", "image/svg+xml", "image/webp"];
const logoInputModes = ["upload", "url"] as const;
type LogoInputMode = (typeof logoInputModes)[number];

function hasErrors(errors: IdentityFormErrors) {
  return Object.keys(errors).length > 0;
}

export function BrandIdentityForm({
  initialIdentity = DEFAULT_TENANT_IDENTITY,
  onSave,
  showHeader = true,
}: BrandIdentityFormProps) {
  const [identity, setIdentity] = useState(initialIdentity);
  const [errors, setErrors] = useState<IdentityFormErrors>({});
  const [isDirty, setIsDirty] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [saveError, setSaveError] = useState(false);
  const [origin, setOrigin] = useState("");
  const [embedCopied, setEmbedCopied] = useState(false);
  const [logoInputMode, setLogoInputMode] = useState<LogoInputMode>("upload");
  const formRef = useRef<HTMLFormElement | null>(null);
  const savedTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const saveErrorTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const embedCopiedTimerRef = useRef<ReturnType<typeof setTimeout> | null>(
    null,
  );

  const normalizedAccent = useMemo(
    () => normalizeHexColor(identity.accentBg),
    [identity.accentBg],
  );
  const embedCode = `<script src="${origin}/${identity.slug || "slug"}/widget"></script>`;

  useEffect(() => {
    setIdentity(initialIdentity);
    setErrors({});
    setIsDirty(false);
    setIsSaving(false);
    setSaved(false);
    setSaveError(false);
  }, [initialIdentity]);

  useEffect(() => {
    setOrigin(window.location.origin);
  }, []);

  useEffect(() => {
    return () => {
      if (savedTimerRef.current) {
        clearTimeout(savedTimerRef.current);
      }

      if (saveErrorTimerRef.current) {
        clearTimeout(saveErrorTimerRef.current);
      }

      if (embedCopiedTimerRef.current) {
        clearTimeout(embedCopiedTimerRef.current);
      }
    };
  }, []);

  function updateIdentity(nextIdentity: TenantIdentity) {
    setIdentity(nextIdentity);
    setIsDirty(true);
    setSaved(false);
    setSaveError(false);
    setErrors(validateIdentity(nextIdentity));
  }

  function handleSlugChange(event: ChangeEvent<HTMLInputElement>) {
    const nextIdentity = {
      ...identity,
      slug: event.target.value,
    };

    setIdentity(nextIdentity);
    setIsDirty(true);
    setSaved(false);
    setErrors((currentErrors) => {
      const { slug, ...remainingErrors } = currentErrors;

      return remainingErrors;
    });
  }

  function handleSlugBlur() {
    const slug = identity.slug.trim();

    if (!slug) {
      setErrors((currentErrors) => ({
        ...currentErrors,
        slug: "Page slug is required.",
      }));
      return;
    }

    if (!TENANT_SLUG_PATTERN.test(slug)) {
      setErrors((currentErrors) => ({
        ...currentErrors,
        slug: "Use lowercase letters, numbers, and hyphens only.",
      }));
      return;
    }

    updateIdentity({
      ...identity,
      slug,
    });
  }

  function handleBrandNameChange(event: ChangeEvent<HTMLInputElement>) {
    updateIdentity({
      ...identity,
      brandName: event.target.value,
    });
  }

  function handleLogoUrlChange(event: ChangeEvent<HTMLInputElement>) {
    updateIdentity({
      ...identity,
      logoUrl: event.target.value,
    });
  }

  function handleAccentChange(value: string) {
    const normalized = normalizeHexColor(value);
    const accentBg = normalized ?? value;

    updateIdentity({
      ...identity,
      accentBg,
      accentText: normalized
        ? getReadableTextColor(normalized)
        : identity.accentText,
    });
  }

  function handleAccentTextChange(value: string) {
    const normalized = normalizeHexColor(value);

    updateIdentity({
      ...identity,
      accentText: normalized ?? value,
    });
  }

  function handleColorSchemeChange(value: TenantIdentity["colorScheme"]) {
    updateIdentity({
      ...identity,
      colorScheme: value,
    });
  }

  function handleFontFamilyChange(value: TenantIdentity["fontFamily"]) {
    updateIdentity({
      ...identity,
      fontFamily: value,
    });
  }

  function handleBadgePositionChange(value: TenantIdentity["badgePosition"]) {
    updateIdentity({
      ...identity,
      badgePosition: value,
    });
  }

  function handleComingSoonChange() {
    updateIdentity({
      ...identity,
      comingSoon: !identity.comingSoon,
    });
  }

  function handleLogoChange(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];

    if (!file) {
      return;
    }

    if (!acceptedLogoTypes.includes(file.type)) {
      setErrors({
        ...errors,
        logo: "Use a PNG, SVG, or WebP logo.",
      });
      return;
    }

    if (file.size > MAX_LOGO_SIZE_BYTES) {
      setErrors({
        ...errors,
        logo: "Logo must be 512 KB or smaller.",
      });
      return;
    }

    const reader = new FileReader();

    reader.onload = () => {
      const logoUrl = typeof reader.result === "string" ? reader.result : null;

      updateIdentity({
        ...identity,
        logoUrl,
      });
      setErrors((currentErrors) => {
        const { logo, ...remainingErrors } = currentErrors;

        return remainingErrors;
      });
    };

    reader.readAsDataURL(file);
  }

  function clearLogo() {
    updateIdentity({
      ...identity,
      logoUrl: null,
    });
  }

  async function copyEmbedCode() {
    if (!navigator.clipboard?.writeText) {
      return;
    }

    await navigator.clipboard.writeText(embedCode);
    setEmbedCopied(true);

    if (embedCopiedTimerRef.current) {
      clearTimeout(embedCopiedTimerRef.current);
    }

    embedCopiedTimerRef.current = setTimeout(() => {
      setEmbedCopied(false);
    }, 2000);
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const normalizedIdentity = normalizeTenantIdentity(identity);
    const nextErrors = validateIdentity(identity);
    setErrors(nextErrors);

    if (hasErrors(nextErrors) || !normalizedIdentity) {
      return;
    }

    setIsSaving(true);

    try {
      await onSave?.(normalizedIdentity);
      setIdentity(normalizedIdentity);
      setIsDirty(false);
      setSaved(true);

      if (savedTimerRef.current) {
        clearTimeout(savedTimerRef.current);
      }

      savedTimerRef.current = setTimeout(() => {
        setSaved(false);
      }, 2000);
    } catch (err) {
      if (!(err instanceof PersistenceError)) {
        throw err;
      }

      setSaveError(true);

      if (saveErrorTimerRef.current) {
        clearTimeout(saveErrorTimerRef.current);
      }

      saveErrorTimerRef.current = setTimeout(() => {
        setSaveError(false);
      }, 4000);
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[minmax(0,24rem)_1fr]">
      <form
        className="rounded-lg border border-[var(--admin-sidebar-border)] bg-[var(--admin-sidebar-bg)] p-5"
        onSubmit={handleSubmit}
        ref={formRef}
      >
        {showHeader ? (
          <div>
            <h1 className="text-3xl font-semibold tracking-normal">
              Company Identity
            </h1>
            <p className="mt-3 text-sm leading-6 text-[var(--text-muted-4)]">
              Customize how your changelog appears to visitors.
            </p>
          </div>
        ) : null}

        <div className={showHeader ? "mt-8 grid gap-5" : "grid gap-5"}>
          <label className="grid gap-2">
            <span className="text-sm font-semibold">Brand name</span>
            <input
              className="rounded-md border border-[var(--admin-input-border)] bg-[var(--surface-card)] px-3 py-2 text-base text-[var(--text-primary)] outline-none transition focus:border-[var(--admin-input-focus)] focus:ring-2 focus:ring-[var(--admin-input-focus)]/20"
              onChange={handleBrandNameChange}
              placeholder="e.g. Acme Corp"
              type="text"
              value={identity.brandName}
            />
            {errors.brandName ? (
              <span className="text-sm font-medium text-[var(--text-primary)]">
                {errors.brandName}
              </span>
            ) : null}
          </label>

          <label className="grid gap-2">
            <span className="text-sm font-semibold">Page slug</span>
            <input
              className="rounded-md border border-[var(--admin-input-border)] bg-[var(--surface-card)] px-3 py-2 text-base text-[var(--text-primary)] outline-none transition focus:border-[var(--admin-input-focus)] focus:ring-2 focus:ring-[var(--admin-input-focus)]/20"
              onBlur={handleSlugBlur}
              onChange={handleSlugChange}
              placeholder="acme"
              type="text"
              value={identity.slug}
            />
            <p className="text-xs text-[var(--text-muted-4)]">
              {origin}/{identity.slug || "slug"}
            </p>
            {errors.slug ? (
              <span className="text-sm font-medium text-[var(--text-primary)]">
                {errors.slug}
              </span>
            ) : null}
          </label>

          <div className="grid gap-4 border-t border-[var(--border-subtle)] pt-5">
            <div>
              <p className="text-sm font-semibold">Logo controls</p>
              <p className="mt-1 text-sm leading-6 text-[var(--text-muted-4)]">
                Upload a logo file or paste a hosted logo URL. Leave blank to
                use the wordmark.
              </p>
            </div>

            <AdminSegmentedControl
              getLabel={(mode) =>
                mode === "upload" ? "Upload file" : "Paste URL"
              }
              onChange={setLogoInputMode}
              options={logoInputModes}
              value={logoInputMode}
            />

            {logoInputMode === "upload" ? (
              <div className="grid gap-2">
                <label className="text-sm font-semibold" htmlFor="tenant-logo">
                  Upload file
                </label>
                <input
                  accept={acceptedLogoTypes.join(",")}
                  className="rounded-md border border-[var(--admin-input-border)] bg-[var(--surface-card)] px-3 py-2 text-sm text-[var(--text-primary)] file:mr-3 file:border-0 file:bg-[var(--tag-bg)] file:px-3 file:py-1.5 file:text-sm file:font-medium file:text-[var(--text-primary)] focus:border-[var(--admin-input-focus)] focus:outline-none focus:ring-2 focus:ring-[var(--admin-input-focus)]/20"
                  id="tenant-logo"
                  onChange={handleLogoChange}
                  type="file"
                />
                <p className="text-sm leading-6 text-[var(--text-muted-4)]">
                  PNG, SVG, or WebP. Max 512 KB.
                </p>
              </div>
            ) : (
              <div className="grid gap-2">
                <label
                  className="text-sm font-semibold"
                  htmlFor="tenant-logo-url"
                >
                  Paste URL
                </label>
                <input
                  className="rounded-md border border-[var(--admin-input-border)] bg-[var(--surface-card)] px-3 py-2 text-base text-[var(--text-primary)] outline-none transition focus:border-[var(--admin-input-focus)] focus:ring-2 focus:ring-[var(--admin-input-focus)]/20"
                  id="tenant-logo-url"
                  onChange={handleLogoUrlChange}
                  placeholder="https://example.com/logo.svg"
                  type="text"
                  value={identity.logoUrl ?? ""}
                />
              </div>
            )}

            <div className="grid gap-3 rounded-md border border-[var(--border-subtle)] bg-[var(--surface-card)] p-4">
              <div className="flex items-center justify-between gap-4">
                <p className="text-sm font-semibold">Logo preview</p>
                {identity.logoUrl ? (
                  <button
                    className="text-sm font-medium text-[var(--text-primary)] underline underline-offset-4"
                    onClick={clearLogo}
                    type="button"
                  >
                    Remove
                  </button>
                ) : null}
              </div>
              <div className="flex h-20 items-center justify-center rounded-md border border-[var(--border-subtle)] bg-[var(--surface-header)] px-4">
                {identity.logoUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    alt={`${identity.brandName} logo preview`}
                    className="max-h-10 max-w-full object-contain"
                    src={identity.logoUrl}
                  />
                ) : (
                  <span className="text-sm font-semibold text-[var(--text-muted-5)]">
                    {identity.brandName || "Brand name"}
                  </span>
                )}
              </div>
            </div>

            {errors.logo ? (
              <span className="text-sm font-medium text-[var(--text-primary)]">
                {errors.logo}
              </span>
            ) : null}
          </div>

          <div className="grid gap-2 border-t border-[var(--border-subtle)] pt-5">
            <label className="text-sm font-semibold" htmlFor="tenant-accent">
              Accent color
            </label>
            <div className="grid grid-cols-[3rem_1fr] gap-3">
              <input
                aria-label="Accent color picker"
                className="h-11 w-12 rounded-md border border-[var(--admin-input-border)] bg-[var(--surface-card)] p-1"
                id="tenant-accent"
                onChange={(event) => handleAccentChange(event.target.value)}
                type="color"
                value={normalizedAccent ?? DEFAULT_TENANT_IDENTITY.accentBg}
              />
              <input
                className="rounded-md border border-[var(--admin-input-border)] bg-[var(--surface-card)] px-3 py-2 text-base text-[var(--text-primary)] outline-none transition focus:border-[var(--admin-input-focus)] focus:ring-2 focus:ring-[var(--admin-input-focus)]/20"
                onChange={(event) => handleAccentChange(event.target.value)}
                placeholder="#d7ef7d"
                type="text"
                value={identity.accentBg}
              />
            </div>
            {errors.accentBg ? (
              <span className="text-sm font-medium text-[var(--text-primary)]">
                {errors.accentBg}
              </span>
            ) : null}
          </div>

          <div className="grid gap-2">
            <label className="text-sm font-semibold" htmlFor="tenant-accent-text">
              Accent text
            </label>
            <div className="grid grid-cols-[3rem_1fr] gap-3">
              <input
                aria-label="Accent text color picker"
                className="h-11 w-12 rounded-md border border-[var(--admin-input-border)] bg-[var(--surface-card)] p-1"
                id="tenant-accent-text"
                onChange={(event) => handleAccentTextChange(event.target.value)}
                type="color"
                value={
                  normalizeHexColor(identity.accentText) ??
                  DEFAULT_TENANT_IDENTITY.accentText
                }
              />
              <input
                className="rounded-md border border-[var(--admin-input-border)] bg-[var(--surface-card)] px-3 py-2 text-base text-[var(--text-primary)] outline-none transition focus:border-[var(--admin-input-focus)] focus:ring-2 focus:ring-[var(--admin-input-focus)]/20"
                onChange={(event) => handleAccentTextChange(event.target.value)}
                placeholder="#263400"
                type="text"
                value={identity.accentText}
              />
            </div>
            {errors.accentText ? (
              <span className="text-sm font-medium text-[var(--text-primary)]">
                {errors.accentText}
              </span>
            ) : null}
          </div>

          <div className="grid gap-2 border-t border-[var(--border-subtle)] pt-5">
            <label className="text-sm font-semibold" htmlFor="tenant-color-scheme">
              Color scheme
            </label>
            <select
              className="rounded-md border border-[var(--admin-input-border)] bg-[var(--surface-card)] px-3 py-2 text-base text-[var(--text-primary)] outline-none transition focus:border-[var(--admin-input-focus)] focus:ring-2 focus:ring-[var(--admin-input-focus)]/20"
              id="tenant-color-scheme"
              onChange={(event) =>
                handleColorSchemeChange(
                  event.target.value as TenantIdentity["colorScheme"],
                )
              }
              value={identity.colorScheme ?? "light"}
            >
              <option value="light">Light</option>
              <option value="dark">Dark</option>
            </select>
          </div>

          <div className="grid gap-2">
            <label className="text-sm font-semibold" htmlFor="tenant-font-family">
              Typography
            </label>
            <select
              className="rounded-md border border-[var(--admin-input-border)] bg-[var(--surface-card)] px-3 py-2 text-base text-[var(--text-primary)] outline-none transition focus:border-[var(--admin-input-focus)] focus:ring-2 focus:ring-[var(--admin-input-focus)]/20"
              id="tenant-font-family"
              onChange={(event) =>
                handleFontFamilyChange(
                  event.target.value as TenantIdentity["fontFamily"],
                )
              }
              value={identity.fontFamily ?? "sans"}
            >
              <option value="sans">Sans</option>
              <option value="serif">Serif</option>
              <option value="mono">Mono</option>
            </select>
            <p className="text-sm leading-6 text-[var(--text-muted-4)]">
              Applies to the tenant public page and admin previews.
            </p>
          </div>

          <div className="grid gap-3">
            <div>
              <p className="text-sm font-semibold">Layout options</p>
              <p className="mt-1 text-sm leading-6 text-[var(--text-muted-4)]">
                Choose where the release status badge appears in previews.
              </p>
            </div>
            <AdminSegmentedControl
              getLabel={(position) => `Badge ${position}`}
              onChange={handleBadgePositionChange}
              options={["left", "right"] as const}
              value={identity.badgePosition ?? "right"}
            />
          </div>

          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-sm font-semibold">Coming soon mode</p>
              <p className="mt-1 text-sm leading-6 text-[var(--text-muted-4)]">
                Hides your releases and shows a coming soon landing page
                instead.
              </p>
            </div>
            <button
              aria-pressed={identity.comingSoon === true}
              className={
                identity.comingSoon
                  ? "flex h-7 w-12 shrink-0 items-center justify-end rounded-full bg-[var(--accent-bg)] p-1 transition"
                  : "flex h-7 w-12 shrink-0 items-center justify-start rounded-full bg-[var(--tag-bg)] p-1 transition"
              }
              onClick={handleComingSoonChange}
              type="button"
            >
              <span className="h-5 w-5 rounded-full bg-[var(--surface-card)]" />
            </button>
          </div>

          <div className="grid gap-3 border-t border-[var(--border-subtle)] pt-5">
            <div>
              <p className="text-sm font-semibold">Embed</p>
              <p className="mt-1 text-xs leading-5 text-[var(--text-muted-4)]">
                Paste into any webpage to show your latest releases.
              </p>
            </div>
            <pre className="overflow-x-auto rounded-md border border-[var(--border-subtle)] bg-[var(--surface-card)] p-3 text-[12px] leading-5 text-[var(--text-muted-6)]">
              <code>{embedCode}</code>
            </pre>
            <button
              className="w-fit rounded-full bg-[var(--tag-bg)] px-4 py-2 text-sm font-semibold text-[var(--text-primary)] transition hover:text-[var(--text-muted-7)]"
              onClick={copyEmbedCode}
              type="button"
            >
              {embedCopied ? "Copied" : "Copy embed code"}
            </button>
          </div>
        </div>

        <button
          className="mt-8 w-full bg-[var(--admin-save-bg)] px-4 py-3 text-sm font-semibold text-[var(--admin-save-text)] transition disabled:bg-[var(--tag-bg)] disabled:text-[var(--text-muted-5)]"
          disabled={!isDirty || isSaving || hasErrors(errors)}
          type="submit"
        >
          {isSaving ? "Saving..." : saved ? "Identity saved" : "Save identity"}
        </button>
        {saveError ? (
          <div className="mt-4">
            <InlineErrorBanner
              description="The tenant identity could not be saved. Browser storage may be full or temporarily unavailable."
              icon="ti-device-floppy-off"
              primaryAction={{
                icon: "ti-refresh",
                label: "Retry",
                onClick: () => formRef.current?.requestSubmit(),
              }}
              secondaryAction={{
                href: "/admin/releases",
                icon: "ti-notes",
                label: "Back to releases",
              }}
              title="Failed to save tenant identity"
            />
          </div>
        ) : null}
      </form>

      <BrandIdentityPreview identity={identity} />
    </div>
  );
}
