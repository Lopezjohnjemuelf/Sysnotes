const releaseNotes = [
  {
    version: "v2.4.0",
    date: "May 6, 2026",
    title: "Public changelog refresh",
    summary:
      "A cleaner release-note experience with grouped updates, clearer status labels, and faster scanning.",
    tags: ["Product", "UX", "Website"],
  },
  {
    version: "v2.3.2",
    date: "April 22, 2026",
    title: "Search quality improvements",
    summary:
      "Release entries now rank more naturally by title, version, and category relevance.",
    tags: ["Search", "Performance"],
  },
  {
    version: "v2.3.0",
    date: "April 8, 2026",
    title: "Team publishing workflow",
    summary:
      "Editors can stage web changes, preview drafts, and publish notes with more predictable review steps.",
    tags: ["Workflow", "Admin"],
  },
];

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

const navLinks = [
  { label: "Releases", href: "#release-notes" },
  { label: "Web changes", href: "#web-changes" },
  { label: "Summary", href: "#summary" },
];

function BrandWordmark() {
  return (
    <>
      <span className="font-semibold">Sysnotes</span>{" "}
      <span className="text-[0.85em] font-normal text-[var(--text-muted-4)]">
        by JFL
      </span>
    </>
  );
}

export default function Home() {
  const year = new Date().getFullYear();

  return (
    <main className="min-h-screen bg-[var(--surface-page)] text-[var(--text-primary)]">
      <section className="border-b border-[var(--header-border)] bg-[var(--header-bg)]">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-5 sm:px-8">
          <a className="text-lg tracking-normal" href="#">
            <BrandWordmark />
          </a>
          <nav className="hidden items-center gap-7 text-sm text-[var(--header-link-color)] sm:flex">
            {navLinks.map((link) => (
              <a
                className="transition hover:text-[var(--header-link-hover)]"
                href={link.href}
                key={link.href}
              >
                {link.label}
              </a>
            ))}
          </nav>
        </div>
      </section>

      <section className="mx-auto grid max-w-7xl gap-10 px-5 py-16 sm:px-8 lg:grid-cols-[1.05fr_0.95fr] lg:py-24">
        <div className="flex flex-col justify-center">
          <p className="mb-5 w-fit rounded-full border border-[var(--border-subtle)] bg-[var(--hero-pill-bg)] px-4 py-2 text-sm font-medium text-[var(--hero-pill-text)]">
            Release notes and website changes
          </p>
          <h1 className="max-w-4xl text-5xl font-semibold leading-[1.02] tracking-normal text-balance sm:text-6xl lg:text-7xl">
            Sysnotes by JFL keeps product updates clear, current, and easy to
            scan.
          </h1>
          <p className="mt-6 max-w-2xl text-lg leading-8 text-[var(--text-muted-5)]">
            A minimalist changelog website for teams that need to publish
            releases, explain web updates, and keep customers aligned without
            visual clutter.
          </p>
        </div>

        <aside
          aria-label="Latest release"
          className="self-end border border-[var(--border-subtle)] bg-[var(--hero-card-bg)] p-6 shadow-[var(--hero-card-shadow)]"
        >
          <div className="flex items-start justify-between gap-6">
            <div>
              <p className="text-sm font-medium text-[var(--text-muted-2)]">
                Latest
              </p>
              <h2 className="mt-2 text-3xl font-semibold tracking-normal">
                {releaseNotes[0].version}
              </h2>
            </div>
            <span className="rounded-full bg-[var(--hero-badge-bg)] px-3 py-1 text-sm font-medium text-[var(--hero-badge-text)]">
              Live
            </span>
          </div>
          <h3 className="mt-8 text-2xl font-semibold tracking-normal">
            {releaseNotes[0].title}
          </h3>
          <p className="mt-3 text-base leading-7 text-[var(--release-summary-color)]">
            {releaseNotes[0].summary}
          </p>
          <div className="mt-8 flex flex-wrap gap-2">
            {releaseNotes[0].tags.map((tag) => (
              <span
                className="border border-[var(--border-subtle)] px-3 py-1 text-sm text-[var(--release-summary-color)]"
                key={tag}
              >
                {tag}
              </span>
            ))}
          </div>
        </aside>
      </section>

      <section
        className="mx-auto grid max-w-7xl gap-6 px-5 pb-12 sm:px-8 lg:grid-cols-3"
        id="summary"
      >
        {metrics.map((metric) => (
          <div
            className="border-t border-[var(--metric-border)] py-6"
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
        className="border-y border-[var(--release-divider)] bg-[var(--release-section-bg)] py-16"
        id="release-notes"
      >
        <div className="mx-auto max-w-7xl px-5 sm:px-8">
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

          <div className="mt-10 divide-y divide-[var(--release-divider)] border-y border-[var(--release-divider)]">
            {releaseNotes.map((note) => (
              <article
                className="grid gap-6 py-8 lg:grid-cols-[180px_1fr_260px]"
                key={note.version}
              >
                <div>
                  <p className="font-semibold">{note.version}</p>
                  <p className="mt-1 text-sm text-[var(--release-date-color)]">
                    {note.date}
                  </p>
                </div>
                <div>
                  <h3 className="text-2xl font-semibold tracking-normal">
                    {note.title}
                  </h3>
                  <p className="mt-3 max-w-2xl text-base leading-7 text-[var(--release-summary-color)]">
                    {note.summary}
                  </p>
                </div>
                <div className="flex flex-wrap content-start gap-2 lg:justify-end">
                  {note.tags.map((tag) => (
                    <span
                      className="rounded-full bg-[var(--release-tag-bg)] px-3 py-1 text-sm text-[var(--release-tag-text)]"
                      key={`${note.version}-${tag}`}
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-5 py-16 sm:px-8" id="web-changes">
        <div className="grid gap-8 lg:grid-cols-[0.7fr_1fr]">
          <div>
            <p className="text-sm font-medium uppercase tracking-[0.18em] text-[var(--text-muted-1)]">
              Website
            </p>
            <h2 className="mt-3 text-4xl font-semibold tracking-normal">
              Web changes
            </h2>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            {webChanges.map((item) => (
              <article
                className="border border-[var(--card-border)] bg-[var(--card-bg)] p-5"
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
        <div className="mx-auto grid max-w-7xl gap-5 px-5 py-6 text-sm text-[var(--footer-text)] sm:px-8 lg:grid-cols-[1fr_auto_1fr] lg:items-center">
          <div>
            <a className="text-lg tracking-normal text-[var(--text-primary)]" href="#">
              <BrandWordmark />
            </a>
            <p className="mt-2">Copyright {year} JFL. All rights reserved.</p>
          </div>

          <nav
            aria-label="Footer navigation"
            className="flex flex-wrap gap-x-5 gap-y-2 text-[var(--footer-link-color)]"
          >
            {navLinks.map((link) => (
              <a
                className="transition hover:text-[var(--footer-link-hover)]"
                href={link.href}
                key={`footer-${link.href}`}
              >
                {link.label}
              </a>
            ))}
          </nav>

          <p className="lg:text-right">Built for clarity.</p>
        </div>
      </footer>
    </main>
  );
}
