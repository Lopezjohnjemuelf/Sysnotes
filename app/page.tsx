/*
 * SYSNOTES ROOT PAGE IS FROZEN.
 * This page is reserved for Sysnotes-owned releases only.
 * Do not add tenant release marketing, tenant coming soon states, tenant branding, or tenant-managed release content here.
 * All tenant-facing release pages must be implemented under /[slug]/*.
 */

import Link from "next/link";
import Image from "next/image";
import { TenantWordmark } from "@/components/admin";
import { LandingMotion } from "@/components/landing-motion";
import { TagFilter } from "@/components/tag-filter";
import { getReleasePath, releaseNotes } from "@/data/releases";

const webChanges = [
  {
    label: "Navigation",
    change: "Condensed the header and added persistent release filters.",
  },
  {
    label: "Content",
    change: "Standardized note titles, descriptions, dates, and category naming.",
  },
  {
    label: "Design",
    change: "Updated spacing, typography, and contrast for a quieter modern interface.",
  },
  {
    label: "Performance",
    change: "Reduced visual weight and kept the page static-first for quick loads.",
  },
];

const metrics = [
  { value: "12", label: "Releases shipped" },
  { value: "38", label: "Changes tracked" },
  { value: "99.9%", label: "Website uptime" },
];

const intelligenceFeatures = [
  {
    label: "Migration and support",
    copy:
      "Structured publishing support keeps release notes organized as teams move updates into Sysnotes.",
    mark: "01",
  },
  {
    label: "Security and compliance",
    copy:
      "Clear public release history helps teams document changes, review status, and keep stakeholders aligned.",
    mark: "02",
  },
  {
    label: "Access control",
    copy:
      "Draft, private, and published states separate internal review from customer-facing release communication.",
    mark: "03",
  },
  {
    label: "Auth-protected content",
    copy:
      "Private release links make sensitive updates available only to the people who should review them.",
    mark: "04",
  },
];

const navLinks = [
  { label: "About", href: "/about" },
  { label: "Login", href: "/login" },
];

