import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { LoginPage } from './pages/LoginPage';
import { RegisterPage } from './pages/RegisterPage';
import BuildingSelection from './pages/BuildingSelection';
import ProfilePage from './pages/ProfilePage';
import AdminDashboard from './pages/staff/AdminDashboard';
import Dashboard from './pages/staff/Dashboard';
import Issues from './pages/staff/Issues';
import Users from './pages/staff/Users';
import './App.css';

/**
 * ✅ ProtectedRoute wrapper
 * Ensures user must be logged in (and optionally has correct role)
 */
function ProtectedRoute({ children, allowedRole }) {
  const token = localStorage.getItem('authToken');
  const role = localStorage.getItem('userRole');

  if (!token) return <Navigate to="/login" replace />;
  if (allowedRole && role !== allowedRole) return <Navigate to="/buildings" replace />;

  return children;
}

function App() {
  return (
    <Router>
      <Routes>
        {/* Default route redirects to login */}
        <Route path="/" element={<Navigate to="/login" replace />} />

        {/* Public routes */}
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />

        {/* Student pages */}
        <Route path="/buildings" element={<BuildingSelection />} />
        <Route path="/profile" element={<ProfilePage />} />

        {/* Admin routes */}
        <Route
          path="/staff"
          element={
            <ProtectedRoute allowedRole="ADMIN">
              <AdminDashboard />
            </ProtectedRoute>
          }
        >
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="issues" element={<Issues />} />
          <Route path="users" element={<Users />} />
        </Route>

        {/* Catch-all route */}
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </Router>
  );
}

export default App;
