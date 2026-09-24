import { useEffect, useMemo, useState } from "react";
import {
  Check,
  ChevronDown,
  Clock3,
  MapPin,
  Pencil,
  Save,
  Target,
  TrendingUp,
  X,
} from "lucide-react";

import type {
  Outcome,
  OutcomeStatus,
  PredictedLocation,
} from "../../data/cases.mock";

import {
  calculateAccuracy,
  createOutcomeId,
  formatRecordedAt,
  getOutcomeCounts,
  mockOutcomeLog,
  type OutcomeLogItem,
} from "./outcome-learning.mock";

const OUTCOME_STORAGE_KEY = "trace-outcome-log-v2";
const OUTCOME_EVENT_NAME = "trace-outcome-updated";
const HISTORY_STORAGE_KEY = "trace-accuracy-history-v1";

type OutcomeTrackerProps = {
  outcome: Outcome;
  caseId: string;
  predictedLocations: PredictedLocation[];
};

type AccuracyPoint = {
  label: string;
  accuracy: number;
};

const initialHistory: AccuracyPoint[] = [
  { label: "1", accuracy: 61 },
  { label: "2", accuracy: 64 },
  { label: "3", accuracy: 63 },
  { label: "4", accuracy: 68 },
  { label: "5", accuracy: 70 },
  { label: "6", accuracy: 69 },
  { label: "7", accuracy: 72 },
  { label: "8", accuracy: 74 },
];

const outcomeOptions: {
  value: OutcomeStatus;
  label: string;
  description: string;
  classes: string;
}[] = [
  {
    value: "Correct",
    label: "Correct",
    description: "Prediction matched.",
    classes:
      "border-green-200 bg-green-50 text-green-700 hover:bg-green-100",
  },
  {
    value: "Partial",
    label: "Partial",
    description: "Close, but not exact.",
    classes:
      "border-amber-200 bg-amber-50 text-amber-700 hover:bg-amber-100",
  },
  {
    value: "Incorrect",
    label: "Incorrect",
    description: "Prediction did not match.",
    classes:
      "border-red-200 bg-red-50 text-red-700 hover:bg-red-100",
  },
  {
    value: "Not Observed",
    label: "Not Observed",
    description: "No field observation.",
    classes:
      "border-slate-200 bg-slate-50 text-slate-600 hover:bg-slate-100",
  },
];

function readStoredLog(): OutcomeLogItem[] {
  try {
    const stored = localStorage.getItem(OUTCOME_STORAGE_KEY);
    if (!stored) return mockOutcomeLog;

    const parsed = JSON.parse(stored);
    return Array.isArray(parsed) ? parsed : mockOutcomeLog;
  } catch {
    return mockOutcomeLog;
  }
}

function readHistory(): AccuracyPoint[] {
  try {
    const stored = localStorage.getItem(HISTORY_STORAGE_KEY);
    if (!stored) return initialHistory;

    const parsed = JSON.parse(stored);
    return Array.isArray(parsed) && parsed.length
      ? parsed
      : initialHistory;
  } catch {
    return initialHistory;
  }
}

function saveHistory(history: AccuracyPoint[]) {
  localStorage.setItem(
    HISTORY_STORAGE_KEY,
    JSON.stringify(history),
  );
}

function persistLog(log: OutcomeLogItem[]) {
  localStorage.setItem(
    OUTCOME_STORAGE_KEY,
    JSON.stringify(log),
  );

  window.dispatchEvent(
    new CustomEvent(OUTCOME_EVENT_NAME, {
      detail: log,
    }),
  );
}

function getRiskClass(risk: PredictedLocation["riskLevel"]) {
  switch (risk) {
    case "Critical":
      return "bg-red-50 text-red-700 border-red-200";
    case "High":
      return "bg-orange-50 text-orange-700 border-orange-200";
    case "Medium":
      return "bg-amber-50 text-amber-700 border-amber-200";
    default:
      return "bg-green-50 text-green-700 border-green-200";
  }
}

function getOutcomeClass(status: OutcomeStatus) {
  switch (status) {
    case "Correct":
      return "bg-green-50 text-green-700 border-green-200";
    case "Partial":
      return "bg-amber-50 text-amber-700 border-amber-200";
    case "Incorrect":
      return "bg-red-50 text-red-700 border-red-200";
    default:
      return "bg-slate-50 text-slate-600 border-slate-200";
  }
}

