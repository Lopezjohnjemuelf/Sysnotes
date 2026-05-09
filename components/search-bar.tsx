"use client";

import { useEffect, useMemo, useRef, useState, type KeyboardEvent } from "react";
import { releaseNotes } from "@/data/releases";

type SearchResult = {
  type: "Release" | "Web Change";
  title: string;
  excerpt: string;
  anchor: string;
  haystack: string;
};

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

function scrollToAnchor(anchor: string) {
  const target = document.getElementById(anchor);

  if (!target) {
    window.location.href = `/#${anchor}`;
    return;
  }

  target.scrollIntoView({
    behavior: "smooth",
    block: "start",
  });
}

export function SearchBar() {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);
  const searchRef = useRef<HTMLDivElement>(null);

  const searchIndex = useMemo<SearchResult[]>(() => {
    const releaseResults = releaseNotes.map((release) => ({
      type: "Release" as const,
      title: release.title,
      excerpt: release.summary,
      anchor: "release-notes",
      haystack: [
        release.version,
        release.title,
        release.summary,
        release.tags.join(" "),
      ].join(" "),
    }));

    const webChangeResults = webChanges.map((item) => ({
      type: "Web Change" as const,
      title: item.label,
      excerpt: item.change,
      anchor: "web-changes",
      haystack: `${item.label} ${item.change}`,
    }));

    return [...releaseResults, ...webChangeResults];
  }, []);

  const results = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();

    if (!normalizedQuery) {
      return [];
    }

    return searchIndex
      .filter((result) => result.haystack.toLowerCase().includes(normalizedQuery))
      .slice(0, 5);
  }, [query, searchIndex]);

  useEffect(() => {
    if (isOpen) {
      inputRef.current?.focus();
    }
  }, [isOpen]);

  useEffect(() => {
    function handlePointerDown(event: MouseEvent) {
      if (
        searchRef.current &&
        !searchRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    }

    document.addEventListener("mousedown", handlePointerDown);

    return () => {
      document.removeEventListener("mousedown", handlePointerDown);
    };
  }, []);

  function closeSearch() {
    setIsOpen(false);
    setQuery("");
  }

  function selectResult(result: SearchResult) {
    closeSearch();
    window.setTimeout(() => scrollToAnchor(result.anchor), 0);
  }

  function handleKeyDown(event: KeyboardEvent<HTMLInputElement>) {
    if (event.key === "Escape") {
      closeSearch();
      return;
    }

    if (event.key === "Enter" && results[0]) {
      event.preventDefault();
      selectResult(results[0]);
    }
  }

  return (
    <div className="relative" ref={searchRef}>
      <div className="flex items-center justify-end gap-2">
        {isOpen ? (
          <input
            aria-label="Search releases and web changes"
            className="w-56 rounded-md border border-[var(--border-light)] bg-[var(--surface-card)] px-3 py-2 text-sm text-[var(--text-primary)] outline-none transition focus:border-[var(--border-light)]"
            onChange={(event) => setQuery(event.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Search updates"
            ref={inputRef}
            type="search"
            value={query}
          />
        ) : null}

        <button
          aria-label={isOpen ? "Close search" : "Open search"}
          aria-expanded={isOpen}
          className="grid h-9 w-9 place-items-center rounded-full border border-transparent text-[var(--text-primary)] transition hover:border-[var(--border-light)]"
          onClick={() => {
            if (isOpen) {
              closeSearch();
              return;
            }

            setIsOpen(true);
          }}
          type="button"
        >
          <span aria-hidden="true" className="text-base leading-none">
            {isOpen ? "x" : "⌕"}
          </span>
        </button>
      </div>

      {isOpen && query.trim() ? (
        <div className="absolute right-0 top-full z-30 mt-3 w-[min(22rem,calc(100vw-2rem))] rounded-lg border border-[var(--border-light)] bg-[var(--surface-card)] p-2">
          {results.length > 0 ? (
            <div className="grid gap-1">
              {results.map((result) => (
                <button
                  className="rounded-md p-3 text-left transition hover:bg-[var(--tag-bg)]"
                  key={`${result.type}-${result.title}`}
                  onClick={() => selectResult(result)}
                  type="button"
                >
                  <span className="inline-flex rounded-full bg-[var(--tag-bg)] px-2 py-1 text-xs font-medium text-[var(--text-primary)]">
                    {result.type}
                  </span>
                  <span className="mt-3 block text-sm font-semibold text-[var(--text-primary)]">
                    {result.title}
                  </span>
                  <span className="mt-1 block text-sm leading-6 text-[var(--text-muted-5)]">
                    {result.excerpt}
                  </span>
                </button>
              ))}
            </div>
          ) : (
            <p className="p-3 text-sm text-[var(--text-muted-5)]">
              No matching updates.
            </p>
          )}
        </div>
      ) : null}
    </div>
  );
}
