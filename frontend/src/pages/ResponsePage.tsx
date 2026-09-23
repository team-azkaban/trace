import { useState, type FormEvent, type ReactNode } from "react";
import { Activity, ArrowUpRight, ClipboardCheck, Plus, ShieldAlert, X } from "lucide-react";
import { useNavigate } from "react-router-dom";
import type { UserRole } from "../components/navigation/Navbar";
import PageContainer from "../components/layout/PageContainer";
import CaseSelector from "../components/ui/CaseSelector";
import { mockCases } from "../data/cases.mock";

import { CoverageSimulator } from "../features/coverage-simulator/CoverageSimulator";
import { OutcomeTracker } from "../features/outcome-learning/OutcomeTracker";
import { AccuracyTrend } from "../features/outcome-learning/AccuracyTrend";
import {
  mockBankAlerts,
  mockLeaCases,
  type BankAlert,
  type BankStage,
  type LeaCase,
  type LeaStage,
  type RiskLevel,
} from "../data/response.mock";

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
  const navigate = useNavigate();
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
      <section className="mb-6 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="relative px-5 py-6 sm:px-7">
          <div className="pointer-events-none absolute -right-16 -top-20 h-48 w-48 rounded-full bg-cyan-100/60 blur-3xl" />
          <div className="relative flex items-end justify-between gap-6">
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

          <br></br>
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


          <div className="relative mt-6 grid grid-cols-2 gap-3 border-t border-slate-100 pt-5 sm:grid-cols-4">
            <ResponseMetric icon={<ShieldAlert size={14} />} label="Risk score" value={`${selectedCase.complaint.riskScore}/100`} accent="text-red-600" />
            <ResponseMetric icon={<Activity size={14} />} label="Alert confidence" value={`${activeAlert.confidence}%`} accent="text-cyan-600" />
            <ResponseMetric icon={<ClipboardCheck size={14} />} label="Workflow stage" value={role === "lea" ? "Assign" : "Monitor"} accent="text-violet-600" />
            <ResponseMetric icon={<ArrowUpRight size={14} />} label="Predicted window" value={activeAlert.predictedWindow} accent="text-amber-600" />
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

          <button
            type="button"
            onClick={() => navigate("/app/predict")}
            className="group inline-flex items-center justify-center gap-2 rounded-xl bg-slate-950 px-4 py-2.5 text-xs font-semibold text-white shadow-sm transition hover:-translate-y-0.5 hover:bg-slate-800 hover:shadow-md focus:outline-none focus:ring-2 focus:ring-cyan-300 focus:ring-offset-2"
          >
            View investigation
            <ArrowUpRight size={14} className="transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
          </button>
        </div>
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
              ? "Move high-risk cases from assignment through acknowledgement to investigation closure."
              : "Move predicted withdrawal alerts from monitoring to bank acknowledgement."
          }
        />

        <div className="mt-3">{role === "lea" ? <LeaBoard /> : <BankBoard />}</div>
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

function ResponseMetric({
  icon,
  label,
  value,
  accent,
}: {
  icon: ReactNode;
  label: string;
  value: string;
  accent: string;
}) {
  return (
    <div className="rounded-xl border border-slate-100 bg-slate-50/70 px-3 py-2.5">
      <div className={`flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-wide ${accent}`}>
        {icon}
        {label}
      </div>
      <p className="mt-1 text-sm font-bold tracking-tight text-slate-800">{value}</p>
    </div>
  );
}

const leaStages: LeaStage[] = ["Assign", "Acknowledge", "Investigate", "Update"];
const bankStages: BankStage[] = ["Monitor", "Flag", "Acknowledge"];
const stageStyles: Record<string, { strip: string; dot: string }> = {
  Assign: { strip: "bg-blue-500", dot: "bg-blue-500" },
  Monitor: { strip: "bg-cyan-500", dot: "bg-cyan-500" },
  Acknowledge: { strip: "bg-violet-500", dot: "bg-violet-500" },
  Investigate: { strip: "bg-amber-500", dot: "bg-amber-500" },
  Flag: { strip: "bg-orange-500", dot: "bg-orange-500" },
  Update: { strip: "bg-emerald-500", dot: "bg-emerald-500" },
};
const riskStyles: Record<RiskLevel, string> = {
  Critical: "border-red-200 bg-red-50 text-red-700",
  High: "border-orange-200 bg-orange-50 text-orange-700",
  Medium: "border-amber-200 bg-amber-50 text-amber-700",
};

