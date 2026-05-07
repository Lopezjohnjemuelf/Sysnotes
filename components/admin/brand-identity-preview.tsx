import type { CSSProperties } from "react";
import type { TenantIdentity } from "./identity-types";

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
  const previewStyle = {
    "--tenant-accent-bg": identity.accentBg,
    "--tenant-accent-text": identity.accentText,
  } as CSSProperties;

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
          <span className="rounded-full bg-[var(--tenant-accent-bg)] px-3 py-1 text-sm font-medium text-[var(--tenant-accent-text)]">
            Live
          </span>
        </div>
      </div>

      <div className="mt-5 border border-[var(--border-subtle)] p-4">
        <p className="text-sm font-medium text-[var(--text-muted-2)]">Latest</p>
        <p className="mt-2 text-2xl font-semibold tracking-normal">v2.4.0</p>
        <p className="mt-4 text-base font-semibold tracking-normal">
          Public changelog refresh
        </p>
        <p className="mt-2 text-sm leading-6 text-[var(--release-summary-color)]">
          A quieter release-note experience with tenant-aware identity accents.
        </p>
      </div>
    </section>
  );
}
