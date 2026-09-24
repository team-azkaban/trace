import { useNavigate, useParams } from "react-router-dom";

import {
  ArrowLeft,
  Activity,
  Clock3,
  MapPinned,
  ShieldAlert,
  TrendingUp,
} from "lucide-react";

import ExplainabilityPanel from "../features/explainability/explainabilitypanel";
import CCTVPanel from "../features/cctv/cctvpanel";

import {
  vaniaLocations,
  riskColors,
} from "../features/predictive_location/VaniaPredictiveLocation";

export default function LocationInvestigationPage() {
  const navigate = useNavigate();

  const { locationId } = useParams<{
    locationId: string;
  }>();

  const location = vaniaLocations.find(
    (item) => item.id === locationId,
  );

  if (!location) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50">
        <div className="text-center">
          <h1 className="text-lg font-bold text-slate-900">
            Location not found
          </h1>

          <p className="mt-1 text-sm text-slate-500">
            No predictive location was found for ID: {locationId}
          </p>

          <button
            type="button"
            onClick={() => navigate("/app/predict")}
            className="mt-4 rounded-lg bg-slate-900 px-4 py-2 text-xs font-semibold text-white transition hover:bg-slate-800"
          >
            Back to Predictions
          </button>
        </div>
      </div>
    );
  }

  const isHighRisk =
    location.riskLevel === "Critical" ||
    location.riskLevel === "High";

  return (
    <div className="min-h-screen bg-slate-50">
      {/* =====================================================
          HEADER
      ===================================================== */}

      <header className="bord bg-white">
        <div className="mx-auto max-w-[1400px] px-6 py-4">
          <button
  type="button"
  onClick={() => navigate("/app/predict")}
  className="inline-flex items-center gap-2 rounded-lg border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-600 transition hover:bg-slate-50"
>
  <ArrowLeft size={15} />
  Back to Predictions
</button>
        </div>
      </header>

      {/* =====================================================
          LOCATION HEADER
      ===================================================== */}

      <section className="border-b border-slate-200 bg-white">
        <div className="mx-auto max-w-[1400px] px-6 py-7">
          <div className="flex flex-col justify-between gap-6 lg:flex-row">
            {/* LOCATION INFO */}

            <div className="flex items-start gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-cyan-50 text-cyan-600">
                <MapPinned size={22} />
              </div>

              <div>
                <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-cyan-600">
                  Location Investigation
                </p>

                <h1 className="mt-1 text-2xl font-bold text-slate-950">
                  {location.name}
                </h1>

               
              </div>
            </div>

            {/* RISK */}

            <div
              className={`flex items-center gap-3 rounded-2xl border px-5 py-3 ${
                isHighRisk
                  ? "border-red-200 bg-red-50"
                  : "border-slate-200 bg-slate-50"
              }`}
            >
              <ShieldAlert
                size={20}
                className={
                  isHighRisk
                    ? "text-red-600"
                    : "text-slate-500"
                }
              />

              <div>
                <p className="text-[9px] font-semibold uppercase tracking-wider text-slate-400">
                  Risk Level
                </p>

                <p
                  className="text-sm font-bold"
                  style={{
                    color: riskColors[location.riskLevel],
                  }}
                >
                  {location.riskLevel}
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* =====================================================
          PAGE CONTENT
      ===================================================== */}

      <main className="mx-auto max-w-[1400px] px-6 py-6">
        {/* ===================================================
            METRICS
        =================================================== */}

        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          <Metric
            label="Prediction Score"
            value={`${location.confidence}/100`}
            icon={<Activity size={16} />}
          />

          <Metric
            label="Predicted Window"
            value={location.predictedWindow}
            icon={<Clock3 size={16} />}
          />

          <Metric
            label="Distance"
            value={`${location.distanceKm} km`}
            icon={<MapPinned size={16} />}
          />

          <Metric
            label="Prediction ID"
            value={location.id}
            icon={<TrendingUp size={16} />}
          />
        </div>

        {/* ===================================================
            RATIONALE
        =================================================== */}


        {/* ===================================================
            EXPLAINABILITY + CCTV
        =================================================== */}

        <div className="mt-5 grid grid-cols-1 gap-5 xl:grid-cols-2">
          {/* EXPLAINABILITY */}

          <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
            
            <div className="p-2">
              <ExplainabilityPanel />
            </div>
          </section>

          {/* CCTV */}

          <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
           

            <div className="p-2">
              <CCTVPanel />
            </div>
          </section>
        </div>

        {/* ===================================================
            REVIEW NOTE
        =================================================== */}

        <div className="mt-5 rounded-2xl border border-amber-200 bg-amber-50 p-4">
          <p className="text-xs font-semibold text-amber-800">
            Analyst review required
          </p>

          <p className="mt-1 text-xs text-amber-700">
            This prediction represents an investigative lead and
            should be reviewed against supporting evidence before
            action is taken.
          </p>
        </div>
      </main>
    </div>
  );
}

/* =========================================================
   METRIC
========================================================= */

function Metric({
  label,
  value,
  icon,
}: {
  label: string;
  value: string;
  icon: React.ReactNode;
}) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4">
      <div className="flex items-center justify-between">
        <p className="text-[9px] font-semibold uppercase tracking-wider text-slate-400">
          {label}
        </p>

        <span className="text-slate-400">
          {icon}
        </span>
      </div>

      <p className="mt-2 truncate text-base font-bold text-slate-900">
        {value}
      </p>
    </div>
  );
}