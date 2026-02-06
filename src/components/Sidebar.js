import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  MdDashboard,
  MdPeople,
  MdFolder,
  MdAssignment,
  MdLock,
  MdSchedule,
  MdLogout,
  MdExpandMore,
  MdExpandLess,
  MdAddCircleOutline,
  MdListAlt,
  MdClose,
  MdDownload
} from 'react-icons/md';

const Sidebar = ({ isOpen, onLogout, isMobile, onClose }) => {
  const location = useLocation();
  const [openMenus, setOpenMenus] = useState({});
  const [hoveredItem, setHoveredItem] = useState(null);

  const toggleSubmenu = (path) => {
    setOpenMenus((prev) => ({
      ...prev,
      [path]: !prev[path],
    }));
  };

  const handleLogout = () => {
    sessionStorage.removeItem('adminDetails');
    if (onLogout) onLogout();
  };

  // Close sidebar when a link is clicked on mobile
  const handleLinkClick = () => {
    if (isMobile) {
      onClose();
    }
  };

  const menuItems = [
    { path: '/dashboard', label: 'Dashboard', icon: <MdDashboard /> },
    {
      path: 'staff',
      label: 'Staff',
      icon: <MdPeople />,
      submenu: [
        { path: '/add-staff', label: 'Add Staff', icon: <MdAddCircleOutline /> },
        { path: '/staff', label: 'Staff Members', icon: <MdListAlt /> },
      ],
    },
    {
      path: 'projects',
      label: 'Projects',
      icon: <MdFolder />,
      submenu: [
        { path: '/add-project', label: 'Add Project', icon: <MdAddCircleOutline /> },
        { path: '/projects', label: 'Projects List', icon: <MdListAlt /> },
      ],
    },
    {
      path: 'assigned-works',
      label: 'Assigned Works',
      icon: <MdAssignment />,
      submenu: [
        { path: '/add-worksheet', label: 'Add Worksheet', icon: <MdAddCircleOutline /> },
        { path: '/assigned-works', label: 'Assigned Works', icon: <MdListAlt /> },
      ],
    },
    {
      path: 'attendance',
      label: 'Attendance',
      icon: <MdSchedule />,
      submenu: [
        { path: '/add-attendance', label: 'Add Attendance', icon: <MdAddCircleOutline /> },
        { path: '/attendance', label: 'Show Attendance', icon: <MdListAlt /> },
      ],
    },
    {
      path: 'invoice',
      label: 'Invoice',
      icon: <MdFolder />,
      submenu: [
        { path: '/create-invoice', label: 'Create Invoice', icon: <MdAddCircleOutline /> },
        { path: '/invoices', label: 'Show Invoice', icon: <MdListAlt /> },
        { path: '/invoices1', label: 'Advace Invoice', icon: <MdDownload /> },
      ],
    },
    {
      path: 'payslip',
      label: 'Payslip',
      icon: <MdAssignment />,
      submenu: [
        { path: '/create-payslip', label: 'Create Payslip', icon: <MdAddCircleOutline /> },
        { path: '/payslips', label: 'Show Payslips', icon: <MdListAlt /> },
      ],
    },
  ];

  const bottomMenuItems = [
    { path: '#', label: 'Change Password', icon: <MdLock /> },
  ];

  return (
    <>
      <style>{`
        @keyframes slideInFromLeft {
          from {
            transform: translateX(-100%);
            opacity: 0;
          }
          to {
            transform: translateX(0);
            opacity: 1;
          }
        }

        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(8px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes pulse {
          0%, 100% {
            opacity: 1;
          }
          50% {
            opacity: 0.8;
          }
        }

        .premium-sidebar {
          animation: slideInFromLeft 0.4s ease;
        }

        .sidebar-scroll::-webkit-scrollbar {
          width: 6px;
        }

        .sidebar-scroll::-webkit-scrollbar-track {
          background: transparent;
        }

        .sidebar-scroll::-webkit-scrollbar-thumb {
          background: rgba(255, 255, 255, 0.2);
          border-radius: 10px;
          transition: background 0.3s ease;
        }

        .sidebar-scroll::-webkit-scrollbar-thumb:hover {
          background: rgba(255, 255, 255, 0.4);
        }

        .menu-item-premium {
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          position: relative;
          overflow: hidden;
        }

        .menu-item-premium::before {
          content: '';
          position: absolute;
          left: 0;
          top: 0;
          width: 4px;
          height: 100%;
          background: linear-gradient(180deg, #40E0D0, #00CED1);
          transform: scaleY(0);
          transition: transform 0.3s ease;
          origin: top;
        }

        .menu-item-premium:hover::before {
          transform: scaleY(1);
        }

        .menu-item-active {
          background: linear-gradient(90deg, rgba(64, 224, 208, 0.3), transparent);
          border-left: 4px solid #40E0D0;
        }

        .submenu-item {
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          border-radius: 8px;
          margin: 4px 12px;
          padding: 10px 12px;
          position: relative;
        }

        .submenu-item::before {
          content: '';
          position: absolute;
          left: 0;
          top: 50%;
          transform: translateY(-50%);
          width: 3px;
          height: 0;
          background: linear-gradient(180deg, #40E0D0, #00CED1);
          border-radius: 2px;
          transition: height 0.3s ease;
        }

        .submenu-item:hover::before {
          height: 20px;
        }

        .submenu-item-active {
          background: rgba(64, 224, 208, 0.25);
          border-left: 3px solid #40E0D0;
          padding-left: 14px;
        }

        .submenu-item-active::before {
          height: 100%;
          background: linear-gradient(180deg, #40E0D0, #00CED1);
        }

        .icon-wrapper {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 36px;
          height: 36px;
          border-radius: 10px;
          transition: all 0.3s ease;
        }

        .menu-item-premium:hover .icon-wrapper {
          background: rgba(255, 255, 255, 0.15);
          transform: scale(1.1);
        }

        .menu-item-active .icon-wrapper {
          background: rgba(64, 224, 208, 0.3);
        }

        .logout-btn {
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          background: rgba(255, 59, 48, 0.1);
          border-left: 4px solid transparent;
        }

        .logout-btn:hover {
          background: rgba(255, 59, 48, 0.2);
          border-left-color: #ff6b5b;
          padding-left: calc(1rem + 4px);
        }
      `}</style>

      <div style={{
        width: isMobile ? '280px' : '260px',
        background: 'linear-gradient(135deg, #008b8b 0%, #006666 100%)',
        color: 'white',
        position: isMobile ? 'fixed' : 'fixed',
        height: '100vh',
        transition: 'transform 0.3s ease, left 0.3s ease',
        zIndex: 1000,
        left: isMobile ? (isOpen ? '0' : '-280px') : (isOpen ? '0' : '-260px'),
        display: 'flex',
        flexDirection: 'column',
        boxShadow: '8px 0 32px rgba(0, 0, 0, 0.2)',
        backdropFilter: 'blur(10px)',
      }} className="premium-sidebar">
        {/* Header */}
        <div style={{
          padding: '24px 20px',
          borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
          background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.08) 0%, transparent 100%)',
          backdropFilter: 'blur(20px)',
          position: 'relative'
        }}>
          {isMobile && (
            <button
              className="absolute right-4 top-4 p-2 text-white bg-white/10 border border-white/20 rounded-lg flex items-center justify-center hover:bg-white/20 transition-all duration-300"
              onClick={onClose}
              title="Close menu"
            >
              <MdClose size={20} />
            </button>
          )}
          <h5 style={{
            marginBottom: '0',
            fontWeight: '700',
            fontSize: '18px',
            letterSpacing: '0.5px',
            textAlign: 'center',
            background: 'linear-gradient(135deg, #40E0D0, #00CED1)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
          }}>
            Admin Panel
          </h5>
        </div>

        {/* Menu Items Container */}
        <div className="sidebar-scroll" style={{
          flex: 1,
          overflowY: 'auto',
          scrollbarWidth: 'thin',
          msOverflowStyle: 'thin-scrollbar',
          paddingTop: '8px',
          paddingBottom: '12px',
        }}>
          {menuItems.map((item, index) => (
            <div key={item.path} style={{ animation: `fadeInUp 0.4s ease ${index * 0.05}s backwards` }}>
              {item.submenu ? (
                <>
                  <div
                    className="menu-item-premium"
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      paddingLeft: '16px',
                      paddingRight: '16px',
                      paddingTop: '12px',
                      paddingBottom: '12px',
                      color: 'white',
                      cursor: 'pointer',
                      marginBottom: '4px',
                    }}
                    onClick={() => toggleSubmenu(item.path)}
                    onMouseEnter={(e) => {
                      if (!isMobile) {
                        setHoveredItem(item.path);
                        e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.08)';
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (!isMobile) {
                        setHoveredItem(null);
                        e.currentTarget.style.backgroundColor = 'transparent';
                      }
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <div className="icon-wrapper" style={{ fontSize: '18px' }}>
                        {item.icon}
                      </div>
                      <span style={{ fontWeight: '500', fontSize: '14px', letterSpacing: '0.3px' }}>
                        {item.label}
                      </span>
                    </div>
                    <span style={{
                      fontSize: '18px',
                      transition: 'transform 0.3s ease',
                      transform: openMenus[item.path] ? 'rotate(180deg)' : 'rotate(0deg)',
                    }}>
                      {openMenus[item.path] ? <MdExpandLess /> : <MdExpandMore />}
                    </span>
                  </div>

                  {openMenus[item.path] && (
                    <div style={{ overflow: 'hidden', paddingRight: '8px' }}>
                      {item.submenu.map((subItem, subIndex) => (
                        <Link
                          key={subItem.path}
                          to={subItem.path}
                          className={`submenu-item ${location.pathname === subItem.path ? 'submenu-item-active' : ''}`}
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            color: 'white',
                            textDecoration: 'none',
                            fontSize: '13px',
                            fontWeight: '400',
                            animation: `fadeInUp 0.3s ease ${subIndex * 0.05}s backwards`,
                          }}
                          onClick={handleLinkClick}
                          onMouseEnter={(e) => {
                            if (!isMobile && location.pathname !== subItem.path) {
                              e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.08)';
                            }
                          }}
                          onMouseLeave={(e) => {
                            if (!isMobile && location.pathname !== subItem.path) {
                              e.currentTarget.style.backgroundColor = 'transparent';
                            }
                          }}
                        >
                          <span style={{ fontSize: '14px', marginRight: '10px', opacity: 0.8 }}>
                            {subItem.icon}
                          </span>
                          <span>{subItem.label}</span>
                        </Link>
                      ))}
                    </div>
                  )}
                </>
              ) : (
                <Link
                  to={item.path}
                  className={`menu-item-premium ${location.pathname === item.path ? 'menu-item-active' : ''}`}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    paddingLeft: '16px',
                    paddingRight: '16px',
                    paddingTop: '12px',
                    paddingBottom: '12px',
                    color: 'white',
                    textDecoration: 'none',
                    marginBottom: '4px',
                    ...(location.pathname === item.path ? {
                      background: 'linear-gradient(90deg, rgba(64, 224, 208, 0.3), transparent)',
                      borderLeft: '4px solid #40E0D0',
                      paddingLeft: '12px',
                    } : {}),
                  }}
                  onClick={handleLinkClick}
                  onMouseEnter={(e) => {
                    if (!isMobile && location.pathname !== item.path) {
                      e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.08)';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!isMobile && location.pathname !== item.path) {
                      e.currentTarget.style.backgroundColor = 'transparent';
                    }
                  }}
                >
                  <div className="icon-wrapper" style={{ fontSize: '18px', marginRight: '12px' }}>
                    {item.icon}
                  </div>
                  <span style={{ fontWeight: '500', fontSize: '14px', letterSpacing: '0.3px' }}>
                    {item.label}
                  </span>
                </Link>
              )}
            </div>
          ))}

          {/* Bottom Menu Items */}
          {bottomMenuItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className="menu-item-premium"
              style={{
                display: 'flex',
                alignItems: 'center',
                paddingLeft: '16px',
                paddingRight: '16px',
                paddingTop: '12px',
                paddingBottom: '12px',
                color: 'white',
                textDecoration: 'none',
                marginBottom: '4px',
                marginTop: '12px',
                borderTop: '1px solid rgba(255, 255, 255, 0.1)',
              }}
              onClick={handleLinkClick}
              onMouseEnter={(e) => {
                if (!isMobile) {
                  e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.08)';
                }
              }}
              onMouseLeave={(e) => {
                if (!isMobile) {
                  e.currentTarget.style.backgroundColor = 'transparent';
                }
              }}
            >
              <div className="icon-wrapper" style={{ fontSize: '18px', marginRight: '12px' }}>
                {item.icon}
              </div>
              <span style={{ fontWeight: '500', fontSize: '14px', letterSpacing: '0.3px' }}>
                {item.label}
              </span>
            </Link>
          ))}

          {/* Logout Button */}
          <div
            className="logout-btn"
            style={{
              display: 'flex',
              alignItems: 'center',
              paddingLeft: '16px',
              paddingRight: '16px',
              paddingTop: '12px',
              paddingBottom: '12px',
              color: 'white',
              textDecoration: 'none',
              cursor: 'pointer',
              marginTop: '8px',
            }}
            onClick={handleLogout}
            onMouseEnter={(e) => {
              if (!isMobile) {
                e.currentTarget.style.background = 'rgba(255, 59, 48, 0.2)';
                e.currentTarget.style.borderLeft = '4px solid #ff6b5b';
                e.currentTarget.style.paddingLeft = '12px';
              }
            }}
            onMouseLeave={(e) => {
              if (!isMobile) {
                e.currentTarget.style.background = 'rgba(255, 59, 48, 0.1)';
                e.currentTarget.style.borderLeft = '4px solid transparent';
                e.currentTarget.style.paddingLeft = '16px';
              }
            }}
          >
            <div className="icon-wrapper" style={{
              fontSize: '18px',
              marginRight: '12px',
              background: 'rgba(255, 59, 48, 0.2)',
              color: '#ff6b5b',
            }}>
              <MdLogout />
            </div>
            <span style={{ fontWeight: '600', fontSize: '14px', letterSpacing: '0.3px', color: '#ff6b5b' }}>
              Logout
            </span>
          </div>
        </div>
      </div>
    </>
  );
};

export default Sidebar;