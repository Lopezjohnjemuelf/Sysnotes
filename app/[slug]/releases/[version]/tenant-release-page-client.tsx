"use client";

import Link from "next/link";
import { useParams, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import {
  ReleaseMetaRow,
  ReleaseTagPill,
  TenantMarkdown,
  getAdjacentReleases,
  getTenantReleasePath,
  getVisibleReleaseNavigation,
} from "@/components/tenant";
import { getReleaseService } from "@/lib/releases/service";
import {
  canViewTenantRelease,
  hasPrivateReleaseAccess,
} from "@/lib/releases/visibility";
import { getTenantService } from "@/lib/tenant/service";
import type { Release, TenantIdentity } from "@/lib/types";

type ReleasePageState = {
  identity: TenantIdentity | null;
  release: Release | null;
  visibleReleases: Release[];
};

function TenantRouteMessage({ children }: { children: string }) {
  return (
    <main className="grid min-h-[calc(100vh-56px-61px)] place-items-center bg-[var(--surface-page)] px-6 text-center text-[var(--text-primary)]">
      <p className="max-w-sm text-sm leading-6 text-[var(--text-muted-5)]">
        {children}
      </p>
    </main>
  );
}

function ReleaseNavCard({
  direction,
  release,
  slug,
}: {
  direction: "Previous" | "Next";
  release: Release | null;
  slug: string;
}) {
  if (!release) {
    return <div />;
  }

  return (
    <Link
      className="block min-h-16 min-w-0 py-5 text-[var(--tenant-accent-text,var(--accent-text))] transition hover:underline"
      href={getTenantReleasePath(slug, release.version)}
    >
      <span className="block text-xs text-[var(--text-muted-4)]">
        {direction}
      </span>
      <span className="mt-2 block break-all text-sm font-semibold">
        {release.version}
      </span>
      <span className="mt-1 block break-words text-sm">{release.title}</span>
    </Link>
  );
}

export function TenantReleasePageClient() {
  const params = useParams<{ slug: string; version: string }>();
  const searchParams = useSearchParams();
  const token = searchParams.get("token") ?? undefined;
  const [pageState, setPageState] = useState<ReleasePageState>({
    identity: null,
    release: null,
    visibleReleases: [],
  });
  const [hasLoaded, setHasLoaded] = useState(false);

  useEffect(() => {
    let isMounted = true;

    async function loadReleasePage() {
      const releaseService = getReleaseService(params.slug);
      const [identity, release, releases] = await Promise.all([
        getTenantService(params.slug).load(),
        releaseService.getById(decodeURIComponent(params.version)),
        releaseService.getAll(),
      ]);

      if (!isMounted) {
        return;
      }

      const hasPrivateAccess = hasPrivateReleaseAccess(release, token);
      const canViewRelease = canViewTenantRelease(release, token);

      setPageState({
        identity,
        release: canViewRelease ? release : null,
        visibleReleases:
          release && release.status !== "draft"
            ? getVisibleReleaseNavigation(releases, release, hasPrivateAccess)
            : [],
      });
      setHasLoaded(true);
    }

    void loadReleasePage();

    return () => {
      isMounted = false;
    };
  }, [params.slug, params.version, token]);

  const { identity, release, visibleReleases } = pageState;

  if (!hasLoaded) {
    return <TenantRouteMessage>Loading release...</TenantRouteMessage>;
  }

  if (!identity || identity.slug !== params.slug || !release) {
    return <TenantRouteMessage>Release not found.</TenantRouteMessage>;
  }

  const { previousRelease, nextRelease } = getAdjacentReleases(
    visibleReleases,
    release,
  );

  return (
    <main className="bg-[var(--surface-page)] text-[var(--text-primary)]">
      {release.status === "private" ? (
        <div className="bg-[var(--tag-bg)] px-4 py-2 text-xs leading-5 text-[var(--text-muted-7)]">
          <div className="mx-auto max-w-[720px]">
            Private release - only people with this link can view it.
          </div>
        </div>
      ) : null}

      <article className="mx-auto max-w-[720px] px-4 py-8 sm:px-6 sm:py-10">
        <nav
          aria-label="Breadcrumb"
          className="flex min-w-0 flex-wrap items-center gap-x-2 gap-y-1 text-[13px] leading-6 text-[var(--text-muted-4)]"
        >
          <span className="max-w-full break-words">{identity.brandName}</span>
          <span>/</span>
          <Link className="hover:underline" href={`/${identity.slug}`}>
            Releases
          </Link>
          <span>/</span>
          <span className="break-all">{release.version}</span>
        </nav>

        <div className="mt-6 sm:mt-8">
          <ReleaseMetaRow release={release} />
        </div>

        <h1 className="mt-6 break-words text-2xl font-semibold leading-tight tracking-normal sm:text-[28px]">
          {release.title}
        </h1>

        <div className="mt-5 flex min-w-0 flex-wrap gap-2">
          {release.tags.map((tag) => (
            <ReleaseTagPill key={`${release.id}-${tag}`} tag={tag} />
          ))}
        </div>

        <p className="mt-7 break-words border-l-[3px] border-[var(--border-subtle)] pl-3 text-base leading-7 text-[var(--text-muted-5)] sm:mt-8">
          {release.summary}
        </p>

        {release.body ? <TenantMarkdown markdown={release.body} /> : null}

        <div className="mt-12 border-t border-[var(--border-subtle)]" />

        <nav
          aria-label="Release navigation"
          className="grid gap-2 border-t border-[var(--border-subtle)] sm:grid-cols-2 sm:gap-6"
        >
          <ReleaseNavCard
            direction="Previous"
            release={previousRelease}
            slug={identity.slug}
          />
          <div className="border-t border-[var(--border-subtle)] text-left sm:border-t-0 sm:text-right">
            <ReleaseNavCard
              direction="Next"
              release={nextRelease}
              slug={identity.slug}
            />
          </div>
        </nav>
      </article>
    </main>
  );
}
