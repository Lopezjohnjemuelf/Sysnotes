import { TenantPoweredBy } from "./tenant-powered-by";

type TenantFooterProps = {
  slug: string;
};

export function TenantFooter({ slug }: TenantFooterProps) {
  return (
    <footer className="flex flex-wrap items-center justify-center gap-x-3 gap-y-2 border-t border-[var(--border-subtle)] px-4 py-5 text-center text-xs leading-5 text-[var(--text-muted-4)]">
      <TenantPoweredBy />
      <a
        className="grid h-8 w-8 place-items-center text-[var(--text-muted-4)] transition hover:text-[var(--text-primary)]"
        href={`/${slug}/feed.xml`}
        target="_blank"
        title="Subscribe via RSS"
      >
        <i aria-hidden="true" className="ti ti-rss text-[14px]" />
        <span className="sr-only">Subscribe via RSS</span>
      </a>
    </footer>
  );
}
