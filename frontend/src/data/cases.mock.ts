export type RiskLevel = "Low" | "Medium" | "High" | "Critical";

export type OutcomeStatus =
  | "Correct"
  | "Partial"
  | "Incorrect"
  | "Not Observed";

export interface Complaint {
  id: string;
  fraudType: string;
  amount: number;
  reportedAt: string;
  location: string;
  bank: string;
  riskScore: number;
  riskLevel: RiskLevel;
  status: "Open" | "Under Investigation" | "Resolved";
}

export interface Account {
  id: string;
  type: "Victim" | "Suspected Mule" | "Beneficiary";
  bank: string;
  holderLabel: string;
  riskLevel?: RiskLevel;
}

export interface Transaction {
  id: string;
  fromAccount: string;
  toAccount: string;
  amount: number;
  timestamp: string;
  type: "Transfer" | "Cash Withdrawal";
  location?: string;
  status: "Completed" | "Pending" | "Flagged";
}

export interface PredictedLocation {
  id: string;
  name: string;
  type: "ATM" | "Branch";
  area: string;
  latitude: number;
  longitude: number;
  confidence: number;
  distanceKm: number;
  predictedWindow: string;
  riskLevel: RiskLevel;
  bank: string;
  reasonSummary: string;
}

export interface Camera {
  id: string;
  name: string;
  type: "ATM Camera" | "Street Camera" | "Traffic Camera";
  area: string;
  distanceMeters: number;
  coverageRadiusMeters: number;
  status: "Available" | "Pending" | "Unavailable";
  lastVerified: string;
}

export interface EvidenceFactor {
  id: string;
  category: "Pattern" | "Timing" | "Network" | "Amount" | "Location";
  title: string;
  description: string;
  contribution: number;
}

export interface Alert {
  id: string;
  caseId: string;
  severity: RiskLevel;
  title: string;
  location: string;
  predictedWindow: string;
  confidence: number;
  createdAt: string;
  status: "New" | "Acknowledged" | "Investigating";
}

export interface Outcome {
  predictionId: string;
  predictedLocationId: string;
  predictedWindow: string;
  actualLocation?: string;
  actualTime?: string;
  status: OutcomeStatus;
  recordedAt?: string;
}

export interface CaseData {
  complaint: Complaint;

  accounts: Account[];

  transactions: Transaction[];

  predictedLocations: PredictedLocation[];

  evidenceFactors: EvidenceFactor[];

  cameras: Camera[];

  alerts: Alert[];

  outcome: Outcome;

  linkedComplaintIds: string[];
}

/* -------------------------------------------------------------------------- */
/* Shared prototype cases                                                      */
/* -------------------------------------------------------------------------- */

/**
 * CASE 01
 *
 * Main showcase investigation.
 *
 * Story:
 * A UPI fraud complaint leads to a suspected mule account.
 * Multiple transfers converge into the account.
 * TRACE predicts a likely cash-out around Jasola / Okhla.
 */
