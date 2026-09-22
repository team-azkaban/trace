import type { UserRole } from "../components/navigation/Navbar";
import PageContainer from "../components/layout/PageContainer";
import OverviewDashboard from "../features/overview/OverviewDashboard";

interface OverviewPageProps {
  role: UserRole;
}

export default function OverviewPage({ role }: OverviewPageProps) {
  return (
    <PageContainer>
      <section className="mb-8">
        <div className="flex items-end justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-cyan-600">
              Command Center
            </p>
            <h1 className="mt-2 text-2xl font-bold tracking-tight text-slate-950">
              Overview
            </h1>
            <p className="mt-1 text-sm text-slate-500">
              Cybercrime activity and predictive intelligence at a glance.
            </p>
          </div>
          <div className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-medium text-slate-500 shadow-sm">
            {role === "lea" ? "Law Enforcement View" : "Bank / FI View"}
          </div>
        </div>
      </section>

      <OverviewDashboard role={role} />
    </PageContainer>
  );
}