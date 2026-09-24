import { useEffect, useMemo, useState } from "react";
import { Circle, CircleMarker, MapContainer, Popup, TileLayer, useMap } from "react-leaflet";
import "leaflet/dist/leaflet.css";
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
  latitude: number;
  longitude: number;
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

const MOCK_MAP_CENTER: [number, number] = [28.6139, 77.2090];

// Deterministic demo coordinates clustered around central Delhi.
// These are mock visualization coordinates, not real facility coordinates.
const MOCK_LOCATION_COORDS: Array<[number, number]> = [
  [28.6315, 77.2167],
  [28.6092, 77.2295],
  [28.5921, 77.2046],
  [28.6258, 77.1903],
  [28.5787, 77.2374],
  [28.6469, 77.2305],
  [28.6008, 77.1817],
  [28.6184, 77.2512],
];

function getMockCoordinates(index: number): [number, number] {
  return MOCK_LOCATION_COORDS[index % MOCK_LOCATION_COORDS.length];
}

function getLocationScore(location: SimulatorLocation) {
  return getCoveragePriorityScore({
    confidence: location.confidence,
    riskLevel: location.riskLevel,
  });
}



function FitMapToLocations({
  locations,
  zoom,
}: {
  locations: SimulatorLocation[];
  zoom: number;
}) {
  const map = useMap();

  useEffect(() => {
    const points = locations.map(
    (location) => [location.latitude, location.longitude] as [number, number],
  );

    if (points.length === 1) {
      map.setView(points[0], zoom);
      return;
    }

    if (points.length > 1) {
      map.fitBounds(points, { padding: [28, 28], maxZoom: 13 });
    }
  }, [locations, map, zoom]);

  return null;
}

function MapZoomController({ zoom }: { zoom: number }) {
  const map = useMap();

  useEffect(() => {
    map.setZoom(zoom);
  }, [map, zoom]);

  return null;
}

