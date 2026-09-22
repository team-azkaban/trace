import { useEffect, useMemo, useState } from "react";
import { Check, Info, MapPin, ShieldCheck } from "lucide-react";
import type { PredictedLocation } from "../../data/cases.mock";
import {
  additionalCoverageHotspots,
  coverageScenarios,
  getCoveragePriorityScore,
  type CoverageScenarioSize,
} from "./coverage.mock";

type CoverageSimulatorProps = {
  predictedLocations: PredictedLocation[];
};

type SimulatorLocation = {
  id: string;
  name: string;
  type: "ATM" | "Branch";
  area: string;
  confidence: number;
  predictedWindow: string;
  riskLevel: PredictedLocation["riskLevel"];
  bank: string;
  isAdditional: boolean;
};

const scenarioColors: Record<
  CoverageScenarioSize,
  {
    active: string;
    inactive: string;
    dot: string;
    ring: string;
    ringTrack: string;
    soft: string;
    text: string;
  }
> = {
  3: {
    active:
      "bg-blue-600 text-white border-blue-600 shadow-sm shadow-blue-200",
    inactive:
      "bg-white text-blue-700 border-blue-200 hover:bg-blue-50",
    dot: "bg-blue-500",
    ring: "text-blue-500",
    ringTrack: "text-blue-100",
    soft: "bg-blue-50/60 border-blue-100",
    text: "text-blue-700",
  },
  5: {
    active:
      "bg-red-600 text-white border-red-600 shadow-sm shadow-red-200",
    inactive:
      "bg-white text-red-700 border-red-200 hover:bg-red-50",
    dot: "bg-red-500",
    ring: "text-red-500",
    ringTrack: "text-red-100",
    soft: "bg-red-50/50 border-red-100",
    text: "text-red-700",
  },
  8: {
  active:
    "bg-green-600 text-white border-green-600 shadow-sm shadow-green-200",
  inactive:
    "bg-white text-green-700 border-green-200 hover:bg-green-50",
  dot: "bg-green-500",
  ring: "text-green-500",
  ringTrack: "text-green-100",
  soft: "bg-green-50/50 border-green-100",
  text: "text-green-700",
},
};

const riskBadgeClasses: Record<PredictedLocation["riskLevel"], string> = {
  Critical: "bg-red-50 text-red-700 border-red-200",
  High: "bg-orange-50 text-orange-700 border-orange-200",
  Medium: "bg-amber-50 text-amber-700 border-amber-200",
  Low: "bg-green-50 text-green-700 border-green-200",
};

function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max);
}

function getLocationScore(location: SimulatorLocation) {
  return getCoveragePriorityScore({
    confidence: location.confidence,
    riskLevel: location.riskLevel,
  });
}

