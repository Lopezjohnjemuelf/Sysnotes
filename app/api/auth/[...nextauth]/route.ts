import { NextRequest, NextResponse } from "next/server";
import { GET, POST as nextAuthPost } from "@/lib/auth";
import { rateLimit } from "@/lib/rate-limit";

const route = "/api/auth/[...nextauth]";

function getClientIp(request: NextRequest) {
  const forwardedFor = request.headers.get("x-forwarded-for");

  if (forwardedFor) {
    return forwardedFor.split(",")[0]?.trim() || "unknown";
  }

  return (request as NextRequest & { ip?: string }).ip ?? "unknown";
}

export { GET };

export async function POST(request: NextRequest) {
  const ip = getClientIp(request);
  const limit = await rateLimit(`${ip}:${route}`, 5, 60);

  if (!limit.allowed) {
    console.warn("Rate limit hit:", ip, route);

    return NextResponse.json(
      { error: "Too many attempts. Try again later." },
      { status: 429 },
    );
  }

  return nextAuthPost(request);
}
