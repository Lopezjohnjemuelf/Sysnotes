import Link from "next/link";
import type { ReactNode } from "react";
import {
  DashboardIcon,
  IdentityIcon,
  LinkIcon,
  ReleaseIcon,
  SettingsIcon,
} from "@/lib/icons";
import type { IconComponent } from "@/lib/icons";

type DashboardAction = {
  href: string;
  icon: IconComponent;
  label: string;
  note: string;
};

type SummaryCard = {
  label: string;
  note: string;
  value: string;
};

type RecentRelease = {
  date: string;
  status: "Published" | "Draft" | "Private";
  tags: string[];
  title: string;
  version: string;
};

type HealthItem = {
  label: string;
  note: string;
  status: "Ready" | "Watch" | "Missing";
};

const summaryCards: SummaryCard[] = [
  {
    label: "Total releases",
    note: "All release records in this workspace",
    value: "12",
  },
  {
    label: "Published releases",
    note: "Visible on the public tenant page",
    value: "8",
  },
  {
    label: "Draft releases",
    note: "Saved for internal review",
    value: "3",
  },
  {
    label: "Private releases",
    note: "Available only through share links",
    value: "1",
  },
];

const recentReleases: RecentRelease[] = [
  {
    version: "v2.4.0",
    title: "Private release links and tenant widgets",
    status: "Published",
    date: "May 10, 2026",
    tags: ["Auth", "Widget"],
  },
  {
    version: "v2.3.2",
    title: "Identity controls and release filtering",
    status: "Draft",
    date: "May 08, 2026",
    tags: ["Identity", "Admin"],
  },
  {
    version: "v2.3.0",
    title: "Subscriber capture for coming soon pages",
    status: "Private",
    date: "May 06, 2026",
    tags: ["Subscribers"],
  },
];

const healthItems: HealthItem[] = [
  {
    label: "Public tenant page",
    note: "Tenant slug resolves to a standalone release page",
    status: "Ready",
  },
  {
    label: "Coming soon mode",
    note: "Public page can be paused before launch",
    status: "Watch",
  },
  {
    label: "Published content",
    note: "At least one release should be visible",
    status: "Ready",
  },
  {
    label: "Branding",
    note: "Logo, brand name, and accent colors are configured",
    status: "Ready",
  },
];

const quickActions: DashboardAction[] = [
  {
    href: "/admin/releases",
    icon: ReleaseIcon,
    label: "Create release",
    note: "Draft a new tenant update",
  },
  {
    href: "/admin/releases",
    icon: DashboardIcon,
    label: "Manage releases",
    note: "Review status and visibility",
  },
  {
    href: "/admin/identity",
    icon: IdentityIcon,
    label: "Edit identity",
    note: "Update slug, brand, and colors",
  },
  {
    href: "/sysnotes",
    icon: LinkIcon,
    label: "Open public page",
    note: "Preview the tenant experience",
  },
  {
    href: "/admin/settings",
    icon: SettingsIcon,
    label: "Open settings",
    note: "Security and workspace controls",
  },
];

function StatusChip({ status }: { status: HealthItem["status"] | RecentRelease["status"] }) {
  const className =
    status === "Ready" || status === "Published"
      ? "border-[var(--accent-bg)] bg-[var(--accent-bg)] text-[var(--accent-text)]"
      : status === "Missing" || status === "Private"
        ? "border-[var(--border-light)] bg-[var(--surface-page)] text-[var(--text-muted-5)]"
        : "border-[var(--border-subtle)] bg-[var(--tag-bg)] text-[var(--text-muted-5)]";

  return (
    <span
      className={`inline-flex w-fit rounded-full border px-2.5 py-1 text-xs font-semibold ${className}`}
    >
      {status}
    </span>
  );
}

function DashboardCard({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <section
      className={`rounded-lg border border-[var(--border-light)] bg-[var(--surface-card)] ${className}`}
    >
      {children}
    </section>
  );
}

function SectionHeader({
  description,
  title,
}: {
  description: string;
  title: string;
}) {
  return (
    <div className="border-b border-[var(--border-subtle)] px-5 py-4">
      <h2 className="text-lg font-semibold tracking-normal">{title}</h2>
      <p className="mt-1 text-sm leading-6 text-[var(--text-muted-5)]">
        {description}
      </p>
    </div>
  );
}

export function DashboardHeader() {
  return (
    <header className="flex flex-col justify-between gap-5 border-b border-[var(--border-light)] pb-6 lg:flex-row lg:items-end">
      <div>
        <p className="text-sm font-medium uppercase tracking-[0.18em] text-[var(--text-muted-1)]">
          Admin Portal
        </p>
        <h1 className="mt-3 text-4xl font-semibold tracking-normal">
          Dashboard
        </h1>
        <p className="mt-3 max-w-2xl text-sm leading-6 text-[var(--text-muted-5)]">
          Control center for tenant release management, publishing readiness,
          visibility, and workspace configuration.
        </p>
      </div>

      <div className="flex flex-wrap gap-3">
        <Link
          className="inline-flex min-h-10 items-center rounded-full bg-[var(--accent-bg)] px-5 py-2 text-sm font-semibold text-[var(--accent-text)]"
          href="/admin/releases"
        >
          New release
        </Link>
        <Link
          className="inline-flex min-h-10 items-center rounded-full border border-[var(--border-light)] bg-[var(--surface-card)] px-5 py-2 text-sm font-semibold text-[var(--text-primary)] transition hover:bg-[var(--tag-bg)]"
          href="/sysnotes"
        >
          View public page
        </Link>
      </div>
    </header>
  );
}

