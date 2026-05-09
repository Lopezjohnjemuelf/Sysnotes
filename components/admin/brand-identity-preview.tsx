import type { CSSProperties } from "react";
import { getTenantTheme } from "@/components/tenant/tenant-theme";
import type { TenantIdentity } from "@/lib/types";

type BrandIdentityPreviewProps = {
  identity: TenantIdentity;
};

function Wordmark({ brandName }: { brandName: string }) {
  if (brandName === "Sysnotes by JFL") {
    return (
      <>
        <span className="font-semibold">Sysnotes</span>{" "}
        <span className="text-[0.85em] font-normal text-[var(--text-muted-4)]">
          by JFL
        </span>
      </>
    );
  }

  return <span className="font-semibold">{brandName || "Brand name"}</span>;
}

export function BrandIdentityPreview({ identity }: BrandIdentityPreviewProps) {
  const tenantTheme = getTenantTheme(identity);
  const badgePosition = identity.badgePosition ?? "right";
  const fontFamily = identity.fontFamily ?? "sans";
  const colorScheme = identity.colorScheme ?? "light";
  const previewStyle = {
    "--tenant-accent-bg": tenantTheme.accentBg,
    "--tenant-accent-text": tenantTheme.accentText,
    fontFamily: tenantTheme.font,
  } as CSSProperties;

  const liveBadge = (
    <span className="shrink-0 rounded-full bg-[var(--tenant-accent-bg)] px-3 py-1 text-sm font-medium text-[var(--tenant-accent-text)]">
      Live
    </span>
  );

  return (
    <section
      aria-label="Brand identity preview"
      className="border border-[var(--admin-preview-border)] bg-[var(--surface-card)] p-5"
      style={previewStyle}
    >
      <p className="text-sm font-medium uppercase tracking-[0.18em] text-[var(--text-muted-5)]">
        Preview
      </p>

      <div className="mt-5 border border-[var(--border-subtle)] bg-[var(--surface-header)]">
        <div className="flex items-center justify-between gap-5 px-4 py-4">
          {badgePosition === "left" ? liveBadge : null}
          <div className="min-w-0 text-base tracking-normal text-[var(--text-primary)]">
            {identity.logoUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                alt={`${identity.brandName} logo`}
                className="max-h-7 max-w-48 object-contain"
                src={identity.logoUrl}
              />
            ) : (
              <Wordmark brandName={identity.brandName} />
            )}
          </div>
          {badgePosition === "right" ? liveBadge : null}
        </div>
      </div>

      <div className="mt-5 border border-[var(--border-subtle)] p-4">
        {identity.comingSoon ? (
          <>
            <span className="rounded-full bg-[var(--tenant-accent-bg)] px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.08em] text-[var(--tenant-accent-text)]">
              Coming soon
            </span>
            <p className="mt-4 text-2xl font-semibold tracking-normal">
              {identity.brandName} release notes
            </p>
            <p className="mt-3 text-sm leading-6 text-[var(--release-summary-color)]">
              We're working on something. Release notes and updates will appear
              here soon.
            </p>
          </>
        ) : (
          <>
            <p className="text-sm font-medium text-[var(--text-muted-2)]">
              Latest
            </p>
            <p className="mt-2 text-2xl font-semibold tracking-normal">
              v2.4.0
            </p>
            <p className="mt-4 text-base font-semibold tracking-normal">
              Public changelog refresh
            </p>
            <p className="mt-2 text-sm leading-6 text-[var(--release-summary-color)]">
              A quieter release-note experience with tenant-aware identity
              accents.
            </p>
          </>
        )}
        <p className="mt-3 text-sm italic text-[var(--text-muted-4)]">
          What you see is what you get.
        </p>

        <div className="mt-5 grid grid-cols-3 gap-2 border-t border-[var(--border-subtle)] pt-4 text-xs text-[var(--text-muted-4)]">
          <div>
            <p>Scheme</p>
            <p className="mt-1 font-semibold capitalize text-[var(--text-primary)]">
              {colorScheme}
            </p>
          </div>
          <div>
            <p>Type</p>
            <p className="mt-1 font-semibold capitalize text-[var(--text-primary)]">
              {fontFamily}
            </p>
          </div>
          <div>
            <p>Badge</p>
            <p className="mt-1 font-semibold capitalize text-[var(--text-primary)]">
              {badgePosition}
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
