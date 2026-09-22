import {
  Bell,
  ChevronDown,
  MapPin,
  ShieldCheck,
} from "lucide-react";
import { NavLink } from "react-router-dom";

export type UserRole = "lea" | "bank";

const tabs = [
  {
    path: "/app/overview",
    label: "Overview",
  },
  {
    path: "/app/predict",
    label: "Predict & Investigate",
  },
  {
    path: "/app/response",
    label: "Response",
  },
];

interface NavbarProps {
  role: UserRole;
  onRoleChange: (role: UserRole) => void;
}

export default function Navbar({
  role,
  onRoleChange,
}: NavbarProps) {
  return (
    <header className="sticky top-0 z-50 border-b border-slate-200/70 bg-white/80 backdrop-blur-2xl">
      <div className="mx-auto flex h-[68px] max-w-[1400px] items-center px-5 lg:px-7">

        {/* ================================================================ */}
        {/* BRAND                                                             */}
        {/* ================================================================ */}

        <NavLink
          to="/"
          className="group flex shrink-0 items-center gap-3"
        >
          {/* Logo */}
          <div className="relative flex h-9 w-9 items-center justify-center rounded-[11px] bg-slate-950 text-white shadow-[0_3px_10px_rgba(15,23,42,0.16)] transition-transform duration-200 group-hover:scale-[1.03]">
            <ShieldCheck
              size={18}
              strokeWidth={2.2}
            />

            <span className="absolute -right-0.5 -top-0.5 h-2 w-2 rounded-full bg-cyan-400 ring-2 ring-white" />
          </div>

          {/* Wordmark */}
          <div className="leading-none">
            <div className="text-[15px] font-bold tracking-[-0.02em] text-slate-950">
              TRACE
            </div>

            <div className="mt-1 text-[8px] font-semibold uppercase tracking-[0.19em] text-slate-400">
              Cyber Intelligence
            </div>
          </div>
        </NavLink>

        {/* ================================================================ */}
        {/* NAVIGATION                                                        */}
        {/* ================================================================ */}

        <nav className="absolute left-1/2 hidden -translate-x-1/2 items-center rounded-[13px]  p-1 shadow-[inset_0_1px_0_rgba(255,255,255,0.7)] md:flex">
          {tabs.map((tab) => (
            <NavLink
              key={tab.path}
              to={tab.path}
              className={({ isActive }) =>
                [
                  "relative rounded-[10px] px-4 py-2 text-[12px] font-semibold",
                  "transition-all duration-200",
                  "whitespace-nowrap",
                  isActive
                    ? [
                        "bg-white text-slate-950",
                        "shadow-[0_1px_3px_rgba(15,23,42,0.08)]",
                        "ring-1 ring-slate-200/60",
                      ].join(" ")
                    : [
                        "text-slate-500",
                        "hover:bg-white/60",
                        "hover:text-slate-800",
                      ].join(" "),
                ].join(" ")
              }
            >
              {({ isActive }) => (
                <span className="flex items-center gap-2">
                  {isActive && (
                    <span className="h-1.5 w-1.5 rounded-full bg-cyan-500" />
                  )}

                  {tab.label}
                </span>
              )}
            </NavLink>
          ))}
        </nav>

        {/* ================================================================ */}
        {/* RIGHT CONTROLS                                                    */}
        {/* ================================================================ */}

        <div className="ml-auto flex items-center gap-2.5">

          {/* Region indicator */}
          <div
            className={[
              "hidden items-center gap-2 rounded-[11px]",
              "border border-slate-200 bg-white",
              "px-3 py-2",
              "shadow-[0_1px_3px_rgba(15,23,42,0.04)]",
              "sm:flex",
            ].join(" ")}
            title="Active intelligence region"
          >
            <div className="flex h-6 w-6 items-center justify-center rounded-lg bg-cyan-50 text-cyan-600">
              <MapPin
                size={13}
                strokeWidth={2}
              />
            </div>

            <div className="leading-none">
              <div className="text-[8px] font-semibold uppercase tracking-[0.14em] text-slate-400">
                Region
              </div>

              <div className="mt-1 text-[11px] font-bold text-slate-700">
                South-East Delhi
              </div>
            </div>

            <span className="ml-0.5 h-1.5 w-1.5 rounded-full bg-emerald-500" />
          </div>

          {/* Divider */}
          <div className="mx-0.5 hidden h-7 w-px bg-slate-200 sm:block" />

          {/* Role switcher */}
          <div className="relative">
            <select
              value={role}
              onChange={(event) =>
                onRoleChange(
                  event.target.value as UserRole,
                )
              }
              aria-label="Select user role"
              className={[
                "h-10 cursor-pointer appearance-none rounded-[11px]",
                "border border-slate-200 bg-white",
                "py-0 pl-3 pr-9",
                "text-[11px] font-semibold text-slate-700",
                "shadow-[0_1px_3px_rgba(15,23,42,0.05)]",
                "outline-none",
                "transition-all duration-200",
                "hover:border-slate-300 hover:bg-slate-50",
                "focus:border-cyan-400 focus:ring-2 focus:ring-cyan-100",
              ].join(" ")}
            >
              <option value="lea">
                LEA
              </option>

              <option value="bank">
                Bank / FI
              </option>
            </select>

            <ChevronDown
              size={14}
              strokeWidth={2}
              className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-slate-400"
            />
          </div>

          {/* Divider */}
          <div className="mx-0.5 hidden h-7 w-px bg-slate-200 sm:block" />

          {/* Notifications */}
          <button
            type="button"
            aria-label="Notifications"
            className={[
              "relative flex h-10 w-10 items-center justify-center",
              "rounded-[11px]",
              "border border-slate-200 bg-white",
              "text-slate-500",
              "shadow-[0_1px_3px_rgba(15,23,42,0.05)]",
              "transition-all duration-200",
              "hover:border-slate-300",
              "hover:bg-slate-50",
              "hover:text-slate-900",
              "active:scale-95",
            ].join(" ")}
          >
            <Bell
              size={17}
              strokeWidth={1.9}
            />

            {/* Notification dot */}
            <span className="absolute right-[8px] top-[7px] h-[7px] w-[7px] rounded-full bg-red-500 ring-2 ring-white" />
          </button>
        </div>
      </div>

      {/* Mobile navigation */}
      <div className="border-t border-slate-100 bg-white/70 px-4 py-2 md:hidden">
        <nav className="flex gap-1 overflow-x-auto">
          {tabs.map((tab) => (
            <NavLink
              key={tab.path}
              to={tab.path}
              className={({ isActive }) =>
                [
                  "shrink-0 rounded-lg px-3 py-2 text-[11px] font-semibold",
                  isActive
                    ? "bg-slate-900 text-white"
                    : "text-slate-500 hover:bg-slate-100 hover:text-slate-800",
                ].join(" ")
              }
            >
              {tab.label}
            </NavLink>
          ))}
        </nav>
      </div>
    </header>
  );
}