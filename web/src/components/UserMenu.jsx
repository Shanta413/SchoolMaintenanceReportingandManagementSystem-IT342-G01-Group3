import React, { useState } from 'react';
import { Settings, User } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import '../css/components_css/UserMenu.css';

function UserMenu({ userName = 'User' }) {
  const [showProfileDropdown, setShowProfileDropdown] = useState(false);
  const navigate = useNavigate();

  const handleLogout = () => {
    setShowProfileDropdown(false);
    // Add any logout logic here (e.g., clear tokens)
    navigate('/login');
  };

  const handleGoToProfile = () => {
    setShowProfileDropdown(false);
    navigate('/profile');
  };

  return (
    <div className="user-menu">
      <div className="user-info">
        <span className="user-name">{userName}</span>
      </div>

      <button className="icon-button">
        <Settings size={20} />
      </button>

      <div className="profile-dropdown-container">
        <button
          className="icon-button user-avatar"
          onClick={() => setShowProfileDropdown(!showProfileDropdown)}
          title="Profile Menu"
        >
          <User size={20} />
        </button>

        {showProfileDropdown && (
          <>
            <div
              className="dropdown-overlay"
              onClick={() => setShowProfileDropdown(false)}
            />
            <div className="profile-dropdown">
              <button
                className="dropdown-item"
                onClick={handleGoToProfile}
              >
                <User size={18} />
                <span>Go to Profile</span>
              </button>

              <div className="dropdown-divider" />

              <button
                className="dropdown-item logout-item"
                onClick={handleLogout}
              >
                <svg
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                  <polyline points="16 17 21 12 16 7" />
                  <line x1="21" y1="12" x2="9" y2="12" />
                </svg>
                <span>Logout</span>
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default UserMenu;
