export interface HistoricalPattern {
  id: string;
  label: string;
  match: number;
  cases: number;
  sharedSignals: string[];
  flow: {
    from: string;
    to: string;
  }[];
}

export const historicalPatterns: HistoricalPattern[] = [
  {
    id: "PAT-07",
    label: "Mule → ATM cash-out",
    match: 87,
    cases: 6,
    sharedSignals: [
      "Same transfer sequence",
      "Similar transaction timing",
      "Recurring cash-out zone",
    ],
    flow: [
      { from: "Victim", to: "Mule" },
      { from: "Mule", to: "Beneficiary" },
      { from: "Mule", to: "ATM" },
    ],
  },
  {
    id: "PAT-12",
    label: "Rapid split-transfer",
    match: 74,
    cases: 4,
    sharedSignals: [
      "Multiple beneficiaries",
      "Short transfer interval",
      "ATM withdrawal after transfer",
    ],
    flow: [
      { from: "Victim", to: "Mule" },
      { from: "Mule", to: "Beneficiary" },
      { from: "Beneficiary", to: "ATM" },
    ],
  },
];