import { ArrowLeft, Activity } from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";

import PageContainer from "../components/layout/PageContainer";
import { CoverageSimulator } from "../features/coverage-simulator/CoverageSimulator";
import { mockCases } from "../data/cases.mock";

export default function CoverageSimulatorPage() {
  const navigate = useNavigate();
  const { caseId } = useParams<{ caseId: string }>();

  const selectedCase =
    mockCases.find(
      (caseItem) =>
        caseItem.complaint.id === caseId,
    ) ?? mockCases[0];

  return (
    <PageContainer>
      {/* Header */}
      <section className="mb-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <button
              type="button"
              onClick={() => navigate("/app/response")}
              className="mb-3 inline-flex items-center gap-2 text-xs font-semibold text-slate-500 transition hover:text-slate-900"
            >
              <ArrowLeft size={14} />
              Back to Response
            </button>

            <div className="flex items-start gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-cyan-50 text-cyan-600">
                <Activity size={18} />
              </div>

              <div>
                <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-cyan-600">
                  Response Intelligence
                </p>

                <h1 className="mt-1 text-2xl font-bold tracking-tight text-slate-950">
                  Intervention Coverage Simulator
                </h1>

                <p className="mt-1 max-w-2xl text-xs leading-5 text-slate-500">
                  This is a deployment simulation: pick the hotspots and team capacity,
              then estimate how much predicted cash-out risk can be covered in real time.
                </p>
              </div>
            </div>
          </div>

          <div className="rounded-xl border border-slate-200 bg-white px-4 py-3 shadow-sm">
            <p className="text-[9px] font-semibold uppercase tracking-[0.14em] text-slate-400">
              Active Case
            </p>

            <p className="mt-1 text-xs font-semibold text-slate-800">
              {selectedCase.complaint.id}
            </p>
          </div>
        </div>
      </section>

      {/* Simulator */}
      <section>
        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
          <CoverageSimulator
            predictedLocations={
              selectedCase.predictedLocations
            }
          />
        </div>
      </section>
    </PageContainer>
  );
}