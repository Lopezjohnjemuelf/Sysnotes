import { headers } from "next/headers";
import {
  readPublishedTenantReleases,
  readTenantIdentity,
} from "@/lib/db/tenant-data";
import { DEFAULT_TENANT_IDENTITY } from "@/lib/tenant/identity";

type FeedRouteContext = {
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

function escapeXml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

export async function GET(
  _request: Request,
  { params }: FeedRouteContext,
) {
  const { slug } = await params;
  const [origin, storedIdentity, releases] = await Promise.all([
    getOrigin(),
    readTenantIdentity(slug),
    readPublishedTenantReleases(slug),
  ]);
  const identity = storedIdentity ?? {
    ...DEFAULT_TENANT_IDENTITY,
    slug,
  };
  const tenantUrl = `${origin}/${identity.slug}`;
  const sortedReleases = [...releases].sort(
    (firstRelease, secondRelease) =>
      new Date(secondRelease.date).getTime() -
      new Date(firstRelease.date).getTime(),
  );
  const items = sortedReleases
    .map((release) => {
      const releaseUrl = `${tenantUrl}/releases/${encodeURIComponent(
        release.version,
      )}`;

      return `<item>
<title>${escapeXml(`${release.version} — ${release.title}`)}</title>
<link>${escapeXml(releaseUrl)}</link>
<description>${escapeXml(release.summary)}</description>
<pubDate>${new Date(release.date).toUTCString()}</pubDate>
<guid>${escapeXml(releaseUrl)}</guid>
</item>`;
    })
    .join("");
  const xml = `<rss version="2.0"><channel>
<title>${escapeXml(`${identity.brandName} Release Notes`)}</title>
<link>${escapeXml(tenantUrl)}</link>
<description>${escapeXml(`Latest releases from ${identity.brandName}`)}</description>
${items}
</channel></rss>`;

  return new Response(xml, {
    headers: {
      "Content-Type": "application/rss+xml; charset=utf-8",
    },
  });
}