export default function Home() {
  const year = new Date().getFullYear();

  return (
    <main className="landing-motion-surface min-h-screen bg-[var(--surface-page)] text-[var(--text-primary)]">
      <LandingMotion />
      <section className="sticky top-0 z-20 border-b border-[var(--header-border)] bg-[var(--header-bg)]">
        <div className="mx-auto flex max-w-[90rem] items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
          <Link
            aria-label="Sysnotes home"
            className="landing-link flex items-center gap-3"
            href="/"
          >
            <Image
              alt=""
              className="h-9 w-9 rounded-full object-cover ring-1 ring-[var(--border-subtle)]"
              height={36}
              priority
              src="/sysnotes-logo.jpg"
              width={36}
            />
            <span className="text-lg tracking-normal">
              <TenantWordmark />
            </span>
          </Link>
          <nav className="flex items-center gap-3 text-sm text-[var(--header-link-color)] sm:gap-8">
            {navLinks.map((link) => (
              <Link
                className={
                  link.label === "Login"
                    ? "landing-button rounded-full bg-[var(--tenant-accent-bg)] px-4 py-2 font-medium text-[var(--tenant-accent-text)] hover:text-[var(--tenant-accent-text)]"
                    : "landing-link border-b border-transparent pb-1 hover:border-[var(--tenant-accent-bg)] hover:text-[var(--header-link-hover)]"
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

      <section className="mx-auto max-w-[90rem] px-4 pb-12 pt-10 sm:px-6 lg:px-8 lg:pb-16">
        <div className="flex flex-col gap-9">
          <h1 className="landing-hero-title max-w-7xl font-serif text-[4.08rem] font-semibold uppercase leading-[0.84] tracking-normal text-balance sm:text-[5.95rem] lg:text-[8.16rem]">
            Keep web updates clear, current, and easy to scan.
          </h1>

          <p className="landing-hero-pill w-fit rounded-full border border-[var(--border-subtle)] bg-[var(--hero-pill-bg)] px-4 py-2 text-sm font-medium text-[var(--hero-pill-text)]">
            Release notes and website changes
          </p>

          <aside
            aria-label="Latest release"
            className="landing-hero-card grid overflow-hidden rounded-lg border border-[var(--border-light)] bg-[var(--hero-card-bg)] shadow-[var(--hero-card-shadow)] lg:min-h-[27rem] lg:grid-cols-[0.9fr_1.1fr]"
          >
            <div className="flex flex-col justify-between border-t-4 border-[var(--tenant-accent-bg)] p-6 sm:p-8">
              <div className="flex items-start justify-between gap-6">
                <div>
                  <p className="text-sm font-medium text-[var(--text-muted-2)]">
                    Latest
                  </p>
                  <Link
                    className="landing-link mt-2 block text-3xl font-semibold tracking-normal hover:text-[var(--text-muted-7)]"
                    href={getReleasePath(releaseNotes[0].version)}
                  >
                    {releaseNotes[0].version}
                  </Link>
                </div>
                <span className="rounded-full bg-[var(--hero-badge-bg)] px-3 py-1 text-sm font-medium text-[var(--hero-badge-text)]">
                  Live
                </span>
              </div>
              <div className="mt-12">
                <Link
                  className="landing-link block text-3xl font-semibold tracking-normal hover:text-[var(--text-muted-7)] sm:text-4xl"
                  href={getReleasePath(releaseNotes[0].version)}
                >
                  {releaseNotes[0].title}
                </Link>
                <p className="mt-4 max-w-2xl text-base leading-7 text-[var(--release-summary-color)]">
                  {releaseNotes[0].summary}
                </p>
                <p className="mt-6 max-w-2xl text-lg leading-8 text-[var(--text-muted-5)]">
                  A minimalist changelog website for teams that need to publish
                  releases, explain web updates, and keep customers aligned
                  without visual clutter.
                </p>
                <div className="mt-8 flex flex-wrap gap-2">
                  {releaseNotes[0].tags.map((tag) => (
                    <span
                      className="rounded-full bg-[var(--release-tag-bg)] px-3 py-1 text-sm text-[var(--release-tag-text)]"
                      key={tag}
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            <div className="relative hidden border-l border-[var(--border-subtle)] bg-[var(--surface-page)] p-8 lg:block">
              <div className="landing-visual-float absolute inset-8 grid grid-cols-[1fr_0.65fr] gap-4 opacity-80 blur-sm">
                <div className="space-y-4">
                  <div className="h-14 rounded-full border border-[var(--border-subtle)] bg-[var(--surface-card)]" />
                  <div className="h-24 rounded-lg border border-[var(--border-subtle)] bg-[var(--surface-card)]" />
                  <div className="h-20 rounded-lg border border-[var(--border-subtle)] bg-[var(--tenant-accent-bg)]" />
                  <div className="h-28 rounded-lg border border-[var(--border-subtle)] bg-[var(--surface-card)]" />
                </div>
                <div className="space-y-4 pt-12">
                  <div className="h-28 rounded-lg border border-[var(--border-subtle)] bg-[var(--surface-card)]" />
                  <div className="h-20 rounded-full border border-[var(--border-subtle)] bg-[var(--tenant-accent-bg)]" />
                  <div className="h-24 rounded-lg border border-[var(--border-subtle)] bg-[var(--surface-card)]" />
                </div>
              </div>
            </div>
          </aside>
        </div>
      </section>

      <section
        className="mx-auto grid max-w-[90rem] gap-0 px-4 pb-16 sm:px-6 lg:grid-cols-3 lg:px-8"
        id="summary"
      >
        {metrics.map((metric) => (
          <div
            className="landing-card-motion border-t border-[var(--metric-border)] py-6 lg:border-r lg:px-8 lg:first:pl-0 lg:last:border-r-0"
            data-landing-reveal
            key={metric.label}
          >
            <p className="text-4xl font-semibold tracking-normal text-[var(--metric-value-color)]">
              {metric.value}
            </p>
            <p className="mt-2 text-sm uppercase tracking-[0.18em] text-[var(--metric-label-color)]">
              {metric.label}
            </p>
          </div>
        ))}
      </section>

      <section
        className="mx-auto max-w-[90rem] px-4 py-20 sm:px-6 lg:px-8 lg:py-24"
        data-landing-reveal
      >
        <div className="mx-auto max-w-3xl text-center">
          <h2 className="text-4xl font-semibold leading-tight tracking-normal sm:text-5xl">
            Enterprise-grade release intelligence
          </h2>
          <p className="mx-auto mt-5 max-w-xl text-base leading-7 text-[var(--text-muted-5)]">
            Sysnotes scales with your team, offering the structure, review
            controls, and publishing clarity modern changelog workflows need.
          </p>
          <Link
            className="landing-button mt-6 inline-flex rounded-full bg-[var(--tag-bg)] px-4 py-2 text-sm font-medium text-[var(--text-primary)] hover:text-[var(--text-muted-7)]"
            href="#release-notes"
          >
            Learn more
          </Link>
        </div>

        <div className="mt-14 grid gap-8 lg:grid-cols-[minmax(0,15rem)_minmax(22rem,1fr)_minmax(0,15rem)] lg:items-center">
          <div className="grid gap-12 sm:grid-cols-2 lg:grid-cols-1">
            {intelligenceFeatures.slice(0, 2).map((feature) => (
              <article
                className="landing-card-motion rounded-lg border border-transparent p-1"
                key={feature.label}
              >
                <div className="grid h-11 w-11 place-items-center rounded-lg border border-[var(--border-subtle)] bg-[var(--surface-card)] font-mono text-xs text-[var(--text-muted-5)]">
                  {feature.mark}
                </div>
                <h3 className="mt-4 text-xl font-semibold tracking-normal">
                  {feature.label}
                </h3>
                <p className="mt-4 text-base leading-7 text-[var(--text-muted-5)]">
                  {feature.copy}
                </p>
              </article>
            ))}
          </div>

          <div className="landing-card-motion relative min-h-[24rem] overflow-hidden rounded-lg border border-[var(--border-subtle)] bg-[var(--surface-card)]">
            <div className="landing-visual-drift absolute -left-16 top-10 h-24 w-[44rem] rounded-full bg-[var(--accent-bg)] opacity-80" />
            <div className="landing-visual-drift absolute -right-16 bottom-10 h-24 w-[44rem] rounded-full bg-[var(--accent-bg)] opacity-60" />
            <div className="absolute left-1/2 top-1/2 grid w-[76%] -translate-x-1/2 -translate-y-1/2 gap-4 rounded-lg border border-[var(--border-light)] bg-[var(--surface-page)] p-5 sm:grid-cols-[0.9fr_1.1fr]">
              <div className="grid grid-cols-2 gap-2">
                {["Draft", "Review", "Live", "Share"].map((item) => (
                  <div
                    className="rounded-lg border border-[var(--border-subtle)] bg-[var(--surface-card)] p-3 text-center text-xs font-medium text-[var(--text-muted-5)]"
                    key={item}
                  >
                    {item}
                  </div>
                ))}
              </div>
              <div className="rounded-lg border border-[var(--border-subtle)] bg-[var(--surface-card)] p-5">
                <p className="text-xs uppercase tracking-[0.16em] text-[var(--text-muted-1)]">
                  Compliance
                </p>
                <div className="mt-5 grid grid-cols-2 gap-3">
                  <div className="grid aspect-square place-items-center rounded-full border border-[var(--border-subtle)] text-center text-xs font-semibold text-[var(--text-muted-6)]">
                    SOC 2
                  </div>
                  <div className="grid aspect-square place-items-center rounded-full border border-[var(--border-subtle)] text-center text-xs font-semibold text-[var(--text-muted-6)]">
                    ISO
                  </div>
                </div>
              </div>
              <div className="rounded-lg border border-[var(--border-subtle)] bg-[var(--surface-card)] p-4 sm:col-span-2">
                <p className="text-xs uppercase tracking-[0.16em] text-[var(--text-muted-1)]">
                  Release audience
                </p>
                <div className="mt-4 flex -space-x-2">
                  {["A", "B", "C", "D"].map((item) => (
                    <span
                      className="grid h-9 w-9 place-items-center rounded-full border border-[var(--surface-card)] bg-[var(--tag-bg)] text-xs font-semibold text-[var(--text-muted-6)]"
                      key={item}
                    >
                      {item}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div className="grid gap-12 sm:grid-cols-2 lg:grid-cols-1">
            {intelligenceFeatures.slice(2).map((feature) => (
              <article
                className="landing-card-motion rounded-lg border border-transparent p-1"
                key={feature.label}
              >
                <div className="grid h-11 w-11 place-items-center rounded-lg border border-[var(--border-subtle)] bg-[var(--surface-card)] font-mono text-xs text-[var(--text-muted-5)]">
                  {feature.mark}
                </div>
                <h3 className="mt-4 text-xl font-semibold tracking-normal">
                  {feature.label}
                </h3>
                <p className="mt-4 text-base leading-7 text-[var(--text-muted-5)]">
                  {feature.copy}
                </p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section
        className="border-y border-[var(--release-divider)] bg-[var(--release-section-bg)] py-20 lg:py-24"
        data-landing-reveal
        id="release-notes"
      >
        <div className="mx-auto max-w-[90rem] px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
            <div>
              <p className="text-sm font-medium uppercase tracking-[0.18em] text-[var(--text-muted-1)]">
                Releases
              </p>
              <h2 className="mt-3 text-4xl font-semibold tracking-normal">
                Latest release notes
              </h2>
            </div>
            <p className="max-w-md text-sm leading-6 text-[var(--text-muted-3)]">
              Versioned updates use one naming convention: version, date, title,
              summary, and tags.
            </p>
          </div>

          <div className="mt-10 grid gap-6 lg:grid-cols-[1fr_16rem]">
            <div>
              <TagFilter releases={releaseNotes} />
            </div>

            <aside className="landing-card-motion hidden self-start rounded-lg border border-[var(--border-light)] bg-[var(--surface-page)] p-5 lg:block">
              <p className="font-semibold">{releaseNotes[1].version}</p>
              <p className="mt-1 text-sm text-[var(--release-date-color)]">
                {releaseNotes[1].date}
              </p>
              <Link
                className="landing-link mt-8 block text-2xl font-semibold tracking-normal hover:text-[var(--text-muted-7)]"
                href={getReleasePath(releaseNotes[1].version)}
              >
                {releaseNotes[1].title}
              </Link>
              <p className="mt-3 text-sm leading-6 text-[var(--release-summary-color)]">
                {releaseNotes[1].summary}
              </p>
              <div className="mt-5 flex flex-wrap gap-2">
                {releaseNotes[1].tags.map((tag) => (
                  <span
                    className="rounded-full bg-[var(--release-tag-bg)] px-3 py-1 text-sm text-[var(--release-tag-text)]"
                    key={`featured-${tag}`}
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </aside>
          </div>
        </div>
      </section>

      <section
        className="mx-auto max-w-[90rem] px-4 py-16 sm:px-6 lg:px-8 lg:py-24"
        data-landing-reveal
        id="web-changes"
      >
        <div className="border-t border-[var(--release-divider)] pt-10">
          <div>
            <p className="text-sm font-medium uppercase tracking-[0.18em] text-[var(--text-muted-1)]">
              Website
            </p>
            <h2 className="mt-3 text-4xl font-semibold tracking-normal">
              Web changes
            </h2>
          </div>
          <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {webChanges.map((item) => (
              <article
                className="landing-card-motion min-h-40 rounded-lg border border-[var(--card-border)] bg-[var(--card-bg)] p-5"
                key={item.label}
              >
                <p className="text-sm font-semibold uppercase tracking-[0.14em] text-[var(--card-label-color)]">
                  {item.label}
                </p>
                <p className="mt-4 text-lg leading-7 text-[var(--card-body-color)]">
                  {item.change}
                </p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <footer className="border-t border-[var(--footer-border)] bg-[var(--footer-bg)]">
        <div className="mx-auto grid max-w-[90rem] gap-5 px-4 py-6 text-sm text-[var(--footer-text)] sm:px-6 lg:grid-cols-[1fr_auto_1fr] lg:items-center lg:px-8">
          <div>
            <Link className="text-lg tracking-normal text-[var(--text-primary)]" href="/">
              <TenantWordmark />
            </Link>
            <p className="mt-2">Copyright {year} JFL. All rights reserved.</p>
          </div>

          <nav
            aria-label="Footer navigation"
            className="flex flex-wrap gap-x-5 gap-y-2 text-[var(--footer-link-color)]"
          >
            {navLinks.map((link) => (
              <Link
                className="landing-link hover:text-[var(--footer-link-hover)]"
                href={link.href}
                key={`footer-${link.href}`}
              >
                {link.label}
              </Link>
            ))}
          </nav>

          <p className="lg:text-right">Built for clarity.</p>
        </div>
      </footer>
    </main>
  );
}