export function CoverageSimulator({
  predictedLocations,
}: CoverageSimulatorProps) {
  const allLocations = useMemo<SimulatorLocation[]>(() => {
    const originalLocations: SimulatorLocation[] = predictedLocations.map(
      (location, index) => ({
        id: location.id,
        name: location.name,
        type: location.type,
        area: location.area,
        confidence: location.confidence,
        predictedWindow: location.predictedWindow,
        riskLevel: location.riskLevel,
        bank: location.bank,
        isAdditional: false,
        latitude:
          (location as PredictedLocation & { latitude?: number; lat?: number }).latitude ??
          (location as PredictedLocation & { latitude?: number; lat?: number }).lat ??
          getMockCoordinates(index)[0],
        longitude:
          (location as PredictedLocation & { longitude?: number; lng?: number }).longitude ??
          (location as PredictedLocation & { longitude?: number; lng?: number }).lng ??
          getMockCoordinates(index)[1],
      }),
    );

    const extraLocations: SimulatorLocation[] =
      additionalCoverageHotspots.map((location, index) => {
        const [latitude, longitude] = getMockCoordinates(
          predictedLocations.length + index,
        );

        return {
          ...location,
          isAdditional: true,
          latitude:
            (location as typeof location & { latitude?: number; lat?: number }).latitude ??
            (location as typeof location & { latitude?: number; lat?: number }).lat ??
            latitude,
          longitude:
            (location as typeof location & { longitude?: number; lng?: number }).longitude ??
            (location as typeof location & { longitude?: number; lng?: number }).lng ??
            longitude,
        };
      });

    return [...originalLocations, ...extraLocations];
  }, [predictedLocations]);

  const [scenarioSize, setScenarioSize] =
    useState<CoverageScenarioSize>(3);

  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [resourceLevels, setResourceLevels] = useState(defaultResourceLevels);
  const [teamDetailsExpanded, setTeamDetailsExpanded] = useState(true);

  const [displayedCoverage, setDisplayedCoverage] = useState(0);
  const [mapZoom, setMapZoom] = useState(12);
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
      <div className="border-b border-slate-100 px-5 py-3">
  <div className="flex items-center justify-between gap-4">
    {/* Title */}
    <div className="flex min-w-0 items-center gap-2">
      <ShieldCheck className="h-4 w-4 shrink-0 text-cyan-600" />

      <h3 className="truncate text-sm font-semibold text-slate-900">
        Intervention Coverage Simulator
      </h3>
    </div>

    {/* Location / capacity tabs */}
    <div className="flex shrink-0 items-center gap-1 rounded-lg border border-slate-200 bg-slate-50 p-1">
      {coverageScenarios.map((scenario) => {
        const colors = scenarioColors[scenario.size];
        const active = scenario.size === scenarioSize;

        return (
          <button
            key={scenario.size}
            type="button"
            onClick={() => selectScenario(scenario.size)}
            className={`rounded-md px-2.5 py-1.5 text-[11px] font-semibold transition-colors ${
              active
                ? "bg-white text-slate-900 shadow-sm ring-1 ring-slate-200"
                : "text-slate-500 hover:bg-white/70 hover:text-slate-700"
            }`}
          >
            <span className="flex items-center gap-1.5">
              <span
                className={`h-1.5 w-1.5 rounded-full ${
                  active ? "bg-cyan-500" : colors.dot
                }`}
              />
              {scenario.label}
            </span>
          </button>
        );
      })}
    </div>
  </div>
</div>

      <div className="p-5">
        <div className="mb-4 rounded-xl border border-cyan-100 bg-cyan-50/70 px-3 py-2 text-[11px] text-slate-700">
          <span className="font-semibold text-cyan-700">What this simulates:</span>{" "}
          select risky ATM/branch points, assign monitoring capacity, and preview how much risk coverage you gain before sending teams.
        </div>

        {/* Scenario selector */}
       

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
              
                <p className="mt-0.5 text-sm font-semibold text-slate-800">
                  Team deployment mix
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

       

        

        {/* Deployment canvas and location list */}
        <div className="mt-5 grid grid-cols-1 gap-4 xl:grid-cols-[1.2fr_0.8fr]">
  {/* Deployment simulation */}
  <div className="overflow-hidden rounded-xl border border-slate-200 bg-white">
    <div className="border-b border-slate-100 px-4 py-3">
      <div className="flex items-center justify-between gap-3">
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-slate-500">
              Team Deployment simulation
            </p>
           
          </div>
        
        </div>

        <div className="flex shrink-0 items-center gap-1">
          <button
            type="button"
            onClick={() => setMapZoom((current) => clamp(current - 1, 9, 16))}
            aria-label="Zoom out deployment map"
            className="rounded-md border border-slate-200 p-1.5 text-slate-500 hover:bg-slate-50"
          >
            <ZoomOut size={13} />
          </button>
          <button
            type="button"
            onClick={() => setMapZoom(12)}
            aria-label="Reset deployment map"
            className="rounded-md border border-slate-200 p-1.5 text-slate-500 hover:bg-slate-50"
          >
            <RotateCcw size={13} />
          </button>
          <button
            type="button"
            onClick={() => setMapZoom((current) => clamp(current + 1, 9, 16))}
            aria-label="Zoom in deployment map"
            className="rounded-md border border-slate-200 p-1.5 text-slate-500 hover:bg-slate-50"
          >
            <ZoomIn size={13} />
          </button>
        </div>
      </div>
    </div>

    <div className="p-3">
      <div className="relative overflow-hidden rounded-lg border border-slate-200">
        <MapContainer
            center={MOCK_MAP_CENTER}
            zoom={12}
            scrollWheelZoom
            className="h-[360px] w-full"
            attributionControl
          >
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />

            <FitMapToLocations locations={allLocations} zoom={12} />
            <MapZoomController zoom={mapZoom} />

            {allLocations.map((location) => {
              const selected = selectedIds.includes(location.id);
              const selectedIndex = selectedLocations.findIndex(
                (item) => item.id === location.id,
              );
              const revealed =
                !isSimulating || selectedIndex <= simulationStep;
              const deployed = selected && revealed;

              const riskColor =
                location.riskLevel === "Critical"
                  ? "#dc2626"
                  : location.riskLevel === "High"
                    ? "#ea580c"
                    : location.riskLevel === "Medium"
                      ? "#d97706"
                      : "#16a34a";

              return (
                <div key={location.id}>
                  <Circle
                    center={[location.latitude, location.longitude]}
                    radius={
                      location.riskLevel === "Critical"
                        ? 360
                        : location.riskLevel === "High"
                          ? 300
                          : 240
                    }
                    pathOptions={{
                      color: riskColor,
                      fillColor: riskColor,
                      fillOpacity: selected ? 0.08 : 0.035,
                      opacity: selected ? 0.42 : 0.18,
                      weight: selected ? 1.5 : 1,
                      dashArray: "4 5",
                    }}
                  />

                  {deployed && (
                    <Circle
                      center={[location.latitude, location.longitude]}
                      radius={
                        location.riskLevel === "Critical"
                          ? 700
                          : location.riskLevel === "High"
                            ? 550
                            : 420
                      }
                      pathOptions={{
                        color: "#0891b2",
                        fillColor: "#22d3ee",
                        fillOpacity: 0.13,
                        weight: 2,
                      }}
                    />
                  )}

                  <CircleMarker
                    center={[location.latitude, location.longitude]}
                    radius={deployed ? 9 : location.riskLevel === "Critical" ? 8 : 6}
                    pathOptions={{
                      color: deployed ? "#0e7490" : riskColor,
                      fillColor: deployed ? "#06b6d4" : riskColor,
                      fillOpacity: 1,
                      weight: 3,
                    }}
                    eventHandlers={{
                      click: () => toggleLocation(location.id),
                    }}
                  >
                    <Popup>
                      <div className="min-w-[170px]">
                        <p className="text-xs font-semibold text-slate-900">
                          {location.name}
                        </p>
                        <p className="mt-0.5 text-[10px] text-slate-500">
                          {location.area} · {location.type} · {location.riskLevel} risk
                        </p>
                        <p className="mt-1 text-[9px] leading-4 text-slate-500">
                          Dashed zone = predicted risk area. Cyan zone = team response coverage.
                        </p>

                        <div className="mt-2 text-[10px]">
                          {deployed ? (
                            <span className="font-semibold text-cyan-700">
                              Team {selectedIndex + 1} deployed · coverage active
                            </span>
                          ) : (
                            <button
                              type="button"
                              onClick={() => toggleLocation(location.id)}
                              className="font-semibold text-cyan-700"
                            >
                              {selected ? "Remove deployment" : "Select for deployment"}
                            </button>
                          )}
                        </div>
                      </div>
                    </Popup>
                  </CircleMarker>
                </div>
              );
            })}
          </MapContainer>

        <div className="pointer-events-none absolute left-2.5 top-2.5 z-[500] flex items-center gap-2 rounded-md border border-slate-200 bg-white/95 px-2 py-1.5 text-[9px] text-slate-600 shadow-sm">
          <span className="inline-flex items-center gap-1">
            <span className="h-4 w-2 rounded-full bg-rose-600" />
            Risk hotspot
          </span>
          <span className="h-3 w-px bg-slate-200" />
          <span className="inline-flex items-center gap-1">
            <span className="h-2 w-2 rounded-full border border-cyan-600 bg-cyan-500" />
            Team
          </span>
          <span className="h-3 w-px bg-slate-200" />
          <span className="inline-flex items-center gap-1">
            <span className="h-2 w-2 rounded-full border border-cyan-500 bg-cyan-100" />
            Response coverage
          </span>
        </div>

        <div className="pointer-events-none absolute right-2.5 top-2.5 z-[500] rounded-lg border border-slate-200 bg-white px-3 py-2 text-right shadow-sm">
          <p className="text-xl font-bold tracking-tight text-slate-900">
            {displayedCoverage}%
          </p>
          <p className="text-[8px] font-semibold uppercase tracking-wider text-slate-400">
            risk covered
          </p>
        </div>

        <div className="pointer-events-none absolute bottom-2.5 right-2.5 z-[500] rounded bg-white/90 px-2 py-1 text-[8px] text-slate-400 shadow-sm">
          Demo coordinates · for simulation only
        </div>
      </div>

      <div className="mt-2.5 flex items-center justify-between gap-3">
        <div className="min-w-0 text-[10px] text-slate-500">
          {isSimulating
            ? `Deploying team ${Math.max(simulationStep + 1, 1)} of ${selectedLocations.length}...`
            : selectedLocations.length
              ? `${selectedLocations.length} team${selectedLocations.length === 1 ? "" : "s"} assigned to selected hotspots.`
              : "Select hotspots to create a deployment scenario."}
        </div>

        <button
          type="button"
          onClick={runSimulation}
          disabled={isSimulating || selectedLocations.length === 0}
          className="inline-flex shrink-0 items-center gap-1.5 rounded-lg bg-cyan-600 px-3 py-1.5 text-[10px] font-bold text-white transition hover:bg-cyan-700 disabled:cursor-not-allowed disabled:opacity-50"
        >
          <Play size={11} fill="currentColor" />
          {isSimulating ? "Simulating..." : "Run simulation"}
        </button>
      </div>

      
    </div>
  </div>

  {/* Monitoring points */}
  <div className="rounded-xl border border-slate-200 bg-white p-3">
    <div className="mb-2.5 flex items-center justify-between gap-3">
      <div>
        <div className="flex items-center gap-2">
          <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-slate-500">
            Risk hotspots
          </p>
          
        </div>
      
      </div>

      <div className="rounded-md bg-slate-100 px-2 py-1 text-[10px] font-semibold text-slate-600">
        {selectedLocations.length}/{scenarioSize}
      </div>
    </div>

    <div className="max-h-[380px] space-y-1.5 overflow-y-auto pr-1">
      {allLocations.map((location) => {
        const selected = selectedIds.includes(location.id);
        const disabled = !selected && selectedLocations.length >= scenarioSize;

        return (
          <button
            key={location.id}
            type="button"
            onClick={() => toggleLocation(location.id)}
            disabled={disabled}
            className={`w-full rounded-lg border px-2.5 py-2 text-left transition-colors ${
              selected
                ? "border-cyan-200 bg-cyan-50"
                : disabled
                  ? "cursor-not-allowed border-slate-100 bg-slate-50 opacity-50"
                  : "border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50"
            }`}
          >
            <div className="flex items-center gap-2">
              <div
                className={`flex h-4 w-4 shrink-0 items-center justify-center rounded border ${
                  selected
                    ? "border-cyan-600 bg-cyan-600 text-white"
                    : "border-slate-300 bg-white"
                }`}
              >
                {selected && <Check className="h-2.5 w-2.5" />}
              </div>

              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-1.5">
                  <p className="truncate text-[11px] font-semibold text-slate-800">
                    {location.name}
                  </p>

                  <span className={`shrink-0 rounded px-1 py-0.5 text-[8px] font-medium ${riskBadgeClasses[location.riskLevel]}`}>
                    {location.riskLevel}
                  </span>
                </div>

                <div className="mt-0.5 flex items-center gap-2 text-[9px] text-slate-400">
                  <span className="inline-flex items-center gap-1">
                    <MapPin className="h-2.5 w-2.5" />
                    {location.area}
                  </span>
                  <span>{location.confidence}% confidence</span>
                </div>
              </div>
            </div>
          </button>
        );
      })}
    </div>

    {selectedLocations.length >= scenarioSize && (
      <p className="mt-2 text-[9px] text-slate-400">
        Capacity reached. Unselect a hotspot to choose another.
      </p>
    )}
  </div>
</div>
<div className="mt-4 rounded-2xl p-2">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-emerald-700">
                Recommended deployment plan
              </p>
              <h4 className="mt-2 text-base font-bold text-slate-900">
                {recommendedPlan.team} lead deployment
              </h4>
            </div>

            <div className="rounded-full border border-cyan-200 bg-white px-2.5 py-1 text-[10px] font-semibold text-emerald-700">
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
    <div className="rounded-lg border border-slate-200 bg-white px-3 py-2.5">
      <div className="flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-wide text-slate-500">
        {icon}
        {label}
      </div>
      <p className="mt-1 text-sm font-bold text-slate-900">{value}</p>
    </div>
  );
}