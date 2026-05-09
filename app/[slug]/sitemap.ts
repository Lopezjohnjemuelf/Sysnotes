import type { MetadataRoute } from "next";
import { headers } from "next/headers";
import {
  readPublishedTenantReleases,
  readTenantIdentity,
} from "@/lib/db/tenant-data";

type TenantSitemapProps = {
  params: Promise<{
    slug: string;
  }>;
};

async function getOrigin() {
  const requestHeaders = await headers();
  const host =
    requestHeaders.get("x-forwarded-host") ?? requestHeaders.get("host");
  const protocol = requestHeaders.get("x-forwarded-proto") ?? "http";

  return host ? `${protocol}://${host}` : "http://localhost:3000";
}

export default async function sitemap({
  params,
}: TenantSitemapProps): Promise<MetadataRoute.Sitemap> {
  const { slug } = await params;
  const [origin, identity, releases] = await Promise.all([
    getOrigin(),
    readTenantIdentity(slug),
    readPublishedTenantReleases(slug),
  ]);
  const tenantSlug = identity?.slug ?? slug;

  return [
    {
      url: `${origin}/${tenantSlug}`,
      changeFrequency: "monthly",
      priority: 1,
    },
    ...releases.map((release) => ({
      url: `${origin}/${tenantSlug}/releases/${encodeURIComponent(
        release.version,
      )}`,
      changeFrequency: "weekly" as const,
      priority: 0.8,
    })),
  ];
}
