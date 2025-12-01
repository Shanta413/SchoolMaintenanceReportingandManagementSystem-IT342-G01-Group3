import React, { useState, useRef, useEffect } from 'react';
import { Settings, User, LogOut, ChevronDown } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import '../css/components_css/UserMenu.css';
import { useTheme } from "../context/useTheme";
import { Sun, Moon } from "lucide-react";

function UserMenu({ userName }) {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef(null);
  const navigate = useNavigate();

  const { theme, toggleTheme } = useTheme();

  // Close menu on outside click
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
    localStorage.removeItem('authToken');
    setIsOpen(false);
    navigate('/login');
  };

  const handleProfile = () => {
    setIsOpen(false);
    navigate('/profile');
  };

  return (
    <div className="user-menu" ref={menuRef}>

      {/* TOP RIGHT: Theme + Menu Button */}
      <div className="user-menu-controls">

        {/* Theme Toggle (SEPARATE button — no nesting) */}
        <button
          className="theme-toggle-btn"
          onClick={toggleTheme}
          title={theme === "dark" ? "Switch to Light Mode" : "Switch to Dark Mode"}
        >
          {theme === "dark" ? <Sun size={20} /> : <Moon size={20} />}
        </button>

        {/* Main menu button */}
        <button
          className="user-menu-button"
          onClick={() => setIsOpen(!isOpen)}
        >
          <div className="user-avatar">
            <Settings size={20} />
          </div>
          <ChevronDown size={16} />
        </button>

      </div>

      {/* DROPDOWN */}
      {isOpen && (
        <div className="user-menu-dropdown">
          <button className="menu-item" onClick={handleProfile}>
            <User size={16} />
            <span>My Profile</span>
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
