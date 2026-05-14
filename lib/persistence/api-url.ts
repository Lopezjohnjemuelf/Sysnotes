function getServerApiOrigin() {
  const configuredOrigin =
    process.env.NEXT_PUBLIC_TENANT_API_ORIGIN ??
    process.env.NEXT_PUBLIC_SITE_URL ??
    process.env.NEXT_PUBLIC_APP_URL;

  if (configuredOrigin) {
    return configuredOrigin;
  }

  if (process.env.VERCEL_URL) {
    return `https://${process.env.VERCEL_URL}`;
  }

  return `http://localhost:${process.env.PORT ?? "3000"}`;
}

export function resolveTenantApiUrl(path: string) {
  if (typeof window !== "undefined" || /^https?:\/\//.test(path)) {
    return path;
  }

  return new URL(path, getServerApiOrigin()).toString();
}
