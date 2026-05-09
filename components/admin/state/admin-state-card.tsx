"use client";

import type { ReactNode } from "react";
import {
  RetryActionRow,
  type AdminStateAction,
} from "./retry-action-row";

export type AdminStateTone = "empty" | "error";

export type AdminStateCardProps = {
  title: string;
  description: string;
  primaryAction: AdminStateAction;
  secondaryAction?: AdminStateAction;
  eyebrow?: string;
  icon?: string;
  tone?: AdminStateTone;
  children?: ReactNode;
};

const toneDefaults: Record<
  AdminStateTone,
  {
    eyebrow: string;
    icon: string;
    iconClassName: string;
    sectionClassName: string;
  }
> = {
  empty: {
    eyebrow: "Empty state",
    icon: "ti-inbox",
    iconClassName: "bg-[var(--tag-bg)] text-[var(--text-muted-5)]",
    sectionClassName:
      "rounded-lg border border-dashed border-[var(--border-light)] bg-[var(--surface-card)] p-6",
  },
  error: {
    eyebrow: "Needs attention",
    icon: "ti-alert-circle",
    iconClassName:
      "border border-[var(--border-subtle)] bg-[var(--surface-page)] text-[var(--text-primary)]",
    sectionClassName:
      "rounded-lg border border-[var(--border-light)] bg-[var(--surface-card)] p-6",
  },
};

export function AdminStateCard({
  title,
  description,
  primaryAction,
  secondaryAction,
  eyebrow,
  icon,
  tone = "error",
  children,
}: AdminStateCardProps) {
  const defaults = toneDefaults[tone];

  return (
    <section className={defaults.sectionClassName}>
      <div className="flex max-w-2xl flex-col items-start gap-5">
        <div
          className={`grid h-10 w-10 place-items-center rounded-full ${defaults.iconClassName}`}
        >
          <i
            aria-hidden="true"
            className={`ti ${icon ?? defaults.icon} text-xl`}
          />
        </div>
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--text-muted-1)]">
            {eyebrow ?? defaults.eyebrow}
          </p>
          <h2 className="mt-3 text-2xl font-semibold tracking-normal">
            {title}
          </h2>
          <p className="mt-3 text-sm leading-6 text-[var(--text-muted-5)]">
            {description}
          </p>
        </div>
        {children}
        <RetryActionRow
          primaryAction={primaryAction}
          secondaryAction={secondaryAction}
        />
      </div>
    </section>
  );
}
