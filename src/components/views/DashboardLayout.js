import React, { useState, useEffect } from "react";
import { Outlet, Navigate } from "react-router-dom";
import Sidebar from "./Sidebar";
import Header from "./Header";

const DashboardLayout = ({ isLoggedIn, onLogout }) => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [isMobile, setIsMobile] = useState(false);

  // Check if device is mobile
  useEffect(() => {
    const checkDevice = () => {
      setIsMobile(window.innerWidth < 768);
      if (window.innerWidth < 768) {
        setSidebarOpen(false);
      }
    };

    checkDevice();
    window.addEventListener('resize', checkDevice);
    
    return () => window.removeEventListener('resize', checkDevice);
  }, []);

  const toggleSidebar = () => {
    setSidebarOpen((prev) => !prev);
  };

  // Close sidebar when clicking on mobile
  const handleContentClick = () => {
    if (isMobile && sidebarOpen) {
      setSidebarOpen(false);
    }
  };

  // Redirect if not logged in
  if (!isLoggedIn) {
    return <Navigate to="/" replace />;
  }

  return (
    <div className="d-flex position-relative">
      {/* Sidebar */}
      <Sidebar 
        isOpen={sidebarOpen} 
        onLogout={onLogout}
        isMobile={isMobile}
        onClose={() => setSidebarOpen(false)}
      />

      {/* Mobile Overlay */}
      {isMobile && sidebarOpen && (
        <div 
          className="position-fixed w-100 h-100"
          style={{
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            zIndex: 999,
            top: 0,
            left: 0
          }}
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Main Content */}
      <div
        className="flex-grow-1 d-flex flex-column"
        style={{
          marginLeft: !isMobile && sidebarOpen ? "260px" : "0",
          transition: "margin-left 0.3s ease",
          minHeight: "100vh",
          width: isMobile ? "100%" : "auto"
        }}
        onClick={handleContentClick}
      >
        {/* Header */}
        <Header 
          onToggleSidebar={toggleSidebar} 
          onLogout={onLogout}
          isMobile={isMobile}
        />

        {/* Outlet Content */}
        <main className="flex-grow-1 p-2 p-md-3">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;