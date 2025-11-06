import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { LoginPage } from './pages/LoginPage';
import { RegisterPage } from './pages/RegisterPage';
import BuildingSelection from './pages/BuildingSelection';
import ProfilePage from './pages/ProfilePage';
import useAuthToken from './api/useAuthToken';
import './App.css';

function App() {
  return (
    <Router>
      <Routes>
        {/* Default route redirects to login */}
        <Route path="/" element={<Navigate to="/login" replace />} />
        
        {/* Login page route */}
        <Route path="/login" element={<LoginPage />} />
        
        {/* Register page route */}
        <Route path="/register" element={<RegisterPage />} />
        
        {/* Building selection route */}
        <Route path="/buildings" element={<BuildingSelection />} />

        {/* Profile page route */}
        <Route path="/profile" element={<ProfilePage />} />
        
        {/* Catch all route - redirect to login */}
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </Router>
  );
}

export default App;