import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { LoginPage } from "./pages/LoginPage";
import { RegisterPage } from "./pages/RegisterPage";
import BuildingSelection from "./pages/BuildingSelection";
import ProfilePage from "./pages/ProfilePage";
import MyReports from "./pages/MyReports";

// STAFF PAGES
import AdminDashboard from "./pages/staff/AdminDashboard";
import Dashboard from "./pages/staff/Dashboard";
import Issues from "./pages/staff/Issues";
import Users from "./pages/staff/Users";
import AdminBuildingDetail from "./pages/staff/AdminBuildingDetail";

// STUDENT PAGES
import BuildingDetail from "./pages/BuildingDetail";
import ReportIssue from "./pages/ReportIssue";

import "./App.css";

/**
 * ProtectedRoute - Generic authentication check
 */
function ProtectedRoute({ children, allowedRoles }) {
  const token = localStorage.getItem("authToken");
  const role = localStorage.getItem("userRole");

  // No token = redirect to login
  if (!token) {
    console.log("⛔ No token found, redirecting to login");
    return <Navigate to="/login" replace />;
  }

  // If allowedRoles specified, check role
  if (allowedRoles && allowedRoles.length > 0) {
    if (!allowedRoles.includes(role)) {
      console.log(`⛔ Role "${role}" not allowed for this route. Allowed: ${allowedRoles.join(", ")}`);
      
      // Redirect based on role
      if (role === "ADMIN" || role === "MAINTENANCE_STAFF") {
        return <Navigate to="/staff/issues" replace />;
      }
      return <Navigate to="/buildings" replace />;
    }
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

        {/* ===================================== */}
        {/* STUDENT-ONLY ROUTES                  */}
        {/* ===================================== */}
        
        {/* Student Buildings List */}
        <Route
          path="/buildings"
          element={
            <ProtectedRoute allowedRoles={["STUDENT"]}>
              <BuildingSelection />
            </ProtectedRoute>
          }
        />

        {/* Student Building Detail */}
        <Route
          path="/buildings/:buildingCode"
          element={
            <ProtectedRoute allowedRoles={["STUDENT"]}>
              <BuildingDetail />
            </ProtectedRoute>
          }
        />

        {/* Student Report Issue */}
        <Route
          path="/buildings/ReportIssue"
          element={
            <ProtectedRoute allowedRoles={["STUDENT"]}>
              <ReportIssue />
            </ProtectedRoute>
          }
        />

        {/* Student My Reports */}
        <Route
          path="/myreports"
          element={
            <ProtectedRoute allowedRoles={["STUDENT"]}>
              <MyReports />
            </ProtectedRoute>
          }
        />

        {/* Student Profile - STUDENTS ONLY */}
        <Route
          path="/profile"
          element={
            <ProtectedRoute allowedRoles={["STUDENT"]}>
              <ProfilePage />
            </ProtectedRoute>
          }
        />

        {/* ===================================== */}
        {/* STAFF & ADMIN ROUTES                 */}
        {/* ===================================== */}
        
        <Route
          path="/staff"
          element={
            <ProtectedRoute allowedRoles={["ADMIN", "MAINTENANCE_STAFF"]}>
              <AdminDashboard />
            </ProtectedRoute>
          }
        >
          {/* Staff Dashboard */}
          <Route 
            path="dashboard" 
            element={
              <ProtectedRoute allowedRoles={["ADMIN", "MAINTENANCE_STAFF"]}>
                <Dashboard />
              </ProtectedRoute>
            } 
          />

          {/* Staff Issues */}
          <Route 
            path="issues" 
            element={
              <ProtectedRoute allowedRoles={["ADMIN", "MAINTENANCE_STAFF"]}>
                <Issues />
              </ProtectedRoute>
            } 
          />

          {/* Staff Building Detail */}
          <Route 
            path="buildings/:buildingCode" 
            element={
              <ProtectedRoute allowedRoles={["ADMIN", "MAINTENANCE_STAFF"]}>
                <AdminBuildingDetail />
              </ProtectedRoute>
            } 
          />

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

        {/* Catch All - Redirect unknown routes */}
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </Router>
  );
}

export default App;