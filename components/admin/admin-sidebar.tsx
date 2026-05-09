"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { AdminLogoutButton } from "./admin-logout-button";
import { useTenantIdentity } from "./tenant-identity-ui";

const navItems = [
  { href: "/admin", icon: "ti-layout-dashboard", label: "Dashboard" },
  { href: "/admin/releases", icon: "ti-notes", label: "Releases" },
  { href: "/admin/identity", icon: "ti-palette", label: "Identity" },
  { href: "/admin/settings", icon: "ti-settings", label: "Settings" },
];

function isActivePath(pathname: string, href: string) {
  if (href === "/admin") {
    return pathname === href;
  }

  return pathname.startsWith(href);
}

export function AdminSidebar() {
  const pathname = usePathname();
  const identity = useTenantIdentity();

  return (
    <aside className="flex h-screen w-[200px] shrink-0 flex-col border-r border-[var(--border-subtle)] bg-[var(--surface-card)] p-4">
      <Link
        className="text-[13px] font-semibold text-[var(--text-muted-5)]"
        href="/"
      >
        Sysnotes
      </Link>

      <div className="mt-4 border-t border-[var(--border-subtle)] pt-4">
        <nav className="grid gap-1">
          {navItems.map((item) => {
            const isActive = isActivePath(pathname, item.href);

            return (
              <Link
                className={
                  isActive
                    ? "flex w-full items-center gap-2 border-l-2 border-[var(--accent-bg)] bg-[var(--surface-hover,var(--tag-bg))] px-3 py-2 text-[13px] font-medium text-[var(--text-primary)]"
                    : "flex w-full items-center gap-2 border-l-2 border-transparent px-3 py-2 text-[13px] text-[var(--text-muted-4)] transition hover:bg-[var(--surface-hover,var(--tag-bg))] hover:text-[var(--text-primary)]"
                }
                href={item.href}
                key={item.href}
              >
                <i aria-hidden="true" className={`ti ${item.icon} text-base`} />
                {item.label}
              </Link>
            );
          })}
        </nav>
      </div>

      <div className="mt-auto border-t border-[var(--border-subtle)] pt-4">
        <a
          className="block text-xs text-[var(--text-muted-4)] transition hover:text-[var(--text-primary)]"
          href={`/${identity.slug}`}
          target="_blank"
        >
          ← View my page
        </a>
        <AdminLogoutButton />
      </div>
    </aside>
  );
}
