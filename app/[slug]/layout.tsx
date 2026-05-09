import type { Metadata } from "next";
import { headers } from "next/headers";
import type { ReactNode } from "react";
import { DEFAULT_TENANT_IDENTITY } from "@/lib/tenant/identity";
import { loadTenantPage } from "@/lib/tenant/page-helpers";
import { TenantLayoutClient } from "./tenant-layout-client";

type TenantLayoutProps = {
  children: ReactNode;
};

type TenantLayoutMetadataProps = {
  params: Promise<{
    slug: string;
  }>;
};

async function getRequestOrigin() {
  const requestHeaders = await headers();
  const host =
    requestHeaders.get("x-forwarded-host") ?? requestHeaders.get("host");
  const protocol = requestHeaders.get("x-forwarded-proto") ?? "http";

  return host ? `${protocol}://${host}` : "http://localhost:3000";
}

export async function generateMetadata({
  params,
}: TenantLayoutMetadataProps): Promise<Metadata> {
  const { slug } = await params;
  const [origin, tenantPage] = await Promise.all([
    getRequestOrigin(),
    loadTenantPage(slug),
  ]);
  const identity = tenantPage?.identity ?? {
    ...DEFAULT_TENANT_IDENTITY,
    slug,
  };
  const title = `${identity.brandName} Release Notes`;
  const description = `Latest releases and updates from ${identity.brandName}.`;
  const url = `${origin}/${slug}`;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      type: "website",
      url,
      ...(identity.logoUrl
        ? {
            images: [{ url: identity.logoUrl }],
          }
        : {}),
    },
    robots: "index, follow",
    alternates: {
      canonical: url,
    },
  };
}

export default function TenantLayout({ children }: TenantLayoutProps) {
  return <TenantLayoutClient>{children}</TenantLayoutClient>;
}
