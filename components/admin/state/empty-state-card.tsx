"use client";

import {
  AdminStateCard,
  type AdminStateCardProps,
} from "./admin-state-card";

type EmptyStateCardProps = Omit<AdminStateCardProps, "tone">;

export function EmptyStateCard(props: EmptyStateCardProps) {
  return <AdminStateCard {...props} tone="empty" />;
}
