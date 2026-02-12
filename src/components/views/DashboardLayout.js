import React, { useState, useEffect } from "react";
import { Outlet, Navigate } from "react-router-dom";
import Sidebar from "./Sidebar";
import Header from "./Header";

const DashboardLayout = ({ isLoggedIn, onLogout }) => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [isMobile, setIsMobile] = useState(false);
  const [isTablet, setIsTablet] = useState(false);

  // Premium device detection with breakpoints
  useEffect(() => {
    const checkDevice = () => {
      const width = window.innerWidth;
      setIsMobile(width < 768);
      setIsTablet(width >= 768 && width < 1024);
      // Auto sidebar behavior: closed on mobile, open on tablet/desktop
      if (width < 768) {
        setSidebarOpen(false);
      } else if (width >= 768 && width < 1024) {
        setSidebarOpen(true); // Tablet: keep open but compact
      } else {
        setSidebarOpen(true); // Desktop: fully open
      }
    };

    checkDevice();
    window.addEventListener('resize', checkDevice);
    return () => window.removeEventListener('resize', checkDevice);
  }, []);

  const toggleSidebar = () => {
    setSidebarOpen((prev) => !prev);
  };

  // Elegant close on content click for mobile
  const handleContentClick = () => {
    if (isMobile && sidebarOpen) {
      setSidebarOpen(false);
    }
  };

  if (!isLoggedIn) {
    return <Navigate to="/" replace />;
  }

  // Dynamic margin based on device and sidebar state
  const getContentMargin = () => {
    if (isMobile) return "0";
    if (isTablet) return sidebarOpen ? "280px" : "0";
    return sidebarOpen ? "280px" : "0";
  };

  return (
    <div className="dashboard-ultra">
      {/* Premium Global Styles */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap');
        
        .dashboard-ultra * {
          font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
        }
        
        /* Glassmorphism base */
        .glass-panel {
          background: rgba(255, 255, 255, 0.9);
          backdrop-filter: blur(20px);
          -webkit-backdrop-filter: blur(20px);
          border: 1px solid rgba(255, 255, 255, 0.3);
          box-shadow: 0 8px 32px rgba(0, 0, 0, 0.08);
        }
        
        /* Smooth transitions */
        .ultra-transition {
          transition: all 0.4s cubic-bezier(0.2, 0.9, 0.4, 1);
        }
        
        /* Premium scrollbar */
        .ultra-scroll::-webkit-scrollbar {
          width: 6px;
          height: 6px;
        }
        .ultra-scroll::-webkit-scrollbar-track {
          background: rgba(0, 139, 139, 0.05);
          border-radius: 20px;
        }
        .ultra-scroll::-webkit-scrollbar-thumb {
          background: rgba(0, 139, 139, 0.3);
          border-radius: 20px;
          transition: all 0.3s;
        }
        .ultra-scroll::-webkit-scrollbar-thumb:hover {
          background: rgba(0, 139, 139, 0.6);
        }
        
        /* Mobile optimization */
        @media (max-width: 767px) {
          .dashboard-content {
            padding-top: 60px;
          }
        }
        
        /* Tablet optimization */
        @media (min-width: 768px) and (max-width: 1023px) {
          .dashboard-content {
            padding-top: 0;
          }
        }
      `}</style>

      <div className="position-relative d-flex" style={{ minHeight: '100vh', background: '#f5f7fb' }}>
        {/* Sidebar - Ultra Premium */}
        <Sidebar 
          isOpen={sidebarOpen} 
          onLogout={onLogout}
          isMobile={isMobile}
          isTablet={isTablet}
          onClose={() => setSidebarOpen(false)}
        />

        {/* Elegant Overlay for Mobile/Tablet */}
        {!isMobile && sidebarOpen && isTablet && (
          <div 
            className="position-fixed"
            style={{
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              background: 'rgba(0, 0, 0, 0.2)',
              backdropFilter: 'blur(4px)',
              zIndex: 900,
              transition: 'opacity 0.4s ease'
            }}
            onClick={() => setSidebarOpen(false)}
          />
        )}

        {isMobile && sidebarOpen && (
          <div 
            className="position-fixed"
            style={{
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              background: 'rgba(0, 0, 0, 0.3)',
              backdropFilter: 'blur(8px)',
              zIndex: 999,
              animation: 'fadeIn 0.3s ease'
            }}
            onClick={() => setSidebarOpen(false)}
          />
        )}

        {/* Main Content Area */}
        <div
          className="flex-grow-1 d-flex flex-column ultra-transition"
          style={{
            marginLeft: getContentMargin(),
            minHeight: '100vh',
            width: '100%',
            background: '#f5f7fb',
            position: 'relative'
          }}
          onClick={handleContentClick}
        >
          {/* Premium Header with Glass Effect */}
          <Header 
            onToggleSidebar={toggleSidebar} 
            onLogout={onLogout}
            isMobile={isMobile}
            isTablet={isTablet}
            sidebarOpen={sidebarOpen}
          />

          {/* Outlet with Premium Card Effect */}
          <main className="flex-grow-1 p-3 p-md-4 p-lg-5 ultra-scroll" style={{ overflowX: 'hidden' }}>
            <div className="glass-panel rounded-4 p-3 p-md-4 p-lg-5 ultra-transition" style={{ minHeight: '100%' }}>
              <Outlet />
            </div>
          </main>
          
          {/* Subtle Footer */}
          <div className="text-center py-3" style={{ color: 'rgba(0, 107, 107, 0.6)', fontSize: '12px', letterSpacing: '0.5px' }}>
            <span>© 2025 PixelmindSolutions · Enterprise Dashboard</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardLayout;