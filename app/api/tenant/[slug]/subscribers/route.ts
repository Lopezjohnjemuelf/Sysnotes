import { NextRequest, NextResponse } from "next/server";
import {
  isValidTenantSlug,
  tenantSubscribersFile,
} from "@/lib/db/tenant-data";
import { read, write } from "@/lib/db/file-store";
import { rateLimit } from "@/lib/rate-limit";
import type { Subscriber } from "@/lib/types";

type TenantSubscribersRouteContext = {
  params: Promise<{
    slug: string;
  }>;
};

function readSubscribers(slug: string) {
  const subscribers = read<Subscriber[]>(tenantSubscribersFile(slug)) ?? [];

  return Array.isArray(subscribers) ? subscribers : [];
}

function isJsonRequest(request: Request) {
  return request.headers.get("content-type")?.includes("application/json");
}

function getClientIp(request: NextRequest) {
  const forwardedFor = request.headers.get("x-forwarded-for");

  if (forwardedFor) {
    return forwardedFor.split(",")[0]?.trim() || "unknown";
  }

  return (request as NextRequest & { ip?: string }).ip ?? "unknown";
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

function normalizeEmail(value: unknown) {
  if (typeof value !== "string") {
    return null;
  }

  const email = value.trim().toLowerCase();
  const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  return emailPattern.test(email) ? email : null;
}

function normalizeSubscriber(value: unknown, slug: string): Subscriber | null {
  if (!value || typeof value !== "object") {
    return null;
  }

  const subscriber = value as Partial<Subscriber>;
  const email = normalizeEmail(subscriber.email);

  if (!email) {
    return null;
  }

  return {
    email,
    slug,
    subscribedAt:
      typeof subscriber.subscribedAt === "string"
        ? subscriber.subscribedAt
        : new Date().toISOString(),
  };
}

export async function GET(
  _request: Request,
  { params }: TenantSubscribersRouteContext,
) {
  const { slug } = await params;

  if (!isValidTenantSlug(slug)) {
    return invalidSlugResponse();
  }

  return NextResponse.json(readSubscribers(slug));
}

export async function POST(
  request: NextRequest,
  { params }: TenantSubscribersRouteContext,
) {
  const { slug } = await params;
  const ip = getClientIp(request);
  const route = `/api/tenant/${slug}/subscribers`;
  const limit = await rateLimit(`${ip}:${route}`, 3, 300);

  if (!limit.allowed) {
    return NextResponse.json({ error: "Too many requests." }, { status: 429 });
  }

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
  const hasDuplicate = subscribers.some(
    (currentSubscriber) =>
      currentSubscriber.email.trim().toLowerCase() === subscriber.email,
  );

  if (hasDuplicate) {
    return NextResponse.json(
      { error: "Subscriber already exists." },
      { status: 409 },
    );
  }

  const nextSubscribers = [subscriber, ...subscribers];

  write(tenantSubscribersFile(slug), nextSubscribers);

  return NextResponse.json(subscriber, { status: 201 });
}
