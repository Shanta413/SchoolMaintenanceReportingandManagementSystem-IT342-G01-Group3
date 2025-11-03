import React from 'react';
import CitfixLogo from './CitfixLogo';
import UserMenu from './UserMenu';
import '../css/components_css/Header.css';

function Header({ userName }) {
  return (
    <header className="header">
      <div className="header-content">
        <CitfixLogo size="sm" />
        <nav className="nav-links">
          <a href="#" className="nav-link">View Issues</a>
          <a href="#" className="nav-link">Report Issue</a>
          <a href="#" className="nav-link">My Reports</a>
        </nav>
        <UserMenu userName={userName} />
      </div>
    </header>
  );
}

export default Header;
