import { Bell, ChevronDown, ShieldCheck } from "lucide-react";
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
    <header className="sticky top-0 z-50 border-b border-slate-200/80 bg-white/90 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-[1600px] items-center justify-between px-6">
        {/* Brand */}
        <NavLink
          to="/app/overview"
          className="flex items-center gap-3"
        >
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-900 text-white shadow-sm">
            <ShieldCheck size={19} strokeWidth={2} />
          </div>

          <div>
            <div className="text-[15px] font-bold tracking-tight text-slate-900">
              TRACE
            </div>

            <div className="text-[9px] font-medium uppercase tracking-[0.16em] text-slate-400">
              Cyber Intelligence
            </div>
          </div>
        </NavLink>

        {/* Navigation */}
        <nav className="absolute left-1/2 flex -translate-x-1/2 items-center gap-1 rounded-xl bg-slate-100/80 p-1">
          {tabs.map((tab) => (
            <NavLink
              key={tab.path}
              to={tab.path}
              className={({ isActive }) =>
                `rounded-lg px-4 py-2 text-sm font-medium transition-all ${
                  isActive
                    ? "bg-white text-slate-900 shadow-sm"
                    : "text-slate-500 hover:text-slate-800"
                }`
              }
            >
              {tab.label}
            </NavLink>
          ))}
        </nav>

        {/* Right Controls */}
        <div className="flex items-center gap-3">
          {/* Role Switcher */}
          <div className="relative">
            <select
              value={role}
              onChange={(event) =>
                onRoleChange(event.target.value as UserRole)
              }
              className="cursor-pointer appearance-none rounded-xl border border-slate-200 bg-white py-2 pl-3 pr-9 text-sm font-medium text-slate-700 shadow-sm outline-none transition hover:border-slate-300 focus:border-cyan-400"
            >
              <option value="lea">LEA</option>
              <option value="bank">Bank / FI</option>
            </select>

            <ChevronDown
              size={14}
              className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-slate-400"
            />
          </div>

          {/* Alerts */}
          <button
            type="button"
            className="relative flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-500 shadow-sm transition hover:border-slate-300 hover:text-slate-800"
          >
            <Bell size={18} />

            <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-red-500 ring-2 ring-white" />
          </button>
        </div>
      </div>
    </header>
  );
}