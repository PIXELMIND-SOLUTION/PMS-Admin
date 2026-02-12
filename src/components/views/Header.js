import React, { useState, useEffect, useRef } from 'react';
import { MdMenu, MdAccountCircle, MdLogout, MdClose, MdNotificationsNone, MdSearch } from 'react-icons/md';

const Header = ({ onToggleSidebar, onLogout, isMobile, isTablet, sidebarOpen }) => {
  const [showDropdown, setShowDropdown] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const dropdownRef = useRef(null);

  // Detect scroll for glass effect
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleLogout = () => {
    sessionStorage.removeItem('adminDetails');
    if (onLogout) onLogout();
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <>
      <style>{`
        @keyframes slideDown {
          from { opacity: 0; transform: translateY(-20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        
        .header-glass {
          background: ${isScrolled ? 'rgba(255, 255, 255, 0.85)' : 'rgba(255, 255, 255, 0.95)'};
          backdrop-filter: blur(20px);
          -webkit-backdrop-filter: blur(20px);
          border-bottom: 1px solid ${isScrolled ? 'rgba(64, 224, 208, 0.2)' : 'rgba(255, 255, 255, 0.3)'};
          box-shadow: ${isScrolled ? '0 8px 32px rgba(0, 139, 139, 0.08)' : '0 2px 12px rgba(0, 0, 0, 0.02)'};
          transition: all 0.4s cubic-bezier(0.2, 0.9, 0.4, 1);
        }
        
        .menu-button {
          background: rgba(0, 151, 136, 0.08);
          border: 1px solid rgba(0, 151, 136, 0.2);
          border-radius: 14px;
          width: 44px;
          height: 44px;
          display: flex;
          align-items: center;
          justify-content: center;
          color: #009788;
          transition: all 0.3s ease;
          box-shadow: 0 4px 12px rgba(0, 151, 136, 0.12);
        }
        
        .menu-button:hover {
          background: rgba(0, 151, 136, 0.12);
          border-color: rgba(0, 151, 136, 0.4);
          transform: scale(1.05);
          box-shadow: 0 8px 20px rgba(0, 151, 136, 0.2);
        }
        
        .profile-badge {
          background: linear-gradient(145deg, #009788, #007a6e);
          border-radius: 18px;
          padding: 6px 6px 6px 16px;
          display: flex;
          align-items: center;
          gap: 12px;
          box-shadow: 0 8px 20px rgba(0, 151, 136, 0.25);
          transition: all 0.3s ease;
          cursor: pointer;
          border: 1px solid rgba(255, 255, 255, 0.3);
        }
        
        .profile-badge:hover {
          transform: translateY(-2px);
          box-shadow: 0 12px 28px rgba(0, 151, 136, 0.35);
        }
        
        .dropdown-menu-premium {
          background: rgba(255, 255, 255, 0.9);
          backdrop-filter: blur(20px);
          -webkit-backdrop-filter: blur(20px);
          border: 1px solid rgba(255, 255, 255, 0.5);
          border-radius: 20px;
          box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
          animation: slideDown 0.3s cubic-bezier(0.2, 0.9, 0.4, 1);
          overflow: hidden;
          padding: 8px;
          min-width: 220px;
        }
        
        .dropdown-item {
          padding: 12px 16px;
          border-radius: 14px;
          transition: all 0.2s ease;
          color: #1a2e35;
          font-weight: 500;
          display: flex;
          align-items: center;
          gap: 12px;
          border: none;
          background: transparent;
          width: 100%;
        }
        
        .dropdown-item:hover {
          background: rgba(0, 151, 136, 0.08);
          color: #009788;
        }
        
        .notification-badge {
          position: relative;
          margin-right: 8px;
        }
        
        .notification-dot {
          position: absolute;
          top: -2px;
          right: -2px;
          width: 10px;
          height: 10px;
          background: #ff4d6d;
          border-radius: 50%;
          border: 2px solid white;
        }
      `}</style>

      <header className="header-glass sticky-top px-3 px-md-4 px-lg-5 py-2 py-md-3 d-flex justify-content-between align-items-center ultra-transition">
        <div className="d-flex align-items-center gap-2 gap-md-3">
          {/* Premium Menu Toggle Button */}
          <button
            className="menu-button ultra-transition"
            onClick={onToggleSidebar}
            aria-label="Toggle menu"
          >
            {sidebarOpen && !isMobile ? <MdClose size={22} /> : <MdMenu size={22} />}
          </button>
          
          {/* Dynamic Branding */}
          <div className="d-flex flex-column">
            <h2 className="mb-0 fw-bold" style={{ 
              background: 'linear-gradient(135deg, #009788 0%, #00635a 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
              fontSize: isMobile ? '18px' : '24px',
              letterSpacing: '-0.5px'
            }}>
              {isMobile ? 'Dashboard' : 'PixelmindSolutions'}
            </h2>
            <span className="d-none d-md-block text-muted" style={{ fontSize: '11px', letterSpacing: '1px', marginTop: '-4px' }}>
              ADMIN PORTAL
            </span>
          </div>
        </div>

        <div className="d-flex align-items-center gap-2 gap-md-3">
          {/* Search - hidden on mobile */}
          <div className="d-none d-md-flex align-items-center position-relative">
            <MdSearch className="position-absolute" style={{ left: '16px', color: '#009788', opacity: 0.6 }} size={18} />
            <input 
              type="text" 
              placeholder="Quick search..." 
              style={{
                background: 'rgba(0, 151, 136, 0.04)',
                border: '1px solid rgba(0, 151, 136, 0.1)',
                borderRadius: '40px',
                padding: '10px 16px 10px 48px',
                fontSize: '14px',
                width: '200px',
                transition: 'all 0.3s',
                outline: 'none'
              }}
              className="ultra-transition"
              onFocus={(e) => e.target.style.background = 'white'}
              onBlur={(e) => e.target.style.background = 'rgba(0, 151, 136, 0.04)'}
            />
          </div>
          
          {/* Notifications */}
          <div className="notification-badge">
            <div style={{
              width: '40px',
              height: '40px',
              borderRadius: '12px',
              background: 'rgba(255, 255, 255, 0.8)',
              border: '1px solid rgba(0, 151, 136, 0.15)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#009788',
              cursor: 'pointer',
              transition: 'all 0.3s'
            }}
            className="ultra-transition"
            onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(0, 151, 136, 0.08)'}
            onMouseLeave={(e) => e.currentTarget.style.background = 'rgba(255, 255, 255, 0.8)'}
            >
              <MdNotificationsNone size={20} />
              <span className="notification-dot"></span>
            </div>
          </div>

          {/* Premium Profile Badge */}
          <div ref={dropdownRef} className="position-relative">
            <div 
              className="profile-badge"
              onClick={() => setShowDropdown(!showDropdown)}
            >
              <span className="d-none d-md-block text-white fw-semibold" style={{ fontSize: '14px' }}>
                Alexander
              </span>
              <div className="rounded-circle d-flex align-items-center justify-content-center text-white fw-bold"
                style={{ 
                  width: '36px', 
                  height: '36px', 
                  background: 'linear-gradient(145deg, #ffe6e6, #ffd6d6)',
                  color: '#009788',
                  border: '2px solid white',
                  boxShadow: '0 4px 10px rgba(0,0,0,0.1)',
                  fontSize: '16px'
                }}
              >
                A
              </div>
            </div>

            {/* Premium Dropdown */}
            {showDropdown && (
              <div 
                className="dropdown-menu-premium position-absolute"
                style={{
                  top: 'calc(100% + 12px)',
                  right: '0',
                  zIndex: 1100,
                }}
              >
                <div className="px-3 py-2 border-bottom" style={{ borderColor: 'rgba(0,0,0,0.05) !important' }}>
                  <div className="fw-bold" style={{ color: '#009788' }}>Alexander Pierce</div>
                  <small className="text-muted">admin@pixelmind.com</small>
                </div>
                
                <button
                  className="dropdown-item"
                  onClick={handleLogout}
                  style={{ marginTop: '4px' }}
                >
                  <MdLogout size={18} color="#ff6b6b" />
                  <span style={{ color: '#ff6b6b', fontWeight: '600' }}>Secure Logout</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </header>
    </>
  );
};

export default Header;