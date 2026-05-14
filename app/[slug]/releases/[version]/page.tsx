import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  ReleaseMetaRow,
  ReleaseTagPill,
  TenantMarkdown,
  getAdjacentReleases,
  getTenantReleasePath,
  getVisibleReleaseNavigation,
} from "@/components/tenant";
import { getReleaseService } from "@/lib/releases/service";
import { getTenantService } from "@/lib/tenant/service";
import type { Release } from "@/lib/types";

type TenantReleasePageMetadataProps = {
  params: Promise<{
    slug: string;
    version: string;
  }>;
};

type TenantReleasePageProps = TenantReleasePageMetadataProps & {
  searchParams: Promise<{
    token?: string | string[];
  }>;
};

export const revalidate = 60;

export async function generateStaticParams() {
  return [];
}

export async function generateMetadata({
  params,
}: TenantReleasePageMetadataProps): Promise<Metadata> {
  const { slug, version } = await params;
  const release = await getReleaseService(slug).getById(
    decodeURIComponent(version),
  );
  const identity = await getTenantService(slug).load();

  if (!identity || identity.slug !== slug || !release) {
    return {
      title: "Not found",
      robots: "noindex, nofollow",
    };
  }

  const title = `${release.title} — ${identity.brandName}`;

  if (release.status === "draft") {
    return {
      title: "Not found",
      robots: "noindex, nofollow",
    };
  }

  if (release.status === "private") {
    return {
      title,
      robots: "noindex, nofollow",
    };
  }

  const description = release.summary.slice(0, 160);

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      type: "article",
      publishedTime: release.date,
    },
  };
}

function getToken(searchParams: { token?: string | string[] }) {
  if (Array.isArray(searchParams.token)) {
    return searchParams.token[0];
  }

  return searchParams.token;
}

function stripShareToken(release: Release): Release {
  return {
    ...release,
    shareToken: undefined,
  };
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
      className="premium-text-link block min-h-16 min-w-0 py-5 text-[var(--tenant-accent-text,var(--accent-text))]"
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

export default async function TenantReleasePage({
  params,
  searchParams,
}: TenantReleasePageProps) {
  const { slug, version } = await params;
  const sp = await searchParams;
  const token = getToken(sp);
  const releaseService = getReleaseService(slug);
  const [identity, release, releases] = await Promise.all([
    getTenantService(slug).load(),
    releaseService.getById(decodeURIComponent(version), token),
    releaseService.getAll(),
  ]);

  if (
    !identity ||
    identity.slug !== slug ||
    !release ||
    release.status === "draft"
  ) {
    notFound();
  }

  if (release.status === "private") {
    if (!token || (release.shareToken && token !== release.shareToken)) {
      notFound();
    }
  }

  const safeRelease = stripShareToken(release);
  const visibleReleases = getVisibleReleaseNavigation(
    releases.map(stripShareToken),
    safeRelease,
    safeRelease.status === "private",
  );
  const { previousRelease, nextRelease } = getAdjacentReleases(
    visibleReleases,
    safeRelease,
  );

  return (
    <main className="bg-[var(--surface-page)] text-[var(--text-primary)]">
      {safeRelease.status === "private" ? (
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
          <Link
            className="premium-text-link inline-flex text-[var(--tenant-accent-text,var(--accent-text))]"
            href={`/${identity.slug}`}
          >
            Releases
          </Link>
          <span>/</span>
          <span className="break-all">{safeRelease.version}</span>
        </nav>

        <div className="mt-6 sm:mt-8">
          <ReleaseMetaRow release={safeRelease} />
        </div>

        <h1 className="mt-6 break-words text-2xl font-semibold leading-tight tracking-normal sm:text-[28px]">
          {safeRelease.title}
        </h1>

        <div className="mt-5 flex min-w-0 flex-wrap gap-2">
          {safeRelease.tags.map((tag) => (
            <ReleaseTagPill key={`${safeRelease.id}-${tag}`} tag={tag} />
          ))}
        </div>

        <p className="mt-7 break-words border-l-[3px] border-[var(--border-subtle)] pl-3 text-base leading-7 text-[var(--text-muted-5)] sm:mt-8">
          {safeRelease.summary}
        </p>

        {safeRelease.body ? (
          <TenantMarkdown markdown={safeRelease.body} />
        ) : null}

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
