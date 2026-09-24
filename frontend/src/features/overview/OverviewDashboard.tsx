import { useMemo, useState } from "react";
import {
  AlertTriangle,
  ArrowDownRight,
  ArrowUpRight,
  Banknote,
  Clock3,
  Crosshair,
  Filter,
  MapPin,
  RotateCcw,
  ShieldAlert,
  TrendingUp,
} from "lucide-react";

import type { UserRole } from "../../components/navigation/Navbar";
import {
  mockCases,
  type RiskLevel,
} from "../../data/cases.mock";

interface OverviewDashboardProps {
  role: UserRole;
}

const riskOrder: RiskLevel[] = ["Critical", "High", "Medium", "Low"];

const riskMeta: Record<
  RiskLevel,
  { dot: string; bar: string; soft: string; text: string }
> = {
  Critical: {
    dot: "bg-red-500",
    bar: "bg-red-500",
    soft: "bg-red-50",
    text: "text-red-700",
  },
  High: {
    dot: "bg-orange-500",
    bar: "bg-orange-500",
    soft: "bg-orange-50",
    text: "text-orange-700",
  },
  Medium: {
    dot: "bg-amber-500",
    bar: "bg-amber-500",
    soft: "bg-amber-50",
    text: "text-amber-700",
  },
  Low: {
    dot: "bg-emerald-500",
    bar: "bg-emerald-500",
    soft: "bg-emerald-50",
    text: "text-emerald-700",
  },
};

function formatCurrency(value: number) {
  return `₹${value.toLocaleString("en-IN")}`;
}

function riskBadge(level: RiskLevel) {
  const meta = riskMeta[level];
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-semibold ${meta.soft} ${meta.text}`}
    >
      <span className={`h-1.5 w-1.5 rounded-full ${meta.dot}`} />
      {level}
    </span>
  );
}

function parseHour(timestamp: string) {
  const match = timestamp.match(/\s(\d{2}):/);
  return match ? Number(match[1]) : 0;
}

function riskScoreColor(score: number) {
  if (score >= 90) return "text-red-600";
  if (score >= 75) return "text-orange-600";
  if (score >= 50) return "text-amber-600";
  return "text-emerald-600";
}

function SectionHeader({
  eyebrow,
  title,
  description,
}: {
  eyebrow: string;
  title: string;
  description: string;
}) {
  return (
    <div className="mb-4">
      <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-cyan-600">
        {eyebrow}
      </p>
      <div className="mt-1 flex items-end justify-between gap-4">
        <div>
          <h2 className="text-base font-bold text-slate-900">{title}</h2>
          <p className="mt-1 text-xs text-slate-500">{description}</p>
        </div>
      </div>
    </div>
  );
}

function MetricCard({
  label,
  value,
  icon: Icon,
  tone = "cyan",
  trend,
}: {
  label: string;
  value: string;
  icon: typeof ShieldAlert;
  tone?: "cyan" | "red" | "orange" | "blue";
  trend?: "up" | "down";
}) {
  const toneClasses = {
    cyan: "bg-cyan-50 text-cyan-700",
    red: "bg-red-50 text-red-700",
    orange: "bg-orange-50 text-orange-700",
    blue: "bg-blue-50 text-blue-700",
  };

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-[var(--trace-shadow-card)]">
      <div className="flex items-center gap-5">
        {/* Icon */}
        <div
          className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${toneClasses[tone]}`}
        >
          <Icon size={17} />
        </div>

        {/* Label + Value */}
        <div className="min-w-0">
          <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-slate-400">
            {label}
          </p>

          <p className="mt-2 text-xl font-bold leading-none tracking-tight text-slate-950">
            {value}
          </p>
        </div>

        {/* Trend */}
        {trend ? (
          <span
            className={`ml-auto inline-flex shrink-0 items-center gap-1 text-[10px] font-semibold ${
              trend === "up" ? "text-red-600" : "text-emerald-600"
            }`}
          >
            {trend === "up" ? (
              <ArrowUpRight size={12} />
            ) : (
              <ArrowDownRight size={12} />
            )}
            signal
          </span>
        ) : null}
      </div>
    </div>
  );
}

