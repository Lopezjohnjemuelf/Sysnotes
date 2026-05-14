"use client";

import { useState, type FormEvent } from "react";
import {
  DestructiveSettingRow,
  SettingRow,
  SettingsSection,
  useTenantIdentity,
} from "@/components/admin";

type PasswordFormState = {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
};

const initialPasswordFormState: PasswordFormState = {
  currentPassword: "",
  newPassword: "",
  confirmPassword: "",
};

export default function AdminSettingsPage() {
  const identity = useTenantIdentity();
  const [passwordForm, setPasswordForm] = useState(initialPasswordFormState);
  const [isPasswordSubmitting, setIsPasswordSubmitting] = useState(false);
  const [passwordMessage, setPasswordMessage] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [resetConfirmation, setResetConfirmation] = useState("");
  const [isResetSubmitting, setIsResetSubmitting] = useState(false);
  const [resetError, setResetError] = useState("");
  const canReset = resetConfirmation === "RESET";

  function updatePasswordField(
    field: keyof PasswordFormState,
    value: string,
  ) {
    setPasswordForm((currentForm) => ({
      ...currentForm,
      [field]: value,
    }));
    setPasswordError("");
    setPasswordMessage("");
  }

  async function submitPasswordChange(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setPasswordError("Passwords do not match.");
      return;
    }

    setIsPasswordSubmitting(true);
    setPasswordError("");
    setPasswordMessage("");

    try {
      const response = await fetch("/api/auth/change-password", {
        body: JSON.stringify(passwordForm),
        headers: {
          "Content-Type": "application/json",
        },
        method: "POST",
      });

      if (!response.ok) {
        throw new Error("Password update failed.");
      }

      setPasswordForm(initialPasswordFormState);
      setPasswordMessage("Password updated.");
      window.setTimeout(() => setPasswordMessage(""), 3000);
    } catch (err) {
      console.warn(err);
      setPasswordError("Password could not be updated.");
    } finally {
      setIsPasswordSubmitting(false);
    }
  }

  async function submitResetAllData() {
    if (!canReset) {
      return;
    }

    setIsResetSubmitting(true);
    setResetError("");

    try {
      const response = await fetch(
        `/api/tenant/${encodeURIComponent(identity.slug)}/all`,
        {
          method: "DELETE",
        },
      );

      if (response.status === 501) {
        setResetError("Reset all data is not implemented yet.");
        return;
      }

      if (!response.ok) {
        throw new Error("Reset failed.");
      }

      setResetConfirmation("");
    } catch (err) {
      console.warn(err);
      setResetError("Data could not be reset.");
    } finally {
      setIsResetSubmitting(false);
    }
  }

  return (
    <section className="mx-auto max-w-5xl">
      <header className="mx-auto mb-8 max-w-2xl border-b border-[var(--border-light)] pb-6 text-center">
        <p className="text-sm font-medium uppercase tracking-[0.18em] text-[var(--text-muted-1)]">
          Admin Portal
        </p>
        <h1 className="mt-3 text-4xl font-semibold tracking-normal">
          Settings
        </h1>
        <p className="mt-4 text-base leading-7 text-[var(--text-muted-4)]">
          Manage security settings and high-impact workspace actions.
        </p>
      </header>

      <div className="mx-auto grid max-w-4xl gap-6">
        <SettingsSection
          description="Update the password used to access the admin portal."
          title="Security"
        >
          <SettingRow
            description="Use a strong password before publishing tenant data."
            title="Admin password"
          >
            <form className="grid max-w-xl gap-4" onSubmit={submitPasswordChange}>
              <label className="grid gap-2">
                <span className="text-sm font-semibold text-[var(--text-primary)]">
                  Current password
                </span>
                <input
                  className="rounded-md border border-[var(--admin-input-border)] bg-[var(--surface-card)] px-3 py-2 text-sm text-[var(--text-primary)] outline-none transition focus:border-[var(--admin-input-focus)] disabled:cursor-not-allowed disabled:opacity-60"
                  disabled={isPasswordSubmitting}
                  onChange={(event) =>
                    updatePasswordField("currentPassword", event.target.value)
                  }
                  type="password"
                  value={passwordForm.currentPassword}
                />
              </label>
              <label className="grid gap-2">
                <span className="text-sm font-semibold text-[var(--text-primary)]">
                  New password
                </span>
                <input
                  className="rounded-md border border-[var(--admin-input-border)] bg-[var(--surface-card)] px-3 py-2 text-sm text-[var(--text-primary)] outline-none transition focus:border-[var(--admin-input-focus)] disabled:cursor-not-allowed disabled:opacity-60"
                  disabled={isPasswordSubmitting}
                  onChange={(event) =>
                    updatePasswordField("newPassword", event.target.value)
                  }
                  type="password"
                  value={passwordForm.newPassword}
                />
              </label>
              <label className="grid gap-2">
                <span className="text-sm font-semibold text-[var(--text-primary)]">
                  Confirm password
                </span>
                <input
                  className="rounded-md border border-[var(--admin-input-border)] bg-[var(--surface-card)] px-3 py-2 text-sm text-[var(--text-primary)] outline-none transition focus:border-[var(--admin-input-focus)] disabled:cursor-not-allowed disabled:opacity-60"
                  disabled={isPasswordSubmitting}
                  onChange={(event) =>
                    updatePasswordField("confirmPassword", event.target.value)
                  }
                  type="password"
                  value={passwordForm.confirmPassword}
                />
              </label>

              {passwordError ? (
                <p className="text-sm font-medium text-[#8a241e]">
                  {passwordError}
                </p>
              ) : null}
              {passwordMessage ? (
                <p className="text-sm font-medium text-[var(--text-muted-5)]">
                  {passwordMessage}
                </p>
              ) : null}

              <div>
                <button
                  className="inline-flex rounded-full bg-[var(--accent-bg)] px-4 py-2 text-sm font-semibold text-[var(--accent-text)] transition disabled:cursor-not-allowed disabled:opacity-60"
                  disabled={isPasswordSubmitting}
                  type="submit"
                >
                  {isPasswordSubmitting ? "Saving..." : "Save password"}
                </button>
              </div>
            </form>
          </SettingRow>
        </SettingsSection>

        <SettingsSection
          description="Actions here can affect every tenant release, subscriber, and identity record."
          title="Danger zone"
        >
          <DestructiveSettingRow
            action={{
              disabled: !canReset || isResetSubmitting,
              label: isResetSubmitting ? "Resetting..." : "Reset all data",
              onClick: submitResetAllData,
            }}
            description='Type "RESET" to enable this action.'
            title="Reset all data"
          >
            <div className="grid max-w-sm gap-3">
              <input
                className="rounded-md border border-[var(--admin-input-border)] bg-[var(--surface-card)] px-3 py-2 text-sm text-[var(--text-primary)] outline-none transition focus:border-[var(--admin-input-focus)] disabled:cursor-not-allowed disabled:opacity-60"
                disabled={isResetSubmitting}
                onChange={(event) => {
                  setResetConfirmation(event.target.value);
                  setResetError("");
                }}
                placeholder="RESET"
                value={resetConfirmation}
              />
              {resetError ? (
                <p className="text-sm font-medium text-[#8a241e]">
                  {resetError}
                </p>
              ) : null}
            </div>
          </DestructiveSettingRow>
        </SettingsSection>
      </div>
    </section>
  );
}
