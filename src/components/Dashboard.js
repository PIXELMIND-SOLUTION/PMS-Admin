// src/components/Dashboard.jsx
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  FaProjectDiagram, 
  FaMobileAlt, 
  FaGlobe, 
  FaBullhorn, 
  FaUsers,
  FaEye,
  FaTrash,
  FaPlus,
  FaClock,
  FaCalendarAlt,
  FaExclamationTriangle
} from 'react-icons/fa';
import { Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const Dashboard = () => {
  const [dashboardData, setDashboardData] = useState({
    counts: {
      totalProjects: 0,
      apps: 0,
      websites: 0,
      marketing: 0,
      staff: 0,
    },
    projects: [],
    loading: true
  });
  
  const [selectedProject, setSelectedProject] = useState(null);
  const [modalLoading, setModalLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const projectsPerPage = 5;

  const navigate = useNavigate();

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setDashboardData(prev => ({ ...prev, loading: true }));

      const [countsRes, projectsRes, staffRes] = await Promise.all([
        fetch('http://31.97.206.144:5000/api/counts'),
        fetch('http://31.97.206.144:5000/api/projects'),
        fetch('http://31.97.206.144:5000/api/get_all_staffs')
      ]);

      const countsData = await countsRes.json();
      const projectsData = await projectsRes.json();
      const staffData = await staffRes.json();

      if (countsData.success && projectsData.success && staffData.success) {
        setDashboardData({
          counts: {
            totalProjects: countsData.totalProjects || 0,
            apps: countsData.categoryCounts?.['mobile app'] || 0,
            websites: countsData.categoryCounts?.['website'] || 0,
            marketing: countsData.categoryCounts?.['digital market'] || 0,
            staff: staffData.count || 0,
          },
          projects: projectsData.data || [],
          loading: false
        });
      }
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      setDashboardData(prev => ({ ...prev, loading: false }));
    }
  };

  // Calculate days remaining for deadline
  const calculateDaysRemaining = (deadlineDate) => {
    if (!deadlineDate) return null;
    const today = new Date();
    const deadline = new Date(deadlineDate);
    const diffTime = deadline - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  // Get projects with deadline warnings
  const getDeadlineProjects = () => {
    return dashboardData.projects
      .filter(project => project.status === 'active' && project.deadlineDate)
      .map(project => ({
        ...project,
        daysRemaining: calculateDaysRemaining(project.deadlineDate)
      }))
      .filter(project => project.daysRemaining !== null)
      .sort((a, b) => a.daysRemaining - b.daysRemaining)
      .slice(0, 5); // Show top 5 closest deadlines
  };

  const deadlineProjects = getDeadlineProjects();

  const handleProjectClick = async (projectId) => {
    setModalLoading(true);
    try {
      const res = await fetch(`http://31.97.206.144:5000/api/projects/${projectId}`);
      const data = await res.json();
      if (data.success) {
        setSelectedProject(data.data);
      }
    } catch (error) {
      console.error('Error fetching project details:', error);
    } finally {
      setModalLoading(false);
    }
  };

  const closeModal = () => {
    setSelectedProject(null);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this project?')) return;
    
    try {
      const res = await fetch(`http://31.97.206.144:5000/api/projects/${id}`, {
        method: 'DELETE'
      });
      const data = await res.json();
      if (data.success) {
        setDashboardData(prev => ({
          ...prev,
          projects: prev.projects.filter(p => p._id !== id)
        }));
      }
    } catch (err) {
      alert('Delete failed');
    }
  };

  // Pagination logic
  const indexOfLastProject = currentPage * projectsPerPage;
  const indexOfFirstProject = indexOfLastProject - projectsPerPage;
  const currentProjects = dashboardData.projects.slice(indexOfFirstProject, indexOfLastProject);
  const totalPages = Math.ceil(dashboardData.projects.length / projectsPerPage);

  const handlePrev = () => currentPage > 1 && setCurrentPage(currentPage - 1);
  const handleNext = () => currentPage < totalPages && setCurrentPage(currentPage + 1);

  // Chart data
  const chartData = {
    labels: ["Projects", "Apps", "Websites", "Marketing", "Staff"],
    datasets: [
      {
        label: "Count",
        data: [
          dashboardData.counts.totalProjects,
          dashboardData.counts.apps,
          dashboardData.counts.websites,
          dashboardData.counts.marketing,
          dashboardData.counts.staff,
        ],
        backgroundColor: [
          "rgba(0, 151, 136, 0.8)",
          "rgba(76, 175, 80, 0.8)",
          "rgba(255, 193, 7, 0.8)",
          "rgba(233, 30, 99, 0.8)",
          "rgba(156, 39, 176, 0.8)",
        ],
        borderRadius: 8,
        hoverBackgroundColor: [
          "rgba(0, 151, 136, 1)",
          "rgba(76, 175, 80, 1)",
          "rgba(255, 193, 7, 1)",
          "rgba(233, 30, 99, 1)",
          "rgba(156, 39, 176, 1)",
        ],
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      title: {
        display: true,
        text: "Dashboard Overview",
        font: { size: 16, weight: "bold" },
        color: "#333",
        padding: { top: 10, bottom: 20 },
      },
      tooltip: {
        backgroundColor: "rgba(0,0,0,0.8)",
        titleColor: "#fff",
        bodyColor: "#fff",
        borderColor: "#fff",
        borderWidth: 1,
      },
    },
    scales: {
      x: {
        ticks: {
          color: "#555",
          font: { size: 11 },
        },
        grid: { display: false },
      },
      y: {
        beginAtZero: true,
        ticks: {
          color: "#555",
          stepSize: 1,
        },
        grid: {
          color: "rgba(0,0,0,0.05)",
        },
      },
    },
  };

  const stats = [
    { 
      number: dashboardData.counts.totalProjects, 
      label: 'Projects', 
      icon: <FaProjectDiagram className="text-2xl" />, 
      color: 'from-blue-500 to-blue-600',
      bgColor: 'bg-blue-500'
    },
    { 
      number: dashboardData.counts.apps, 
      label: 'Apps', 
      icon: <FaMobileAlt className="text-2xl" />, 
      color: 'from-green-500 to-green-600',
      bgColor: 'bg-green-500'
    },
    { 
      number: dashboardData.counts.websites, 
      label: 'Websites', 
      icon: <FaGlobe className="text-2xl" />, 
      color: 'from-yellow-500 to-yellow-600',
      bgColor: 'bg-yellow-500'
    },
    { 
      number: dashboardData.counts.marketing, 
      label: 'Marketing', 
      icon: <FaBullhorn className="text-2xl" />, 
      color: 'from-red-500 to-red-600',
      bgColor: 'bg-red-500'
    },
    { 
      number: dashboardData.counts.staff, 
      label: 'Staff', 
      icon: <FaUsers className="text-2xl" />, 
      color: 'from-purple-500 to-purple-600',
      bgColor: 'bg-purple-500'
    },
  ];

  const formatDate = (dateString) => {
    if (!dateString) return '—';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const getDeadlineColor = (days) => {
    if (days < 0) return 'text-danger';
    if (days <= 7) return 'text-warning';
    if (days <= 30) return 'text-info';
    return 'text-success';
  };

  const getDeadlineBadge = (days) => {
    if (days < 0) return 'bg-danger';
    if (days <= 7) return 'bg-warning';
    if (days <= 30) return 'bg-info';
    return 'bg-success';
  };

  const getDeadlineText = (days) => {
    if (days < 0) return `${Math.abs(days)} days overdue`;
    if (days === 0) return 'Due today';
    if (days === 1) return 'Due tomorrow';
    return `${days} days left`;
  };

  return (
    <div className="container-fluid py-4 animate-fade-in">
      {/* Welcome Card with Stats */}
      <div className="row mb-4">
        <div className="col-12">
          <div className="bg-gradient-to-br from-teal-600 to-teal-700 rounded-2xl shadow-xl overflow-hidden text-white animate-slide-down">
            <div className="p-6 md:p-8 text-center">
              <h4 className="text-xl md:text-2xl font-semibold mb-5 animate-pulse">Welcome Back!</h4>

              {/* Avatar with animation */}
              <div className="flex justify-center mb-5">
                <div className="w-24 h-24 md:w-28 md:h-28 rounded-full bg-white flex items-center justify-center shadow-lg animate-bounce-slow">
                  <span className="text-4xl md:text-5xl">👤</span>
                </div>
              </div>

              <h5 className="text-xl md:text-2xl font-medium mb-7 animate-fade-in">Ganapathi Varma</h5>

              {/* Stats Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
                {dashboardData.loading ? (
                  <div className="col-span-5 text-center py-4">
                    <div className="inline-block h-6 w-6 animate-spin rounded-full border-4 border-white border-t-transparent"></div>
                  </div>
                ) : (
                  stats.map((stat, index) => (
                    <div
                      key={index}
                      className={`bg-gradient-to-br ${stat.color} flex flex-col items-center justify-center p-4 rounded-xl transition-all duration-300 hover:scale-105 hover:shadow-lg animate-stagger cursor-pointer`}
                      style={{ animationDelay: `${index * 100}ms` }}
                      onClick={() => navigate('/projects')}
                    >
                      <div className="mb-2 text-white animate-bounce">{stat.icon}</div>
                      <div className="text-2xl md:text-3xl font-bold drop-shadow-lg">{stat.number}</div>
                      <div className="text-sm md:text-base mt-1 opacity-90 font-medium">{stat.label}</div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="row">
        {/* Left Column - Projects Table & Deadlines */}
        <div className="col-lg-8">
          {/* Projects Table */}
          <div className="card border-0 shadow-sm mb-4 animate-slide-up">
            <div className="card-body p-0">
              {/* Header */}
              <div className="d-flex justify-content-between align-items-center p-4 pb-3 border-bottom">
                <h4 className="mb-0 fw-bold text-teal">
                  <FaProjectDiagram className="me-2" />
                  Latest Projects
                </h4>
                <button
                  className="btn text-white px-4 d-flex align-items-center gap-2 animate-pulse-hover"
                  style={{ backgroundColor: "#009788" }}
                  onClick={() => navigate("/add-project")}
                >
                  <FaPlus size={14} />
                  New Project
                </button>
              </div>

              {/* Table */}
              <div className="table-responsive">
                <table className="table table-hover mb-0 align-middle">
                  <thead style={{ backgroundColor: "#f8f9fa" }}>
                    <tr>
                      <th className="py-3 px-4 border-0">S.No</th>
                      <th className="py-3 px-4 border-0">Project ID</th>
                      <th className="py-3 px-4 border-0">Project Name</th>
                      <th className="py-3 px-4 border-0">Client</th>
                      <th className="py-3 px-4 border-0">Status</th>
                      <th className="py-3 px-4 border-0 text-center">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {dashboardData.loading ? (
                      <tr>
                        <td colSpan="6" className="text-center py-4 text-muted">
                          <div className="spinner-border spinner-border-sm text-teal me-2"></div>
                          Loading projects...
                        </td>
                      </tr>
                    ) : currentProjects.length === 0 ? (
                      <tr>
                        <td colSpan="6" className="text-center py-4 text-muted">
                          <FaProjectDiagram className="me-2" />
                          No projects found
                        </td>
                      </tr>
                    ) : (
                      currentProjects.map((project, index) => (
                        <tr
                          key={project._id}
                          className="animate-fade-in hover-lift"
                          style={{ animationDelay: `${index * 50}ms` }}
                        >
                          <td className="py-3 px-4 fw-medium">{indexOfFirstProject + index + 1}</td>
                          <td className="py-3 px-4">
                            <span className="badge bg-light text-dark border">
                              {project.projectid}
                            </span>
                          </td>
                          <td className="py-3 px-4 fw-medium text-teal">{project.projectname}</td>
                          <td className="py-3 px-4">{project.clientname}</td>
                          <td className="py-3 px-4">
                            <span className={`badge ${getDeadlineBadge(calculateDaysRemaining(project.deadlineDate) || 100)} text-capitalize animate-pulse`}>
                              {project.status}
                            </span>
                          </td>
                          <td className="py-3 px-4 text-center">
                            <div className="d-flex justify-content-center gap-3">
                              <FaEye
                                className="text-primary hover-scale cursor-pointer"
                                style={{ fontSize: "18px" }}
                                title="View Details"
                                onClick={() => handleProjectClick(project._id)}
                              />
                              <FaTrash
                                className="text-danger hover-scale cursor-pointer"
                                style={{ fontSize: "18px" }}
                                title="Delete Project"
                                onClick={() => handleDelete(project._id)}
                              />
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              {!dashboardData.loading && dashboardData.projects.length > 0 && (
                <div className="d-flex justify-content-between align-items-center p-3 border-top">
                  <small className="text-muted">
                    Showing {indexOfFirstProject + 1} to {Math.min(indexOfLastProject, dashboardData.projects.length)} of {dashboardData.projects.length} entries
                  </small>
                  <div className="d-flex gap-2">
                    <button
                      className="btn btn-outline-teal btn-sm"
                      onClick={handlePrev}
                      disabled={currentPage === 1}
                    >
                      Prev
                    </button>
                    <span className="px-3 py-1 bg-teal text-white rounded fw-medium">
                      {currentPage} / {totalPages}
                    </span>
                    <button
                      className="btn btn-outline-teal btn-sm"
                      onClick={handleNext}
                      disabled={currentPage === totalPages}
                    >
                      Next
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Deadline Countdown Section */}
          <div className="card border-0 shadow-sm animate-slide-up" style={{ animationDelay: '200ms' }}>
            <div className="card-body">
              <div className="d-flex justify-content-between align-items-center mb-4">
                <h5 className="mb-0 fw-bold text-teal">
                  <FaClock className="me-2" />
                  Upcoming Deadlines
                </h5>
                <span className="badge bg-teal">
                  {deadlineProjects.length} Active
                </span>
              </div>

              {deadlineProjects.length === 0 ? (
                <div className="text-center py-4 text-muted">
                  <FaCalendarAlt className="display-4 mb-3 text-teal" />
                  <p>No upcoming deadlines</p>
                </div>
              ) : (
                <div className="row g-3">
                  {deadlineProjects.map((project, index) => (
                    <div key={project._id} className="col-12 animate-stagger" style={{ animationDelay: `${index * 100}ms` }}>
                      <div className={`card border-0 shadow-sm hover-lift ${project.daysRemaining <= 7 ? 'border-warning' : ''}`}>
                        <div className="card-body py-3">
                          <div className="row align-items-center">
                            <div className="col-md-6">
                              <h6 className="fw-bold mb-1 text-truncate">{project.projectname}</h6>
                              <small className="text-muted">Client: {project.clientname}</small>
                            </div>
                            <div className="col-md-4">
                              <div className="text-end text-md-start">
                                <small className="text-muted">Deadline</small>
                                <div className="fw-medium">{formatDate(project.deadlineDate)}</div>
                              </div>
                            </div>
                            <div className="col-md-2">
                              <div className="text-end">
                                <span className={`badge ${getDeadlineBadge(project.daysRemaining)} animate-pulse`}>
                                  {getDeadlineText(project.daysRemaining)}
                                </span>
                              </div>
                            </div>
                          </div>
                          {project.daysRemaining <= 3 && (
                            <div className="mt-2 p-2 bg-warning bg-opacity-10 rounded text-center">
                              <FaExclamationTriangle className="text-warning me-1" />
                              <small className="text-warning fw-medium">Urgent: Deadline approaching!</small>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right Column - Chart */}
        <div className="col-lg-4">
          <div className="card border-0 shadow-sm h-100 animate-slide-up" style={{ animationDelay: '100ms' }}>
            <div className="card-body p-4">
              <h5 className="fw-semibold mb-4 text-center text-teal">
                📊 Dashboard Overview
              </h5>

              {dashboardData.loading ? (
                <div
                  className="text-center text-muted d-flex align-items-center justify-content-center"
                  style={{ height: "250px" }}
                >
                  <div className="spinner-border text-teal" role="status"></div>
                </div>
              ) : (
                <div
                  style={{
                    position: "relative",
                    width: "100%",
                    height: "300px",
                  }}
                >
                  <Bar data={chartData} options={chartOptions} />
                </div>
              )}

              {/* Quick Stats */}
              <div className="mt-4 pt-3 border-top">
                <div className="row text-center">
                  <div className="col-6">
                    <div className="fw-bold text-teal">{dashboardData.counts.totalProjects}</div>
                    <small className="text-muted">Total Projects</small>
                  </div>
                  <div className="col-6">
                    <div className="fw-bold text-teal">{deadlineProjects.length}</div>
                    <small className="text-muted">Upcoming Deadlines</small>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Project Details Modal */}
      {selectedProject && (
        <div
          className="modal fade show d-block animate-fade-in"
          tabIndex="-1"
          style={{ backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 1050 }}
          onClick={closeModal}
        >
          <div
            className="modal-dialog modal-lg modal-dialog-centered animate-scale-in"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="modal-content border-0 shadow-lg">
              <div className="modal-header text-white border-0" style={{ backgroundColor: '#009788' }}>
                <h5 className="modal-title fw-bold">
                  <FaProjectDiagram className="me-2" />
                  Project Details
                </h5>
                <button
                  type="button"
                  className="btn-close btn-close-white"
                  onClick={closeModal}
                ></button>
              </div>
              <div className="modal-body">
                {modalLoading ? (
                  <div className="text-center py-4">
                    <div className="spinner-border text-teal" role="status"></div>
                    <p className="mt-2">Loading project details...</p>
                  </div>
                ) : (
                  <ProjectDetailsModalContent project={selectedProject} formatDate={formatDate} />
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Custom CSS for animations */}
      <style jsx>{`
        .animate-fade-in {
          animation: fadeIn 0.6s ease-in-out;
        }
        
        .animate-slide-down {
          animation: slideDown 0.8s ease-out;
        }
        
        .animate-slide-up {
          animation: slideUp 0.6s ease-out;
        }
        
        .animate-scale-in {
          animation: scaleIn 0.3s ease-out;
        }
        
        .animate-stagger {
          animation: stagger 0.5s ease-out;
        }
        
        .animate-bounce-slow {
          animation: bounceSlow 2s infinite;
        }
        
        .animate-pulse-hover:hover {
          animation: pulse 1s infinite;
        }
        
        .hover-scale {
          transition: transform 0.2s ease-in-out;
        }
        
        .hover-scale:hover {
          transform: scale(1.2);
        }
        
        .hover-lift {
          transition: all 0.3s ease;
        }
        
        .hover-lift:hover {
          transform: translateY(-2px);
          box-shadow: 0 4px 15px rgba(0,0,0,0.1);
        }

        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }

        @keyframes slideDown {
          from { 
            opacity: 0;
            transform: translateY(-30px);
          }
          to { 
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes slideUp {
          from { 
            opacity: 0;
            transform: translateY(30px);
          }
          to { 
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes scaleIn {
          from { 
            opacity: 0;
            transform: scale(0.9);
          }
          to { 
            opacity: 1;
            transform: scale(1);
          }
        }

        @keyframes stagger {
          from { 
            opacity: 0;
            transform: translateX(-20px);
          }
          to { 
            opacity: 1;
            transform: translateX(0);
          }
        }

        @keyframes bounceSlow {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-10px); }
        }

        @keyframes pulse {
          0% { transform: scale(1); }
          50% { transform: scale(1.05); }
          100% { transform: scale(1); }
        }
      `}</style>
    </div>
  );
};

// Project Details Modal Content Component
const ProjectDetailsModalContent = ({ project, formatDate }) => (
  <div className="row">
    {/* Basic Information */}
    <div className="col-md-6">
      <h6 className="fw-bold text-teal mb-3">📋 Basic Information</h6>
      <DetailRow label="Project ID" value={project.projectid} />
      <DetailRow label="Project Name" value={project.projectname} />
      <DetailRow label="Category" value={
        <span className="badge bg-teal bg-opacity-10 text-teal">
          {project.selectcategory}
        </span>
      } />
      <DetailRow label="Status" value={
        <span className={`badge ${
          project.status === 'active' ? 'bg-success' :
          project.status === 'completed' ? 'bg-primary' :
          project.status === 'on hold' ? 'bg-warning' : 'bg-secondary'
        }`}>
          {project.status}
        </span>
      } />
    </div>
    
    {/* Client Information */}
    <div className="col-md-6">
      <h6 className="fw-bold text-teal mb-3">👤 Client Information</h6>
      <DetailRow label="Client Name" value={project.clientname} />
      <DetailRow label="Mobile" value={project.mobilenumber} />
      <DetailRow label="Email" value={project.email} />
    </div>

    {/* Timeline */}
    <div className="col-12 mt-3">
      <hr />
      <h6 className="fw-bold text-teal mb-3">📅 Project Timeline</h6>
      <div className="row">
        <div className="col-md-4">
          <DetailRow label="Start Date" value={formatDate(project.startDate)} />
        </div>
        <div className="col-md-4">
          <DetailRow label="Handover Date" value={formatDate(project.projectHandoverDate)} />
        </div>
        <div className="col-md-4">
          <DetailRow label="Deadline" value={formatDate(project.deadlineDate)} />
        </div>
      </div>
    </div>

    {/* Financial Information */}
    <div className="col-12 mt-3">
      <hr />
      <h6 className="fw-bold text-teal mb-3">💰 Financial Information</h6>
      <div className="row">
        <div className="col-md-6">
          <DetailRow label="Project Cost" value={`₹${project.projectCost?.toLocaleString() || '0'}`} />
        </div>
        <div className="col-md-6">
          <DetailRow label="Milestones" value={project.milestone || '0'} />
        </div>
      </div>
    </div>

    {/* Team Members */}
    {project.teamMembers && Object.keys(project.teamMembers).length > 0 && (
      <div className="col-12 mt-3">
        <hr />
        <h6 className="fw-bold text-teal mb-3">👥 Team Members</h6>
        <div className="row">
          {Object.entries(project.teamMembers).map(([role, members]) => (
            members.length > 0 && (
              <div key={role} className="col-md-6 mb-2">
                <DetailRow 
                  label={role.charAt(0).toUpperCase() + role.slice(1)} 
                  value={
                    <div className="d-flex flex-wrap gap-1">
                      {members.map((member, idx) => (
                        <span key={idx} className="badge bg-light text-dark border small">
                          {member}
                        </span>
                      ))}
                    </div>
                  } 
                />
              </div>
            )
          ))}
        </div>
      </div>
    )}

    {/* Files */}
    {(project.uploadfile || project.quotationfile) && (
      <div className="col-12 mt-3">
        <hr />
        <h6 className="fw-bold text-teal mb-3">📎 Attached Files</h6>
        <div className="row">
          {project.uploadfile && (
            <div className="col-md-6 mb-2">
              <a 
                href={project.uploadfile} 
                target="_blank" 
                rel="noopener noreferrer"
                className="btn btn-sm btn-outline-primary d-flex align-items-center gap-2 w-100"
              >
                <i className="fas fa-file-image"></i>
                Project File
              </a>
            </div>
          )}
          {project.quotationfile && (
            <div className="col-md-6 mb-2">
              <a 
                href={project.quotationfile} 
                target="_blank" 
                rel="noopener noreferrer"
                className="btn btn-sm btn-outline-success d-flex align-items-center gap-2 w-100"
              >
                <i className="fas fa-file-pdf"></i>
                Quotation File
              </a>
            </div>
          )}
        </div>
      </div>
    )}
  </div>
);

// Helper Component for Detail Rows
const DetailRow = ({ label, value }) => (
  <div className="mb-2">
    <span className="fw-semibold text-muted small">{label}: </span>
    <span className="ms-2">{value || '—'}</span>
  </div>
);

export default Dashboard;