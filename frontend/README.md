# TRACE — Transaction Risk & Cash-out Estimation

> **Predict where fraud money will be cashed out.**

TRACE is a predictive cybercrime intelligence platform prototype designed for **SIH Problem Statement ID26184**.

The platform focuses on moving cyber-fraud response from a purely reactive workflow to a **predictive, explainable and actionable intelligence workflow**.

TRACE analyzes complaint and transaction patterns to estimate:

- Risk associated with a cybercrime complaint
- Likely cash-out / withdrawal locations
- Expected withdrawal time windows
- Financial money-flow relationships
- Reasons behind a prediction
- Nearby physical intelligence such as CCTV coverage
- Response actions for law-enforcement agencies and financial institutions
- Prediction outcomes and model-learning signals

This repository currently contains a **frontend-only prototype** using mock data. There is no real backend, ML model, GIS service, banking API, CCTV system, or live cybercrime database connected yet.

---

# 1. Product Concept

## Problem

Cyber-fraud investigations are often reactive.

A typical flow is:

```text
Victim
   ↓
Fraudster
   ↓
Mule / Suspected Account
   ↓
Fund Transfer
   ↓
ATM / Branch Withdrawal
```

By the time investigators identify the suspicious transaction, the fraudster may already have withdrawn or moved the money.

TRACE introduces a predictive layer:

```text
Complaint / Transaction Data
          ↓
     Risk Analysis
          ↓
    Pattern Analysis
          ↓
 Cash-out Prediction
     ↙          ↘
Location       Time Window
     ↓             ↓
Explainability + Physical Intelligence
          ↓
       Alert
          ↓
     Intervention
          ↓
       Outcome
          ↓
    Model Learning
```

## Core USP

The central idea is:

> **Predict the likely cash-out location and time before the withdrawal happens, then provide enough evidence and operational context for intervention.**

---

# 2. Current Prototype Scope

The current prototype is intentionally UI-focused.

### Included

- Landing page
- Dashboard shell
- Role switching
- React Router navigation
- Overview page
- Predict & Investigate page
- Response page
- Shared case selection
- Shared mock case data
- Risk information
- Predicted withdrawal locations
- Financial transaction relationships
- Evidence factors
- CCTV intelligence data
- Alerts
- Prediction outcomes
- Placeholder areas for individual feature implementation

### Not included yet

- Real backend
- Authentication
- Database
- Real-time complaint ingestion
- Actual ML prediction model
- Real GIS provider
- Real ATM/branch APIs
- Real bank APIs
- Real CCTV integration
- Production alert delivery
- Real-world cybercrime data

All current data should be treated as **prototype/demo data only**.

---

# 3. Tech Stack

The frontend uses:

- **React**
- **TypeScript**
- **Vite**
- **Tailwind CSS**
- **React Router**
- **Lucide React**

Installed packages include:

```bash
npm install
npm install tailwindcss @tailwindcss/vite
npm install react-router-dom lucide-react
```

---

# 4. Initial Setup

## Requirements

Install:

- Node.js
- npm
- Git

Check installation:

```bash
node -v
npm -v
git --version
```

---

## Create / Run the Project

The frontend lives inside:

```text
trace/
└── frontend/
```

Move into the frontend:

```bash
cd frontend
```

Install dependencies:

```bash
npm install
```

Start the development server:

```bash
npm run dev
```

Vite will provide a local development URL.

---

# 5. Project Structure

Current structure:

```text
frontend/
└── src/
    ├── components/
    │   ├── layout/
    │   │   ├── AppShell.tsx
    │   │   └── PageContainer.tsx
    │   │
    │   ├── navigation/
    │   │   └── Navbar.tsx
    │   │
    │   └── ui/
    │       └── CaseSelector.tsx
    │
    ├── data/
    │   └── cases.mock.ts
    │
    ├── features/
    │   ├── overview/
    │   ├── prediction/
    │   ├── money-flow/
    │   ├── explainability/
    │   ├── cctv-intelligence/
    │   ├── response/
    │   ├── coverage-simulator/
    │   └── outcome-learning/
    │
    ├── pages/
    │   ├── LandingPage.tsx
    │   ├── OverviewPage.tsx
    │   ├── PredictInvestigatePage.tsx
    │   └── ResponsePage.tsx
    │
    ├── hooks/
    ├── lib/
    ├── types/
    ├── assets/
    │
    ├── App.tsx
    ├── main.tsx
    └── index.css
```

Do **not** create an `index.ts` file inside every feature folder unless there is an actual reason for one.

