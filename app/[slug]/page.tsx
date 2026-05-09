import { TenantPageClient } from "./tenant-page-client";

export const revalidate = 60;

export async function generateStaticParams() {
  return [];
}

export default function TenantPage() {
  return <TenantPageClient />;
}
