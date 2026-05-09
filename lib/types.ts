export type ReleaseStatus = "published" | "draft" | "private";

export type Release = {
  /** UUID required for stable release persistence and admin mutations. */
  id: string;
  version: string;
  date: string;
  title: string;
  summary: string;
  /** Markdown-formatted release detail body shown on tenant release pages. */
  body?: string;
  tags: string[];
  status: ReleaseStatus;
  /** Required for private releases; appended to tenant private URLs as ?token=. */
  shareToken?: string;
};

export type TenantIdentity = {
  slug: string;
  brandName: string;
  logoUrl: string | null;
  accentBg: string;
  accentText: string;
  colorScheme?: "light" | "dark";
  fontFamily?: "sans" | "serif" | "mono";
  badgePosition?: "left" | "right";
  comingSoon?: boolean;
  webhookUrl?: string;
};

export type Subscriber = {
  email: string;
  slug: string;
  subscribedAt: string;
};