---

# 6. Routing

The application uses React Router.

Current routes:

```text
/                   → Landing page

/app                 → Dashboard shell

/app/overview        → Overview
/app/predict         → Predict & Investigate
/app/response        → Response
```

The dashboard shell contains the navbar and shared application state.

## Navigation

The navbar uses `NavLink` from React Router.

Therefore, do not create separate local navigation state for:

```text
Overview
Predict & Investigate
Response
```

Routing is responsible for changing pages.

---

# 7. App Architecture

The high-level application structure is:

```text
App
│
├── LandingPage
│
└── AppShell
    │
    ├── Navbar
    │
    ├── Shared Role
    │
    ├── Shared Selected Case
    │
    └── Routes
        │
        ├── OverviewPage
        ├── PredictInvestigatePage
        └── ResponsePage
```

`AppShell` currently owns:

```text
role
selectedCaseId
```

This is intentional.

---

# 8. Shared Role State

The application supports two operational views:

```text
LEA
Bank / FI
```

The role is stored in `AppShell`.

```tsx
const [role, setRole] = useState<UserRole>("lea");
```

Pages receive:

```tsx
role
```

and can change their UI based on it.

Example:

```tsx
{role === "lea"
  ? "Law Enforcement View"
  : "Bank / FI View"}
```

### Important

Do not create another independent role state inside a feature.

Use the role passed from `AppShell`.

---

# 9. Shared Case Selection

TRACE currently has two actual demo cases.

The selected case is also owned by `AppShell`.

```tsx
const [selectedCaseId, setSelectedCaseId] = useState(
  mockCases[0].complaint.id,
);
```

This means:

```text
Predict & Investigate
        ↓
select CC-1041
        ↓
Response
        ↓
CC-1041 remains selected
```

The case selector should therefore receive:

```tsx
selectedCaseId
onCaseChange
```

Example:

```tsx
<CaseSelector
  cases={caseOptions}
  selectedCaseId={selectedCaseId}
  onCaseChange={onCaseChange}
/>
```

Do not create a separate selected-case state inside individual pages.

---

# 10. Shared Mock Data

The main mock data file is:

```text
src/data/cases.mock.ts
```

This is the **single source of truth for the prototype cases**.

The main structure is:

```text
CaseData
│
├── complaint
├── accounts[]
├── transactions[]
├── predictedLocations[]
├── evidenceFactors[]
├── cameras[]
├── alerts[]
├── outcome
└── linkedComplaintIds[]
```

---

# 11. Case Data Model

## Complaint

Each complaint contains:

```ts
interface Complaint {
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
```

Example:

```ts
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
}
```

---

# 12. Accounts

Accounts represent the financial network.

Types currently supported:

```text
Victim
Suspected Mule
Beneficiary
```

Example:

```ts
{
  id: "ACC-M-7812",
  type: "Suspected Mule",
  bank: "HDFC Bank",
  holderLabel: "Suspected Mule Account",
  riskLevel: "Critical",
}
```

---

# 13. Transactions

Transactions connect accounts and locations.

Example:

```ts
{
  id: "TXN-88024",
  fromAccount: "ACC-M-7812",
  toAccount: "ATM-JAS-01",
  amount: 80000,
  timestamp: "2026-09-22 14:10",
  type: "Cash Withdrawal",
  location: "Jasola",
  status: "Pending",
}
```

Transaction types:

```text
Transfer
Cash Withdrawal
```

---

# 14. Predicted Locations

This is one of the most important data structures in TRACE.

Each predicted location contains:

```ts
{
  id,
  name,
  type,
  area,
  latitude,
  longitude,
  confidence,
  distanceKm,
  predictedWindow,
  riskLevel,
  bank,
  reasonSummary
}
```

Example:

```ts
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
}
```

Features such as Prediction and GIS should consume this data instead of creating their own duplicate locations.

---

# 15. Evidence Factors

Evidence factors explain why the system generated a prediction.

Each factor contains:

```text
category
title
description
contribution
```

Categories:

```text
Pattern
Timing
Network
Amount
Location
```

Example:

```ts
{
  id: "EF-1042-01",
  category: "Network",
  title: "Linked mule-account activity",
  description:
    "The suspected mule account is connected to multiple suspicious transfers.",
  contribution: 29,
}
```

The Explainability feature should use these factors.

---

# 16. CCTV Data

CCTV data is stored under:

```text
case.cameras
```

Each camera contains:

```text
id
name
type
area
distanceMeters
coverageRadiusMeters
status
lastVerified
```

Possible statuses:

```text
Available
Pending
Unavailable
```

The CCTV feature should consume this shared data rather than creating duplicate camera records.

---

# 17. Alerts

Alerts are stored as an array:

```ts
alerts: Alert[]
```

An alert contains:

```text
id
caseId
severity
title
location
predictedWindow
confidence
createdAt
status
```

Example:

```ts
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
}
```

---

# 18. Prediction Outcome

Prediction outcomes are stored under:

```text
case.outcome
```

They contain:

```text
predictionId
predictedLocationId
predictedWindow
actualLocation
actualTime
status
recordedAt
```

Current outcome statuses:

```text
Correct
Partial
Incorrect
Not Observed
```

The Outcome & Learning feature should use this data.

---

# 19. Current Demo Cases

There are currently **two real selectable cases**.

## CASE_1042

Complaint:

```text
CC-1042
UPI Fraud
₹1,80,000
Jasola, South-East Delhi
SBI
Risk: 91 / Critical
Status: Under Investigation
```

Primary prediction:

```text
SBI ATM — Jasola
Confidence: 87%
Window: 19:30–21:00
```

---

## CASE_1041

Complaint:

```text
CC-1041
Investment Scam
₹75,000
Okhla, South-East Delhi
HDFC Bank
Risk: 82 / High
Status: Open
```

Primary prediction:

```text
ICICI ATM — Okhla
Confidence: 81%
Window: 18:45–20:15
```

These are fictional prototype records.

They should not be interpreted as actual crime statistics or actual risk patterns for these locations.

---

# 20. Additional Dropdown-Only Cases

The mock data also contains:

```text
CC-1038 — Phishing
CC-1035 — Card Fraud
CC-1032 — UPI Fraud
CC-1029 — Investment Scam
```

These are currently intended only to make the prototype feel populated.

They should **not** become full investigation cases unless the team intentionally expands the mock dataset.

---

# 21. How to Create New Mock Data

If a feature needs more data, first check whether the required information already exists in:

```text
src/data/cases.mock.ts
```

Do not immediately create:

```text
prediction.mock.ts
gis.mock.ts
cctv.mock.ts
response.mock.ts
```

with duplicate case information.

Prefer extending the shared `CaseData` model.

For example, if a new prediction visualization needs:

```text
ATM
confidence
distance
time window
risk
```

those already exist under:

```ts
case.predictedLocations
```

Use them.

---

# 22. Mock Data Rules

When adding mock data:

### Use consistent IDs

Examples:

```text
CC-1042
ACC-M-7812
TXN-88024
ATM-JAS-01
CAM-JAS-01
ALT-1042-01
PRED-1042
```

### Keep relationships valid

If a transaction says:

```text
fromAccount: ACC-M-7812
```

that account should exist in:

```text
accounts[]
```

If a prediction says:

```text
predictedLocationId: ATM-JAS-01
```

that location should exist in:

```text
predictedLocations[]
```

### Keep amounts numeric

Use:

```ts
amount: 180000
```

not:

```ts
amount: "₹1.8L"
```

Format currency in the UI.

Example:

```tsx
₹{amount.toLocaleString("en-IN")}
```

### Keep timestamps consistent

Use the existing format:

```text
2026-09-22 14:32
```

---

# 23. Feature Ownership

The current feature distribution is:

| Person | Area | Feature Folder |
|---|---|---|
| P1 | Landing + App Shell + Money Flow | `money-flow/` |
| P2 | Overview + Complaints + Analytics | `overview/` |
| P3 | Prediction + GIS | `prediction/` |
| P4 | Explainability + CCTV | `explainability/`, `cctv-intelligence/` |
| P5 | LEA + Bank/FI Response | `response/` |
| P6 | Coverage + Outcome/Learning | `coverage-simulator/`, `outcome-learning/` |

The exact team assignment can be changed, but the feature boundaries should remain clear.

---

# 24. Feature 1 — Overview

Folder:

```text
src/features/overview/
```

Page:

```text
src/pages/OverviewPage.tsx
```

Responsibilities:

- Complaint dashboard
- Complaint filtering
- Risk distribution
- Fraud-type analytics
- Hotspot analytics
- Bank/region/time summaries
- Overview metrics

Use shared complaint data from:

```text
src/data/cases.mock.ts
```

Do not create a second case registry.

---

# 25. Feature 2 — Prediction

Folder:

```text
src/features/prediction/
```

Page:

```text
src/pages/PredictInvestigatePage.tsx
```

Responsibilities:

- Top predicted cash-out locations
- Confidence
- Risk level
- Distance
- Predicted time window
- Prediction ranking
- Prediction visualization

Primary data:

```ts
selectedCase.predictedLocations
```

Example:

```tsx
selectedCase.predictedLocations.map((location) => ...)
```

---

# 26. Feature 3 — GIS Risk Heatmap

Folder:

```text
src/features/prediction/
```

or a dedicated GIS subfolder if the team prefers.

Responsibilities:

- Map visualization
- Predicted hotspots
- ATM/branch locations
- Complaint locations
- Risk intensity
- Geographic filtering

Use:

```text
latitude
longitude
area
riskLevel
confidence
```

from the shared data.

Do not hardcode another set of ATM coordinates.

---

# 27. Feature 4 — Money Flow

Folder:

```text
src/features/money-flow/
```

Responsibilities:

```text
Victim
   ↓
Suspected Mule
   ↓
Beneficiary
   ↓
ATM / Cash Withdrawal
```

Use:

```ts
selectedCase.accounts
selectedCase.transactions
```

The graph should be driven from the transaction relationships.

---

# 28. Feature 5 — Explainability

Folder:

```text
src/features/explainability/
```

Responsibilities:

- Why this location?
- Why this risk?
- Contributing factors
- Confidence explanation
- Network/timing/location/amount evidence

Use:

```ts
selectedCase.evidenceFactors
```

Do not invent a separate explanation dataset unless the shared model genuinely lacks something needed.

---

# 29. Feature 6 — CCTV / Physical Intelligence

Folder:

```text
src/features/cctv-intelligence/
```

Responsibilities:

- Nearby cameras
- Camera distance
- Coverage radius
- Availability
- Last verified time
- Physical intelligence around predicted locations

Use:

```ts
selectedCase.cameras
```

---

# 30. Feature 7 — Response

Folder:

```text
src/features/response/
```

Responsibilities:

### LEA

```text
Assign
Acknowledge
Investigate
Update
```

### Bank / FI

```text
Monitor
Flag
Acknowledge
```

The UI should react to:

```ts
role
```

from `AppShell`.

Do not create a separate role selector inside the feature.

---

# 31. Feature 8 — Intervention Coverage Simulator

Folder:

```text
src/features/coverage-simulator/
```

Responsibilities:

Allow users to explore hypothetical intervention scenarios.

For example:

```text
Predicted locations
        ↓
Select monitoring coverage
        ↓
Estimate covered predictions
        ↓
Compare intervention scenarios
```

This is a simulation UI for the prototype.

It does not need a real optimization backend yet.

---

# 32. Feature 9 — Outcome & Learning

Folder:

```text
src/features/outcome-learning/
```

Responsibilities:

- Record prediction outcome
- Compare predicted vs actual location
- Compare predicted vs actual time
- Show Correct / Partial / Incorrect / Not Observed
- Show mock prediction accuracy trends

Primary data:

```ts
selectedCase.outcome
```

---

# 33. How to Build Your Feature

Each teammate should follow this pattern.

### Step 1 — Understand the page slot

The page currently contains a dashed placeholder such as:

```text
PREDICTION FEATURE
```

or:

```text
MONEY-FLOW GRAPH FEATURE
```

Do not redesign the entire page.

Replace only the appropriate feature slot.

---

### Step 2 — Create components inside your feature folder

For example:

```text
src/features/prediction/
├── PredictionPanel.tsx
├── PredictionCard.tsx
└── PredictionRanking.tsx
```

There is no requirement to create an `index.ts`.

---

### Step 3 — Consume shared data

Use:

```ts
selectedCase
```

and its existing properties.

Avoid copying the case data into the feature.

---

### Step 4 — Keep page layout separate from feature logic

The page controls:

```text
Where the feature appears
```

The feature controls:

```text
How the feature works visually
```

---

# 34. Example Feature Pattern

A feature component could look like:

```tsx
interface PredictionPanelProps {
  predictedLocations: PredictedLocation[];
}

export default function PredictionPanel({
  predictedLocations,
}: PredictionPanelProps) {
  return (
    <div>
      {predictedLocations.map((location) => (
        <div key={location.id}>
          {location.name}
        </div>
      ))}
    </div>
  );
}
```

Then the page passes:

```tsx
<PredictionPanel
  predictedLocations={selectedCase.predictedLocations}
/>
```

This keeps the feature reusable and independent from the global application state.