export const CASE_1042: CaseData = {
  complaint: {
    id: "CC-1042",
    fraudType: "UPI Fraud",
    amount: 180000,
    reportedAt: "2026-09-22 14:32",
    location: "Jasola, South-East Delhi",
    bank: "SBI",
    riskScore: 91,
    riskLevel: "Critical",
    status: "Under Investigation",
  },

  accounts: [
    {
      id: "ACC-V-1042",
      type: "Victim",
      bank: "SBI",
      holderLabel: "Victim Account",
    },
    {
      id: "ACC-M-7812",
      type: "Suspected Mule",
      bank: "HDFC Bank",
      holderLabel: "Suspected Mule Account",
      riskLevel: "Critical",
    },
    {
      id: "ACC-B-4421",
      type: "Beneficiary",
      bank: "ICICI Bank",
      holderLabel: "Linked Beneficiary",
      riskLevel: "High",
    },
  ],

  transactions: [
    {
      id: "TXN-88021",
      fromAccount: "ACC-V-1042",
      toAccount: "ACC-M-7812",
      amount: 120000,
      timestamp: "2026-09-22 13:41",
      type: "Transfer",
      status: "Flagged",
    },
    {
      id: "TXN-88022",
      fromAccount: "ACC-V-1042",
      toAccount: "ACC-M-7812",
      amount: 60000,
      timestamp: "2026-09-22 13:46",
      type: "Transfer",
      status: "Flagged",
    },
    {
      id: "TXN-88023",
      fromAccount: "ACC-M-7812",
      toAccount: "ACC-B-4421",
      amount: 40000,
      timestamp: "2026-09-22 13:58",
      type: "Transfer",
      status: "Flagged",
    },
    {
      id: "TXN-88024",
      fromAccount: "ACC-M-7812",
      toAccount: "ATM-JAS-01",
      amount: 80000,
      timestamp: "2026-09-22 14:10",
      type: "Cash Withdrawal",
      location: "Jasola",
      status: "Pending",
    },
  ],

  predictedLocations: [
    {
      id: "ATM-JAS-01",
      name: "SBI ATM — Jasola",
      type: "ATM",
      area: "Jasola",
      latitude: 28.5408,
      longitude: 77.2922,
      confidence: 87,
      distanceKm: 2.1,
      predictedWindow: "19:30–21:00",
      riskLevel: "Critical",
      bank: "SBI",
      reasonSummary:
        "Strong network, timing and historical cash-out pattern match.",
    },
    {
      id: "ATM-OKH-02",
      name: "HDFC ATM — Okhla",
      type: "ATM",
      area: "Okhla",
      latitude: 28.5355,
      longitude: 77.276,
      confidence: 68,
      distanceKm: 3.4,
      predictedWindow: "20:00–21:30",
      riskLevel: "High",
      bank: "HDFC Bank",
      reasonSummary:
        "Related account activity and proximity to previous transactions.",
    },
    {
      id: "ATM-KAL-03",
      name: "ICICI ATM — Kalkaji",
      type: "ATM",
      area: "Kalkaji",
      latitude: 28.5494,
      longitude: 77.2588,
      confidence: 54,
      distanceKm: 5.2,
      predictedWindow: "20:30–22:00",
      riskLevel: "Medium",
      bank: "ICICI Bank",
      reasonSummary:
        "Secondary candidate based on account movement and timing.",
    },
  ],

  evidenceFactors: [
    {
      id: "EF-1042-01",
      category: "Network",
      title: "Linked mule-account activity",
      description:
        "The suspected mule account is connected to multiple suspicious transfers.",
      contribution: 29,
    },
    {
      id: "EF-1042-02",
      category: "Timing",
      title: "Recurring evening cash-out pattern",
      description:
        "Historical prototype activity shows elevated cash-out activity during the evening window.",
      contribution: 23,
    },
    {
      id: "EF-1042-03",
      category: "Location",
      title: "Jasola–Okhla proximity",
      description:
        "The predicted ATM lies close to recent financial activity associated with the case.",
      contribution: 19,
    },
    {
      id: "EF-1042-04",
      category: "Amount",
      title: "High-value incoming transfer",
      description:
        "The recent ₹1.8L complaint amount increases the case priority.",
      contribution: 14,
    },
    {
      id: "EF-1042-05",
      category: "Pattern",
      title: "Related complaint cluster",
      description:
        "Several prototype complaints share similar transaction and timing characteristics.",
      contribution: 11,
    },
  ],

  cameras: [
    {
      id: "CAM-JAS-01",
      name: "ATM Camera — Jasola",
      type: "ATM Camera",
      area: "Jasola",
      distanceMeters: 25,
      coverageRadiusMeters: 30,
      status: "Available",
      lastVerified: "18:42",
    },
    {
      id: "CAM-JAS-02",
      name: "Jasola Street Camera",
      type: "Street Camera",
      area: "Jasola",
      distanceMeters: 140,
      coverageRadiusMeters: 100,
      status: "Available",
      lastVerified: "18:37",
    },
    {
      id: "CAM-OKH-01",
      name: "Okhla Traffic Camera",
      type: "Traffic Camera",
      area: "Okhla",
      distanceMeters: 420,
      coverageRadiusMeters: 150,
      status: "Pending",
      lastVerified: "17:55",
    },
    {
      id: "CAM-JAS-03",
      name: "Commercial Lane Camera",
      type: "Street Camera",
      area: "Jasola",
      distanceMeters: 280,
      coverageRadiusMeters: 80,
      status: "Unavailable",
      lastVerified: "16:20",
    },
  ],

  alerts: [
    {
      id: "ALT-1042-01",
      caseId: "CC-1042",
      severity: "Critical",
      title: "High-probability cash-out predicted",
      location: "SBI ATM — Jasola",
      predictedWindow: "19:30–21:00",
      confidence: 87,
      createdAt: "18:05",
      status: "New",
    },
  ],

  outcome: {
    predictionId: "PRED-1042",
    predictedLocationId: "ATM-JAS-01",
    predictedWindow: "19:30–21:00",
    status: "Not Observed",
  },

  linkedComplaintIds: [
    "CC-1037",
    "CC-1019",
    "CC-1008",
  ],
};

