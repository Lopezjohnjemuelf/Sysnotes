import { NextResponse } from "next/server";
import {
  isValidTenantSlug,
  readTenantReleases,
  tenantReleasesFile,
} from "@/lib/db/tenant-data";
import { write } from "@/lib/db/file-store";
import { normalizeRelease } from "@/lib/releases/persistence";

type TenantReleasesRouteContext = {
  params: Promise<{
    slug: string;
  }>;
};

function readReleases(slug: string) {
  return readTenantReleases(slug);
}

function isJsonRequest(request: Request) {
  return request.headers.get("content-type")?.includes("application/json");
}

function invalidJsonResponse() {
  return NextResponse.json(
    { error: "Content-Type must be application/json." },
    { status: 415 },
  );
}

function invalidSlugResponse() {
  return NextResponse.json({ error: "Tenant not found." }, { status: 404 });
}

export async function GET(
  _request: Request,
  { params }: TenantReleasesRouteContext,
) {
  const { slug } = await params;

  if (!isValidTenantSlug(slug)) {
    return invalidSlugResponse();
  }

  return NextResponse.json(readReleases(slug));
}

export async function POST(
  request: Request,
  { params }: TenantReleasesRouteContext,
) {
  const { slug } = await params;

  if (!isValidTenantSlug(slug)) {
    return invalidSlugResponse();
  }

  if (!isJsonRequest(request)) {
    return invalidJsonResponse();
  }

  const release = normalizeRelease({
    ...(await request.json()),
    id: crypto.randomUUID(),
  });

  if (!release) {
    return NextResponse.json({ error: "Invalid release." }, { status: 400 });
  }

  const releases = readReleases(slug);
  const nextReleases = [release, ...releases];

  write(tenantReleasesFile(slug), nextReleases);

  return NextResponse.json(release, { status: 201 });
}
