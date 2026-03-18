import React, { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { Pencil, Trash2, ChevronDown, ChevronUp, Plus, Download, Search, Loader2, AlertCircle } from "lucide-react";
import * as XLSX from "xlsx";
import { getAuthHeaders, API_BASE } from "../../utils/Auth";

const AssignedWorks = () => {
  const [assignments, setAssignments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedRows, setExpandedRows] = useState(new Set());
  const [deletingId, setDeletingId] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [sheetFilter, setSheetFilter] = useState("");
  const [projectFilter, setProjectFilter] = useState("");
  
  // Server-side pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalRecords, setTotalRecords] = useState(0);
  const itemsPerPage = 10;

  const [showExportModal, setShowExportModal] = useState(false);
  const [exportDates, setExportDates] = useState({ startDate: "", endDate: "" });
  const modalRef = useRef(null);

  /* ---------------- FETCH ---------------- */
  useEffect(() => {
    fetchAssignments(currentPage);
  }, [currentPage]);

  const fetchAssignments = async (page = 1) => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: itemsPerPage.toString(),
        ...(searchTerm && { search: searchTerm }),
        ...(sheetFilter && { sheet: sheetFilter }),
        ...(projectFilter && { project: projectFilter }),
      });

      const res = await fetch(`${API_BASE}/worksheets?${params}`, { headers: getAuthHeaders() });
      const data = await res.json();
      
      if (data.success) {
        setAssignments(data.data);
        setTotalPages(data.pagination.pages);
        setTotalRecords(data.pagination.total);
      }
    } catch (err) {
      console.error("Fetch error:", err);
    } finally {
      setLoading(false);
    }
  };

  /* ---------------- DELETE ---------------- */
  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this worksheet?")) return;
    setDeletingId(id);
    try {
      const res = await fetch(`${API_BASE}/worksheets/${id}`, {
        method: "DELETE",
        headers: getAuthHeaders(),
      });
      const data = await res.json();
      
      if (data.success) {
        setAssignments((prev) => prev.filter((a) => a._id !== id));
        setTotalRecords((prev) => Math.max(0, prev - 1));
      } else {
        alert(data.message || "Delete failed");
      }
    } catch (err) {
      console.error("Delete error:", err);
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

  /* ---------------- CLIENT-SIDE FILTER ---------------- */
  const allProjects = [...new Set(assignments.flatMap((a) => a.projects?.map((p) => p.projectName) || []))];
  
  const filteredAssignments = assignments.filter((a) => {
    const matchesSearch = (a.empId?.toString() || "").toLowerCase().includes(searchTerm.toLowerCase()) || a.employName?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesSheet = sheetFilter ? a.sheet === sheetFilter : true;
    const matchesProject = projectFilter ? a.projects?.some((p) => p.projectName === projectFilter) : true;
    return matchesSearch && matchesSheet && matchesProject;
  });

  /* ---------------- EXPORT ---------------- */
  const handleExport = async () => {
    if (!exportDates.startDate || !exportDates.endDate) return alert("Select both start and end dates");
    try {
      const res = await fetch(`${API_BASE}/worksheets?limit=1000`, { headers: getAuthHeaders() });
      const data = await res.json();
      if (!data.success) return alert("Failed to fetch data for export");

      const rows = [];
      data.data.forEach((a) => {
        a.projects?.forEach((p) => {
          const s = new Date(p.startDate);
          const e = new Date(p.endDate);
          if (s <= new Date(exportDates.endDate) && e >= new Date(exportDates.startDate)) {
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
    } catch (err) {
      console.error("Export error:", err);
      alert("Export failed");
    }
  };

  /* ---------------- LOADING ---------------- */
  if (loading && assignments.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-teal-50/30 flex items-center justify-center p-4">
        <div className="text-center space-y-4 animate-pulse">
          <div className="w-16 h-16 mx-auto rounded-2xl bg-teal-100/60" />
          <div className="h-4 w-48 mx-auto rounded bg-slate-200" />
          <div className="h-3 w-64 mx-auto rounded bg-slate-100" />
        </div>
      </div>
    );
  }

  /* ================================================= */
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-teal-50/30 py-6 md:py-10 px-4 md:px-6">
      <div className="max-w-7xl mx-auto space-y-6 md:space-y-8">
        
        {/* HEADER */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-slate-800 to-slate-600 bg-clip-text text-transparent">
              Assigned Works
            </h1>
            <p className="text-slate-500 mt-1 text-sm md:text-base">
              Manage employee project assignments
              {totalRecords > 0 && (
                <span className="ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-teal-100 text-teal-700">
                  {totalRecords} total
                </span>
              )}
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <button
              onClick={() => setShowExportModal(true)}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-emerald-200 text-emerald-700 hover:bg-emerald-50/60 font-semibold transition-all text-sm"
            >
              <Download size={16} />
              <span className="hidden sm:inline">Export</span>
            </button>
            <Link
              to="/add-worksheet"
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-700 hover:to-emerald-700 text-white font-semibold shadow-lg shadow-teal-500/25 hover:shadow-teal-500/40 transition-all text-sm"
            >
              <Plus size={16} />
              <span className="hidden sm:inline">Add Worksheet</span>
            </Link>
          </div>
        </div>

        {/* FILTERS - Responsive Grid */}
        <div className="bg-white/80 backdrop-blur-xl border border-white/60 rounded-2xl p-4 md:p-6 shadow-lg shadow-slate-200/30">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Search */}
            <div className="relative sm:col-span-2 lg:col-span-1">
              <Search size={16} className="absolute top-3.5 left-3 text-slate-400" />
              <input
                placeholder="Search employee..."
                className="w-full pl-9 pr-3 h-11 border border-slate-200 rounded-xl bg-white/50 focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 outline-none transition-all text-sm"
                value={searchTerm}
                onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
              />
            </div>
            {/* Sheet Filter */}
            <select
              className="h-11 px-3 border border-slate-200 rounded-xl bg-white/50 focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 outline-none transition-all text-sm"
              value={sheetFilter}
              onChange={(e) => { setSheetFilter(e.target.value); setCurrentPage(1); }}
            >
              <option value="">All Sheets</option>
              <option>frontend</option>
              <option>backend</option>
              <option>testing</option>
              <option>design</option>
              <option>Full Stack</option>
              <option>Digital Marketing</option>
            </select>
            {/* Project Filter */}
            <select
              className="h-11 px-3 border border-slate-200 rounded-xl bg-white/50 focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 outline-none transition-all text-sm"
              value={projectFilter}
              onChange={(e) => { setProjectFilter(e.target.value); setCurrentPage(1); }}
            >
              <option value="">All Projects</option>
              {allProjects.map((p) => <option key={p}>{p}</option>)}
            </select>
            {/* Clear Filters */}
            {(searchTerm || sheetFilter || projectFilter) && (
              <button
                onClick={() => { setSearchTerm(""); setSheetFilter(""); setProjectFilter(""); setCurrentPage(1); }}
                className="h-11 px-4 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 transition-all text-sm font-medium"
              >
                Clear
              </button>
            )}
          </div>
        </div>

        {/* TABLE CARD */}
        <div className="bg-white/80 backdrop-blur-xl border border-white/60 rounded-2xl shadow-lg shadow-slate-200/30 overflow-hidden">
          {/* Desktop Table */}
          <div className="hidden md:block overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gradient-to-r from-slate-50 to-slate-100/50 text-slate-600">
                <tr>
                  <th className="p-4 text-left font-semibold">#</th>
                  <th className="p-4 text-left font-semibold">Employee</th>
                  <th className="p-4 text-center font-semibold">Sheet</th>
                  <th className="p-4 text-center font-semibold">Projects</th>
                  <th className="p-4 text-right font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredAssignments.length === 0 ? (
                  <tr>
                    <td colSpan="5" className="p-12 text-center text-slate-400">
                      <div className="flex flex-col items-center gap-3">
                        <AlertCircle className="w-10 h-10 text-slate-300" />
                        <p>No assignments found matching your filters.</p>
                        <button onClick={() => { setSearchTerm(""); setSheetFilter(""); setProjectFilter(""); }} className="text-teal-600 hover:text-teal-700 font-medium text-sm">Clear filters</button>
                      </div>
                    </td>
                  </tr>
                ) : (
                  filteredAssignments.map((a, i) => (
                    <React.Fragment key={a._id}>
                      <tr className="border-t border-slate-100/60 hover:bg-slate-50/40 transition-colors">
                        <td className="p-4 font-medium text-slate-600">{(currentPage - 1) * itemsPerPage + i + 1}</td>
                        <td className="p-4">
                          <div className="font-semibold text-slate-800">{a.employName}</div>
                          <div className="text-xs text-slate-400 mt-0.5">ID: {typeof a.empId === "string" ? a.empId.slice(-6).toUpperCase() : a.empId}</div>
                        </td>
                        <td className="p-4 text-center">
                          <span className="inline-flex px-3 py-1 text-xs rounded-full bg-gradient-to-r from-teal-50 to-emerald-50 text-teal-700 font-semibold border border-teal-100">
                            {a.sheet}
                          </span>
                        </td>
                        <td className="p-4 text-center">
                          <button onClick={() => toggleExpand(a._id)} className="inline-flex items-center gap-1 text-teal-600 font-semibold hover:text-teal-700 transition-colors">
                            {a.projects?.length || 0} Project{(a.projects?.length || 0) !== 1 ? "s" : ""}
                            {expandedRows.has(a._id) ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                          </button>
                        </td>
                        <td className="p-4">
                          <div className="flex justify-end gap-3">
                            <Link to={`/edit-worksheet/${a._id}`} className="p-2 rounded-xl text-teal-600 hover:bg-teal-50 hover:scale-105 transition-all">
                              <Pencil size={18} />
                            </Link>
                            <button onClick={() => handleDelete(a._id)} disabled={deletingId === a._id} className="p-2 rounded-xl text-red-500 hover:bg-red-50 hover:scale-105 transition-all disabled:opacity-50">
                              {deletingId === a._id ? <Loader2 className="animate-spin" size={18} /> : <Trash2 size={18} />}
                            </button>
                          </div>
                        </td>
                      </tr>
                      {/* Expanded Projects */}
                      {expandedRows.has(a._id) && (
                        <tr className="bg-gradient-to-br from-slate-50/60 to-white/30">
                          <td colSpan="5" className="p-6">
                            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                              {a.projects?.map((p, idx) => (
                                <div key={p._id || idx} className="bg-white border border-slate-200/60 rounded-2xl p-4 shadow-sm hover:shadow-md transition-shadow">
                                  <h4 className="font-semibold text-slate-800">{p.projectName}</h4>
                                  <div className="text-xs text-slate-500 mt-3 space-y-1.5">
                                    <p><span className="font-medium text-slate-600">Start:</span> {p.startDate}</p>
                                    <p><span className="font-medium text-slate-600">End:</span> {p.endDate}</p>
                                    <p><span className="font-medium text-slate-600">Hours:</span> {p.hours}</p>
                                    <p><span className="font-medium text-slate-600">Shift:</span> <span className="capitalize">{p.shift}</span></p>
                                  </div>
                                  {p.comment && <p className="text-xs mt-3 pt-3 border-t border-slate-100 text-slate-600 italic">"{p.comment}"</p>}
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
          </div>

          {/* Mobile Cards */}
          <div className="md:hidden divide-y divide-slate-100/60">
            {filteredAssignments.length === 0 ? (
              <div className="p-8 text-center text-slate-400">
                <AlertCircle className="w-10 h-10 mx-auto text-slate-300 mb-3" />
                <p className="text-sm">No assignments found</p>
              </div>
            ) : (
              filteredAssignments.map((a, i) => (
                <div key={a._id} className="p-4 space-y-4">
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="font-semibold text-slate-800">{a.employName}</div>
                      <div className="text-xs text-slate-400 mt-0.5">ID: {typeof a.empId === "string" ? a.empId.slice(-6).toUpperCase() : a.empId}</div>
                    </div>
                    <span className="px-2.5 py-1 text-xs rounded-full bg-gradient-to-r from-teal-50 to-emerald-50 text-teal-700 font-semibold border border-teal-100">
                      {a.sheet}
                    </span>
                  </div>
                  
                  <button onClick={() => toggleExpand(a._id)} className="w-full flex items-center justify-between p-3 rounded-xl bg-slate-50/60 hover:bg-slate-100/60 transition-colors">
                    <span className="text-sm font-medium text-slate-700">{a.projects?.length || 0} Project{(a.projects?.length || 0) !== 1 ? "s" : ""}</span>
                    {expandedRows.has(a._id) ? <ChevronUp size={16} className="text-slate-400" /> : <ChevronDown size={16} className="text-slate-400" />}
                  </button>

                  {expandedRows.has(a._id) && (
                    <div className="space-y-3 pt-2">
                      {a.projects?.map((p, idx) => (
                        <div key={p._id || idx} className="p-3 rounded-xl bg-white border border-slate-200/60 space-y-2">
                          <div className="font-medium text-slate-800 text-sm">{p.projectName}</div>
                          <div className="grid grid-cols-2 gap-2 text-xs text-slate-500">
                            <p><span className="text-slate-400">Start:</span> {p.startDate}</p>
                            <p><span className="text-slate-400">End:</span> {p.endDate}</p>
                            <p><span className="text-slate-400">Hours:</span> {p.hours}</p>
                            <p><span className="text-slate-400">Shift:</span> <span className="capitalize">{p.shift}</span></p>
                          </div>
                          {p.comment && <p className="text-xs text-slate-600 italic pt-2 border-t border-slate-100">"{p.comment}"</p>}
                        </div>
                      ))}
                    </div>
                  )}

                  <div className="flex justify-end gap-3 pt-2">
                    <Link to={`/edit-worksheet/${a._id}`} className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-teal-600 hover:bg-teal-50 text-sm font-medium transition-colors">
                      <Pencil size={14} /> Edit
                    </Link>
                    <button onClick={() => handleDelete(a._id)} disabled={deletingId === a._id} className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-red-500 hover:bg-red-50 text-sm font-medium transition-colors disabled:opacity-50">
                      {deletingId === a._id ? <Loader2 className="animate-spin" size={14} /> : <Trash2 size={14} />} Delete
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex justify-center gap-2 p-4 md:p-6 border-t border-slate-100/60">
              <button onClick={() => setCurrentPage((p) => Math.max(1, p - 1))} disabled={currentPage === 1} className="px-4 h-10 rounded-xl border border-slate-200 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-all text-sm font-medium">‹ Prev</button>
              {[...Array(Math.min(5, totalPages))].map((_, i) => {
                const pageNum = currentPage <= 3 ? i + 1 : currentPage - 2 + i;
                if (pageNum > totalPages) return null;
                return (
                  <button key={pageNum} onClick={() => setCurrentPage(pageNum)} className={`w-10 h-10 rounded-xl border transition-all text-sm font-medium ${currentPage === pageNum ? "bg-gradient-to-r from-teal-600 to-emerald-600 text-white border-transparent shadow-lg shadow-teal-500/25" : "border-slate-200 hover:bg-slate-50"}`}>
                    {pageNum}
                  </button>
                );
              })}
              <button onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages} className="px-4 h-10 rounded-xl border border-slate-200 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-all text-sm font-medium">Next ›</button>
            </div>
          )}
        </div>
      </div>

      {/* EXPORT MODAL - Premium */}
      {showExportModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={(e) => e.target === e.currentTarget && setShowExportModal(false)}>
          <div ref={modalRef} className="bg-white rounded-3xl p-6 md:p-8 w-full max-w-md space-y-5 shadow-2xl shadow-black/20 animate-in zoom-in-95">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600">
                <Download className="text-white" size={20} />
              </div>
              <h2 className="text-xl font-bold text-slate-800">Export Data</h2>
            </div>
            <p className="text-sm text-slate-500">Select a date range to export worksheet assignments.</p>
            
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wide mb-2">Start Date</label>
                <input type="date" className="w-full h-12 px-4 border border-slate-200 rounded-xl focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 outline-none transition-all" value={exportDates.startDate} onChange={(e) => setExportDates({ ...exportDates, startDate: e.target.value })} />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wide mb-2">End Date</label>
                <input type="date" className="w-full h-12 px-4 border border-slate-200 rounded-xl focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 outline-none transition-all" value={exportDates.endDate} onChange={(e) => setExportDates({ ...exportDates, endDate: e.target.value })} />
              </div>
            </div>
            
            <div className="flex justify-end gap-3 pt-4">
              <button onClick={() => setShowExportModal(false)} className="px-5 py-2.5 rounded-xl border border-slate-200 text-slate-700 font-semibold hover:bg-slate-50 transition-all">Cancel</button>
              <button onClick={handleExport} className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-700 hover:to-emerald-700 text-white font-semibold shadow-lg shadow-teal-500/25 transition-all">Download</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AssignedWorks;