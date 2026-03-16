import React, { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import {
  Pencil,
  Trash2,
  ChevronDown,
  ChevronUp,
  Plus,
  Download,
  Search,
} from "lucide-react";
import * as XLSX from "xlsx";

const TOKEN =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjY5YTk2M2MzOGMxMmM1MDA0MWEwOTkzMiIsImlhdCI6MTc3MzY1MDAwOSwiZXhwIjoxNzc0MjU0ODA5fQ.vShFFb3-2i_4Uou-8YCbEDZEFOCR5lhOIPb2Zq808tw";

const API_BASE = "http://31.97.206.144:5000/api";

const authHeaders = {
  "Content-Type": "application/json",
  Authorization: `Bearer ${TOKEN}`,
};

const AssignedWorks = () => {
  const [assignments, setAssignments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedRows, setExpandedRows] = useState(new Set());
  const [deletingId, setDeletingId] = useState(null);

  const [searchTerm, setSearchTerm] = useState("");
  const [sheetFilter, setSheetFilter] = useState("");
  const [projectFilter, setProjectFilter] = useState("");

  // Server-side pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalRecords, setTotalRecords] = useState(0);
  const itemsPerPage = 10; // matches API default limit

  const [showExportModal, setShowExportModal] = useState(false);
  const [exportDates, setExportDates] = useState({
    startDate: "",
    endDate: "",
  });

  const modalRef = useRef(null);

  /* ---------------- FETCH ---------------- */

  useEffect(() => {
    fetchAssignments(currentPage);
  }, [currentPage]);

  const fetchAssignments = async (page = 1) => {
    setLoading(true);
    try {
      const res = await fetch(
        `${API_BASE}/worksheets?page=${page}&limit=${itemsPerPage}`,
        { headers: authHeaders }
      );
      const data = await res.json();
      if (data.success) {
        setAssignments(data.data);
        setTotalPages(data.pagination.pages);
        setTotalRecords(data.pagination.total);
      }
    } catch {
      console.error("Fetch error");
    } finally {
      setLoading(false);
    }
  };

  /* ---------------- DELETE ---------------- */

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this assignment?")) return;

    setDeletingId(id);

    try {
      const res = await fetch(`${API_BASE}/delete_assign_project/${id}`, {
        method: "DELETE",
        headers: authHeaders,
      });

      if (res.ok) {
        setAssignments((prev) => prev.filter((a) => a._id !== id));
        setTotalRecords((prev) => prev - 1);
      } else {
        alert("Delete failed");
      }
    } catch {
      alert("Delete failed");
    }

    setDeletingId(null);
  };

  /* ---------------- EXPAND ---------------- */

  const toggleExpand = (id) => {
    const updated = new Set(expandedRows);
    updated.has(id) ? updated.delete(id) : updated.add(id);
    setExpandedRows(updated);
  };

  /* ---------------- CLIENT-SIDE FILTER (on current page data) ---------------- */

  const allProjects = [
    ...new Set(assignments.flatMap((a) => a.projects.map((p) => p.projectName))),
  ];

  const filteredAssignments = assignments.filter((a) => {
    const matchesSearch =
      (a.empId?.toString() || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
      a.employName.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesSheet = sheetFilter ? a.sheet === sheetFilter : true;

    const matchesProject = projectFilter
      ? a.projects.some((p) => p.projectName === projectFilter)
      : true;

    return matchesSearch && matchesSheet && matchesProject;
  });

  /* ---------------- EXPORT ---------------- */

  const handleExport = async () => {
    if (!exportDates.startDate || !exportDates.endDate)
      return alert("Select both start and end dates");

    try {
      // Fetch all data for export (no pagination limit)
      const res = await fetch(`${API_BASE}/worksheets?limit=1000`, {
        headers: authHeaders,
      });
      const data = await res.json();

      if (!data.success) return alert("Failed to fetch data for export");

      const rows = [];

      data.data.forEach((a) => {
        a.projects.forEach((p) => {
          const s = new Date(p.startDate);
          const e = new Date(p.endDate);

          if (
            s <= new Date(exportDates.endDate) &&
            e >= new Date(exportDates.startDate)
          ) {
            rows.push({
              EmployeeID: a.empId,
              Name: a.employName,
              Sheet: a.sheet,
              Project: p.projectName,
              Start: p.startDate,
              End: p.endDate,
              Hours: p.hours,
              Shift: p.shift,
              Comment: p.comment || "",
            });
          }
        });
      });

      if (rows.length === 0) return alert("No records found in the selected date range");

      const ws = XLSX.utils.json_to_sheet(rows);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, "Assignments");
      XLSX.writeFile(wb, `AssignedWorks_${exportDates.startDate}_to_${exportDates.endDate}.xlsx`);

      setShowExportModal(false);
    } catch {
      alert("Export failed");
    }
  };

  /* ---------------- LOADING ---------------- */

  if (loading)
    return (
      <div className="h-screen flex items-center justify-center bg-slate-50">
        <div className="animate-pulse text-slate-600 text-lg">
          Loading assignments...
        </div>
      </div>
    );

  /* ================================================= */

  return (
    <div className="min-h-screen bg-slate-50 p-6 md:p-10">
      <div className="max-w-7xl mx-auto space-y-8">

        {/* HEADER */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-slate-800">
              Assigned Works
            </h1>
            <p className="text-slate-500">
              Manage employee project assignments
              {totalRecords > 0 && (
                <span className="ml-2 text-xs bg-teal-100 text-teal-700 px-2 py-0.5 rounded-full font-semibold">
                  {totalRecords} total
                </span>
              )}
            </p>
          </div>

          <div className="flex gap-3">
            <button
              onClick={() => setShowExportModal(true)}
              className="flex items-center gap-2 px-5 py-2 rounded-xl border border-emerald-600 text-emerald-700 hover:bg-emerald-50 font-semibold"
            >
              <Download size={16} />
              Export
            </button>

            <Link
              to="/add-worksheet"
              className="flex items-center gap-2 px-5 py-2 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-semibold shadow-sm"
            >
              <Plus size={16} />
              Add Worksheet
            </Link>
          </div>
        </div>

        {/* FILTERS */}
        <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-200 grid md:grid-cols-3 gap-4">
          <div className="relative">
            <Search size={16} className="absolute top-3 left-3 text-slate-400" />
            <input
              placeholder="Search employee..."
              className="w-full pl-9 h-11 border border-slate-300 rounded-xl focus:ring-2 focus:ring-teal-500 outline-none"
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
            />
          </div>

          <select
            className="h-11 border border-slate-300 rounded-xl px-3 focus:ring-2 focus:ring-teal-500"
            value={sheetFilter}
            onChange={(e) => {
              setSheetFilter(e.target.value);
              setCurrentPage(1);
            }}
          >
            <option value="">All Sheets</option>
            <option>frontend</option>
            <option>backend</option>
            <option>testing</option>
            <option>design</option>
            <option>Full Stack</option>
            <option>Digital Marketing</option>
          </select>

          <select
            className="h-11 border border-slate-300 rounded-xl px-3 focus:ring-2 focus:ring-teal-500"
            value={projectFilter}
            onChange={(e) => {
              setProjectFilter(e.target.value);
              setCurrentPage(1);
            }}
          >
            <option value="">All Projects</option>
            {allProjects.map((p) => (
              <option key={p}>{p}</option>
            ))}
          </select>
        </div>

        {/* TABLE */}
        <div className="bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-slate-100 text-slate-600">
              <tr>
                <th className="p-4 text-left">#</th>
                <th className="p-4 text-left">Employee</th>
                <th className="p-4">Sheet</th>
                <th className="p-4">Projects</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>

            <tbody>
              {filteredAssignments.length === 0 ? (
                <tr>
                  <td colSpan="5" className="p-10 text-center text-slate-400">
                    No assignments found.
                  </td>
                </tr>
              ) : (
                filteredAssignments.map((a, i) => (
                  <React.Fragment key={a._id}>
                    <tr className="border-t hover:bg-slate-50 transition">
                      <td className="p-4">
                        {(currentPage - 1) * itemsPerPage + i + 1}
                      </td>

                      <td className="p-4">
                        <div className="font-semibold text-slate-700">
                          {a.employName}
                        </div>
                        <div className="text-xs text-slate-400">
                          {/* empId is an ObjectId string from API */}
                          ID: {typeof a.empId === "string" ? a.empId.slice(-6).toUpperCase() : a.empId}
                        </div>
                      </td>

                      <td className="p-4 text-center">
                        <span className="px-3 py-1 text-xs rounded-full bg-teal-100 text-teal-700 font-semibold">
                          {a.sheet}
                        </span>
                      </td>

                      <td className="p-4 text-center">
                        <button
                          onClick={() => toggleExpand(a._id)}
                          className="flex items-center gap-1 mx-auto text-teal-600 font-semibold"
                        >
                          {a.projects.length} Project{a.projects.length !== 1 ? "s" : ""}
                          {expandedRows.has(a._id) ? (
                            <ChevronUp size={16} />
                          ) : (
                            <ChevronDown size={16} />
                          )}
                        </button>
                      </td>

                      <td className="p-4">
                        <div className="flex justify-end gap-4">
                          <Link to={`/edit-worksheet/${a._id}`}>
                            <Pencil
                              size={18}
                              className="text-teal-600 hover:scale-110 transition"
                            />
                          </Link>

                          <button
                            onClick={() => handleDelete(a._id)}
                            disabled={deletingId === a._id}
                          >
                            {deletingId === a._id ? (
                              <span className="text-xs text-slate-400">...</span>
                            ) : (
                              <Trash2
                                size={18}
                                className="text-red-500 hover:scale-110 transition"
                              />
                            )}
                          </button>
                        </div>
                      </td>
                    </tr>

                    {/* EXPANDED PROJECTS */}
                    {expandedRows.has(a._id) && (
                      <tr className="bg-slate-50">
                        <td colSpan="5" className="p-6">
                          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {a.projects.map((p, idx) => (
                              <div
                                key={p._id || idx}
                                className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm"
                              >
                                <h4 className="font-semibold text-slate-700">
                                  {p.projectName}
                                </h4>

                                <div className="text-xs text-slate-500 mt-2 space-y-1">
                                  <p>
                                    <span className="font-medium">Start:</span>{" "}
                                    {p.startDate}
                                  </p>
                                  <p>
                                    <span className="font-medium">End:</span>{" "}
                                    {p.endDate}
                                  </p>
                                  <p>
                                    <span className="font-medium">Hours:</span>{" "}
                                    {p.hours}
                                  </p>
                                  <p>
                                    <span className="font-medium">Shift:</span>{" "}
                                    {p.shift}
                                  </p>
                                </div>

                                {p.comment && (
                                  <p className="text-xs mt-2 text-slate-600 italic border-t pt-2">
                                    {p.comment}
                                  </p>
                                )}
                              </div>
                            ))}
                          </div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                ))
              )}
            </tbody>
          </table>

          {/* SERVER-SIDE PAGINATION */}
          {totalPages > 1 && (
            <div className="flex justify-center gap-2 p-6">
              <button
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="px-4 h-10 rounded-xl border hover:bg-slate-100 disabled:opacity-40"
              >
                ‹ Prev
              </button>

              {[...Array(totalPages)].map((_, i) => (
                <button
                  key={i}
                  onClick={() => setCurrentPage(i + 1)}
                  className={`w-10 h-10 rounded-xl border ${
                    currentPage === i + 1
                      ? "bg-teal-600 text-white border-teal-600"
                      : "hover:bg-slate-100"
                  }`}
                >
                  {i + 1}
                </button>
              ))}

              <button
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className="px-4 h-10 rounded-xl border hover:bg-slate-100 disabled:opacity-40"
              >
                Next ›
              </button>
            </div>
          )}
        </div>
      </div>

      {/* EXPORT MODAL */}
      {showExportModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div
            ref={modalRef}
            className="bg-white rounded-3xl p-8 w-full max-w-md space-y-4 shadow-xl"
          >
            <h2 className="text-xl font-bold">Export Sheet</h2>
            <p className="text-sm text-slate-500">
              All records within the date range will be exported.
            </p>

            <div>
              <label className="text-xs font-medium text-slate-600 mb-1 block">
                Start Date
              </label>
              <input
                type="date"
                className="w-full h-11 border rounded-xl px-3"
                value={exportDates.startDate}
                onChange={(e) =>
                  setExportDates({ ...exportDates, startDate: e.target.value })
                }
              />
            </div>

            <div>
              <label className="text-xs font-medium text-slate-600 mb-1 block">
                End Date
              </label>
              <input
                type="date"
                className="w-full h-11 border rounded-xl px-3"
                value={exportDates.endDate}
                onChange={(e) =>
                  setExportDates({ ...exportDates, endDate: e.target.value })
                }
              />
            </div>

            <div className="flex justify-end gap-3 pt-4">
              <button
                onClick={() => setShowExportModal(false)}
                className="px-5 py-2 rounded-xl border"
              >
                Cancel
              </button>

              <button
                onClick={handleExport}
                className="px-5 py-2 rounded-xl bg-teal-600 text-white font-semibold"
              >
                Download
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AssignedWorks;