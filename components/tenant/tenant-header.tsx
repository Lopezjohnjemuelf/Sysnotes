"use client";

import { useEffect, useRef, useState, type FormEvent } from "react";
import type { TenantIdentity } from "@/lib/types";
import { TenantBrandMark } from "./tenant-brand";

type TenantHeaderProps = {
  identity: TenantIdentity;
};

type SubscribeStatus = "idle" | "success" | "duplicate" | "error";

function getSubscribeStatusMessage(status: SubscribeStatus) {
  if (status === "success") {
    return "You're subscribed.";
  }

  if (status === "duplicate") {
    return "Already subscribed.";
  }

  if (status === "error") {
    return "Check your email address.";
  }

  return "";
}

export function TenantHeader({ identity }: TenantHeaderProps) {
  const [email, setEmail] = useState("");
  const [isSubscribeOpen, setIsSubscribeOpen] = useState(false);
  const [status, setStatus] = useState<SubscribeStatus>("idle");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const successTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const statusMessage = getSubscribeStatusMessage(status);

  useEffect(() => {
    return () => {
      if (successTimerRef.current) {
        clearTimeout(successTimerRef.current);
      }
    };
  }, []);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (isSubmitting) {
      return;
    }

    const trimmedEmail = email.trim();

    if (!trimmedEmail) {
      setStatus("error");
      return;
    }

    setIsSubmitting(true);
    setStatus("idle");

    try {
      const response = await fetch(
        `/api/tenant/${encodeURIComponent(identity.slug)}/subscribers`,
        {
          body: JSON.stringify({
            email: trimmedEmail,
            slug: identity.slug,
            subscribedAt: new Date().toISOString(),
          }),
          headers: {
            "Content-Type": "application/json",
          },
          method: "POST",
        },
      );

      if (response.status === 201) {
        setEmail("");
        setIsSubscribeOpen(false);
        setStatus("success");

        if (successTimerRef.current) {
          clearTimeout(successTimerRef.current);
        }

        successTimerRef.current = setTimeout(() => {
          setStatus("idle");
        }, 3000);
        return;
      }

      setStatus(response.status === 409 ? "duplicate" : "error");
    } catch (err) {
      console.warn(err);
      setStatus("error");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <header className="sticky top-0 z-30 h-14 border-b border-[var(--border-subtle)] bg-[var(--surface-header)]">
      <div className="mx-auto flex h-full max-w-[90rem] items-center justify-between gap-3 px-4 sm:px-6 lg:px-8">
        <a
          className="premium-icon-link flex min-h-7 min-w-0 items-center"
          href={`/${identity.slug}`}
        >
          <TenantBrandMark fetchPriority="high" identity={identity} />
        </a>

        <div className="relative shrink-0">
          {status === "success" ? (
            <p className="text-[13px] text-[var(--text-muted-5)]">
              {statusMessage}
            </p>
          ) : (
            <button
              className="premium-button h-9 cursor-pointer rounded-[var(--radius-sm)] border border-[var(--border-light)] bg-transparent px-3 text-[13px] text-[var(--text-primary)] hover:border-[var(--tenant-accent-bg)]"
              onClick={() => {
                setIsSubscribeOpen((currentValue) => !currentValue);
                setStatus("idle");
              }}
              type="button"
            >
              Subscribe
            </button>
          )}

          {isSubscribeOpen ? (
            <form
              className="anim-scale-in absolute right-0 top-11 z-40 w-[min(18rem,calc(100vw-2rem))] border border-[var(--border-subtle)] bg-[var(--surface-card)] p-3"
              onSubmit={handleSubmit}
            >
              <input
                className="h-10 w-full border border-[var(--border-light)] bg-[var(--surface-page)] px-3 text-sm text-[var(--text-primary)] outline-none transition-colors placeholder:text-[var(--text-muted-4)] focus:border-[var(--tenant-accent-bg)]"
                onChange={(event) => {
                  setEmail(event.target.value);
                  setStatus("idle");
                }}
                placeholder="Email address"
                type="email"
                value={email}
              />
              <button
                className="premium-button mt-2 h-10 w-full rounded-[var(--radius-sm)] bg-[var(--tenant-accent-bg)] px-3 text-sm font-semibold text-[var(--tenant-accent-text)] disabled:cursor-not-allowed disabled:opacity-60"
                disabled={isSubmitting}
                type="submit"
              >
                Subscribe
              </button>
              {status === "duplicate" || status === "error" ? (
                <p
                  className={`mt-2 text-xs ${
                    status === "duplicate"
                      ? "text-[var(--text-muted-4)]"
                      : "text-[var(--error-text)]"
                  }`}
                >
                  {statusMessage}
                </p>
              ) : null}
            </form>
          ) : null}
        </div>
      </div>
    </header>
  );
}
