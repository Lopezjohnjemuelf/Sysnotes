import { NextResponse } from "next/server";
import { isValidTenantSlug, tenantIdentityFile } from "@/lib/db/tenant-data";
import { read, write } from "@/lib/db/file-store";
import { normalizeTenantIdentity } from "@/lib/tenant/identity";
import type { TenantIdentity } from "@/lib/types";

type TenantIdentityRouteContext = {
  params: Promise<{
    slug: string;
  }>;
};

function isJsonRequest(request: Request) {
  return request.headers.get("content-type")?.includes("application/json");
}

function invalidJsonResponse() {
  return NextResponse.json({ error: "Content-Type must be application/json." }, { status: 415 });
}

function invalidSlugResponse() {
  return NextResponse.json({ error: "Tenant not found." }, { status: 404 });
}

export async function GET(_request: Request, { params }: TenantIdentityRouteContext) {
  const { slug } = await params;

  if (!isValidTenantSlug(slug)) {
    return invalidSlugResponse();
  }

  const identity = read<TenantIdentity>(tenantIdentityFile(slug));

  if (!identity) {
    return NextResponse.json({ error: "Tenant not found." }, { status: 404 });
  }

  return NextResponse.json(identity);
}

export async function PUT(request: Request, { params }: TenantIdentityRouteContext) {
  const { slug } = await params;

  if (!isValidTenantSlug(slug)) {
    return invalidSlugResponse();
  }

  if (!isJsonRequest(request)) {
    return invalidJsonResponse();
  }

  const identity = normalizeTenantIdentity(await request.json());

  if (!identity || identity.slug !== slug) {
    return NextResponse.json({ error: "Invalid tenant identity." }, { status: 400 });
  }

  write(tenantIdentityFile(slug), identity);

  return NextResponse.json(identity);
}
