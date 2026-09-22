import type { ReactNode } from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowRight,
  BrainCircuit,
  MapPinned,
  ShieldCheck,
  Network,
} from "lucide-react";



export default function LandingPage() {
  const navigate = useNavigate();

  const handleEnterDashboard = () => {
    navigate("/app/overview");
  };
  return (
    <div className="min-h-screen overflow-hidden bg-[#F7F9FC] text-slate-900">
      {/* Background decoration */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -right-32 -top-32 h-96 w-96 rounded-full bg-cyan-100/40 blur-3xl" />
        <div className="absolute -bottom-40 -left-32 h-96 w-96 rounded-full bg-blue-100/40 blur-3xl" />
      </div>

      {/* Navbar */}
      <header className="relative z-10 border-b border-slate-200/70 bg-white/70 backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-[1400px] items-center justify-between px-6">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-900 text-white">
              <ShieldCheck size={19} />
            </div>

            <div>
              <div className="text-[15px] font-bold tracking-tight">
                TRACE
              </div>

              <div className="text-[9px] font-medium uppercase tracking-[0.16em] text-slate-400">
                Cyber Intelligence
              </div>
            </div>
          </div>

          <div className="hidden text-sm text-slate-400 sm:block">
            Transaction Risk & Cash-out Estimation
          </div>
        </div>
      </header>

      {/* Hero */}
      <main className="relative z-10 mx-auto max-w-[1200px] px-6">
        <section className="flex min-h-[calc(100vh-64px)] flex-col items-center justify-center py-20 text-center">
          
          {/* AI badge */}
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-cyan-200 bg-cyan-50 px-3 py-1.5 text-xs font-medium text-cyan-700">
            <BrainCircuit size={14} />
            Predictive Cybercrime Intelligence
          </div>

          <h1 className="max-w-4xl text-5xl font-bold tracking-[-0.04em] text-slate-950 sm:text-6xl">
            Predict where fraud money
            <span className="block bg-gradient-to-r from-cyan-600 to-blue-600 bg-clip-text text-transparent">
              will be cashed out.
            </span>
          </h1>

          <p className="mt-6 max-w-2xl text-base leading-7 text-slate-500 sm:text-lg">
            TRACE transforms cybercrime complaints and financial patterns
            into actionable predictions of where and when suspicious funds
            are likely to be withdrawn.
          </p>

          {/* CTA */}
          <button
            onClick={handleEnterDashboard}
            className="group mt-9 inline-flex items-center gap-2 rounded-xl bg-slate-900 px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-slate-900/10 transition hover:-translate-y-0.5 hover:bg-slate-800"
          >
            Enter Dashboard

            <ArrowRight
              size={16}
              className="transition-transform group-hover:translate-x-1"
            />
          </button>

          {/* Intelligence flow */}
          <div className="mt-20 grid w-full max-w-4xl grid-cols-1 gap-4 md:grid-cols-3">
            <FlowCard
              icon={<Network size={18} />}
              number="01"
              title="Detect"
              description="Analyse complaints and financial activity."
            />

            <FlowCard
              icon={<MapPinned size={18} />}
              number="02"
              title="Predict"
              description="Estimate likely cash-out locations and time."
            />

            <FlowCard
              icon={<ShieldCheck size={18} />}
              number="03"
              title="Intervene"
              description="Deliver intelligence to authorised stakeholders."
            />
          </div>
        </section>
      </main>
    </div>
  );
}

interface FlowCardProps {
  icon: ReactNode;
  number: string;
  title: string;
  description: string;
}

function FlowCard({
  icon,
  number,
  title,
  description,
}: FlowCardProps) {
  return (
    <div className="rounded-2xl border border-slate-200/80 bg-white/80 p-5 text-left shadow-sm backdrop-blur">
      <div className="flex items-center justify-between">
        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-cyan-50 text-cyan-600">
          {icon}
        </div>

        <span className="text-xs font-semibold text-slate-300">
          {number}
        </span>
      </div>

      <h3 className="mt-5 text-sm font-semibold text-slate-800">
        {title}
      </h3>

      <p className="mt-1 text-xs leading-5 text-slate-400">
        {description}
      </p>
    </div>
  );
}