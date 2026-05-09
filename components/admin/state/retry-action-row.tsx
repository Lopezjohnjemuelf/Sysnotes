"use client";

import Link from "next/link";
import type { ReactNode } from "react";

export type AdminStateAction = {
  label: string;
  href?: string;
  onClick?: () => void;
  icon?: string;
  disabled?: boolean;
  variant?: "primary" | "secondary" | "destructive";
};

type RetryActionRowProps = {
  primaryAction: AdminStateAction;
  secondaryAction?: AdminStateAction;
};

function ActionContent({ action }: { action: AdminStateAction }) {
  return (
    <>
      {action.icon ? (
        <i aria-hidden="true" className={`ti ${action.icon} text-base`} />
      ) : null}
      <span>{action.label}</span>
    </>
  );
}

function AdminStateButton({
  action,
  variant,
}: {
  action: AdminStateAction;
  variant: "primary" | "secondary";
}) {
  const actionVariant = action.variant ?? variant;
  const className =
    actionVariant === "destructive"
      ? "inline-flex items-center justify-center gap-2 rounded-full border border-[#8a241e] bg-[#fff8f7] px-5 py-2.5 text-sm font-semibold text-[#8a241e] transition hover:bg-[#fff0ee] disabled:cursor-not-allowed disabled:opacity-60"
      : actionVariant === "primary"
        ? "inline-flex items-center justify-center gap-2 rounded-full bg-[var(--accent-bg)] px-5 py-2.5 text-sm font-semibold text-[var(--accent-text)] transition disabled:cursor-not-allowed disabled:opacity-60"
        : "inline-flex items-center justify-center gap-2 rounded-full border border-[var(--border-light)] px-5 py-2.5 text-sm font-semibold text-[var(--text-muted-5)] transition hover:text-[var(--text-primary)] disabled:cursor-not-allowed disabled:opacity-60";

  if (action.href && !action.disabled) {
    return (
      <Link className={className} href={action.href}>
        <ActionContent action={action} />
      </Link>
    );
  }

  return (
    <button
      className={className}
      disabled={action.disabled}
      onClick={action.onClick}
      type="button"
    >
      <ActionContent action={action} />
    </button>
  );
}

export function RetryActionRow({
  primaryAction,
  secondaryAction,
}: RetryActionRowProps) {
  return (
    <div className="flex flex-wrap items-center gap-3">
      <AdminStateButton action={primaryAction} variant="primary" />
      {secondaryAction ? (
        <AdminStateButton action={secondaryAction} variant="secondary" />
      ) : null}
    </div>
  );
}

export function InlineActionLink({
  action,
}: {
  action: AdminStateAction;
}): ReactNode {
  if (action.href && !action.disabled) {
    return (
      <Link
        className="text-sm font-semibold text-[var(--text-primary)] underline underline-offset-4"
        href={action.href}
      >
        {action.label}
      </Link>
    );
  }

  return (
    <button
      className="text-sm font-semibold text-[var(--text-primary)] underline underline-offset-4 disabled:cursor-not-allowed disabled:opacity-60"
      disabled={action.disabled}
      onClick={action.onClick}
      type="button"
    >
      {action.label}
    </button>
  );
}