function LeaBoard() {
  const [items, setItems] = useState(mockLeaCases);
  const [draggedId, setDraggedId] = useState<string | null>(null);
  const [isAdding, setIsAdding] = useState(false);

  const addCase = (newCase: LeaCase) => {
    setItems((current) => [newCase, ...current]);
    setIsAdding(false);
  };

  return (
    <>
      <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
        <p className="text-[11px] text-slate-400">
          Drag a case forward as the response progresses.
        </p>
        <button
          type="button"
          onClick={() => setIsAdding(true)}
          className="inline-flex items-center gap-2 rounded-xl border border-cyan-200 bg-cyan-50 px-3 py-2 text-xs font-semibold text-cyan-700 transition hover:-translate-y-0.5 hover:border-cyan-300 hover:bg-cyan-100 focus:outline-none focus:ring-2 focus:ring-cyan-200"
        >
          <Plus size={14} />
          Add case
        </button>
      </div>
      <KanbanBoard
        stages={leaStages}
        items={items}
        draggedId={draggedId}
        onDragStart={setDraggedId}
        onDrop={(stage) => {
          if (draggedId) {
            setItems((current) =>
              current.map((item) =>
                item.id === draggedId ? { ...item, stage } : item,
              ),
            );
          }
          setDraggedId(null);
        }}
        renderCard={(item) => <LeaCard item={item} />}
      />
      {isAdding && <AddCaseDialog onCancel={() => setIsAdding(false)} onAdd={addCase} />}
    </>
  );
}

function AddCaseDialog({
  onCancel,
  onAdd,
}: {
  onCancel: () => void;
  onAdd: (newCase: LeaCase) => void;
}) {
  const [form, setForm] = useState({
    id: "",
    summary: "",
    location: "",
    amount: "",
    risk: "High" as RiskLevel,
  });

  const updateField = (field: keyof typeof form, value: string) => {
    setForm((current) => ({ ...current, [field]: value }));
  };

  const canSubmit =
    form.id.trim() &&
    form.summary.trim() &&
    form.location.trim() &&
    form.amount.trim();

  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!canSubmit) return;
    onAdd({
      id: form.id.trim().toUpperCase(),
      summary: form.summary.trim(),
      location: form.location.trim(),
      amount: form.amount.trim(),
      risk: form.risk,
      stage: "Assign",
      age: "Just now",
    });
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-slate-950/35 p-4 backdrop-blur-sm">
      <div role="dialog" aria-modal="true" aria-labelledby="add-case-title" className="w-full max-w-lg overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl">
        <div className="flex items-start justify-between border-b border-slate-100 px-5 py-4">
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-cyan-600">New response case</p>
            <h3 id="add-case-title" className="mt-1 text-base font-bold text-slate-900">Add case to Assign</h3>
            <p className="mt-1 text-xs text-slate-500">Create a case card and move it through the LEA workflow.</p>
          </div>
          <button type="button" onClick={onCancel} aria-label="Close add case dialog" className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700">
            <X size={18} />
          </button>
        </div>
        <form onSubmit={submit} className="space-y-4 p-5">
          <div className="grid gap-4 sm:grid-cols-2">
            <FormField label="Case ID" value={form.id} placeholder="e.g. CC-1088" onChange={(value) => updateField("id", value)} />
            <FormField label="Amount involved" value={form.amount} placeholder="e.g. ₹75K" onChange={(value) => updateField("amount", value)} />
          </div>
          <FormField label="Case summary" value={form.summary} placeholder="One-line description of the complaint" onChange={(value) => updateField("summary", value)} />
          <FormField label="Location" value={form.location} placeholder="e.g. Saket · South Delhi" onChange={(value) => updateField("location", value)} />
          <div>
            <label htmlFor="new-case-risk" className="mb-1.5 block text-[11px] font-semibold uppercase tracking-wide text-slate-500">Risk level</label>
            <select id="new-case-risk" value={form.risk} onChange={(event) => updateField("risk", event.target.value)} className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-xs text-slate-800 outline-none focus:border-cyan-400 focus:ring-2 focus:ring-cyan-100">
              <option>Critical</option>
              <option>High</option>
              <option>Medium</option>
            </select>
          </div>
          <div className="flex justify-end gap-2 border-t border-slate-100 pt-4">
            <button type="button" onClick={onCancel} className="rounded-xl px-3 py-2 text-xs font-semibold text-slate-500 hover:bg-slate-100">Cancel</button>
            <button type="submit" disabled={!canSubmit} className="rounded-xl bg-slate-950 px-4 py-2 text-xs font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:bg-slate-300">Add to Assign</button>
          </div>
        </form>
      </div>
    </div>
  );
}

