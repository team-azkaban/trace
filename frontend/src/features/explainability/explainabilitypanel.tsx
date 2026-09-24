import {
  Activity,
  ChevronDown,
  Clock3,
  IndianRupee,
  Link2,
  MapPin,
  ShieldCheck,
  Sparkles,
} from "lucide-react";
import { useState } from "react";

/* =========================================================
   TYPES
========================================================= */

type EvidenceFactor = {
  type: string;
  title: string;
  icon: React.ElementType;
  observation: string;
  interpretation: string;
  relevance: string;
  source: string;
};

/* =========================================================
   EVIDENCE
========================================================= */

const evidenceFactors: EvidenceFactor[] = [
  {
    type: "Network",
    title: "Connected account activity",
    icon: Link2,

    observation:
      "Several accounts associated with the transaction chain show links to suspicious transfer activity.",

    interpretation:
      "The transaction network is not isolated. Related accounts and transfers form a connected pattern that places this location within the broader movement of funds.",

    relevance:
      "This is the primary network-level signal connecting the case activity to the predicted cash-out area.",

    source:
      "Transaction graph analysis",
  },

  {
    type: "Timing",
    title: "Recurring evening activity",
    icon: Clock3,

    observation:
      "Historical activity associated with the case shows repeated cash-out behavior during the evening period.",

    interpretation:
      "The predicted withdrawal window overlaps with a previously observed temporal pattern rather than representing an arbitrary time estimate.",

    relevance:
      "The temporal alignment increases the consistency between the current prediction and prior observed behavior.",

    source:
      "Transaction timestamps",
  },

  {
    type: "Pattern",
    title: "Related activity in the surrounding area",
    icon: Activity,

    observation:
      "Multiple related complaints and suspicious transactions have been recorded within the surrounding geographic area.",

    interpretation:
      "The location appears within a broader cluster of activity sharing similar transaction characteristics.",

    relevance:
      "Geographic clustering provides contextual support for considering this area as a potential cash-out zone.",

    source:
      "Complaint and transaction records",
  },

  {
    type: "Location",
    title: "Historical activity nearby",
    icon: MapPin,

    observation:
      "Previous suspicious activity has been identified near the predicted location.",

    interpretation:
      "The current prediction overlaps with an area that has already appeared in historical investigative data.",

    relevance:
      "Prior activity provides geographic context, although proximity alone does not establish that a new event will occur at this location.",

    source:
      "Historical location intelligence",
  },

  {
    type: "Amount",
    title: "Transaction value is atypical",
    icon: IndianRupee,

    observation:
      "The associated transfer is materially larger than the typical transaction values observed in the surrounding activity.",

    interpretation:
      "The transaction value makes the event more relevant when examined alongside the network, timing, and geographic signals.",

    relevance:
      "Amount is treated as contextual evidence rather than a standalone indicator of the predicted location.",

    source:
      "Transaction amount analysis",
  },
];

/* =========================================================
   TYPE STYLES
========================================================= */

const typeStyles: Record<
  string,
  {
    wrapper: string;
    icon: string;
    badge: string;
  }
> = {
  Network: {
    wrapper: "border-cyan-100 bg-cyan-50/40",
    icon: "bg-cyan-50 text-cyan-700",
    badge: "text-cyan-700",
  },

  Timing: {
    wrapper: "border-amber-100 bg-amber-50/40",
    icon: "bg-amber-50 text-amber-700",
    badge: "text-amber-700",
  },

  Pattern: {
    wrapper: "border-violet-100 bg-violet-50/40",
    icon: "bg-violet-50 text-violet-700",
    badge: "text-violet-700",
  },

  Location: {
    wrapper: "border-blue-100 bg-blue-50/40",
    icon: "bg-blue-50 text-blue-700",
    badge: "text-blue-700",
  },

  Amount: {
    wrapper: "border-emerald-100 bg-emerald-50/40",
    icon: "bg-emerald-50 text-emerald-700",
    badge: "text-emerald-700",
  },
};

/* =========================================================
   MAIN COMPONENT
========================================================= */

