import type { ReactNode } from "react";
import { redirect } from "next/navigation";
import {
  AdminFooter,
  AdminPreviewPane,
  AdminPreviewProvider,
  AdminSidebar,
} from "@/components/admin";
import { auth } from "@/lib/auth";

export default async function AdminLayout({ children }: { children: ReactNode }) {
  const session = await auth();

  if (!session) {
    redirect("/login");
  }

  return (
    <AdminPreviewProvider>
      <div className="flex h-screen bg-[var(--surface-page)] text-[var(--text-primary)]">
        <AdminSidebar />
        <main className="flex-1 overflow-y-auto p-8">
          <div className="flex min-h-full flex-col">
            <div className="flex-1">{children}</div>
            <AdminFooter />
          </div>
        </main>
        <AdminPreviewPane />
      </div>
    </AdminPreviewProvider>
  );
}
