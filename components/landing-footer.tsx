import Link from "next/link";
import { TenantWordmark } from "@/components/admin";

export function LandingFooter() {
  const year = new Date().getFullYear();

  return (
    <footer className="border-t border-[var(--footer-border)] bg-[var(--footer-bg)]">
      <div className="mx-auto grid max-w-[90rem] gap-5 px-4 py-6 text-sm text-[var(--footer-text)] sm:px-6 lg:grid-cols-[1fr_1fr] lg:items-center lg:px-8">
        <div>
          <Link
            className="text-lg tracking-normal text-[var(--text-primary)]"
            href="/"
          >
            <TenantWordmark />
          </Link>
          <p className="mt-2">Copyright {year} JFL. All rights reserved.</p>
        </div>

        <p className="lg:text-right">Built for clarity.</p>
      </div>
    </footer>
  );
}
