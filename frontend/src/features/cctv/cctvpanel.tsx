import { Camera, Clock3, MapPin, Radio, ShieldCheck } from "lucide-react";

const cameras = [
  {
    name: "Jasola Street Camera",
    type: "Street surveillance",
    distance: 80,
    coverage: 100,
    status: "Available",
    verified: "2 min ago",
  },
  {
    name: "ATM Camera — Jasola",
    type: "ATM / cash point",
    distance: 120,
    coverage: 50,
    status: "Available",
    verified: "5 min ago",
  },
  {
    name: "Okhla Traffic Camera",
    type: "Traffic surveillance",
    distance: 180,
    coverage: 120,
    status: "Pending",
    verified: "18 min ago",
  },
  {
    name: "Commercial Lane Camera",
    type: "Street surveillance",
    distance: 240,
    coverage: 80,
    status: "Unavailable",
    verified: "1 hr ago",
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
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">

      {/* Header */}
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

          <p className="mt-3 text-xs leading-5 text-slate-500">
            Camera availability and coverage around the predicted location.
          </p>
        </div>


        {/* Coverage count */}
        <div className="shrink-0 rounded-xl border border-slate-100 bg-slate-50 px-3 py-2 text-right">

          <p className="text-[9px] font-semibold uppercase tracking-wider text-slate-400">
            Online
          </p>

          <p className="mt-0.5 text-sm font-bold text-slate-800">
            {availableCameras}/{cameras.length}
          </p>

        </div>

      </div>

        {/* Coverage visualization */}
        <div className="mt-5 overflow-hidden rounded-xl border border-slate-100 bg-slate-50/70">

        <div className="flex items-center justify-between border-b border-slate-100 px-3.5 py-2.5">
            <div>
            <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-slate-600">
                Coverage around predicted location
            </p>

            <p className="mt-0.5 text-[9px] text-slate-400">
                Nearby camera nodes and approximate coverage
            </p>
            </div>

            <div className="flex items-center gap-1.5 text-[9px] text-slate-400">
            <span className="h-1.5 w-1.5 rounded-full bg-indigo-500" />
            Predicted point
            </div>
        </div>


        {/* Visual area */}
        <div className="relative h-[170px] overflow-hidden">

            {/* Coverage circles */}
            <div className="absolute left-1/2 top-1/2 h-28 w-28 -translate-x-1/2 -translate-y-1/2 rounded-full border border-indigo-200 bg-indigo-50/40" />

            <div className="absolute left-1/2 top-1/2 h-20 w-20 -translate-x-1/2 -translate-y-1/2 rounded-full border border-indigo-200/80" />


            {/* Connection lines */}
            <div className="absolute left-[28%] top-[31%] h-px w-[24%] rotate-[25deg] bg-slate-200" />

            <div className="absolute left-[53%] top-[37%] h-px w-[25%] -rotate-[22deg] bg-slate-200" />

            <div className="absolute left-[26%] top-[68%] h-px w-[27%] -rotate-[12deg] bg-slate-200" />


            {/* Camera 1 */}
            <div className="absolute left-[18%] top-[20%] flex flex-col items-center">

            <div className="flex h-7 w-7 items-center justify-center rounded-full border border-emerald-200 bg-white text-emerald-600 shadow-sm">
                <Camera size={12} />
            </div>

            <span className="mt-1 text-[8px] font-semibold text-slate-500">
                CCTV 01
            </span>

            </div>


            {/* Camera 2 */}
            <div className="absolute right-[17%] top-[25%] flex flex-col items-center">

            <div className="flex h-7 w-7 items-center justify-center rounded-full border border-emerald-200 bg-white text-emerald-600 shadow-sm">
                <Camera size={12} />
            </div>

            <span className="mt-1 text-[8px] font-semibold text-slate-500">
                CCTV 02
            </span>

            </div>


            {/* Camera 3 */}
            <div className="absolute left-[20%] bottom-[18%] flex flex-col items-center">

            <div className="flex h-7 w-7 items-center justify-center rounded-full border border-amber-200 bg-white text-amber-600 shadow-sm">
                <Camera size={12} />
            </div>

            <span className="mt-1 text-[8px] font-semibold text-slate-500">
                CCTV 03
            </span>

            </div>


            {/* Predicted location */}
            <div className="absolute left-1/2 top-1/2 flex -translate-x-1/2 -translate-y-1/2 flex-col items-center">

            <div className="relative flex h-10 w-10 items-center justify-center rounded-full bg-indigo-600 text-white shadow-lg shadow-indigo-200">

                <MapPin size={17} />

                <span className="absolute inset-0 animate-ping rounded-full border border-indigo-400 opacity-30" />

            </div>

            <div className="mt-1.5 rounded-md bg-white px-2 py-1 text-center shadow-sm">

                <p className="text-[8px] font-bold text-slate-700">
                PREDICTED LOCATION
                </p>

                <p className="text-[7px] text-slate-400">
                Cash-out zone
                </p>

            </div>

            </div>

        </div>


        {/* Coverage summary */}
        <div className="flex items-center justify-between border-t border-slate-100 bg-white px-3.5 py-2.5">

            <div className="flex items-center gap-2">

            <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600">
                <Radio size={11} />
            </span>

            <div>
                <p className="text-[9px] font-semibold text-slate-700">
                3 nearby camera nodes
                </p>

                <p className="text-[8px] text-slate-400">
                2 currently available
                </p>
            </div>

            </div>

            <span className="text-[8px] font-medium text-slate-400">
            Approximate coverage
            </span>

        </div>

        </div>        
      {/* Camera list */}
      <div className="mt-5 space-y-2.5">

        {cameras.map((camera) => {

          const status = statusStyles[camera.status];

          return (
            <div
              key={camera.name}
              className="rounded-xl border border-slate-100 bg-slate-50/50 p-3 transition-all duration-200 hover:border-slate-200 hover:bg-white hover:shadow-sm"
            >

              <div className="flex items-start gap-3">

                {/* Camera icon */}
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-white text-slate-500 shadow-sm">
                  <Camera size={14} />
                </div>


                {/* Camera information */}
                <div className="min-w-0 flex-1">

                  <div className="flex items-start justify-between gap-3">

                    <div>
                      <p className="text-[12px] font-semibold text-slate-800">
                        {camera.name}
                      </p>

                      <p className="mt-0.5 text-[9px] text-slate-400">
                        {camera.type}
                      </p>
                    </div>


                    {/* Status */}
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


                  {/* Camera metadata */}
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

            </div>
          );
        })}

      </div>


      {/* Privacy / scope note */}
      <div className="mt-4 flex items-start gap-2 rounded-xl border border-slate-100 bg-slate-50 px-3 py-2.5">

        <ShieldCheck
          size={13}
          className="mt-0.5 shrink-0 text-slate-400"
        />

        <p className="text-[9px] leading-4 text-slate-500">
          Physical intelligence shows camera availability and coverage only.
          No facial recognition or identity matching is used.
        </p>

      </div>

    </div>
  );
}