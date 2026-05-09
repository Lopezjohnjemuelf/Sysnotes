"use client";

import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";

const WELCOME_MODAL_KEY = "sysnotes:admin-welcome:v1";

export function LoginClient() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setIsSubmitting(true);

    const result = await signIn("credentials", {
      password,
      redirect: false,
    });

    setIsSubmitting(false);

    if (result?.error) {
      setError("Incorrect password.");
      return;
    }

    window.localStorage.setItem(WELCOME_MODAL_KEY, "pending");
    router.push("/admin/releases");
    router.refresh();
  }

  return (
    <form
      className="self-start rounded-lg border border-[var(--border-light)] bg-[var(--surface-card)] p-6 sm:p-8"
      onSubmit={handleSubmit}
    >
      <div>
        <h2 className="text-3xl font-semibold tracking-normal">Sign in</h2>
        <p className="mt-3 text-sm leading-6 text-[var(--text-muted-5)]">
          Use your workspace credentials to continue.
        </p>
      </div>

      <div className="mt-8 grid gap-5">
        <label className="grid gap-2">
          <span className="text-sm font-semibold">Password</span>
          <input
            className="rounded-md border border-[var(--border-light)] bg-[var(--surface-card)] px-3 py-3 text-base text-[var(--text-primary)] outline-none transition focus:border-[var(--tenant-accent-bg)]"
            name="password"
            onChange={(event) => {
              setPassword(event.target.value);
              setError("");
            }}
            placeholder="Enter password"
            type="password"
            value={password}
          />
        </label>
      </div>

      {error ? (
        <p className="mt-5 text-sm font-medium text-[var(--text-primary)]">
          {error}
        </p>
      ) : null}

      <button
        aria-disabled={isSubmitting}
        className="mt-8 w-full rounded-full bg-[var(--tenant-accent-bg)] px-4 py-3 text-sm font-semibold text-[var(--tenant-accent-text)] transition"
        disabled={isSubmitting}
        type="submit"
      >
        {isSubmitting ? "Signing in..." : "Login"}
      </button>
    </form>
  );
}
