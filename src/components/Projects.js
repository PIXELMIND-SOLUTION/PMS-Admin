import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { MdEdit, MdDelete, MdVisibility, MdDownload, MdCloudUpload } from 'react-icons/md';
import { FaUsers, FaCalendarAlt, FaRupeeSign, FaMobileAlt, FaEnvelope, FaSearch, FaFilter, FaSync } from 'react-icons/fa';
import * as XLSX from 'xlsx';

const Projects = () => {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [deletingId, setDeletingId] = useState(null);

  // Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  const navigate = useNavigate();

  useEffect(() => {
    fetchProjects();
  }, []);

  const fetchProjects = async () => {
    try {
      setLoading(true);
      const res = await fetch('http://31.97.206.144:5000/api/projects');
      const data = await res.json();
      if (data.success) {
        setProjects(data.data);
      } else {
        setError('Failed to load projects');
      }
    } catch (err) {
      setError('Network error while loading projects');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this project?')) return;

    setDeletingId(id);
    try {
      const res = await fetch(`http://31.97.206.144:5000/api/projects/${id}`, {
        method: 'DELETE'
      });
      const data = await res.json();
      if (data.success) {
        setProjects(prev => prev.filter(p => p._id !== id));
      } else {
        alert(data.message || 'Delete failed');
      }
    } catch (err) {
      alert('Delete failed - Network error');
    } finally {
      setDeletingId(null);
    }
  };

  const handleStatusChange = async (id, newStatus) => {
    try {
      const res = await fetch(`http://31.97.206.144:5000/api/projects/${id}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus })
      });

      const data = await res.json();
      if (data.success) {
        setProjects(prev =>
          prev.map(p => p._id === id ? { ...p, status: newStatus } : p)
        );
      } else {
        alert('Failed to update status');
      }
    } catch (err) {
      alert('Network error while updating status');
    }
  };

  const handleView = (id) => {
    navigate(`/projects/${id}`);
  };

  // Excel Export
  const exportToExcel = () => {
    const worksheetData = filteredProjects.map(p => ({
      'Project ID': p.projectid,
      'Project Name': p.projectname,
      'Client Name': p.clientname,
      'Mobile': p.mobilenumber,
      'Email': p.email,
      'Category': p.selectcategory,
      'Start Date': new Date(p.startDate).toLocaleDateString(),
      'Handover Date': new Date(p.projectHandoverDate).toLocaleDateString(),
      'Deadline': new Date(p.deadlineDate).toLocaleDateString(),
      'Project Cost': p.projectCost,
      'Milestone': p.milestone,
      'Status': p.status,
      'Created Date': new Date(p.createdAt).toLocaleDateString()
    }));

    const ws = XLSX.utils.json_to_sheet(worksheetData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Projects");
    XLSX.writeFile(wb, `projects_${new Date().toISOString().split('T')[0]}.xlsx`);
  };

  // Filter projects
  const filteredProjects = projects.filter(p => {
    const matchesSearch =
      p.projectname?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.clientname?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.projectid?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = categoryFilter ? p.selectcategory === categoryFilter : true;
    const matchesStatus = statusFilter ? p.status === statusFilter : true;
    return matchesSearch && matchesCategory && matchesStatus;
  });

  const totalPages = Math.ceil(filteredProjects.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedProjects = filteredProjects.slice(startIndex, startIndex + itemsPerPage);

  // Format date
  const formatDate = (dateString) => {
    if (!dateString) return 'Not specified';
    return new Date(dateString).toLocaleDateString('en-US', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
  };

  // Get status badge color
  const getStatusColor = (status) => {
    switch (status) {
      case 'active': return 'text-emerald-600 bg-emerald-50 border-emerald-200';
      case 'completed': return 'text-blue-600 bg-blue-50 border-blue-200';
      case 'on hold': return 'text-amber-600 bg-amber-50 border-amber-200';
      case 'cancelled': return 'text-red-600 bg-red-50 border-red-200';
      default: return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  // Get category badge color
  const getCategoryColor = (category) => {
    switch (category) {
      case 'website': return 'text-teal-600 bg-teal-50 border-teal-200';
      case 'mobile app': return 'text-green-600 bg-green-50 border-green-200';
      case 'digital market': return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      case 'software': return 'text-blue-600 bg-blue-50 border-blue-200';
      case 'consulting': return 'text-purple-600 bg-purple-50 border-purple-200';
      default: return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-teal-600"></div>
          <p className="mt-4 text-gray-600 font-medium">Loading projects...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="text-center max-w-md">
          <div className="text-red-500 text-5xl mb-4">⚠️</div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Error Loading Projects</h2>
          <p className="text-gray-600 mb-6">{error}</p>
          <button
            onClick={fetchProjects}
            className="px-6 py-3 bg-teal-600 text-white font-medium rounded-lg hover:bg-teal-700 transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-6">
      {/* Header */}
      <div className="mb-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900">
              Project Management
            </h1>
            <p className="text-gray-600 mt-2">
              Manage all your projects in one place • {projects.length} projects total
            </p>
          </div>
          <div className="flex flex-col sm:flex-row gap-3">
            <button
              onClick={exportToExcel}
              disabled={projects.length === 0}
              className="flex items-center gap-2 px-6 py-3 text-gray-700 font-medium bg-gray-100 rounded-xl hover:bg-gray-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <MdDownload className="text-lg" />
              <span>Export Excel</span>
            </button>
            <Link
              to="/add-project"
              className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-teal-600 to-teal-700 text-white font-semibold rounded-xl hover:from-teal-700 hover:to-teal-800 transition-all duration-300 shadow-lg hover:shadow-xl"
            >
              <MdCloudUpload className="text-lg" />
              <span>Add New Project</span>
            </Link>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-2xl shadow-lg p-6 border-l-4 border-teal-600">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm text-gray-600 font-medium mb-1">Total Projects</h3>
              <div className="text-3xl font-bold text-gray-900">{projects.length}</div>
            </div>
            <div className="p-3 bg-teal-50 rounded-xl">
              <FaUsers className="text-2xl text-teal-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-lg p-6 border-l-4 border-emerald-500">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm text-gray-600 font-medium mb-1">Active Projects</h3>
              <div className="text-3xl font-bold text-emerald-600">
                {projects.filter(p => p.status === 'active').length}
              </div>
            </div>
            <div className="p-3 bg-emerald-50 rounded-xl">
              <FaCalendarAlt className="text-2xl text-emerald-500" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-lg p-6 border-l-4 border-amber-500">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm text-gray-600 font-medium mb-1">On Hold</h3>
              <div className="text-3xl font-bold text-amber-600">
                {projects.filter(p => p.status === 'on hold').length}
              </div>
            </div>
            <div className="p-3 bg-amber-50 rounded-xl">
              <div className="text-2xl text-amber-500">⏸️</div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-lg p-6 border-l-4 border-blue-500">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm text-gray-600 font-medium mb-1">Completed</h3>
              <div className="text-3xl font-bold text-blue-600">
                {projects.filter(p => p.status === 'completed').length}
              </div>
            </div>
            <div className="p-3 bg-blue-50 rounded-xl">
              <div className="text-2xl text-blue-500">✓</div>
            </div>
          </div>
        </div>
      </div>

      {/* Filters Card */}
      <div className="bg-white rounded-2xl shadow-lg mb-6">
        <div className="p-6 border-b border-gray-100">
          <div className="flex items-center gap-2 mb-4">
            <FaFilter className="text-teal-600" />
            <h2 className="text-lg font-semibold text-gray-900">Filters & Search</h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Search */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Search Projects
              </label>
              <div className="relative">
                <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  className="pl-10 pr-4 py-2.5 w-full bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                  placeholder="Search by project name, client, email..."
                  value={searchTerm}
                  onChange={(e) => {
                    setSearchTerm(e.target.value);
                    setCurrentPage(1);
                  }}
                />
              </div>
            </div>

            {/* Category Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Category
              </label>
              <select
                className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                value={categoryFilter}
                onChange={(e) => {
                  setCategoryFilter(e.target.value);
                  setCurrentPage(1);
                }}
              >
                <option value="">All Categories</option>
                <option value="website">Website</option>
                <option value="mobile app">Mobile App</option>
                <option value="digital market">Digital Marketing</option>
                <option value="software">Software</option>
                <option value="consulting">Consulting</option>
              </select>
            </div>

            {/* Status Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Status
              </label>
              <select
                className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                value={statusFilter}
                onChange={(e) => {
                  setStatusFilter(e.target.value);
                  setCurrentPage(1);
                }}
              >
                <option value="">All Status</option>
                <option value="active">Active</option>
                <option value="on hold">On Hold</option>
                <option value="completed">Completed</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>

            {/* Clear Filters Button */}
            <div className="flex items-end">
              <button
                className="w-full px-4 py-2.5 bg-gray-100 text-gray-700 font-medium rounded-lg hover:bg-gray-200 transition-colors"
                onClick={() => {
                  setSearchTerm('');
                  setCategoryFilter('');
                  setStatusFilter('');
                  setCurrentPage(1);
                }}
              >
                Clear Filters
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Projects Table */}
      <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <h2 className="text-lg font-semibold text-gray-900">Projects List</h2>
            <span className="px-3 py-1 bg-teal-100 text-teal-800 rounded-full text-sm font-medium">
              {filteredProjects.length} projects
            </span>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-sm text-gray-600">
              Page {currentPage} of {totalPages}
            </span>
            <button
              className="flex items-center gap-2 px-4 py-2 text-gray-700 font-medium bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
              onClick={fetchProjects}
              disabled={loading}
            >
              <FaSync className={`${loading ? 'animate-spin' : ''}`} />
              Refresh
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          {filteredProjects.length === 0 ? (
            <div className="py-12 text-center">
              <div className="text-gray-400">
                <div className="text-5xl mb-4 opacity-20">📁</div>
                <h3 className="text-lg font-semibold text-gray-600 mb-2">
                  No projects found
                </h3>
                <p className="text-gray-500 max-w-md mx-auto mb-6">
                  {searchTerm || categoryFilter || statusFilter
                    ? 'Try adjusting your search or filters'
                    : 'No projects available. Create your first project!'
                  }
                </p>
                <Link
                  to="/add-project"
                  className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-teal-600 to-teal-700 text-white font-semibold rounded-xl hover:from-teal-700 hover:to-teal-800 transition-all duration-300"
                >
                  <MdCloudUpload className="text-lg" />
                  Create Your First Project
                </Link>
              </div>
            </div>
          ) : (
            <>
              <table className="w-full">
                <thead>
                  <tr className="bg-gradient-to-r from-teal-600 to-teal-700 text-white">
                    <th className="py-4 px-6 text-left font-semibold text-sm">PROJECT</th>
                    <th className="py-4 px-6 text-left font-semibold text-sm">CLIENT</th>
                    <th className="py-4 px-6 text-left font-semibold text-sm">CATEGORY</th>
                    <th className="py-4 px-6 text-left font-semibold text-sm">BUDGET</th>
                    <th className="py-4 px-6 text-left font-semibold text-sm">MILESTONE</th>
                    <th className="py-4 px-6 text-left font-semibold text-sm">STATUS</th>
                    <th className="py-4 px-6 text-left font-semibold text-sm">ACTIONS</th>
                  </tr>
                </thead>
                <tbody>
                  {paginatedProjects.map((project) => (
                    <tr key={project._id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                      {/* Project Info */}
                      <td className="py-4 px-6">
                        <div>
                          <h3 className="font-semibold text-gray-900 mb-1">{project.projectname}</h3>
                          <div className="text-sm text-gray-600 mb-2">ID: {project.projectid}</div>
                          <div className="flex items-center gap-1 text-sm text-gray-500">
                            <FaCalendarAlt className="text-xs" />
                            <span>{formatDate(project.startDate)}</span>
                          </div>
                        </div>
                      </td>

                      {/* Client Info */}
                      <td className="py-4 px-6">
                        <div>
                          <div className="font-medium text-gray-900 mb-1">{project.clientname}</div>
                          <div className="flex items-center gap-1 text-sm text-gray-600 mb-1">
                            <FaMobileAlt className="text-xs" />
                            <span>{project.mobilenumber}</span>
                          </div>
                          <div className="flex items-center gap-1 text-sm text-gray-600">
                            <FaEnvelope className="text-xs" />
                            <span className="truncate max-w-[200px]">{project.email}</span>
                          </div>
                        </div>
                      </td>

                      {/* Category */}
                      <td className="py-4 px-6">
                        <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium border ${getCategoryColor(project.selectcategory)}`}>
                          {project.selectcategory}
                        </span>
                      </td>

                      {/* Budget */}
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-1 font-semibold text-gray-900">
                          <FaRupeeSign className="text-sm" />
                          {project.projectCost?.toLocaleString() || '0'}
                        </div>
                      </td>

                      {/* Milestone */}
                      <td className="py-4 px-6">
                        <div className="text-center">
                          <span className="inline-flex items-center justify-center w-8 h-8 bg-gray-100 text-gray-700 rounded-full text-sm font-medium border">
                            {project.milestone || '0'}
                          </span>
                        </div>
                      </td>

                      {/* Status */}
                      <td className="py-4 px-6">
                        <select
                          className={`w-full px-3 py-1.5 text-sm font-medium rounded-lg border focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent ${getStatusColor(project.status)}`}
                          value={project.status}
                          onChange={(e) => handleStatusChange(project._id, e.target.value)}
                        >
                          <option value="active" className="text-emerald-600">Active</option>
                          <option value="on hold" className="text-amber-600">On Hold</option>
                          <option value="completed" className="text-blue-600">Completed</option>
                          <option value="cancelled" className="text-red-600">Cancelled</option>
                        </select>
                      </td>

                      {/* Actions */}
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleView(project._id)}
                            className="p-2 text-teal-600 hover:bg-teal-50 rounded-lg transition-colors"
                            title="View Details"
                          >
                            <MdVisibility className="text-lg" />
                          </button>
                          
                          <Link
                            to={`/edit-project/${project._id}`}
                            className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                            title="Edit Project"
                          >
                            <MdEdit className="text-lg" />
                          </Link>
                          
                          <button
                            onClick={() => handleDelete(project._id)}
                            disabled={deletingId === project._id}
                            className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50"
                            title="Delete Project"
                          >
                            {deletingId === project._id ? (
                              <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-red-600"></div>
                            ) : (
                              <MdDelete className="text-lg" />
                            )}
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="px-6 py-4 border-t border-gray-100">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="text-sm text-gray-600">
                      Showing {startIndex + 1} to {Math.min(startIndex + itemsPerPage, filteredProjects.length)} of {filteredProjects.length} entries
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                        disabled={currentPage === 1}
                        className={`px-4 py-2 rounded-lg border transition-colors ${
                          currentPage === 1
                            ? 'text-gray-400 border-gray-200 cursor-not-allowed'
                            : 'text-gray-700 border-gray-300 hover:bg-gray-50'
                        }`}
                      >
                        Previous
                      </button>
                      
                      <div className="flex items-center gap-1">
                        {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                          let pageNum;
                          if (totalPages <= 5) {
                            pageNum = i + 1;
                          } else if (currentPage <= 3) {
                            pageNum = i + 1;
                          } else if (currentPage >= totalPages - 2) {
                            pageNum = totalPages - 4 + i;
                          } else {
                            pageNum = currentPage - 2 + i;
                          }
                          
                          return (
                            <button
                              key={pageNum}
                              onClick={() => setCurrentPage(pageNum)}
                              className={`w-10 h-10 rounded-lg font-medium transition-colors ${
                                currentPage === pageNum
                                  ? 'bg-teal-600 text-white'
                                  : 'text-gray-700 hover:bg-gray-100'
                              }`}
                            >
                              {pageNum}
                            </button>
                          );
                        })}
                      </div>
                      
                      <button
                        onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                        disabled={currentPage === totalPages}
                        className={`px-4 py-2 rounded-lg border transition-colors ${
                          currentPage === totalPages
                            ? 'text-gray-400 border-gray-200 cursor-not-allowed'
                            : 'text-gray-700 border-gray-300 hover:bg-gray-50'
                        }`}
                      >
                        Next
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default Projects;