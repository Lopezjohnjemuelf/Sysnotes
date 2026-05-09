import type { Metadata } from "next";
import Link from "next/link";
import { TenantWordmark } from "@/components/admin";

export const metadata: Metadata = {
  title: "About | Sysnotes by JFL",
  description: "About Sysnotes by JFL.",
};

const navLinks = [
  { label: "About", href: "/about" },
  { label: "Login", href: "/login" },
];

export default function AboutPage() {
  return (
    <main className="min-h-screen bg-[var(--surface-page)] text-[var(--text-primary)]">
      <section className="sticky top-0 z-20 border-b border-[var(--header-border)] bg-[var(--header-bg)]">
        <div className="mx-auto flex max-w-[90rem] items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
          <Link className="text-lg tracking-normal" href="/">
            <TenantWordmark />
          </Link>
          <nav className="flex items-center gap-3 text-sm text-[var(--header-link-color)] sm:gap-8">
            {navLinks.map((link) => (
              <Link
                className={
                  link.label === "Login"
                    ? "rounded-full bg-[var(--tenant-accent-bg)] px-4 py-2 font-medium text-[var(--tenant-accent-text)] transition hover:text-[var(--tenant-accent-text)]"
                    : "border-b border-transparent pb-1 transition hover:border-[var(--tenant-accent-bg)] hover:text-[var(--header-link-hover)]"
                }
                href={link.href}
                key={link.href}
              >
                {link.label}
              </Link>
            ))}
          </nav>
        </div>
      </section>

      <section className="mx-auto max-w-[90rem] px-4 py-16 sm:px-6 lg:px-8 lg:py-24">
        <div className="grid gap-10 lg:grid-cols-[0.85fr_1.15fr]">
          <div>
            <p className="w-fit rounded-full border border-[var(--border-subtle)] bg-[var(--hero-pill-bg)] px-4 py-2 text-sm font-medium text-[var(--hero-pill-text)]">
              About
            </p>
            <h1 className="mt-8 max-w-3xl font-serif text-[4rem] font-semibold uppercase leading-[0.88] tracking-normal text-balance sm:text-[6rem] lg:text-[8rem]">
              Sysnotes by JFL
            </h1>
          </div>

          <div className="rounded-lg border border-[var(--border-subtle)] bg-[var(--surface-card)] p-6 sm:p-8">
            <p className="text-2xl font-semibold leading-tight tracking-normal">
              A minimalist changelog website for teams that need to publish
              releases, explain web updates, and keep customers aligned without
              visual clutter.
            </p>
            <div className="mt-10 grid gap-5 sm:grid-cols-2">
              <article className="border-t border-[var(--border-light)] pt-5">
                <p className="text-sm font-medium uppercase tracking-[0.18em] text-[var(--text-muted-1)]">
                  Releases
                </p>
                <p className="mt-3 leading-7 text-[var(--text-muted-5)]">
                  Versioned updates use one naming convention: version, date,
                  title, summary, and tags.
                </p>
              </article>
              <article className="border-t border-[var(--border-light)] pt-5">
                <p className="text-sm font-medium uppercase tracking-[0.18em] text-[var(--text-muted-1)]">
                  Website
                </p>
                <p className="mt-3 leading-7 text-[var(--text-muted-5)]">
                  Web changes are tracked with short labels and clear change
                  descriptions.
                </p>
              </article>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
