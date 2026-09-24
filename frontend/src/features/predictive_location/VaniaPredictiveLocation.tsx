import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

import {
  MapContainer,
  Marker,
  Popup,
  TileLayer,
  useMap,
  ZoomControl,
} from "react-leaflet";

import * as L from "leaflet";

import "leaflet/dist/leaflet.css";
import "leaflet.heat";

import {
  Clock3,
  MapPinned,
  TrendingUp,
} from "lucide-react";

/* =========================================================
   TYPES
========================================================= */

export interface VaniaLocation {
  id: string;
  name: string;
  type: "ATM" | "Branch";
  area: string;
  latitude: number;
  longitude: number;
  confidence: number;
  distanceKm: number;
  predictedWindow: string;
  riskLevel: "Low" | "Medium" | "High" | "Critical";
  bank: string;
  reasonSummary: string;
}

/* =========================================================
   MOCK PREDICTIVE LOCATIONS
========================================================= */

export const vaniaLocations: VaniaLocation[] = [
  {
    id: "ATM-DEL-01",
    name: "SBI ATM — Sarita Vihar",
    type: "ATM",
    area: "Sarita Vihar",
    latitude: 28.5352,
    longitude: 77.2886,
    confidence: 92,
    distanceKm: 1.8,
    predictedWindow: "19:30–21:00",
    riskLevel: "Critical",
    bank: "SBI",
    reasonSummary:
      "Strong network and ATM velocity pattern match recent mule transfers.",
  },

  {
    id: "ATM-DEL-02",
    name: "HDFC ATM — Okhla Phase 2",
    type: "ATM",
    area: "Okhla",
    latitude: 28.5344,
    longitude: 77.2754,
    confidence: 88,
    distanceKm: 2.4,
    predictedWindow: "19:45–20:45",
    riskLevel: "High",
    bank: "HDFC Bank",
    reasonSummary:
      "Frequent cash-out cluster near prior beneficiary activity corridors.",
  },

  {
    id: "ATM-DEL-03",
    name: "ICICI ATM — Jasola Vihar",
    type: "ATM",
    area: "Jasola",
    latitude: 28.5418,
    longitude: 77.2921,
    confidence: 84,
    distanceKm: 2.9,
    predictedWindow: "20:00–21:30",
    riskLevel: "High",
    bank: "ICICI Bank",
    reasonSummary:
      "Logistical proximity and timing align with compounding withdrawals.",
  },

  {
    id: "ATM-DEL-04",
    name: "Canara Bank ATM — Greater Kailash",
    type: "ATM",
    area: "Greater Kailash",
    latitude: 28.5514,
    longitude: 77.2382,
    confidence: 76,
    distanceKm: 4.3,
    predictedWindow: "20:15–21:45",
    riskLevel: "Medium",
    bank: "Canara Bank",
    reasonSummary:
      "Secondary candidate with moderate geo-spatial overlap and account routing.",
  },

  {
    id: "ATM-DEL-05",
    name: "Axis Bank Branch — Nizamuddin",
    type: "Branch",
    area: "Nizamuddin",
    latitude: 28.593,
    longitude: 77.2431,
    confidence: 73,
    distanceKm: 5.1,
    predictedWindow: "20:30–22:00",
    riskLevel: "Medium",
    bank: "Axis Bank",
    reasonSummary:
      "Branch cash demand signal matches evening transaction surges.",
  },

  {
    id: "ATM-DEL-06",
    name: "Kotak ATM — Mehrauli",
    type: "ATM",
    area: "Mehrauli",
    latitude: 28.5057,
    longitude: 77.1794,
    confidence: 67,
    distanceKm: 6.2,
    predictedWindow: "21:00–22:30",
    riskLevel: "Medium",
    bank: "Kotak Mahindra",
    reasonSummary:
      "Outlier but plausible because of long-distance movement toward the south.",
  },

  {
    id: "ATM-DEL-07",
    name: "PNB ATM — Kalkaji",
    type: "ATM",
    area: "Kalkaji",
    latitude: 28.5511,
    longitude: 77.2608,
    confidence: 63,
    distanceKm: 4.6,
    predictedWindow: "20:45–22:15",
    riskLevel: "Medium",
    bank: "PNB",
    reasonSummary:
      "Late-evening activity clusters remain viable with reduced confidence.",
  },

  {
    id: "ATM-DEL-08",
    name: "BOB ATM — Saket",
    type: "ATM",
    area: "Saket",
    latitude: 28.5215,
    longitude: 77.2016,
    confidence: 58,
    distanceKm: 7.1,
    predictedWindow: "21:15–22:45",
    riskLevel: "Low",
    bank: "Bank of Baroda",
    reasonSummary:
      "Lower probability as a secondary landing point due to wider radius.",
  },
];

