"use client";

import Link from "next/link";
import type { ReactNode } from "react";

type SettingsAction = {
  label: string;
  href?: string;
  onClick?: () => void;
  disabled?: boolean;
  variant?: "primary" | "secondary" | "destructive";
};

type SettingsSectionProps = {
  title: string;
  description?: string;
  children: ReactNode;
  action?: SettingsAction;
};

type SettingRowProps = {
  title: string;
  description: string;
  children?: ReactNode;
  action?: SettingsAction;
};

function getActionClass(variant: SettingsAction["variant"] = "secondary") {
  if (variant === "primary") {
    return "inline-flex items-center justify-center rounded-full bg-[var(--accent-bg)] px-4 py-2 text-sm font-semibold text-[var(--accent-text)] transition disabled:cursor-not-allowed disabled:opacity-60";
  }

  if (variant === "destructive") {
    return "inline-flex items-center justify-center rounded-full border border-[#8a241e] bg-[#fff8f7] px-4 py-2 text-sm font-semibold text-[#8a241e] transition hover:bg-[#fff0ee] disabled:cursor-not-allowed disabled:opacity-60";
  }

  return "inline-flex items-center justify-center rounded-full border border-[var(--border-light)] px-4 py-2 text-sm font-semibold text-[var(--text-muted-5)] transition hover:text-[var(--text-primary)] disabled:cursor-not-allowed disabled:opacity-60";
}

function SettingsActionButton({ action }: { action: SettingsAction }) {
  const className = getActionClass(action.variant);

  if (action.href && !action.disabled) {
    return (
      <Link className={className} href={action.href}>
        {action.label}
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
      {action.label}
    </button>
  );
}

export function SettingsSection({
  title,
  description,
  children,
  action,
}: SettingsSectionProps) {
  return (
    <section className="border border-[var(--border-light)] bg-[var(--surface-card)]">
      <div className="flex flex-col justify-between gap-4 border-b border-[var(--border-subtle)] px-5 py-4 sm:flex-row sm:items-start">
        <div>
          <h2 className="text-lg font-semibold tracking-normal">{title}</h2>
          {description ? (
            <p className="mt-1 text-sm leading-6 text-[var(--text-muted-5)]">
              {description}
            </p>
          ) : null}
        </div>
        {action ? (
          <div className="shrink-0">
            <SettingsActionButton action={action} />
          </div>
        ) : null}
      </div>
      <div className="divide-y divide-[var(--border-subtle)]">{children}</div>
    </section>
  );
}

export function SettingRow({
  title,
  description,
  children,
  action,
}: SettingRowProps) {
  return (
    <div className="grid gap-4 px-5 py-4 md:grid-cols-[minmax(0,1fr)_auto] md:items-center">
      <div className="min-w-0">
        <p className="text-sm font-semibold text-[var(--text-primary)]">
          {title}
        </p>
        <p className="mt-1 text-sm leading-6 text-[var(--text-muted-5)]">
          {description}
        </p>
        {children ? <div className="mt-3">{children}</div> : null}
      </div>
      {action ? (
        <div className="flex justify-start md:justify-end">
          <SettingsActionButton action={action} />
        </div>
      ) : null}
    </div>
  );
}

export function DestructiveSettingRow(props: SettingRowProps) {
  return (
    <div className="bg-[#fffdfc]">
      <SettingRow
        {...props}
        action={
          props.action
            ? {
                ...props.action,
                variant: "destructive",
              }
            : undefined
        }
      />
    </div>
  );
}
