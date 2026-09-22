import { useEffect, useMemo, useState } from "react";
import { Activity, CheckCircle2, Target, TrendingUp } from "lucide-react";

import {
  calculateAccuracy,
  getOutcomeCounts,
  mockOutcomeLog,
  type OutcomeLogItem,
} from "./outcome-learning.mock";

const OUTCOME_STORAGE_KEY = "trace-outcome-log-v2";
const OUTCOME_EVENT_NAME = "trace-outcome-updated";
const HISTORY_STORAGE_KEY = "trace-accuracy-history-v1";

type AccuracyPoint = {
  label: string;
  accuracy: number;
};

const initialHistory: AccuracyPoint[] = [
  { label: "Checkpoint 1", accuracy: 61 },
  { label: "Checkpoint 2", accuracy: 64 },
  { label: "Checkpoint 3", accuracy: 63 },
  { label: "Checkpoint 4", accuracy: 68 },
  { label: "Checkpoint 5", accuracy: 70 },
  { label: "Checkpoint 6", accuracy: 69 },
  { label: "Checkpoint 7", accuracy: 72 },
  { label: "Checkpoint 8", accuracy: 74 },
];

function readOutcomeLog(): OutcomeLogItem[] {
  try {
    const stored = localStorage.getItem(OUTCOME_STORAGE_KEY);

    if (!stored) {
      return mockOutcomeLog;
    }

    const parsed = JSON.parse(stored);

    return Array.isArray(parsed) ? parsed : mockOutcomeLog;
  } catch {
    return mockOutcomeLog;
  }
}

