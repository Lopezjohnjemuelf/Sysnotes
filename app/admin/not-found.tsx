import type { Metadata } from "next";
import { ErrorStateCard } from "@/components/admin/state";

export const metadata: Metadata = {
  title: "Admin page not found | Sysnotes by JFL",
};

export default function AdminNotFound() {
  return (
    <ErrorStateCard
      eyebrow="Admin 404"
      description="The page you requested does not exist in the Sysnotes admin portal. Check the URL or return to the admin dashboard."
      icon="ti-map-question"
      primaryAction={{
        href: "/admin/releases",
        icon: "ti-layout-dashboard",
        label: "Go to dashboard",
      }}
      secondaryAction={{
        href: "/admin/identity",
        icon: "ti-palette",
        label: "Configure tenant identity",
      }}
      title="This admin page does not exist"
    />
  );
}
