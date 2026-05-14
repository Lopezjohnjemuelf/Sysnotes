import {
  DashboardHeader,
  DashboardLoadingSkeleton,
  FirstUseDashboardState,
  PublishingHealthPanel,
  QuickActionsGrid,
  RecentReleasesPreview,
  ReleaseSummaryCards,
  TenantOverviewCard,
} from "@/components/admin/dashboard";

export default function AdminDashboardPage() {
  return (
    <section className="mx-auto grid max-w-7xl gap-6">
      <DashboardHeader />

      <TenantOverviewCard />

      <ReleaseSummaryCards />

      <div className="grid gap-6 2xl:grid-cols-[minmax(0,1.35fr)_minmax(22rem,0.65fr)]">
        <RecentReleasesPreview />
        <PublishingHealthPanel />
      </div>

      <QuickActionsGrid />

      <FirstUseDashboardState />

      <DashboardLoadingSkeleton />
    </section>
  );
}
