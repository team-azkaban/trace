import { useEffect, useMemo, useState } from "react";
import type { ReactNode } from "react";
import {
  AlertTriangle,
  Check,
  ChevronDown,
  ChevronUp,
  Clock3,
  MapPin,
  Play,
  RotateCcw,
  ShieldCheck,
  Target,
  Users,
  ZoomIn,
  ZoomOut,
} from "lucide-react";
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

type TeamType = "Patrol" | "Branch" | "Cyber";
type ResourceKey = "patrol" | "branch" | "cyber";

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

const teamMeta: Record<ResourceKey, { label: TeamType; color: string; glow: string }> = {
  patrol: {
    label: "Patrol",
    color: "bg-cyan-500",
    glow: "shadow-cyan-500/40",
  },
  branch: {
    label: "Branch",
    color: "bg-violet-500",
    glow: "shadow-violet-500/40",
  },
  cyber: {
    label: "Cyber",
    color: "bg-emerald-500",
    glow: "shadow-emerald-500/40",
  },
};

const defaultResourceLevels: Record<ResourceKey, number> = {
  patrol: 68,
  branch: 52,
  cyber: 81,
};

const teamResponseTimes: Record<ResourceKey, number> = {
  patrol: 18,
  branch: 11,
  cyber: 7,
};

