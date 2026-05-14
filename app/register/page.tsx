import type { Metadata } from "next";
import Link from "next/link";
import { TenantWordmark } from "@/components/admin";
import { LandingFooter } from "@/components/landing-footer";
import { RegisterForm } from "./register-form";

export const metadata: Metadata = {
  title: "Register | Sysnotes by JFL",
  description: "Create a Sysnotes by JFL account.",
};

const navLinks = [
  { label: "About", href: "/about" },
  { label: "Login", href: "/login" },
];

export default function RegisterPage() {
  return (
    <main className="min-h-screen bg-[var(--surface-page)] text-[var(--text-primary)]">
      <section className="sticky top-0 z-20 border-b border-[var(--header-border)] bg-[var(--header-bg)]">
        <div className="mx-auto flex max-w-[90rem] items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
          <Link className="text-lg tracking-normal" href="/">
            <TenantWordmark />
          </Link>
          <nav className="flex items-center gap-3 text-sm text-[var(--header-link-color)] sm:gap-8">
            {navLinks.map((link) => (
              <Link
                className="border-b border-transparent pb-1 transition hover:border-[var(--tenant-accent-bg)] hover:text-[var(--header-link-hover)]"
                href={link.href}
                key={link.href}
              >
                {link.label}
              </Link>
            ))}
          </nav>
        </div>
      </section>

      <section className="mx-auto flex max-w-[90rem] justify-center px-4 py-16 sm:px-6 lg:px-8 lg:py-24">
        <RegisterForm />
      </section>

      <LandingFooter />
    </main>
  );
}
