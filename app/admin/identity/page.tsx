import type { Metadata } from "next";
import { IdentityClient } from "./identity-client";

export const metadata: Metadata = {
  title: "Company Identity | Sysnotes by JFL",
  description: "Customize the Sysnotes by JFL admin identity preview.",
};

export default function AdminIdentityPage() {
  return (
    <section>
      <div className="mb-8 max-w-2xl">
        <p className="text-sm font-medium uppercase tracking-[0.18em] text-[var(--text-muted-1)]">
          Admin Portal
        </p>
        <h1 className="mt-3 text-4xl font-semibold tracking-normal">
          Company Identity
        </h1>
        <p className="mt-4 text-base leading-7 text-[var(--text-muted-4)]">
          Customize the tenant brand name, slug, logo, colors, typography,
          layout, and coming soon mode used by admin previews and public tenant
          release pages.
        </p>
      </div>

      <IdentityClient />
    </section>
  );
}
