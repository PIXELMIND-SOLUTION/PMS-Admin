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

const AssignedWorks = () => {
  const [assignments, setAssignments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedRows, setExpandedRows] = useState(new Set());
  const [deletingId, setDeletingId] = useState(null);

  const [searchTerm, setSearchTerm] = useState("");
  const [sheetFilter, setSheetFilter] = useState("");
  const [projectFilter, setProjectFilter] = useState("");

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6;

  const [showExportModal, setShowExportModal] = useState(false);
  const [exportDates, setExportDates] = useState({
    startDate: "",
    endDate: "",
  });

  const modalRef = useRef(null);

  /* ---------------- FETCH ---------------- */

  useEffect(() => {
    fetchAssignments();
  }, []);

  const fetchAssignments = async () => {
    try {
      const res = await fetch(
        "http://31.97.206.144:5000/api/all_assign_projects"
      );
      const data = await res.json();
      if (data.success) setAssignments(data.data);
    } catch {
      console.log("Fetch error");
    } finally {
      setLoading(false);
    }
  };

  /* ---------------- DELETE ---------------- */

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this assignment?")) return;

    setDeletingId(id);

    try {
      await fetch(
        `http://31.97.206.144:5000/api/delete_assign_project/${id}`,
        { method: "DELETE" }
      );

      setAssignments((prev) => prev.filter((a) => a._id !== id));
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

  /* ---------------- FILTER ---------------- */

  const allProjects = [
    ...new Set(assignments.flatMap((a) => a.projects.map((p) => p.projectName))),
  ];

  const filteredAssignments = assignments.filter((a) => {
    const matchesSearch =
      a.empId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      a.employName.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesSheet = sheetFilter ? a.sheet === sheetFilter : true;

    const matchesProject = projectFilter
      ? a.projects.some((p) => p.projectName === projectFilter)
      : true;

    return matchesSearch && matchesSheet && matchesProject;
  });

  /* ---------------- PAGINATION ---------------- */

  const totalPages = Math.ceil(filteredAssignments.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;

  const paginatedAssignments = filteredAssignments.slice(
    startIndex,
    startIndex + itemsPerPage
  );

  /* ---------------- EXPORT ---------------- */

  const handleExport = () => {
    if (!exportDates.startDate || !exportDates.endDate)
      return alert("Select dates");

    const rows = [];

    assignments.forEach((a) => {
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

    const ws = XLSX.utils.json_to_sheet(rows);
    const wb = XLSX.utils.book_new();

    XLSX.utils.book_append_sheet(wb, ws, "Assignments");

    XLSX.writeFile(
      wb,
      `AssignedWorks_${exportDates.startDate}.xlsx`
    );

    setShowExportModal(false);
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
            <Search
              size={16}
              className="absolute top-3 left-3 text-slate-400"
            />
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
            onChange={(e) => setSheetFilter(e.target.value)}
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
            onChange={(e) => setProjectFilter(e.target.value)}
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
              {paginatedAssignments.map((a, i) => (
                <React.Fragment key={a._id}>
                  <tr className="border-t hover:bg-slate-50 transition">
                    <td className="p-4">{startIndex + i + 1}</td>

                    <td className="p-4">
                      <div className="font-semibold text-slate-700">
                        {a.employName}
                      </div>
                      <div className="text-xs text-slate-400">
                        {a.empId}
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
                        {a.projects.length} Projects
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

                        <button onClick={() => handleDelete(a._id)}>
                          <Trash2
                            size={18}
                            className="text-red-500 hover:scale-110 transition"
                          />
                        </button>
                      </div>
                    </td>
                  </tr>

                  {/* EXPANDED */}

                  {expandedRows.has(a._id) && (
                    <tr className="bg-slate-50">
                      <td colSpan="5" className="p-6">
                        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                          {a.projects.map((p, idx) => (
                            <div
                              key={idx}
                              className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm"
                            >
                              <h4 className="font-semibold text-slate-700">
                                {p.projectName}
                              </h4>

                              <div className="text-xs text-slate-500 mt-2 space-y-1">
                                <p>Start: {p.startDate}</p>
                                <p>End: {p.endDate}</p>
                                <p>Hours: {p.hours}</p>
                                <p>Shift: {p.shift}</p>
                              </div>

                              {p.comment && (
                                <p className="text-xs mt-2 text-slate-600">
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
              ))}
            </tbody>
          </table>

          {/* PAGINATION */}

          {totalPages > 1 && (
            <div className="flex justify-center gap-2 p-6">
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

            <input
              type="date"
              className="w-full h-11 border rounded-xl px-3"
              value={exportDates.startDate}
              onChange={(e) =>
                setExportDates({
                  ...exportDates,
                  startDate: e.target.value,
                })
              }
            />

            <input
              type="date"
              className="w-full h-11 border rounded-xl px-3"
              value={exportDates.endDate}
              onChange={(e) =>
                setExportDates({
                  ...exportDates,
                  endDate: e.target.value,
                })
              }
            />

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
