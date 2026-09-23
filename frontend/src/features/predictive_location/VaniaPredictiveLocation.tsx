import { useEffect } from "react";
import { MapContainer, Marker, Popup, TileLayer, useMap } from "react-leaflet";
import * as L from "leaflet";
import "leaflet/dist/leaflet.css";
import "leaflet.heat";
import { Activity, Clock3, MapPinned, ShieldAlert, TrendingUp } from "lucide-react";

interface VaniaLocation {
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

const vaniaLocations: VaniaLocation[] = [
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
    reasonSummary: "Strong network and ATM velocity pattern match recent mule transfers.",
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
    reasonSummary: "Frequent cash-out cluster near prior beneficiary activity corridors.",
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
    reasonSummary: "Logistical proximity and timing align with compounding withdrawals.",
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
    reasonSummary: "Secondary candidate with moderate geo-spatial overlap and account routing.",
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
    reasonSummary: "Branch cash demand signal matches evening transaction surges.",
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
    reasonSummary: "Outlier but plausible because of long-distance movement toward the south.",
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
    reasonSummary: "Late-evening activity clusters remain viable with reduced confidence.",
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
    reasonSummary: "Lower probability as a secondary landing point due to wider radius.",
  },
];

const riskColors = {
  Low: "#22c55e",
  Medium: "#facc15",
  High: "#f97316",
  Critical: "#ef4444",
};

const defaultCenter: [number, number] = [28.544, 77.274];

