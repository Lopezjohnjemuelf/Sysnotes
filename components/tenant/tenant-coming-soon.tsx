"use client";

import { useState, type FormEvent } from "react";
import type { TenantIdentity } from "@/lib/types";
import { TenantBrandMark } from "./tenant-brand";
import { TenantPoweredBy } from "./tenant-powered-by";

type TenantComingSoonProps = {
  identity: TenantIdentity;
};

export function TenantComingSoon({ identity }: TenantComingSoonProps) {
  const [email, setEmail] = useState("");
  const [isConfirmed, setIsConfirmed] = useState(false);

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const trimmedEmail = email.trim();

    if (!trimmedEmail) {
      return;
    }

    window.localStorage.setItem(
      `sysnotes:notify:${identity.slug}`,
      trimmedEmail,
    );
    setIsConfirmed(true);
  }

  return (
    <main className="flex min-h-[calc(100vh-56px-61px)] flex-col items-center justify-center bg-[var(--surface-page)] px-4 py-10 text-center text-[var(--text-primary)] sm:px-6">
      <section className="flex w-full max-w-[480px] flex-col items-center">
        <TenantBrandMark identity={identity} />

        <p className="mt-8 rounded-full bg-[var(--tenant-accent-bg)] px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.16em] text-[var(--tenant-accent-text)]">
          Coming soon
        </p>
        <h1 className="mt-5 max-w-full break-words text-[28px] font-semibold leading-tight tracking-normal sm:text-[32px]">
          {identity.brandName} release notes
        </h1>
        <p className="mt-3 text-[15px] leading-6 text-[var(--text-muted-5)]">
          We're working on something. Release notes and updates will appear here
          soon.
        </p>
        <p className="mt-2 text-sm italic text-[var(--text-muted-4)]">
          What you see is what you get.
        </p>

        <form
          className="mt-6 grid w-full max-w-[360px] gap-2 sm:flex"
          onSubmit={handleSubmit}
        >
          <input
            className="min-h-11 min-w-0 flex-1 border border-[var(--border-light)] bg-[var(--surface-card)] px-3 py-2 text-sm text-[var(--text-primary)] outline-none transition placeholder:text-[var(--text-muted-4)] focus:border-[var(--tenant-accent-bg)]"
            onChange={(event) => {
              setEmail(event.target.value);
              setIsConfirmed(false);
            }}
            placeholder="Get notified"
            type="email"
            value={email}
          />
          <button
            className="min-h-11 bg-[var(--tenant-accent-bg)] px-4 py-2 text-sm font-semibold text-[var(--tenant-accent-text)]"
            type="submit"
          >
            Notify me
          </button>
        </form>

        {isConfirmed ? (
          <p className="mt-3 text-sm text-[var(--text-muted-5)]">
            You're on the list.
          </p>
        ) : null}

        <p className="mt-8 text-xs text-[var(--text-muted-4)]">
          <TenantPoweredBy />
        </p>
      </section>
    </main>
  );
}
