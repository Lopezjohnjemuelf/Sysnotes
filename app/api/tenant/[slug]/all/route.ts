import { auth } from "@/lib/auth";
import { isValidTenantSlug } from "@/lib/db/tenant-data";

type TenantAllRouteContext = {
  params: Promise<{
    slug: string;
  }>;
};

export async function DELETE(
  _request: Request,
  { params }: TenantAllRouteContext,
) {
  const session = await auth();

  if (!session) {
    return Response.json({ error: "Unauthorized." }, { status: 401 });
  }

  const { slug } = await params;

  if (!isValidTenantSlug(slug)) {
    return Response.json({ error: "Tenant not found." }, { status: 404 });
  }

  return Response.json(
    { error: "Reset all data is not implemented." },
    { status: 501 },
  );
}
