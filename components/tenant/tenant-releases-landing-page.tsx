"use client";

import { useEffect, useMemo, useState, type ChangeEvent } from "react";
import { useReveal } from "@/hooks/use-reveal";
import type { Release, TenantIdentity } from "@/lib/types";
import { TenantReleaseCard } from "./tenant-release-card";
import {
  getReleaseAnchor,
  getUniqueReleaseTags,
} from "./tenant-release-ui";

type TenantReleasesLandingPageProps = {
  identity: TenantIdentity;
  releases: Release[];
};

const RELEASE_SCROLL_OFFSET = 72;

type ReleaseCardWrapperProps = {
  identity: TenantIdentity;
  index: number;
  isMatching: boolean;
  release: Release;
  selectedTag: string;
};

function getReleaseWrapperClass(isMatching: boolean, motionClass = "") {
  const filterClass = isMatching ? "" : "card-hidden ";

  return `${motionClass}${filterClass}scroll-mt-20 overflow-hidden`;
}

function getCardTransitionDelay(index: number, selectedTag: string) {
  const delayStep = selectedTag === "All" ? 10 : 60;

  return `${Math.min(index, 5) * delayStep}ms`;
}

function scrollToRelease(anchorId: string) {
  const el = document.getElementById(anchorId);

  if (!el) {
    return;
  }

  const top = el.getBoundingClientRect().top + window.scrollY - RELEASE_SCROLL_OFFSET;

  el.scrollIntoView({
    behavior: "smooth",
    block: "start",
  });

  window.requestAnimationFrame(() => {
    window.scrollTo({
      behavior: "smooth",
      top,
    });
  });
}

function RevealedReleaseCardWrapper({
  identity,
  index,
  isMatching,
  release,
  selectedTag,
}: ReleaseCardWrapperProps) {
  const motionClass =
    index === 0 ? "anim-fade-up delay-4 reveal-card revealed " : "reveal-card revealed ";

  return (
    <div
      className={getReleaseWrapperClass(isMatching, motionClass)}
      id={getReleaseAnchor(release)}
      style={{ transitionDelay: getCardTransitionDelay(index, selectedTag) }}
    >
      <TenantReleaseCard release={release} identity={identity} />
    </div>
  );
}

function ObservedReleaseCardWrapper({
  identity,
  index,
  isMatching,
  release,
  selectedTag,
}: ReleaseCardWrapperProps) {
  const ref = useReveal();

  return (
    <div
      className={getReleaseWrapperClass(isMatching, "reveal-card ")}
      id={getReleaseAnchor(release)}
      ref={ref}
      style={{ transitionDelay: getCardTransitionDelay(index, selectedTag) }}
    >
      <TenantReleaseCard release={release} identity={identity} />
    </div>
  );
}

