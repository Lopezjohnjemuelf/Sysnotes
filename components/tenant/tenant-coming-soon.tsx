"use client";

import { useEffect, useRef, useState, type FormEvent } from "react";
import type { TenantIdentity } from "@/lib/types";
import { TenantBrandMark } from "./tenant-brand";
import { TenantPoweredBy } from "./tenant-powered-by";

type TenantComingSoonProps = {
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

export function TenantComingSoon({ identity }: TenantComingSoonProps) {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<SubscribeStatus>("idle");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const shakeTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const successTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const statusMessage = getSubscribeStatusMessage(status);

  useEffect(() => {
    return () => {
      if (shakeTimerRef.current) {
        clearTimeout(shakeTimerRef.current);
      }

      if (successTimerRef.current) {
        clearTimeout(successTimerRef.current);
      }
    };
  }, []);

  function shakeInput() {
    const inputEl = inputRef.current;

    if (!inputEl) {
      return;
    }

    inputEl.classList.add("anim-shake");

    if (shakeTimerRef.current) {
      clearTimeout(shakeTimerRef.current);
    }

    shakeTimerRef.current = setTimeout(() => {
      inputEl.classList.remove("anim-shake");
    }, 400);
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (isSubmitting) {
      return;
    }

    const trimmedEmail = email.trim();

    if (!trimmedEmail) {
      setStatus("error");
      shakeInput();
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
        setStatus("success");

        if (successTimerRef.current) {
          clearTimeout(successTimerRef.current);
        }

        successTimerRef.current = setTimeout(() => {
          setStatus("idle");
        }, 3000);
        return;
      }

      if (response.status === 400) {
        shakeInput();
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
    <main className="flex min-h-[calc(100vh-56px-61px)] flex-col items-center justify-center bg-[var(--surface-page)] px-4 py-10 text-center text-[var(--text-primary)] sm:px-6">
      <section className="flex w-full max-w-[480px] flex-col items-center">
        <div className="anim-fade-in delay-1">
          <TenantBrandMark identity={identity} />
        </div>

        <div className="anim-scale-in delay-2 mt-8">
          <p className="anim-pulse rounded-full bg-[var(--tenant-accent-bg)] px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.16em] text-[var(--tenant-accent-text)]">
            Coming soon
          </p>
        </div>
        <h1 className="anim-fade-up delay-3 mt-5 max-w-full break-words text-[28px] font-semibold leading-tight tracking-normal sm:text-[32px]">
          {identity.brandName} release notes
        </h1>
        <p className="anim-fade-up delay-4 mt-3 text-[15px] leading-6 text-[var(--text-muted-5)]">
          We're working on something. Release notes and updates will appear here
          soon.
        </p>
        <p className="anim-fade-up delay-4 mt-2 min-h-5 text-xs italic text-[var(--text-muted-4)]">
          <span className="typewriter-line">What you see is what you get.</span>
        </p>
        <form
          className="anim-fade-up delay-5 mt-6 grid w-full max-w-[360px] gap-2 sm:flex"
          onSubmit={handleSubmit}
        >
          <input
            className="min-h-11 min-w-0 flex-1 border border-[var(--border-light)] bg-[var(--surface-card)] px-3 py-2 text-sm text-[var(--text-primary)] outline-none transition placeholder:text-[var(--text-muted-4)] focus:border-[var(--tenant-accent-bg)]"
            onChange={(event) => {
              setEmail(event.target.value);
              setStatus("idle");
            }}
            placeholder="Get notified"
            ref={inputRef}
            type="email"
            value={email}
          />
          <button
            className="premium-button inline-flex min-h-11 min-w-[7rem] items-center justify-center rounded-[var(--radius-sm)] bg-[var(--tenant-accent-bg)] px-4 py-2 text-sm font-semibold text-[var(--tenant-accent-text)] disabled:cursor-not-allowed disabled:opacity-60"
            disabled={isSubmitting}
            type="submit"
          >
            {isSubmitting ? (
              <span aria-label="Subscribing" className="subscribe-spinner" />
            ) : status === "success" ? (
              <span className="anim-fade-in" aria-label="Subscribed">
                ✓
              </span>
            ) : (
              "Notify me"
            )}
          </button>
        </form>

        {status !== "idle" ? (
          <p
            className={`mt-3 ${
              status === "success"
                ? "text-[13px] text-[var(--text-muted-5)]"
                : status === "duplicate"
                  ? "text-xs text-[var(--text-muted-4)]"
                  : "text-xs text-[var(--error-text)]"
            }`}
          >
            {statusMessage}
          </p>
        ) : null}

        <p className="mt-8 text-xs text-[var(--text-muted-4)]">
          <TenantPoweredBy />
        </p>
      </section>
    </main>
  );
}