/* =========================================================
   RISK COLORS
========================================================= */

export const riskColors: Record<
  VaniaLocation["riskLevel"],
  string
> = {
  Low: "#22c55e",
  Medium: "#facc15",
  High: "#f97316",
  Critical: "#ef4444",
};

const defaultCenter: [number, number] = [
  28.544,
  77.274,
];

/* =========================================================
   HEATMAP
========================================================= */

function HeatLayer({
  points,
}: {
  points: Array<[number, number, number]>;
}) {
  const map = useMap();

  useEffect(() => {
    const heat = (
      L as typeof L & {
        heatLayer?: (
          data: Array<[number, number, number]>,
          options?: Record<string, unknown>,
        ) => L.Layer;
      }
    ).heatLayer?.(points, {
      radius: 55,
      blur: 35,
      maxZoom: 15,
      max: 1,
      minOpacity: 0.35,

      gradient: {
        0.15: "#fef3c7",
        0.35: "#fbbf24",
        0.55: "#f97316",
        0.75: "#ef4444",
        1: "#991b1b",
      },
    });

    if (heat) {
      heat.addTo(map);
    }

    return () => {
      if (heat) {
        heat.remove();
      }
    };
  }, [map, points]);

  return null;
}

/* =========================================================
   MAIN COMPONENT
========================================================= */