export function TenantReleasesLandingPage({
  identity,
  releases,
}: TenantReleasesLandingPageProps) {
  const [selectedTag, setSelectedTag] = useState("All");
  const [activeReleaseId, setActiveReleaseId] = useState(
    releases[0] ? getReleaseAnchor(releases[0]) : "",
  );
  const releaseAnchors = useMemo(
    () => releases.map((release) => getReleaseAnchor(release)),
    [releases],
  );
  const tags = useMemo(
    () => ["All", ...getUniqueReleaseTags(releases)],
    [releases],
  );

  useEffect(() => {
    const releaseElements = releaseAnchors
      .map((anchorId) => document.getElementById(anchorId))
      .filter((el): el is HTMLElement => el !== null);

    if (releaseElements.length === 0) {
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries.find((entry) => entry.isIntersecting);

        if (visible) {
          setActiveReleaseId(visible.target.id);
        }
      },
      {
        rootMargin: "-30% 0px -60% 0px",
        threshold: 0,
      },
    );

    releaseElements.forEach((el) => observer.observe(el));

    return () => observer.disconnect();
  }, [releaseAnchors]);

  function handleMobileReleaseChange(event: ChangeEvent<HTMLSelectElement>) {
    const anchor = event.target.value;
    const anchorId = anchor.startsWith("#") ? anchor.slice(1) : anchor;

    if (!anchorId) {
      return;
    }

    setActiveReleaseId(anchorId);
    scrollToRelease(anchorId);
  }

  return (
      <section className="mx-auto max-w-[90rem] px-4 pb-14 sm:px-6 lg:px-8 lg:pb-24">
        <div className="grid gap-8 lg:grid-cols-[180px_minmax(0,1fr)]">
          <aside className="anim-fade-up delay-3 hidden h-full border-r border-[var(--border-subtle)] pr-5 lg:sticky lg:top-14 lg:block">
            <p className="mb-4 text-[11px] font-semibold uppercase tracking-[0.18em] text-[var(--text-muted-4)]">
              Releases
            </p>
            <nav className="grid gap-1" aria-label="Release navigation">
              {releases.map((release) => {
                const releaseAnchor = getReleaseAnchor(release);
                const isActive = activeReleaseId === releaseAnchor;

                return (
                  <a
                    className={
                      isActive
                        ? "release-sidebar-link block min-w-0 border-l-2 border-[var(--tenant-accent-bg,var(--accent-bg))] bg-[var(--tag-bg)] py-2 pl-3 text-[var(--text-primary)]"
                        : "release-sidebar-link block min-w-0 border-l-2 border-transparent bg-transparent py-2 pl-3 text-[var(--text-muted-4)] hover:border-[var(--tenant-accent-bg,var(--accent-bg))] hover:bg-[var(--tag-bg)] hover:text-[var(--text-primary)]"
                    }
                    href={`#${releaseAnchor}`}
                    key={`nav-${release.id}`}
                    onClick={(event) => {
                      event.preventDefault();
                      setActiveReleaseId(releaseAnchor);
                      scrollToRelease(releaseAnchor);
                    }}
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
            <label className="anim-fade-up delay-3 sticky top-14 z-20 grid gap-2 border-b border-[var(--border-subtle)] bg-[var(--surface-page)] py-3 lg:hidden">
              <span className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[var(--text-muted-4)]">
                Releases
              </span>
              <select
                className="h-11 w-full min-w-0 border border-[var(--border-light)] bg-[var(--surface-card)] px-3 text-sm text-[var(--text-primary)] transition-colors focus:border-[var(--tenant-accent-bg,var(--accent-bg))] focus:outline-none"
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
              className="anim-fade-up delay-3 -mx-4 mt-5 flex gap-2 overflow-x-auto px-4 pb-2 lg:mx-0 lg:mt-0 lg:flex-wrap lg:overflow-visible lg:px-0 lg:pb-0"
            >
              {tags.map((tag) => {
                const isActive = selectedTag === tag;

                return (
                  <button
                    className={
                      isActive
                        ? "tag-filter-pill min-h-9 shrink-0 rounded-[var(--radius-sm)] border border-[var(--tenant-accent-bg,var(--accent-bg))] bg-[var(--tenant-accent-bg,var(--accent-bg))] px-3 py-1 text-sm font-medium text-[var(--tenant-accent-text,var(--accent-text))]"
                        : "tag-filter-pill min-h-9 shrink-0 rounded-[var(--radius-sm)] border border-transparent bg-[var(--tag-bg)] px-3 py-1 text-sm text-[var(--text-muted-4)] hover:border-[var(--tenant-accent-bg,var(--accent-bg))] hover:text-[var(--text-primary)]"
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
              {releases.map((release, index) => {
                const isMatching =
                  selectedTag === "All" || release.tags.includes(selectedTag);

                return index < 2 ? (
                  <RevealedReleaseCardWrapper
                    identity={identity}
                    index={index}
                    isMatching={isMatching}
                    key={release.id}
                    release={release}
                    selectedTag={selectedTag}
                  />
                ) : (
                  <ObservedReleaseCardWrapper
                    identity={identity}
                    index={index}
                    isMatching={isMatching}
                    key={release.id}
                    release={release}
                    selectedTag={selectedTag}
                  />
                );
              })}
            </div>
          </div>
        </div>
      </section>
  );
}