export function CoverageSimulator({
  predictedLocations,
}: CoverageSimulatorProps) {
  const allLocations = useMemo<SimulatorLocation[]>(() => {
    const originalLocations: SimulatorLocation[] = predictedLocations.map(
      (location) => ({
        id: location.id,
        name: location.name,
        type: location.type,
        area: location.area,
        confidence: location.confidence,
        predictedWindow: location.predictedWindow,
        riskLevel: location.riskLevel,
        bank: location.bank,
        isAdditional: false,
      }),
    );

    const extraLocations: SimulatorLocation[] =
      additionalCoverageHotspots.map((location) => ({
        ...location,
        isAdditional: true,
      }));

    return [...originalLocations, ...extraLocations];
  }, [predictedLocations]);

  const [scenarioSize, setScenarioSize] =
    useState<CoverageScenarioSize>(3);

  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  const [displayedCoverage, setDisplayedCoverage] = useState(0);

  useEffect(() => {
    const initialSelection = allLocations
      .slice(0, scenarioSize)
      .map((location) => location.id);

    setSelectedIds(initialSelection);
  }, [allLocations, scenarioSize]);

  const selectedLocations = useMemo(
    () =>
      selectedIds
        .map((id) => allLocations.find((location) => location.id === id))
        .filter(Boolean) as SimulatorLocation[],
    [selectedIds, allLocations],
  );

  const activeScenario = coverageScenarios.find(
    (scenario) => scenario.size === scenarioSize,
  );

  const simulatedCoverage = useMemo(() => {
    if (!activeScenario || selectedLocations.length === 0) {
      return 0;
    }

    const defaultLocations = allLocations.slice(0, scenarioSize);

    const selectedScore = selectedLocations.reduce(
      (total, location) => total + getLocationScore(location),
      0,
    );

    const defaultScore = defaultLocations.reduce(
      (total, location) => total + getLocationScore(location),
      0,
    );

    if (defaultScore === 0) {
      return activeScenario.baselineCoverage;
    }

    const selectionQuality = selectedScore / defaultScore;

    const adjustedCoverage =
      activeScenario.baselineCoverage * selectionQuality;

    return Math.round(clamp(adjustedCoverage, 20, 99));
  }, [
    activeScenario,
    allLocations,
    scenarioSize,
    selectedLocations,
  ]);

  useEffect(() => {
    let animationFrame = 0;

    const start = displayedCoverage;
    const target = simulatedCoverage;
    const duration = 500;
    const startTime = performance.now();

    const animate = (currentTime: number) => {
      const progress = Math.min(
        (currentTime - startTime) / duration,
        1,
      );

      const eased =
        progress < 0.5
          ? 2 * progress * progress
          : 1 - Math.pow(-2 * progress + 2, 2) / 2;

      const nextValue = Math.round(
        start + (target - start) * eased,
      );

      setDisplayedCoverage(nextValue);

      if (progress < 1) {
        animationFrame = requestAnimationFrame(animate);
      }
    };

    animationFrame = requestAnimationFrame(animate);

    return () => cancelAnimationFrame(animationFrame);
    // We intentionally only react to the target changing.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [simulatedCoverage]);

  const toggleLocation = (id: string) => {
    setSelectedIds((current) => {
      if (current.includes(id)) {
        return current.filter((item) => item !== id);
      }

      if (current.length >= scenarioSize) {
        return current;
      }

      return [...current, id];
    });
  };

  const selectScenario = (size: CoverageScenarioSize) => {
    setScenarioSize(size);
  };

  const circumference = 2 * Math.PI * 54;

  const dashOffset =
    circumference - (displayedCoverage / 100) * circumference;

  const coverageDifference =
    activeScenario &&
    displayedCoverage !== activeScenario.baselineCoverage
      ? displayedCoverage - activeScenario.baselineCoverage
      : 0;

  const differenceText =
    coverageDifference > 0
      ? `+${coverageDifference} pts`
      : `${coverageDifference} pts`;

  const activeColors = scenarioColors[scenarioSize];

  return (
    <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
      {/* Header */}
      <div className="border-b border-slate-100 px-5 py-4">
        <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
          <div>
            <div className="flex items-center gap-2">
              <ShieldCheck className="h-5 w-5 text-cyan-600" />

              <h3 className="text-sm font-semibold text-slate-900">
                Intervention Coverage Simulator
              </h3>
            </div>

            <p className="mt-1 max-w-2xl text-xs leading-5 text-slate-500">
              Test different monitoring combinations and see how the
              simulated operational coverage changes.
            </p>
          </div>
        </div>
      </div>

      <div className="p-5">
        {/* Scenario selector */}
        <div>
          <div className="mb-2 flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wide text-slate-500">
              Monitoring capacity
            </span>

            <span className="text-xs text-slate-400">
              Select up to {scenarioSize} locations
            </span>
          </div>

          <div className="grid grid-cols-3 gap-2">
            {coverageScenarios.map((scenario) => {
              const colors = scenarioColors[scenario.size];
              const active = scenario.size === scenarioSize;

              return (
                <button
                  key={scenario.size}
                  type="button"
                  onClick={() => selectScenario(scenario.size)}
                  className={`rounded-xl border px-3 py-2.5 text-xs font-semibold transition-all ${
                    active ? colors.active : colors.inactive
                  }`}
                >
                  <span className="flex items-center justify-center gap-2">
                    <span
                      className={`h-2 w-2 rounded-full ${
                        active ? "bg-white" : colors.dot
                      }`}
                    />

                    {scenario.label}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Main content */}
        <div className="mt-5 grid grid-cols-1 gap-6 lg:grid-cols-[0.9fr_1.1fr]">
          {/* Coverage ring */}
          <div
            className={`flex flex-col items-center justify-center rounded-2xl border p-6 transition-colors duration-300 ${activeColors.soft}`}
          >
            <div className="relative h-48 w-48">
              <svg
                className="h-full w-full -rotate-90"
                viewBox="0 0 120 120"
              >
                <circle
                  cx="60"
                  cy="60"
                  r="54"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="9"
                  className={activeColors.ringTrack}
                />

                <circle
                  cx="60"
                  cy="60"
                  r="54"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="9"
                  strokeLinecap="round"
                  className={`${activeColors.ring} transition-all duration-300`}
                  strokeDasharray={circumference}
                  strokeDashoffset={dashOffset}
                />
              </svg>

              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-4xl font-bold tracking-tight text-slate-900">
                  {displayedCoverage}%
                </span>

                <span className="mt-1 text-xs font-medium text-slate-500">
                  operational coverage
                </span>
              </div>
            </div>

            <div className="mt-3 text-center">
              <p className="text-xs font-semibold text-slate-700">
                {selectedLocations.length} of {scenarioSize} monitoring
                points selected
              </p>

              <p className="mt-1 text-[11px] text-slate-400">
                {coverageDifference === 0
                  ? "Baseline configuration"
                  : `${differenceText} vs baseline`}
              </p>
            </div>
          </div>

          {/* Location list */}
          <div>
            <div className="mb-3 flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Monitoring points
                </p>

                <p className="mt-1 text-xs text-slate-400">
                  Choose the locations you want field teams to monitor.
                </p>
              </div>

              <div className="rounded-full bg-slate-100 px-2.5 py-1 text-[11px] font-semibold text-slate-600">
                {selectedLocations.length}/{scenarioSize}
              </div>
            </div>

            <div className="max-h-[390px] space-y-2 overflow-y-auto pr-1">
              {allLocations.map((location) => {
                const selected = selectedIds.includes(location.id);

                const disabled =
                  !selected &&
                  selectedLocations.length >= scenarioSize;

                return (
                  <button
                    key={location.id}
                    type="button"
                    onClick={() => toggleLocation(location.id)}
                    disabled={disabled}
                    className={`w-full rounded-xl border p-3 text-left transition-all ${
                      selected
                        ? "border-cyan-300 bg-cyan-50/60 shadow-sm"
                        : disabled
                          ? "cursor-not-allowed border-slate-100 bg-slate-50 opacity-50"
                          : "border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50"
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <div
                        className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-md border ${
                          selected
                            ? "border-cyan-600 bg-cyan-600 text-white"
                            : "border-slate-300 bg-white"
                        }`}
                      >
                        {selected && <Check className="h-3.5 w-3.5" />}
                      </div>

                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <p className="text-xs font-semibold text-slate-800">
                            {location.name}
                          </p>

                          <span
                            className={`rounded-full border px-1.5 py-0.5 text-[9px] font-medium ${
                              riskBadgeClasses[location.riskLevel]
                            }`}
                          >
                            {location.riskLevel}
                          </span>

                          {location.isAdditional && (
                            <span className="rounded-full border border-slate-200 bg-slate-100 px-1.5 py-0.5 text-[9px] font-medium text-slate-500">
                              Simulator
                            </span>
                          )}
                        </div>

                        <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-[10px] text-slate-500">
                          <span className="inline-flex items-center gap-1">
                            <MapPin className="h-3 w-3" />
                            {location.area}
                          </span>

                          <span>{location.confidence}% confidence</span>

                          <span>{location.predictedWindow}</span>
                        </div>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>

            {selectedLocations.length >= scenarioSize && (
              <p className="mt-3 text-[10px] text-slate-400">
                Maximum capacity reached. Unselect a location to
                choose another.
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}