import type { UserRole } from "../components/navigation/Navbar";
import PageContainer from "../components/layout/PageContainer";
import CaseSelector from "../components/ui/CaseSelector";
import { mockCases } from "../data/cases.mock";

import { CoverageSimulator } from "../features/coverage-simulator/CoverageSimulator";
import { OutcomeTracker } from "../features/outcome-learning/OutcomeTracker";
import { AccuracyTrend } from "../features/outcome-learning/AccuracyTrend";

interface ResponsePageProps {
  role: UserRole;
  selectedCaseId: string;
  onCaseChange: (caseId: string) => void;
}

export default function ResponsePage({
  role,
  selectedCaseId,
  onCaseChange,
}: ResponsePageProps) {
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

  const activeAlert = selectedCase.alerts[0];

  return (
    <PageContainer>
      {/* Page Header */}
      <section className="mb-8">
        <div className="flex items-end justify-between gap-6">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-cyan-600">
              Operational Response
            </p>

            <h1 className="mt-2 text-2xl font-bold tracking-tight text-slate-950">
              Response
            </h1>

            <p className="mt-1 max-w-2xl text-sm text-slate-500">
              Convert predictive intelligence into coordinated,
              actionable intervention.
            </p>
          </div>

          <div className="hidden rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-medium text-slate-500 shadow-sm md:block">
            {role === "lea"
              ? "Law Enforcement View"
              : "Bank / FI View"}
          </div>
        </div>
      </section>

      {/* Active Alert */}
      <section className="mb-6 rounded-2xl border border-red-100 bg-white p-5 shadow-sm">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex items-start gap-4">
            <div className="mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-red-50 text-red-500">
              <span className="h-2.5 w-2.5 rounded-full bg-red-500 shadow-[0_0_12px_rgba(239,68,68,0.5)]" />
            </div>

            <div>
              <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-red-500">
                Active {activeAlert.severity} Alert
              </p>

              <h2 className="mt-1 text-sm font-semibold text-slate-900">
                {activeAlert.title}
              </h2>

              <p className="mt-1 text-xs text-slate-500">
                Case {selectedCase.complaint.id} ·{" "}
                {activeAlert.confidence}% confidence ·{" "}
                {activeAlert.location} · Expected window{" "}
                {activeAlert.predictedWindow}
              </p>
            </div>
          </div>

          <button className="rounded-xl bg-slate-900 px-4 py-2.5 text-xs font-semibold text-white transition hover:bg-slate-800">
            View Investigation
          </button>
        </div>
      </section>

      {/* Case Context */}
      <section className="mb-7 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="mb-4">
          <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-slate-400">
            Active Response Case
          </p>

          <h2 className="mt-1 text-base font-semibold text-slate-900">
            {selectedCase.complaint.id}
          </h2>

          <p className="mt-1 text-xs text-slate-400">
            Response actions are scoped to the selected investigation.
          </p>
        </div>

        <CaseSelector
          cases={caseOptions}
          selectedCaseId={selectedCaseId}
          onCaseChange={onCaseChange}
        />
      </section>

      {/* Stakeholder Workflow */}
      <section className="mb-7">
        <SectionHeading
          title={
            role === "lea"
              ? "Law Enforcement Workflow"
              : "Bank / FI Workflow"
          }
          description={
            role === "lea"
              ? "Reserved for case assignment, acknowledgement and investigation workflow."
              : "Reserved for monitoring, flagging and acknowledgement of predicted withdrawal risks."
          }
        />

        <div className="mt-3 grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
          {role === "lea" ? (
            <>
              <WorkflowColumn title="Assign" />
              <WorkflowColumn title="Acknowledge" />
              <WorkflowColumn title="Investigate" />
              <WorkflowColumn title="Update" />
            </>
          ) : (
            <>
              <WorkflowColumn title="Monitor" />
              <WorkflowColumn title="Flag" />
              <WorkflowColumn title="Acknowledge" />
            </>
          )}
        </div>
      </section>

      {/* Coverage Simulator */}
      <section className="mb-7">
        <div className="mt-3">
          <CoverageSimulator
            predictedLocations={selectedCase.predictedLocations}
          />
        </div>
      </section>

      {/* Outcome & Learning */}
      <section>

        {/* Tracker and graph are intentionally stacked */}
        <div className="mt-3 space-y-5">
          <OutcomeTracker
            outcome={selectedCase.outcome}
            caseId={selectedCase.complaint.id}
            predictedLocations={selectedCase.predictedLocations}
          />

          <AccuracyTrend />
        </div>
      </section>
    </PageContainer>
  );
}

/* Supporting UI */

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

function WorkflowColumn({
  title,
}: {
  title: string;
}) {
  return (
    <div className="min-h-[260px] rounded-2xl border border-dashed border-slate-300 bg-white/70 p-4">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-xs font-semibold text-slate-700">
          {title}
        </h3>

        <span className="rounded-full bg-slate-100 px-2 py-1 text-[10px] text-slate-400">
          0
        </span>
      </div>

      <div className="flex min-h-[180px] items-center justify-center rounded-xl border border-dashed border-slate-200 bg-slate-50/50">
        <span className="text-[10px] font-medium uppercase tracking-wider text-slate-300">
          Workflow Area
        </span>
      </div>
    </div>
  );
}

function SlotLabel({
  label,
}: {
  label: string;
}) {
  return (
    <div className="flex h-full min-h-[100px] items-center justify-center">
      <span className="rounded-full bg-slate-100 px-4 py-2 text-[10px] font-semibold tracking-[0.12em] text-slate-400">
        {label}
      </span>
    </div>
  );
}