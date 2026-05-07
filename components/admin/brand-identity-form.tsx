"use client";

import {
  type ChangeEvent,
  type FormEvent,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { BrandIdentityPreview } from "./brand-identity-preview";
import {
  DEFAULT_TENANT_IDENTITY,
  MAX_LOGO_SIZE_BYTES,
  getReadableTextColor,
  normalizeTenantIdentity,
  normalizeHexColor,
  validateIdentity,
  type IdentityFormErrors,
  type TenantIdentity,
} from "./identity-types";

type BrandIdentityFormProps = {
  initialIdentity?: TenantIdentity;
  onSave?: (identity: TenantIdentity) => Promise<void> | void;
  showHeader?: boolean;
};

const acceptedLogoTypes = ["image/png", "image/svg+xml", "image/webp"];

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
  const savedTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const normalizedAccent = useMemo(
    () => normalizeHexColor(identity.accentBg),
    [identity.accentBg],
  );

  useEffect(() => {
    setIdentity(initialIdentity);
    setErrors({});
    setIsDirty(false);
    setIsSaving(false);
    setSaved(false);
  }, [initialIdentity]);

  useEffect(() => {
    return () => {
      if (savedTimerRef.current) {
        clearTimeout(savedTimerRef.current);
      }
    };
  }, []);

  function updateIdentity(nextIdentity: TenantIdentity) {
    setIdentity(nextIdentity);
    setIsDirty(true);
    setSaved(false);
    setErrors(validateIdentity(nextIdentity));
  }

  function handleBrandNameChange(event: ChangeEvent<HTMLInputElement>) {
    updateIdentity({
      ...identity,
      brandName: event.target.value,
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
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <div className="grid gap-8 lg:grid-cols-[minmax(0,24rem)_1fr]">
      <form
        className="border border-[var(--admin-sidebar-border)] bg-[var(--admin-sidebar-bg)] p-6"
        onSubmit={handleSubmit}
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

        <div className={showHeader ? "mt-8 grid gap-6" : "grid gap-6"}>
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
              <span className="text-sm text-red-700">{errors.brandName}</span>
            ) : null}
          </label>

          <div className="grid gap-2">
            <label className="text-sm font-semibold" htmlFor="tenant-logo">
              Logo
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
            {identity.logoUrl ? (
              <button
                className="w-fit text-sm font-medium text-[var(--text-primary)] underline underline-offset-4"
                onClick={clearLogo}
                type="button"
              >
                Remove logo
              </button>
            ) : null}
            {errors.logo ? (
              <span className="text-sm text-red-700">{errors.logo}</span>
            ) : null}
          </div>

          <div className="grid gap-2">
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
              <span className="text-sm text-red-700">{errors.accentBg}</span>
            ) : null}
          </div>
        </div>

        <button
          className="mt-8 w-full bg-[var(--admin-save-bg)] px-4 py-3 text-sm font-semibold text-[var(--admin-save-text)] transition disabled:bg-[var(--tag-bg)] disabled:text-[var(--text-muted-5)]"
          disabled={!isDirty || isSaving || hasErrors(errors)}
          type="submit"
        >
          {isSaving ? "Saving..." : saved ? "Identity saved" : "Save identity"}
        </button>
      </form>

      <BrandIdentityPreview identity={identity} />
    </div>
  );
}