function HeatLayer({ points }: { points: Array<[number, number, number]> }) {
  const map = useMap();

  useEffect(() => {
    const heat = (L as typeof L & {
      heatLayer?: (
        data: Array<[number, number, number]>,
        options?: Record<string, unknown>,
      ) => L.Layer;
    }).heatLayer?.(points, {
      radius: 26,
      blur: 18,
      maxZoom: 17,
      max: 1,
      minOpacity: 0.35,
      gradient: {
        0.2: "#22c55e",
        0.45: "#84cc16",
        0.72: "#f59e0b",
        1: "#ef4444",
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

export default function VaniaPredictiveLocation() {
  const rankedLocations = [...vaniaLocations]
    .sort((a, b) => b.confidence - a.confidence)
    .slice(0, 3);

  const topPrediction = rankedLocations[0] ?? vaniaLocations[0];

  return (
    <div className="flex h-full flex-col">
      <div className="mb-4 flex items-center justify-between gap-2">
        <div className="flex items-center gap-2 text-slate-800">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-teal-50 text-teal-600 ring-1 ring-teal-100">
            <TrendingUp size={15} />
          </div>

          <div>
            <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-slate-400">
              Vania — predictive location
            </p>
            <h3 className="text-base font-bold text-slate-900">Cash-out hotspot model</h3>
          </div>
        </div>

        <div className="rounded-full border border-cyan-200 bg-cyan-50 px-2 py-1 text-[10px] font-semibold text-cyan-700">
          {topPrediction.confidence}% confidence
        </div>
      </div>

      <div className="space-y-3">
        {rankedLocations.map((location, index) => {
          const isTop = index === 0;

          return (
            <div
              key={location.id}
              className={`relative overflow-hidden rounded-2xl border p-3.5 transition-all duration-200 ${
                isTop
                  ? "border-cyan-200 bg-cyan-50/70 shadow-[0_0_0_1px_rgba(34,211,238,0.08),0_24px_40px_-28px_rgba(13,148,136,0.65)]"
                  : "border-slate-200 bg-slate-50/80"
              }`}
            >
              {isTop && (
                <div className="absolute right-0 top-0 flex items-center gap-1 rounded-bl-xl bg-gradient-to-r from-cyan-600 to-teal-500 px-2.5 py-1 text-[9px] font-bold uppercase tracking-[0.12em] text-white shadow-sm">
                  <ShieldAlert size={10} />
                  Top pick
                </div>
              )}

              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0 pr-8">
                  <div className="flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.12em] text-slate-400">
                    <span>#{index + 1}</span>
                    <span className="rounded-full border border-slate-200 bg-white px-1.5 py-0.5 text-[9px] text-slate-500">
                      {location.type}
                    </span>
                  </div>

                  <h4 className="mt-1 truncate text-sm font-bold text-slate-900">
                    {location.name}
                  </h4>
                </div>

                <span className="rounded-full border border-cyan-200 bg-white px-2 py-1 text-xs font-semibold text-cyan-700">
                  {location.confidence}%
                </span>
              </div>

              <div className="mt-3">
                <div className="mb-1 flex items-center justify-between text-[10px] text-slate-500">
                  <span>Confidence</span>
                  <span className="font-semibold text-slate-700">
                    {location.confidence}%
                  </span>
                </div>

                <div className="h-1.5 w-full overflow-hidden rounded-full bg-slate-200">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-cyan-500 via-teal-500 to-emerald-400 transition-[width] duration-500"
                    style={{ width: `${location.confidence}%` }}
                  />
                </div>
              </div>

              <div className="mt-3 grid grid-cols-3 gap-2 text-[10px] text-slate-500">
                <div className="rounded-lg border border-slate-200 bg-white/80 p-2">
                  <div className="flex items-center gap-1 text-slate-400">
                    <MapPinned size={11} />
                    <span>Distance</span>
                  </div>
                  <div className="mt-1 font-semibold text-slate-700">
                    {location.distanceKm} km
                  </div>
                </div>

                <div className="rounded-lg border border-slate-200 bg-white/80 p-2">
                  <div className="flex items-center gap-1 text-slate-400">
                    <Clock3 size={11} />
                    <span>Window</span>
                  </div>
                  <div className="mt-1 font-semibold text-slate-700">
                    {location.predictedWindow}
                  </div>
                </div>

                <div className="rounded-lg border border-slate-200 bg-white/80 p-2">
                  <div className="flex items-center gap-1 text-slate-400">
                    <Activity size={11} />
                    <span>Risk</span>
                  </div>
                  <div
                    className="mt-1 font-semibold"
                    style={{ color: riskColors[location.riskLevel] }}
                  >
                    {location.riskLevel}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="mt-4 rounded-2xl border border-slate-200 bg-slate-50/80 p-3">
        <div className="mb-2 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.12em] text-slate-400">
            <span className="h-2.5 w-2.5 rounded-full bg-gradient-to-r from-red-500 via-orange-400 via-yellow-400 to-emerald-500" />
            Risk gradient
          </div>

          <div className="flex items-center gap-1.5 text-[10px] text-slate-500">
            <span>🔴</span>
            <span>🟠</span>
            <span>🟡</span>
            <span>🟢</span>
          </div>
        </div>

        <div className="h-2 overflow-hidden rounded-full bg-gradient-to-r from-red-500 via-orange-400 via-yellow-400 to-emerald-500" />
      </div>

      <div className="mt-4 h-[260px] overflow-hidden rounded-2xl border border-slate-200 bg-slate-100">
        <PredictionMap locations={vaniaLocations} highlightedIds={rankedLocations.map((location) => location.id)} />
      </div>
    </div>
  );
}

function PredictionMap({
  locations,
  highlightedIds,
}: {
  locations: VaniaLocation[];
  highlightedIds: string[];
}) {
  const heatPoints = locations.map((location) => [
    location.latitude,
    location.longitude,
    Math.max(0.2, location.confidence / 100),
  ] as [number, number, number]);

  const highlighted = new Set(highlightedIds);

  return (
    <MapContainer
      center={defaultCenter}
      zoom={13}
      scrollWheelZoom={false}
      className="h-full w-full"
      dragging={true}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />

      <HeatLayer points={heatPoints} />

      {locations
        .filter((location) => highlighted.has(location.id))
        .map((location, index) => (
          <Marker
            key={location.id}
            position={[location.latitude, location.longitude]}
            icon={buildMarkerIcon(
              index === 0 ? "#14b8a6" : index === 1 ? "#0ea5e9" : "#f59e0b",
            )}
          >
            <Popup>
              <div className="space-y-1">
                <div className="text-xs font-semibold text-slate-900">{location.name}</div>
                <div className="text-[11px] text-slate-600">
                  {location.confidence}% confidence · {location.predictedWindow}
                </div>
                <div className="text-[11px] text-slate-500">{location.reasonSummary}</div>
              </div>
            </Popup>
          </Marker>
        ))}
    </MapContainer>
  );
}

function buildMarkerIcon(color: string) {
  return L.divIcon({
    className: "custom-map-pin",
    html: `
      <div style="
        width: 18px;
        height: 18px;
        border-radius: 50%;
        background: ${color};
        border: 2px solid white;
        box-shadow: 0 8px 18px rgba(15, 23, 42, 0.2);
        position: relative;
      "></div>
    `,
    iconSize: [18, 18],
    iconAnchor: [9, 9],
    popupAnchor: [0, -8],
  });
}
