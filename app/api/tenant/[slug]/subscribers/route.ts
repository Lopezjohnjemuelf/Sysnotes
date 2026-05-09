import { NextResponse } from "next/server";
import {
  isValidTenantSlug,
  tenantSubscribersFile,
} from "@/lib/db/tenant-data";
import { read, write } from "@/lib/db/file-store";
import type { Subscriber } from "@/lib/types";

type TenantSubscribersRouteContext = {
  params: Promise<{
    slug: string;
  }>;
};

function readSubscribers(slug: string) {
  return read<Subscriber[]>(tenantSubscribersFile(slug)) ?? [];
}

function isJsonRequest(request: Request) {
  return request.headers.get("content-type")?.includes("application/json");
}

function invalidJsonResponse() {
  return NextResponse.json({ error: "Content-Type must be application/json." }, { status: 415 });
}

function invalidSlugResponse() {
  return NextResponse.json({ error: "Tenant not found." }, { status: 404 });
}

function normalizeSubscriber(value: unknown, slug: string): Subscriber | null {
  if (!value || typeof value !== "object") {
    return null;
  }

  const subscriber = value as Partial<Subscriber>;

  if (typeof subscriber.email !== "string" || !subscriber.email.includes("@")) {
    return null;
  }

  return {
    email: subscriber.email.trim().toLowerCase(),
    slug,
    subscribedAt:
      typeof subscriber.subscribedAt === "string"
        ? subscriber.subscribedAt
        : new Date().toISOString(),
  };
}

export async function GET(_request: Request, { params }: TenantSubscribersRouteContext) {
  const { slug } = await params;

  if (!isValidTenantSlug(slug)) {
    return invalidSlugResponse();
  }

  return NextResponse.json(readSubscribers(slug));
}

export async function POST(request: Request, { params }: TenantSubscribersRouteContext) {
  const { slug } = await params;

  if (!isValidTenantSlug(slug)) {
    return invalidSlugResponse();
  }

  if (!isJsonRequest(request)) {
    return invalidJsonResponse();
  }

  const subscriber = normalizeSubscriber(await request.json(), slug);

  if (!subscriber) {
    return NextResponse.json({ error: "Invalid subscriber." }, { status: 400 });
  }

  const subscribers = readSubscribers(slug);
  const nextSubscribers = [subscriber, ...subscribers];

  write(tenantSubscribersFile(slug), nextSubscribers);

  return NextResponse.json(subscriber, { status: 201 });
}