function readHistory(): AccuracyPoint[] {
  try {
    const stored = localStorage.getItem(HISTORY_STORAGE_KEY);

    if (!stored) {
      return initialHistory;
    }

    const parsed = JSON.parse(stored);

    return Array.isArray(parsed) && parsed.length > 0
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

export function AccuracyTrend() {
  const [outcomeLog, setOutcomeLog] =
    useState<OutcomeLogItem[]>(readOutcomeLog);

  const [history, setHistory] =
    useState<AccuracyPoint[]>(readHistory);

  useEffect(() => {
    const handleOutcomeUpdate = (event: Event) => {
      const customEvent = event as CustomEvent<OutcomeLogItem[]>;

      const nextLog =
        customEvent.detail ?? readOutcomeLog();

      setOutcomeLog(nextLog);

      const nextAccuracy = calculateAccuracy(nextLog);

      setHistory((currentHistory) => {
        const lastPoint =
          currentHistory[currentHistory.length - 1];

        if (
          lastPoint &&
          lastPoint.accuracy === nextAccuracy
        ) {
          return currentHistory;
        }

        const nextHistory = [
          ...currentHistory,
          {
            label: `Checkpoint ${currentHistory.length + 1}`,
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

    return () => {
      window.removeEventListener(
        OUTCOME_EVENT_NAME,
        handleOutcomeUpdate,
      );
    };
  }, []);

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

  const latestAccuracy =
    history[history.length - 1]?.accuracy ?? currentAccuracy;

  const chartPoints = useMemo(() => {
    const width = 760;
    const height = 300;

    const paddingLeft = 48;
    const paddingRight = 20;
    const paddingTop = 24;
    const paddingBottom = 42;

    const chartWidth =
      width - paddingLeft - paddingRight;

    const chartHeight =
      height - paddingTop - paddingBottom;

    if (history.length === 0) {
      return [];
    }

    return history.map((point, index) => {
      const x =
        history.length === 1
          ? width / 2
          : paddingLeft +
            (index / (history.length - 1)) *
              chartWidth;

      const y =
        paddingTop +
        ((100 - point.accuracy) / 100) *
          chartHeight;

      return {
        ...point,
        x,
        y,
      };
    });
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
      ? `${linePath} L ${chartPoints[chartPoints.length - 1].x} 258 L ${chartPoints[0].x} 258 Z`
      : "";

  const resetSimulation = () => {
    localStorage.removeItem(HISTORY_STORAGE_KEY);

    setHistory(initialHistory);
  };

  return (
    <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
      {/* Header */}
      <div className="border-b border-slate-100 px-5 py-4">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-cyan-600" />

              <h3 className="text-sm font-semibold text-slate-900">
                Prediction Accuracy Trend
              </h3>
            </div>

            <p className="mt-1 text-xs leading-5 text-slate-500">
              Accuracy changes as field outcomes are recorded and
              incorporated into the learning loop.
            </p>
          </div>

          <button
            type="button"
            onClick={resetSimulation}
            className="text-[10px] font-medium text-slate-400 transition hover:text-slate-700"
          >
            Reset simulation
          </button>
        </div>
      </div>

      {/* 70 / 30 layout */}
      <div className="grid grid-cols-1 lg:grid-cols-[7fr_3fr]">
        {/* LEFT — Graph */}
        <div className="min-w-0 p-5 lg:border-r lg:border-slate-100">
          <div className="mb-3 flex items-center justify-between">
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-cyan-600">
                Accuracy over checkpoints
              </p>

              <p className="mt-1 text-[10px] text-slate-400">
                Model performance after validated field observations.
              </p>
            </div>

            <div className="rounded-lg bg-slate-50 px-2.5 py-1.5">
              <span className="text-[10px] font-semibold text-slate-500">
                {history.length} checkpoints
              </span>
            </div>
          </div>

          <div className="mx-auto flex h-[380px] w-full items-end justify-center overflow-hidden rounded-xl border border-slate-100 bg-slate-50/40 p-3 m-13">
  <svg
    viewBox="0 0 760 300"
    className="h-[360px] w-full"
              role="img"
              aria-label="Prediction accuracy trend chart"
            >
              {/* Horizontal grid lines */}
              {[0, 25, 50, 75, 100].map((value) => {
                const y =
                  24 +
                  ((100 - value) / 100) * 234;

                return (
                  <g key={value}>
                    <line
                      x1="48"
                      y1={y}
                      x2="740"
                      y2={y}
                      stroke="#e2e8f0"
                      strokeWidth="1"
                    />

                    <text
                      x="38"
                      y={y + 3}
                      textAnchor="end"
                      className="fill-slate-400 text-[9px]"
                    >
                      {value}%
                    </text>
                  </g>
                );
              })}

              {/* Area */}
              {areaPath && (
                <path
                  d={areaPath}
                  fill="currentColor"
                  className="text-cyan-50"
                />
              )}

              {/* Trend line */}
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

              {/* Data points */}
              {chartPoints.map((point, index) => (
                <g key={`${point.label}-${index}`}>
                  <circle
                    cx={point.x}
                    cy={point.y}
                    r="5"
                    fill="white"
                    stroke="currentColor"
                    strokeWidth="3"
                    className="text-cyan-500"
                  />

                  <text
                    x={point.x}
                    y="282"
                    textAnchor="middle"
                    className="fill-slate-400 text-[8px]"
                  >
                    {index + 1}
                  </text>
                </g>
              ))}
            </svg>
          </div>
        </div>

        {/* RIGHT — Stats */}
        <div className="bg-slate-50/40 p-5">
          <div className="mb-4">
            <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-slate-500">
              Performance
            </p>

            <h4 className="mt-1 text-sm font-semibold text-slate-800">
              Learning statistics
            </h4>

            <p className="mt-1 text-[10px] leading-4 text-slate-400">
              Current state of the prediction feedback loop.
            </p>
          </div>

          <div className="space-y-3">
            {/* Latest accuracy */}
            <div className="rounded-xl border border-cyan-100 bg-cyan-50/60 p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <TrendingUp className="h-4 w-4 text-cyan-600" />

                  <p className="text-[10px] font-semibold uppercase tracking-wide text-cyan-700">
                    Latest Accuracy
                  </p>
                </div>

                <span className="text-[9px] text-cyan-600">
                  Current
                </span>
              </div>

              <p className="mt-2 text-2xl font-bold text-slate-900">
                {latestAccuracy}%
              </p>
            </div>

            {/* Correct */}
            <div className="rounded-xl border border-green-100 bg-green-50 p-4">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-green-600" />

                <p className="text-[10px] font-semibold uppercase tracking-wide text-green-700">
                  Correct
                </p>
              </div>

              <p className="mt-2 text-2xl font-bold text-slate-900">
                {counts.correct}
              </p>

              <p className="mt-1 text-[12px] text-green-600">
                Validated predictions that matched
              </p>
            </div>

            {/* Validated */}
            <div className="rounded-xl border border-slate-200 bg-white p-4">
              <div className="flex items-center gap-2">
                <Target className="h-4 w-4 text-slate-500" />

                <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-600">
                  Validated
                </p>
              </div>

              <p className="mt-2 text-2xl font-bold text-slate-900">
                {validatedCount}
              </p>

              <p className="mt-1 text-[12px] text-slate-400">
                Correct + partial + incorrect
              </p>
            </div>

            {/* Checkpoints */}
            <div className="rounded-xl border border-indigo-100 bg-indigo-50 p-4">
              <div className="flex items-center gap-2">
                <Activity className="h-4 w-4 text-indigo-600" />

                <p className="text-[10px] font-semibold uppercase tracking-wide text-indigo-700">
                  Checkpoints
                </p>
              </div>

              <p className="mt-2 text-2xl font-bold text-slate-900">
                {history.length}
              </p>

              <p className="mt-1 text-[12px] text-indigo-600">
                Learning updates captured
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Learning loop */}
      {/* <div className="border-t border-slate-100 p-5">
        <div className="mb-3">
          <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-cyan-600">
            Learning loop
          </p>

          <p className="mt-1 text-xs text-slate-500">
            Field outcomes continuously feed back into future predictions.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-3 md:grid-cols-4">
          <div className="rounded-xl border border-slate-100 bg-slate-50 p-3">
            <p className="text-[9px] font-semibold uppercase tracking-wide text-slate-400">
              01
            </p>
            <p className="mt-1 text-xs font-semibold text-slate-700">
              Prediction
            </p>
            <p className="mt-1 text-[9px] leading-4 text-slate-400">
              System identifies likely locations and windows.
            </p>
          </div>

          <div className="rounded-xl border border-slate-100 bg-slate-50 p-3">
            <p className="text-[9px] font-semibold uppercase tracking-wide text-slate-400">
              02
            </p>
            <p className="mt-1 text-xs font-semibold text-slate-700">
              Field observation
            </p>
            <p className="mt-1 text-[9px] leading-4 text-slate-400">
              Actual location and time are recorded.
            </p>
          </div>

          <div className="rounded-xl border border-slate-100 bg-slate-50 p-3">
            <p className="text-[9px] font-semibold uppercase tracking-wide text-slate-400">
              03
            </p>
            <p className="mt-1 text-xs font-semibold text-slate-700">
              Outcome
            </p>
            <p className="mt-1 text-[9px] leading-4 text-slate-400">
              Prediction is classified as correct, partial or incorrect.
            </p>
          </div>

          <div className="rounded-xl border border-cyan-100 bg-cyan-50/60 p-3">
            <p className="text-[9px] font-semibold uppercase tracking-wide text-cyan-500">
              04
            </p>
            <p className="mt-1 text-xs font-semibold text-cyan-700">
              Learning update
            </p>
            <p className="mt-1 text-[9px] leading-4 text-cyan-700/70">
              Accuracy trend is updated for the next cycle.
            </p>
          </div>
        </div>
      </div> */}
    </section>
  );
}