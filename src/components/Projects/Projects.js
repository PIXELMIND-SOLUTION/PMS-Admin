import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { MdEdit, MdDelete, MdVisibility, MdDownload } from 'react-icons/md';
import { FaUsers, FaMobileAlt, FaEnvelope, FaSearch, FaFilter } from 'react-icons/fa';
import * as XLSX from 'xlsx';

const Projects = () => {

  const navigate = useNavigate();

  /* ---------------- LOCAL DATA ---------------- */

  const [projects, setProjects] = useState([
    {
      id: "P001",
      projectName: "E-Commerce Platform",
      clientName: "Rahul Sharma",
      category: "Website",
      mobile: "9876543210",
      email: "rahul@gmail.com",
      status: "active"
    },
    {
      id: "P002",
      projectName: "Food Delivery App",
      clientName: "Anjali Verma",
      category: "APP",
      mobile: "9123456780",
      email: "anjali@gmail.com",
      status: "on hold"
    }
  ]);

  /* ---------------- FILTERS ---------------- */

  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [currentPage, setCurrentPage] = useState(1);

  const itemsPerPage = 8;

  /* ---------------- DELETE ---------------- */

  const handleDelete = (id) => {
    if (!window.confirm("Delete this project?")) return;
    setProjects(prev => prev.filter(p => p.id !== id));
  };

  /* ---------------- STATUS CHANGE ---------------- */

  const handleStatusChange = (id, newStatus) => {
    setProjects(prev =>
      prev.map(p => p.id === id ? { ...p, status: newStatus } : p)
    );
  };

  const handleView = (id) => {
    navigate(`/projects/${id}`);
  };

  /* ---------------- FILTER ---------------- */

  const filteredProjects = projects.filter(p => {
    const search = searchTerm.toLowerCase();

    return (
      p.projectName.toLowerCase().includes(search) ||
      p.clientName.toLowerCase().includes(search) ||
      p.id.toLowerCase().includes(search)
    ) &&
      (categoryFilter ? p.category === categoryFilter : true) &&
      (statusFilter ? p.status === statusFilter : true);
  });

  /* ---------------- PAGINATION ---------------- */

  const totalPages = Math.ceil(filteredProjects.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;

  const paginatedProjects =
    filteredProjects.slice(startIndex, startIndex + itemsPerPage);

  /* ---------------- EXCEL ---------------- */

  const exportToExcel = () => {
    const ws = XLSX.utils.json_to_sheet(filteredProjects);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Projects");

    XLSX.writeFile(wb, "Projects.xlsx");
  };

  /* ---------------- COLORS ---------------- */

  const statusColor = (status) => {
    switch (status) {
      case 'active':
        return 'bg-emerald-50 text-emerald-600 border-emerald-200';
      case 'completed':
        return 'bg-blue-50 text-blue-600 border-blue-200';
      case 'on hold':
        return 'bg-amber-50 text-amber-600 border-amber-200';
      default:
        return 'bg-gray-50 text-gray-600 border-gray-200';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">

      {/* HEADER */}

      <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
        <div>
          <h1 className="text-4xl font-bold text-gray-900">
            Project Management
          </h1>
          <p className="text-gray-600">
            {projects.length} projects available
          </p>
        </div>

        <div className="flex gap-3">
          <button
            onClick={exportToExcel}
            className="flex items-center gap-2 px-6 py-3 bg-gray-100 rounded-xl hover:bg-gray-200"
          >
            <MdDownload /> Export
          </button>

          <Link
            to="/add-project"
            className="px-6 py-3 rounded-xl bg-gradient-to-r from-teal-600 to-teal-700 text-white font-semibold shadow-lg"
          >
            Add Project
          </Link>
        </div>
      </div>

      {/* FILTER */}

      <div className="bg-white p-6 rounded-2xl shadow mb-6">
        <div className="flex items-center gap-2 mb-4">
          <FaFilter className="text-teal-600" />
          <h2 className="font-semibold">Filters</h2>
        </div>

        <div className="grid md:grid-cols-4 gap-4">

          <div className="relative">
            <FaSearch className="absolute left-3 top-3 text-gray-400" />
            <input
              className="pl-10 w-full border rounded-lg h-11"
              placeholder="Search..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
            />
          </div>

          <select
            className="border rounded-lg h-11 px-3"
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
          >
            <option value="">All Categories</option>
            <option>Website</option>
            <option>APP</option>
            <option>DigitalMarketing</option>
          </select>

          <select
            className="border rounded-lg h-11 px-3"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="">All Status</option>
            <option value="active">Active</option>
            <option value="on hold">On Hold</option>
            <option value="completed">Completed</option>
          </select>

          <button
            onClick={() => {
              setSearchTerm('');
              setCategoryFilter('');
              setStatusFilter('');
            }}
            className="bg-gray-100 rounded-lg"
          >
            Clear
          </button>

        </div>
      </div>

      {/* TABLE */}

      <div className="bg-white rounded-2xl shadow overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="bg-gradient-to-r from-teal-600 to-teal-700 text-white">
              <th className="py-4 px-6 text-left">Project ID</th>
              <th className="py-4 px-6 text-left">Project Name</th>
              <th className="py-4 px-6 text-left">Client</th>
              <th className="py-4 px-6 text-left">Category</th>
              <th className="py-4 px-6 text-left">Contact</th>
              <th className="py-4 px-6 text-left">Status</th>
              <th className="py-4 px-6 text-left">Actions</th>
            </tr>
          </thead>

          <tbody>
            {paginatedProjects.map((p) => (
              <tr key={p.id} className="border-b hover:bg-gray-50">

                <td className="py-4 px-6 font-semibold">{p.id}</td>

                <td className="py-4 px-6">{p.projectName}</td>

                <td className="py-4 px-6">{p.clientName}</td>

                <td className="py-4 px-6">
                  <span className="px-3 py-1 rounded-full bg-teal-50 text-teal-600 border">
                    {p.category}
                  </span>
                </td>

                <td className="py-4 px-6">
                  <div className="flex flex-col text-sm">
                    <span className="flex items-center gap-1">
                      <FaMobileAlt /> {p.mobile}
                    </span>
                    <span className="flex items-center gap-1">
                      <FaEnvelope /> {p.email}
                    </span>
                  </div>
                </td>

                <td className="py-4 px-6">
                  <select
                    value={p.status}
                    onChange={(e) => handleStatusChange(p.id, e.target.value)}
                    className={`px-3 py-1 rounded-lg border ${statusColor(p.status)}`}
                  >
                    <option value="active">Active</option>
                    <option value="on hold">On Hold</option>
                    <option value="completed">Completed</option>
                  </select>
                </td>

                <td className="py-4 px-6 flex gap-2">
                  <button
                    onClick={() => handleView(p.id)}
                    className="p-2 text-teal-600 hover:bg-teal-50 rounded-lg"
                  >
                    <MdVisibility />
                  </button>

                  <button className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg">
                    <MdEdit />
                  </button>

                  <button
                    onClick={() => handleDelete(p.id)}
                    className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
                  >
                    <MdDelete />
                  </button>
                </td>

              </tr>
            ))}
          </tbody>
        </table>

        {/* PAGINATION */}

        {totalPages > 1 && (
          <div className="flex justify-between p-4">
            <button
              disabled={currentPage === 1}
              onClick={() => setCurrentPage(p => p - 1)}
              className="px-4 py-2 border rounded-lg disabled:opacity-40"
            >
              Prev
            </button>

            <span>Page {currentPage} of {totalPages}</span>

            <button
              disabled={currentPage === totalPages}
              onClick={() => setCurrentPage(p => p + 1)}
              className="px-4 py-2 border rounded-lg disabled:opacity-40"
            >
              Next
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

/* ---------- STAT CARD ---------- */

const Stat = ({ title, value }) => (
  <div className="bg-white rounded-2xl shadow p-6 border-l-4 border-teal-600">
    <h3 className="text-gray-500 text-sm">{title}</h3>
    <div className="text-3xl font-bold">{value}</div>
  </div>
);

export default Projects;
