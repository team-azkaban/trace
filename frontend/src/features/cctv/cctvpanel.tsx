import {
  Camera,
  Clock3,
  MapPin,
  Radio,
  ShieldCheck,
  Play,
  Maximize2,
} from "lucide-react";

import cam1 from "../../assets/cam1.png";
import cam2 from "../../assets/cam2.png";

const cameras = [
  {
    id: "CCTV 01",
    name: "Jasola Street Camera",
    type: "Street surveillance",
    distance: 80,
    coverage: 100,
    status: "Available",
    verified: "2 min ago",
    image: cam1,
  },
  {
    id: "CCTV 02",
    name: "ATM Camera — Jasola",
    type: "ATM / cash point",
    distance: 120,
    coverage: 50,
    status: "Available",
    verified: "5 min ago",
    image: cam2,
  },
  
];

const statusStyles: Record<
  string,
  {
    dot: string;
    text: string;
  }
> = {
  Available: {
    dot: "bg-emerald-500",
    text: "text-emerald-700",
  },
  Pending: {
    dot: "bg-amber-400",
    text: "text-amber-700",
  },
  Unavailable: {
    dot: "bg-slate-400",
    text: "text-slate-500",
  },
};

export default function CCTVPanel() {
  const availableCameras = cameras.filter(
    (camera) => camera.status === "Available",
  ).length;

  return (
    <div className="p-5">
      {/* =====================================================
          HEADER
      ===================================================== */}

      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600">
              <Camera size={17} />
            </div>

            <div>
              <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-indigo-600">
                Physical Intelligence
              </p>

              <h3 className="text-[15px] font-bold text-slate-900">
                Nearby CCTV coverage
              </h3>
            </div>
          </div>

         
        </div>

        <div className="shrink-0 rounded-xl border border-slate-100 bg-slate-50 px-3 py-1 text-right">
          <p className="text-[9px] font-semibold uppercase tracking-wider text-slate-400">
            Online
          </p>

          <p className="mt-0.5 text-sm font-bold text-slate-800">
            {availableCameras}/{cameras.length}
          </p>
        </div>
      </div>

      {/* =====================================================
          CONNECTION MAP
      ===================================================== */}

      <div className="mt-5 overflow-hidden rounded-xl border border-slate-100 bg-slate-50/70">
        <div className="flex items-center justify-between border-b border-slate-100 px-3.5 py-2.5">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-slate-600">
              Camera coverage network
            </p>

           
          </div>

          <div className="flex items-center gap-2 text-[8px] text-slate-400">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
            Available
          </div>
        </div>

        <div className="relative h-[250px] overflow-hidden bg-white">
          {/* Subtle map/grid structure */}

          <div className="absolute inset-0 opacity-40">
            <div className="absolute left-1/2 top-0 h-full w-px bg-slate-100" />
            <div className="absolute left-0 top-1/2 h-px w-full bg-slate-100" />

            <div className="absolute left-[10%] top-[25%] h-px w-[80%] rotate-[15deg] bg-slate-100" />

            <div className="absolute left-[10%] top-[70%] h-px w-[80%] -rotate-[15deg] bg-slate-100" />
          </div>

          {/* Coverage radius */}

          <div className="absolute left-1/2 top-1/2 h-[125px] w-[125px] -translate-x-1/2 -translate-y-1/2 rounded-full border border-red-100 bg-red-50/30" />

          <div className="absolute left-1/2 top-1/2 h-[75px] w-[75px] -translate-x-1/2 -translate-y-1/2 rounded-full border border-red-200/70" />

          {/* Connection SVG */}

          <svg
            className="pointer-events-none absolute inset-0 h-full w-full"
            viewBox="0 0 100 100"
            preserveAspectRatio="none"
          >
            {/* CCTV 01 → prediction */}

            <line
              x1="18"
              y1="23"
              x2="50"
              y2="50"
              stroke="#10b981"
              strokeWidth="0.4"
              strokeDasharray="2 2"
            />

            {/* CCTV 02 → prediction */}

            <line
              x1="82"
              y1="27"
              x2="50"
              y2="50"
              stroke="#10b981"
              strokeWidth="0.4"
              strokeDasharray="2 2"
            />

            {/* CCTV 03 → prediction */}

            <line
              x1="20"
              y1="78"
              x2="50"
              y2="50"
              stroke="#cbd5e1"
              strokeWidth="0.4"
              strokeDasharray="1.5 2"
            />

            {/* CCTV 04 → prediction */}

            <line
              x1="80"
              y1="76"
              x2="50"
              y2="50"
              stroke="#cbd5e1"
              strokeWidth="0.4"
              strokeDasharray="1.5 2"
            />
          </svg>

          {/* =================================================
              CAMERA 01
          ================================================= */}

          <div className="absolute left-[18%] top-[23%] -translate-x-1/2 -translate-y-1/2">
            <div className="flex flex-col items-center">
              <div className="relative flex h-8 w-8 items-center justify-center rounded-full border border-emerald-200 bg-white text-emerald-600 shadow-sm">
                <Camera size={12} />

                <span className="absolute -right-0.5 -top-0.5 h-2 w-2 rounded-full border-2 border-white bg-emerald-500" />
              </div>

              <div className="mt-1 rounded bg-white px-1.5 py-0.5 shadow-sm">
                <p className="text-[7px] font-bold text-slate-600">
                  CCTV 01
                </p>

                <p className="text-[6px] text-slate-400">
                  80m
                </p>
              </div>
            </div>
          </div>

          {/* =================================================
              CAMERA 02
          ================================================= */}

          <div className="absolute right-[18%] top-[27%] translate-x-1/2 -translate-y-1/2">
            <div className="flex flex-col items-center">
              <div className="relative flex h-8 w-8 items-center justify-center rounded-full border border-emerald-200 bg-white text-emerald-600 shadow-sm">
                <Camera size={12} />

                <span className="absolute -right-0.5 -top-0.5 h-2 w-2 rounded-full border-2 border-white bg-emerald-500" />
              </div>

              <div className="mt-1 rounded bg-white px-1.5 py-0.5 shadow-sm">
                <p className="text-[7px] font-bold text-slate-600">
                  CCTV 02
                </p>

                <p className="text-[6px] text-slate-400">
                  120m
                </p>
              </div>
            </div>
          </div>

          {/* =================================================
              CAMERA 03
          ================================================= */}

          <div className="absolute bottom-[22%] left-[20%] -translate-x-1/2 translate-y-1/2">
            <div className="flex flex-col items-center">
              <div className="flex h-8 w-8 items-center justify-center rounded-full border border-amber-200 bg-white text-amber-500 shadow-sm">
                <Camera size={12} />
              </div>

              <div className="mt-1 rounded bg-white px-1.5 py-0.5 shadow-sm">
                <p className="text-[7px] font-bold text-slate-600">
                  CCTV 03
                </p>

                <p className="text-[6px] text-slate-400">
                  180m
                </p>
              </div>
            </div>
          </div>

          {/* =================================================
              CAMERA 04
          ================================================= */}

          <div className="absolute bottom-[24%] right-[20%] translate-x-1/2 translate-y-1/2">
            <div className="flex flex-col items-center">
              <div className="flex h-8 w-8 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-400 shadow-sm">
                <Camera size={12} />
              </div>

              <div className="mt-1 rounded bg-white px-1.5 py-0.5 shadow-sm">
                <p className="text-[7px] font-bold text-slate-600">
                  CCTV 04
                </p>

                <p className="text-[6px] text-slate-400">
                  240m
                </p>
              </div>
            </div>
          </div>

          {/* =================================================
              PREDICTED LOCATION
          ================================================= */}

          <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
            <div className="flex flex-col items-center">
              <div className="relative flex h-10 w-10 items-center justify-center rounded-full bg-red-500 text-white shadow-lg shadow-red-200 ring-4 ring-white">
                <MapPin size={17} />

                <span className="absolute inset-[-6px] rounded-full border border-indigo-300/60" />
              </div>

              <div className="mt-1 rounded-md bg-white px-2 py-1 text-center shadow-md">
                <p className="text-[7px] font-bold text-red-600">
                  PREDICTED LOCATION
                </p>

                <p className="text-[6px] text-slate-400">
                  Cash-out zone
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between border-t border-slate-100 bg-white px-3.5 py-2.5">
          <div className="flex items-center gap-2">
            <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600">
              <Radio size={11} />
            </span>

            <div>
              <p className="text-[9px] font-semibold text-slate-700">
                4 nearby camera nodes
              </p>

              <p className="text-[8px] text-slate-400">
                2 currently providing visual coverage
              </p>
            </div>
          </div>

          <span className="text-[8px] font-medium text-slate-400">
            Relative positions
          </span>
        </div>
      </div>

      {/* =====================================================
          CAMERA LIST
      ===================================================== */}

      <div className="mt-5 space-y-3">
        {cameras.map((camera) => {
          const status = statusStyles[camera.status];
          const isAvailable = camera.status === "Available";

          return (
            <div
              key={camera.id}
              className="overflow-hidden rounded-xl border border-slate-100 bg-slate-50/50 transition-all duration-200 hover:border-slate-200 hover:bg-white hover:shadow-sm"
            >
              {/* =================================================
                  VIDEO PREVIEW — ONLY AVAILABLE CAMERAS
              ================================================= */}

              {isAvailable && (
                <div className="relative h-[135px] overflow-hidden bg-slate-900">
                  <img
                    src={camera.image}
                    alt={`${camera.name} CCTV`}
                    className="h-full w-full object-cover"
                  />

                  {/* CCTV dark overlay */}

                  <div className="absolute inset-0 bg-gradient-to-t from-black/65 via-transparent to-black/20" />

                  {/* Camera ID */}

                  <div className="absolute left-2.5 top-2.5 flex items-center gap-1.5 rounded-md bg-black/50 px-2 py-1 backdrop-blur">
                    <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-red-500" />

                    <span className="text-[7px] font-bold uppercase tracking-wider text-white">
                      {camera.id} · LIVE
                    </span>
                  </div>

                  {/* Timestamp */}

                  <div className="absolute right-2.5 top-2.5 rounded-md bg-black/50 px-2 py-1 backdrop-blur">
                    <span className="text-[7px] font-medium text-white">
                      19:42:16
                    </span>
                  </div>

                  {/* Play button */}

                  <button
                    type="button"
                    className="absolute left-1/2 top-1/2 flex h-11 w-11 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-white/95 text-slate-900 shadow-xl transition hover:scale-105"
                    aria-label={`Play ${camera.name}`}
                  >
                    <Play
                      size={17}
                      fill="currentColor"
                      className="ml-0.5"
                    />
                  </button>

                  {/* Bottom label */}

                  <div className="absolute bottom-0 left-0 right-0 flex items-center justify-between px-3 py-2">
                    <div>
                      <p className="text-[9px] font-semibold text-white">
                        {camera.name}
                      </p>

                      <p className="text-[7px] text-white/60">
                        {camera.type}
                      </p>
                    </div>

                    <button
                      type="button"
                      className="flex h-6 w-6 items-center justify-center rounded-md bg-black/40 text-white backdrop-blur"
                    >
                      <Maximize2 size={11} />
                    </button>
                  </div>
                </div>
              )}

              {/* =================================================
                  CAMERA INFO
              ================================================= */}

              <div className="p-3">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex min-w-0 items-start gap-3">
                    {!isAvailable && (
                      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-white text-slate-500 shadow-sm">
                        <Camera size={14} />
                      </div>
                    )}

                    <div className="min-w-0">
                      <p className="text-[12px] font-semibold text-slate-800">
                        {camera.name}
                      </p>

                      <p className="mt-0.5 text-[9px] text-slate-400">
                        {camera.type}
                      </p>
                    </div>
                  </div>

                  <div className="flex shrink-0 items-center gap-1.5">
                    <span
                      className={`h-1.5 w-1.5 rounded-full ${status.dot}`}
                    />

                    <span
                      className={`text-[9px] font-semibold ${status.text}`}
                    >
                      {camera.status}
                    </span>
                  </div>
                </div>

                {/* Metadata */}

                <div className="mt-2.5 flex flex-wrap items-center gap-x-4 gap-y-1.5">
                  <div className="flex items-center gap-1 text-[9px] text-slate-500">
                    <MapPin size={11} />
                    {camera.distance}m away
                  </div>

                  <div className="flex items-center gap-1 text-[9px] text-slate-500">
                    <Radio size={11} />
                    {camera.coverage}m coverage
                  </div>

                  <div className="flex items-center gap-1 text-[9px] text-slate-400">
                    <Clock3 size={11} />
                    Verified {camera.verified}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* =====================================================
          PRIVACY / SCOPE
      ===================================================== */}

      <div className="mt-4 flex items-start gap-2 rounded-xl border border-slate-100 bg-slate-50 px-3 py-2.5">
        <ShieldCheck
          size={13}
          className="mt-0.5 shrink-0 text-slate-400"
        />

        <p className="text-[9px] leading-4 text-slate-500">
          Physical intelligence shows camera availability and
          coverage only. No facial recognition or identity matching
          is used.
        </p>
      </div>
    </div>
  );
}