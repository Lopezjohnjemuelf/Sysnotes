"use client";

/*
 * SYSNOTES ROOT PAGE IS FROZEN.
 * This page is reserved for Sysnotes-owned releases only.
 * Do not add tenant release marketing, tenant coming soon states, tenant branding, or tenant-managed release content here.
 * All tenant-facing release pages must be implemented under /[slug]/*.
 */

import Link from "next/link";
import { useMemo, useState } from "react";
import { getReleasePath, type SysnotesRelease } from "@/data/releases";

type TagFilterProps = {
  releases: SysnotesRelease[];
};

function getUniqueTags(releases: SysnotesRelease[]) {
  return Array.from(
    new Set(releases.flatMap((release) => release.tags)),
  ).sort((firstTag, secondTag) => firstTag.localeCompare(secondTag));
}

export function TagFilter({ releases }: TagFilterProps) {
  const [selectedTag, setSelectedTag] = useState("All");
  const tags = useMemo(() => ["All", ...getUniqueTags(releases)], [releases]);

  return (
    <div>
      <div className="flex flex-wrap gap-2">
        {tags.map((tag) => {
          const isActive = selectedTag === tag;

          return (
            <button
              className={
                isActive
                  ? "rounded-full bg-[var(--accent-bg)] px-3 py-1 text-sm font-medium text-[var(--accent-text)]"
                  : "rounded-full bg-[var(--tag-bg)] px-3 py-1 text-sm text-[var(--text-muted-4)] transition hover:text-[var(--text-primary)]"
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

      <div className="mt-8 grid gap-6">
        {releases.map((note) => {
          const isMatching =
            selectedTag === "All" || note.tags.includes(selectedTag);

          return (
            <div
              className={
                isMatching
                  ? "max-h-[24rem] overflow-hidden opacity-100 transition-all duration-150"
                  : "max-h-0 overflow-hidden opacity-0 transition-all duration-150"
              }
              key={note.version}
            >
              <article className="grid gap-6 rounded-lg border border-[var(--release-divider)] bg-[var(--surface-page)] p-6 transition hover:border-[var(--border-light)] lg:grid-cols-[160px_1fr]">
                <div>
                  <Link
                    className="font-semibold transition hover:text-[var(--text-muted-7)]"
                    href={getReleasePath(note.version)}
                  >
                    {note.version}
                  </Link>
                  <p className="mt-1 text-sm text-[var(--release-date-color)]">
                    {note.date}
                  </p>
                </div>
                <div>
                  <Link
                    className="block text-2xl font-semibold tracking-normal transition hover:text-[var(--text-muted-7)]"
                    href={getReleasePath(note.version)}
                  >
                    {note.title}
                  </Link>
                  <p className="mt-3 max-w-2xl text-base leading-7 text-[var(--release-summary-color)]">
                    {note.summary}
                  </p>
                  <div className="mt-5 flex flex-wrap gap-2">
                    {note.tags.map((tag) => (
                      <span
                        className="rounded-full bg-[var(--release-tag-bg)] px-3 py-1 text-sm text-[var(--release-tag-text)]"
                        key={`${note.version}-${tag}`}
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              </article>
            </div>
          );
        })}
      </div>
    </div>
  );
}
