import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { MdEdit, MdDelete, MdRemoveRedEye, MdEmail, MdPhone, MdWork, MdCalendarToday, MdBloodtype, MdPerson } from 'react-icons/md';
import { FaUserTie, FaIdCard, FaChartLine } from 'react-icons/fa';

const Staff = () => {
  const [staffList, setStaffList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [deletingId, setDeletingId] = useState(null);
  const [selectedStaff, setSelectedStaff] = useState(null);
  const [showModal, setShowModal] = useState(false);

  // Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  useEffect(() => {
    fetchStaff();
  }, []);

  const fetchStaff = async () => {
    try {
      setLoading(true);
      const res = await fetch('http://31.97.206.144:5000/api/get_all_staffs');
      const data = await res.json();
      if (data.success) setStaffList(data.data || []);
      else setError('Failed to load staff');
    } catch (err) {
      setError('Network error: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this staff member?')) return;
    setDeletingId(id);
    try {
      const res = await fetch(`http://31.97.206.144:5000/api/delete_staff/${id}`, {
        method: 'DELETE'
      });
      const data = await res.json();
      if (data.success) {
        setStaffList(prev => prev.filter(staff => staff._id !== id));
        // Show success message
        setError('');
      } else {
        alert('Failed to delete staff: ' + (data.message || 'Unknown error'));
      }
    } catch (err) {
      alert('Network error: ' + err.message);
    } finally {
      setDeletingId(null);
    }
  };

  const handleView = (staff) => {
    setSelectedStaff(staff);
    setShowModal(true);
  };

  // Filter logic
  const filteredStaff = staffList.filter(staff => {
    const matchesSearch =
      staff.staffName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      staff.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      staff.staffId?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      staff.mobileNumber?.includes(searchTerm);

    const matchesRole = roleFilter ? staff.role === roleFilter : true;
    const matchesStatus = statusFilter ? 
      (statusFilter === 'active' ? staff.isActive : !staff.isActive) : true;

    return matchesSearch && matchesRole && matchesStatus;
  });

  // Get unique roles for filter dropdown
  const uniqueRoles = [...new Set(staffList.map(staff => staff.role))].filter(role => role);

  // Pagination
  const totalPages = Math.ceil(filteredStaff.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedStaff = filteredStaff.slice(startIndex, startIndex + itemsPerPage);

  // Format date
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  // Calculate experience display
  const getExperienceDisplay = (experience) => {
    if (experience === 1) return '1 year';
    if (experience < 1) return `${Math.round(experience * 12)} months`;
    if (experience % 1 === 0) return `${experience} years`;
    const years = Math.floor(experience);
    const months = Math.round((experience - years) * 12);
    return `${years} year${years > 1 ? 's' : ''} ${months} month${months > 1 ? 's' : ''}`;
  };

  if (loading) {
    return (
      <div className="container-fluid py-5">
        <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '400px' }}>
          <div className="text-center">
            <div className="spinner-border text-teal" style={{ color: '#009788' }} role="status">
              <span className="visually-hidden">Loading...</span>
            </div>
            <p className="mt-3 text-muted">Loading staff data...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container-fluid py-4">
      {/* Header Section */}
      <div className="row mb-4">
        <div className="col-12">
          <div className="d-flex flex-column flex-md-row justify-content-between align-items-start align-items-md-center gap-3">
            <div>
              <h2 className="fw-bold mb-2" style={{ color: '#009788' }}>
                <FaUserTie className="me-2" />
                Staff Management
              </h2>
              <p className="text-muted mb-0">
                Manage your team members efficiently ({staffList.length} staff members)
              </p>
            </div>
            <Link 
              to="/add-staff" 
              className="btn text-white fw-semibold px-4 py-2 shadow-sm"
              style={{ 
                backgroundColor: '#009788',
                borderRadius: '8px'
              }}
            >
              <FaUserTie className="me-2" />
              Add New Staff
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
                  <h6 className="card-title text-muted mb-1">Total Staff</h6>
                  <h3 className="fw-bold mb-0" style={{ color: '#009788' }}>{staffList.length}</h3>
                </div>
                <div className="bg-teal bg-opacity-10 p-3 rounded">
                  <FaUserTie size={24} style={{ color: '#009788' }} />
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="col-xl-3 col-md-6 mb-3">
          <div className="card border-0 shadow-sm h-100" style={{ borderLeft: '4px solid #00bfa5' }}>
            <div className="card-body">
              <div className="d-flex align-items-center">
                <div className="flex-grow-1">
                  <h6 className="card-title text-muted mb-1">Active Staff</h6>
                  <h3 className="fw-bold mb-0" style={{ color: '#00bfa5' }}>
                    {staffList.filter(staff => staff.isActive).length}
                  </h3>
                </div>
                <div className="bg-success bg-opacity-10 p-3 rounded">
                  <MdPerson size={24} style={{ color: '#00bfa5' }} />
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="col-xl-3 col-md-6 mb-3">
          <div className="card border-0 shadow-sm h-100" style={{ borderLeft: '4px solid #ff6b6b' }}>
            <div className="card-body">
              <div className="d-flex align-items-center">
                <div className="flex-grow-1">
                  <h6 className="card-title text-muted mb-1">Inactive Staff</h6>
                  <h3 className="fw-bold mb-0" style={{ color: '#ff6b6b' }}>
                    {staffList.filter(staff => !staff.isActive).length}
                  </h3>
                </div>
                <div className="bg-danger bg-opacity-10 p-3 rounded">
                  <MdPerson size={24} style={{ color: '#ff6b6b' }} />
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="col-xl-3 col-md-6 mb-3">
          <div className="card border-0 shadow-sm h-100" style={{ borderLeft: '4px solid #4ecdc4' }}>
            <div className="card-body">
              <div className="d-flex align-items-center">
                <div className="flex-grow-1">
                  <h6 className="card-title text-muted mb-1">Unique Roles</h6>
                  <h3 className="fw-bold mb-0" style={{ color: '#4ecdc4' }}>
                    {uniqueRoles.length}
                  </h3>
                </div>
                <div className="bg-info bg-opacity-10 p-3 rounded">
                  <MdWork size={24} style={{ color: '#4ecdc4' }} />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="card border-0 shadow-sm mb-4">
        <div className="card-header bg-white border-bottom">
          <h5 className="mb-0 fw-semibold" style={{ color: '#009788' }}>
            <i className="fas fa-filter me-2"></i>
            Filters & Search
          </h5>
        </div>
        <div className="card-body">
          <div className="row g-3">
            <div className="col-lg-4 col-md-6">
              <label className="form-label fw-semibold">Search Staff</label>
              <div className="input-group">
                <span className="input-group-text bg-light border-end-0">
                  <i className="fas fa-search text-muted"></i>
                </span>
                <input
                  type="text"
                  className="form-control border-start-0"
                  placeholder="Search by name, email, ID, or mobile..."
                  value={searchTerm}
                  onChange={(e) => {
                    setSearchTerm(e.target.value);
                    setCurrentPage(1);
                  }}
                />
              </div>
            </div>
            <div className="col-lg-3 col-md-6">
              <label className="form-label fw-semibold">Filter by Role</label>
              <select
                className="form-select"
                value={roleFilter}
                onChange={(e) => {
                  setRoleFilter(e.target.value);
                  setCurrentPage(1);
                }}
              >
                <option value="">All Roles</option>
                {uniqueRoles.map(role => (
                  <option key={role} value={role}>{role}</option>
                ))}
              </select>
            </div>
            <div className="col-lg-3 col-md-6">
              <label className="form-label fw-semibold">Filter by Status</label>
              <select
                className="form-select"
                value={statusFilter}
                onChange={(e) => {
                  setStatusFilter(e.target.value);
                  setCurrentPage(1);
                }}
              >
                <option value="">All Status</option>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>
            <div className="col-lg-2 col-md-6 d-flex align-items-end">
              <button
                className="btn btn-outline-secondary w-100"
                onClick={() => {
                  setSearchTerm('');
                  setRoleFilter('');
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

      {/* Error Alert */}
      {error && (
        <div className="alert alert-danger d-flex align-items-center" role="alert">
          <i className="fas fa-exclamation-triangle me-2"></i>
          {error}
        </div>
      )}

      {/* Table Section */}
      <div className="card border-0 shadow-sm">
        <div className="card-header bg-white border-bottom d-flex justify-content-between align-items-center py-3">
          <h5 className="mb-0 fw-bold" style={{ color: '#009788' }}>
            <i className="fas fa-users me-2"></i>
            Staff Members
            <span className="badge bg-teal ms-2">{filteredStaff.length}</span>
          </h5>
          <button 
            className="btn btn-sm btn-outline-teal"
            onClick={fetchStaff}
            disabled={loading}
          >
            <i className="fas fa-sync-alt me-1"></i>
            Refresh
          </button>
        </div>
        
        <div className="card-body p-0">
          <div className="table-responsive">
            <table className="table table-hover mb-0">
              <thead>
                <tr style={{ 
                  background: 'linear-gradient(90deg, #009788, #00bfa6)',
                  color: 'white'
                }}>
                  <th className="py-3 px-4 fw-semibold text-center">#</th>
                  <th className="py-3 px-4 fw-semibold">Staff Details</th>
                  <th className="py-3 px-4 fw-semibold">Contact</th>
                  <th className="py-3 px-4 fw-semibold">Role & Experience</th>
                  <th className="py-3 px-4 fw-semibold">Joining Date</th>
                  <th className="py-3 px-4 fw-semibold">Status</th>
                  <th className="py-3 px-4 fw-semibold text-center">Actions</th>
                </tr>
              </thead>
              <tbody>
                {paginatedStaff.length > 0 ? (
                  paginatedStaff.map((staff, index) => (
                    <tr key={staff._id} className="align-middle">
                      <td className="py-3 px-4 text-center fw-semibold text-muted">
                        {startIndex + index + 1}
                      </td>
                      
                      {/* Staff Details Column */}
                      <td className="py-3 px-4">
                        <div className="d-flex align-items-center">
                          <div className="me-3">
                            {staff.profileImage ? (
                              <img
                                src={staff.profileImage}
                                alt={staff.staffName}
                                className="rounded-circle border"
                                style={{
                                  width: '50px',
                                  height: '50px',
                                  objectFit: 'cover'
                                }}
                              />
                            ) : (
                              <div 
                                className="rounded-circle d-flex align-items-center justify-content-center border"
                                style={{
                                  width: '50px',
                                  height: '50px',
                                  backgroundColor: '#f8f9fa'
                                }}
                              >
                                <FaUserTie size={20} className="text-muted" />
                              </div>
                            )}
                          </div>
                          <div>
                            <h6 className="fw-bold mb-1" style={{ color: '#2c3e50' }}>
                              {staff.staffName}
                            </h6>
                            <div className="d-flex align-items-center text-muted small">
                              <FaIdCard size={12} className="me-1" />
                              <span>{staff.staffId}</span>
                            </div>
                            {staff.bloodGroup && (
                              <div className="d-flex align-items-center text-muted small mt-1">
                                <MdBloodtype size={12} className="me-1" />
                                <span>Blood Group: {staff.bloodGroup}</span>
                              </div>
                            )}
                          </div>
                        </div>
                      </td>

                      {/* Contact Column */}
                      <td className="py-3 px-4">
                        <div className="d-flex flex-column gap-1">
                          <div className="d-flex align-items-center text-muted small">
                            <MdEmail size={14} className="me-2" />
                            <span className="text-truncate" style={{ maxWidth: '200px' }}>
                              {staff.email}
                            </span>
                          </div>
                          <div className="d-flex align-items-center text-muted small">
                            <MdPhone size={14} className="me-2" />
                            <span>{staff.mobileNumber}</span>
                          </div>
                        </div>
                      </td>

                      {/* Role & Experience Column */}
                      <td className="py-3 px-4">
                        <div className="d-flex flex-column gap-1">
                          <span className="badge bg-teal bg-opacity-10 text-teal border border-teal border-opacity-25 fw-semibold">
                            {staff.role}
                          </span>
                          {staff.experience && (
                            <div className="d-flex align-items-center text-muted small">
                              <FaChartLine size={12} className="me-1" />
                              <span>{getExperienceDisplay(staff.experience)}</span>
                            </div>
                          )}
                        </div>
                      </td>

                      {/* Joining Date Column */}
                      <td className="py-3 px-4">
                        {staff.joiningDate && (
                          <div className="d-flex align-items-center text-muted">
                            <MdCalendarToday size={14} className="me-2" />
                            <span>{formatDate(staff.joiningDate)}</span>
                          </div>
                        )}
                      </td>

                      {/* Status Column */}
                      <td className="py-3 px-4">
                        <span 
                          className={`badge ${staff.isActive ? 
                            'bg-success bg-opacity-10 text-success border border-success border-opacity-25' : 
                            'bg-danger bg-opacity-10 text-danger border border-danger border-opacity-25'
                          } fw-semibold`}
                        >
                          {staff.isActive ? 'Active' : 'Inactive'}
                        </span>
                      </td>

                      {/* Actions Column */}
                      <td className="py-3 px-4 text-center">
                        <div className="d-flex justify-content-center gap-2">
                          <button
                            className="btn btn-sm btn-outline-primary d-flex align-items-center"
                            onClick={() => handleView(staff)}
                            title="View Details"
                          >
                            <MdRemoveRedEye size={16} />
                          </button>
                          
                          <Link 
                            to={`/staff/${staff._id}`}
                            className="btn btn-sm btn-outline-teal d-flex align-items-center"
                            title="Edit Staff"
                          >
                            <MdEdit size={16} />
                          </Link>
                          
                          <button
                            className="btn btn-sm btn-outline-danger d-flex align-items-center"
                            onClick={() => handleDelete(staff._id)}
                            disabled={deletingId === staff._id}
                            title="Delete Staff"
                          >
                            {deletingId === staff._id ? (
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
                  ))
                ) : (
                  <tr>
                    <td colSpan="7" className="text-center py-5">
                      <div className="text-muted">
                        <i className="fas fa-users fa-3x mb-3 opacity-25"></i>
                        <h5 className="fw-semibold">No staff members found</h5>
                        <p className="mb-0">
                          {searchTerm || roleFilter || statusFilter 
                            ? 'Try adjusting your filters or search terms' 
                            : 'No staff members available. Add your first staff member!'
                          }
                        </p>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="card-footer bg-white border-top py-3">
              <div className="d-flex flex-column flex-md-row justify-content-between align-items-center gap-3">
                <div className="text-muted small">
                  Showing {startIndex + 1} to {Math.min(startIndex + itemsPerPage, filteredStaff.length)} of {filteredStaff.length} entries
                </div>
                <nav>
                  <ul className="pagination mb-0">
                    <li className={`page-item ${currentPage === 1 ? 'disabled' : ''}`}>
                      <button
                        className="page-link"
                        onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                      >
                        <i className="fas fa-chevron-left me-1"></i>
                        Previous
                      </button>
                    </li>
                    {[...Array(totalPages)].map((_, i) => (
                      <li key={i + 1} className={`page-item ${currentPage === i + 1 ? 'active' : ''}`}>
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
                        onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                      >
                        Next
                        <i className="fas fa-chevron-right ms-1"></i>
                      </button>
                    </li>
                  </ul>
                </nav>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Enhanced Modal */}
      {showModal && selectedStaff && (
        <div
          className="modal fade show d-block"
          tabIndex="-1"
          style={{ backgroundColor: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(2px)' }}
          onClick={() => setShowModal(false)}
        >
          <div
            className="modal-dialog modal-lg modal-dialog-centered"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="modal-content border-0 rounded-4 shadow-lg overflow-hidden">
              <div
                className="modal-header text-white position-relative"
                style={{
                  background: 'linear-gradient(135deg, #009788, #00bfa6)'
                }}
              >
                <div className="d-flex align-items-center w-100">
                  <div className="me-3">
                    {selectedStaff.profileImage ? (
                      <img
                        src={selectedStaff.profileImage}
                        alt={selectedStaff.staffName}
                        className="rounded-circle border border-3 border-white"
                        style={{
                          width: '70px',
                          height: '70px',
                          objectFit: 'cover'
                        }}
                      />
                    ) : (
                      <div 
                        className="rounded-circle d-flex align-items-center justify-content-center border border-3 border-white"
                        style={{
                          width: '70px',
                          height: '70px',
                          backgroundColor: 'rgba(255,255,255,0.2)'
                        }}
                      >
                        <FaUserTie size={28} className="text-white" />
                      </div>
                    )}
                  </div>
                  <div className="flex-grow-1">
                    <h4 className="modal-title fw-bold mb-1">{selectedStaff.staffName}</h4>
                    <p className="mb-0 opacity-90">{selectedStaff.role}</p>
                  </div>
                </div>
                <button 
                  className="btn-close btn-close-white position-absolute"
                  style={{ top: '1.5rem', right: '1.5rem' }}
                  onClick={() => setShowModal(false)}
                ></button>
              </div>
              
              <div className="modal-body p-0">
                <div className="row g-0">
                  {/* Left Column - Basic Info */}
                  <div className="col-md-6 p-4">
                    <h6 className="fw-bold text-teal mb-3 border-bottom pb-2">
                      <i className="fas fa-info-circle me-2"></i>
                      Basic Information
                    </h6>
                    <div className="space-y-3">
                      <InfoRow icon={<FaIdCard />} label="Staff ID" value={selectedStaff.staffId} />
                      <InfoRow icon={<MdWork />} label="Role" value={selectedStaff.role} />
                      <InfoRow icon={<FaChartLine />} label="Experience" value={getExperienceDisplay(selectedStaff.experience)} />
                      <InfoRow icon={<MdBloodtype />} label="Blood Group" value={selectedStaff.bloodGroup || 'Not specified'} />
                      <InfoRow 
                        icon={<MdCalendarToday />} 
                        label="Joining Date" 
                        value={selectedStaff.joiningDate ? formatDate(selectedStaff.joiningDate) : 'Not specified'} 
                      />
                    </div>
                  </div>

                  {/* Right Column - Contact & Status */}
                  <div className="col-md-6 p-4" style={{ backgroundColor: '#f8f9fa' }}>
                    <h6 className="fw-bold text-teal mb-3 border-bottom pb-2">
                      <i className="fas fa-address-card me-2"></i>
                      Contact & Status
                    </h6>
                    <div className="space-y-3">
                      <InfoRow icon={<MdEmail />} label="Email" value={selectedStaff.email} />
                      <InfoRow icon={<MdPhone />} label="Mobile" value={selectedStaff.mobileNumber} />
                      <InfoRow 
                        icon={<MdPerson />} 
                        label="Status" 
                        value={
                          <span className={`badge ${selectedStaff.isActive ? 'bg-success' : 'bg-danger'}`}>
                            {selectedStaff.isActive ? 'Active' : 'Inactive'}
                          </span>
                        } 
                      />
                      <InfoRow 
                        icon={<MdCalendarToday />} 
                        label="Member Since" 
                        value={selectedStaff.createdAt ? formatDate(selectedStaff.createdAt) : 'Not available'} 
                      />
                    </div>
                  </div>
                </div>

                {/* Documents Section */}
                {selectedStaff.documents?.length > 0 && (
                  <div className="p-4 border-top">
                    <h6 className="fw-bold text-teal mb-3">
                      <i className="fas fa-file-alt me-2"></i>
                      Documents & Files
                    </h6>
                    <div className="d-flex flex-wrap gap-3">
                      {selectedStaff.documents.map((doc, i) => (
                        <div key={i} className="text-center">
                          <img
                            src={doc}
                            alt={`Document ${i + 1}`}
                            className="rounded-3 border shadow-sm"
                            style={{
                              width: '120px',
                              height: '120px',
                              objectFit: 'cover',
                              cursor: 'pointer'
                            }}
                            onClick={() => window.open(doc, '_blank')}
                          />
                          <small className="text-muted d-block mt-1">Document {i + 1}</small>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
              
              <div className="modal-footer bg-light">
                <button 
                  className="btn btn-teal"
                  onClick={() => {
                    setShowModal(false);
                    // Navigate to edit page
                    window.location.href = `/edit-staff/${selectedStaff._id}`;
                  }}
                >
                  <MdEdit className="me-2" />
                  Edit Staff
                </button>
                <button 
                  className="btn btn-outline-secondary" 
                  onClick={() => setShowModal(false)}
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// Helper component for modal info rows
const InfoRow = ({ icon, label, value }) => (
  <div className="d-flex justify-content-between align-items-start py-2 border-bottom border-light">
    <div className="d-flex align-items-center text-muted">
      <span className="me-2" style={{ color: '#009788' }}>{icon}</span>
      <span className="fw-semibold">{label}:</span>
    </div>
    <div className="text-end" style={{ maxWidth: '60%' }}>
      <span className="fw-semibold text-dark">{value}</span>
    </div>
  </div>
);

// Add CSS for custom colors
const styles = `
  .bg-teal { background-color: #009788 !important; }
  .text-teal { color: #009788 !important; }
  .btn-teal { 
    background-color: #009788; 
    border-color: #009788;
    color: white;
  }
  .btn-teal:hover {
    background-color: #007a6e;
    border-color: #007a6e;
  }
  .btn-outline-teal {
    color: #009788;
    border-color: #009788;
  }
  .btn-outline-teal:hover {
    background-color: #009788;
    color: white;
  }
  .space-y-3 > * + * {
    margin-top: 0.75rem;
  }
`;

// Add styles to document
const styleSheet = document.createElement("style");
styleSheet.innerText = styles;
document.head.appendChild(styleSheet);

export default Staff;