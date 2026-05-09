import type { TenantIdentity } from "@/lib/types";
import { TenantBrandMark } from "./tenant-brand";

type TenantHeaderProps = {
  identity: TenantIdentity;
};

export function TenantHeader({ identity }: TenantHeaderProps) {
  return (
    <header className="sticky top-0 z-30 h-14 border-b border-[var(--border-subtle)] bg-[var(--surface-header)]">
      <div className="mx-auto flex h-full max-w-[90rem] items-center justify-between gap-3 px-4 sm:px-6 lg:px-8">
        <a
          className="flex min-w-0 items-center"
          href={`/${identity.slug}`}
        >
          <TenantBrandMark identity={identity} />
        </a>

        <button
          className="h-9 shrink-0 cursor-pointer border border-[var(--border-light)] bg-transparent px-3 text-[13px] text-[var(--text-primary)]"
          type="button"
        >
          Subscribe
        </button>
      </div>
    </header>
  );
}
