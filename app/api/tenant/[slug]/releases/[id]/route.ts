import { NextResponse } from "next/server";
import {
  isValidTenantSlug,
  readTenantReleases,
  tenantReleasesFile,
} from "@/lib/db/tenant-data";
import { write } from "@/lib/db/file-store";
import { normalizeRelease } from "@/lib/releases/persistence";

type TenantReleaseRouteContext = {
  params: Promise<{
    slug: string;
    id: string;
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

function notFoundResponse() {
  return NextResponse.json({ error: "Release not found." }, { status: 404 });
}

export async function GET(
  _request: Request,
  { params }: TenantReleaseRouteContext,
) {
  const { slug, id } = await params;

  if (!isValidTenantSlug(slug)) {
    return invalidSlugResponse();
  }

  const release =
    readReleases(slug).find(
      (currentRelease) =>
        currentRelease.id === id || currentRelease.version === id,
    ) ?? null;

  if (!release) {
    return notFoundResponse();
  }

  return NextResponse.json(release);
}

export async function PUT(
  request: Request,
  { params }: TenantReleaseRouteContext,
) {
  const { slug, id } = await params;

  if (!isValidTenantSlug(slug)) {
    return invalidSlugResponse();
  }

  if (!isJsonRequest(request)) {
    return invalidJsonResponse();
  }

  const releases = readReleases(slug);
  const releaseIndex = releases.findIndex(
    (currentRelease) => currentRelease.id === id,
  );

  if (releaseIndex === -1) {
    return notFoundResponse();
  }

  const release = normalizeRelease({
    ...(await request.json()),
    id,
  });

  if (!release) {
    return NextResponse.json({ error: "Invalid release." }, { status: 400 });
  }

  const nextReleases = [...releases];
  nextReleases[releaseIndex] = release;
  write(tenantReleasesFile(slug), nextReleases);

  return NextResponse.json(release);
}

export async function DELETE(
  _request: Request,
  { params }: TenantReleaseRouteContext,
) {
  const { slug, id } = await params;

  if (!isValidTenantSlug(slug)) {
    return invalidSlugResponse();
  }

  const releases = readReleases(slug);
  const nextReleases = releases.filter((release) => release.id !== id);

  if (nextReleases.length === releases.length) {
    return notFoundResponse();
  }

  write(tenantReleasesFile(slug), nextReleases);

  return new NextResponse(null, { status: 204 });
}
