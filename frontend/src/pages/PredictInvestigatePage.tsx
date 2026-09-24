import type { UserRole } from "../components/navigation/Navbar";
import PageContainer from "../components/layout/PageContainer";
import CaseSelector from "../components/ui/CaseSelector";
import { mockCases } from "../data/cases.mock";
import MoneyFlowGraph from "../features/money-flow/MoneyFlowGraph";

import VaniaPredictiveLocation from "../features/predictive_location/VaniaPredictiveLocation";
import {
  AlertTriangle,
  BadgeDollarSign,
  FileText,
  ShieldAlert,
} from "lucide-react";

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

          
          </div>

          <div className="hidden rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-medium text-slate-500 shadow-sm md:block">
            {role === "lea"
              ? "Law Enforcement View"
              : "Bank / FI View"}
          </div>
        </div>
      </section>

      {/* Active Case */}
<section className="mb-7 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
  {/* Section header */}
  <div className="border-b border-slate-100 bg-gradient-to-r from-slate-50/80 to-white px-5 py-4">
    <div className="flex items-start justify-between gap-4">
      <div>
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-cyan-50 text-cyan-600">
            <FileText size={16} />
          </div>

          <div>
            <h2 className="text-[15px] font-bold text-slate-900">
              Select an ongoing case
            </h2>

            
          </div>
        </div>
      </div>

      <div className="hidden rounded-lg border border-emerald-100 bg-emerald-50 px-2.5 py-1.5 text-[10px] font-semibold text-emerald-700 sm:block">
        LIVE CASE
      </div>
    </div>
  </div>

  {/* Case selector */}
  <div className="px-5 pt-5">
    <CaseSelector
      cases={caseOptions}
      selectedCaseId={selectedCaseId}
      onCaseChange={onCaseChange}
    />
  </div>

  {/* Selected Case Summary */}
  <div className="grid grid-cols-2 gap-3 p-5 sm:grid-cols-4">
    <CaseSummary
      icon={<FileText size={16} />}
      label="Case ID"
      value={selectedCase.complaint.id}
    />

    <CaseSummary
      icon={<ShieldAlert size={16} />}
      label="Fraud Type"
      value={selectedCase.complaint.fraudType}
    />

    <CaseSummary
      icon={<BadgeDollarSign size={16} />}
      label="Amount"
      value={`₹${selectedCase.complaint.amount.toLocaleString(
        "en-IN",
      )}`}
    />

    <CaseSummary
      icon={<AlertTriangle size={16} />}
      label="Risk Score"
      value={`${selectedCase.complaint.riskScore}/100`}
      critical={selectedCase.complaint.riskScore >= 80}
    />
  </div>
</section>

      {/* Prediction + GIS */}
      <section className="mb-7">
        

        <div className="mt-3 grid grid-cols-1">
          <div className="min-h-[400px] rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
            <VaniaPredictiveLocation />
          </div>
        </div>
      </section>

      {/* Money Flow */}
      <section className="mb-7">
        <MoneyFlowGraph
  accounts={selectedCase.accounts}
  transactions={selectedCase.transactions}
  predictedLocations={selectedCase.predictedLocations}
/>
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
  icon: React.ReactNode;
  critical?: boolean;
}

function CaseSummary({
  label,
  value,
  icon,
  critical = false,
}: CaseSummaryProps) {
  return (
    <div
      className={`group relative overflow-hidden rounded-xl border px-4 py-3.5 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-sm ${
        critical
          ? "border-red-100 bg-red-50/40 hover:border-red-200"
          : "border-slate-100 bg-slate-50/60 hover:border-slate-200 hover:bg-white"
      }`}
    >
      <div className="flex items-center gap-3">
        {/* Icon */}
        <div
          className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${
            critical
              ? "bg-red-100 text-red-600"
              : "bg-white text-slate-500 shadow-sm"
          }`}
        >
          {icon}
        </div>

        {/* Text */}
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <p className="truncate text-[9px] font-semibold uppercase tracking-[0.14em] text-slate-400">
              {label}
            </p>

            {critical && (
              <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-red-500" />
            )}
          </div>

          <p
            className={`mt-1 truncate text-[14px] font-bold ${
              critical ? "text-red-600" : "text-slate-800"
            }`}
            title={value}
          >
            {value}
          </p>
        </div>
      </div>
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

