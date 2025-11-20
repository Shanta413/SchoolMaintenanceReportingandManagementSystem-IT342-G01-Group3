import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { LoginPage } from "./pages/LoginPage";
import { RegisterPage } from "./pages/RegisterPage";
import BuildingSelection from "./pages/BuildingSelection";
import ProfilePage from "./pages/ProfilePage";

// STAFF PAGES
import AdminDashboard from "./pages/staff/AdminDashboard";
import Dashboard from "./pages/staff/Dashboard";
import Issues from "./pages/staff/Issues";   // ✅ Correct import name
import Users from "./pages/staff/Users";
import AdminBuildingDetail from "./pages/staff/AdminBuildingDetail";

// STUDENT PAGES
import BuildingDetail from "./pages/BuildingDetail";
import ReportIssue from "./pages/ReportIssue";

import "./App.css";

/**
 * ProtectedRoute
 */
function ProtectedRoute({ children, allowedRoles }) {
  const token = localStorage.getItem("authToken");
  const role = localStorage.getItem("userRole");

  if (!token) return <Navigate to="/login" replace />;

  if (allowedRoles && !allowedRoles.includes(role)) {
    if (role === "ADMIN" || role === "MAINTENANCE_STAFF") {
      return <Navigate to="/staff/dashboard" replace />;
    }
    return <Navigate to="/buildings" replace />;
  }

  return children;
}

function App() {
  return (
    <Router>
      <Routes>

        {/* Default */}
        <Route path="/" element={<Navigate to="/login" replace />} />

        {/* Public Routes */}
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />

        {/* Student Area */}
        <Route
          path="/buildings"
          element={
            <ProtectedRoute allowedRoles={["STUDENT"]}>
              <BuildingSelection />
            </ProtectedRoute>
          }
        />

        <Route
          path="/profile"
          element={
            <ProtectedRoute allowedRoles={["STUDENT", "ADMIN", "MAINTENANCE_STAFF"]}>
              <ProfilePage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/buildings/:buildingCode"
          element={
            <ProtectedRoute allowedRoles={["STUDENT", "ADMIN", "MAINTENANCE_STAFF"]}>
              <BuildingDetail />
            </ProtectedRoute>
          }
        />

        <Route
          path="/buildings/ReportIssue"
          element={
            <ProtectedRoute allowedRoles={["STUDENT", "ADMIN", "MAINTENANCE_STAFF"]}>
              <ReportIssue />
            </ProtectedRoute>
          }
        />

        {/* STAFF & ADMIN AREA */}
        <Route
          path="/staff"
          element={
            <ProtectedRoute allowedRoles={["ADMIN", "MAINTENANCE_STAFF"]}>
              <AdminDashboard />
            </ProtectedRoute>
          }
        >
          <Route path="dashboard" element={<Dashboard />} />

          {/* 🚨 FIXED: USE <Issues/> NOT <IssuesPage/> */}
          <Route path="issues" element={<Issues />} />

          {/* Admin per-building */}
          <Route path="buildings/:buildingCode" element={<AdminBuildingDetail />} />

          {/* Admin-only Users page */}
          <Route
            path="users"
            element={
              <ProtectedRoute allowedRoles={["ADMIN"]}>
                <Users />
              </ProtectedRoute>
            }
          />
        </Route>

        {/* Catch All */}
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </Router>
  );
}

export default App;
