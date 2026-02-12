import React, { useState, useMemo } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  FaUserTie,
  FaSearch,
  FaFilter,
  FaIdCard,
  FaFileAlt,
} from "react-icons/fa";
import {
  MdEdit,
  MdDelete,
  MdRemoveRedEye,
  MdEmail,
  MdPhone,
  MdCalendarToday,
  MdBloodtype,
} from "react-icons/md";

const Staff = () => {
  const navigate = useNavigate();

  /* ------------------ PREMIUM LOCAL DATA ------------------ */

  const [staffList, setStaffList] = useState([
    {
      id: "1",
      employeeId: "EMP001",
      employeeName: "Manoj kumar",
      role: "Designer",
      mobile: "9876543210",
      email: "rahul@example.com",
      joiningDate: "2022-03-12",
      bloodGroup: "B+",
      isActive: true,
      profileImage: "",
      idCardImage: "",
      documents: {
        experienceLetters: [],
        relievingLetters: [],
        payslips: [],
        form16: [],
        offerLetters: [],
        aadharCard: [],
        panCard: [],
        tenth: [],
        graduation: [],
      },
    },
    {
      id: "2",
      employeeId: "EMP002",
      employeeName: "vijay Nimmakayala",
      role: "Frontend Developer",
      mobile: "9876543210",
      email: "vijay@example.com",
      joiningDate: "2022-03-12",
      bloodGroup: "B+",
      isActive: true,
      profileImage: "",
      idCardImage: "",
      documents: {
        experienceLetters: [],
        relievingLetters: [],
        payslips: [],
        form16: [],
        offerLetters: [],
        aadharCard: [],
        panCard: [],
        tenth: [],
        graduation: [],
      },
    },
  ]);

  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

  const itemsPerPage = 10;

  /* ------------------ FILTER ------------------ */

  const filtered = useMemo(() => {
    return staffList.filter((s) => {
      const matchSearch =
        s.employeeName.toLowerCase().includes(search.toLowerCase()) ||
        s.employeeId.toLowerCase().includes(search.toLowerCase()) ||
        s.email.toLowerCase().includes(search.toLowerCase());

      const matchRole = roleFilter ? s.role === roleFilter : true;

      return matchSearch && matchRole;
    });
  }, [search, roleFilter, staffList]);

  const totalPages = Math.ceil(filtered.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginated = filtered.slice(
    startIndex,
    startIndex + itemsPerPage
  );

  const uniqueRoles = [
    ...new Set(staffList.map((s) => s.role)),
  ];

  const handleDelete = (id) => {
    if (!window.confirm("Delete this employee?")) return;
    setStaffList((prev) => prev.filter((s) => s.id !== id));
  };

  /* ------------------ UI ------------------ */

  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-50 via-white to-teal-100 p-6 md:p-10">
      <div className="max-w-7xl mx-auto">

        {/* HEADER */}

        <div className="flex flex-col md:flex-row md:items-center justify-between mb-10 gap-6">
          <div>
            <h1 className="text-4xl font-bold text-gray-800">
              Staff Management
            </h1>
            <p className="text-gray-500 mt-2">
              Manage employee records & documents
            </p>
          </div>

          <Link
            to="/add-staff"
            className="
            flex items-center gap-2
            px-6 py-3
            rounded-xl
            bg-gradient-to-r from-teal-600 to-teal-500
            text-white
            font-semibold
            shadow-lg
            hover:shadow-2xl
            transition
            "
          >
            <FaUserTie />
            Add Employee
          </Link>
        </div>

        {/* FILTER CARD */}

        <div className="bg-white/80 backdrop-blur-lg rounded-2xl shadow-lg p-6 mb-8 border border-white/40">
          <div className="flex items-center gap-2 mb-4">
            <FaFilter className="text-teal-600" />
            <h2 className="font-semibold text-gray-800">
              Filters & Search
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-4">
            <div className="relative">
              <FaSearch className="absolute left-3 top-3 text-gray-400" />
              <input
                className="pl-10 pr-4 py-2.5 w-full border border-gray-200 rounded-xl focus:ring-2 focus:ring-teal-500 outline-none"
                placeholder="Search by name, ID, email..."
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setCurrentPage(1);
                }}
              />
            </div>

            <select
              className="px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-teal-500 outline-none"
              value={roleFilter}
              onChange={(e) => {
                setRoleFilter(e.target.value);
                setCurrentPage(1);
              }}
            >
              <option value="">All Roles</option>
              {uniqueRoles.map((r) => (
                <option key={r}>{r}</option>
              ))}
            </select>

            <button
              onClick={() => {
                setSearch("");
                setRoleFilter("");
              }}
              className="px-4 py-2.5 rounded-xl bg-gray-100 hover:bg-gray-200 transition"
            >
              Clear
            </button>
          </div>
        </div>

        {/* TABLE */}

        <div className="bg-white rounded-2xl shadow-2xl overflow-hidden">
          {/* TABLE */}

          <div className="bg-white rounded-2xl shadow-2xl overflow-hidden">
            <table className="w-full">
              <thead>
                <tr className="bg-gradient-to-r from-teal-600 to-teal-700 text-white text-sm">
                  <th className="py-4 px-6 text-left">#</th>
                  <th className="py-4 px-6 text-left">Employee ID</th>
                  <th className="py-4 px-6 text-left">Name</th>
                  <th className="py-4 px-6 text-left">Role</th>
                  <th className="py-4 px-6 text-left">Actions</th>
                </tr>
              </thead>

              <tbody>
                {paginated.length > 0 ? (
                  paginated.map((staff, index) => (
                    <tr
                      key={staff.id}
                      className="border-b hover:bg-teal-50 transition"
                    >
                      {/* Serial */}
                      <td className="py-4 px-6 font-medium text-gray-600">
                        {startIndex + index + 1}
                      </td>

                      {/* Employee ID */}
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-2 font-semibold text-gray-800">
                          <FaIdCard className="text-teal-600" />
                          {staff.employeeId}
                        </div>
                      </td>

                      {/* Name */}
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-teal-100 flex items-center justify-center">
                            <FaUserTie className="text-teal-600" />
                          </div>

                          <span className="font-semibold text-gray-800">
                            {staff.employeeName}
                          </span>
                        </div>
                      </td>

                      {/* Role */}
                      <td className="py-4 px-6">
                        <span className="
                px-3 py-1
                bg-teal-50
                text-teal-700
                rounded-full
                text-sm
                border border-teal-100
                font-medium
              ">
                          {staff.role}
                        </span>
                      </td>

                      {/* Actions */}
                      <td className="py-4 px-6 flex gap-2">
                        <button
                          onClick={() => navigate(`/staff/${staff.id}`)}
                          className="p-2 text-teal-600 hover:bg-teal-100 rounded-lg transition"
                        >
                          <MdRemoveRedEye />
                        </button>

                        <button className="p-2 text-blue-600 hover:bg-blue-100 rounded-lg transition">
                          <MdEdit />
                        </button>

                        <button
                          onClick={() => handleDelete(staff.id)}
                          className="p-2 text-red-600 hover:bg-red-100 rounded-lg transition"
                        >
                          <MdDelete />
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="5" className="py-16 text-center text-gray-400">
                      No employees found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>

            
          </div>


          {/* PREMIUM PAGINATION */}

{totalPages > 1 && (
  <div className="px-6 py-5 border-t bg-gradient-to-r from-white to-teal-50">
    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">

      {/* LEFT INFO */}
      <div className="text-sm text-gray-600 font-medium">
        Showing{" "}
        <span className="text-teal-700 font-semibold">
          {startIndex + 1}
        </span>{" "}
        to{" "}
        <span className="text-teal-700 font-semibold">
          {Math.min(startIndex + itemsPerPage, filtered.length)}
        </span>{" "}
        of{" "}
        <span className="text-teal-700 font-semibold">
          {filtered.length}
        </span>{" "}
        employees
      </div>

      {/* BUTTON GROUP */}
      <div className="flex items-center gap-2">

        {/* PREVIOUS */}
        <button
          disabled={currentPage === 1}
          onClick={() => setCurrentPage((p) => p - 1)}
          className={`
            px-4 py-2 rounded-lg font-semibold
            transition
            border
            ${
              currentPage === 1
                ? "text-gray-400 border-gray-200 cursor-not-allowed"
                : "text-teal-700 border-teal-200 hover:bg-teal-100"
            }
          `}
        >
          ← Prev
        </button>

        {/* PAGE NUMBERS */}
        <div className="flex items-center gap-1">
          {[...Array(totalPages)].map((_, i) => {
            const page = i + 1;

            // show only nearby pages for premium look
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
                    w-10 h-10 rounded-lg font-semibold transition
                    ${
                      currentPage === page
                        ? "bg-gradient-to-r from-teal-600 to-teal-500 text-white shadow-md"
                        : "hover:bg-teal-100 text-gray-700"
                    }
                  `}
                >
                  {page}
                </button>
              );
            }

            // DOTS
            if (
              page === currentPage - 2 ||
              page === currentPage + 2
            ) {
              return (
                <span key={page} className="px-2 text-gray-400">
                  ...
                </span>
              );
            }

            return null;
          })}
        </div>

        {/* NEXT */}
        <button
          disabled={currentPage === totalPages}
          onClick={() => setCurrentPage((p) => p + 1)}
          className={`
            px-4 py-2 rounded-lg font-semibold
            transition
            border
            ${
              currentPage === totalPages
                ? "text-gray-400 border-gray-200 cursor-not-allowed"
                : "text-teal-700 border-teal-200 hover:bg-teal-100"
            }
          `}
        >
          Next →
        </button>

      </div>
    </div>
  </div>
)}

        </div>
      </div>
    </div>
  );
};

/* STAT CARD */

const StatCard = ({ title, value }) => (
  <div className="bg-white/90 backdrop-blur-lg rounded-2xl shadow-lg p-6 border border-white/40">
    <div className="text-sm text-gray-500 mb-1">{title}</div>
    <div className="text-3xl font-bold text-gray-800">{value}</div>
  </div>
);

export default Staff;
