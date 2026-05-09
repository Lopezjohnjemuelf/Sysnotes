import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { TenantWordmark } from "@/components/admin";
import {
  getReleaseByVersion,
  getReleaseNavigation,
  getReleasePath,
  releaseNotes,
  type ReleaseBodyBlock,
} from "@/data/releases";

type ReleasePageProps = {
  params: Promise<{
    version: string;
  }>;
};

const navLinks = [
  { label: "About", href: "/about" },
  { label: "Login", href: "/login" },
];

export function generateStaticParams() {
  return releaseNotes.map((release) => ({
    version: release.version,
  }));
}

export async function generateMetadata({
  params,
}: ReleasePageProps): Promise<Metadata> {
  const { version } = await params;
  const release = getReleaseByVersion(decodeURIComponent(version));

  if (!release) {
    return {
      title: "Release | Sysnotes by JFL",
    };
  }

  return {
    title: `${release.version} ${release.title} | Sysnotes by JFL`,
    description: release.summary,
  };
}

function ReleaseMdxBody({ body }: { body: ReleaseBodyBlock[] }) {
  return (
    <div className="space-y-8">
      {body.map((block, index) => {
        if (block.type === "heading") {
          return (
            <h2
              className="border-t border-[var(--border-subtle)] pt-8 text-2xl font-semibold tracking-normal"
              key={`${block.type}-${index}`}
            >
              {block.text}
            </h2>
          );
        }

        if (block.type === "list") {
          return (
            <ul
              className="space-y-3 text-base leading-8 text-[var(--text-muted-6)]"
              key={`${block.type}-${index}`}
            >
              {block.items.map((item) => (
                <li
                  className="border-l border-[var(--border-light)] pl-4"
                  key={item}
                >
                  {item}
                </li>
              ))}
            </ul>
          );
        }

        return (
          <p
            className="text-lg leading-9 text-[var(--text-muted-6)]"
            key={`${block.type}-${index}`}
          >
            {block.text}
          </p>
        );
      })}
    </div>
  );
}

export default async function ReleasePage({ params }: ReleasePageProps) {
  const { version } = await params;
  const release = getReleaseByVersion(decodeURIComponent(version));

  if (!release) {
    notFound();
  }

  const { previousRelease, nextRelease } = getReleaseNavigation(
    release.version,
  );

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

      <article className="mx-auto max-w-[90rem] px-4 py-14 sm:px-6 lg:px-8 lg:py-20">
        <div className="grid gap-10 lg:grid-cols-[18rem_minmax(0,44rem)_1fr]">
          <aside className="text-sm text-[var(--text-muted-4)]">
            <Link
              className="font-medium text-[var(--text-primary)] transition hover:text-[var(--text-muted-7)]"
              href="/#release-notes"
            >
              Releases
            </Link>
            <div className="mt-8 border-t border-[var(--border-subtle)] pt-5">
              <p className="font-semibold text-[var(--text-primary)]">
                {release.version}
              </p>
              <p className="mt-2">{release.date}</p>
            </div>
          </aside>

          <div>
            <header>
              <p className="w-fit rounded-full border border-[var(--border-subtle)] bg-[var(--hero-pill-bg)] px-4 py-2 text-sm font-medium text-[var(--hero-pill-text)]">
                {release.version}
              </p>
              <h1 className="mt-8 text-5xl font-semibold leading-[1.02] tracking-normal text-balance sm:text-6xl">
                {release.title}
              </h1>
              <p className="mt-6 text-xl leading-9 text-[var(--release-summary-color)]">
                {release.summary}
              </p>
              <div className="mt-8 flex flex-wrap gap-2">
                {release.tags.map((tag) => (
                  <span
                    className="rounded-full bg-[var(--release-tag-bg)] px-3 py-1 text-sm text-[var(--release-tag-text)]"
                    key={tag}
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </header>

            <section className="mt-12 border-y border-[var(--border-subtle)] py-10">
              <ReleaseMdxBody body={release.body} />
            </section>

            <nav
              aria-label="Release navigation"
              className="mt-10 grid gap-4 sm:grid-cols-2"
            >
              {previousRelease ? (
                <Link
                  className="rounded-lg border border-[var(--border-subtle)] bg-[var(--surface-card)] p-5 transition hover:border-[var(--border-light)]"
                  href={getReleasePath(previousRelease.version)}
                >
                  <p className="text-sm font-medium uppercase tracking-[0.18em] text-[var(--text-muted-1)]">
                    Previous release
                  </p>
                  <p className="mt-4 font-semibold">
                    {previousRelease.version}
                  </p>
                  <p className="mt-1 text-lg font-semibold tracking-normal">
                    {previousRelease.title}
                  </p>
                </Link>
              ) : (
                <div className="rounded-lg border border-[var(--border-subtle)] p-5 text-sm text-[var(--text-muted-3)]">
                  Latest release
                </div>
              )}

              {nextRelease ? (
                <Link
                  className="rounded-lg border border-[var(--border-subtle)] bg-[var(--surface-card)] p-5 transition hover:border-[var(--border-light)] sm:text-right"
                  href={getReleasePath(nextRelease.version)}
                >
                  <p className="text-sm font-medium uppercase tracking-[0.18em] text-[var(--text-muted-1)]">
                    Next release
                  </p>
                  <p className="mt-4 font-semibold">{nextRelease.version}</p>
                  <p className="mt-1 text-lg font-semibold tracking-normal">
                    {nextRelease.title}
                  </p>
                </Link>
              ) : (
                <div className="rounded-lg border border-[var(--border-subtle)] p-5 text-sm text-[var(--text-muted-3)] sm:text-right">
                  Earliest release
                </div>
              )}
            </nav>
          </div>
        </div>
      </article>
    </main>
  );
}
