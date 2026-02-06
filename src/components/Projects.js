// src/components/Projects.jsx
import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { MdEdit, MdDelete, MdPayment, MdVisibility, MdDownload, MdCloudUpload } from 'react-icons/md';
import { FaUsers, FaCalendarAlt, FaRupeeSign, FaMobileAlt, FaEnvelope } from 'react-icons/fa';
import * as XLSX from 'xlsx';

const Projects = () => {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [deletingId, setDeletingId] = useState(null);
  
  // Project details modal state
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [projectDetails, setProjectDetails] = useState(null);

  // Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  const modalRef = useRef(null);

  // Close modal when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (modalRef.current && !modalRef.current.contains(e.target)) {
        setShowDetailsModal(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

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

  // Open project details modal
  const openProjectDetails = (project) => {
    setProjectDetails(project);
    setShowDetailsModal(true);
  };

  // Close details modal
  const closeDetailsModal = () => {
    setShowDetailsModal(false);
    setProjectDetails(null);
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

  // Get status badge color
  const getStatusBadge = (status) => {
    switch (status) {
      case 'active': return 'success';
      case 'completed': return 'primary';
      case 'on hold': return 'warning';
      case 'cancelled': return 'danger';
      default: return 'secondary';
    }
  };

  // Get category badge color
  const getCategoryBadge = (category) => {
    switch (category) {
      case 'website': return 'info';
      case 'mobile app': return 'success';
      case 'digital market': return 'warning';
      case 'software': return 'primary';
      case 'consulting': return 'dark';
      default: return 'secondary';
    }
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

  // Loading skeleton
  if (loading) {
    return (
      <div className="container-fluid py-4">
        <div className="card border-0 shadow-sm">
          <div className="card-body">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="skeleton-row mb-3">
                <div className="skeleton-line"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container-fluid py-4">
        <div className="alert alert-danger d-flex align-items-center" role="alert">
          <div>
            <i className="fas fa-exclamation-triangle me-2"></i>
            {error}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container-fluid py-4">
      {/* Header Section */}
      <div className="row align-items-center mb-4">
        <div className="col-md-6">
          <h2 className="fw-bold mb-2" style={{ color: '#009788' }}>
            Project Management
          </h2>
          <p className="text-muted mb-0">
            Manage all your projects in one place • {projects.length} projects total
          </p>
        </div>
        <div className="col-md-6 text-md-end">
          <div className="d-flex gap-2 justify-content-md-end">
            <button 
              className="btn btn-outline-success d-flex align-items-center gap-2"
              onClick={exportToExcel}
              disabled={projects.length === 0}
            >
              <MdDownload size={18} />
              Export Excel
            </button>
            <Link 
              to="/add-project" 
              className="btn text-white d-flex align-items-center gap-2 fw-semibold"
              style={{ backgroundColor: '#009788' }}
            >
              <MdCloudUpload size={18} />
              Add New Project
            </Link>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="row mb-4">
        <div className="col-xl-3 col-md-6 mb-3">
          <div className="card border-0 shadow-sm h-100" style={{ borderLeft: '4px solid #009788' }}>
            <div className="card-body">
              <div className="d-flex align-items-center">
                <div className="flex-grow-1">
                  <h6 className="card-title text-muted mb-1">Total Projects</h6>
                  <h3 className="fw-bold mb-0" style={{ color: '#009788' }}>
                    {projects.length}
                  </h3>
                </div>
                <div className="flex-shrink-0">
                  <div className="bg-teal bg-opacity-10 rounded-circle p-3">
                    <FaUsers size={20} style={{ color: '#009788' }} />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <div className="col-xl-3 col-md-6 mb-3">
          <div className="card border-0 shadow-sm h-100" style={{ borderLeft: '4px solid #28a745' }}>
            <div className="card-body">
              <div className="d-flex align-items-center">
                <div className="flex-grow-1">
                  <h6 className="card-title text-muted mb-1">Active Projects</h6>
                  <h3 className="fw-bold mb-0 text-success">
                    {projects.filter(p => p.status === 'active').length}
                  </h3>
                </div>
                <div className="flex-shrink-0">
                  <div className="bg-success bg-opacity-10 rounded-circle p-3">
                    <FaCalendarAlt size={20} className="text-success" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <div className="col-xl-3 col-md-6 mb-3">
          <div className="card border-0 shadow-sm h-100" style={{ borderLeft: '4px solid #ffc107' }}>
            <div className="card-body">
              <div className="d-flex align-items-center">
                <div className="flex-grow-1">
                  <h6 className="card-title text-muted mb-1">On Hold</h6>
                  <h3 className="fw-bold mb-0 text-warning">
                    {projects.filter(p => p.status === 'on hold').length}
                  </h3>
                </div>
                <div className="flex-shrink-0">
                  <div className="bg-warning bg-opacity-10 rounded-circle p-3">
                    <i className="fas fa-pause text-warning" style={{ fontSize: '20px' }}></i>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <div className="col-xl-3 col-md-6 mb-3">
          <div className="card border-0 shadow-sm h-100" style={{ borderLeft: '4px solid #17a2b8' }}>
            <div className="card-body">
              <div className="d-flex align-items-center">
                <div className="flex-grow-1">
                  <h6 className="card-title text-muted mb-1">Completed</h6>
                  <h3 className="fw-bold mb-0 text-info">
                    {projects.filter(p => p.status === 'completed').length}
                  </h3>
                </div>
                <div className="flex-shrink-0">
                  <div className="bg-info bg-opacity-10 rounded-circle p-3">
                    <i className="fas fa-check-circle text-info" style={{ fontSize: '20px' }}></i>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Filters Card */}
      <div className="card border-0 shadow-sm mb-4">
        <div className="card-body">
          <div className="row g-3 align-items-end">
            <div className="col-xl-4 col-md-6">
              <label className="form-label fw-semibold">Search Projects</label>
              <div className="input-group">
                <span className="input-group-text bg-light border-end-0">
                  <i className="fas fa-search text-muted"></i>
                </span>
                <input
                  type="text"
                  className="form-control border-start-0"
                  placeholder="Search by project name, client, email..."
                  value={searchTerm}
                  onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
                />
              </div>
            </div>
            
            <div className="col-xl-3 col-md-6">
              <label className="form-label fw-semibold">Category</label>
              <select
                className="form-select"
                value={categoryFilter}
                onChange={(e) => { setCategoryFilter(e.target.value); setCurrentPage(1); }}
              >
                <option value="">All Categories</option>
                <option value="website">Website</option>
                <option value="mobile app">Mobile App</option>
                <option value="digital market">Digital Marketing</option>
                <option value="software">Software</option>
                <option value="consulting">Consulting</option>
              </select>
            </div>
            
            <div className="col-xl-3 col-md-6">
              <label className="form-label fw-semibold">Status</label>
              <select
                className="form-select"
                value={statusFilter}
                onChange={(e) => { setStatusFilter(e.target.value); setCurrentPage(1); }}
              >
                <option value="">All Status</option>
                <option value="active">Active</option>
                <option value="on hold">On Hold</option>
                <option value="completed">Completed</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>
            
            <div className="col-xl-2 col-md-6">
              <button
                className="btn btn-outline-secondary w-100"
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
      <div className="card border-0 shadow-sm">
        <div className="card-header bg-white border-bottom-2 d-flex justify-content-between align-items-center py-3" style={{ borderColor: '#009788' }}>
          <h5 className="mb-0 fw-bold" style={{ color: '#009788' }}>
            Projects List
            <span className="badge bg-teal bg-opacity-10 text-teal ms-2">
              {filteredProjects.length} projects
            </span>
          </h5>
          <div className="text-muted small">
            Page {currentPage} of {totalPages}
          </div>
        </div>
        
        <div className="card-body p-0">
          {filteredProjects.length === 0 ? (
            <div className="text-center py-5">
              <div className="mb-3">
                <i className="fas fa-folder-open" style={{ fontSize: '3rem', color: '#dee2e6' }}></i>
              </div>
              <h5 className="text-muted">No projects found</h5>
              <p className="text-muted mb-3">Try adjusting your search or filters</p>
              <Link 
                to="/add-project" 
                className="btn text-white fw-semibold"
                style={{ backgroundColor: '#009788' }}
              >
                Create Your First Project
              </Link>
            </div>
          ) : (
            <>
              <div className="table-responsive">
                <table className="table table-hover mb-0">
                  <thead>
                    <tr style={{ backgroundColor: '#f8f9fa' }}>
                      <th className="py-3 px-4 fw-semibold text-muted border-0">PROJECT</th>
                      <th className="py-3 px-4 fw-semibold text-muted border-0">CLIENT</th>
                      <th className="py-3 px-4 fw-semibold text-muted border-0">CATEGORY</th>
                      <th className="py-3 px-4 fw-semibold text-muted border-0">BUDGET</th>
                      <th className="py-3 px-4 fw-semibold text-muted border-0">MILESTONE</th>
                      <th className="py-3 px-4 fw-semibold text-muted border-0">STATUS</th>
                      <th className="py-3 px-4 fw-semibold text-muted border-0 text-center">ACTIONS</th>
                    </tr>
                  </thead>
                  <tbody>
                    {paginatedProjects.map((project, index) => (
                      <tr key={project._id} className="border-bottom">
                        <td className="py-3 px-4">
                          <div>
                            <div className="fw-semibold text-dark">{project.projectname}</div>
                            <div className="small text-muted">ID: {project.projectid}</div>
                            <div className="small text-muted">
                              <FaCalendarAlt size={12} className="me-1" />
                              {new Date(project.startDate).toLocaleDateString()}
                            </div>
                          </div>
                        </td>
                        
                        <td className="py-3 px-4">
                          <div>
                            <div className="fw-medium">{project.clientname}</div>
                            <div className="small text-muted d-flex align-items-center gap-1">
                              <FaMobileAlt size={12} />
                              {project.mobilenumber}
                            </div>
                            <div className="small text-muted d-flex align-items-center gap-1">
                              <FaEnvelope size={12} />
                              {project.email}
                            </div>
                          </div>
                        </td>
                        
                        <td className="py-3 px-4">
                          <span className={`badge bg-${getCategoryBadge(project.selectcategory)} bg-opacity-10 text-${getCategoryBadge(project.selectcategory)}`}>
                            {project.selectcategory}
                          </span>
                        </td>
                        
                        <td className="py-3 px-4">
                          <div className="d-flex align-items-center gap-1 fw-semibold">
                            <FaRupeeSign size={12} />
                            {project.projectCost?.toLocaleString()}
                          </div>
                        </td>
                        
                        <td className="py-3 px-4">
                          <div className="text-center">
                            <span className="badge bg-light text-dark border">
                              {project.milestone || '0'}
                            </span>
                          </div>
                        </td>
                        
                        <td className="py-3 px-4">
                          <select
                            className={`form-select form-select-sm border-0 bg-${getStatusBadge(project.status)} bg-opacity-10 text-${getStatusBadge(project.status)} fw-semibold`}
                            value={project.status}
                            onChange={(e) => handleStatusChange(project._id, e.target.value)}
                            style={{ minWidth: '120px' }}
                          >
                            <option value="active" className="text-success">Active</option>
                            <option value="on hold" className="text-warning">On Hold</option>
                            <option value="completed" className="text-primary">Completed</option>
                            <option value="cancelled" className="text-danger">Cancelled</option>
                          </select>
                        </td>
                        
                        <td className="py-3 px-4">
                          <div className="d-flex justify-content-center gap-2">
                            <button
                              onClick={() => openProjectDetails(project)}
                              className="btn btn-sm btn-outline-info d-flex align-items-center gap-1"
                              title="View Details"
                            >
                              <MdVisibility size={16} />
                            </button>
                            
                            <Link
                              to={`/edit-project/${project._id}`}
                              className="btn btn-sm btn-outline-teal d-flex align-items-center gap-1"
                              title="Edit Project"
                            >
                              <MdEdit size={16} />
                            </Link>
                            
                            <button
                              onClick={() => handleDelete(project._id)}
                              className="btn btn-sm btn-outline-danger d-flex align-items-center gap-1"
                              title="Delete Project"
                              disabled={deletingId === project._id}
                            >
                              {deletingId === project._id ? (
                                <div className="spinner-border spinner-border-sm" role="status">
                                  <span className="visually-hidden">Deleting...</span>
                                </div>
                              ) : (
                                <MdDelete size={16} />
                              )}
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="card-footer bg-white border-top-0">
                  <div className="d-flex justify-content-between align-items-center">
                    <div className="text-muted small">
                      Showing {startIndex + 1} to {Math.min(startIndex + itemsPerPage, filteredProjects.length)} of {filteredProjects.length} entries
                    </div>
                    <nav>
                      <ul className="pagination pagination-sm mb-0">
                        <li className={`page-item ${currentPage === 1 ? 'disabled' : ''}`}>
                          <button 
                            className="page-link" 
                            onClick={() => setCurrentPage(Math.max(currentPage - 1, 1))}
                          >
                            Previous
                          </button>
                        </li>
                        {[...Array(totalPages)].map((_, i) => (
                          <li key={i} className={`page-item ${currentPage === i + 1 ? 'active' : ''}`}>
                            <button 
                              className="page-link" 
                              onClick={() => setCurrentPage(i + 1)}
                            >
                              {i + 1}
                            </button>
                          </li>
                        ))}
                        <li className={`page-item ${currentPage === totalPages ? 'disabled' : ''}`}>
                          <button 
                            className="page-link" 
                            onClick={() => setCurrentPage(Math.min(currentPage + 1, totalPages))}
                          >
                            Next
                          </button>
                        </li>
                      </ul>
                    </nav>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* Project Details Modal */}
  {/* Project Details Modal */}
{showDetailsModal && projectDetails && (
  <div className="modal show d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 1050 }}>
    <div className="modal-dialog modal-lg modal-dialog-centered" ref={modalRef}>
      <div className="modal-content border-0 shadow">
        <div className="modal-header text-white border-0" style={{ backgroundColor: '#009788' }}>
          <h5 className="modal-title fw-bold">Project Details</h5>
          <button 
            type="button" 
            className="btn-close btn-close-white" 
            onClick={closeDetailsModal}
          ></button>
        </div>
        <div className="modal-body">
          <div className="row">
            {/* Basic Information */}
            <div className="col-md-6">
              <h6 className="fw-bold text-teal mb-3">Basic Information</h6>
              <div className="mb-3">
                <label className="fw-semibold text-muted small">Project ID</label>
                <p className="mb-0 fw-medium">{projectDetails.projectid}</p>
              </div>
              <div className="mb-3">
                <label className="fw-semibold text-muted small">Project Name</label>
                <p className="mb-0 fw-medium">{projectDetails.projectname}</p>
              </div>
              <div className="mb-3">
                <label className="fw-semibold text-muted small">Category</label>
                <p className="mb-0">
                  <span className={`badge bg-${getCategoryBadge(projectDetails.selectcategory)} bg-opacity-10 text-${getCategoryBadge(projectDetails.selectcategory)}`}>
                    {projectDetails.selectcategory}
                  </span>
                </p>
              </div>
              <div className="mb-3">
                <label className="fw-semibold text-muted small">Status</label>
                <p className="mb-0">
                  <span className={`badge bg-${getStatusBadge(projectDetails.status)}`}>
                    {projectDetails.status}
                  </span>
                </p>
              </div>
            </div>
            
            {/* Client Information */}
            <div className="col-md-6">
              <h6 className="fw-bold text-teal mb-3">Client Information</h6>
              <div className="mb-3">
                <label className="fw-semibold text-muted small">Client Name</label>
                <p className="mb-0 fw-medium">{projectDetails.clientname}</p>
              </div>
              <div className="mb-3">
                <label className="fw-semibold text-muted small">Mobile</label>
                <p className="mb-0">{projectDetails.mobilenumber}</p>
              </div>
              <div className="mb-3">
                <label className="fw-semibold text-muted small">Email</label>
                <p className="mb-0">{projectDetails.email}</p>
              </div>
            </div>
          </div>
          
          {/* Timeline */}
          <hr />
          <h6 className="fw-bold text-teal mb-3">Project Timeline</h6>
          <div className="row">
            <div className="col-md-4 mb-3">
              <label className="fw-semibold text-muted small">Start Date</label>
              <p className="mb-0">
                {new Date(projectDetails.startDate).toLocaleDateString('en-GB', {
                  day: '2-digit', month: 'short', year: 'numeric'
                })}
              </p>
            </div>
            <div className="col-md-4 mb-3">
              <label className="fw-semibold text-muted small">Handover Date</label>
              <p className="mb-0">
                {new Date(projectDetails.projectHandoverDate).toLocaleDateString('en-GB', {
                  day: '2-digit', month: 'short', year: 'numeric'
                })}
              </p>
            </div>
            <div className="col-md-4 mb-3">
              <label className="fw-semibold text-muted small">Deadline</label>
              <p className="mb-0">
                {new Date(projectDetails.deadlineDate).toLocaleDateString('en-GB', {
                  day: '2-digit', month: 'short', year: 'numeric'
                })}
              </p>
            </div>
          </div>
          
          {/* Financial Information */}
          <hr />
          <h6 className="fw-bold text-teal mb-3">Financial Information</h6>
          <div className="row">
            <div className="col-md-4 mb-3">
              <label className="fw-semibold text-muted small">Project Cost</label>
              <p className="mb-0 fw-semibold text-teal">
                ₹{projectDetails.projectCost?.toLocaleString()}
              </p>
            </div>
            <div className="col-md-4 mb-3">
              <label className="fw-semibold text-muted small">Total Milestones</label>
              <p className="mb-0 fw-semibold">{projectDetails.milestone || '0'}</p>
            </div>
            <div className="col-md-4 mb-3">
              <label className="fw-semibold text-muted small">Created On</label>
              <p className="mb-0">
                {new Date(projectDetails.createdAt).toLocaleDateString('en-GB', {
                  day: '2-digit', month: 'short', year: 'numeric'
                })}
              </p>
            </div>
          </div>

          {/* Milestone Payments Section */}
          {projectDetails.milestonePayments && projectDetails.milestonePayments.length > 0 && (
            <>
              <hr />
              <h6 className="fw-bold text-teal mb-3">
                Milestone Payments 
                <span className="badge bg-teal ms-2">{projectDetails.milestonePayments.length}</span>
              </h6>
              <div className="table-responsive">
                <table className="table table-sm table-bordered">
                  <thead style={{ backgroundColor: '#f8f9fa' }}>
                    <tr>
                      <th className="py-2 px-3 fw-semibold small">#</th>
                      <th className="py-2 px-3 fw-semibold small">Amount</th>
                      <th className="py-2 px-3 fw-semibold small">Description</th>
                      <th className="py-2 px-3 fw-semibold small">Payment Mode</th>
                      <th className="py-2 px-3 fw-semibold small">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {projectDetails.milestonePayments.map((payment, index) => (
                      <tr key={payment._id || index}>
                        <td className="py-2 px-3 text-center fw-medium">
                          {index + 1}
                        </td>
                        <td className="py-2 px-3">
                          <span className="fw-semibold text-success">
                            ₹{payment.amount?.toLocaleString()}
                          </span>
                        </td>
                        <td className="py-2 px-3">
                          {payment.description || 'No description'}
                        </td>
                        <td className="py-2 px-3">
                          <span className={`badge ${
                            payment.paymentMode === 'Cash' ? 'bg-success' :
                            payment.paymentMode === 'Bank Transfer' ? 'bg-primary' :
                            payment.paymentMode === 'UPI' ? 'bg-info' :
                            payment.paymentMode === 'Cheque' ? 'bg-warning text-dark' :
                            'bg-secondary'
                          }`}>
                            {payment.paymentMode}
                          </span>
                        </td>
                        <td className="py-2 px-3">
                          <span className={`badge ${
                            payment.paid ? 'bg-success' : 'bg-warning text-dark'
                          }`}>
                            {payment.paid ? 'Paid' : 'Pending'}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                  {projectDetails.milestonePayments.length > 0 && (
                    <tfoot style={{ backgroundColor: '#f8f9fa' }}>
                      <tr>
                        <td colSpan="1" className="py-2 px-3 fw-semibold text-end">
                          Total Paid:
                        </td>
                        <td className="py-2 px-3 fw-bold text-success">
                          ₹{projectDetails.milestonePayments
                            .reduce((total, payment) => total + (payment.amount || 0), 0)
                            .toLocaleString()}
                        </td>
                        <td colSpan="3" className="py-2 px-3 text-muted small">
                          {projectDetails.milestonePayments.filter(p => p.paid).length} of {projectDetails.milestonePayments.length} milestones paid
                        </td>
                      </tr>
                    </tfoot>
                  )}
                </table>
              </div>
              
              {/* Payment Progress Bar */}
              <div className="mt-3">
                <div className="d-flex justify-content-between align-items-center mb-2">
                  <span className="small text-muted">Payment Progress</span>
                  <span className="small fw-semibold">
                    {Math.round(
                      (projectDetails.milestonePayments.filter(p => p.paid).length / 
                       projectDetails.milestonePayments.length) * 100
                    )}%
                  </span>
                </div>
                <div className="progress" style={{ height: '8px' }}>
                  <div 
                    className="progress-bar bg-success" 
                    style={{ 
                      width: `${(projectDetails.milestonePayments.filter(p => p.paid).length / projectDetails.milestonePayments.length) * 100}%` 
                    }}
                  ></div>
                </div>
              </div>
            </>
          )}
          
          {/* Team Members */}
          {projectDetails.teamMembers && Object.keys(projectDetails.teamMembers).length > 0 && (
            <>
              <hr />
              <h6 className="fw-bold text-teal mb-3">Team Members</h6>
              <div className="row">
                {Object.entries(projectDetails.teamMembers).map(([role, members]) => (
                  members.length > 0 && (
                    <div key={role} className="col-md-6 mb-2">
                      <label className="fw-semibold text-muted small text-capitalize">
                        {role} ({members.length})
                      </label>
                      <div className="d-flex flex-wrap gap-1">
                        {members.map((member, idx) => (
                          <span key={idx} className="badge bg-light text-dark border small">
                            {member}
                          </span>
                        ))}
                      </div>
                    </div>
                  )
                ))}
              </div>
            </>
          )}
          
          {/* Files */}
          {(projectDetails.uploadfile || projectDetails.quotationfile) && (
            <>
              <hr />
              <h6 className="fw-bold text-teal mb-3">Attached Files</h6>
              <div className="row">
                {projectDetails.uploadfile && (
                  <div className="col-md-6 mb-2">
                    <a 
                      href={projectDetails.uploadfile} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="btn btn-sm btn-outline-primary d-flex align-items-center gap-2 w-100"
                    >
                      <i className="fas fa-file-image"></i>
                      Project File
                      <i className="fas fa-external-link-alt ms-auto small"></i>
                    </a>
                  </div>
                )}
                {projectDetails.quotationfile && (
                  <div className="col-md-6 mb-2">
                    <a 
                      href={projectDetails.quotationfile} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="btn btn-sm btn-outline-success d-flex align-items-center gap-2 w-100"
                    >
                      <i className="fas fa-file-pdf"></i>
                      Quotation File
                      <i className="fas fa-external-link-alt ms-auto small"></i>
                    </a>
                  </div>
                )}
              </div>
            </>
          )}
        </div>
        <div className="modal-footer border-0">
          <button 
            type="button" 
            className="btn btn-secondary" 
            onClick={closeDetailsModal}
          >
            Close
          </button>
          <Link 
            to={`/edit-project/${projectDetails._id}`}
            className="btn text-white"
            style={{ backgroundColor: '#009788' }}
            onClick={closeDetailsModal}
          >
            Edit Project
          </Link>
        </div>
      </div>
    </div>
  </div>
)}
    </div>
  );
};

export default Projects;