/**
 * CASE 02
 *
 * Secondary showcase case.
 *
 * Story:
 * Investment scam complaint with a lower but still significant
 * predicted cash-out risk around Okhla / Jamia Nagar.
 */
export const CASE_1041: CaseData = {
  complaint: {
    id: "CC-1041",
    fraudType: "Investment Scam",
    amount: 75000,
    reportedAt: "2026-09-22 13:48",
    location: "Okhla, South-East Delhi",
    bank: "HDFC Bank",
    riskScore: 82,
    riskLevel: "High",
    status: "Open",
  },

  accounts: [
    {
      id: "ACC-V-1041",
      type: "Victim",
      bank: "HDFC Bank",
      holderLabel: "Victim Account",
    },
    {
      id: "ACC-M-6634",
      type: "Suspected Mule",
      bank: "ICICI Bank",
      holderLabel: "Suspected Mule Account",
      riskLevel: "High",
    },
    {
      id: "ACC-B-2198",
      type: "Beneficiary",
      bank: "Axis Bank",
      holderLabel: "Linked Beneficiary",
      riskLevel: "Medium",
    },
  ],

  transactions: [
    {
      id: "TXN-77031",
      fromAccount: "ACC-V-1041",
      toAccount: "ACC-M-6634",
      amount: 50000,
      timestamp: "2026-09-22 13:12",
      type: "Transfer",
      status: "Flagged",
    },
    {
      id: "TXN-77032",
      fromAccount: "ACC-V-1041",
      toAccount: "ACC-M-6634",
      amount: 25000,
      timestamp: "2026-09-22 13:18",
      type: "Transfer",
      status: "Flagged",
    },
    {
      id: "TXN-77033",
      fromAccount: "ACC-M-6634",
      toAccount: "ACC-B-2198",
      amount: 30000,
      timestamp: "2026-09-22 13:29",
      type: "Transfer",
      status: "Flagged",
    },
  ],

  predictedLocations: [
    {
      id: "ATM-OKH-04",
      name: "ICICI ATM — Okhla",
      type: "ATM",
      area: "Okhla",
      latitude: 28.5317,
      longitude: 77.2758,
      confidence: 81,
      distanceKm: 1.7,
      predictedWindow: "18:45–20:15",
      riskLevel: "High",
      bank: "ICICI Bank",
      reasonSummary:
        "Strong account-network and timing similarity with previous activity.",
    },
    {
      id: "ATM-JAM-02",
      name: "Axis ATM — Jamia Nagar",
      type: "ATM",
      area: "Jamia Nagar",
      latitude: 28.5622,
      longitude: 77.2885,
      confidence: 63,
      distanceKm: 2.9,
      predictedWindow: "19:00–20:30",
      riskLevel: "High",
      bank: "Axis Bank",
      reasonSummary:
        "Secondary candidate based on location and transaction timing.",
    },
    {
      id: "ATM-KAL-05",
      name: "HDFC ATM — Kalkaji",
      type: "ATM",
      area: "Kalkaji",
      latitude: 28.5421,
      longitude: 77.2605,
      confidence: 48,
      distanceKm: 4.1,
      predictedWindow: "19:30–21:00",
      riskLevel: "Medium",
      bank: "HDFC Bank",
      reasonSummary:
        "Moderate historical and geographic similarity.",
    },
  ],

  evidenceFactors: [
    {
      id: "EF-1041-01",
      category: "Network",
      title: "Suspected mule account identified",
      description:
        "Recent transfers converge on a suspected intermediary account.",
      contribution: 28,
    },
    {
      id: "EF-1041-02",
      category: "Timing",
      title: "Rapid transfer sequence",
      description:
        "Funds moved through the suspected account shortly after receipt.",
      contribution: 24,
    },
    {
      id: "EF-1041-03",
      category: "Location",
      title: "Okhla transaction proximity",
      description:
        "Recent activity is geographically close to the predicted cash-out zone.",
      contribution: 18,
    },
    {
      id: "EF-1041-04",
      category: "Pattern",
      title: "Similar scam pattern",
      description:
        "The transaction sequence resembles other prototype investment-scam cases.",
      contribution: 17,
    },
    {
      id: "EF-1041-05",
      category: "Amount",
      title: "Multiple split transfers",
      description:
        "The complaint amount was divided across multiple transactions.",
      contribution: 13,
    },
  ],

  cameras: [
    {
      id: "CAM-OKH-04",
      name: "ATM Camera — Okhla",
      type: "ATM Camera",
      area: "Okhla",
      distanceMeters: 20,
      coverageRadiusMeters: 30,
      status: "Available",
      lastVerified: "18:21",
    },
    {
      id: "CAM-JAM-02",
      name: "Jamia Nagar Street Camera",
      type: "Street Camera",
      area: "Jamia Nagar",
      distanceMeters: 190,
      coverageRadiusMeters: 90,
      status: "Available",
      lastVerified: "18:04",
    },
    {
      id: "CAM-OKH-05",
      name: "Okhla Traffic Camera",
      type: "Traffic Camera",
      area: "Okhla",
      distanceMeters: 360,
      coverageRadiusMeters: 140,
      status: "Pending",
      lastVerified: "17:48",
    },
  ],

  alerts: [
    {
      id: "ALT-1041-01",
      caseId: "CC-1041",
      severity: "High",
      title: "Predicted cash-out risk near Okhla",
      location: "ICICI ATM — Okhla",
      predictedWindow: "18:45–20:15",
      confidence: 81,
      createdAt: "17:58",
      status: "Acknowledged",
    },
  ],

  outcome: {
    predictionId: "PRED-1041",
    predictedLocationId: "ATM-OKH-04",
    predictedWindow: "18:45–20:15",
    status: "Not Observed",
  },

  linkedComplaintIds: [
    "CC-1027",
    "CC-1014",
  ],
};

