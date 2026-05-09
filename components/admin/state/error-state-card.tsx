"use client";

import {
  AdminStateCard,
  type AdminStateCardProps,
} from "./admin-state-card";

type ErrorStateCardProps = Omit<AdminStateCardProps, "tone">;

export function ErrorStateCard(props: ErrorStateCardProps) {
  return <AdminStateCard {...props} tone="error" />;
}
