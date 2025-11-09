import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { LoginPage } from "./pages/LoginPage";
import { RegisterPage } from "./pages/RegisterPage";
import BuildingSelection from "./pages/BuildingSelection";
import ProfilePage from "./pages/ProfilePage";
import AdminDashboard from "./pages/staff/AdminDashboard";
import Dashboard from "./pages/staff/Dashboard";
import Issues from "./pages/staff/Issues";
import Users from "./pages/staff/Users";
import "./App.css";

/**
 * ProtectedRoute
 * - Requires a token
 * - If allowedRoles is provided, current role must be in the list
 */
function ProtectedRoute({ children, allowedRoles }) {
  const token = localStorage.getItem("authToken");
  const role = localStorage.getItem("userRole");

  if (!token) return <Navigate to="/login" replace />;

  if (allowedRoles && !allowedRoles.includes(role)) {
    // Send users to a sensible place based on their role
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
        {/* Default → login */}
        <Route path="/" element={<Navigate to="/login" replace />} />

        {/* Public */}
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />

        {/* Student pages */}
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

        {/* Staff shell (Admin + Maintenance Staff) */}
        <Route
          path="/staff"
          element={
            <ProtectedRoute allowedRoles={["ADMIN", "MAINTENANCE_STAFF"]}>
              <AdminDashboard />
            </ProtectedRoute>
          }
        >
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="issues" element={<Issues />} />

          {/* Users page is ADMIN-only */}
          <Route
            path="users"
            element={
              <ProtectedRoute allowedRoles={["ADMIN"]}>
                <Users />
              </ProtectedRoute>
            }
          />
        </Route>

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </Router>
  );
}

export default App;