/* -------------------------------------------------------------------------- */
/* Shared case registry                                                       */
/* -------------------------------------------------------------------------- */

export const mockCases: CaseData[] = [
  CASE_1042,
  CASE_1041,
];

/* -------------------------------------------------------------------------- */
/* Additional dropdown-only cases                                             */
/* -------------------------------------------------------------------------- */

/**
 * These cases exist only to make the prototype feel populated.
 * They should not be selected during the main demo.
 */
export const additionalCaseOptions = [
  {
    id: "CC-1038",
    fraudType: "Phishing",
    amount: "₹42K",
    location: "Kalkaji",
  },
  {
    id: "CC-1035",
    fraudType: "Card Fraud",
    amount: "₹31K",
    location: "Jamia Nagar",
  },
  {
    id: "CC-1032",
    fraudType: "UPI Fraud",
    amount: "₹96K",
    location: "Okhla",
  },
  {
    id: "CC-1029",
    fraudType: "Investment Scam",
    amount: "₹1.2L",
    location: "Jasola",
  },
];

/* -------------------------------------------------------------------------- */
/* Helpers                                                                    */
/* -------------------------------------------------------------------------- */

export function getCaseById(caseId: string): CaseData | undefined {
  return mockCases.find(
    (caseItem) => caseItem.complaint.id === caseId,
  );
}

export function getAllCaseIds(): string[] {
  return [
    ...mockCases.map((caseItem) => caseItem.complaint.id),
    ...additionalCaseOptions.map((caseItem) => caseItem.id),
  ];
}