export function OutcomeTracker({
  outcome,
  caseId,
  predictedLocations,
}: OutcomeTrackerProps) {
  const initialPredictionId =
    outcome.predictedLocationId ||
    predictedLocations[0]?.id ||
    "";

  const [selectedPredictionId, setSelectedPredictionId] =
    useState(initialPredictionId);

  const [selectedStatus, setSelectedStatus] =
    useState<OutcomeStatus>("Not Observed");

  const [actualLocation, setActualLocation] = useState("");
  const [actualTime, setActualTime] = useState("");

  const [outcomeLog, setOutcomeLog] =
    useState<OutcomeLogItem[]>(readStoredLog);

  const [history, setHistory] =
    useState<AccuracyPoint[]>(readHistory);

  const [editingId, setEditingId] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState("");

  const selectedPrediction = useMemo(
    () =>
      predictedLocations.find(
        (location) => location.id === selectedPredictionId,
      ) ?? predictedLocations[0],
    [predictedLocations, selectedPredictionId],
  );

  const counts = useMemo(
    () => getOutcomeCounts(outcomeLog),
    [outcomeLog],
  );

  const currentAccuracy = useMemo(
    () => calculateAccuracy(outcomeLog),
    [outcomeLog],
  );

  const validatedCount =
    counts.correct +
    counts.partial +
    counts.incorrect;

  const latestAccuracy =
    history[history.length - 1]?.accuracy ??
    currentAccuracy;

  useEffect(() => {
    if (
      selectedPredictionId &&
      predictedLocations.some(
        (location) => location.id === selectedPredictionId,
      )
    ) {
      return;
    }

    if (predictedLocations[0]) {
      setSelectedPredictionId(predictedLocations[0].id);
    }
  }, [predictedLocations, selectedPredictionId]);

  // Keep accuracy history synced with saved outcomes.
  useEffect(() => {
    const handleOutcomeUpdate = (event: Event) => {
      const customEvent =
        event as CustomEvent<OutcomeLogItem[]>;

      const nextLog =
        customEvent.detail ?? readStoredLog();

      setOutcomeLog(nextLog);

      const nextAccuracy = calculateAccuracy(nextLog);

      setHistory((currentHistory) => {
        const last =
          currentHistory[currentHistory.length - 1];

        if (last?.accuracy === nextAccuracy) {
          return currentHistory;
        }

        const nextHistory = [
          ...currentHistory,
          {
            label: `${currentHistory.length + 1}`,
            accuracy: nextAccuracy,
          },
        ];

        saveHistory(nextHistory);
        return nextHistory;
      });
    };

    window.addEventListener(
      OUTCOME_EVENT_NAME,
      handleOutcomeUpdate,
    );

    return () =>
      window.removeEventListener(
        OUTCOME_EVENT_NAME,
        handleOutcomeUpdate,
      );
  }, []);

  const chartPoints = useMemo(() => {
    const width = 760;
    const height = 270;
    const left = 42;
    const right = 16;
    const top = 18;
    const bottom = 30;

    const chartWidth = width - left - right;
    const chartHeight = height - top - bottom;

    return history.map((point, index) => ({
      ...point,
      x:
        history.length === 1
          ? width / 2
          : left +
            (index / (history.length - 1)) *
              chartWidth,
      y:
        top +
        ((100 - point.accuracy) / 100) *
          chartHeight,
    }));
  }, [history]);

  const linePath = chartPoints
    .map((point, index) =>
      index === 0
        ? `M ${point.x} ${point.y}`
        : `L ${point.x} ${point.y}`,
    )
    .join(" ");

  const areaPath =
    chartPoints.length > 0
      ? `${linePath} L ${
          chartPoints[chartPoints.length - 1].x
        } 240 L ${chartPoints[0].x} 240 Z`
      : "";

  const resetHistory = () => {
    localStorage.removeItem(HISTORY_STORAGE_KEY);
    setHistory(initialHistory);
  };

  const resetForm = () => {
    setSelectedStatus("Not Observed");
    setActualLocation("");
    setActualTime("");
    setEditingId(null);
  };

  const handleSaveOutcome = () => {
    if (!selectedPrediction) return;

    const existingIndex = editingId
      ? outcomeLog.findIndex(
          (item) => item.id === editingId,
        )
      : -1;

    const nextItem: OutcomeLogItem = {
      id: editingId ?? createOutcomeId(),
      caseId,
      predictionId:
        outcome.predictionId || `PRED-${caseId}`,
      predictedLocationId: selectedPrediction.id,
      predictedLocationName: selectedPrediction.name,
      predictedWindow:
        selectedPrediction.predictedWindow,
      actualLocation:
        actualLocation.trim() || undefined,
      actualTime: actualTime || undefined,
      status: selectedStatus,
      recordedAt: formatRecordedAt(),
    };

    const nextLog = [...outcomeLog];

    if (existingIndex >= 0) {
      nextLog[existingIndex] = nextItem;
    } else {
      nextLog.unshift(nextItem);
    }

    setOutcomeLog(nextLog);
    persistLog(nextLog);

    setSuccessMessage(
      editingId
        ? "Outcome updated"
        : "Outcome recorded",
    );

    resetForm();

    window.setTimeout(
      () => setSuccessMessage(""),
      2500,
    );
  };

  const handleEdit = (item: OutcomeLogItem) => {
    const prediction = predictedLocations.find(
      (location) =>
        location.id === item.predictedLocationId,
    );

    if (prediction) {
      setSelectedPredictionId(prediction.id);
    }

    setSelectedStatus(item.status);
    setActualLocation(item.actualLocation ?? "");
    setActualTime(item.actualTime ?? "");
    setEditingId(item.id);

    document
      .getElementById("outcome-tracker-form")
      ?.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
  };

  return (
    <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
      {/* Compact header */}
      <header className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
        <div className="flex items-center gap-2">
          <Target className="h-5 w-5 text-cyan-600" />
          <div>
            <h3 className="text-sm font-semibold text-slate-900">
              Outcome & Learning
            </h3>
            
          </div>
        </div>

        <button
          type="button"
          onClick={resetHistory}
          className="text-[10px] font-medium text-slate-400 hover:text-slate-700"
        >
          Reset trend
        </button>
      </header>

      {/* Main section */}
      <div className="grid grid-cols-1 lg:grid-cols-[1.05fr_1.35fr]">
        {/* LEFT — Outcome entry */}
        <div
          id="outcome-tracker-form"
          className="space-y-4 p-5 lg:border-r lg:border-slate-100"
        >
          <div>
            <label className="mb-1.5 block text-[10px] font-semibold uppercase tracking-wide text-slate-500">
              Prediction
            </label>

            <div className="relative">
              <select
                value={selectedPredictionId}
                onChange={(event) =>
                  setSelectedPredictionId(
                    event.target.value,
                  )
                }
                className="w-full appearance-none rounded-lg border border-slate-200 bg-white px-3 py-2.5 pr-9 text-xs text-slate-800 outline-none focus:border-cyan-400 focus:ring-2 focus:ring-cyan-100"
              >
                {predictedLocations.map((location) => (
                  <option
                    key={location.id}
                    value={location.id}
                  >
                    {location.name} — {location.area} ·{" "}
                    {location.confidence}%
                  </option>
                ))}
              </select>

              <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            </div>
          </div>

          {selectedPrediction && (
            <div className="rounded-xl border border-cyan-100 bg-cyan-50/50 p-3">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <p className="text-xs font-semibold text-slate-900">
                    {selectedPrediction.name}
                  </p>
                  <p className="mt-0.5 text-[10px] text-slate-500">
                    {selectedPrediction.bank} ·{" "}
                    {selectedPrediction.area}
                  </p>
                </div>

                <span
                  className={`rounded-full border px-2 py-1 text-[9px] font-semibold ${getRiskClass(
                    selectedPrediction.riskLevel,
                  )}`}
                >
                  {selectedPrediction.riskLevel}
                </span>
              </div>

              <div className="mt-3 grid grid-cols-3 gap-2">
                <div>
                  <p className="text-[9px] text-slate-400">
                    Confidence
                  </p>
                  <p className="text-xs font-semibold text-slate-700">
                    {selectedPrediction.confidence}%
                  </p>
                </div>

                <div>
                  <p className="text-[9px] text-slate-400">
                    Window
                  </p>
                  <p className="text-xs font-semibold text-slate-700">
                    {selectedPrediction.predictedWindow}
                  </p>
                </div>

                <div>
                  <p className="text-[9px] text-slate-400">
                    Type
                  </p>
                  <p className="text-xs font-semibold text-slate-700">
                    {selectedPrediction.type}
                  </p>
                </div>
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div>
              <label className="mb-1.5 flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-wide text-slate-500">
                <MapPin className="h-3 w-3" />
                Actual location
              </label>

              <input
                value={actualLocation}
                onChange={(event) =>
                  setActualLocation(event.target.value)
                }
                placeholder="e.g. HDFC ATM — Okhla"
                className="w-full rounded-lg border border-slate-200 px-3 py-2.5 text-xs outline-none focus:border-cyan-400 focus:ring-2 focus:ring-cyan-100"
              />
            </div>

            <div>
              <label className="mb-1.5 flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-wide text-slate-500">
                <Clock3 className="h-3 w-3" />
                Actual time
              </label>

              <input
                type="time"
                value={actualTime}
                onChange={(event) =>
                  setActualTime(event.target.value)
                }
                className="w-full rounded-lg border border-slate-200 px-3 py-2.5 text-xs outline-none focus:border-cyan-400 focus:ring-2 focus:ring-cyan-100"
              />
            </div>
          </div>

          <div>
            <label className="mb-1.5 block text-[10px] font-semibold uppercase tracking-wide text-slate-500">
              Field outcome
            </label>

            <div className="grid grid-cols-2 gap-2">
              {outcomeOptions.map((option) => {
                const active =
                  selectedStatus === option.value;

                return (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() =>
                      setSelectedStatus(option.value)
                    }
                    className={`rounded-lg border p-2.5 text-left transition ${
                      active
                        ? `${option.classes} ring-2 ring-cyan-100`
                        : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-semibold">
                        {option.label}
                      </span>

                      {active && (
                        <Check className="h-3.5 w-3.5" />
                      )}
                    </div>

                    <p className="mt-0.5 text-[9px] opacity-70">
                      {option.description}
                    </p>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="flex items-center justify-between border-t border-slate-100 pt-3">
            {successMessage ? (
              <span className="text-[10px] font-medium text-green-600">
                ✓ {successMessage}
              </span>
            ) : editingId ? (
              <button
                type="button"
                onClick={resetForm}
                className="flex items-center gap-1 text-[10px] text-slate-500"
              >
                <X className="h-3 w-3" />
                Cancel
              </button>
            ) : (
              <span className="text-[9px] text-slate-400">
                Saved to this browser
              </span>
            )}

            <button
              type="button"
              onClick={handleSaveOutcome}
              className="inline-flex items-center gap-1.5 rounded-lg bg-slate-900 px-3.5 py-2 text-[11px] font-semibold text-white hover:bg-slate-800"
            >
              {editingId ? (
                <Pencil className="h-3 w-3" />
              ) : (
                <Save className="h-3 w-3" />
              )}

              {editingId ? "Update" : "Save"}
            </button>
          </div>
        </div>

        {/* RIGHT — Trend + stats + recent activity */}
        <div className="min-w-0 bg-slate-50/40 p-5">
          {/* Trend + stats in ONE row */}
          <div className="grid grid-cols-1 gap-4 xl:grid-cols-[1fr_190px]">
            {/* Graph */}
            <div className="min-w-0">
              <div className="mb-2 flex items-center justify-between">
                <div>
                  <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-cyan-600">
                    Accuracy trend
                  </p>
                  <p className="mt-0.5 text-[9px] text-slate-400">
                    {history.length} checkpoints
                  </p>
                </div>

                <span className="text-lg font-bold text-slate-900">
                  {latestAccuracy}%
                </span>
              </div>

              <div className="h-[270px] overflow-hidden rounded-xl border border-slate-100 bg-white p-2">
                <svg
                  viewBox="0 0 760 270"
                  className="h-full w-full"
                  role="img"
                  aria-label="Prediction accuracy trend"
                >
                  {[0, 25, 50, 75, 100].map(
                    (value) => {
                      const y =
                        18 +
                        ((100 - value) / 100) *
                          222;

                      return (
                        <g key={value}>
                          <line
                            x1="42"
                            y1={y}
                            x2="744"
                            y2={y}
                            stroke="#e2e8f0"
                            strokeWidth="1"
                          />

                          <text
                            x="34"
                            y={y + 3}
                            textAnchor="end"
                            className="fill-slate-400 text-[9px]"
                          >
                            {value}%
                          </text>
                        </g>
                      );
                    },
                  )}

                  {areaPath && (
                    <path
                      d={areaPath}
                      fill="currentColor"
                      className="text-cyan-50"
                    />
                  )}

                  {linePath && (
                    <path
                      d={linePath}
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="3"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="text-cyan-500"
                    />
                  )}

                  {chartPoints.map(
                    (point, index) => (
                      <g
                        key={`${point.label}-${index}`}
                      >
                        <circle
                          cx={point.x}
                          cy={point.y}
                          r="4"
                          fill="white"
                          stroke="currentColor"
                          strokeWidth="2.5"
                          className="text-cyan-500"
                        />

                        <text
                          x={point.x}
                          y="258"
                          textAnchor="middle"
                          className="fill-slate-400 text-[8px]"
                        >
                          {point.label}
                        </text>
                      </g>
                    ),
                  )}
                </svg>
              </div>
            </div>

            {/* Compact statistics */}
            <div className="grid grid-cols-2 gap-2 xl:grid-cols-1">
              <div className="rounded-xl border border-cyan-100 bg-cyan-50/60 p-3">
                <p className="text-[9px] font-semibold uppercase tracking-wide text-cyan-700">
                  Accuracy
                </p>
                <p className="mt-1 text-xl font-bold text-slate-900">
                  {latestAccuracy}%
                </p>
              </div>

              <div className="rounded-xl border border-green-100 bg-green-50 p-3">
                <p className="text-[9px] font-semibold uppercase tracking-wide text-green-700">
                  Correct
                </p>
                <p className="mt-1 text-xl font-bold text-slate-900">
                  {counts.correct}
                </p>
              </div>

              <div className="rounded-xl border border-slate-200 bg-white p-3">
                <p className="text-[9px] font-semibold uppercase tracking-wide text-slate-500">
                  Validated
                </p>
                <p className="mt-1 text-xl font-bold text-slate-900">
                  {validatedCount}
                </p>
              </div>

              <div className="rounded-xl border border-slate-200 bg-white p-3">
                <p className="text-[9px] font-semibold uppercase tracking-wide text-slate-500">
                  Checkpoints
                </p>
                <p className="mt-1 text-xl font-bold text-slate-900">
                  {history.length}
                </p>
              </div>
            </div>
          </div>

          {/* Outcome breakdown */}
          <div className="mt-4 flex items-center gap-2 border-t border-slate-200 pt-3">
            <span className="text-[9px] font-semibold uppercase tracking-wide text-slate-400">
              Outcomes
            </span>

            <span className="rounded-full bg-green-50 px-2 py-1 text-[9px] font-semibold text-green-700">
              Correct {counts.correct}
            </span>

            <span className="rounded-full bg-amber-50 px-2 py-1 text-[9px] font-semibold text-amber-700">
              Partial {counts.partial}
            </span>

            <span className="rounded-full bg-red-50 px-2 py-1 text-[9px] font-semibold text-red-700">
              Incorrect {counts.incorrect}
            </span>

            <span className="rounded-full bg-slate-100 px-2 py-1 text-[9px] font-semibold text-slate-500">
              Not observed {counts.notObserved}
            </span>
          </div>

          {/* Recent activity */}
          <div className="mt-4 border-t border-slate-200 pt-3">
            <div className="mb-2 flex items-center justify-between">
              <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-slate-500">
                Recent outcomes
              </p>

              <span className="text-[9px] text-slate-400">
                {outcomeLog.length} records
              </span>
            </div>

            <div className="max-h-[180px] space-y-1.5 overflow-y-auto">
              {outcomeLog.slice(0, 8).map((item) => (
                <div
                  key={item.id}
                  className="flex items-center justify-between gap-3 rounded-lg border border-slate-200 bg-white px-3 py-2"
                >
                  <div className="min-w-0">
                    <p className="truncate text-[10px] font-semibold text-slate-700">
                      {item.predictedLocationName}
                    </p>

                    <p className="mt-0.5 text-[8px] text-slate-400">
                      {item.recordedAt}
                      {item.actualLocation
                        ? ` · ${item.actualLocation}`
                        : ""}
                    </p>
                  </div>

                  <div className="flex shrink-0 items-center gap-2">
                    <span
                      className={`rounded-full border px-2 py-1 text-[8px] font-semibold ${getOutcomeClass(
                        item.status,
                      )}`}
                    >
                      {item.status}
                    </span>

                    <button
                      type="button"
                      onClick={() => handleEdit(item)}
                      className="rounded-md p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-700"
                      title="Edit outcome"
                    >
                      <Pencil className="h-3 w-3" />
                    </button>
                  </div>
                </div>
              ))}

              {outcomeLog.length === 0 && (
                <div className="rounded-lg border border-dashed border-slate-200 bg-white py-6 text-center">
                  <p className="text-[10px] text-slate-400">
                    No outcomes recorded yet
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export { OUTCOME_STORAGE_KEY, OUTCOME_EVENT_NAME };