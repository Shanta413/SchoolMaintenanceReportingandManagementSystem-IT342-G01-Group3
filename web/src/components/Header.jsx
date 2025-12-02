import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import CitfixLogo from './CitfixLogo';
import UserMenu from './UserMenu';
import '../css/components_css/Header.css';

function Header({ userName }) {
  const navigate = useNavigate();
  const location = useLocation();

  const isActive = (path) => location.pathname === path;

  return (
    <header className="header">
      <div className="header-content">
        <div className="header-left">
          <div onClick={() => navigate('/buildings')} style={{ cursor: 'pointer' }}>
            <CitfixLogo size="sm" />
          </div>
          <nav className="nav-links">
            <a 
              onClick={() => navigate('/buildings')} 
              className={`nav-link ${isActive('/buildings') ? 'active' : ''}`}
            >
              View Issues
            </a>
            <a 
              onClick={() => navigate('/buildings/ReportIssue')} 
              className={`nav-link ${isActive('/buildings/ReportIssue') ? 'active' : ''}`}
            >
              Report Issue
            </a>
            <a 
              onClick={() => navigate('/myreports')} 
              className={`nav-link ${isActive('/myreports') ? 'active' : ''}`}
            >
              My Reports
            </a>
          </nav>
        </div>
        <UserMenu userName={userName} />
      </div>
    </header>
  );
}

export default Header;