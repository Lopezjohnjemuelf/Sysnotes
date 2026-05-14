import type { Metadata } from "next";
import { headers } from "next/headers";
import { notFound } from "next/navigation";
import type { ReactNode } from "react";
import { loadTenantPage } from "@/lib/tenant/page-helpers";
import { TenantLayoutClient } from "./tenant-layout-client";

type TenantLayoutProps = {
  children: ReactNode;
  params: Promise<{
    slug: string;
  }>;
};

type TenantLayoutMetadataProps = {
  params: Promise<{
    slug: string;
  }>;
};

const RESERVED = ["admin", "api", "login", "register", "about", "releases"];

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

  if (RESERVED.includes(slug)) {
    return {
      title: "Not found",
      robots: "noindex, nofollow",
    };
  }

  const [origin, tenantPage] = await Promise.all([
    getRequestOrigin(),
    loadTenantPage(slug),
  ]);

  if (!tenantPage) {
    return {
      title: "Not found",
      robots: "noindex, nofollow",
    };
  }

  const identity = tenantPage.identity;

  if (identity.comingSoon) {
    return {
      title: `${identity.brandName} — Coming Soon`,
      robots: "noindex, nofollow",
    };
  }

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

export default async function TenantLayout({
  children,
  params,
}: TenantLayoutProps) {
  const { slug } = await params;

  if (RESERVED.includes(slug)) {
    notFound();
  }

  const tenantPage = await loadTenantPage(slug);

  if (!tenantPage) {
    notFound();
  }

  return (
    <TenantLayoutClient identity={tenantPage.identity}>
      {children}
    </TenantLayoutClient>
  );
}