export function TenantOverviewCard() {
  return (
    <DashboardCard>
      <SectionHeader
        title="Tenant overview"
        description="Current workspace identity and public page readiness."
      />
      <div className="grid gap-5 p-5 lg:grid-cols-[minmax(0,1fr)_14rem]">
        <div>
          <div className="flex flex-wrap items-center gap-3">
            <h2 className="text-2xl font-semibold tracking-normal">
              Sysnotes by JFL
            </h2>
            <StatusChip status="Ready" />
          </div>

          <dl className="mt-5 grid gap-4 text-sm sm:grid-cols-3">
            <div>
              <dt className="text-xs font-semibold uppercase tracking-[0.16em] text-[var(--text-muted-1)]">
                Current slug
              </dt>
              <dd className="mt-2 font-mono text-[var(--text-muted-5)]">
                sysnotes
              </dd>
            </div>
            <div>
              <dt className="text-xs font-semibold uppercase tracking-[0.16em] text-[var(--text-muted-1)]">
                Public URL
              </dt>
              <dd className="mt-2 truncate text-[var(--text-muted-5)]">
                /sysnotes
              </dd>
            </div>
            <div>
              <dt className="text-xs font-semibold uppercase tracking-[0.16em] text-[var(--text-muted-1)]">
                Mode
              </dt>
              <dd className="mt-2">
                <StatusChip status="Published" />
              </dd>
            </div>
          </dl>
        </div>

        <div className="rounded-lg border border-[var(--border-subtle)] bg-[var(--surface-page)] p-4">
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[var(--text-muted-1)]">
            Identity complete
          </p>
          <p className="mt-3 text-sm leading-6 text-[var(--text-muted-5)]">
            Brand name, slug, accent colors, and launch mode are ready for
            publishing.
          </p>
        </div>
      </div>

      <div className="flex flex-wrap gap-3 border-t border-[var(--border-subtle)] px-5 py-4">
        <Link
          className="text-sm font-semibold text-[var(--text-primary)] transition hover:text-[var(--text-muted-5)]"
          href="/admin/identity"
        >
          Edit identity
        </Link>
        <Link
          className="text-sm font-semibold text-[var(--text-primary)] transition hover:text-[var(--text-muted-5)]"
          href="/sysnotes"
        >
          Open public page
        </Link>
      </div>
    </DashboardCard>
  );
}

export function ReleaseSummaryCards() {
  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {summaryCards.map((card) => (
        <article
          className="rounded-lg border border-[var(--border-light)] bg-[var(--surface-card)] p-5"
          key={card.label}
        >
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[var(--text-muted-1)]">
            {card.label}
          </p>
          <p className="mt-4 text-4xl font-semibold leading-none text-[var(--text-primary)]">
            {card.value}
          </p>
          <p className="mt-3 text-sm leading-6 text-[var(--text-muted-5)]">
            {card.note}
          </p>
        </article>
      ))}
    </div>
  );
}

export function RecentReleasesPreview() {
  return (
    <DashboardCard>
      <SectionHeader
        title="Recent releases"
        description="Preview of the latest tenant release activity."
      />

      <div className="overflow-x-auto">
        <div className="min-w-[760px] divide-y divide-[var(--border-subtle)]">
          <div className="grid grid-cols-[7rem_minmax(14rem,1fr)_7rem_8rem_12rem_7rem] gap-4 px-5 py-3 text-xs font-semibold uppercase tracking-[0.14em] text-[var(--text-muted-1)]">
            <span>Version</span>
            <span>Title</span>
            <span>Status</span>
            <span>Date</span>
            <span>Tags</span>
            <span>Actions</span>
          </div>

          {recentReleases.map((release) => (
            <div
              className="grid grid-cols-[7rem_minmax(14rem,1fr)_7rem_8rem_12rem_7rem] items-center gap-4 px-5 py-4 text-sm"
              key={release.version}
            >
              <span className="font-mono text-[var(--text-muted-5)]">
                {release.version}
              </span>
              <span className="font-medium text-[var(--text-primary)]">
                {release.title}
              </span>
              <StatusChip status={release.status} />
              <span className="text-[var(--text-muted-5)]">{release.date}</span>
              <span className="flex flex-wrap gap-1.5">
                {release.tags.map((tag) => (
                  <span
                    className="rounded-full bg-[var(--tag-bg)] px-2 py-1 text-xs text-[var(--text-muted-5)]"
                    key={`${release.version}-${tag}`}
                  >
                    {tag}
                  </span>
                ))}
              </span>
              <span className="flex gap-3">
                <Link
                  className="text-xs font-semibold text-[var(--text-primary)] transition hover:text-[var(--text-muted-5)]"
                  href="/admin/releases"
                >
                  Edit
                </Link>
                <Link
                  className="text-xs font-semibold text-[var(--text-primary)] transition hover:text-[var(--text-muted-5)]"
                  href="/sysnotes"
                >
                  View
                </Link>
              </span>
            </div>
          ))}
        </div>
      </div>

      <div className="border-t border-[var(--border-subtle)] px-5 py-4">
        <Link
          className="text-sm font-semibold text-[var(--text-primary)] transition hover:text-[var(--text-muted-5)]"
          href="/admin/releases"
        >
          View all releases
        </Link>
      </div>
    </DashboardCard>
  );
}

