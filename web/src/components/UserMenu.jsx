import React, { useState, useRef, useEffect } from 'react';
import { User, LogOut, Settings, ChevronDown } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import '../css/components_css/UserMenu.css';

function UserMenu({ userName }) {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef(null);
  const navigate = useNavigate();

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  const handleLogout = () => {
    // Clear authToken from localStorage
    localStorage.removeItem('authToken');
    
    // Close the menu
    setIsOpen(false);
    
    // Redirect to login page
    navigate('/login');
  };

  const handleProfile = () => {
    setIsOpen(false);
    navigate('/profile');
  };

  return (
    <div className="user-menu" ref={menuRef}>
      <button 
        className="user-menu-button" 
        onClick={() => setIsOpen(!isOpen)}
      >
        <div className="user-avatar">
          <User size={20} />
        </div>
        <span className="user-name">{userName || 'User'}</span>
        <ChevronDown size={16} />
      </button>

      {isOpen && (
        <div className="user-menu-dropdown">
          <button className="menu-item" onClick={handleProfile}>
            <Settings size={16} />
            <span>Profile Settings</span>
          </button>
          <div className="menu-divider"></div>
          <button className="menu-item logout" onClick={handleLogout}>
            <LogOut size={16} />
            <span>Logout</span>
          </button>
        </div>
      )}
    </div>
  );
}

export default UserMenu;