export default function VaniaPredictiveLocation() {
  const navigate = useNavigate();

  const rankedLocations = [...vaniaLocations]
    .sort(
      (a, b) =>
        b.confidence - a.confidence,
    )
    .slice(0, 3);

  const openInvestigation = (
    location: VaniaLocation,
  ) => {
    navigate(
      `/app/location-investigation/${location.id}`,
    );
  };

  return (
    <div className="flex h-[480px] flex-col">

      {/* =====================================================
          HEADER
      ===================================================== */}

      <div className="mb-4 flex shrink-0 items-center justify-between gap-3">

        <div className="flex items-center gap-2">

          <div className="flex h-8 w-8 items-center justify-center rounded-lg text-cyan-600">
            <TrendingUp size={15} />
          </div>

          <div>
            <h3 className="text-sm font-bold text-slate-900">
              Cash-out Locations Intelligence
            </h3>
          </div>

        </div>

        <div className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-[10px] font-semibold text-slate-600">
          Top 3 Predictions
        </div>

      </div>

      {/* =====================================================
          MAP + RIGHT PANEL
      ===================================================== */}

      <div className="grid min-h-0 flex-1 grid-cols-1 gap-4 lg:grid-cols-[1.6fr_1fr]">

        {/* ===================================================
            MAP
        =================================================== */}

        <div className="relative min-h-[430px] overflow-hidden rounded-2xl border border-slate-200 bg-slate-100">

          <PredictionMap
            locations={vaniaLocations}
            highlightedIds={rankedLocations.map(
              (location) => location.id,
            )}
            onLocationSelect={
              openInvestigation
            }
          />

          {/* =================================================
              MAP LEGEND
          ================================================= */}

          <div className="absolute left-3 top-3 z-[1000] rounded-lg border border-slate-200 bg-white/95 px-3 py-2 shadow-sm">

            <p className="mb-2 text-[9px] font-semibold uppercase tracking-[0.12em] text-slate-500">
              Cash-out prediction intensity
            </p>

            <div className="flex items-center gap-1">
              <span className="h-2.5 w-8 rounded-l-full bg-yellow-300" />
              <span className="h-2.5 w-8 bg-orange-400" />
              <span className="h-2.5 w-8 rounded-r-full bg-red-600" />
            </div>

            <div className="mt-1 flex justify-between text-[8px] text-slate-400">
              <span>Lower</span>
              <span>Higher</span>
            </div>

            <div className="mt-2 flex items-center gap-1.5 border-t border-slate-100 pt-2">

              <span className="h-2.5 w-2.5 rounded-full border-2 border-red-500 bg-red-500" />

              <span className="text-[9px] text-slate-500">
                Predicted location
              </span>

            </div>

          </div>

          {/* =================================================
              PREDICTION BASIS
          ================================================= */}

          <div className="absolute bottom-3 left-3 z-[1000] max-w-xs rounded-lg border border-slate-200 bg-white/95 px-3 py-2 shadow-sm">

            <p className="text-[9px] font-semibold uppercase tracking-[0.12em] text-slate-500">
              Prediction basis
            </p>

            <p className="mt-1 text-[10px] leading-relaxed text-slate-600">
              Heat intensity reflects model confidence based on
              transaction patterns, location proximity, and
              withdrawal timing.
            </p>

          </div>

        </div>

        {/* ===================================================
            RIGHT PANEL
        =================================================== */}

        <div className="flex min-h-0 flex-col">

          {/* Panel header */}

          <div className="mb-2 shrink-0">

            <div className="flex items-center justify-between">

              <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-slate-400">
                Predicted Locations
              </p>

              <span className="text-[10px] font-medium text-slate-400">
                {rankedLocations.length} high-priority signals
              </span>

            </div>

          </div>

          {/* =================================================
              SCROLLABLE PREDICTION LIST
          ================================================= */}

          <div className="min-h-0 flex-1 overflow-y-auto pr-1">

            <div className="space-y-2.5">

              {rankedLocations.map(
                (location, index) => {

                  const isTop = index === 0;

                  return (
                    <button
                      type="button"
                      key={location.id}
                      onClick={() =>
                        openInvestigation(
                          location,
                        )
                      }
                      className={`group relative w-full rounded-xl border p-3 text-left transition-all ${
                        isTop
                          ? "border-red-200 bg-red-50/40 hover:border-red-300 hover:bg-red-50"
                          : "border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50"
                      }`}
                    >

                      {/* =================================================
                          TOP ROW
                      ================================================= */}

                      <div className="flex items-start gap-3">

                        {/* Confidence */}

                        <div
                          className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${
                            isTop
                              ? "bg-red-100 text-red-700"
                              : index === 1
                                ? "bg-orange-100 text-orange-700"
                                : "bg-amber-100 text-amber-700"
                          }`}
                        >
                          <span className="text-xs font-bold">
                            {location.confidence}
                          </span>
                        </div>

                        {/* Location */}

                        <div className="min-w-0 flex-1">

                          <div className="flex items-center gap-1.5">

                            <span className="text-[9px] font-semibold uppercase tracking-wide text-slate-400">
                              {location.type}
                            </span>

                            <span className="text-[9px] text-slate-300">
                              •
                            </span>

                            <span className="truncate text-[9px] font-medium text-slate-500">
                              {location.bank}
                            </span>

                          </div>

                          <h4 className="mt-0.5 truncate text-xs font-bold text-slate-900">
                            {location.name}
                          </h4>

                          <p className="mt-0.5 text-[10px] text-slate-500">
                            {location.area}
                          </p>

                        </div>

                        {/* Risk */}

                        <div className="shrink-0 text-right">

                          <span
                            className="inline-flex rounded-full px-2 py-0.5 text-[9px] font-bold"
                            style={{
                              color:
                                riskColors[
                                  location.riskLevel
                                ],
                              backgroundColor:
                                `${riskColors[location.riskLevel]}15`,
                            }}
                          >
                            {location.riskLevel}
                          </span>

                          {isTop && (
                            <p className="mt-1 text-[8px] font-semibold uppercase tracking-wide text-red-500">
                              Highest signal
                            </p>
                          )}

                        </div>

                      </div>

                      {/* =================================================
                          METRICS
                      ================================================= */}

                      <div className="mt-3 grid grid-cols-2 gap-2">

                        <div className="rounded-lg bg-slate-50 px-2.5 py-2">

                          <div className="flex items-center gap-1 text-slate-400">
                            <Clock3 size={10} />

                            <span className="text-[9px]">
                              Predicted window
                            </span>
                          </div>

                          <p className="mt-1 text-[10px] font-semibold text-slate-700">
                            {location.predictedWindow}
                          </p>

                        </div>

                        <div className="rounded-lg bg-slate-50 px-2.5 py-2">

                          <div className="flex items-center gap-1 text-slate-400">
                            <MapPinned size={10} />

                            <span className="text-[9px]">
                              Distance
                            </span>
                          </div>

                          <p className="mt-1 text-[10px] font-semibold text-slate-700">
                            {location.distanceKm} km
                          </p>

                        </div>

                      </div>

                      {/* =================================================
                          CONFIDENCE BAR
                      ================================================= */}

                      <div className="mt-3">

                        <div className="mb-1 flex items-center justify-between">

                          <span className="text-[9px] font-medium text-slate-400">
                            Prediction confidence
                          </span>

                          <span className="text-[9px] font-bold text-slate-600">
                            {location.confidence}%
                          </span>

                        </div>

                        <div className="h-1.5 overflow-hidden rounded-full bg-slate-100">

                          <div
                            className="h-full rounded-full transition-all"
                            style={{
                              width: `${location.confidence}%`,
                              backgroundColor:
                                riskColors[
                                  location.riskLevel
                                ],
                            }}
                          />

                        </div>

                      </div>

                      {/* =================================================
                          REASON
                      ================================================= */}

                      <div className="mt-3 border-t border-slate-100 pt-2.5">

                        <p className="text-[9px] leading-relaxed text-slate-500">
                          {location.reasonSummary}
                        </p>

                      </div>

                      {/* =================================================
                          ACTION
                      ================================================= */}

                      <div className="mt-2.5 flex items-center justify-end">

                        <span className="text-[9px] font-semibold text-cyan-600 opacity-80 transition-opacity group-hover:opacity-100">
                          Inspect intelligence →
                        </span>

                      </div>

                    </button>
                  );
                },
              )}

            </div>

          </div>

        </div>

      </div>

    </div>
  );
}

/* =========================================================
   PREDICTIVE MAP
========================================================= */

function PredictionMap({
  locations,
  highlightedIds,
  onLocationSelect,
}: {
  locations: VaniaLocation[];
  highlightedIds: string[];
  onLocationSelect: (
    location: VaniaLocation,
  ) => void;
}) {

  const heatPoints = locations.map(
    (location) => {

      const normalizedRisk =
        location.confidence / 100;

      return [
        location.latitude,
        location.longitude,
        Math.max(
          0.15,
          normalizedRisk,
        ),
      ] as [number, number, number];

    },
  );

  const highlighted =
    new Set(highlightedIds);

  return (
    <MapContainer
      center={defaultCenter}
      zoom={13}

      /* =====================================================
         ZOOM FEATURES
      ===================================================== */

      scrollWheelZoom={true}
      doubleClickZoom={true}
      touchZoom={true}
      boxZoom={true}
      keyboard={true}

      /*
       * We disable Leaflet's default zoom control
       * because we add it manually below.
       */
      zoomControl={false}

      className="h-full w-full"
      dragging={true}
    >

      {/* =====================================================
          ZOOM IN / ZOOM OUT BUTTONS
      ===================================================== */}

      <ZoomControl
        position="topright"
      />

      {/* =====================================================
          MAP TILES
      ===================================================== */}

      <TileLayer
        attribution="&copy; OpenStreetMap contributors"
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />

      {/* =====================================================
          HEATMAP
      ===================================================== */}

      <HeatLayer
        points={heatPoints}
      />

      {/* =====================================================
          HOTSPOT MARKERS
          
          IMPORTANT:
          Popup opens ONLY when the marker is clicked.
          There is NO mouseover/mouseout handler.
      ===================================================== */}

      {locations
        .filter((location) =>
          highlighted.has(
            location.id,
          ),
        )
        .sort(
          (a, b) =>
            b.confidence -
            a.confidence,
        )
        .map((location) => (

          <Marker
            key={location.id}
            position={[
              location.latitude,
              location.longitude,
            ]}
            icon={buildPredictionMarkerIcon(
              location,
            )}

            /*
             * We intentionally do NOT add:
             *
             * mouseover
             * mouseout
             *
             * The Popup below automatically opens
             * when the marker is clicked.
             */
          >

            {/* =================================================
                CLICK POPUP
            ================================================= */}

            <Popup
              closeButton={true}
              autoPan={true}
              offset={[0, -12]}
              className="prediction-popup"
            >

              <div className="min-w-[200px] max-w-[260px] p-1">

                {/* =================================================
                    POPUP HEADER
                ================================================= */}

                <div className="mb-2 flex items-start justify-between gap-3">

                  <div>

                    <p className="text-[9px] font-semibold uppercase tracking-wider text-slate-400">
                      {location.type}
                    </p>

                    <h4 className="mt-0.5 text-sm font-bold leading-tight text-slate-900">
                      {location.name}
                    </h4>

                   

                  </div>

                  <span
                    className="shrink-0 rounded-full px-2 py-1 text-[9px] font-bold"
                    style={{
                      color:
                        riskColors[
                          location.riskLevel
                        ],
                      backgroundColor:
                        `${riskColors[location.riskLevel]}18`,
                    }}
                  >
                    {location.riskLevel}
                  </span>

                </div>

                {/* Divider */}

                <div className="mb-2 border-t border-slate-100" />

                {/* =================================================
                    INFORMATION GRID
                ================================================= */}

                <div className="grid grid-cols-2 gap-1.5">

                  {/* Bank */}

                  <div className="rounded-md bg-slate-50 px-2 py-1.5">

                    <p className="text-[8px] uppercase tracking-wide text-slate-400">
                      Bank
                    </p>

                    <p className="mt-0.5 text-[10px] font-semibold text-slate-700">
                      {location.bank}
                    </p>

                  </div>

                  {/* Confidence */}

                  <div className="rounded-md bg-slate-50 px-2 py-1.5">

                    <p className="text-[8px] uppercase tracking-wide text-slate-400">
                      Confidence
                    </p>

                    <p className="mt-0.5 text-[10px] font-semibold text-slate-700">
                      {location.confidence}%
                    </p>

                  </div>

                  {/* Distance */}

                  <div className="rounded-md bg-slate-50 px-2 py-1.5">

                    <p className="text-[8px] uppercase tracking-wide text-slate-400">
                      Distance
                    </p>

                    <p className="mt-0.5 text-[10px] font-semibold text-slate-700">
                      {location.distanceKm} km
                    </p>

                  </div>

                  {/* Predicted window */}

                  <div className="rounded-md bg-slate-50 px-2 py-1.5">

                    <p className="text-[8px] uppercase tracking-wide text-slate-400">
                      Predicted
                    </p>

                    <p className="mt-0.5 text-[10px] font-semibold text-slate-700">
                      {location.predictedWindow}
                    </p>

                  </div>

                </div>

                {/* =================================================
                    CONFIDENCE BAR
                ================================================= */}

                <div className="mt-2">

                  <div className="mb-1 flex items-center justify-between">

                    <span className="text-[8px] font-medium text-slate-400">
                      Prediction confidence
                    </span>

                    <span className="text-[8px] font-bold text-slate-600">
                      {location.confidence}%
                    </span>

                  </div>

                  <div className="h-1.5 overflow-hidden rounded-full bg-slate-100">

                    <div
                      className="h-full rounded-full"
                      style={{
                        width: `${location.confidence}%`,
                        backgroundColor:
                          riskColors[
                            location.riskLevel
                          ],
                      }}
                    />

                  </div>

                </div>

             
                

                {/* =================================================
                    COORDINATES
                ================================================= */}

                <div className="mt-2 border-t border-slate-100 pt-2">

                  <span className="text-[8px] text-slate-400">
                    {location.latitude.toFixed(4)},{" "}
                    {location.longitude.toFixed(4)}
                  </span>

                </div>

              </div>

            </Popup>

          </Marker>

        ))}

    </MapContainer>
  );
}

/* =========================================================
   PREDICTION LOCATION MARKER
========================================================= */

function buildPredictionMarkerIcon(
  location: VaniaLocation,
) {

  const color =
    riskColors[location.riskLevel];

  return L.divIcon({

    className: "prediction-marker",

    html: `
      <div
        style="
          position: relative;
          width: 34px;
          height: 34px;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
        "
      >

        <!-- Outer pulse/ring -->

        <div
          style="
            position: absolute;
            width: 34px;
            height: 34px;
            border-radius: 999px;
            border: 2px solid ${color};
            opacity: 0.35;
          "
        ></div>

        <!-- Main hotspot -->

        <div
          style="
            width: 22px;
            height: 22px;
            border-radius: 999px;
            background: ${color};
            border: 3px solid white;
            box-shadow: 0 2px 8px rgba(15,23,42,0.35);
            position: relative;
            z-index: 2;
          "
        ></div>

      </div>
    `,

    iconSize: [34, 34],
    iconAnchor: [17, 17],

    /*
     * Popup appears above the hotspot.
     */
    popupAnchor: [0, -17],
  });
}