export default function ExplainabilityPanel() {
  const [expandedFactor, setExpandedFactor] =
    useState<string | null>(null);

  const handleFactorClick = (type: string) => {
    setExpandedFactor((current) =>
      current === type ? null : type,
    );
  };

  return (
    <div className="overflow-hidden ">
      {/* =====================================================
          HEADER
      ===================================================== */}

      <div className=" px-5 py-5">
        <div className="flex items-start gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-cyan-50 text-cyan-600 ring-1 ring-cyan-100">
            <Sparkles size={18} />
          </div>

          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-cyan-600">
                Model explanation
              </p>

              <span className="h-1 w-1 rounded-full bg-slate-300" />

              <span className="text-[9px] font-medium uppercase tracking-wider text-slate-400">
                TRACE
              </span>
            </div>

            <h3 className="mt-1 text-base font-bold text-slate-950">
              Why this location was identified
            </h3>

          </div>
        </div>

        {/* Analytical framing */}
        <div className="mt-4 grid grid-cols-1 gap-2 sm:grid-cols-3">
          <AnalyticalTag
            label="Evidence"
            value="Observed activity"
          />

          <AnalyticalTag
            label="Method"
            value="Multi-signal analysis"
          />

          <AnalyticalTag
            label="Interpretation"
            value="Investigative lead"
          />
        </div>
      </div>

      {/* =====================================================
          EVIDENCE INTRO
      ===================================================== */}

      <div className="border-b border-slate-100 px-5 py-4">
        <div className="flex items-start gap-3">
          <div className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-slate-500">
            <ShieldCheck size={14} />
          </div>

          <div>
            <p className="text-[10px] font-bold uppercase tracking-[0.13em] text-slate-400">
              Evidence chain
            </p>

            <p className="mt-1 text-[11px] leading-5 text-slate-600">
              Each signal below represents a different piece of evidence.
              Expand a signal to see what was observed, how it was interpreted,
              and why it is relevant to the prediction.
            </p>
          </div>
        </div>
      </div>

      {/* =====================================================
          EVIDENCE FACTORS
      ===================================================== */}

      <div className="space-y-2.5 p-5">
        {evidenceFactors.map((factor, index) => {
          const Icon = factor.icon;
          const isExpanded =
            expandedFactor === factor.type;

          const styles =
            typeStyles[factor.type] ?? typeStyles.Network;

          return (
            <div
              key={factor.type}
              className={`overflow-hidden rounded-xl border transition-all duration-200 ${
                isExpanded
                  ? "border-slate-200 bg-white shadow-sm"
                  : "border-slate-100 bg-slate-50/40"
              }`}
            >
              {/* =================================================
                  FACTOR HEADER
              ================================================= */}

              <button
                type="button"
                onClick={() =>
                  handleFactorClick(factor.type)
                }
                className="w-full px-3.5 py-3 text-left transition-colors hover:bg-white"
                aria-expanded={isExpanded}
              >
                <div className="flex items-start gap-3">
                  {/* Index */}
                  <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-slate-200 bg-white text-[10px] font-bold text-slate-500">
                    {String(index + 1).padStart(2, "0")}
                  </div>

                  {/* Icon */}
                  <div
                    className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${styles.icon}`}
                  >
                    <Icon size={14} />
                  </div>

                  {/* Content */}
                  <div className="min-w-0 flex-1">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <div className="flex flex-wrap items-center gap-2">
                          <span
                            className={`text-[8px] font-bold uppercase tracking-[0.12em] ${styles.badge}`}
                          >
                            {factor.type}
                          </span>

                          <span className="h-1 w-1 rounded-full bg-slate-300" />

                          <span className="text-[8px] font-medium uppercase tracking-[0.1em] text-slate-400">
                            {factor.source}
                          </span>
                        </div>

                        <p className="mt-1 text-[12px] font-semibold text-slate-800">
                          {factor.title}
                        </p>
                      </div>

                      <ChevronDown
                        size={14}
                        className={`mt-0.5 shrink-0 text-slate-400 transition-transform duration-200 ${
                          isExpanded
                            ? "rotate-180"
                            : ""
                        }`}
                      />
                    </div>

                    <p className="mt-1.5 text-[10px] leading-4 text-slate-500">
                      {factor.observation}
                    </p>
                  </div>
                </div>
              </button>

              {/* =================================================
                  EXPANDED ANALYSIS
              ================================================= */}

              <div
                className={`grid transition-all duration-200 ${
                  isExpanded
                    ? "grid-rows-[1fr] opacity-100"
                    : "grid-rows-[0fr] opacity-0"
                }`}
              >
                <div className="overflow-hidden">
                  <div className="mx-3.5 mb-3.5 border-t border-slate-100 pt-3.5">
                    <div className="grid gap-2.5 sm:grid-cols-2">
                      {/* Observation */}
                      <AnalysisBlock
                        label="Observed"
                        text={factor.observation}
                      />

                      {/* Interpretation */}
                      <AnalysisBlock
                        label="Model interpretation"
                        text={factor.interpretation}
                        highlighted
                      />
                    </div>

                    {/* Relevance */}
                    <div className="mt-2.5 rounded-lg border border-slate-100 bg-slate-50 px-3 py-2.5">
                      <p className="text-[8px] font-bold uppercase tracking-[0.13em] text-slate-400">
                        Investigative relevance
                      </p>

                      <p className="mt-1.5 text-[10px] leading-4 text-slate-600">
                        {factor.relevance}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* =====================================================
          SYNTHESIS
      ===================================================== */}

      <div className="border-t border-slate-100 bg-slate-50/60 px-5 py-4">
        <div className="flex items-start gap-3">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-cyan-50 text-cyan-600 ring-1 ring-cyan-100">
            <Sparkles size={14} />
          </div>

          <div>
            <p className="text-[9px] font-bold uppercase tracking-[0.14em] text-cyan-700">
              Model synthesis
            </p>

            <p className="mt-1.5 text-[10px] leading-5 text-slate-600">
              The location is identified because multiple signals converge:
              connected transaction activity, recurring timing, geographic
              clustering, historical proximity, and an atypically large
              transfer. The strongest interpretation comes from the
              <span className="font-semibold text-slate-800">
                {" "}
                combination of signals
              </span>
              , not from any single factor in isolation.
            </p>
          </div>
        </div>
      </div>

      {/* =====================================================
          LIMITATIONS
      ===================================================== */}

      <div className="border-t border-slate-100 px-5 py-3.5">
        <div className="flex items-start gap-2.5">
          <div className="mt-0.5 h-1.5 w-1.5 shrink-0 rounded-full bg-amber-400" />

          <p className="text-[9px] leading-4 text-slate-400">
            <span className="font-semibold text-slate-500">
              Interpretation note:
            </span>{" "}
            These signals identify a location as an investigative lead. They
            do not establish that a cash-out event will occur there. The
            prediction should be evaluated alongside transaction records,
            physical intelligence, and other available evidence.
          </p>
        </div>
      </div>
    </div>
  );
}

/* =========================================================
   ANALYTICAL TAG
========================================================= */

function AnalyticalTag({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-lg border border-slate-100 bg-white px-3 py-2">
      <p className="text-[8px] font-semibold uppercase tracking-[0.12em] text-slate-400">
        {label}
      </p>

      <p className="mt-0.5 text-[10px] font-semibold text-slate-700">
        {value}
      </p>
    </div>
  );
}

/* =========================================================
   ANALYSIS BLOCK
========================================================= */

function AnalysisBlock({
  label,
  text,
  highlighted = false,
}: {
  label: string;
  text: string;
  highlighted?: boolean;
}) {
  return (
    <div
      className={`rounded-lg border px-3 py-2.5 ${
        highlighted
          ? "border-cyan-100 bg-cyan-50/40"
          : "border-slate-100 bg-slate-50"
      }`}
    >
      <p
        className={`text-[8px] font-bold uppercase tracking-[0.13em] ${
          highlighted
            ? "text-cyan-700"
            : "text-slate-400"
        }`}
      >
        {label}
      </p>

      <p className="mt-1.5 text-[10px] leading-4 text-slate-600">
        {text}
      </p>
    </div>
  );
}