export function PublishingHealthPanel() {
  return (
    <DashboardCard>
      <SectionHeader
        title="Publishing status"
        description="Readiness checks before customers visit the tenant page."
      />
      <div className="divide-y divide-[var(--border-subtle)]">
        {healthItems.map((item) => (
          <div
            className="grid gap-3 px-5 py-4 sm:grid-cols-[minmax(0,1fr)_7rem] sm:items-center"
            key={item.label}
          >
            <div>
              <p className="text-sm font-semibold text-[var(--text-primary)]">
                {item.label}
              </p>
              <p className="mt-1 text-sm leading-6 text-[var(--text-muted-5)]">
                {item.note}
              </p>
            </div>
            <StatusChip status={item.status} />
          </div>
        ))}
      </div>
    </DashboardCard>
  );
}

export function QuickActionsGrid() {
  return (
    <DashboardCard>
      <SectionHeader
        title="Quick actions"
        description="Shortcuts for common tenant release workflows."
      />
      <div className="grid gap-3 p-5 sm:grid-cols-2 xl:grid-cols-5">
        {quickActions.map((action) => {
          const Icon = action.icon;

          return (
            <Link
              className="rounded-lg border border-[var(--border-subtle)] bg-[var(--surface-page)] p-4 transition hover:border-[var(--border-light)] hover:bg-[var(--tag-bg)]"
              href={action.href}
              key={action.label}
            >
              <Icon aria-hidden="true" size={18} stroke={1.5} />
              <p className="mt-3 text-sm font-semibold text-[var(--text-primary)]">
                {action.label}
              </p>
              <p className="mt-2 text-xs leading-5 text-[var(--text-muted-5)]">
                {action.note}
              </p>
            </Link>
          );
        })}
      </div>
    </DashboardCard>
  );
}

export function FirstUseDashboardState() {
  return (
    <section className="rounded-lg border border-dashed border-[var(--border-light)] bg-[var(--surface-card)] p-6">
      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_18rem] lg:items-center">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--text-muted-1)]">
            First-use path
          </p>
          <h2 className="mt-3 text-2xl font-semibold tracking-normal">
            Start with identity, then publish the first release.
          </h2>
          <p className="mt-3 max-w-2xl text-sm leading-6 text-[var(--text-muted-5)]">
            This dashboard is ready for empty data states. When no tenant
            identity or releases exist, admins should configure branding first,
            then create a draft release and publish when ready.
          </p>
        </div>
        <div className="grid gap-3">
          <Link
            className="inline-flex justify-center rounded-full bg-[var(--accent-bg)] px-4 py-2 text-sm font-semibold text-[var(--accent-text)]"
            href="/admin/identity"
          >
            Configure identity first
          </Link>
          <Link
            className="inline-flex justify-center rounded-full border border-[var(--border-light)] bg-[var(--surface-card)] px-4 py-2 text-sm font-semibold text-[var(--text-primary)] transition hover:bg-[var(--tag-bg)]"
            href="/admin/releases"
          >
            Create the first release
          </Link>
        </div>
      </div>
    </section>
  );
}

export function DashboardLoadingSkeleton() {
  return (
    <DashboardCard>
      <SectionHeader
        title="Loading-safe layout"
        description="Placeholder blocks for dynamic integration states."
      />
      <div className="grid gap-4 p-5 lg:grid-cols-4" aria-hidden="true">
        {[0, 1, 2, 3].map((item) => (
          <div
            className="rounded-lg border border-[var(--border-subtle)] bg-[var(--surface-page)] p-4"
            key={item}
          >
            <div className="h-3 w-24 rounded-full bg-[var(--tag-bg)]" />
            <div className="mt-5 h-8 w-14 rounded-full bg-[var(--tag-bg)]" />
            <div className="mt-4 h-3 w-full rounded-full bg-[var(--tag-bg)]" />
            <div className="mt-2 h-3 w-2/3 rounded-full bg-[var(--tag-bg)]" />
          </div>
        ))}
      </div>
    </DashboardCard>
  );
}
