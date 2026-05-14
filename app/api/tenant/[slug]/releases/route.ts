import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import {
  isValidTenantSlug,
  readTenantReleases,
  tenantReleasesFile,
} from "@/lib/db/tenant-data";
import { write } from "@/lib/db/file-store";
import { normalizeRelease } from "@/lib/releases/persistence";
import type { Release } from "@/lib/types";
import { sanitizeString, sanitizeTags } from "@/lib/validate";

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

function stripShareToken(release: Release) {
  return {
    ...release,
    shareToken: undefined,
  };
}

function sanitizeRelease(release: Release): Release {
  return {
    ...release,
    title: sanitizeString(release.title, 120),
    summary: sanitizeString(release.summary, 600),
    tags: sanitizeTags(release.tags),
  };
}

export async function GET(
  _request: Request,
  { params }: TenantReleasesRouteContext,
) {
  const session = await auth();
  const { slug } = await params;

  if (!isValidTenantSlug(slug)) {
    return invalidSlugResponse();
  }

  const releases = readReleases(slug);

  return NextResponse.json(session ? releases : releases.map(stripShareToken));
}

export async function POST(
  request: Request,
  { params }: TenantReleasesRouteContext,
) {
  const session = await auth();

  if (!session) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  const { slug } = await params;

  if (!isValidTenantSlug(slug)) {
    return invalidSlugResponse();
  }

  if (!isJsonRequest(request)) {
    return invalidJsonResponse();
  }

  const normalizedRelease = normalizeRelease(await request.json());
  const release = normalizedRelease ? sanitizeRelease(normalizedRelease) : null;

  if (!release) {
    return NextResponse.json({ error: "Invalid release." }, { status: 400 });
  }

  const releases = readReleases(slug);
  const nextReleases = [release, ...releases];

  write(tenantReleasesFile(slug), nextReleases);

  return NextResponse.json(release, { status: 201 });
}
