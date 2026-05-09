"use client";

import { useMemo, useState, type ChangeEvent } from "react";
import type { Release, TenantIdentity } from "@/lib/types";
import { TenantReleaseCard } from "./tenant-release-card";
import {
  TenantEyebrowPill,
  getReleaseAnchor,
  getUniqueReleaseTags,
} from "./tenant-release-ui";

type TenantReleasesLandingPageProps = {
  identity: TenantIdentity;
  releases: Release[];
};

export function TenantReleasesLandingPage({
  identity,
  releases,
}: TenantReleasesLandingPageProps) {
  const [selectedTag, setSelectedTag] = useState("All");
  const [activeReleaseId, setActiveReleaseId] = useState(releases[0]?.id ?? "");
  const tags = useMemo(
    () => ["All", ...getUniqueReleaseTags(releases)],
    [releases],
  );
  const latestRelease = releases[0];

  function handleMobileReleaseChange(event: ChangeEvent<HTMLSelectElement>) {
    const anchor = event.target.value;
    const anchorId = anchor.startsWith("#") ? anchor.slice(1) : anchor;

    if (!anchorId) {
      return;
    }

    setActiveReleaseId(anchorId.startsWith("v") ? anchorId.slice(1) : anchorId);
    document.getElementById(anchorId)?.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });
  }

  return (
    <main className="min-h-screen bg-[var(--surface-page)] text-[var(--text-primary)]">
      <section className="mx-auto max-w-[90rem] px-4 py-10 sm:px-6 sm:py-12 lg:px-8 lg:py-16">
        <TenantEyebrowPill>Release notes</TenantEyebrowPill>
        <h1 className="mt-6 max-w-5xl break-words text-4xl font-semibold leading-[1.08] tracking-normal text-balance sm:text-5xl sm:leading-[1.04] lg:text-6xl">
          {identity.brandName} updates, all in one place
        </h1>
        <p className="mt-5 max-w-2xl text-base leading-7 text-[var(--text-muted-5)] sm:mt-6 sm:text-lg sm:leading-8">
          Track product updates, improvements, and new releases from{" "}
          {identity.brandName}.
        </p>
        <p className="mt-3 text-sm italic text-[var(--text-muted-4)]">
          What you see is what you get.
        </p>

        <div className="mt-8 grid gap-5 border-t border-[var(--border-subtle)] pt-6 sm:flex sm:flex-wrap sm:gap-6">
          <div className="min-w-0">
            <p className="text-2xl font-semibold tracking-normal">
              {releases.length}
            </p>
            <p className="mt-1 text-xs uppercase tracking-[0.16em] text-[var(--text-muted-4)]">
              Published releases
            </p>
          </div>
          <div className="min-w-0">
            <p className="break-words text-2xl font-semibold tracking-normal">
              {latestRelease?.date ?? "No releases"}
            </p>
            <p className="mt-1 text-xs uppercase tracking-[0.16em] text-[var(--text-muted-4)]">
              Latest release
            </p>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-[90rem] px-4 pb-14 sm:px-6 lg:px-8 lg:pb-24">
        <div className="grid gap-8 lg:grid-cols-[180px_minmax(0,1fr)]">
          <aside className="hidden h-full border-r border-[var(--border-subtle)] pr-5 lg:sticky lg:top-14 lg:block">
            <p className="mb-4 text-[11px] font-semibold uppercase tracking-[0.18em] text-[var(--text-muted-4)]">
              Releases
            </p>
            <nav className="grid gap-1" aria-label="Release navigation">
              {releases.map((release) => {
                const isActive = activeReleaseId === release.id;

                return (
                  <a
                    className={
                      isActive
                        ? "block min-w-0 border-l-2 border-[var(--tenant-accent-bg,var(--accent-bg))] py-2 pl-3 text-[var(--text-primary)] transition"
                        : "block min-w-0 border-l-2 border-transparent py-2 pl-3 text-[var(--text-muted-4)] transition hover:border-[var(--tenant-accent-bg,var(--accent-bg))] hover:text-[var(--text-primary)]"
                    }
                    href={`#${getReleaseAnchor(release)}`}
                    key={`nav-${release.id}`}
                    onClick={() => setActiveReleaseId(release.id)}
                  >
                    <span className="block break-all font-mono text-[13px]">
                      {release.version}
                    </span>
                    <span className="mt-1 block text-xs text-[var(--text-muted-4)]">
                      {release.date}
                    </span>
                  </a>
                );
              })}
            </nav>
          </aside>

          <div className="min-w-0 lg:pl-8">
            <label className="sticky top-14 z-20 grid gap-2 border-b border-[var(--border-subtle)] bg-[var(--surface-page)] py-3 lg:hidden">
              <span className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[var(--text-muted-4)]">
                Releases
              </span>
              <select
                className="h-11 w-full min-w-0 border border-[var(--border-light)] bg-[var(--surface-card)] px-3 text-sm text-[var(--text-primary)]"
                onChange={handleMobileReleaseChange}
                value=""
              >
                <option value="" disabled>
                  Jump to release
                </option>
                {releases.map((release) => (
                  <option
                    key={`mobile-${release.id}`}
                    value={getReleaseAnchor(release)}
                  >
                    {release.version} · {release.date}
                  </option>
                ))}
              </select>
            </label>

            <div
              aria-label="Filter releases by tag"
              className="-mx-4 mt-5 flex gap-2 overflow-x-auto px-4 pb-2 lg:mx-0 lg:mt-0 lg:flex-wrap lg:overflow-visible lg:px-0 lg:pb-0"
            >
              {tags.map((tag) => {
                const isActive = selectedTag === tag;

                return (
                  <button
                    className={
                      isActive
                        ? "min-h-9 shrink-0 rounded-full bg-[var(--tenant-accent-bg,var(--accent-bg))] px-3 py-1 text-sm font-medium text-[var(--tenant-accent-text,var(--accent-text))]"
                        : "min-h-9 shrink-0 rounded-full bg-[var(--tag-bg)] px-3 py-1 text-sm text-[var(--text-muted-4)] transition hover:text-[var(--text-primary)]"
                    }
                    key={tag}
                    onClick={() => setSelectedTag(tag)}
                    type="button"
                  >
                    {tag}
                  </button>
                );
              })}
            </div>

            <div className="mt-6 sm:mt-8">
              {releases.map((release) => {
                const isMatching =
                  selectedTag === "All" || release.tags.includes(selectedTag);

                return (
                  <div
                    className={
                      isMatching
                        ? "scroll-mt-20 overflow-hidden opacity-100 transition-all duration-150"
                        : "h-0 scroll-mt-20 overflow-hidden opacity-0 transition-all duration-150"
                    }
                    id={getReleaseAnchor(release)}
                    key={release.id}
                  >
                    <TenantReleaseCard release={release} identity={identity} />
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
