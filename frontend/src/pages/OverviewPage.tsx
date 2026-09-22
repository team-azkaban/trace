import type { UserRole } from "../components/navigation/Navbar";
import PageContainer from "../components/layout/PageContainer";

interface OverviewPageProps {
  role: UserRole;
}

export default function OverviewPage({
  role,
}: OverviewPageProps) {
  return (
    <PageContainer>
      {/* Page Header */}
      <section className="mb-8">
        <div className="flex items-end justify-between">
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

      {/* KPI / Stats Feature Area */}
      <section className="mb-6">
        <FeatureSectionLabel
          title="Command Center Metrics"
          description="Reserved for complaint, alert, hotspot and model-performance metrics."
        />

        <div className="mt-3 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <EmptyCard />
          <EmptyCard />
          <EmptyCard />
          <EmptyCard />
        </div>
      </section>

      {/* Complaint Dashboard */}
      <section className="mb-6">
        <FeatureSectionLabel
          title="Cybercrime Complaint Dashboard"
          description="Reserved for the complaint table, filters and risk information."
        />

        <div className="mt-3 min-h-[360px] rounded-2xl border border-dashed border-slate-300 bg-white/70" />
      </section>

      {/* Analytics */}
      <section>
        <FeatureSectionLabel
          title="Fraud Pattern & Hotspot Analytics"
          description="Reserved for fraud-type, timing and historical pattern visualizations."
        />

        <div className="mt-3 grid grid-cols-1 gap-4 lg:grid-cols-2">
          <div className="min-h-[300px] rounded-2xl border border-dashed border-slate-300 bg-white/70" />
          <div className="min-h-[300px] rounded-2xl border border-dashed border-slate-300 bg-white/70" />
        </div>
      </section>
    </PageContainer>
  );
}

/* -------------------------------------------------------------------------- */
/* Temporary layout helpers                                                   */
/* -------------------------------------------------------------------------- */

interface FeatureSectionLabelProps {
  title: string;
  description: string;
}

function FeatureSectionLabel({
  title,
  description,
}: FeatureSectionLabelProps) {
  return (
    <div>
      <h2 className="text-sm font-semibold text-slate-800">
        {title}
      </h2>

      <p className="mt-1 text-xs text-slate-400">
        {description}
      </p>
    </div>
  );
}

function EmptyCard() {
  return (
    <div className="h-28 rounded-2xl border border-dashed border-slate-300 bg-white/70" />
  );
}