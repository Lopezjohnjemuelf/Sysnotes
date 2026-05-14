import { NextRequest, NextResponse } from "next/server";
import { rateLimit } from "@/lib/rate-limit";

type RegisterErrors = Partial<
  Record<"confirmPassword" | "email" | "name" | "password", string>
>;

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const route = "/api/auth/register";

function getClientIp(request: NextRequest) {
  const forwardedFor = request.headers.get("x-forwarded-for");

  if (forwardedFor) {
    return forwardedFor.split(",")[0]?.trim() || "unknown";
  }

  return (request as NextRequest & { ip?: string }).ip ?? "unknown";
}

function isJsonRequest(request: Request) {
  return request.headers.get("content-type")?.includes("application/json");
}

function validateRegistration(value: unknown) {
  const errors: RegisterErrors = {};

  if (!value || typeof value !== "object") {
    return {
      errors: { email: "Email is required." },
      values: null,
    };
  }

  const payload = value as {
    email?: unknown;
    name?: unknown;
    confirmPassword?: unknown;
    password?: unknown;
  };
  const name = typeof payload.name === "string" ? payload.name.trim() : "";
  const email = typeof payload.email === "string" ? payload.email.trim() : "";
  const password =
    typeof payload.password === "string" ? payload.password : "";
  const confirmPassword =
    typeof payload.confirmPassword === "string"
      ? payload.confirmPassword
      : "";

  if (!name) {
    errors.name = "Full name is required.";
  }

  if (!email) {
    errors.email = "Email is required.";
  } else if (!emailPattern.test(email)) {
    errors.email = "Enter a valid email address.";
  }

  if (!password) {
    errors.password = "Password is required.";
  } else if (password.length < 8) {
    errors.password = "Password must be at least 8 characters.";
  }

  if (confirmPassword !== password) {
    errors.confirmPassword = "Passwords must match.";
  }

  return {
    errors,
    values: { email, name },
  };
}

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

  if (!isJsonRequest(request)) {
    return NextResponse.json(
      { error: "Content-Type must be application/json." },
      { status: 415 },
    );
  }

  const { errors, values } = validateRegistration(await request.json());

  if (Object.keys(errors).length > 0 || !values) {
    return NextResponse.json(
      { error: "Check the highlighted fields.", errors },
      { status: 400 },
    );
  }

  console.info("Registration request received:", values.email);

  return NextResponse.json(
    {
      message: "Registration submitted. You can sign in after access is approved.",
      ok: true,
    },
    { status: 201 },
  );
}