---

# 35. Design System

TRACE uses a light, high-trust cyber-intelligence visual style.

## General direction

Think:

> Calm, precise, operational cyber intelligence.

Avoid making the dashboard look like a generic SaaS admin panel.

---

## Colors

### Background

```text
#F7F9FC
```

### Surface

```text
#FFFFFF
```

### Main text

```text
#172033
```

### Muted text

```text
#64748B
```

### AI / intelligence accents

```text
Cyan
Blue
Indigo
```

### Risk

```text
Critical → Red
High     → Orange
Medium   → Amber
Low      → Green
```

---

# 36. Visual Guidelines

Prefer:

- White cards
- Soft borders
- Subtle shadows
- Rounded corners
- Dense but readable information
- Clear hierarchy
- Small uppercase labels
- Minimal animations
- Data visualization
- Network relationships
- Maps
- Risk indicators

Avoid:

- Excessive neon
- Huge gradients
- Excessive glassmorphism
- Overly rounded cartoon-style UI
- Excessive glowing effects
- Generic dashboard templates

The landing page can be more futuristic.

The operational dashboard should remain serious and trustworthy.

---

# 37. Existing CSS Tokens

Shared design tokens are defined in:

```text
src/index.css
```

Examples:

```css
--trace-bg
--trace-surface
--trace-text
--trace-text-muted
--trace-border
--trace-cyan
--trace-blue
--trace-critical
--trace-high
--trace-medium
--trace-low
```

Use these as the design reference when creating new UI.

---

# 38. What You Should NOT Do

### Do not create another global selected case state

Avoid:

```tsx
const [selectedCase, setSelectedCase] = useState(...)
```

inside individual pages.

The selected case belongs to `AppShell`.

---

### Do not create duplicate mock cases

Avoid:

```text
prediction.mock.ts
response.mock.ts
gis.mock.ts
```

containing copies of:

```text
CC-1042
CC-1041
```

Use `cases.mock.ts`.

---

### Do not hardcode case-specific information inside feature components

Avoid:

```tsx
"SBI ATM — Jasola"
```

inside a prediction card.

Use:

```tsx
location.name
```

from the data.

---

### Do not modify routing for a feature unnecessarily

Routes are controlled by:

```text
App.tsx
AppShell.tsx
Navbar.tsx
```

Only modify them if the team is intentionally adding a new application route.

---

### Do not add a backend yet

This repository is currently a frontend prototype.

Do not introduce backend dependencies unless the team explicitly decides to move to that stage.

---

# 39. Git / Team Workflow

Before starting work:

```bash
git pull
```

Create a feature branch:

```bash
git checkout -b feature/prediction
```

Examples:

```text
feature/overview
feature/prediction
feature/money-flow
feature/explainability
feature/cctv
feature/response
feature/coverage
feature/outcome-learning
```

After implementation:

```bash
git add .
git commit -m "Add prediction intelligence UI"
git push
```

---

# 40. Keep Changes Isolated

If you own:

```text
src/features/prediction/
```

try to primarily modify:

```text
src/features/prediction/
```

and the relevant placeholder section in:

```text
PredictInvestigatePage.tsx
```

Avoid changing:

```text
AppShell.tsx
Navbar.tsx
cases.mock.ts
```

unless necessary.

This reduces merge conflicts.

---

# 41. Before Committing

Run:

```bash
npm run build
```

The project should compile without TypeScript errors.

Also test:

```text
/
```

```text
/app/overview
```

```text
/app/predict
```

```text
/app/response
```

Test both roles:

```text
LEA
Bank / FI
```

Test both cases:

```text
CC-1042
CC-1041
```

And verify that changing the case in Predict & Investigate is reflected when navigating to Response.

---

# 42. Current Application Flow

The intended demo flow is:

```text
Landing Page
     ↓
Enter Dashboard
     ↓
Overview
     ↓
Select / inspect complaint
     ↓
Predict & Investigate
     ↓
Cash-out prediction
     ↓
GIS / hotspot
     ↓
Money-flow investigation
     ↓
Explainability
     ↓
CCTV / physical intelligence
     ↓
Response
     ↓
LEA / Bank-FI intervention
     ↓
Coverage simulation
     ↓
Prediction outcome
     ↓
Learning / accuracy
```

This is the main narrative the prototype should communicate.

---

# 43. Feature Boundaries

The features should complement each other rather than duplicate each other.

