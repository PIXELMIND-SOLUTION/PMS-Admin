import React, { useState } from 'react';
import { MdMenu, MdAccountCircle, MdLogout } from 'react-icons/md';

const Header = ({ onToggleSidebar, onLogout, isMobile }) => {
  const [showDropdown, setShowDropdown] = useState(false);

  const handleLogout = () => {
    sessionStorage.removeItem('adminDetails');
    if (onLogout) onLogout();
  };

  return (
    <header className="bg-white shadow-sm py-2 py-md-3 px-3 px-md-4 d-flex justify-content-between align-items-center sticky-top">
      <div className="d-flex align-items-center">
        <button
          className="btn btn-outline-primary me-2 me-md-3 d-flex align-items-center justify-content-center"
          onClick={onToggleSidebar}
          style={{ 
            borderColor: '#009788', 
            color: '#009788',
            width: '40px',
            height: '40px'
          }}
        >
          <MdMenu size={20} />
        </button>
        <h2 className="mb-0 fw-bold fs-5 fs-md-4" style={{ color: '#009788' }}>
          {isMobile ? 'Dashboard' : 'PixelmindSolutions'}
        </h2>
      </div>
      
      <div className="d-flex align-items-center position-relative">
        <span className="me-2 me-md-3 text-muted d-none d-sm-block" style={{ fontSize: '0.9rem' }}>
          Welcome, Admin
        </span>
        
        <div 
          className="rounded-circle d-flex align-items-center justify-content-center text-white fw-bold"
          style={{ 
            width: '40px', 
            height: '40px', 
            backgroundColor: '#009788',
            cursor: 'pointer'
          }}
          onClick={() => setShowDropdown(!showDropdown)}
        >
          A
        </div>

        {/* Dropdown Menu */}
        {showDropdown && (
          <div 
            className="position-absolute bg-white shadow rounded py-2"
            style={{
              top: '100%',
              right: '0',
              minWidth: '160px',
              zIndex: 1001,
              marginTop: '8px'
            }}
          >
            <div className="px-3 py-2 border-bottom">
              <small className="text-muted">Admin User</small>
            </div>
            <button
              className="btn btn-light w-100 text-start px-3 py-2 d-flex align-items-center"
              onClick={handleLogout}
            >
              <MdLogout className="me-2" />
              Logout
            </button>
          </div>
        )}
      </div>

      {/* Overlay for dropdown */}
      {showDropdown && (
        <div 
          className="position-fixed w-100 h-100"
          style={{
            top: 0,
            left: 0,
            zIndex: 1000
          }}
          onClick={() => setShowDropdown(false)}
        />
      )}
    </header>
  );
};

export default Header;