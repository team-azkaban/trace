import type { RiskLevel } from "../../data/cases.mock";

export type CoverageScenarioSize = 3 | 5 | 8;

export type CoverageScenario = {
  size: CoverageScenarioSize;
  label: string;
  baselineCoverage: number;
};

export type AdditionalCoverageHotspot = {
  id: string;
  name: string;
  type: "ATM" | "Branch";
  area: string;
  confidence: number;
  predictedWindow: string;
  riskLevel: RiskLevel;
  bank: string;
};

export const coverageScenarios: CoverageScenario[] = [
  {
    size: 3,
    label: "3 Locations",
    baselineCoverage: 65,
  },
  {
    size: 5,
    label: "5 Locations",
    baselineCoverage: 82,
  },
  {
    size: 8,
    label: "8 Locations",
    baselineCoverage: 96,
  },
];

/**
 * Additional locations used only by the frontend simulator.
 *
 * These are mock values and are not real predictions.
 * They exist so that investigators can experiment with
 * different monitoring combinations.
 */
export const additionalCoverageHotspots: AdditionalCoverageHotspot[] = [
  {
    id: "SIM-KAL-06",
    name: "Axis ATM",
    type: "ATM",
    area: "Kalkaji",
    confidence: 49,
    predictedWindow: "20:00–22:00",
    riskLevel: "Medium",
    bank: "Axis Bank",
  },
  {
    id: "SIM-JAM-07",
    name: "HDFC ATM",
    type: "ATM",
    area: "Jamia Nagar",
    confidence: 46,
    predictedWindow: "20:30–22:30",
    riskLevel: "Medium",
    bank: "HDFC Bank",
  },
  {
    id: "SIM-OKH-08",
    name: "SBI ATM",
    type: "ATM",
    area: "Okhla Phase I",
    confidence: 43,
    predictedWindow: "21:00–23:00",
    riskLevel: "Low",
    bank: "State Bank of India",
  },
  {
    id: "SIM-JAS-09",
    name: "ICICI ATM",
    type: "ATM",
    area: "Jasola Extension",
    confidence: 41,
    predictedWindow: "21:00–23:00",
    riskLevel: "Low",
    bank: "ICICI Bank",
  },
  {
    id: "SIM-KAL-10",
    name: "SBI ATM",
    type: "ATM",
    area: "Govindpuri",
    confidence: 38,
    predictedWindow: "21:30–23:30",
    riskLevel: "Low",
    bank: "State Bank of India",
  },
];

export const riskWeight: Record<RiskLevel, number> = {
  Low: 0.65,
  Medium: 0.85,
  High: 1.1,
  Critical: 1.3,
};

/**
 * Converts prediction information into an operational
 * priority score for the frontend simulation.
 *
 * This is intentionally a transparent prototype formula.
 */
export function getCoveragePriorityScore(input: {
  confidence: number;
  riskLevel: RiskLevel;
}): number {
  const confidenceFactor = input.confidence / 100;
  const riskFactor = riskWeight[input.riskLevel];

  return confidenceFactor * riskFactor;
}