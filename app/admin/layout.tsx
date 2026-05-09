import type { ReactNode } from "react";
import {
  AdminAccessGate,
  AdminFooter,
  AdminPreviewPane,
  AdminPreviewProvider,
  AdminSidebar,
} from "@/components/admin";

export default function AdminLayout({ children }: { children: ReactNode }) {
  return (
    <AdminPreviewProvider>
      <AdminAccessGate>
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
      </AdminAccessGate>
    </AdminPreviewProvider>
  );
}
