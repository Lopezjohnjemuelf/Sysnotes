import { headers } from "next/headers";
import { readPublishedTenantReleases } from "@/lib/db/tenant-data";

type WidgetDataRouteContext = {
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

export async function GET(
  _request: Request,
  { params }: WidgetDataRouteContext,
) {
  const { slug } = await params;
  const [origin, releases] = await Promise.all([
    getOrigin(),
    readPublishedTenantReleases(slug),
  ]);
  const data = [...releases]
    .sort(
      (firstRelease, secondRelease) =>
        new Date(secondRelease.date).getTime() -
        new Date(firstRelease.date).getTime(),
    )
    .slice(0, 5)
    .map((release) => ({
      version: release.version,
      title: release.title,
      summary: release.summary,
      date: release.date,
      url: `${origin}/${slug}/releases/${encodeURIComponent(release.version)}`,
    }));

  return Response.json(data, {
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Content-Type": "application/json",
    },
  });
}
