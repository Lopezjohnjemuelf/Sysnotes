import type { Metadata } from "next";
import { loadReleasePage } from "@/lib/tenant/page-helpers";
import { TenantReleasePageClient } from "./tenant-release-page-client";

type TenantReleasePageMetadataProps = {
  params: Promise<{
    slug: string;
    version: string;
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
  const releasePage = await loadReleasePage(slug, decodeURIComponent(version));

  if (!releasePage) {
    return {
      title: "Release not found",
    };
  }

  const { identity: tenantIdentity, release } = releasePage;
  const title = `${release.title} — ${tenantIdentity.brandName}`;
  const description = release.summary.slice(0, 160);

  if (release.status === "private") {
    return {
      title,
      description,
      robots: "noindex, nofollow",
    };
  }

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

export default function TenantReleasePage() {
  return <TenantReleasePageClient />;
}
