import type { UserRole } from "../components/navigation/Navbar";
import PageContainer from "../components/layout/PageContainer";
import CaseSelector from "../components/ui/CaseSelector";
import { mockCases } from "../data/cases.mock";

interface PredictInvestigatePageProps {
  role: UserRole;
  selectedCaseId: string;
  onCaseChange: (caseId: string) => void;
}

export default function PredictInvestigatePage({
  role,
  selectedCaseId,
  onCaseChange,
}: PredictInvestigatePageProps) {
  const selectedCase =
    mockCases.find(
      (caseItem) => caseItem.complaint.id === selectedCaseId,
    ) ?? mockCases[0];

  const caseOptions = mockCases.map((caseItem) => ({
    id: caseItem.complaint.id,
    fraudType: caseItem.complaint.fraudType,
    amount: caseItem.complaint.amount,
    location: caseItem.complaint.location,
    risk: caseItem.complaint.riskScore,
    receivedTime: caseItem.complaint.reportedAt,
  }));

  return (
    <PageContainer>
      {/* Page Header */}
      <section className="mb-8">
        <div className="flex items-end justify-between gap-6">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-cyan-600">
              Intelligence Workspace
            </p>

            <h1 className="mt-2 text-2xl font-bold tracking-tight text-slate-950">
              Predict & Investigate
            </h1>

            <p className="mt-1 max-w-2xl text-sm text-slate-500">
              Predict likely cash-out locations, understand the evidence,
              and investigate the financial trail.
            </p>
          </div>

          <div className="hidden rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-medium text-slate-500 shadow-sm md:block">
            {role === "lea"
              ? "Law Enforcement View"
              : "Bank / FI View"}
          </div>
        </div>
      </section>

      {/* Active Case */}
      <section className="mb-7 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="mb-4">
          <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-slate-400">
            Active Investigation
          </p>

          <h2 className="mt-1 text-base font-semibold text-slate-900">
            Select an ongoing case
          </h2>

          <p className="mt-1 text-xs text-slate-400">
            All intelligence shown below is scoped to the selected
            complaint.
          </p>
        </div>

        <CaseSelector
          cases={caseOptions}
          selectedCaseId={selectedCaseId}
          onCaseChange={onCaseChange}
        />

        {/* Selected Case Summary */}
        <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-4">
          <CaseSummary
            label="Case ID"
            value={selectedCase.complaint.id}
          />

          <CaseSummary
            label="Fraud Type"
            value={selectedCase.complaint.fraudType}
          />

          <CaseSummary
            label="Amount"
            value={`₹${selectedCase.complaint.amount.toLocaleString(
              "en-IN",
            )}`}
          />

          <CaseSummary
            label="Risk Score"
            value={`${selectedCase.complaint.riskScore}/100`}
            critical={selectedCase.complaint.riskScore >= 80}
          />
        </div>
      </section>

      {/* Prediction + GIS */}
      <section className="mb-7">
        <SectionHeading
          title="Cash-out Prediction"
          description="Reserved for predicted withdrawal locations, confidence and time-window intelligence."
        />

        <div className="mt-3 grid grid-cols-1 gap-5 lg:grid-cols-[0.9fr_1.6fr]">
          <div className="min-h-[480px] rounded-2xl border border-dashed border-slate-300 bg-white/70 p-6">
            <SlotLabel label="PREDICTION FEATURE" />
          </div>

          <div className="min-h-[480px] rounded-2xl border border-dashed border-slate-300 bg-white/70 p-6">
            <SlotLabel label="GIS / RISK HEATMAP FEATURE" />
          </div>
        </div>
      </section>

      {/* Money Flow */}
      <section className="mb-7">
        <SectionHeading
          title="Financial Money Flow"
          description="Reserved for the complaint-to-account-to-mule-to-ATM network visualization."
        />

        <div className="mt-3 min-h-[430px] rounded-2xl border border-dashed border-slate-300 bg-white/70 p-6">
          <SlotLabel label="MONEY-FLOW GRAPH FEATURE" />
        </div>
      </section>

      {/* Supporting Intelligence */}
      <section>
        <SectionHeading
          title="Supporting Intelligence"
          description="Evidence behind the prediction and physical intelligence around the predicted location."
        />

        <div className="mt-3 grid grid-cols-1 gap-5 lg:grid-cols-2">
          <div className="min-h-[340px] rounded-2xl border border-dashed border-slate-300 bg-white/70 p-6">
            <SlotLabel label="EXPLAINABILITY FEATURE" />
          </div>

          <div className="min-h-[340px] rounded-2xl border border-dashed border-slate-300 bg-white/70 p-6">
            <SlotLabel label="CCTV / PHYSICAL INTELLIGENCE FEATURE" />
          </div>
        </div>
      </section>
    </PageContainer>
  );
}

/* -------------------------------------------------------------------------- */
/* Supporting UI                                                              */
/* -------------------------------------------------------------------------- */

interface CaseSummaryProps {
  label: string;
  value: string;
  critical?: boolean;
}

function CaseSummary({
  label,
  value,
  critical = false,
}: CaseSummaryProps) {
  return (
    <div className="rounded-xl bg-slate-50 px-4 py-3">
      <p className="text-[10px] font-medium uppercase tracking-wider text-slate-400">
        {label}
      </p>

      <p
        className={`mt-1 text-sm font-semibold ${
          critical ? "text-red-600" : "text-slate-800"
        }`}
      >
        {value}
      </p>
    </div>
  );
}

interface SectionHeadingProps {
  title: string;
  description: string;
}

function SectionHeading({
  title,
  description,
}: SectionHeadingProps) {
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

function SlotLabel({ label }: { label: string }) {
  return (
    <div className="flex h-full min-h-[100px] items-center justify-center">
      <span className="rounded-full bg-slate-100 px-4 py-2 text-[10px] font-semibold tracking-[0.12em] text-slate-400">
        {label}
      </span>
    </div>
  );
}