import React, { useState, useMemo, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  FaUserTie,
  FaSearch,
  FaFilter,
  FaIdCard,
  FaFileAlt,
  FaRegBuilding,
  FaUsersCog,
  FaUserCheck,
  FaUserClock,
  FaDownload,
  FaEllipsisV,
} from "react-icons/fa";
import {
  MdEdit,
  MdDelete,
  MdRemoveRedEye,
  MdEmail,
  MdPhone,
  MdCalendarToday,
  MdBloodtype,
  MdMoreVert,
  MdAdd,
  MdRefresh,
} from "react-icons/md";
import { IoMdStats } from "react-icons/io";

const Staff = () => {
  const navigate = useNavigate();

  /* ------------------ PREMIUM LOCAL DATA ------------------ */
  const [staffList, setStaffList] = useState([
    {
      id: "1",
      employeeId: "EMP001",
      employeeName: "Manoj Kumar",
      role: "Designer",
      mobile: "9876543210",
      email: "manoj@example.com",
      joiningDate: "2022-03-12",
      bloodGroup: "B+",
      isActive: true,
      profileImage: "",
      lastActive: "2025-02-11",
    },
    {
      id: "2",
      employeeId: "EMP002",
      employeeName: "Vijay Nimmakayala",
      role: "Frontend Developer",
      mobile: "9876543211",
      email: "vijay@example.com",
      joiningDate: "2022-03-12",
      bloodGroup: "B+",
      isActive: true,
      profileImage: "",
      lastActive: "2025-02-12",
    },
    {
      id: "3",
      employeeId: "EMP003",
      employeeName: "Priya Sharma",
      role: "Backend Developer",
      mobile: "9876543212",
      email: "priya@example.com",
      joiningDate: "2023-01-15",
      bloodGroup: "O+",
      isActive: true,
      profileImage: "",
      lastActive: "2025-02-12",
    },
    {
      id: "4",
      employeeId: "EMP004",
      employeeName: "Rahul Mehta",
      role: "Project Manager",
      mobile: "9876543213",
      email: "rahul@example.com",
      joiningDate: "2021-11-20",
      bloodGroup: "A+",
      isActive: true,
      profileImage: "",
      lastActive: "2025-02-10",
    },
    {
      id: "5",
      employeeId: "EMP005",
      employeeName: "Ananya Singh",
      role: "QA Engineer",
      mobile: "9876543214",
      email: "ananya@example.com",
      joiningDate: "2023-06-05",
      bloodGroup: "AB-",
      isActive: false,
      profileImage: "",
      lastActive: "2025-02-01",
    },
  ]);

  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(5);
  const [viewMode, setViewMode] = useState("table"); // table or card
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  /* ------------------ STATS CALCULATION ------------------ */
  const stats = useMemo(() => {
    const total = staffList.length;
    const active = staffList.filter((s) => s.isActive).length;
    const inactive = total - active;
    const uniqueRoles = [...new Set(staffList.map((s) => s.role))].length;
    return { total, active, inactive, uniqueRoles };
  }, [staffList]);

  /* ------------------ FILTERS ------------------ */
  const filtered = useMemo(() => {
    return staffList.filter((s) => {
      const matchSearch =
        s.employeeName.toLowerCase().includes(search.toLowerCase()) ||
        s.employeeId.toLowerCase().includes(search.toLowerCase()) ||
        s.email.toLowerCase().includes(search.toLowerCase()) ||
        s.role.toLowerCase().includes(search.toLowerCase());

      const matchRole = roleFilter ? s.role === roleFilter : true;
      const matchStatus =
        statusFilter === "" ? true : 
        statusFilter === "active" ? s.isActive : 
        statusFilter === "inactive" ? !s.isActive : true;

      return matchSearch && matchRole && matchStatus;
    });
  }, [search, roleFilter, statusFilter, staffList]);

  const uniqueRoles = [...new Set(staffList.map((s) => s.role))];

  /* ------------------ PAGINATION ------------------ */
  const totalPages = Math.ceil(filtered.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginated = filtered.slice(startIndex, startIndex + itemsPerPage);

  // Reset to page 1 when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [search, roleFilter, statusFilter, itemsPerPage]);

  const handleDelete = (id) => {
    if (!window.confirm("Delete this employee permanently?")) return;
    setStaffList((prev) => prev.filter((s) => s.id !== id));
  };

  /* ------------------ UI ------------------ */
  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-50 via-white to-teal-50/80 p-4 md:p-6 lg:p-8 xl:p-10">
      {/* Premium Global Styles */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap');
        
        * {
          font-family: 'Inter', -apple-system, sans-serif;
        }
        
        .premium-card {
          background: rgba(255, 255, 255, 0.9);
          backdrop-filter: blur(20px);
          -webkit-backdrop-filter: blur(20px);
          border: 1px solid rgba(64, 224, 208, 0.3);
          box-shadow: 0 20px 40px -12px rgba(0, 128, 128, 0.15);
        }
        
        .premium-table {
          border-collapse: separate;
          border-spacing: 0 4px;
        }
        
        .premium-table tr {
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        }
        
        .premium-table td {
          background: rgba(255, 255, 255, 0.8);
          backdrop-filter: blur(8px);
        }
        
        .premium-table tr:hover td {
          background: white;
          transform: scale(1.01);
          box-shadow: 0 8px 20px rgba(0, 128, 128, 0.12);
        }
        
        .status-badge {
          padding: 4px 12px;
          border-radius: 100px;
          font-size: 12px;
          font-weight: 600;
          letter-spacing: 0.3px;
          text-transform: uppercase;
        }
        
        .animated-gradient {
          background: linear-gradient(-45deg, #008080, #20B2AA, #40E0D0, #008B8B);
          background-size: 400% 400%;
          animation: gradient 15s ease infinite;
        }
        
        @keyframes gradient {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
        
        @media (max-width: 768px) {
          .premium-card {
            padding: 1rem;
          }
        }
      `}</style>

      <div className="max-w-8xl mx-auto">
        {/* ========== ULTRA PREMIUM HEADER ========== */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between mb-8 gap-6">
          <div className="relative">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 lg:w-16 lg:h-16 rounded-2xl lg:rounded-3xl bg-gradient-to-br from-teal-600 to-teal-500 flex items-center justify-center shadow-2xl shadow-teal-500/40">
                <FaUsersCog className="text-white text-2xl lg:text-3xl" />
              </div>
              <div>
                <h1 className="text-3xl lg:text-4xl xl:text-5xl font-bold text-gray-800 tracking-tight">
                  Staff Management
                </h1>
                <p className="text-gray-500 mt-1 lg:mt-2 text-sm lg:text-base flex items-center gap-2">
                  <span className="w-1.5 h-1.5 bg-teal-500 rounded-full" />
                  Manage employee records, roles & documents
                </p>
              </div>
            </div>
            <div className="absolute -top-4 -left-4 w-32 h-32 bg-teal-400 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse" />
          </div>

          <Link
            to="/add-staff"
            className="group relative flex items-center justify-center gap-3 px-6 py-3 lg:px-8 lg:py-4 rounded-xl bg-gradient-to-r from-teal-600 to-teal-500 text-white font-semibold shadow-xl shadow-teal-500/40 hover:shadow-2xl hover:shadow-teal-500/60 transition-all duration-300 hover:scale-105 overflow-hidden"
          >
            <MdAdd size={22} className="group-hover:rotate-90 transition-transform duration-500" />
            <span>Add Employee</span>
            <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
          </Link>
        </div>

        {/* ========== ADVANCED FILTER CARD ========== */}
        <div className="premium-card rounded-2xl lg:rounded-3xl p-5 lg:p-7 mb-8">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-teal-100 flex items-center justify-center">
                <FaFilter className="text-teal-600" size={18} />
              </div>
              <h2 className="text-lg lg:text-xl font-bold text-gray-800">Advanced Filters</h2>
              <span className="bg-teal-100 text-teal-700 px-2.5 py-0.5 rounded-full text-xs font-bold">
                {filtered.length} results
              </span>
            </div>
            
            <div className="flex items-center gap-3">
              {/* View Toggle */}
              <div className="bg-gray-100/80 rounded-xl p-1 flex">
                <button
                  onClick={() => setViewMode("table")}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                    viewMode === "table"
                      ? "bg-white shadow-lg text-teal-700"
                      : "text-gray-500 hover:text-gray-700"
                  }`}
                >
                  Table
                </button>
                <button
                  onClick={() => setViewMode("card")}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                    viewMode === "card"
                      ? "bg-white shadow-lg text-teal-700"
                      : "text-gray-500 hover:text-gray-700"
                  }`}
                >
                  Cards
                </button>
              </div>
              
              <button
                onClick={() => {
                  setSearch("");
                  setRoleFilter("");
                  setStatusFilter("");
                }}
                className="p-2.5 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-600 transition-all"
              >
                <MdRefresh size={20} />
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Search */}
            <div className="relative group">
              <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-hover:text-teal-600 transition-colors" size={16} />
              <input
                className="w-full h-[50px] lg:h-[54px] pl-11 pr-4 rounded-xl border-2 border-gray-100 bg-white/80 focus:bg-white focus:border-teal-500 focus:ring-4 focus:ring-teal-100 outline-none transition-all text-gray-700 placeholder:text-gray-400"
                placeholder="Search name, ID, email..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>

            {/* Role Filter */}
            <div className="relative">
              <select
                className="w-full h-[50px] lg:h-[54px] px-4 pl-11 rounded-xl border-2 border-gray-100 bg-white/80 focus:bg-white focus:border-teal-500 focus:ring-4 focus:ring-teal-100 outline-none transition-all appearance-none cursor-pointer text-gray-700"
                value={roleFilter}
                onChange={(e) => setRoleFilter(e.target.value)}
              >
                <option value="">All Roles</option>
                {uniqueRoles.map((r) => (
                  <option key={r} value={r}>{r}</option>
                ))}
              </select>
              <FaUserTie className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
              <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            </div>

            {/* Status Filter */}
            <div className="relative">
              <select
                className="w-full h-[50px] lg:h-[54px] px-4 pl-11 rounded-xl border-2 border-gray-100 bg-white/80 focus:bg-white focus:border-teal-500 focus:ring-4 focus:ring-teal-100 outline-none transition-all appearance-none cursor-pointer text-gray-700"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                <option value="">All Status</option>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
              <FaUserCheck className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
              <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            </div>

            {/* Items Per Page */}
            <div className="relative">
              <select
                className="w-full h-[50px] lg:h-[54px] px-4 pl-11 rounded-xl border-2 border-gray-100 bg-white/80 focus:bg-white focus:border-teal-500 focus:ring-4 focus:ring-teal-100 outline-none transition-all appearance-none cursor-pointer text-gray-700"
                value={itemsPerPage}
                onChange={(e) => setItemsPerPage(Number(e.target.value))}
              >
                <option value={5}>5 per page</option>
                <option value={10}>10 per page</option>
                <option value={20}>20 per page</option>
                <option value={50}>50 per page</option>
              </select>
              <FaFileAlt className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
              <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            </div>
          </div>
        </div>

        {/* ========== TABLE VIEW ========== */}
        {viewMode === "table" ? (
          <div className="premium-card rounded-2xl lg:rounded-3xl overflow-hidden p-1">
            <div className="overflow-x-auto">
              <table className="w-full premium-table">
                <thead>
                  <tr className="bg-gradient-to-r from-teal-700 to-teal-600 text-white">
                    <th className="py-4 px-4 lg:px-6 text-left text-xs lg:text-sm font-semibold">#</th>
                    <th className="py-4 px-4 lg:px-6 text-left text-xs lg:text-sm font-semibold">Employee ID</th>
                    <th className="py-4 px-4 lg:px-6 text-left text-xs lg:text-sm font-semibold">Name</th>
                    <th className="py-4 px-4 lg:px-6 text-left text-xs lg:text-sm font-semibold">Role</th>
                    <th className="py-4 px-4 lg:px-6 text-left text-xs lg:text-sm font-semibold">Status</th>
                    <th className="py-4 px-4 lg:px-6 text-left text-xs lg:text-sm font-semibold">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {paginated.length > 0 ? (
                    paginated.map((staff, index) => (
                      <tr key={staff.id} className="group">
                        <td className="py-4 px-4 lg:px-6 rounded-l-xl font-medium text-gray-600">
                          {startIndex + index + 1}
                        </td>
                        <td className="py-4 px-4 lg:px-6">
                          <div className="flex items-center gap-2">
                            <FaIdCard className="text-teal-600" size={16} />
                            <span className="font-semibold text-gray-800 text-sm lg:text-base">
                              {staff.employeeId}
                            </span>
                          </div>
                        </td>
                        <td className="py-4 px-4 lg:px-6">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-teal-500 to-teal-600 flex items-center justify-center shadow-md">
                              <FaUserTie className="text-white" size={16} />
                            </div>
                            <div>
                              <span className="font-semibold text-gray-800 text-sm lg:text-base block">
                                {staff.employeeName}
                              </span>
                              <span className="text-xs text-gray-500">{staff.email}</span>
                            </div>
                          </div>
                        </td>
                        <td className="py-4 px-4 lg:px-6">
                          <span className="px-3 py-1.5 bg-teal-50 text-teal-700 rounded-lg text-xs lg:text-sm font-medium border border-teal-200">
                            {staff.role}
                          </span>
                        </td>
                        <td className="py-4 px-4 lg:px-6">
                          <span className={`status-badge ${
                            staff.isActive 
                              ? "bg-emerald-100 text-emerald-700 border border-emerald-200" 
                              : "bg-gray-100 text-gray-700 border border-gray-200"
                          }`}>
                            {staff.isActive ? "Active" : "Inactive"}
                          </span>
                        </td>
                        <td className="py-4 px-4 lg:px-6 rounded-r-xl">
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => navigate(`/staff/${staff.id}`)}
                              className="p-2.5 bg-teal-50 hover:bg-teal-100 text-teal-600 rounded-xl transition-all hover:scale-110"
                              title="View Details"
                            >
                              <MdRemoveRedEye size={18} />
                            </button>
                            <button
                              className="p-2.5 bg-blue-50 hover:bg-blue-100 text-blue-600 rounded-xl transition-all hover:scale-110"
                              title="Edit"
                            >
                              <MdEdit size={18} />
                            </button>
                            <button
                              onClick={() => handleDelete(staff.id)}
                              className="p-2.5 bg-red-50 hover:bg-red-100 text-red-600 rounded-xl transition-all hover:scale-110"
                              title="Delete"
                            >
                              <MdDelete size={18} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="6" className="py-16 text-center">
                        <div className="flex flex-col items-center gap-3">
                          <FaUsersCog className="text-gray-300" size={48} />
                          <span className="text-gray-400 font-medium">No employees found</span>
                          <button 
                            onClick={() => navigate("/add-staff")}
                            className="px-6 py-2.5 bg-teal-600 text-white rounded-xl text-sm font-semibold hover:bg-teal-700 transition-colors"
                          >
                            Add First Employee
                          </button>
                        </div>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <Pagination
                totalPages={totalPages}
                currentPage={currentPage}
                setCurrentPage={setCurrentPage}
                startIndex={startIndex}
                itemsPerPage={itemsPerPage}
                filteredLength={filtered.length}
              />
            )}
          </div>
        ) : (
          /* ========== CARD VIEW (MOBILE/GRID) ========== */
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {paginated.length > 0 ? (
              paginated.map((staff, index) => (
                <div
                  key={staff.id}
                  className="premium-card rounded-2xl lg:rounded-3xl p-5 lg:p-6 hover:scale-[1.02] transition-all duration-300 group"
                  style={{ animation: `fadeIn 0.4s ease ${index * 0.05}s backwards` }}
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-4">
                      <div className="w-14 h-14 lg:w-16 lg:h-16 rounded-2xl bg-gradient-to-br from-teal-500 to-teal-600 flex items-center justify-center shadow-lg">
                        <FaUserTie className="text-white text-xl lg:text-2xl" />
                      </div>
                      <div>
                        <h3 className="font-bold text-gray-800 text-base lg:text-lg">
                          {staff.employeeName}
                        </h3>
                        <p className="text-xs lg:text-sm text-teal-600 font-medium">
                          {staff.role}
                        </p>
                        <span className={`inline-block mt-1.5 px-2 py-0.5 rounded-full text-xs font-medium ${
                          staff.isActive 
                            ? "bg-emerald-100 text-emerald-700" 
                            : "bg-gray-100 text-gray-700"
                        }`}>
                          {staff.isActive ? "Active" : "Inactive"}
                        </span>
                      </div>
                    </div>
                    <div className="relative">
                      <button className="p-2 hover:bg-gray-100 rounded-xl transition-colors">
                        <MdMoreVert className="text-gray-500" size={20} />
                      </button>
                    </div>
                  </div>

                  <div className="space-y-2.5 mb-5">
                    <div className="flex items-center gap-2 text-sm">
                      <FaIdCard className="text-gray-400" size={14} />
                      <span className="text-gray-600">{staff.employeeId}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <MdEmail className="text-gray-400" size={14} />
                      <span className="text-gray-600 truncate">{staff.email}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <MdPhone className="text-gray-400" size={14} />
                      <span className="text-gray-600">{staff.mobile}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <MdCalendarToday className="text-gray-400" size={14} />
                      <span className="text-gray-600">Joined {staff.joiningDate}</span>
                    </div>
                  </div>

                  <div className="flex justify-end gap-2 pt-3 border-t border-gray-100">
                    <button
                      onClick={() => navigate(`/staff/${staff.id}`)}
                      className="p-2.5 bg-teal-50 hover:bg-teal-100 text-teal-600 rounded-xl transition-all"
                    >
                      <MdRemoveRedEye size={18} />
                    </button>
                    <button className="p-2.5 bg-blue-50 hover:bg-blue-100 text-blue-600 rounded-xl transition-all">
                      <MdEdit size={18} />
                    </button>
                    <button
                      onClick={() => handleDelete(staff.id)}
                      className="p-2.5 bg-red-50 hover:bg-red-100 text-red-600 rounded-xl transition-all"
                    >
                      <MdDelete size={18} />
                    </button>
                  </div>
                </div>
              ))
            ) : (
              <div className="col-span-full py-16 text-center">
                <div className="flex flex-col items-center gap-4">
                  <FaUsersCog className="text-gray-300" size={64} />
                  <span className="text-gray-400 font-medium text-lg">No employees found</span>
                  <button className="px-6 py-3 bg-teal-600 text-white rounded-xl font-semibold">
                    Add Employee
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

/* ========== PREMIUM PAGINATION ========== */
const Pagination = ({ totalPages, currentPage, setCurrentPage, startIndex, itemsPerPage, filteredLength }) => (
  <div className="px-6 py-5 border-t border-teal-100 bg-gradient-to-r from-white to-teal-50/50">
    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
      <div className="text-sm text-gray-600 font-medium">
        Showing <span className="text-teal-700 font-bold">{startIndex + 1}</span> to{" "}
        <span className="text-teal-700 font-bold">
          {Math.min(startIndex + itemsPerPage, filteredLength)}
        </span>{" "}
        of <span className="text-teal-700 font-bold">{filteredLength}</span> employees
      </div>

      <div className="flex items-center gap-2">
        <button
          disabled={currentPage === 1}
          onClick={() => setCurrentPage((p) => p - 1)}
          className={`
            px-4 py-2.5 rounded-xl font-semibold transition-all duration-300 border-2
            ${
              currentPage === 1
                ? "text-gray-400 border-gray-200 cursor-not-allowed bg-gray-50"
                : "text-teal-700 border-teal-200 hover:bg-teal-100 hover:border-teal-300 bg-white"
            }
          `}
        >
          ← Previous
        </button>

        <div className="flex items-center gap-1.5">
          {[...Array(totalPages)].map((_, i) => {
            const page = i + 1;
            if (
              page === 1 ||
              page === totalPages ||
              (page >= currentPage - 1 && page <= currentPage + 1)
            ) {
              return (
                <button
                  key={page}
                  onClick={() => setCurrentPage(page)}
                  className={`
                    w-10 h-10 rounded-xl font-semibold transition-all duration-300
                    ${
                      currentPage === page
                        ? "bg-gradient-to-r from-teal-600 to-teal-500 text-white shadow-lg shadow-teal-500/30 scale-110"
                        : "hover:bg-teal-100 text-gray-700 bg-white border-2 border-gray-100"
                    }
                  `}
                >
                  {page}
                </button>
              );
            }
            if (page === currentPage - 2 || page === currentPage + 2) {
              return <span key={page} className="px-2 text-gray-400 font-bold">...</span>;
            }
            return null;
          })}
        </div>

        <button
          disabled={currentPage === totalPages}
          onClick={() => setCurrentPage((p) => p + 1)}
          className={`
            px-4 py-2.5 rounded-xl font-semibold transition-all duration-300 border-2
            ${
              currentPage === totalPages
                ? "text-gray-400 border-gray-200 cursor-not-allowed bg-gray-50"
                : "text-teal-700 border-teal-200 hover:bg-teal-100 hover:border-teal-300 bg-white"
            }
          `}
        >
          Next →
        </button>
      </div>
    </div>
  </div>
);

// Need to import ChevronDown for selects
const ChevronDown = ({ size = 18, className = "" }) => (
  <svg 
    xmlns="http://www.w3.org/2000/svg" 
    width={size} 
    height={size} 
    viewBox="0 0 24 24" 
    fill="none" 
    stroke="currentColor" 
    strokeWidth="2" 
    strokeLinecap="round" 
    strokeLinejoin="round" 
    className={className}
  >
    <polyline points="6 9 12 15 18 9"></polyline>
  </svg>
);

export default Staff;