import { auth } from "@/lib/auth";

export async function POST(request: Request) {
  const session = await auth();

  if (!session) {
    return Response.json({ error: "Unauthorized." }, { status: 401 });
  }

  await request.json();
  console.log("Password change requested.");

  return Response.json({ ok: true });
}