const teamShortageThresholds: Record<ResourceKey, number> = {
  patrol: 45,
  branch: 50,
  cyber: 55,
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

function getCanvasPosition(index: number, total: number) {
  const columns = total > 6 ? 4 : 3;
  const column = index % columns;
  const row = Math.floor(index / columns);
  return {
    x: 16 + (column * 68) / Math.max(columns - 1, 1),
    y: 18 + (row * 64) / Math.max(Math.ceil(total / columns) - 1, 1),
  };
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
  const [resourceLevels, setResourceLevels] = useState(defaultResourceLevels);
  const [teamDetailsExpanded, setTeamDetailsExpanded] = useState(true);

  const [displayedCoverage, setDisplayedCoverage] = useState(0);
  const [mapZoom, setMapZoom] = useState(1);
  const [isSimulating, setIsSimulating] = useState(false);
  const [simulationStep, setSimulationStep] = useState(-1);

  useEffect(() => {
    const initialSelection = allLocations
      .slice(0, scenarioSize)
      .map((location) => location.id);

    // The scenario change intentionally resets the selectable deployment points.
    // eslint-disable-next-line react-hooks/set-state-in-effect
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
    const resourceAverage =
      (resourceLevels.patrol + resourceLevels.branch + resourceLevels.cyber) / 3;
    const resourceBoost = (resourceAverage - 50) * 0.26;

    const adjustedCoverage =
      activeScenario.baselineCoverage * selectionQuality + resourceBoost;

    return Math.round(clamp(adjustedCoverage, 20, 99));
  }, [
    activeScenario,
    allLocations,
    scenarioSize,
    selectedLocations,
    resourceLevels,
  ]);

  const scenarioComparison = useMemo(
    () =>
      coverageScenarios.map((scenario) => {
        const averageResource =
          (resourceLevels.patrol + resourceLevels.branch + resourceLevels.cyber) / 3;
        const projectedCoverage = Math.round(
          clamp(
            scenario.baselineCoverage +
              (averageResource - 50) * 0.45 -
              (scenario.size === 3 ? 6 : scenario.size === 5 ? 2 : 0),
            25,
            99,
          ),
        );

        return {
          ...scenario,
          projectedCoverage,
        };
      }),
    [resourceLevels],
  );

  const teamWarnings = useMemo(
    () =>
      (Object.keys(teamMeta) as ResourceKey[]).filter(
        (key) => resourceLevels[key] < teamShortageThresholds[key],
      ),
    [resourceLevels],
  );

  const recommendedPlan = useMemo(() => {
    const depth = selectedLocations.length > 0 ? selectedLocations.length : scenarioSize;
    const strongestTeam =
      Object.entries(teamMeta).reduce(
        (best, [key, meta]) => {
          const current = resourceLevels[key as ResourceKey];
          if (!best || current > best.value) {
            return { key: key as ResourceKey, value: current, label: meta.label };
          }
          return best;
        },
        null as { key: ResourceKey; value: number; label: string } | null,
      );

    const totalRisk = selectedLocations.reduce(
      (total, location) => total + getLocationScore(location),
      0,
    );

    const estimatedResponse =
      Math.max(
        8,
        Math.round(
          22 -
            (resourceLevels.patrol + resourceLevels.branch + resourceLevels.cyber) / 10 +
            depth * 0.9,
        ),
      );

    return {
      team: strongestTeam?.label ?? "Patrol",
      riskCoverage: Math.max(62, Math.min(96, Math.round(displayedCoverage || simulatedCoverage))),
      responseMinutes: estimatedResponse,
      hotspots: depth,
      summary:
        strongestTeam && strongestTeam.value < 50
          ? `${strongestTeam.label} teams are under-resourced; prioritize branch dispatch before the next high-risk window.`
          : `Deploy ${Math.min(scenarioSize, depth)} priority teams across the selected hotspots with ${strongestTeam?.label ?? "Patrol"} support to maximize coverage before ${selectedLocations[0]?.predictedWindow ?? "the next cash-out window"}.`,
      criticalHotspots: selectedLocations.filter((location) => location.riskLevel === "Critical").length,
      totalRisk,
    };
  }, [selectedLocations, scenarioSize, resourceLevels, displayedCoverage, simulatedCoverage]);

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

  useEffect(() => {
    if (!isSimulating) return;

    // Start the visual deployment sequence when the user runs a scenario.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setSimulationStep(0);
    const timer = window.setInterval(() => {
      setSimulationStep((current) => {
        if (current >= selectedLocations.length - 1) {
          window.clearInterval(timer);
          setIsSimulating(false);
          return current;
        }
        return current + 1;
      });
    }, 500);

    return () => window.clearInterval(timer);
  }, [isSimulating, selectedLocations.length]);

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
    setSimulationStep(-1);
  };

  const runSimulation = () => {
    if (selectedLocations.length > 0) setIsSimulating(true);
  };

  const coverageDifference =
    activeScenario &&
    displayedCoverage !== activeScenario.baselineCoverage
      ? displayedCoverage - activeScenario.baselineCoverage
      : 0;

  const differenceText =
    coverageDifference > 0
      ? `+${coverageDifference} pts`
      : `${coverageDifference} pts`;

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
              This is a deployment simulation: pick the hotspots and team capacity,
              then estimate how much predicted cash-out risk can be covered in real time.
            </p>
          </div>
        </div>
      </div>

      <div className="p-5">
        <div className="mb-4 rounded-xl border border-cyan-100 bg-cyan-50/70 px-3 py-2 text-[11px] text-slate-700">
          <span className="font-semibold text-cyan-700">What this simulates:</span>{" "}
          select risky ATM/branch points, assign monitoring capacity, and preview how much risk coverage you gain before sending teams.
        </div>

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

        <div className="mt-4 rounded-2xl border border-slate-200 bg-slate-50/80 p-4">
          <button
            type="button"
            onClick={() => setTeamDetailsExpanded((current) => !current)}
            className="flex w-full items-center justify-between gap-3 text-left"
          >
            <div className="flex items-center gap-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-white text-slate-700 shadow-sm">
                <Users size={15} />
              </div>

              <div>
                <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-slate-500">
                  Team deployment mix
                </p>
                <p className="mt-0.5 text-sm font-semibold text-slate-800">
                  Response planning
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {teamWarnings.length > 0 && (
                <span className="inline-flex items-center gap-1 rounded-full border border-amber-200 bg-amber-50 px-2 py-1 text-[9px] font-semibold text-amber-700">
                  <AlertTriangle size={10} />
                  shortage
                </span>
              )}

              {teamDetailsExpanded ? <ChevronUp size={16} className="text-slate-500" /> : <ChevronDown size={16} className="text-slate-500" />}
            </div>
          </button>

          {teamDetailsExpanded && (
            <>
              <div className="mt-4 flex flex-wrap gap-2">
                {(Object.keys(teamMeta) as ResourceKey[]).map((key) => (
                  <span
                    key={key}
                    className={`inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-2.5 py-1 text-[10px] font-semibold text-slate-700 shadow-sm ${teamMeta[key].glow}`}
                  >
                    <span className={`h-2.5 w-2.5 rounded-full ${teamMeta[key].color}`} />
                    {teamMeta[key].label}
                  </span>
                ))}
              </div>

              <div className="mt-4 grid grid-cols-1 gap-3 md:grid-cols-3">
                {(Object.keys(teamMeta) as ResourceKey[]).map((key) => {
                  const shortage = resourceLevels[key] < teamShortageThresholds[key];
                  const responseMinutes = teamResponseTimes[key];

                  return (
                    <div
                      key={key}
                      className={`rounded-xl border p-3 shadow-sm ${shortage ? "border-amber-200 bg-amber-50/40" : "border-slate-200 bg-white"}`}
                    >
                      <div className="mb-2 flex items-center justify-between gap-2">
                        <span className="text-[10px] font-semibold uppercase tracking-[0.14em] text-slate-500">
                          {teamMeta[key].label}
                        </span>
                        <span className="text-[11px] font-bold text-slate-800">
                          {resourceLevels[key]}%
                        </span>
                      </div>

                      <div className="mb-2 flex items-center gap-1.5 text-[10px] text-slate-500">
                        <Clock3 size={11} />
                        {responseMinutes} min avg response
                      </div>

                      <input
                        type="range"
                        min={20}
                        max={100}
                        value={resourceLevels[key]}
                        onChange={(event) =>
                          setResourceLevels((current) => ({
                            ...current,
                            [key]: Number(event.target.value),
                          }))
                        }
                        className="h-2 w-full cursor-pointer accent-cyan-500"
                      />

                      {shortage && (
                        <div className="mt-2 flex items-center gap-1 text-[9px] font-semibold text-amber-700">
                          <AlertTriangle size={10} />
                          Resource shortage risk
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </>
          )}
        </div>

        <div className="mt-4 grid grid-cols-1 gap-3 md:grid-cols-3">
          {scenarioComparison.map((scenario) => {
            const isActive = scenario.size === scenarioSize;
            return (
              <div
                key={scenario.size}
                className={`rounded-2xl border p-3 transition-all ${
                  isActive
                    ? "border-cyan-200 bg-cyan-50/80 shadow-sm"
                    : "border-slate-200 bg-white"
                }`}
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="text-[10px] font-semibold uppercase tracking-[0.14em] text-slate-500">
                    {scenario.size} teams
                  </span>

                  {isActive && (
                    <span className="rounded-full border border-cyan-200 bg-white px-1.5 py-0.5 text-[9px] font-semibold text-cyan-700">
                      Active
                    </span>
                  )}
                </div>

                <div className="mt-2 text-2xl font-bold tracking-tight text-slate-900">
                  {scenario.projectedCoverage}%
                </div>

                <div className="mt-1 text-[10px] text-slate-500">
                  projected coverage
                </div>

                <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-slate-200">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-cyan-500 via-sky-500 to-emerald-400"
                    style={{ width: `${scenario.projectedCoverage}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>

        <div className="mt-4 rounded-2xl border border-emerald-200 bg-emerald-50/80 p-4">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-emerald-700">
                Recommended deployment plan
              </p>
              <h4 className="mt-2 text-base font-bold text-slate-900">
                {recommendedPlan.team} lead deployment
              </h4>
            </div>

            <div className="rounded-full border border-emerald-200 bg-white px-2.5 py-1 text-[10px] font-semibold text-emerald-700">
              {recommendedPlan.riskCoverage}% coverage
            </div>
          </div>

          <div className="mt-3 grid grid-cols-1 gap-3 md:grid-cols-3">
            <div className="rounded-xl border border-emerald-200 bg-white/80 p-3">
              <div className="text-[10px] font-semibold uppercase tracking-[0.14em] text-slate-500">
                Active hotspots
              </div>
              <div className="mt-1 text-xl font-bold text-slate-900">{recommendedPlan.hotspots}</div>
            </div>

            <div className="rounded-xl border border-emerald-200 bg-white/80 p-3">
              <div className="text-[10px] font-semibold uppercase tracking-[0.14em] text-slate-500">
                Response window
              </div>
              <div className="mt-1 text-xl font-bold text-slate-900">{recommendedPlan.responseMinutes} min</div>
            </div>

            <div className="rounded-xl border border-emerald-200 bg-white/80 p-3">
              <div className="text-[10px] font-semibold uppercase tracking-[0.14em] text-slate-500">
                Critical points
              </div>
              <div className="mt-1 text-xl font-bold text-slate-900">{recommendedPlan.criticalHotspots}</div>
            </div>
          </div>

          <p className="mt-3 text-xs leading-5 text-slate-600">
            {recommendedPlan.summary}
          </p>
        </div>

        {/* Deployment canvas and location list */}
        <div className="mt-5 grid grid-cols-1 gap-5 xl:grid-cols-[1.25fr_0.75fr]">
          <div className="overflow-hidden rounded-2xl border border-slate-200 bg-slate-950 p-4 shadow-inner">
            <div className="mb-3 flex items-start justify-between gap-4">
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-cyan-300">
                  Deployment view
                </p>
                <p className="mt-1 text-xs text-slate-300">
                  Teal rings show the risk covered by your selected teams.
                </p>
              </div>
              <div className="flex items-center gap-2">
                <button type="button" onClick={() => setMapZoom((current) => clamp(current - 0.15, 0.85, 1.5))} aria-label="Zoom out deployment view" className="rounded-lg border border-slate-700 bg-slate-900 p-1.5 text-slate-300 transition hover:border-cyan-300 hover:text-cyan-200">
                  <ZoomOut size={14} />
                </button>
                <span className="min-w-12 text-center text-[10px] font-semibold text-slate-400">{Math.round(mapZoom * 100)}%</span>
                <button type="button" onClick={() => setMapZoom((current) => clamp(current + 0.15, 0.85, 1.5))} aria-label="Zoom in deployment view" className="rounded-lg border border-slate-700 bg-slate-900 p-1.5 text-slate-300 transition hover:border-cyan-300 hover:text-cyan-200">
                  <ZoomIn size={14} />
                </button>
                <button type="button" onClick={() => setMapZoom(1)} aria-label="Reset deployment view" className="rounded-lg border border-slate-700 bg-slate-900 p-1.5 text-slate-300 transition hover:border-cyan-300 hover:text-cyan-200">
                  <RotateCcw size={14} />
                </button>
              </div>
            </div>
            <div className="relative aspect-[1.55] overflow-hidden rounded-xl border border-slate-800 bg-[radial-gradient(circle_at_50%_45%,#1e3a4b_0%,#0f202b_48%,#08141d_100%)]">
              <div className="absolute inset-0 transition-transform duration-300" style={{ transform: `scale(${mapZoom})` }}>
              <svg viewBox="0 0 100 100" className="absolute inset-0 h-full w-full" aria-label="Simulated intervention coverage map">
                <defs>
                  <pattern id="trace-grid" width="10" height="10" patternUnits="userSpaceOnUse">
                    <path d="M 10 0 L 0 0 0 10" fill="none" stroke="#8dd6e0" strokeOpacity="0.09" strokeWidth="0.35" />
                  </pattern>
                  <radialGradient id="coverage-glow" cx="50%" cy="50%" r="50%">
                    <stop offset="0%" stopColor="#67e8f9" stopOpacity="0.36" />
                    <stop offset="60%" stopColor="#22d3ee" stopOpacity="0.12" />
                    <stop offset="100%" stopColor="#22d3ee" stopOpacity="0" />
                  </radialGradient>
                </defs>
                <rect width="100" height="100" fill="url(#trace-grid)" />
                <path d="M5 78 C24 58, 20 30, 42 22 S75 30, 96 8" fill="none" stroke="#38bdf8" strokeOpacity="0.35" strokeWidth="1.1" strokeDasharray="2 3" className={isSimulating ? "animate-pulse" : ""} />
                <path d="M2 28 C28 42, 52 35, 80 76" fill="none" stroke="#67e8f9" strokeOpacity="0.18" strokeWidth="0.9" />
                <path d="M18 62 C35 48, 50 52, 78 48" fill="none" stroke="#a5f3fc" strokeOpacity="0.14" strokeWidth="1" />

                {selectedLocations.length > 1 && (
                  <polyline
                    points={selectedLocations
                      .map((location) => {
                        const targetIndex = allLocations.findIndex((item) => item.id === location.id);
                        const point = getCanvasPosition(targetIndex, allLocations.length);
                        return `${point.x},${point.y}`;
                      })
                      .join(" ")}
                    fill="none"
                    stroke="#67e8f9"
                    strokeOpacity="0.7"
                    strokeWidth="0.7"
                    strokeDasharray="2 2"
                  />
                )}

                {allLocations.map((location, index) => {
                  const position = getCanvasPosition(index, allLocations.length);
                  const selected = selectedIds.includes(location.id);
                  const selectedIndex = selectedLocations.findIndex((item) => item.id === location.id);
                  const revealed = !isSimulating || selectedIndex <= simulationStep;
                  const isCritical = location.riskLevel === "Critical";
                  const ringRadius = selected && revealed
                    ? isCritical ? 12 : location.riskLevel === "High" ? 10 : 8
                    : 0;

                  return (
                    <g key={location.id} role="button" tabIndex={0} aria-label={`${selected ? "Remove" : "Add"} ${location.name} hotspot`} onClick={() => toggleLocation(location.id)} onKeyDown={(event) => { if (event.key === "Enter" || event.key === " ") toggleLocation(location.id); }} className="cursor-pointer">
                      {selected && revealed && (
                        <>
                          <circle cx={position.x} cy={position.y} r={ringRadius + 6} fill="url(#coverage-glow)" />
                          <circle cx={position.x} cy={position.y} r={ringRadius} fill="none" stroke="#67e8f9" strokeOpacity="0.7" strokeWidth="0.75" strokeDasharray="1.2 1.4" />
                        </>
                      )}

                      <circle cx={position.x} cy={position.y} r={isCritical ? "2.8" : "2.2"} fill={selected && revealed ? "#67e8f9" : isCritical ? "#fb7185" : location.riskLevel === "High" ? "#fb923c" : "#fbbf24"} stroke="#fff" strokeOpacity="0.8" strokeWidth="0.7" />

                      {selected && revealed && (
                        <>
                          <circle cx={position.x} cy={position.y} r="1" fill="#ecfeff" />
                          <rect x={position.x + 2.5} y={position.y - 7} width="11" height="5" rx="2.2" fill="#0f172a" fillOpacity="0.8" stroke="#67e8f9" strokeOpacity="0.7" />
                          <text x={position.x + 7} y={position.y - 3.4} textAnchor="middle" fill="#ecfeff" fontSize="2.3" fontWeight="700">
                            {selectedLocations.findIndex((item) => item.id === location.id) + 1}
                          </text>
                        </>
                      )}
                    </g>
                  );
                })}
              </svg>
              </div>
              <div className={`absolute inset-y-0 left-0 w-1 bg-cyan-300/70 shadow-[0_0_24px_rgba(103,232,249,0.8)] transition-transform duration-1000 ${isSimulating ? "translate-x-[calc(100%+500px)]" : "-translate-x-full"}`} />
              <div className="absolute bottom-3 left-3 flex flex-wrap gap-2 text-[10px] text-slate-300">
                <span className="inline-flex items-center gap-1.5 rounded-full border border-slate-700 bg-slate-900/80 px-2 py-1"><span className="h-2 w-2 rounded-full bg-rose-400" />Critical hotspot</span>
                <span className="inline-flex items-center gap-1.5 rounded-full border border-slate-700 bg-slate-900/80 px-2 py-1"><span className="h-2 w-2 rounded-full border border-cyan-200 bg-cyan-400/30" />Selected coverage</span>
              </div>
              <div className="absolute right-3 top-3 rounded-xl border border-cyan-300/20 bg-slate-950/70 px-3 py-2 text-right backdrop-blur">
                <p className="text-2xl font-bold tracking-tight text-white">{displayedCoverage}%</p>
                <p className="text-[9px] uppercase tracking-wider text-cyan-200">risk covered</p>
              </div>
            </div>
            <div className="mt-3 flex items-center justify-between gap-3">
              <p className="text-[10px] text-slate-400">
                {isSimulating
                  ? `Deploying team ${Math.max(simulationStep + 1, 1)} of ${selectedLocations.length}...`
                  : "Click a hotspot or monitoring point to edit the scenario."}
              </p>
              <button
                type="button"
                onClick={runSimulation}
                disabled={isSimulating || selectedLocations.length === 0}
                className="inline-flex shrink-0 items-center gap-2 rounded-xl bg-cyan-400 px-3 py-2 text-[11px] font-bold text-slate-950 transition hover:bg-cyan-300 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <Play size={13} fill="currentColor" />
                {isSimulating ? "Simulating..." : "Run coverage simulation"}
              </button>
            </div>
            <div className="mt-3 grid grid-cols-3 gap-2">
              <ImpactStat icon={<Target size={13} />} label="Points active" value={`${selectedLocations.length}/${scenarioSize}`} />
              <ImpactStat icon={<ShieldCheck size={13} />} label="Critical covered" value={`${selectedLocations.filter((location) => location.riskLevel === "Critical").length}`} />
              <ImpactStat icon={<Users size={13} />} label="Scenario delta" value={coverageDifference === 0 ? "Baseline" : differenceText} />
            </div>
          </div>

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

function ImpactStat({
  icon,
  label,
  value,
}: {
  icon: ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-xl border border-slate-800 bg-slate-900/80 px-3 py-2.5">
      <div className="flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-wide text-slate-400">
        {icon}
        {label}
      </div>
      <p className="mt-1 text-sm font-bold text-white">{value}</p>
    </div>
  );
}