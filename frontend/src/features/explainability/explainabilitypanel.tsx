import {
  Activity,
  ChevronDown,
  Clock3,
  IndianRupee,
  Link2,
  MapPin,
  Sparkles,
} from "lucide-react";
import { useState } from "react";

const evidenceFactors = [
  {
    type: "Network",
    title: "Linked mule-account activity",
    description:
      "Multiple suspicious accounts are connected to transactions around this location.",
    detail:
      "Network analysis identified several linked accounts involved in suspicious transfers. Their activity creates a stronger connection between the transaction network and this predicted cash-out zone.",
    strength: 92,
    icon: Link2,
  },
  {
    type: "Timing",
    title: "Evening cash-out pattern",
    description:
      "Historical activity peaks between 7 PM and 9 PM.",
    detail:
      "Previous cash-out activity shows a recurring evening pattern. The predicted event falls within the same high-activity window.",
    strength: 78,
    icon: Clock3,
  },
  {
    type: "Pattern",
    title: "Related complaint cluster",
    description:
      "5 related complaints were reported within the surrounding area.",
    detail:
      "Multiple complaints share similar transaction characteristics and are geographically concentrated around the predicted location.",
    strength: 68,
    icon: Activity,
  },
  {
    type: "Location",
    title: "Previously flagged activity",
    description:
      "The predicted point is close to previously identified activity.",
    detail:
      "Historical suspicious activity has been observed near this location, providing additional geographic context for the prediction.",
    strength: 57,
    icon: MapPin,
  },
  {
    type: "Amount",
    title: "High-value transaction",
    description:
      "The associated transfer is significantly above the local baseline.",
    detail:
      "The transaction amount is higher than the typical value observed in comparable activity, increasing its relevance to the prediction.",
    strength: 44,
    icon: IndianRupee,
  },
];

const typeStyles: Record<string, string> = {
  Network: "bg-cyan-50 text-cyan-700 border-cyan-100",
  Timing: "bg-amber-50 text-amber-700 border-amber-100",
  Pattern: "bg-violet-50 text-violet-700 border-violet-100",
  Location: "bg-blue-50 text-blue-700 border-blue-100",
  Amount: "bg-emerald-50 text-emerald-700 border-emerald-100",
};

export default function ExplainabilityPanel() {
  const [expandedFactor, setExpandedFactor] = useState<string | null>(null);

  const handleFactorClick = (type: string) => {
    setExpandedFactor((current) =>
      current === type ? null : type,
    );
  };

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">

      {/* Header */}
      <div className="flex items-start justify-between gap-4">

        <div>
          <div className="flex items-center gap-2">

            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-cyan-50 text-cyan-600">
              <Sparkles size={17} />
            </div>

            <div>
              <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-cyan-600">
                Explainability
              </p>

              <h3 className="text-[15px] font-bold text-slate-900">
                Why this location?
              </h3>
            </div>

          </div>

          <p className="mt-3 text-xs leading-5 text-slate-500">
            TRACE identified multiple supporting signals around the predicted
            cash-out location.
          </p>
        </div>


        {/* Confidence */}
        <div className="shrink-0 rounded-xl border border-cyan-100 bg-cyan-50/60 px-3 py-2 text-right">

          <p className="text-[9px] font-semibold uppercase tracking-wider text-slate-400">
            Confidence
          </p>

          <p className="mt-0.5 text-lg font-bold text-cyan-700">
            87%
          </p>

        </div>

      </div>


      {/* Evidence factors */}
      <div className="mt-5 space-y-2.5">

        {evidenceFactors.map((factor) => {

          const Icon = factor.icon;
          const isExpanded = expandedFactor === factor.type;

          return (
            <div
              key={factor.type}
              className={`overflow-hidden rounded-xl border transition-all duration-200 ${
                isExpanded
                  ? "border-cyan-100 bg-white shadow-sm"
                  : "border-slate-100 bg-slate-50/50"
              }`}
            >

              {/* Clickable row */}
              <button
                type="button"
                onClick={() => handleFactorClick(factor.type)}
                className="w-full p-3 text-left transition-colors hover:bg-white"
              >

                <div className="flex items-start gap-3">

                  {/* Evidence type chip */}
                  <div
                    className={`flex h-8 shrink-0 items-center gap-1.5 rounded-lg border px-2 ${typeStyles[factor.type]}`}
                  >
                    <Icon size={13} />

                    <span className="text-[9px] font-bold uppercase tracking-wide">
                      {factor.type}
                    </span>
                  </div>


                  {/* Evidence text */}
                  <div className="min-w-0 flex-1">

                    <div className="flex items-start justify-between gap-3">

                      <p className="text-[12px] font-semibold text-slate-800">
                        {factor.title}
                      </p>

                      <div className="flex shrink-0 items-center gap-2">

                        <span className="text-[10px] font-bold text-slate-400">
                          {factor.strength}%
                        </span>

                        <ChevronDown
                          size={13}
                          className={`text-slate-400 transition-transform duration-200 ${
                            isExpanded ? "rotate-180" : ""
                          }`}
                        />

                      </div>

                    </div>

                    <p className="mt-1 text-[10px] leading-4 text-slate-500">
                      {factor.description}
                    </p>


                    {/* Strength bar */}
                    <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-slate-100">

                      <div
                        className="h-full rounded-full bg-cyan-500 transition-all duration-500"
                        style={{
                          width: `${factor.strength}%`,
                        }}
                      />

                    </div>

                  </div>

                </div>

              </button>


              {/* Expanded explanation */}
              <div
                className={`grid transition-all duration-200 ${
                  isExpanded
                    ? "grid-rows-[1fr] opacity-100"
                    : "grid-rows-[0fr] opacity-0"
                }`}
              >

                <div className="overflow-hidden">

                  <div className="mx-3 mb-3 rounded-lg border border-slate-100 bg-slate-50 px-3 py-2.5">

                    <div className="flex items-center justify-between">

                      <p className="text-[9px] font-bold uppercase tracking-wider text-slate-400">
                        Why this matters
                      </p>

                      <span className="text-[9px] font-semibold text-cyan-600">
                        Signal strength: {factor.strength}%
                      </span>

                    </div>

                    <p className="mt-1.5 text-[10px] leading-4 text-slate-600">
                      {factor.detail}
                    </p>

                  </div>

                </div>

              </div>

            </div>
          );
        })}

      </div>


      {/* Bottom explanation */}
      <div className="mt-4 rounded-xl border border-cyan-100 bg-gradient-to-r from-cyan-50/70 to-blue-50/50 px-3.5 py-3">

        <div className="flex items-start gap-2.5">

          <Sparkles
            size={14}
            className="mt-0.5 shrink-0 text-cyan-600"
          />

          <p className="text-[10px] leading-4 text-slate-600">

            Click any evidence signal to understand{" "}
            <span className="font-semibold text-slate-800">
              why it contributes to the prediction
            </span>
            .

          </p>

        </div>

      </div>

    </div>
  );
}