| Feature | Main Question |
|---|---|
| Complaint Dashboard | What happened? |
| Risk Scoring | How risky is it? |
| Prediction | Where might the money be withdrawn? |
| GIS | Where is the geographic risk concentrated? |
| Time Prediction | When might the withdrawal happen? |
| Money Flow | How did the money move? |
| Explainability | Why did TRACE predict this? |
| CCTV Intelligence | What physical intelligence is nearby? |
| Response | What should the stakeholder do? |
| Coverage Simulator | What if we intervene here? |
| Outcome Learning | Was the prediction correct? |

Avoid making multiple features answer the same question.

---

# 44. Prototype Philosophy

The project should demonstrate the **concept and workflow**, not pretend that the prototype already has production-grade predictive capabilities.

For example:

```text
Good prototype:
"87% predicted confidence"
"Based on network + timing + location factors"
```

Rather than implying:

```text
Actual real-world AI model guarantees this ATM will be used.
```

All predictions are mock/demo outputs until a real model is integrated.

---

# 45. Future Backend Integration

The frontend architecture is intentionally designed so mock data can later be replaced by API data.

Current:

```text
cases.mock.ts
      ↓
React components
```

Future:

```text
Backend API
      ↓
API service / hooks
      ↓
Case data
      ↓
React components
```

The UI components should therefore avoid depending on the fact that the current data comes from a local TypeScript file.

For example, a prediction component should care about:

```ts
PredictedLocation[]
```

not:

```text
cases.mock.ts
```

---

# 46. Important Files

| File | Purpose |
|---|---|
| `App.tsx` | Top-level routing |
| `AppShell.tsx` | Dashboard shell + shared state |
| `Navbar.tsx` | Navigation + role switcher |
| `PageContainer.tsx` | Page layout container |
| `CaseSelector.tsx` | Shared case selection UI |
| `cases.mock.ts` | Shared prototype data |
| `index.css` | Global styles/design tokens |
| `LandingPage.tsx` | Public landing page |
| `OverviewPage.tsx` | Overview layout |
| `PredictInvestigatePage.tsx` | Prediction/investigation layout |
| `ResponsePage.tsx` | Operational response layout |

---

# 47. Golden Rule for the Team

Before adding new data or architecture, ask:

> **Does this already exist somewhere in the shared case model?**

If yes, reuse it.

Before adding state, ask:

> **Does this state need to be shared across pages?**

If yes, it probably belongs in `AppShell`.

Before adding a new route, ask:

> **Is this actually a new application page, or just a feature inside an existing page?**

Most features should remain inside the existing three operational pages:

```text
Overview
Predict & Investigate
Response
```

The goal is to keep TRACE coherent, rather than turning it into a collection of disconnected dashboards.

---

# 48. Current Status

### Application foundation

- [x] Vite + React + TypeScript
- [x] Tailwind CSS
- [x] Lucide icons
- [x] React Router
- [x] Landing page
- [x] Dashboard shell
- [x] Role switching
- [x] Shared selected case
- [x] Shared mock data
- [x] Overview route
- [x] Predict & Investigate route
- [x] Response route
- [x] Feature placeholders
- [x] Shared design tokens

### Feature implementation

- [ ] Complaint dashboard
- [ ] Risk scoring UI
- [ ] Cash-out prediction UI
- [ ] GIS heatmap
- [ ] Time prediction visualization
- [ ] Money-flow graph
- [ ] Explainability
- [ ] CCTV intelligence
- [ ] LEA workflow
- [ ] Bank/FI workflow
- [ ] Coverage simulator
- [ ] Outcome tracker
- [ ] Learning/accuracy visualization

### Future

- [ ] Backend
- [ ] Database
- [ ] ML prediction service
- [ ] Real GIS
- [ ] Real banking integrations
- [ ] Real-time alerts
- [ ] Authentication
- [ ] Production deployment

---

# 49. Quick Start for a New Team Member

```bash
git clone <repository-url>

cd trace/frontend

npm install

npm run dev
```

Then open:

```text
/app/overview
```

Read:

```text
src/data/cases.mock.ts
```

Then find your feature folder:

```text
src/features/
```

Check the corresponding page:

```text
src/pages/
```

Understand the existing placeholder.

Use the shared:

```text
role
selectedCaseId
mockCases
```

Implement your feature.

Do not duplicate the shared data.

Finally run:

```bash
npm run build
```

before committing.

---

# TRACE

**Transaction Risk & Cash-out Estimation**

> Detect the pattern. Predict the cash-out. Enable intervention.

Frontend prototype for **SIH Problem Statement ID26184**.