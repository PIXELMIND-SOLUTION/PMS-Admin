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
  MdDownload,
  MdInsights,
  MdSettings
} from 'react-icons/md';

const Sidebar = ({ isOpen, onLogout, isMobile, isTablet, onClose }) => {
  const location = useLocation();
  const [openMenus, setOpenMenus] = useState({});
  const [hoveredItem, setHoveredItem] = useState(null);

  // Restore open menus based on current path
  useEffect(() => {
    const paths = [
      'staff', 'projects', 'assigned-works', 'attendance', 'invoice', 'payslip'
    ];
    paths.forEach(path => {
      if (location.pathname.includes(path) && !openMenus[path]) {
        setOpenMenus(prev => ({ ...prev, [path]: true }));
      }
    });
  }, [location.pathname]);

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

  const handleLinkClick = () => {
    if (isMobile) {
      onClose();
    }
  };

  const menuItems = [
    { 
      path: '/dashboard', 
      label: 'Dashboard', 
      icon: <MdDashboard />,
      description: 'Overview & analytics'
    },
    {
      id: 'staff',
      label: 'Staff Management',
      icon: <MdPeople />,
      description: 'Manage team members',
      submenu: [
        { path: '/add-staff', label: 'Add Staff', icon: <MdAddCircleOutline />, description: 'Create new profile' },
        { path: '/staff', label: 'Staff Directory', icon: <MdListAlt />, description: 'View all members' },
      ],
    },
    {
      id: 'projects',
      label: 'Projects',
      icon: <MdFolder />,
      description: 'Track progress',
      submenu: [
        { path: '/add-project', label: 'New Project', icon: <MdAddCircleOutline />, description: 'Create project' },
        { path: '/projects', label: 'Project List', icon: <MdListAlt />, description: 'All projects' },
      ],
    },
    {
      id: 'assigned-works',
      label: 'Work Allocation',
      icon: <MdAssignment />,
      description: 'Tasks & assignments',
      submenu: [
        { path: '/add-worksheet', label: 'New Worksheet', icon: <MdAddCircleOutline />, description: 'Assign work' },
        { path: '/assigned-works', label: 'All Worksheets', icon: <MdListAlt />, description: 'View assignments' },
      ],
    },
    {
      id: 'attendance',
      label: 'Attendance',
      icon: <MdSchedule />,
      description: 'Time tracking',
      submenu: [
        { path: '/add-attendance', label: 'Mark Attendance', icon: <MdAddCircleOutline />, description: 'Daily entry' },
        { path: '/attendance', label: 'Attendance Log', icon: <MdListAlt />, description: 'History' },
      ],
    },
    {
      id: 'invoice',
      label: 'Invoicing',
      icon: <MdFolder />,
      description: 'Billing & payments',
      submenu: [
        { path: '/create-invoice', label: 'Create Invoice', icon: <MdAddCircleOutline />, description: 'New invoice' },
        { path: '/invoices', label: 'Invoice List', icon: <MdListAlt />, description: 'All invoices' },
        { path: '/invoices1', label: 'Advanced Invoice', icon: <MdDownload />, description: 'Pro format' },
      ],
    },
    {
      id: 'payslip',
      label: 'Payroll',
      icon: <MdAssignment />,
      description: 'Salary processing',
      submenu: [
        { path: '/create-payslip', label: 'Generate Payslip', icon: <MdAddCircleOutline />, description: 'Monthly payroll' },
        { path: '/payslips', label: 'Payslip History', icon: <MdListAlt />, description: 'View all' },
      ],
    },
  ];

  const bottomMenuItems = [
    { path: '/analytics', label: 'Analytics', icon: <MdInsights />, description: 'Reports & insights' },
    { path: '/settings', label: 'Settings', icon: <MdSettings />, description: 'Preferences' },
    { path: '/change-password', label: 'Security', icon: <MdLock />, description: 'Change password' },
  ];

  return (
    <>
      <style>{`
        @keyframes slideIn {
          from { transform: translateX(-100%); opacity: 0; }
          to { transform: translateX(0); opacity: 1; }
        }
        
        @keyframes glowPulse {
          0%, 100% { box-shadow: 0 0 0 0 rgba(64, 224, 208, 0.4); }
          50% { box-shadow: 0 0 0 8px rgba(64, 224, 208, 0); }
        }
        
        .sidebar-premium {
          background: linear-gradient(165deg, #0b2f2f 0%, #063737 30%, #004d4d 100%);
          box-shadow: 20px 0 40px rgba(0, 77, 77, 0.25);
          border-right: 1px solid rgba(255, 255, 255, 0.08);
          animation: slideIn 0.5s cubic-bezier(0.2, 0.9, 0.4, 1);
        }
        
        .menu-header-premium {
          background: rgba(255, 255, 255, 0.03);
          border-bottom: 1px solid rgba(64, 224, 208, 0.2);
          backdrop-filter: blur(10px);
        }
        
        .menu-item-ultra {
          transition: all 0.4s cubic-bezier(0.2, 0.9, 0.4, 1);
          border-radius: 16px;
          margin: 6px 12px;
          padding: 12px 16px;
          color: rgba(255, 255, 255, 0.85);
          position: relative;
          overflow: hidden;
        }
        
        .menu-item-ultra::before {
          content: '';
          position: absolute;
          left: 0;
          top: 0;
          width: 4px;
          height: 100%;
          background: linear-gradient(180deg, #40E0D0, #00CED1);
          transform: scaleY(0);
          transition: transform 0.3s ease;
          transform-origin: top;
          border-radius: 0 4px 4px 0;
        }
        
        .menu-item-ultra:hover::before {
          transform: scaleY(1);
        }
        
        .menu-item-ultra:hover {
          background: rgba(255, 255, 255, 0.06);
          color: white;
          padding-left: 20px;
        }
        
        .menu-item-active {
          background: linear-gradient(90deg, rgba(64, 224, 208, 0.2), rgba(64, 224, 208, 0.05));
          color: white !important;
          border-left: 4px solid #40E0D0;
          border-radius: 16px 0 0 16px;
        }
        
        .menu-item-active .icon-wrapper {
          background: rgba(64, 224, 208, 0.3);
          color: #40E0D0;
        }
        
        .icon-wrapper {
          width: 38px;
          height: 38px;
          border-radius: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all 0.3s ease;
          background: rgba(255, 255, 255, 0.05);
          color: rgba(255, 255, 255, 0.9);
          font-size: 18px;
        }
        
        .submenu-container {
          margin-left: 20px;
          padding-left: 16px;
          border-left: 1px solid rgba(64, 224, 208, 0.3);
          position: relative;
        }
        
        .submenu-item {
          display: flex;
          align-items: center;
          padding: 10px 16px;
          margin: 4px 0;
          color: rgba(255, 255, 255, 0.75);
          border-radius: 14px;
          transition: all 0.3s ease;
          font-size: 13px;
          position: relative;
        }
        
        .submenu-item:hover {
          background: rgba(64, 224, 208, 0.15);
          color: white;
          padding-left: 22px;
        }
        
        .submenu-item-active {
          background: rgba(64, 224, 208, 0.2);
          color: white;
          border-left: 3px solid #40E0D0;
          border-radius: 14px 0 0 14px;
        }
        
        .logout-btn-premium {
          background: rgba(255, 77, 109, 0.08);
          border: 1px solid rgba(255, 77, 109, 0.2);
          border-radius: 16px;
          margin: 12px;
          padding: 14px 18px;
          transition: all 0.4s ease;
        }
        
        .logout-btn-premium:hover {
          background: rgba(255, 77, 109, 0.15);
          border-color: rgba(255, 77, 109, 0.4);
          transform: translateY(-2px);
        }
        
        .badge-premium {
          background: rgba(64, 224, 208, 0.25);
          padding: 2px 10px;
          border-radius: 100px;
          font-size: 10px;
          font-weight: 600;
          letter-spacing: 0.5px;
          color: #40E0D0;
          border: 1px solid rgba(64, 224, 208, 0.4);
        }
      `}</style>

      <div style={{
        width: isMobile ? '300px' : (isTablet ? '280px' : '280px'),
        position: 'fixed',
        height: '100vh',
        left: isOpen ? '0' : (isMobile ? '-300px' : '-280px'),
        transition: 'left 0.4s cubic-bezier(0.2, 0.9, 0.4, 1)',
        zIndex: 1100,
        display: 'flex',
        flexDirection: 'column',
      }} className="sidebar-premium">
        
        {/* Premium Header with Close */}
        <div className="menu-header-premium d-flex align-items-center justify-content-between p-4">
          <div className="d-flex align-items-center gap-3">
            <div style={{
              width: '44px',
              height: '44px',
              background: 'linear-gradient(135deg, #40E0D0, #00CED1)',
              borderRadius: '16px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 8px 20px rgba(64, 224, 208, 0.3)'
            }}>
              <span className="fw-bold text-white" style={{ fontSize: '22px' }}>P</span>
            </div>
            <div>
              <h5 className="mb-0 fw-bold text-white" style={{ letterSpacing: '0.5px' }}>Pixelmind</h5>
              <span className="badge-premium">v3.0 · ULTRA</span>
            </div>
          </div>
          {isMobile && (
            <button
              onClick={onClose}
              style={{
                background: 'rgba(255,255,255,0.1)',
                border: 'none',
                width: '40px',
                height: '40px',
                borderRadius: '14px',
                color: 'white',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
              className="ultra-transition"
            >
              <MdClose size={22} />
            </button>
          )}
        </div>

        {/* Scrollable Menu Area */}
        <div className="flex-grow-1 overflow-auto py-3" style={{
          scrollbarWidth: 'thin',
          scrollbarColor: 'rgba(64,224,208,0.3) transparent'
        }}>
          {menuItems.map((item, index) => (
            <div key={item.id || item.path} style={{ animation: `slideIn 0.3s ease ${index * 0.05}s backwards` }}>
              {item.submenu ? (
                <>
                  <div
                    className="menu-item-ultra d-flex align-items-center justify-content-between"
                    onClick={() => toggleSubmenu(item.id)}
                    style={{ cursor: 'pointer' }}
                  >
                    <div className="d-flex align-items-center gap-3">
                      <div className="icon-wrapper">
                        {item.icon}
                      </div>
                      <div className="d-flex flex-column">
                        <span className="fw-semibold" style={{ fontSize: '14px' }}>{item.label}</span>
                        <span style={{ fontSize: '11px', opacity: 0.6 }}>{item.description}</span>
                      </div>
                    </div>
                    <span style={{ 
                      transform: openMenus[item.id] ? 'rotate(180deg)' : 'rotate(0deg)',
                      transition: 'transform 0.4s',
                      opacity: 0.7
                    }}>
                      {openMenus[item.id] ? <MdExpandLess size={20} /> : <MdExpandMore size={20} />}
                    </span>
                  </div>

                  {openMenus[item.id] && (
                    <div className="submenu-container mt-1 mb-2">
                      {item.submenu.map((subItem, subIndex) => (
                        <Link
                          key={subItem.path}
                          to={subItem.path}
                          className={`submenu-item text-decoration-none ${location.pathname === subItem.path ? 'submenu-item-active' : ''}`}
                          onClick={handleLinkClick}
                          style={{ animation: `slideIn 0.2s ease ${subIndex * 0.03}s backwards` }}
                        >
                          <span style={{ marginRight: '14px', fontSize: '16px', opacity: 0.9 }}>
                            {subItem.icon}
                          </span>
                          <div className="d-flex flex-column">
                            <span style={{ fontSize: '13px', fontWeight: '500' }}>{subItem.label}</span>
                            <span style={{ fontSize: '10px', opacity: 0.6 }}>{subItem.description}</span>
                          </div>
                        </Link>
                      ))}
                    </div>
                  )}
                </>
              ) : (
                <Link
                  to={item.path}
                  className={`menu-item-ultra text-decoration-none d-flex align-items-center gap-3 ${location.pathname === item.path ? 'menu-item-active' : ''}`}
                  onClick={handleLinkClick}
                >
                  <div className="icon-wrapper">
                    {item.icon}
                  </div>
                  <div className="d-flex flex-column">
                    <span className="fw-semibold" style={{ fontSize: '14px' }}>{item.label}</span>
                    {item.description && (
                      <span style={{ fontSize: '11px', opacity: 0.6 }}>{item.description}</span>
                    )}
                  </div>
                </Link>
              )}
            </div>
          ))}

          {/* Divider */}
          <div style={{ height: '1px', background: 'rgba(255,255,255,0.08)', margin: '20px 16px' }} />

          {/* Bottom Menu Items */}
          {bottomMenuItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className="menu-item-ultra text-decoration-none d-flex align-items-center gap-3"
              onClick={handleLinkClick}
            >
              <div className="icon-wrapper">
                {item.icon}
              </div>
              <div className="d-flex flex-column">
                <span className="fw-semibold" style={{ fontSize: '14px' }}>{item.label}</span>
                <span style={{ fontSize: '11px', opacity: 0.6 }}>{item.description}</span>
              </div>
            </Link>
          ))}

          {/* Ultra Premium Logout */}
          <div
            className="logout-btn-premium d-flex align-items-center gap-3"
            onClick={handleLogout}
            style={{ cursor: 'pointer' }}
          >
            <div className="icon-wrapper" style={{ background: 'rgba(255,77,109,0.1)', color: '#ff8a8a' }}>
              <MdLogout size={20} />
            </div>
            <div className="d-flex flex-column">
              <span className="fw-bold" style={{ color: '#ffb3b3', fontSize: '14px' }}>Logout</span>
              <span style={{ fontSize: '11px', opacity: 0.6, color: 'rgba(255,179,179,0.7)' }}>End session</span>
            </div>
          </div>
        </div>

        {/* Premium Footer */}
        <div className="p-3 text-center" style={{ borderTop: '1px solid rgba(255,255,255,0.05)' }}>
          <span style={{ color: 'rgba(255,255,255,0.4)', fontSize: '11px' }}>
            SYSTEM · SECURE
          </span>
        </div>
      </div>
    </>
  );
};

export default Sidebar;