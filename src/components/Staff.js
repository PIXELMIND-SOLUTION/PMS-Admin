import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { MdEdit, MdDelete, MdRemoveRedEye, MdEmail, MdPhone, MdWork, MdCalendarToday, MdBloodtype, MdPerson } from 'react-icons/md';
import { FaUserTie, FaIdCard, FaChartLine, FaSearch, FaFilter, FaSync } from 'react-icons/fa';

const Staff = () => {
  const [staffList, setStaffList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [deletingId, setDeletingId] = useState(null);
  
  // Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;
  
  const navigate = useNavigate();

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

  const handleView = (id) => {
    navigate(`/staff/${id}`);
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
    if (!dateString) return 'Not specified';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  // Calculate experience display
  const getExperienceDisplay = (experience) => {
    if (!experience && experience !== 0) return 'Not specified';
    if (experience === 1) return '1 year';
    if (experience < 1) return `${Math.round(experience * 12)} months`;
    if (experience % 1 === 0) return `${experience} years`;
    const years = Math.floor(experience);
    const months = Math.round((experience - years) * 12);
    return `${years} year${years > 1 ? 's' : ''} ${months} month${months > 1 ? 's' : ''}`;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-teal-600"></div>
          <p className="mt-4 text-gray-600 font-medium">Loading staff data...</p>
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
              Staff Management
            </h1>
            <p className="text-gray-600 mt-2">
              Manage your team members efficiently ({staffList.length} staff members)
            </p>
          </div>
          <Link 
            to="/add-staff"
            className="group flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-teal-600 to-teal-700 text-white font-semibold rounded-xl hover:from-teal-700 hover:to-teal-800 transition-all duration-300 shadow-lg hover:shadow-xl"
          >
            <FaUserTie className="text-lg" />
            <span>Add New Staff</span>
          </Link>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-2xl shadow-lg p-6 border-l-4 border-teal-600">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm text-gray-600 font-medium mb-1">Total Staff</h3>
              <div className="text-3xl font-bold text-gray-900">{staffList.length}</div>
            </div>
            <div className="p-3 bg-teal-50 rounded-xl">
              <FaUserTie className="text-2xl text-teal-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-lg p-6 border-l-4 border-emerald-600">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm text-gray-600 font-medium mb-1">Active Staff</h3>
              <div className="text-3xl font-bold text-gray-900">
                {staffList.filter(staff => staff.isActive).length}
              </div>
            </div>
            <div className="p-3 bg-emerald-50 rounded-xl">
              <MdPerson className="text-2xl text-emerald-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-lg p-6 border-l-4 border-red-500">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm text-gray-600 font-medium mb-1">Inactive Staff</h3>
              <div className="text-3xl font-bold text-gray-900">
                {staffList.filter(staff => !staff.isActive).length}
              </div>
            </div>
            <div className="p-3 bg-red-50 rounded-xl">
              <MdPerson className="text-2xl text-red-500" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-lg p-6 border-l-4 border-cyan-500">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm text-gray-600 font-medium mb-1">Unique Roles</h3>
              <div className="text-3xl font-bold text-gray-900">
                {uniqueRoles.length}
              </div>
            </div>
            <div className="p-3 bg-cyan-50 rounded-xl">
              <MdWork className="text-2xl text-cyan-500" />
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
                Search Staff
              </label>
              <div className="relative">
                <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  className="pl-10 pr-4 py-2.5 w-full bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                  placeholder="Search by name, email, ID..."
                  value={searchTerm}
                  onChange={(e) => {
                    setSearchTerm(e.target.value);
                    setCurrentPage(1);
                  }}
                />
              </div>
            </div>

            {/* Role Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Filter by Role
              </label>
              <select
                className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
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

            {/* Status Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Filter by Status
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
                <option value="inactive">Inactive</option>
              </select>
            </div>

            {/* Clear Filters Button */}
            <div className="flex items-end">
              <button
                className="w-full px-4 py-2.5 bg-gray-100 text-gray-700 font-medium rounded-lg hover:bg-gray-200 transition-colors"
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

        {/* Error Alert */}
        {error && (
          <div className="px-6 pb-4">
            <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <p className="text-sm text-red-700">{error}</p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Staff Table */}
      <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <h2 className="text-lg font-semibold text-gray-900">Staff Members</h2>
            <span className="px-3 py-1 bg-teal-100 text-teal-800 rounded-full text-sm font-medium">
              {filteredStaff.length} found
            </span>
          </div>
          <button
            className="flex items-center gap-2 px-4 py-2 text-gray-700 font-medium bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
            onClick={fetchStaff}
            disabled={loading}
          >
            <FaSync className={`${loading ? 'animate-spin' : ''}`} />
            Refresh
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gradient-to-r from-teal-600 to-teal-700 text-white">
                <th className="py-4 px-6 text-left font-semibold text-sm">#</th>
                <th className="py-4 px-6 text-left font-semibold text-sm">Staff Details</th>
                <th className="py-4 px-6 text-left font-semibold text-sm">Contact</th>
                <th className="py-4 px-6 text-left font-semibold text-sm">Role & Experience</th>
                <th className="py-4 px-6 text-left font-semibold text-sm">Joining Date</th>
                <th className="py-4 px-6 text-left font-semibold text-sm">Status</th>
                <th className="py-4 px-6 text-left font-semibold text-sm">Actions</th>
              </tr>
            </thead>
            <tbody>
              {paginatedStaff.length > 0 ? (
                paginatedStaff.map((staff, index) => (
                  <tr key={staff._id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                    {/* Serial Number */}
                    <td className="py-4 px-6 text-gray-600 font-medium">
                      {startIndex + index + 1}
                    </td>

                    {/* Staff Details */}
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-4">
                        <div className="flex-shrink-0">
                          {staff.profileImage ? (
                            <img
                              src={staff.profileImage}
                              alt={staff.staffName}
                              className="w-12 h-12 rounded-full object-cover border-2 border-white shadow"
                            />
                          ) : (
                            <div className="w-12 h-12 rounded-full bg-gray-100 border-2 border-white shadow flex items-center justify-center">
                              <FaUserTie className="text-gray-400 text-xl" />
                            </div>
                          )}
                        </div>
                        <div>
                          <h3 className="font-semibold text-gray-900">{staff.staffName}</h3>
                          <div className="flex items-center gap-1 text-gray-600 text-sm mt-1">
                            <FaIdCard className="text-xs" />
                            <span>{staff.staffId}</span>
                          </div>
                          {staff.bloodGroup && (
                            <div className="flex items-center gap-1 text-gray-600 text-sm mt-1">
                              <MdBloodtype className="text-xs" />
                              <span>{staff.bloodGroup}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </td>

                    {/* Contact Info */}
                    <td className="py-4 px-6">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2 text-gray-700">
                          <MdEmail className="text-gray-400" />
                          <span className="text-sm truncate max-w-[200px]">{staff.email}</span>
                        </div>
                        <div className="flex items-center gap-2 text-gray-700">
                          <MdPhone className="text-gray-400" />
                          <span className="text-sm">{staff.mobileNumber}</span>
                        </div>
                      </div>
                    </td>

                    {/* Role & Experience */}
                    <td className="py-4 px-6">
                      <div className="space-y-2">
                        <span className="inline-block px-3 py-1 bg-teal-50 text-teal-700 text-sm font-medium rounded-full border border-teal-100">
                          {staff.role}
                        </span>
                        {staff.experience !== undefined && staff.experience !== null && (
                          <div className="flex items-center gap-1 text-gray-600 text-sm">
                            <FaChartLine className="text-xs" />
                            <span>{getExperienceDisplay(staff.experience)}</span>
                          </div>
                        )}
                      </div>
                    </td>

                    {/* Joining Date */}
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-2 text-gray-700">
                        <MdCalendarToday className="text-gray-400" />
                        <span className="text-sm">{formatDate(staff.joiningDate)}</span>
                      </div>
                    </td>

                    {/* Status */}
                    <td className="py-4 px-6">
                      <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                        staff.isActive
                          ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                          : 'bg-red-100 text-red-800 border border-red-200'
                      }`}>
                        {staff.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </td>

                    {/* Actions */}
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleView(staff._id)}
                          className="p-2 text-teal-600 hover:bg-teal-50 rounded-lg transition-colors"
                          title="View Details"
                        >
                          <MdRemoveRedEye className="text-lg" />
                        </button>
                        
                        <Link
                          to={`/staff/edit/${staff._id}`}
                          className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                          title="Edit Staff"
                        >
                          <MdEdit className="text-lg" />
                        </Link>
                        
                        <button
                          onClick={() => handleDelete(staff._id)}
                          disabled={deletingId === staff._id}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50"
                          title="Delete Staff"
                        >
                          {deletingId === staff._id ? (
                            <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-red-600"></div>
                          ) : (
                            <MdDelete className="text-lg" />
                          )}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="7" className="py-12 text-center">
                    <div className="text-gray-400">
                      <FaUserTie className="text-5xl mx-auto mb-4 opacity-20" />
                      <h3 className="text-lg font-semibold text-gray-600 mb-2">
                        No staff members found
                      </h3>
                      <p className="text-gray-500 max-w-md mx-auto">
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
          <div className="px-6 py-4 border-t border-gray-100">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="text-sm text-gray-600">
                Showing {startIndex + 1} to {Math.min(startIndex + itemsPerPage, filteredStaff.length)} of {filteredStaff.length} entries
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
      </div>
    </div>
  );
};

export default Staff;