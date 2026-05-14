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
  request: Request,
  { params }: TenantReleaseRouteContext,
) {
  const session = await auth();
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

  if (session) {
    return NextResponse.json(release);
  }

  const token = new URL(request.url).searchParams.get("token") ?? undefined;

  if (release.status === "draft") {
    return notFoundResponse();
  }

  if (
    release.status === "private" &&
    (!token || token !== release.shareToken)
  ) {
    return notFoundResponse();
  }

  return NextResponse.json(stripShareToken(release));
}

export async function PUT(
  request: Request,
  { params }: TenantReleaseRouteContext,
) {
  const session = await auth();

  if (!session) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

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

  const normalizedRelease = normalizeRelease({
    ...(await request.json()),
    id,
  });
  const release = normalizedRelease ? sanitizeRelease(normalizedRelease) : null;

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
  const session = await auth();

  if (!session) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

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
