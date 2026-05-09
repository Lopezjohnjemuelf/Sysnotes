"use client";

import type { ReactNode } from "react";
import {
  InlineActionLink,
  type AdminStateAction,
} from "./retry-action-row";

type InlineErrorBannerProps = {
  title: string;
  description: string;
  primaryAction: AdminStateAction;
  secondaryAction?: AdminStateAction;
  icon?: string;
  children?: ReactNode;
};

export function InlineErrorBanner({
  title,
  description,
  primaryAction,
  secondaryAction,
  icon = "ti-alert-triangle",
  children,
}: InlineErrorBannerProps) {
  return (
    <aside className="rounded-lg border border-[var(--border-light)] bg-[var(--surface-card)] p-4">
      <div className="flex items-start gap-3">
        <div className="mt-0.5 grid h-8 w-8 shrink-0 place-items-center rounded-full bg-[var(--tag-bg)] text-[var(--text-muted-5)]">
          <i aria-hidden="true" className={`ti ${icon} text-base`} />
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-sm font-semibold text-[var(--text-primary)]">
            {title}
          </p>
          <p className="mt-1 text-sm leading-6 text-[var(--text-muted-5)]">
            {description}
          </p>
          {children}
          <div className="mt-3 flex flex-wrap items-center gap-3">
            <InlineActionLink action={primaryAction} />
            {secondaryAction ? (
              <InlineActionLink action={secondaryAction} />
            ) : null}
          </div>
        </div>
      </div>
    </aside>
  );
}
