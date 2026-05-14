import { notFound } from "next/navigation";
import {
  TenantComingSoon,
  TenantReleasesLandingPage,
  TenantEyebrowPill,
} from "@/components/tenant";
import { getReleaseService } from "@/lib/releases/service";
import { getTenantService } from "@/lib/tenant/service";

export const revalidate = 60;

const RESERVED = ["admin", "api", "login", "register", "about", "releases"];

type TenantPageProps = {
  params: Promise<{
    slug: string;
  }>;
};

export async function generateStaticParams() {
  return [];
}

export default async function TenantPage({ params }: TenantPageProps) {
  const { slug } = await params;

  if (RESERVED.includes(slug)) {
    notFound();
  }

  const [identity, releases] = await Promise.all([
    getTenantService(slug).load(),
    getReleaseService(slug).getPublished(),
  ]);

  if (!identity || identity.slug !== slug) {
    notFound();
  }

  if (identity.comingSoon === true || releases.length === 0) {
    return <TenantComingSoon identity={identity} />;
  }

  const latestRelease = releases[0];

  return (
    <main className="min-h-screen bg-[var(--surface-page)] text-[var(--text-primary)]">
      <section className="mx-auto max-w-[90rem] px-4 py-10 sm:px-6 sm:py-12 lg:px-8 lg:py-16">
        <TenantEyebrowPill>Release notes</TenantEyebrowPill>
        <h1 className="anim-fade-up delay-1 section-accent-line mt-6 max-w-5xl break-words text-4xl font-semibold leading-[1.08] tracking-normal text-balance sm:text-5xl sm:leading-[1.04] lg:text-6xl">
          {identity.brandName} updates, all in one place
        </h1>
        <p className="anim-fade-up delay-2 mt-5 max-w-2xl text-base leading-7 text-[var(--text-muted-5)] sm:mt-6 sm:text-lg sm:leading-8">
          Track product updates, improvements, and new releases from{" "}
          {identity.brandName}.
        </p>
        <p className="anim-fade-up delay-3 mt-3 min-h-6 max-w-2xl text-sm italic text-[var(--text-muted-4)]">
          <span className="typewriter-line">What you see is what you get.</span>
        </p>
        <div className="anim-fade-up delay-2 mt-8 grid gap-5 border-t border-[var(--border-subtle)] pt-6 sm:flex sm:flex-wrap sm:gap-6">
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

      <TenantReleasesLandingPage identity={identity} releases={releases} />
    </main>
  );
}
