import type { Metadata } from "next";
import { IdentityClient } from "./identity-client";

export const metadata: Metadata = {
  title: "Company Identity | Sysnotes by JFL",
  description: "Customize the Sysnotes by JFL admin identity preview.",
};

export default function AdminIdentityPage() {
  return (
    <main className="min-h-screen bg-[var(--surface-page)] text-[var(--text-primary)]">
      <section className="mx-auto max-w-7xl px-5 py-12 sm:px-8">
        <div className="mb-8 max-w-2xl">
          <p className="text-sm font-medium uppercase tracking-[0.18em] text-[var(--text-muted-1)]">
            Admin Portal
          </p>
          <h1 className="mt-3 text-4xl font-semibold tracking-normal">
            Company Identity
          </h1>
          <p className="mt-4 text-base leading-7 text-[var(--text-muted-4)]">
            Customize how your changelog appears to visitors. This v1 saves
            identity settings to this browser and applies them to the admin
            preview only.
          </p>
        </div>

        <IdentityClient />
      </section>
    </main>
  );
}
