"use client";

import Link from "next/link";
import { useState, type FormEvent } from "react";

type RegisterFormState = {
  confirmPassword: string;
  email: string;
  name: string;
  password: string;
};

type RegisterFormErrors = Partial<Record<keyof RegisterFormState, string>>;

const initialFormState: RegisterFormState = {
  confirmPassword: "",
  email: "",
  name: "",
  password: "",
};

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function validateForm(formState: RegisterFormState) {
  const errors: RegisterFormErrors = {};
  const name = formState.name.trim();
  const email = formState.email.trim();

  if (!name) {
    errors.name = "Full name is required.";
  }

  if (!email) {
    errors.email = "Email is required.";
  } else if (!emailPattern.test(email)) {
    errors.email = "Enter a valid email address.";
  }

  if (!formState.password) {
    errors.password = "Password is required.";
  } else if (formState.password.length < 8) {
    errors.password = "Password must be at least 8 characters.";
  }

  if (formState.confirmPassword !== formState.password) {
    errors.confirmPassword = "Passwords must match.";
  }

  return errors;
}

export function RegisterForm() {
  const [formState, setFormState] = useState(initialFormState);
  const [errors, setErrors] = useState<RegisterFormErrors>({});
  const [feedback, setFeedback] = useState<{
    message: string;
    type: "error" | "success";
  } | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  function updateField(field: keyof RegisterFormState, value: string) {
    setFormState((currentState) => ({
      ...currentState,
      [field]: value,
    }));
    setErrors((currentErrors) => {
      const { [field]: _fieldError, ...remainingErrors } = currentErrors;

      return remainingErrors;
    });
    setFeedback(null);
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const nextErrors = validateForm(formState);
    setErrors(nextErrors);
    setFeedback(null);

    if (Object.keys(nextErrors).length > 0) {
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch("/api/auth/register", {
        body: JSON.stringify({
          confirmPassword: formState.confirmPassword,
          email: formState.email.trim(),
          name: formState.name.trim(),
          password: formState.password,
        }),
        headers: {
          "Content-Type": "application/json",
        },
        method: "POST",
      });
      const result = (await response.json()) as {
        error?: string;
        errors?: RegisterFormErrors;
        message?: string;
      };

      if (!response.ok) {
        setErrors(result.errors ?? {});
        setFeedback({
          message: result.error ?? "Registration failed. Try again.",
          type: "error",
        });
        return;
      }

      setFormState(initialFormState);
      setFeedback({
        message: result.message ?? "Registration submitted.",
        type: "success",
      });
    } catch {
      setFeedback({
        message: "Registration failed. Try again.",
        type: "error",
      });
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form
      className="w-full max-w-md rounded-lg border border-[var(--border-light)] bg-[var(--surface-card)] p-6 sm:p-8"
      onSubmit={handleSubmit}
    >
      <div>
        <p className="w-fit rounded-full border border-[var(--border-subtle)] bg-[var(--hero-pill-bg)] px-4 py-2 text-sm font-medium text-[var(--hero-pill-text)]">
          Register
        </p>
        <h2 className="mt-6 text-3xl font-semibold tracking-normal">
          Create account
        </h2>
        <p className="mt-3 text-sm leading-6 text-[var(--text-muted-5)]">
          Submit your details to request workspace access.
        </p>
      </div>

      <div className="mt-8 grid gap-5">
        <label className="grid gap-2">
          <span className="text-sm font-semibold">Full name</span>
          <input
            aria-describedby={errors.name ? "register-name-error" : undefined}
            aria-invalid={Boolean(errors.name)}
            className="rounded-md border border-[var(--border-light)] bg-[var(--surface-card)] px-3 py-3 text-base text-[var(--text-primary)] outline-none transition focus:border-[var(--tenant-accent-bg)]"
            name="name"
            onChange={(event) => updateField("name", event.target.value)}
            placeholder="Jane Release"
            type="text"
            value={formState.name}
          />
          {errors.name ? (
            <span
              className="text-sm font-medium text-[var(--text-primary)]"
              id="register-name-error"
            >
              {errors.name}
            </span>
          ) : null}
        </label>

        <label className="grid gap-2">
          <span className="text-sm font-semibold">Email</span>
          <input
            aria-describedby={errors.email ? "register-email-error" : undefined}
            aria-invalid={Boolean(errors.email)}
            className="rounded-md border border-[var(--border-light)] bg-[var(--surface-card)] px-3 py-3 text-base text-[var(--text-primary)] outline-none transition focus:border-[var(--tenant-accent-bg)]"
            name="email"
            onChange={(event) => updateField("email", event.target.value)}
            placeholder="jane@example.com"
            type="email"
            value={formState.email}
          />
          {errors.email ? (
            <span
              className="text-sm font-medium text-[var(--text-primary)]"
              id="register-email-error"
            >
              {errors.email}
            </span>
          ) : null}
        </label>

        <label className="grid gap-2">
          <span className="text-sm font-semibold">Password</span>
          <input
            aria-describedby={
              errors.password ? "register-password-error" : undefined
            }
            aria-invalid={Boolean(errors.password)}
            className="rounded-md border border-[var(--border-light)] bg-[var(--surface-card)] px-3 py-3 text-base text-[var(--text-primary)] outline-none transition focus:border-[var(--tenant-accent-bg)]"
            name="password"
            onChange={(event) => updateField("password", event.target.value)}
            placeholder="Create password"
            type="password"
            value={formState.password}
          />
          {errors.password ? (
            <span
              className="text-sm font-medium text-[var(--text-primary)]"
              id="register-password-error"
            >
              {errors.password}
            </span>
          ) : null}
        </label>

        <label className="grid gap-2">
          <span className="text-sm font-semibold">Confirm password</span>
          <input
            aria-describedby={
              errors.confirmPassword
                ? "register-confirm-password-error"
                : undefined
            }
            aria-invalid={Boolean(errors.confirmPassword)}
            className="rounded-md border border-[var(--border-light)] bg-[var(--surface-card)] px-3 py-3 text-base text-[var(--text-primary)] outline-none transition focus:border-[var(--tenant-accent-bg)]"
            name="confirmPassword"
            onChange={(event) =>
              updateField("confirmPassword", event.target.value)
            }
            placeholder="Confirm password"
            type="password"
            value={formState.confirmPassword}
          />
          {errors.confirmPassword ? (
            <span
              className="text-sm font-medium text-[var(--text-primary)]"
              id="register-confirm-password-error"
            >
              {errors.confirmPassword}
            </span>
          ) : null}
        </label>
      </div>

      {feedback ? (
        <p
          className={
            feedback.type === "success"
              ? "mt-5 text-sm font-medium text-[var(--text-muted-5)]"
              : "mt-5 text-sm font-medium text-[var(--text-primary)]"
          }
        >
          {feedback.message}
        </p>
      ) : null}

      <button
        aria-disabled={isSubmitting}
        className="mt-8 w-full rounded-full bg-[var(--tenant-accent-bg)] px-4 py-3 text-sm font-semibold text-[var(--tenant-accent-text)] transition disabled:cursor-not-allowed disabled:opacity-60"
        disabled={isSubmitting}
        type="submit"
      >
        {isSubmitting ? "Submitting..." : "Create account"}
      </button>

      <p className="mt-5 text-center text-sm text-[var(--text-muted-5)]">
        Already have access?{" "}
        <Link
          className="font-semibold text-[var(--text-primary)] underline underline-offset-4"
          href="/login"
        >
          Back to login
        </Link>
      </p>
    </form>
  );
}
