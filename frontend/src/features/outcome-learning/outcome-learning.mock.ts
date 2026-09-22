import type {
  OutcomeStatus,
  RiskLevel,
} from "../../data/cases.mock";

export type AccuracyPoint = {
  date: string;
  accuracy: number;
  validatedPredictions: number;
};

export type OutcomeLogItem = {
  id: string;
  caseId: string;
  predictionId: string;
  predictedLocationId: string;
  predictedLocationName: string;
  predictedWindow: string;
  actualLocation?: string;
  actualTime?: string;
  status: OutcomeStatus;
  recordedAt: string;
};

export type OutcomeDraft = {
  caseId: string;
  predictionId: string;
  predictedLocationId: string;
  predictedLocationName: string;
  predictedWindow: string;
  actualLocation?: string;
  actualTime?: string;
  status: OutcomeStatus;
};

export const initialAccuracyHistory: AccuracyPoint[] = [
  {
    date: "01 Sep",
    accuracy: 61,
    validatedPredictions: 18,
  },
  {
    date: "04 Sep",
    accuracy: 64,
    validatedPredictions: 24,
  },
  {
    date: "07 Sep",
    accuracy: 63,
    validatedPredictions: 31,
  },
  {
    date: "10 Sep",
    accuracy: 68,
    validatedPredictions: 39,
  },
  {
    date: "13 Sep",
    accuracy: 70,
    validatedPredictions: 47,
  },
  {
    date: "16 Sep",
    accuracy: 69,
    validatedPredictions: 55,
  },
  {
    date: "19 Sep",
    accuracy: 72,
    validatedPredictions: 64,
  },
  {
    date: "22 Sep",
    accuracy: 74,
    validatedPredictions: 72,
  },
];

export const mockOutcomeLog: OutcomeLogItem[] = [
  {
    id: "OUT-1042-001",
    caseId: "CC-1042",
    predictionId: "PRED-1042",
    predictedLocationId: "ATM-JAS-01",
    predictedLocationName: "SBI ATM — Jasola",
    predictedWindow: "19:30–21:00",
    actualLocation: "SBI ATM — Jasola",
    actualTime: "20:11",
    status: "Correct",
    recordedAt: "22 Sep, 21:18",
  },
  {
    id: "OUT-1041-001",
    caseId: "CC-1041",
    predictionId: "PRED-1041",
    predictedLocationId: "ATM-OKH-02",
    predictedLocationName: "HDFC ATM — Okhla",
    predictedWindow: "20:00–21:30",
    actualLocation: "Okhla Main Road",
    actualTime: "21:04",
    status: "Partial",
    recordedAt: "21 Sep, 22:02",
  },
  {
    id: "OUT-1039-001",
    caseId: "CC-1039",
    predictionId: "PRED-1039",
    predictedLocationId: "ATM-KAL-03",
    predictedLocationName: "ICICI ATM — Kalkaji",
    predictedWindow: "20:30–22:00",
    status: "Not Observed",
    recordedAt: "20 Sep, 22:31",
  },
  {
    id: "OUT-1037-001",
    caseId: "CC-1037",
    predictionId: "PRED-1037",
    predictedLocationId: "ATM-JAS-01",
    predictedLocationName: "SBI ATM — Jasola",
    predictedWindow: "19:00–20:30",
    actualLocation: "Kalkaji",
    actualTime: "20:46",
    status: "Incorrect",
    recordedAt: "18 Sep, 21:05",
  },
  {
    id: "OUT-1035-001",
    caseId: "CC-1035",
    predictionId: "PRED-1035",
    predictedLocationId: "ATM-OKH-02",
    predictedLocationName: "HDFC ATM — Okhla",
    predictedWindow: "20:00–21:00",
    actualLocation: "HDFC ATM — Okhla",
    actualTime: "20:38",
    status: "Correct",
    recordedAt: "16 Sep, 21:19",
  },
];

export const outcomeScore: Record<OutcomeStatus, number | null> = {
  Correct: 1,
  Partial: 0.5,
  Incorrect: 0,
  "Not Observed": null,
};

export function calculateAccuracy(log: OutcomeLogItem[]): number {
  const validated = log.filter(
    (item) => outcomeScore[item.status] !== null,
  );

  if (validated.length === 0) {
    return 0;
  }

  const score = validated.reduce(
    (total, item) => total + (outcomeScore[item.status] ?? 0),
    0,
  );

  return Math.round((score / validated.length) * 100);
}

export function getOutcomeCounts(log: OutcomeLogItem[]) {
  return {
    correct: log.filter((item) => item.status === "Correct").length,
    partial: log.filter((item) => item.status === "Partial").length,
    incorrect: log.filter((item) => item.status === "Incorrect").length,
    notObserved: log.filter(
      (item) => item.status === "Not Observed",
    ).length,
  };
}

export function createOutcomeId() {
  return `OUT-${Date.now()}-${Math.random()
    .toString(36)
    .slice(2, 7)}`;
}

export function formatTodayLabel() {
  return new Intl.DateTimeFormat("en-GB", {
    day: "2-digit",
    month: "short",
  }).format(new Date());
}

export function formatRecordedAt() {
  return new Intl.DateTimeFormat("en-GB", {
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date());
}