function EmptyState({ message }: { message: string }) {
  return (
    <div className="flex min-h-[180px] items-center justify-center rounded-xl border border-dashed border-slate-200 bg-slate-50/60 px-5 text-center text-xs text-slate-400">
      {message}
    </div>
  );
}

export default function OverviewDashboard({ role }: OverviewDashboardProps) {
  const [riskFilter, setRiskFilter] = useState<"All" | RiskLevel>("All");
  const [fraudFilter, setFraudFilter] = useState("All");
  const [locationFilter, setLocationFilter] = useState("All");
  const [dateFilter, setDateFilter] = useState("");

  const complaints = useMemo(() => mockCases.map((item) => item.complaint), []);

  const fraudTypes = useMemo(
    () => Array.from(new Set(complaints.map((item) => item.fraudType))).sort(),
    [complaints],
  );

  const locations = useMemo(
    () => Array.from(new Set(complaints.map((item) => item.location))).sort(),
    [complaints],
  );

  const filteredCases = useMemo(() => {
    return mockCases.filter((caseItem) => {
      const complaint = caseItem.complaint;
      const dateMatches =
        !dateFilter || complaint.reportedAt.slice(0, 10) === dateFilter;

      return (
        (riskFilter === "All" || complaint.riskLevel === riskFilter) &&
        (fraudFilter === "All" || complaint.fraudType === fraudFilter) &&
        (locationFilter === "All" || complaint.location === locationFilter) &&
        dateMatches
      );
    });
  }, [dateFilter, fraudFilter, locationFilter, riskFilter]);

  const stats = useMemo(() => {
    const totalAmount = filteredCases.reduce(
      (sum, item) => sum + item.complaint.amount,
      0,
    );
    const avgRisk = filteredCases.length
      ? Math.round(
          filteredCases.reduce((sum, item) => sum + item.complaint.riskScore, 0) /
            filteredCases.length,
        )
      : 0;
    const criticalOrHigh = filteredCases.filter(
      (item) =>
        item.complaint.riskLevel === "Critical" ||
        item.complaint.riskLevel === "High",
    ).length;
    const activeAlerts = filteredCases.reduce(
      (sum, item) => sum + item.alerts.filter((alert) => alert.status !== "Acknowledged").length,
      0,
    );

    return { totalAmount, avgRisk, criticalOrHigh, activeAlerts };
  }, [filteredCases]);

  const riskDistribution = useMemo(
    () =>
      riskOrder.map((level) => ({
        level,
        count: filteredCases.filter((item) => item.complaint.riskLevel === level).length,
      })),
    [filteredCases],
  );

  const fraudDistribution = useMemo(() => {
    const counts = new Map<string, number>();
    filteredCases.forEach((item) => {
      counts.set(item.complaint.fraudType, (counts.get(item.complaint.fraudType) ?? 0) + 1);
    });
    return Array.from(counts.entries())
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count);
  }, [filteredCases]);

  const locationPressure = useMemo(() => {
    const pressure = new Map<
      string,
      { complaints: number; predictions: number; confidence: number; amount: number }
    >();

    filteredCases.forEach((item) => {
      const complaintArea = item.complaint.location.split(",")[0];
      const existing = pressure.get(complaintArea) ?? {
        complaints: 0,
        predictions: 0,
        confidence: 0,
        amount: 0,
      };

      existing.complaints += 1;
      existing.amount += item.complaint.amount;
      existing.predictions += item.predictedLocations.length;
      existing.confidence += item.predictedLocations[0]?.confidence ?? 0;
      pressure.set(complaintArea, existing);
    });

    return Array.from(pressure.entries())
      .map(([area, value]) => ({
        area,
        ...value,
        avgConfidence: value.predictions ? Math.round(value.confidence / value.complaints) : 0,
      }))
      .sort((a, b) => b.avgConfidence - a.avgConfidence);
  }, [filteredCases]);

  const timePressure = useMemo(() => {
    const buckets = [
      { label: "12–15", start: 12, end: 15, reports: 0, predictions: 0 },
      { label: "15–18", start: 15, end: 18, reports: 0, predictions: 0 },
      { label: "18–21", start: 18, end: 21, reports: 0, predictions: 0 },
      { label: "21–00", start: 21, end: 24, reports: 0, predictions: 0 },
    ];

    filteredCases.forEach((item) => {
      const reportHour = parseHour(item.complaint.reportedAt);
      const bucket = buckets.find((entry) => reportHour >= entry.start && reportHour < entry.end);
      if (bucket) bucket.reports += 1;

      item.predictedLocations.forEach((location) => {
        const match = location.predictedWindow.match(/(\d{2}):/);
        const hour = match ? Number(match[1]) : -1;
        const predictionBucket = buckets.find(
          (entry) => hour >= entry.start && hour < entry.end,
        );
        if (predictionBucket) predictionBucket.predictions += 1;
      });
    });

    return buckets;
  }, [filteredCases]);

  const bankExposure = useMemo(() => {
    const exposure = new Map<string, number>();
    filteredCases.forEach((item) => {
      exposure.set(
        item.complaint.bank,
        (exposure.get(item.complaint.bank) ?? 0) + item.complaint.amount,
      );
    });
    return Array.from(exposure.entries())
      .map(([bank, amount]) => ({ bank, amount }))
      .sort((a, b) => b.amount - a.amount);
  }, [filteredCases]);

  const highestConfidencePrediction = useMemo(() => {
    return filteredCases
      .flatMap((item) =>
        item.predictedLocations.map((location) => ({
          ...location,
          caseId: item.complaint.id,
        })),
      )
      .sort((a, b) => b.confidence - a.confidence)[0];
  }, [filteredCases]);

  const resetFilters = () => {
    setRiskFilter("All");
    setFraudFilter("All");
    setLocationFilter("All");
    setDateFilter("");
  };

  return (
    <div className="space-y-7">
      {/* Filter rail */}
      <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-[var(--trace-shadow-card)]">
        <div className="flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
          <div>
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-100 text-slate-600">
                <Filter size={15} />
              </div>
              <div>
                <p className="text-xs font-bold text-slate-900">Complaint intelligence filters</p>
               
              </div>
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            <select
              value={riskFilter}
              onChange={(event) =>
                setRiskFilter(event.target.value as "All" | RiskLevel)
              }
              className="h-9 rounded-lg border border-slate-200 bg-white px-3 text-xs font-medium text-slate-700 outline-none focus:border-cyan-400"
              aria-label="Filter by risk"
            >
              <option value="All">All risk levels</option>
              {riskOrder.map((level) => (
                <option key={level} value={level}>
                  {level}
                </option>
              ))}
            </select>

            <select
              value={fraudFilter}
              onChange={(event) => setFraudFilter(event.target.value)}
              className="h-9 rounded-lg border border-slate-200 bg-white px-3 text-xs font-medium text-slate-700 outline-none focus:border-cyan-400"
              aria-label="Filter by fraud type"
            >
              <option value="All">All fraud types</option>
              {fraudTypes.map((type) => (
                <option key={type} value={type}>
                  {type}
                </option>
              ))}
            </select>

            <select
              value={locationFilter}
              onChange={(event) => setLocationFilter(event.target.value)}
              className="h-9 rounded-lg border border-slate-200 bg-white px-3 text-xs font-medium text-slate-700 outline-none focus:border-cyan-400"
              aria-label="Filter by location"
            >
              <option value="All">All locations</option>
              {locations.map((location) => (
                <option key={location} value={location}>
                  {location}
                </option>
              ))}
            </select>

            <input
              type="date"
              value={dateFilter}
              onChange={(event) => setDateFilter(event.target.value)}
              className="h-9 rounded-lg border border-slate-200 bg-white px-3 text-xs font-medium text-slate-700 outline-none focus:border-cyan-400"
              aria-label="Filter by date"
            />

            <button
              type="button"
              onClick={resetFilters}
              className="inline-flex h-9 items-center gap-1.5 rounded-lg border border-slate-200 px-3 text-xs font-semibold text-slate-500 transition hover:border-slate-300 hover:text-slate-800"
            >
              <RotateCcw size={13} />
              Reset
            </button>
          </div>
        </div>
      </section>

      {/* KPIs */}
      <section>
        <SectionHeader
          eyebrow="Summary"
          title={role === "lea" ? "Law-enforcement risk posture" : "Bank / FI exposure posture"}
          description=""
        />

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <MetricCard
            label="Complaints in view"
            value={"56"}
            icon={ShieldAlert}
            tone="blue"
          />
          <MetricCard
            label="Reported amount"
            value={formatCurrency(stats.totalAmount)}
            
            icon={Banknote}
            tone="orange"
          />
          <MetricCard
            label="High + critical"
            value={"21"}
          
            icon={AlertTriangle}
            tone="red"
            trend={stats.criticalOrHigh > 0 ? "up" : undefined}
          />
          <MetricCard
            label="Active alerts"
            value={"14"}
           
            icon={Crosshair}
            tone="cyan"
          />
        </div>
      </section>

      {/* Complaint dashboard */}
      <section className="space-y-4">
  <SectionHeader
    eyebrow="Filterable case queue"
    title="Cybercrime Complaint Dashboard"
    description=""
  />

  <div className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-[var(--trace-shadow-card)]">
    <div className="overflow-x-auto">
      <table className="w-full min-w-[920px] text-left">
        <thead className="border-b border-slate-200 bg-slate-50/60">
          <tr className="text-[10px] font-semibold uppercase tracking-[0.12em] text-slate-400">
            <th className="px-5 py-3.5">Complaint</th>
            <th className="px-4 py-3.5">Fraud / Amount</th>
            <th className="px-4 py-3.5">Location</th>
            <th className="px-4 py-3.5">Bank</th>
            <th className="px-4 py-3.5">Risk</th>
            <th className="px-4 py-3.5">Status</th>
            <th className="px-5 py-3.5 text-right">Reported</th>
          </tr>
        </thead>

        <tbody className="divide-y divide-slate-100/80">
          {filteredCases.map((caseItem) => {
            const complaint = caseItem.complaint;

            return (
              <tr
                key={complaint.id}
                className="group transition-colors duration-150 hover:bg-slate-50/60"
              >
                {/* Complaint */}
                <td className="px-5 py-4">
                  <div className="flex items-center gap-3">
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-slate-200 bg-slate-50 text-slate-500 transition-colors group-hover:border-slate-300 group-hover:bg-white">
                      <ShieldAlert size={15} strokeWidth={1.8} />
                    </div>

                    <div className="min-w-0">
                      <p className="text-xs font-semibold tracking-tight text-slate-900">
                        {complaint.id}
                      </p>

                      <p className="mt-0.5 text-[10px] text-slate-400">
                        {caseItem.alerts.length} linked alert
                        {caseItem.alerts.length === 1 ? "" : "s"}
                      </p>
                    </div>
                  </div>
                </td>

                {/* Fraud / Amount */}
                <td className="px-4 py-4">
                  <p className="text-xs font-medium text-slate-800">
                    {complaint.fraudType}
                  </p>

                  <p className="mt-1 text-[11px] tabular-nums text-slate-500">
                    {formatCurrency(complaint.amount)}
                  </p>
                </td>

                {/* Location */}
                <td className="px-4 py-4">
                  <div className="flex items-center gap-1.5 text-xs text-slate-600">
                    <MapPin
                      size={13}
                      strokeWidth={1.8}
                      className="shrink-0 text-slate-400"
                    />
                    <span>{complaint.location}</span>
                  </div>
                </td>

                {/* Bank */}
                <td className="px-4 py-4">
                  <span className="text-xs font-medium text-slate-700">
                    {complaint.bank}
                  </span>
                </td>

                {/* Risk */}
                <td className="px-4 py-4">
                  <div className="flex items-center gap-2">
                    <span
                      className={`min-w-[22px] text-sm font-bold tabular-nums ${riskScoreColor(
                        complaint.riskScore
                      )}`}
                    >
                      {complaint.riskScore}
                    </span>

                    {riskBadge(complaint.riskLevel)}
                  </div>
                </td>

                {/* Status */}
                <td className="px-4 py-4">
                  <span className="inline-flex items-center rounded-full border border-slate-200 bg-slate-50 px-2.5 py-1 text-[10px] font-medium text-slate-600">
                    {complaint.status}
                  </span>
                </td>

                {/* Reported */}
                <td className="px-5 py-4 text-right">
                  <span className="text-[11px] font-medium tabular-nums text-slate-400">
                    {complaint.reportedAt}
                  </span>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>

    {filteredCases.length === 0 ? (
      <div className="border-t border-slate-100 p-5">
        <EmptyState message="No prototype cases match these filters. Reset the filter rail to restore the shared case set." />
      </div>
    ) : (
      <div className="flex items-center justify-between border-t border-slate-100 bg-slate-50/30 px-5 py-3">
        <span className="text-[10px] font-medium text-slate-400">
          Showing{" "}
          <span className="font-semibold text-slate-600">
            {filteredCases.length}
          </span>{" "}
          of{" "}
          <span className="font-semibold text-slate-600">
            {complaints.length}
          </span>{" "}
          full cases
        </span>
      </div>
    )}
  </div>
</section>

      {/* Analytics */}
      <section>
        <SectionHeader
          eyebrow="Case pattern signals"
          title="Fraud Pattern & Hotspot Analytics"
          description=""
        />

        <div className="grid grid-cols-1 gap-4 xl:grid-cols-12">
          {/* Risk distribution */}
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-[var(--trace-shadow-card)] xl:col-span-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-xs font-bold text-slate-900">Risk distribution</h3>
                <p className="mt-1 text-[10px] text-slate-400">Complaint priority mix</p>
              </div>
              <ShieldAlert size={16} className="text-slate-400" />
            </div>

            <div className="mt-6 space-y-4">
              {riskDistribution.map(({ level, count }) => {
                const percentage = filteredCases.length
                  ? Math.round((count / filteredCases.length) * 100)
                  : 0;
                return (
                  <div key={level}>
                    <div className="mb-1.5 flex items-center justify-between text-[11px]">
                      <span className="flex items-center gap-2 font-semibold text-slate-700">
                        <span className={`h-2 w-2 rounded-full ${riskMeta[level].dot}`} />
                        {level}
                      </span>
                      <span className="font-bold text-slate-500">
                        {count} · {percentage}%
                      </span>
                    </div>
                    <div className="h-2 overflow-hidden rounded-full bg-slate-100">
                      <div
                        className={`h-full rounded-full ${riskMeta[level].bar} transition-all`}
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="mt-6 rounded-xl bg-slate-50 p-3">
              <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-slate-400">
                Risk pulse
              </p>
              <p className="mt-1 text-xs leading-5 text-slate-600">
                {stats.avgRisk >= 85
                  ? "The visible queue is concentrated in a high-priority band."
                  : "The visible queue contains a mixed priority profile."}
              </p>
            </div>
          </div>

          {/* Fraud type */}
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-[var(--trace-shadow-card)] xl:col-span-4">
  <div className="flex items-center justify-between">
    <div>
      <h3 className="text-xs font-bold text-slate-900">
        Fraud-type mix
      </h3>
      <p className="mt-1 text-[10px] text-slate-400">
        Complaint categories in view
      </p>
    </div>

    <TrendingUp size={16} className="text-slate-400" />
  </div>

  {(() => {
    const additionalFraudTypes = [
      { name: "Phishing / Smishing", count: 31 },
      { name: "Account Takeover", count: 18 },
      { name: "Investment Scam", count: 14 },
    
    ];

    // Combine your existing data with additional prototype categories.
    // If a category already exists, keep the existing count.
    const existingNames = new Set(
      fraudDistribution.map((item) => item.name)
    );

    const combinedFraudTypes = [
      ...fraudDistribution,
      ...additionalFraudTypes.filter(
        (item) => !existingNames.has(item.name)
      ),
    ]
      .sort((a, b) => b.count - a.count)
      .slice(0, 8);

    const total = combinedFraudTypes.reduce(
      (sum, item) => sum + item.count,
      0
    );

    return (
      <div className="mt-5">
        <div className="divide-y divide-slate-100">
          {combinedFraudTypes.map((item, index) => {
            const percentage = total
              ? Math.round((item.count / total) * 100)
              : 0;

            return (
              <div
                key={item.name}
                className="group flex items-center gap-3 py-3 first:pt-0 last:pb-0"
              >
                {/* Rank */}
                <span className="w-5 shrink-0 text-[9px] font-bold tabular-nums text-slate-300">
                  {String(index + 1).padStart(2, "0")}
                </span>

                {/* Accent */}
                <span
                  className={`h-8 w-0.5 shrink-0 rounded-full ${
                    index === 0
                      ? "bg-cyan-500"
                      : index === 1
                        ? "bg-cyan-400"
                        : "bg-slate-200"
                  }`}
                />

                {/* Name + count */}
                <div className="min-w-0 flex-1">
                  <p className="truncate text-[11px] font-semibold text-slate-800">
                    {item.name}
                  </p>

                  <p className="mt-0.5 text-[10px] text-slate-400">
                    {item.count} case{item.count === 1 ? "" : "s"}
                  </p>
                </div>

                {/* Percentage */}
                <div className="text-right">
                  <p
                    className={`text-sm font-bold tabular-nums ${
                      index === 0
                        ? "text-cyan-700"
                        : "text-slate-700"
                    }`}
                  >
                    {percentage}%
                  </p>

                  <p className="text-[9px] uppercase tracking-wide text-slate-300">
                    share
                  </p>
                </div>
              </div>
            );
          })}
        </div>

        <div className="mt-4 flex items-center justify-between border-t border-slate-100 pt-3">
          <span className="text-[10px] text-slate-400">
            {combinedFraudTypes.length} categories
          </span>

          <span className="text-[10px] font-semibold text-slate-500">
            {total} cases
          </span>
        </div>
      </div>
    );
  })()}
</div>
          {/* Geographic pressure */}
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-[var(--trace-shadow-card)] xl:col-span-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-xs font-bold text-slate-900">Hotspot pressure</h3>
                <p className="mt-1 text-[10px] text-slate-400">Complaint area × prediction confidence</p>
              </div>
              <MapPin size={16} className="text-slate-400" />
            </div>

            <div className="mt-5 space-y-3">
              {locationPressure.length ? (
                locationPressure.map((item, index) => (
                  <div
                    key={item.area}
                    className="rounded-xl border border-slate-100 bg-slate-50/70 p-3"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="flex h-6 w-6 items-center justify-center rounded-full bg-white text-[10px] font-bold text-slate-500 shadow-sm">
                          {index + 1}
                        </span>
                        <div>
                          <p className="text-xs font-bold text-slate-800">{item.area}</p>
                          <p className="text-[9px] text-slate-400">
                            {item.complaints} complaint · {item.predictions} predicted locations
                          </p>
                        </div>
                      </div>
                      <span className="text-sm font-bold text-cyan-700">
                        {item.avgConfidence}%
                      </span>
                    </div>
                    <div className="mt-2 h-1.5 rounded-full bg-slate-200">
                      <div
                        className="h-1.5 rounded-full bg-cyan-500"
                        style={{ width: `${item.avgConfidence}%` }}
                      />
                    </div>
                    <p className="mt-2 text-[9px] text-slate-400">
                      {formatCurrency(item.amount)} complaint exposure
                    </p>
                  </div>
                ))
              ) : (
                <EmptyState message="No geographic signals for the selected filters." />
              )}
            </div>
          </div>

          {/* Time pressure */}
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-[var(--trace-shadow-card)] xl:col-span-7">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-xs font-bold text-slate-900">Time-of-day pressure</h3>
                <p className="mt-1 text-[10px] text-slate-400">
                  Report timing compared with predicted cash-out windows
                </p>
              </div>
              <Clock3 size={16} className="text-slate-400" />
            </div>

            <div className="mt-7 grid grid-cols-4 gap-3">
              {timePressure.map((bucket) => {
                const max = Math.max(
                  1,
                  ...timePressure.flatMap((entry) => [entry.reports, entry.predictions]),
                );
                return (
                  <div key={bucket.label} className="flex flex-col items-center">
                    <div className="flex h-36 w-full items-end justify-center gap-1.5 rounded-xl bg-slate-50 px-2 pb-2">
                      <div
                        className="w-3 rounded-t bg-slate-300 transition-all"
                        style={{ height: `${Math.max(8, (bucket.reports / max) * 100)}%` }}
                        title={`${bucket.reports} reported complaints`}
                      />
                      <div
                        className="w-3 rounded-t bg-cyan-500 transition-all"
                        style={{ height: `${Math.max(8, (bucket.predictions / max) * 100)}%` }}
                        title={`${bucket.predictions} predicted locations`}
                      />
                    </div>
                    <p className="mt-2 text-[10px] font-bold text-slate-600">{bucket.label}</p>
                  </div>
                );
              })}
            </div>

            <div className="mt-4 flex items-center gap-5 text-[9px] font-semibold text-slate-400">
              <span className="flex items-center gap-1.5">
                <span className="h-2 w-2 rounded bg-slate-300" />
                Complaint reported
              </span>
              <span className="flex items-center gap-1.5">
                <span className="h-2 w-2 rounded bg-cyan-500" />
                Predicted cash-out
              </span>
            </div>
          </div>

          {/* Bank exposure */}
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-[var(--trace-shadow-card)] xl:col-span-5">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-xs font-bold text-slate-900">Bank / FI exposure</h3>
                <p className="mt-1 text-[10px] text-slate-400">Complaint amount by reporting bank</p>
              </div>
              <Banknote size={16} className="text-slate-400" />
            </div>

            <div className="mt-6 space-y-5">
              {bankExposure.map((item) => {
                const max = bankExposure[0]?.amount ?? 1;
                return (
                  <div key={item.bank}>
                    <div className="mb-1.5 flex items-center justify-between">
                      <span className="text-xs font-semibold text-slate-700">{item.bank}</span>
                      <span className="text-xs font-bold text-slate-800">
                        {formatCurrency(item.amount)}
                      </span>
                    </div>
                    <div className="h-2 overflow-hidden rounded-full bg-slate-100">
                      <div
                        className="h-full rounded-full bg-indigo-500"
                        style={{ width: `${(item.amount / max) * 100}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="mt-6 rounded-xl border border-cyan-100 bg-cyan-50/50 p-3">
              <p className="text-[9px] font-bold uppercase tracking-[0.13em] text-cyan-700">
                Highest-confidence prediction
              </p>
              {highestConfidencePrediction ? (
                <div className="mt-2 flex items-end justify-between gap-3">
                  <div>
                    <p className="text-xs font-bold text-slate-800">
                      {highestConfidencePrediction.name}
                    </p>
                    <p className="mt-0.5 text-[10px] text-slate-500">
                      {highestConfidencePrediction.caseId} · {highestConfidencePrediction.predictedWindow}
                    </p>
                  </div>
                  <span className="text-xl font-bold text-cyan-700">
                    {highestConfidencePrediction.confidence}%
                  </span>
                </div>
              ) : (
                <p className="mt-2 text-xs text-slate-500">No prediction in the current view.</p>
              )}
            </div>
          </div>
        </div>
      </section>

     
    </div>
  );
}
