import { useEffect, useMemo, useState } from "react";
import {
  Check,
  ChevronDown,
  Clock3,
  MapPin,
  Pencil,
  Save,
  Target,
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

type OutcomeTrackerProps = {
  outcome: Outcome;
  caseId: string;
  predictedLocations: PredictedLocation[];
};

const outcomeOptions: {
  value: OutcomeStatus;
  label: string;
  description: string;
  classes: string;
}[] = [
  {
    value: "Correct",
    label: "Correct",
    description: "Prediction matched the observed event.",
    classes:
      "border-green-200 bg-green-50 text-green-700 hover:bg-green-100",
  },
  {
    value: "Partial",
    label: "Partial",
    description: "Location/time was close but not exact.",
    classes:
      "border-amber-200 bg-amber-50 text-amber-700 hover:bg-amber-100",
  },
  {
    value: "Incorrect",
    label: "Incorrect",
    description: "Observed event did not match the prediction.",
    classes:
      "border-red-200 bg-red-50 text-red-700 hover:bg-red-100",
  },
  {
    value: "Not Observed",
    label: "Not Observed",
    description: "No field observation was available.",
    classes:
      "border-slate-200 bg-slate-50 text-slate-600 hover:bg-slate-100",
  },
];

function readStoredLog(): OutcomeLogItem[] {
  try {
    const stored = localStorage.getItem(OUTCOME_STORAGE_KEY);

    if (!stored) {
      return mockOutcomeLog;
    }

    const parsed = JSON.parse(stored);

    if (!Array.isArray(parsed)) {
      return mockOutcomeLog;
    }

    return parsed;
  } catch {
    return mockOutcomeLog;
  }
}

function persistLog(log: OutcomeLogItem[]) {
  localStorage.setItem(OUTCOME_STORAGE_KEY, JSON.stringify(log));

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

  const [outcomeLog, setOutcomeLog] = useState<OutcomeLogItem[]>(
    () => readStoredLog(),
  );

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
    counts.correct + counts.partial + counts.incorrect;

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

  const resetForm = () => {
    setSelectedStatus("Not Observed");
    setActualLocation("");
    setActualTime("");
    setEditingId(null);
  };

  const handleSaveOutcome = () => {
    if (!selectedPrediction) {
      return;
    }

    const existingIndex = editingId
      ? outcomeLog.findIndex((item) => item.id === editingId)
      : -1;

    const nextItem: OutcomeLogItem = {
      id: editingId ?? createOutcomeId(),
      caseId,
      predictionId:
        outcome.predictionId || `PRED-${caseId}`,
      predictedLocationId: selectedPrediction.id,
      predictedLocationName: selectedPrediction.name,
      predictedWindow: selectedPrediction.predictedWindow,
      actualLocation:
        actualLocation.trim() || undefined,
      actualTime: actualTime || undefined,
      status: selectedStatus,
      recordedAt: formatRecordedAt(),
    };

    let nextLog: OutcomeLogItem[];

    if (existingIndex >= 0) {
      nextLog = [...outcomeLog];
      nextLog[existingIndex] = nextItem;
    } else {
      // New outcomes are always added at the top.
      nextLog = [nextItem, ...outcomeLog];
    }

    setOutcomeLog(nextLog);
    persistLog(nextLog);

    setSuccessMessage(
      editingId
        ? "Outcome updated successfully"
        : "Outcome recorded successfully",
    );

    resetForm();

    window.setTimeout(() => {
      setSuccessMessage("");
    }, 2500);
  };

  const handleEdit = (item: OutcomeLogItem) => {
    const matchingPrediction = predictedLocations.find(
      (location) => location.id === item.predictedLocationId,
    );

    if (matchingPrediction) {
      setSelectedPredictionId(matchingPrediction.id);
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
    <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
      {/* Header */}
      <div className="border-b border-slate-100 px-5 py-4">
        <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
          <div>
            <div className="flex items-center gap-2">
              <Target className="h-5 w-5 text-cyan-600" />

              <h3 className="text-sm font-semibold text-slate-900">
                Outcome & Learning Tracker
              </h3>
            </div>

            <p className="mt-1 text-xs leading-5 text-slate-500">
              Validate any predicted location against field
              observations and feed the result back into the learning
              loop.
            </p>
          </div>

          <div className="rounded-xl border border-cyan-100 bg-cyan-50/60 px-4 py-2 text-right">
            <p className="text-[10px] uppercase tracking-wide text-cyan-600">
              Current accuracy
            </p>

            <p className="text-lg font-bold text-slate-900">
              {currentAccuracy}%
            </p>
          </div>
        </div>
      </div>

      {/* Main 60 / 40 layout */}
      <div className="grid grid-cols-1 lg:grid-cols-[1.5fr_1fr] lg:items-stretch">
        {/* LEFT — Outcome entry */}
        <div
          id="outcome-tracker-form"
          className="space-y-5 p-5 lg:border-r lg:border-slate-100"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-cyan-600">
                Validation
              </p>

              <p className="mt-1 text-xs text-slate-400">
                Record what happened in the field.
              </p>
            </div>

            <span className="rounded-full bg-slate-100 px-2.5 py-1 text-[10px] font-semibold text-slate-500">
              {validatedCount} validated
            </span>
          </div>

          {/* Prediction selector */}
          <div>
            <label className="mb-2 block text-xs font-semibold uppercase tracking-wide text-slate-500">
              Prediction to validate
            </label>

            <div className="relative">
              <select
                value={selectedPredictionId}
                onChange={(event) =>
                  setSelectedPredictionId(event.target.value)
                }
                className="w-full appearance-none rounded-xl border border-slate-200 bg-white px-3 py-3 pr-10 text-xs font-medium text-slate-800 outline-none transition focus:border-cyan-400 focus:ring-2 focus:ring-cyan-100"
              >
                {predictedLocations.map((location) => (
                  <option key={location.id} value={location.id}>
                    {location.name} — {location.area} ·{" "}
                    {location.confidence}% confidence
                  </option>
                ))}
              </select>

              <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            </div>
          </div>

          {/* Selected prediction */}
          {selectedPrediction && (
            <div className="rounded-xl border border-cyan-100 bg-cyan-50/50 p-4">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="text-sm font-semibold text-slate-900">
                    {selectedPrediction.name}
                  </p>

                  <p className="mt-1 text-xs text-slate-500">
                    {selectedPrediction.bank} ·{" "}
                    {selectedPrediction.area}
                  </p>
                </div>

                <span
                  className={`rounded-full border px-2 py-1 text-[10px] font-semibold ${getRiskClass(
                    selectedPrediction.riskLevel,
                  )}`}
                >
                  {selectedPrediction.riskLevel} risk
                </span>
              </div>

              <div className="mt-4 grid grid-cols-3 gap-3">
                <div>
                  <p className="text-[10px] text-slate-400">
                    Confidence
                  </p>

                  <p className="mt-1 text-xs font-semibold text-slate-700">
                    {selectedPrediction.confidence}%
                  </p>
                </div>

                <div>
                  <p className="text-[10px] text-slate-400">
                    Predicted window
                  </p>

                  <p className="mt-1 text-xs font-semibold text-slate-700">
                    {selectedPrediction.predictedWindow}
                  </p>
                </div>

                <div>
                  <p className="text-[10px] text-slate-400">
                    Location type
                  </p>

                  <p className="mt-1 text-xs font-semibold text-slate-700">
                    {selectedPrediction.type}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Actual observation */}
          <div>
            <div className="mb-2 flex items-center gap-2">
              <MapPin className="h-3.5 w-3.5 text-slate-400" />

              <label className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                Actual observed location
              </label>
            </div>

            <input
              value={actualLocation}
              onChange={(event) =>
                setActualLocation(event.target.value)
              }
              placeholder="e.g. HDFC ATM — Okhla"
              className="w-full rounded-xl border border-slate-200 bg-white px-3 py-3 text-xs text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-cyan-400 focus:ring-2 focus:ring-cyan-100"
            />

            <p className="mt-1 text-[10px] text-slate-400">
              Leave empty when the field team could not establish the
              actual location.
            </p>
          </div>

          {/* Actual time */}
          <div>
            <div className="mb-2 flex items-center gap-2">
              <Clock3 className="h-3.5 w-3.5 text-slate-400" />

              <label className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                Actual observed time
              </label>
            </div>

            <input
              type="time"
              value={actualTime}
              onChange={(event) =>
                setActualTime(event.target.value)
              }
              className="w-full rounded-xl border border-slate-200 bg-white px-3 py-3 text-xs text-slate-800 outline-none transition focus:border-cyan-400 focus:ring-2 focus:ring-cyan-100"
            />
          </div>

          {/* Outcome buttons */}
          <div>
            <label className="mb-2 block text-xs font-semibold uppercase tracking-wide text-slate-500">
              Field outcome
            </label>

            <div className="grid grid-cols-2 gap-2">
              {outcomeOptions.map((option) => {
                const active = selectedStatus === option.value;

                return (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => setSelectedStatus(option.value)}
                    className={`rounded-xl border p-3 text-left transition-all ${
                      active
                        ? `${option.classes} ring-2 ring-offset-1 ring-cyan-100`
                        : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-semibold">
                        {option.label}
                      </span>

                      {active && (
                        <span className="flex h-4 w-4 items-center justify-center rounded-full bg-white">
                          <Check className="h-3 w-3" />
                        </span>
                      )}
                    </div>

                    <p className="mt-1 text-[10px] leading-4 opacity-75">
                      {option.description}
                    </p>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Save */}
          <div className="flex flex-col gap-2 border-t border-slate-100 pt-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              {successMessage ? (
                <div className="flex items-center gap-2 rounded-lg bg-green-50 px-3 py-2 text-[11px] font-medium text-green-700">
                  <Check className="h-3.5 w-3.5" />
                  {successMessage}
                </div>
              ) : editingId ? (
                <button
                  type="button"
                  onClick={resetForm}
                  className="flex items-center gap-1.5 text-[11px] font-medium text-slate-500 hover:text-slate-700"
                >
                  <X className="h-3.5 w-3.5" />
                  Cancel edit
                </button>
              ) : (
                <p className="text-[10px] text-slate-400">
                  Saving updates this browser session and the learning
                  trend.
                </p>
              )}
            </div>

            <button
              type="button"
              onClick={handleSaveOutcome}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-slate-900 px-4 py-2.5 text-xs font-semibold text-white shadow-sm transition hover:bg-slate-800"
            >
              {editingId ? (
                <Pencil className="h-3.5 w-3.5" />
              ) : (
                <Save className="h-3.5 w-3.5" />
              )}

              {editingId ? "Update Outcome" : "Save Outcome"}
            </button>
          </div>

          {/* Outcome summary */}
          <div className="border-t border-slate-100 pt-4">
            <div className="mb-3 flex items-center justify-between">
              <p className="text-xs font-semibold text-slate-700">
                Outcome summary
              </p>

              <span className="text-[10px] text-slate-400">
                {validatedCount} validated
              </span>
            </div>

            <div className="grid grid-cols-4 gap-2">
              <div className="rounded-xl border border-green-100 bg-green-50 p-2.5">
                <p className="text-lg font-bold text-green-700">
                  {counts.correct}
                </p>

                <p className="text-[9px] text-green-600">
                  Correct
                </p>
              </div>

              <div className="rounded-xl border border-amber-100 bg-amber-50 p-2.5">
                <p className="text-lg font-bold text-amber-700">
                  {counts.partial}
                </p>

                <p className="text-[9px] text-amber-600">
                  Partial
                </p>
              </div>

              <div className="rounded-xl border border-red-100 bg-red-50 p-2.5">
                <p className="text-lg font-bold text-red-700">
                  {counts.incorrect}
                </p>

                <p className="text-[9px] text-red-600">
                  Incorrect
                </p>
              </div>

              <div className="rounded-xl border border-slate-100 bg-slate-50 p-2.5">
                <p className="text-lg font-bold text-slate-700">
                  {counts.notObserved}
                </p>

                <p className="text-[9px] text-slate-500">
                  Not observed
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT — Recent outcome log */}
        <div className="flex min-h-0 flex-col bg-slate-50/40 p-5">
          <div className="mb-4 flex shrink-0 items-start justify-between">
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-slate-500">
                Activity
              </p>

              <h4 className="mt-1 text-sm font-semibold text-slate-800">
                Recent outcome log
              </h4>
            </div>

            <span className="rounded-full border border-slate-200 bg-white px-2.5 py-1 text-[9px] font-semibold text-slate-500">
              {outcomeLog.length} records
            </span>
          </div>

          {/* Scrollable log — stays within the height of the tracker */}
          <div className="min-h-0 flex-1 overflow-y-auto pr-1 lg:max-h-[760px]">
            <div className="space-y-2">
              {outcomeLog.slice(0, 20).map((item) => (
                <div
                  key={item.id}
                  className="rounded-xl border border-slate-200 bg-white p-3 shadow-sm transition hover:border-slate-300"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="truncate text-xs font-semibold text-slate-800">
                        {item.predictedLocationName}
                      </p>

                      <p className="mt-1 text-[9px] text-slate-400">
                        Predicted window: {item.predictedWindow}
                      </p>
                    </div>

                    <span
                      className={`shrink-0 rounded-full border px-2 py-1 text-[9px] font-semibold ${getOutcomeClass(
                        item.status,
                      )}`}
                    >
                      {item.status}
                    </span>
                  </div>

                  <div className="mt-3 space-y-1.5 border-t border-slate-100 pt-2.5">
                    {item.actualLocation && (
                      <div className="flex items-start gap-2">
                        <MapPin className="mt-0.5 h-3 w-3 shrink-0 text-slate-400" />

                        <p className="text-[10px] text-slate-500">
                          <span className="font-medium text-slate-600">
                            Actual:
                          </span>{" "}
                          {item.actualLocation}
                        </p>
                      </div>
                    )}

                    {item.actualTime && (
                      <div className="flex items-center gap-2">
                        <Clock3 className="h-3 w-3 shrink-0 text-slate-400" />

                        <p className="text-[10px] text-slate-500">
                          <span className="font-medium text-slate-600">
                            Time:
                          </span>{" "}
                          {item.actualTime}
                        </p>
                      </div>
                    )}
                  </div>

                  <div className="mt-3 flex items-center justify-between border-t border-slate-100 pt-2.5">
                    <p className="text-[9px] text-slate-400">
                      {item.recordedAt}
                    </p>

                    <button
                      type="button"
                      onClick={() => handleEdit(item)}
                      title="Edit outcome"
                      className="rounded-lg border border-slate-200 bg-white p-1.5 text-slate-400 transition hover:border-slate-300 hover:text-slate-700"
                    >
                      <Pencil className="h-3 w-3" />
                    </button>
                  </div>
                </div>
              ))}

              {outcomeLog.length === 0 && (
                <div className="flex min-h-[300px] items-center justify-center rounded-xl border border-dashed border-slate-200 bg-white">
                  <div className="text-center">
                    <Target className="mx-auto h-5 w-5 text-slate-300" />

                    <p className="mt-2 text-xs font-medium text-slate-500">
                      No outcomes recorded yet
                    </p>

                    <p className="mt-1 text-[10px] text-slate-400">
                      Saved field observations will appear here.
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="mt-4 shrink-0 rounded-xl border border-cyan-100 bg-cyan-50/60 p-3">
            <div className="flex items-center gap-2">
              <div className="h-1.5 w-1.5 rounded-full bg-cyan-500" />

              <p className="text-[10px] font-semibold text-cyan-700">
                Learning signal
              </p>
            </div>

            <p className="mt-1 text-[10px] leading-4 text-cyan-700/70">
              Each saved observation updates the accuracy trend
              below in real time.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export { OUTCOME_STORAGE_KEY, OUTCOME_EVENT_NAME };