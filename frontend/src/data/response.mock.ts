export type RiskLevel = "Critical" | "High" | "Medium";
export type LeaStage = "Assign" | "Acknowledge" | "Investigate" | "Update";
export type BankStage = "Monitor" | "Flag" | "Acknowledge";

export interface LeaCase {
  id: string;
  summary: string;
  location: string;
  risk: RiskLevel;
  amount: string;
  stage: LeaStage;
  age: string;
}

export interface BankAlert {
  id: string;
  summary: string;
  location: string;
  risk: RiskLevel;
  window: string;
  stage: BankStage;
}

export const mockLeaCases: LeaCase[] = [
  { id: "CC-1042", summary: "UPI fraud transfers converge on a suspected mule account.", location: "Jasola · South-East Delhi", risk: "Critical", amount: "₹1.8L", stage: "Assign", age: "12 min ago" },
  { id: "CMP-2026-1038", summary: "Repeated card-not-present transactions near a predicted ATM.", location: "Mumbai · Andheri East", risk: "High", amount: "₹1.9L", stage: "Acknowledge", age: "38 min ago" },
  { id: "CMP-2026-1029", summary: "Suspicious beneficiary chain spans two districts.", location: "Hyderabad · Madhapur", risk: "High", amount: "₹3.2L", stage: "Investigate", age: "1 hr ago" },
  { id: "CMP-2026-1017", summary: "ATM cash-out prediction needs final incident update.", location: "Delhi · Saket", risk: "Medium", amount: "₹82K", stage: "Update", age: "2 hrs ago" },
];

export const mockBankAlerts: BankAlert[] = [
  { id: "ALT-CC-1042", summary: "Cash-out risk detected near a predicted Jasola ATM.", location: "Jasola · South-East Delhi", risk: "Critical", window: "18:00–20:00", stage: "Monitor" },
  { id: "ALT-2026-068", summary: "Three linked complaints point to the same withdrawal corridor.", location: "Mumbai · Andheri East", risk: "High", window: "20:00–22:00", stage: "Flag" },
  { id: "ALT-2026-064", summary: "High-confidence branch alert is ready for acknowledgement.", location: "Hyderabad · Madhapur", risk: "High", window: "16:00–18:00", stage: "Acknowledge" },
];
