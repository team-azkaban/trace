import { useState } from "react";
import { Navigate, Route, Routes } from "react-router-dom";

import Navbar, { type UserRole } from "../navigation/Navbar";

import OverviewPage from "../../pages/OverviewPage";
import PredictInvestigatePage from "../../pages/PredictInvestigatePage";
import ResponsePage from "../../pages/ResponsePage";
import LocationInvestigationPage from "../../pages/LocationInvestigationPage";
import { mockCases } from "../../data/cases.mock";
import CoverageSimulatorPage from "../../pages/CoverageSimulatorPage";
export type Tab = "overview" | "predict" | "response";

export default function AppShell() {
  const [role, setRole] = useState<UserRole>("lea");

  const [selectedCaseId, setSelectedCaseId] = useState(
    mockCases[0].complaint.id,
  );

  return (
    <div className="min-h-screen bg-[#F7F9FC] text-slate-900">
      <Navbar
        role={role}
        onRoleChange={setRole}
      />

      <Routes>
        {/* Default dashboard route */}
        <Route
          index
          element={<Navigate to="overview" replace />}
        />

        {/* Overview */}
        <Route
          path="overview"
          element={<OverviewPage role={role} />}
        />

        {/* Predict & Investigate */}
        <Route
          path="predict"
          element={
            <PredictInvestigatePage
              role={role}
              selectedCaseId={selectedCaseId}
              onCaseChange={setSelectedCaseId}
            />
          }
        />

        {/* Location Investigation */}
        <Route
          path="location-investigation/:locationId"
          element={<LocationInvestigationPage />}
        />

        {/* Response */}
        <Route
          path="response"
          element={
            <ResponsePage
              role={role}
              selectedCaseId={selectedCaseId}
              onCaseChange={setSelectedCaseId}
            />
          }
        />
<Route
  path="coverage-simulator/:caseId"
  element={<CoverageSimulatorPage />}
/>
        {/* Unknown dashboard route */}
        <Route
          path="*"
          element={<Navigate to="overview" replace />}
        />
      </Routes>
    </div>
  );
}