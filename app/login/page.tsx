import type { Metadata } from "next";
import Link from "next/link";
import { TenantWordmark } from "@/components/admin";
import { LandingFooter } from "@/components/landing-footer";
import { LoginClient } from "./login-client";

export const metadata: Metadata = {
  title: "Login | Sysnotes by JFL",
  description: "Login to Sysnotes by JFL.",
};

const navLinks = [
  { label: "About", href: "/about" },
  { label: "Login", href: "/login" },
];

export default function LoginPage() {
  return (
    <main className="flex min-h-screen flex-col bg-[var(--surface-page)] text-[var(--text-primary)]">
      <section className="sticky top-0 z-20 border-b border-[var(--header-border)] bg-[var(--header-bg)]">
        <div className="mx-auto flex max-w-[90rem] items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
          <Link className="text-lg tracking-normal" href="/">
            <TenantWordmark />
          </Link>
          <nav className="flex items-center gap-3 text-sm text-[var(--header-link-color)] sm:gap-8">
            {navLinks.map((link) => (
              <Link
                className={
                  link.label === "Login"
                    ? "rounded-full bg-[var(--tenant-accent-bg)] px-4 py-2 font-medium text-[var(--tenant-accent-text)] transition hover:text-[var(--tenant-accent-text)]"
                    : "border-b border-transparent pb-1 transition hover:border-[var(--tenant-accent-bg)] hover:text-[var(--header-link-hover)]"
                }
                href={link.href}
                key={link.href}
              >
                {link.label}
              </Link>
            ))}
          </nav>
        </div>
      </section>

      <section className="mx-auto grid w-full max-w-[90rem] flex-1 gap-10 px-4 py-16 sm:px-6 lg:grid-cols-[1fr_28rem] lg:px-8 lg:py-24">
        <div className="flex flex-col justify-between border-t border-[var(--border-light)] pt-8">
          <div>
            <h1 className="mt-8 max-w-4xl font-serif text-[4rem] font-semibold uppercase leading-[0.88] tracking-normal text-balance sm:text-[6rem] lg:text-[7.4rem]">
              Continue to Sysnotes.
            </h1>
          </div>
          <p className="mt-10 max-w-xl text-lg leading-8 text-[var(--text-muted-5)]">
            Sign in to review releases, manage web updates, and keep the public
            changelog aligned.
          </p>
        </div>

        <LoginClient />
      </section>

      <LandingFooter />
    </main>
  );
}
