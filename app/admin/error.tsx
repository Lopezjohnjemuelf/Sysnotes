"use client";

import { useEffect } from "react";
import { ErrorStateCard } from "@/components/admin/state";

export default function AdminError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <ErrorStateCard
      eyebrow="Unexpected error"
      description="Something went wrong while rendering the admin portal. Retry the view, refresh the page, or return to releases."
      icon="settings"
      primaryAction={{ icon: "settings", label: "Retry", onClick: reset }}
      secondaryAction={{
        href: "/admin/releases",
        icon: "release",
        label: "Back to releases",
      }}
      title="The admin view could not be loaded"
    />
  );
}
