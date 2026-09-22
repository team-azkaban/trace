import { useState } from "react";
import { Navigate, Route, Routes } from "react-router-dom";

import Navbar, { type UserRole } from "../navigation/Navbar";

import OverviewPage from "../../pages/OverviewPage";
import PredictInvestigatePage from "../../pages/PredictInvestigatePage";
import ResponsePage from "../../pages/ResponsePage";

import { mockCases } from "../../data/cases.mock";

export type Tab = "overview" | "predict" | "response";

export default function AppShell() {
  const [role, setRole] = useState<UserRole>("lea");

  // Shared case selection across the entire dashboard
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

        {/* Unknown dashboard route */}
        <Route
          path="*"
          element={<Navigate to="overview" replace />}
        />
      </Routes>
    </div>
  );
}