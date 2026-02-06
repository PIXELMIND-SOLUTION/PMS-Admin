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
  const projectsPerPage = 4;

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
    <div className="min-h-screen bg-gradient-to-br from-slate-100 via-cyan-50 to-slate-200 py-6 px-4 animate-fade-in">
      <style>{`
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
        @keyframes slideDown { from { opacity: 0; transform: translateY(-30px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes slideUp { from { opacity: 0; transform: translateY(30px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes scaleIn { from { opacity: 0; transform: scale(0.95); } to { opacity: 1; transform: scale(1); } }
        @keyframes stagger { from { opacity: 0; transform: translateX(-20px); } to { opacity: 1; transform: translateX(0); } }
        @keyframes bounceSlow { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-12px); } }

        .animate-fade-in { animation: fadeIn 0.8s ease-in-out; }
        .animate-slide-down { animation: slideDown 0.8s cubic-bezier(0.34, 1.56, 0.64, 1); }
        .animate-slide-up { animation: slideUp 0.8s cubic-bezier(0.34, 1.56, 0.64, 1); }
        .animate-scale-in { animation: scaleIn 0.4s ease-out; }
        .animate-stagger { animation: stagger 0.6s ease-out; }
        .animate-bounce-slow { animation: bounceSlow 2.5s ease-in-out infinite; }
        .hover-lift { transition: all 0.3s ease; }
        .hover-lift:hover { transform: translateY(-2px); box-shadow: 0 10px 25px rgba(0,0,0,0.1); }
      `}</style>

      <div className="max-w-7xl mx-auto">
        {/* Welcome Card with Stats */}
        <div className="mb-8 animate-slide-down">
          <div className="bg-gradient-to-br from-teal-600 to-teal-700 rounded-3xl shadow-2xl overflow-hidden text-white">
            <div className="p-8 md:p-12 text-center">
              <h4 className="text-2xl md:text-3xl font-bold mb-6 tracking-wide">Welcome Back! 👋</h4>

              {/* Avatar */}
              <div className="flex justify-center mb-6">
                <div className="w-28 h-28 rounded-full bg-white/20 flex items-center justify-center shadow-lg border-4 border-white/30 animate-bounce-slow">
                  <span className="text-5xl">👤</span>
                </div>
              </div>

              <h5 className="text-3xl font-bold mb-8 drop-shadow-lg">Ganapathi Varma</h5>

              {/* Stats Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
                {dashboardData.loading ? (
                  <div className="col-span-full text-center py-4">
                    <div className="inline-block w-8 h-8 border-4 border-white/30 border-t-white rounded-full animate-spin"></div>
                  </div>
                ) : (
                  stats.map((stat, index) => (
                    <div
                      key={index}
                      className={`bg-gradient-to-br ${stat.color} flex flex-col items-center justify-center p-6 rounded-2xl transition-all duration-300 hover:scale-110 hover:shadow-2xl cursor-pointer animate-stagger`}
                      style={{ animationDelay: `${index * 60}ms` }}
                      onClick={() => navigate('/projects')}
                    >
                      <div className="mb-3 text-white text-3xl animate-bounce">{stat.icon}</div>
                      <div className="text-4xl font-bold drop-shadow-lg mb-2">{stat.number}</div>
                      <div className="text-sm font-semibold opacity-95">{stat.label}</div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Projects Table */}
          <div className="lg:col-span-2 animate-slide-up">
            <div className="bg-white/95 backdrop-blur rounded-2xl shadow-lg overflow-hidden">
              {/* Header */}
              <div className="flex justify-between items-center p-6 border-b border-gray-200">
                <h4 className="text-xl font-bold text-teal-600 flex items-center gap-2">
                  <FaProjectDiagram />
                  Latest Projects
                </h4>
                <button
                  className="bg-gradient-to-br from-teal-600 to-teal-700 text-white px-6 py-3 rounded-lg font-semibold flex items-center gap-2 hover:shadow-lg hover:from-teal-700 hover:to-teal-800 transition-all duration-300"
                  onClick={() => navigate("/add-project")}
                >
                  <FaPlus size={14} />
                  New Project
                </button>
              </div>

              {/* Table */}
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gradient-to-r from-gray-50 to-transparent border-b-2 border-gray-200">
                    <tr>
                      <th className="py-4 px-6 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">S.No</th>
                      <th className="py-4 px-6 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Project ID</th>
                      <th className="py-4 px-6 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Project Name</th>
                      <th className="py-4 px-6 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Client</th>
                      <th className="py-4 px-6 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Status</th>
                      <th className="py-4 px-6 text-center text-xs font-bold text-gray-700 uppercase tracking-wider">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {dashboardData.loading ? (
                      <tr>
                        <td colSpan="6" className="text-center py-8 text-gray-400">
                          <div className="inline-block animate-spin">⏳</div>
                          <div className="mt-2 text-sm">Loading projects...</div>
                        </td>
                      </tr>
                    ) : currentProjects.length === 0 ? (
                      <tr>
                        <td colSpan="6" className="text-center py-8 text-gray-400">
                          <FaProjectDiagram className="inline-block text-3xl mb-2" />
                          <div className="text-sm">No projects found</div>
                        </td>
                      </tr>
                    ) : (
                      currentProjects.map((project, index) => (
                        <tr
                          key={project._id}
                          className="border-b border-gray-100 hover:bg-teal-50/30 transition-all duration-300 animate-stagger hover-lift"
                          style={{ animationDelay: `${index * 50}ms` }}
                        >
                          <td className="py-4 px-6 font-semibold text-gray-700">{indexOfFirstProject + index + 1}</td>
                          <td className="py-4 px-6">
                            <span className="inline-block bg-gradient-to-br from-teal-100 to-teal-50 text-teal-700 px-3 py-1 rounded-full text-xs font-bold border border-teal-200">
                              {project.projectid}
                            </span>
                          </td>
                          <td className="py-4 px-6 font-semibold text-teal-600">{project.projectname}</td>
                          <td className="py-4 px-6 text-gray-700">{project.clientname}</td>
                          <td className="py-4 px-6">
                            <span className={`inline-block px-3 py-1 rounded-full text-xs font-bold text-white ${calculateDaysRemaining(project.deadlineDate) === null || calculateDaysRemaining(project.deadlineDate) > 30
                                ? 'bg-gradient-to-br from-green-500 to-green-600'
                                : calculateDaysRemaining(project.deadlineDate) > 7
                                  ? 'bg-gradient-to-br from-blue-500 to-blue-600'
                                  : calculateDaysRemaining(project.deadlineDate) > 0
                                    ? 'bg-gradient-to-br from-yellow-500 to-yellow-600'
                                    : 'bg-gradient-to-br from-red-500 to-red-600'
                              }`}>
                              {project.status}
                            </span>
                          </td>
                          <td className="py-4 px-6 text-center">
                            <div className="flex justify-center gap-3">
                              <button
                                className="text-teal-600 hover:text-teal-700 hover:scale-125 transition-all duration-300 p-2"
                                title="View Details"
                                onClick={() => handleProjectClick(project._id)}
                              >
                                <FaEye size={16} />
                              </button>
                              <button
                                className="text-red-600 hover:text-red-700 hover:scale-125 transition-all duration-300 p-2"
                                title="Delete Project"
                                onClick={() => handleDelete(project._id)}
                              >
                                <FaTrash size={16} />
                              </button>
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
                <div className="flex justify-between items-center p-6 border-t border-gray-200 flex-wrap gap-3">
                  <small className="text-gray-600">
                    Showing {indexOfFirstProject + 1} to {Math.min(indexOfLastProject, dashboardData.projects.length)} of {dashboardData.projects.length} entries
                  </small>
                  <div className="flex gap-2 items-center">
                    <button
                      className="border-2 border-teal-600 text-teal-600 px-4 py-2 rounded-lg font-semibold hover:bg-teal-600 hover:text-white transition-all duration-300 text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                      onClick={handlePrev}
                      disabled={currentPage === 1}
                    >
                      Prev
                    </button>
                    <span className="px-4 py-2 bg-gradient-to-r from-teal-600 to-teal-700 text-white rounded-lg font-bold text-sm">
                      {currentPage} / {totalPages}
                    </span>
                    <button
                      className="border-2 border-teal-600 text-teal-600 px-4 py-2 rounded-lg font-semibold hover:bg-teal-600 hover:text-white transition-all duration-300 text-sm disabled:opacity-50 disabled:cursor-not-allowed"
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

          {/* Right Column - Chart */}
          <div className="animate-slide-up" style={{ animationDelay: '100ms' }}>
            <div className="bg-white/95 backdrop-blur rounded-2xl shadow-lg overflow-hidden h-full">
              <div className="p-6">
                <h5 className="text-lg font-bold text-gray-800 text-center mb-4">📊 Overview</h5>

                {dashboardData.loading ? (
                  <div className="flex items-center justify-center h-80 text-gray-400">
                    <div className="animate-spin text-2xl">⏳</div>
                  </div>
                ) : (
                  <div className="h-80 relative">
                    <Bar data={chartData} options={chartOptions} />
                  </div>
                )}

                {/* Quick Stats */}
                <div className="mt-6 pt-4 border-t border-gray-200">
                  <div className="grid grid-cols-2 gap-4 text-center">
                    <div>
                      <div className="text-4xl font-bold text-teal-600 mb-1">
                        {dashboardData.counts.totalProjects}
                      </div>
                      <small className="text-gray-600 text-xs">Total Projects</small>
                    </div>
                    <div>
                      <div className="text-4xl font-bold text-teal-600 mb-1">
                        {deadlineProjects.length}
                      </div>
                      <small className="text-gray-600 text-xs">Upcoming Deadlines</small>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Deadline Section */}
        <div className="mt-8 animate-slide-up" style={{ animationDelay: '200ms' }}>
          <div className="bg-white/95 backdrop-blur rounded-2xl shadow-lg overflow-hidden">
            <div className="border-b border-gray-200 p-6">
              <div className="flex justify-between items-center gap-3 flex-wrap">
                <h5 className="text-xl font-bold text-gray-800">⏰ Upcoming Deadlines</h5>
                <span className="inline-block bg-gradient-to-br from-teal-600 to-teal-700 text-white px-4 py-2 rounded-full text-sm font-bold shadow-lg">
                  {deadlineProjects.length} Active
                </span>
              </div>
            </div>

            <div className="p-6">
              {deadlineProjects.length === 0 ? (
                <div className="text-center py-12 text-gray-400">
                  <FaCalendarAlt className="text-6xl mb-4 text-teal-600 mx-auto" />
                  <p className="text-sm">No upcoming deadlines</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {deadlineProjects.map((project, index) => (
                    <div key={project._id} className="bg-white border-l-4 border-teal-600 rounded-xl p-4 shadow-md hover:shadow-lg transition-all duration-300 hover:translate-x-1 animate-stagger" style={{ animationDelay: `${index * 100}ms` }}>
                      <h6 className="font-bold mb-2 text-gray-800 text-sm truncate">
                        {project.projectname}
                      </h6>
                      <small className="block text-gray-600 mb-3 text-xs">
                        Client: {project.clientname}
                      </small>
                      <div className="flex justify-between items-center gap-2 mb-3">
                        <div>
                          <small className="text-gray-600 block text-xs">Deadline</small>
                          <strong className="text-gray-800 text-sm">{formatDate(project.deadlineDate)}</strong>
                        </div>
                        <span className={`px-3 py-1 rounded-full text-xs font-bold text-white ${project.daysRemaining < 0
                            ? 'bg-gradient-to-br from-red-500 to-red-600'
                            : project.daysRemaining <= 7
                              ? 'bg-gradient-to-br from-yellow-500 to-yellow-600'
                              : project.daysRemaining <= 30
                                ? 'bg-gradient-to-br from-blue-500 to-blue-600'
                                : 'bg-gradient-to-br from-green-500 to-green-600'
                          }`}>
                          {getDeadlineText(project.daysRemaining)}
                        </span>
                      </div>
                      {project.daysRemaining <= 3 && (
                        <div className="mt-3 p-2 bg-gradient-to-r from-yellow-100 to-orange-100 rounded-lg text-center text-orange-700 text-xs font-bold flex items-center justify-center gap-1">
                          <FaExclamationTriangle size={10} />
                          Urgent: Deadline approaching!
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Project Details Modal */}
      {selectedProject && (
        <div
          className="animate-fade-in fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
          onClick={closeModal}
        >
          <div
            className="bg-white/95 backdrop-blur rounded-2xl shadow-2xl w-full max-w-2xl max-h-screen overflow-y-auto animate-scale-in"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="bg-gradient-to-br from-teal-600 to-teal-700 text-white p-6 flex justify-between items-center sticky top-0 z-10">
              <h5 className="text-lg font-bold flex items-center gap-3">
                <FaProjectDiagram />
                Project Details
              </h5>
              <button
                onClick={closeModal}
                className="w-10 h-10 rounded-full bg-white/20 hover:bg-white/30 text-white flex items-center justify-center transition-all duration-300 text-xl font-bold"
              >
                ✕
              </button>
            </div>
            <div className="p-6">
              {modalLoading ? (
                <div className="text-center py-16">
                  <div className="inline-block animate-spin text-2xl">⏳</div>
                  <p className="mt-3 text-gray-600">Loading project details...</p>
                </div>
              ) : (
                <ProjectDetailsModalContent project={selectedProject} formatDate={formatDate} />
              )}
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
  <div className="space-y-6">
    {/* Basic Information & Client Information */}
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {/* Basic Information */}
      <div className="">
        <h6 className="text-lg font-bold text-teal-600 mb-4 flex items-center gap-2">
          📋 Basic Information
        </h6>
        <div className="space-y-3">
          <DetailRow label="Project ID" value={project.projectid} />
          <DetailRow label="Project Name" value={project.projectname} />
          <DetailRow label="Category" value={
            <span className="inline-block bg-teal-100 text-teal-700 px-3 py-1 rounded-full text-xs font-bold border border-teal-200">
              {project.selectcategory}
            </span>
          } />
          <DetailRow label="Status" value={
            <span className={`inline-block px-3 py-1 rounded-full text-xs font-bold text-white ${project.status === 'active' ? 'bg-gradient-to-br from-green-500 to-green-600' :
                project.status === 'completed' ? 'bg-gradient-to-br from-blue-500 to-blue-600' :
                  project.status === 'on hold' ? 'bg-gradient-to-br from-yellow-500 to-yellow-600' : 'bg-gray-500'
              }`}>
              {project.status}
            </span>
          } />
        </div>
      </div>

      {/* Client Information */}
      <div className="">
        <h6 className="text-lg font-bold text-teal-600 mb-4 flex items-center gap-2">
          👤 Client Information
        </h6>
        <div className="space-y-3">
          <DetailRow label="Client Name" value={project.clientname} />
          <DetailRow label="Mobile" value={project.mobilenumber} />
          <DetailRow label="Email" value={project.email} />
        </div>
      </div>
    </div>

    {/* Timeline */}
    <div className="pt-4 border-t border-gray-200">
      <h6 className="text-lg font-bold text-teal-600 mb-4 flex items-center gap-2">
        📅 Project Timeline
      </h6>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <DetailRow label="Start Date" value={formatDate(project.startDate)} />
        <DetailRow label="Handover Date" value={formatDate(project.projectHandoverDate)} />
        <DetailRow label="Deadline" value={formatDate(project.deadlineDate)} />
      </div>
    </div>

    {/* Financial Information */}
    <div className="pt-4 border-t border-gray-200">
      <h6 className="text-lg font-bold text-teal-600 mb-4 flex items-center gap-2">
        💰 Financial Information
      </h6>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <DetailRow label="Project Cost" value={`₹${project.projectCost?.toLocaleString() || '0'}`} />
        <DetailRow label="Milestones" value={project.milestone || '0'} />
      </div>
    </div>

    {/* Team Members */}
    {project.teamMembers && Object.keys(project.teamMembers).length > 0 && (
      <div className="pt-4 border-t border-gray-200">
        <h6 className="text-lg font-bold text-teal-600 mb-4 flex items-center gap-2">
          👥 Team Members
        </h6>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {Object.entries(project.teamMembers).map(([role, members]) => (
            members.length > 0 && (
              <div key={role}>
                <DetailRow
                  label={role.charAt(0).toUpperCase() + role.slice(1)}
                  value={
                    <div className="flex flex-wrap gap-2">
                      {members.map((member, idx) => (
                        <span key={idx} className="inline-block bg-gray-200 text-gray-700 px-3 py-1 rounded text-xs font-semibold border border-gray-300">
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
      <div className="pt-4 border-t border-gray-200">
        <h6 className="text-lg font-bold text-teal-600 mb-4 flex items-center gap-2">
          📎 Attached Files
        </h6>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {project.uploadfile && (
            <a
              href={project.uploadfile}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2 px-4 py-3 border-2 border-blue-500 text-blue-600 rounded-lg font-semibold hover:bg-blue-50 transition-all duration-300 text-sm"
            >
              <i className="fas fa-file-image"></i>
              Project File
            </a>
          )}
          {project.quotationfile && (
            <a
              href={project.quotationfile}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2 px-4 py-3 border-2 border-green-500 text-green-600 rounded-lg font-semibold hover:bg-green-50 transition-all duration-300 text-sm"
            >
              <i className="fas fa-file-pdf"></i>
              Quotation File
            </a>
          )}
        </div>
      </div>
    )}
  </div>
);

// Helper Component for Detail Rows
const DetailRow = ({ label, value }) => (
  <div className="flex flex-col sm:flex-row sm:items-start gap-2">
    <span className="font-semibold text-gray-600 text-sm min-w-fit">{label}: </span>
    <span className="text-gray-800 text-sm font-medium">{value || '—'}</span>
  </div>
);

export default Dashboard;