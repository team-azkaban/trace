import { useNavigate } from "react-router-dom";
import {
  ArrowRight,
  BrainCircuit,
  Target,
  Bell,
  ShieldCheck,
} from "lucide-react";

import bg1 from "../assets/bg1.png";

export default function LandingPage() {
  const navigate = useNavigate();

  const handleEnterDashboard = () => {
    navigate("/app/overview");
  };

  return (
    <main className="relative min-h-screen overflow-hidden bg-[#f7f9fc] text-slate-900">
      {/* Hero background */}
      <div className="absolute inset-0">
        <img
          src={bg1}
          alt=""
          className="h-full w-full object-cover object-center"
        />

        {/* Soft overlay */}
        <div className="absolute inset-0 bg-gradient-to-r from-white via-white/25 to-transparent" />

        {/* Bottom fade */}
        <div className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-[#f7f9fc]/30 to-transparent" />

        {/* Very subtle wash */}
        <div className="absolute inset-0 bg-white/8" />
      </div>

      {/* Hero content */}
      <section className="relative z-10 flex min-h-screen items-center">
        <div className="mx-auto w-full max-w-[1400px] px-8 py-20 sm:px-12 lg:px-16">
          <div className="max-w-[620px]">

            {/* TRACE Logo */}
            <div className="mb-10 flex items-center">
              {/* Logo mark */}
              <svg
                width="40"
                height="40"
                viewBox="0 0 48 48"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                className="shrink-0"
              >
                <path
                  d="M7 10.5L24 6L41 10.5L24 16L7 10.5Z"
                  fill="#173BCE"
                />

                <path
                  d="M7 10.5V25.5L24 42V16L7 10.5Z"
                  fill="#315BEA"
                />

                <path
                  d="M24 16V42L41 25.5V10.5L24 16Z"
                  fill="#1E4BDB"
                />

                <path
                  d="M15 13.2L24 10.8L33 13.2L24 16L15 13.2Z"
                  fill="#7C9AFF"
                />
              </svg>

              {/* TRACE text */}
              <div className="ml-3 flex items-center">
                <span className="text-[25px] font-extrabold tracking-[-0.045em] text-slate-950">
                  TRACE
                </span>

                {/* Divider */}
                <span className="mx-4 h-8 w-px bg-slate-300" />

                {/* Subtitle */}
                <div className="text-[11px] font-medium leading-[1.25] text-slate-500">
                  <div>Transaction Risk &amp;</div>
                  <div>Cash-out Estimation</div>
                </div>
              </div>
            </div>

            {/* Main heading */}
            <h1 className="text-3xl font-bold leading-[1.1] tracking-[-0.035em] text-slate-950 sm:text-6xl lg:text-[47px] mt-20">
              AI That Predicts
              
              Where Fraud
              
              <span className=" ml-3 text-blue-500">
                Moves Next.
              </span>
            </h1>

            {/* Description */}
            <p className="mt-7 max-w-[500px] text-base leading-6 text-slate-600 sm:text-sm">
              TRACE combines artificial intelligence, financial intelligence,
              and geographic data to predict where suspicious funds
              are likely to be cashed out.
            </p>

           

            {/* CTA */}
            <button
              type="button"
              onClick={handleEnterDashboard}
              className="group mt-9 inline-flex items-center gap-3 rounded-xl bg-slate-950 px-6 py-3.5 text-sm font-semibold text-white shadow-xl shadow-blue-900/15 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-2xl"
            >
              Enter Dashboard

              <ArrowRight
                size={17}
                className="transition-transform duration-300 group-hover:translate-x-1"
              />
            </button>

            {/* Predict / Alert / Enable */}
            <div className="mt-12 flex flex-wrap gap-x-8 gap-y-6 sm:gap-x-10">

              {/* Predict */}
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-blue-50 ring-1 ring-blue-100">
                  <Target
                    size={20}
                    strokeWidth={2}
                    className="text-blue-600"
                  />
                </div>

                <div>
                  <p className="text-sm font-semibold text-slate-900">
                    Predict
                  </p>
                  <p className="text-xs leading-5 text-slate-500">
                    future cash-out
                    <br />
                    locations
                  </p>
                </div>
              </div>

              {/* Alert */}
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-blue-50 ring-1 ring-blue-100">
                  <Bell
                    size={20}
                    strokeWidth={2}
                    className="text-blue-600"
                  />
                </div>

                <div>
                  <p className="text-sm font-semibold text-slate-900">
                    Alert
                  </p>
                  <p className="text-xs leading-5 text-slate-500">
                    the right
                    <br />
                    stakeholders
                  </p>
                </div>
              </div>

              {/* Enable */}
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-blue-50 ring-1 ring-blue-100">
                  <ShieldCheck
                    size={20}
                    strokeWidth={2}
                    className="text-blue-600"
                  />
                </div>

                <div>
                  <p className="text-sm font-semibold text-slate-900">
                    Enable
                  </p>
                  <p className="text-xs leading-5 text-slate-500">
                    faster, smarter
                    <br />
                    intervention
                  </p>
                </div>
              </div>

            </div>
          </div>
        </div>
      </section>
    </main>
  );
}