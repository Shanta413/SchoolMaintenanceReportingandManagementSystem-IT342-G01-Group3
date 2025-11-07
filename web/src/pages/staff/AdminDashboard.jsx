import React from 'react';
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
import '../../css/AdminDashboard.css';

function AdminDashboard() {
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("authToken");
    navigate("/login");
  };

  return (
    <div className="admin-layout">
      <aside className="admin-sidebar">
        <div className="sidebar-header">
          <div className="logo">
            <span className="logo-icon">✓</span>
            <span className="logo-text">CITFIX</span>
          </div>
          <p className="sidebar-subtitle">Admin Panel</p>
        </div>

        <nav className="sidebar-nav">
          <Link 
            to="/staff/dashboard" 
            className={`nav-item ${location.pathname === '/staff/dashboard' ? 'active' : ''}`}
          >
            <span className="nav-icon">📊</span>
            <span>Dashboard</span>
          </Link>
          
          <Link 
            to="/staff/issues" 
            className={`nav-item ${location.pathname === '/staff/issues' ? 'active' : ''}`}
          >
            <span className="nav-icon">⚠️</span>
            <span>Issues</span>
          </Link>
          
          <Link 
            to="/staff/users" 
            className={`nav-item ${location.pathname === '/staff/users' ? 'active' : ''}`}
          >
            <span className="nav-icon">👥</span>
            <span>Users</span>
          </Link>
        </nav>

        <div className="sidebar-footer">
          <button className="logout-btn" onClick={handleLogout}>
            <span className="nav-icon">🚪</span>
            <span>Logout</span>
          </button>
        </div>
      </aside>

      <main className="admin-content">
        <Outlet />
      </main>
    </div>
  );
}

export default AdminDashboard;