function FormField({
  label,
  value,
  placeholder,
  onChange,
}: {
  label: string;
  value: string;
  placeholder: string;
  onChange: (value: string) => void;
}) {
  return (
    <div>
      <label className="mb-1.5 block text-[11px] font-semibold uppercase tracking-wide text-slate-500">{label}</label>
      <input value={value} placeholder={placeholder} onChange={(event) => onChange(event.target.value)} className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-xs text-slate-800 outline-none placeholder:text-slate-400 focus:border-cyan-400 focus:ring-2 focus:ring-cyan-100" />
    </div>
  );
}

function BankBoard() {
  const [items, setItems] = useState(mockBankAlerts);
  const [draggedId, setDraggedId] = useState<string | null>(null);
  return <KanbanBoard stages={bankStages} items={items} draggedId={draggedId} onDragStart={setDraggedId} onDrop={(stage) => { if (draggedId) setItems((current) => current.map((item) => item.id === draggedId ? { ...item, stage } : item)); setDraggedId(null); }} renderCard={(item) => <BankCard item={item} />} />;
}

interface KanbanBoardProps<T extends { id: string; stage: string }> {
  stages: readonly T["stage"][];
  items: T[];
  draggedId: string | null;
  onDragStart: (id: string) => void;
  onDrop: (stage: T["stage"]) => void;
  renderCard: (item: T) => ReactNode;
}

function KanbanBoard<T extends { id: string; stage: string }>({ stages, items, draggedId, onDragStart, onDrop, renderCard }: KanbanBoardProps<T>) {
  return <div className={`grid grid-cols-1 gap-4 md:grid-cols-2 ${stages.length === 3 ? "xl:grid-cols-3" : "xl:grid-cols-4"}`}>{stages.map((stage) => {
    const stageItems = items.filter((item) => item.stage === stage);
    const style = stageStyles[stage];
    return <div key={stage} className="overflow-hidden rounded-2xl border border-slate-200 bg-slate-50/80" onDragOver={(event) => event.preventDefault()} onDrop={() => onDrop(stage)}>
      <div className={`h-1 ${style.strip}`} /><div className="p-4"><div className="mb-3 flex items-center justify-between"><div className="flex items-center gap-2"><span className={`h-2 w-2 rounded-full ${style.dot}`} /><h3 className="text-xs font-semibold text-slate-800">{stage}</h3></div><span className="rounded-full bg-white px-2 py-1 text-[10px] font-semibold text-slate-500 shadow-sm">{stageItems.length}</span></div>
      <div className="min-h-[170px] space-y-3">{stageItems.map((item) => <div key={item.id} draggable onDragStart={() => onDragStart(item.id)} onDragEnd={() => onDragStart("")} className={`cursor-grab transition hover:-translate-y-0.5 hover:shadow-md active:cursor-grabbing ${draggedId === item.id ? "opacity-50 shadow-lg" : ""}`}>{renderCard(item)}</div>)}{stageItems.length === 0 && <div className="flex min-h-[145px] items-center justify-center rounded-xl border border-dashed border-slate-200 bg-white/60"><span className="text-[10px] font-medium uppercase tracking-wider text-slate-300">Drop items here</span></div>}</div></div>
    </div>;
  })}</div>;
}

function LeaCard({ item }: { item: LeaCase }) {
  return <article className="rounded-xl border border-slate-200 bg-white p-3.5 shadow-sm"><div className="flex items-start justify-between gap-3"><p className="font-mono text-[10px] font-semibold text-slate-500">{item.id}</p><span className={`rounded-full border px-2 py-0.5 text-[10px] font-semibold ${riskStyles[item.risk]}`}>{item.risk}</span></div><p className="mt-2 text-xs font-medium leading-5 text-slate-800">{item.summary}</p><p className="mt-3 text-[10px] text-slate-500">{item.location}</p><div className="mt-3 flex items-center justify-between border-t border-slate-100 pt-2 text-[10px] text-slate-400"><span>{item.amount} · {item.age}</span><span aria-label="Drag case" className="text-slate-300">⋮⋮</span></div></article>;
}

function BankCard({ item }: { item: BankAlert }) {
  return <article className="rounded-xl border border-slate-200 bg-white p-3.5 shadow-sm"><div className="flex items-start justify-between gap-3"><p className="font-mono text-[10px] font-semibold text-slate-500">{item.id}</p><span className={`rounded-full border px-2 py-0.5 text-[10px] font-semibold ${riskStyles[item.risk]}`}>{item.risk}</span></div><p className="mt-2 text-xs font-medium leading-5 text-slate-800">{item.summary}</p><p className="mt-3 text-[10px] text-slate-500">{item.location}</p><div className="mt-3 flex items-center justify-between border-t border-slate-100 pt-2 text-[10px] text-slate-400"><span>Window {item.window}</span><span aria-label="Drag alert" className="text-slate-300">⋮⋮</span></div></article>;
}
