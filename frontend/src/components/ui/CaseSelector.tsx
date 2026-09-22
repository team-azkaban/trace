import { ChevronDown } from "lucide-react";

export interface CaseOption {
  id: string;
  fraudType: string;
  amount: number;
  location: string;
  risk: number;
  receivedTime: string;
}

interface CaseSelectorProps {
  cases: CaseOption[];
  selectedCaseId: string;
  onCaseChange: (caseId: string) => void;
}

export default function CaseSelector({
  cases,
  selectedCaseId,
  onCaseChange,
}: CaseSelectorProps) {
  const selectedCase = cases.find(
    (caseItem) => caseItem.id === selectedCaseId,
  );

  return (
    <div className="relative">
      <select
        value={selectedCaseId}
        onChange={(event) => onCaseChange(event.target.value)}
        className="w-full cursor-pointer appearance-none rounded-xl border border-slate-200 bg-white px-4 py-3 pr-10 text-sm font-medium text-slate-800 shadow-sm outline-none transition hover:border-slate-300 focus:border-cyan-400 focus:ring-2 focus:ring-cyan-100"
      >
        {cases.map((caseItem) => (
          <option key={caseItem.id} value={caseItem.id}>
            {caseItem.id} — {caseItem.fraudType} — ₹
            {caseItem.amount.toLocaleString("en-IN")}
          </option>
        ))}
      </select>

      <ChevronDown
        size={16}
        className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-slate-400"
      />

      {selectedCase && (
        <p className="mt-2 text-xs text-slate-400">
          {selectedCase.location} · Received{" "}
          {selectedCase.receivedTime}
        </p>
      )}
    </div>
  );
}