import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Calendar, Search, Filter, Download, RefreshCw, Eye,
  AlertCircle, Loader2, ChevronLeft, ChevronRight,
  Clock, Coffee, Activity, UserCheck, FileText
} from 'lucide-react';
import { getAuthHeaders, API_BASE_URL } from '../../utils/Auth';
import * as XLSX from 'xlsx';

const WorkSessionHistory = () => {
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedSession, setSelectedSession] = useState(null);
  const [showModal, setShowModal] = useState(false);
  
  // Filters
  const [searchTerm, setSearchTerm] = useState("");
  const [employeeFilter, setEmployeeFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [dateRange, setDateRange] = useState({
    startDate: new Date(new Date().setDate(new Date().getDate() - 30)).toISOString().split("T")[0],
    endDate: new Date().toISOString().split("T")[0]
  });
  
  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalRecords, setTotalRecords] = useState(0);
  const itemsPerPage = 10;

  // Employee list for filter dropdown
  const [employees, setEmployees] = useState([]);

  // Fetch employees for filter
  useEffect(() => {
    const fetchEmployees = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/staff/all`, {
          headers: getAuthHeaders()
        });
        const data = await response.json();
        if (data.success) {
          setEmployees(data.data);
        }
      } catch (error) {
        console.error("Error fetching employees:", error);
      }
    };
    fetchEmployees();
  }, []);

  // Fetch sessions
  const fetchSessions = async () => {
    setRefreshing(true);
    try {
      let url = `${API_BASE_URL}/work-session/all-sessions?page=${currentPage}&limit=${itemsPerPage}`;
      
      if (employeeFilter) {
        url += `&employeeId=${employeeFilter}`;
      }
      if (dateRange.startDate && dateRange.endDate) {
        url += `&startDate=${dateRange.startDate}&endDate=${dateRange.endDate}`;
      }
      if (statusFilter) {
        url += `&status=${statusFilter}`;
      }
      
      const response = await fetch(url, {
        headers: getAuthHeaders()
      });
      const data = await response.json();
      
      if (data.success) {
        let sessionList = data.data.sessions || [];
        
        // Apply client-side search if needed
        if (searchTerm) {
          sessionList = sessionList.filter(session => 
            session.employeeName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            session.employeeId?.toLowerCase().includes(searchTerm.toLowerCase())
          );
        }
        
        setSessions(sessionList);
        setTotalPages(data.data.pagination?.pages || 1);
        setTotalRecords(data.data.pagination?.total || sessionList.length);
      }
    } catch (error) {
      console.error("Error fetching sessions:", error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchSessions();
  }, [currentPage, employeeFilter, statusFilter, dateRange]);

  const handleSearch = () => {
    setCurrentPage(1);
    fetchSessions();
  };

  const resetFilters = () => {
    setSearchTerm("");
    setEmployeeFilter("");
    setStatusFilter("");
    setDateRange({
      startDate: new Date(new Date().setDate(new Date().getDate() - 30)).toISOString().split("T")[0],
      endDate: new Date().toISOString().split("T")[0]
    });
    setCurrentPage(1);
    setTimeout(() => fetchSessions(), 100);
  };

  const exportToExcel = () => {
    const exportData = sessions.map(session => ({
      "Employee ID": session.employeeId,
      "Employee Name": session.employeeName,
      "Date": new Date(session.date).toLocaleDateString(),
      "Start Time": session.startTime ? new Date(session.startTime).toLocaleTimeString() : "-",
      "End Time": session.endTime ? new Date(session.endTime).toLocaleTimeString() : "-",
      "Total Work (Hours)": ((session.totalWorkDuration || 0) / 60).toFixed(2),
      "Total Break (Hours)": ((session.totalBreakDuration || 0) / 60).toFixed(2),
      "Total Idle (Hours)": ((session.totalIdleTime || 0) / 60).toFixed(2),
      "Status": session.status
    }));

    const ws = XLSX.utils.json_to_sheet(exportData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Work Sessions");
    XLSX.writeFile(wb, `Work_Sessions_${new Date().toISOString().split("T")[0]}.xlsx`);
  };

  const formatDuration = (minutes) => {
    if (!minutes || minutes === 0) return "0h 0m";
    const hours = Math.floor(minutes / 60);
    const mins = Math.floor(minutes % 60);
    return `${hours}h ${mins}m`;
  };

  const formatDate = (date) => {
    if (!date) return "-";
    return new Date(date).toLocaleDateString("en-IN", { 
      day: "2-digit", 
      month: "short", 
      year: "numeric" 
    });
  };

  const formatTime = (date) => {
    if (!date) return "-";
    return new Date(date).toLocaleTimeString("en-US", { 
      hour: "2-digit", 
      minute: "2-digit" 
    });
  };

  const getStatusBadge = (status) => {
    switch(status) {
      case "completed":
        return <span className="px-2 py-1 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-700">Completed</span>;
      case "working":
        return <span className="px-2 py-1 rounded-full text-xs font-semibold bg-blue-100 text-blue-700">In Progress</span>;
      case "idle":
        return <span className="px-2 py-1 rounded-full text-xs font-semibold bg-amber-100 text-amber-700">Idle</span>;
      case "on_break":
        return <span className="px-2 py-1 rounded-full text-xs font-semibold bg-purple-100 text-purple-700">On Break</span>;
      default:
        return <span className="px-2 py-1 rounded-full text-xs font-semibold bg-gray-100 text-gray-600">{status}</span>;
    }
  };

  if (loading) {
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-teal-50/30 py-6 md:py-10 px-4 md:px-6">
      <div className="max-w-7xl mx-auto space-y-6 md:space-y-8">
        
        {/* HEADER */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-slate-800 to-slate-600 bg-clip-text text-transparent">
              Work Session History
            </h1>
            <p className="text-slate-500 mt-1 text-sm md:text-base">
              View and manage all employee work sessions
              {totalRecords > 0 && (
                <span className="ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-teal-100 text-teal-700">
                  {totalRecords} total
                </span>
              )}
            </p>
          </div>
          <div className="flex gap-3">
            <button
              onClick={exportToExcel}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-emerald-200 text-emerald-700 hover:bg-emerald-50/60 font-semibold transition-all text-sm"
            >
              <Download size={16} />
              Export
            </button>
            <button
              onClick={fetchSessions}
              disabled={refreshing}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 font-semibold transition-all text-sm"
            >
              <RefreshCw size={16} className={refreshing ? "animate-spin" : ""} />
              Refresh
            </button>
          </div>
        </div>

        {/* FILTERS */}
        <div className="bg-white/80 backdrop-blur-xl border border-white/60 rounded-2xl p-4 md:p-6 shadow-lg">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="relative">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Search by employee..."
                className="w-full pl-9 pr-3 h-11 border border-slate-200 rounded-xl bg-white/50 focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 outline-none transition-all text-sm"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            
            <select
              className="h-11 px-3 border border-slate-200 rounded-xl bg-white/50 text-sm"
              value={employeeFilter}
              onChange={(e) => setEmployeeFilter(e.target.value)}
            >
              <option value="">All Employees</option>
              {employees.map(emp => (
                <option key={emp._id} value={emp.employeeId}>
                  {emp.employeeName} ({emp.employeeId})
                </option>
              ))}
            </select>
            
            <select
              className="h-11 px-3 border border-slate-200 rounded-xl bg-white/50 text-sm"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="">All Status</option>
              <option value="completed">Completed</option>
              <option value="working">In Progress</option>
              <option value="idle">Idle</option>
              <option value="on_break">On Break</option>
            </select>
            
            <button
              onClick={resetFilters}
              className="h-11 px-4 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 transition-all text-sm font-medium"
            >
              Clear Filters
            </button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">Start Date</label>
              <input
                type="date"
                className="w-full h-11 px-3 border border-slate-200 rounded-xl bg-white/50 text-sm"
                value={dateRange.startDate}
                onChange={(e) => setDateRange(prev => ({ ...prev, startDate: e.target.value }))}
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">End Date</label>
              <input
                type="date"
                className="w-full h-11 px-3 border border-slate-200 rounded-xl bg-white/50 text-sm"
                value={dateRange.endDate}
                onChange={(e) => setDateRange(prev => ({ ...prev, endDate: e.target.value }))}
              />
            </div>
          </div>
          
          <div className="mt-4 flex justify-end">
            <button
              onClick={handleSearch}
              className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-700 hover:to-emerald-700 text-white font-semibold shadow-md transition-all text-sm"
            >
              Apply Filters
            </button>
          </div>
        </div>

        {/* SESSIONS TABLE */}
        <div className="bg-white/80 backdrop-blur-xl border border-white/60 rounded-2xl shadow-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gradient-to-r from-slate-50 to-slate-100/50 text-slate-600">
                <tr>
                  <th className="p-4 text-left font-semibold">#</th>
                  <th className="p-4 text-left font-semibold">Employee</th>
                  <th className="p-4 text-left font-semibold">Date</th>
                  <th className="p-4 text-left font-semibold">Start Time</th>
                  <th className="p-4 text-left font-semibold">End Time</th>
                  <th className="p-4 text-left font-semibold">Work Duration</th>
                  <th className="p-4 text-left font-semibold">Status</th>
                  <th className="p-4 text-center font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody>
                {sessions.length === 0 ? (
                  <tr>
                    <td colSpan="8" className="p-12 text-center text-slate-400">
                      <AlertCircle className="w-10 h-10 mx-auto text-slate-300 mb-2" />
                      <p>No work sessions found</p>
                    </td>
                  </tr>
                ) : (
                  sessions.map((session, index) => (
                    <tr key={session._id} className="border-t border-slate-100/60 hover:bg-slate-50/40 transition-colors">
                      <td className="p-4 font-medium text-slate-600">{(currentPage - 1) * itemsPerPage + index + 1}</td>
                      <td className="p-4">
                        <div>
                          <div className="font-semibold text-slate-800">{session.employeeName}</div>
                          <div className="text-xs text-slate-400">{session.employeeId}</div>
                        </div>
                      </td>
                      <td className="p-4 text-slate-600">{formatDate(session.date)}</td>
                      <td className="p-4 text-slate-600">{formatTime(session.startTime)}</td>
                      <td className="p-4 text-slate-600">{formatTime(session.endTime)}</td>
                      <td className="p-4 font-medium text-emerald-600">{formatDuration(session.totalWorkDuration)}</td>
                      <td className="p-4">{getStatusBadge(session.status)}</td>
                      <td className="p-4 text-center">
                        <button
                          onClick={() => {
                            setSelectedSession(session);
                            setShowModal(true);
                          }}
                          className="p-2 rounded-lg text-teal-600 hover:bg-teal-50 transition-colors"
                          title="View Details"
                        >
                          <Eye size={18} />
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex justify-center gap-2 p-4 border-t border-slate-100/60">
              <button
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="px-4 h-10 rounded-xl border border-slate-200 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-all text-sm font-medium"
              >
                <ChevronLeft size={16} className="inline mr-1" /> Prev
              </button>
              <span className="px-4 h-10 flex items-center text-sm text-slate-600">
                Page {currentPage} of {totalPages}
              </span>
              <button
                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className="px-4 h-10 rounded-xl border border-slate-200 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-all text-sm font-medium"
              >
                Next <ChevronRight size={16} className="inline ml-1" />
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Session Details Modal */}
      {showModal && selectedSession && (
        <SessionDetailsModal
          session={selectedSession}
          onClose={() => setShowModal(false)}
          formatDate={formatDate}
          formatTime={formatTime}
          formatDuration={formatDuration}
          getStatusBadge={getStatusBadge}
        />
      )}
    </div>
  );
};

// Session Details Modal Component
const SessionDetailsModal = ({ session, onClose, formatDate, formatTime, formatDuration, getStatusBadge }) => {
  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div className="bg-white rounded-3xl w-full max-w-2xl max-h-[85vh] overflow-hidden shadow-2xl" onClick={(e) => e.stopPropagation()}>
        <div className="p-5 border-b border-slate-100 bg-gradient-to-r from-teal-600 to-emerald-600 text-white">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold">Session Details</h2>
              <p className="text-sm opacity-90">{session.employeeName} • {session.employeeId}</p>
            </div>
            <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-white/20 transition-colors">✕</button>
          </div>
        </div>

        <div className="p-6 overflow-y-auto max-h-[calc(85vh-120px)] space-y-5">
          {/* Summary Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <div className="p-3 bg-slate-50 rounded-xl text-center">
              <p className="text-2xl font-bold text-teal-600">{formatDuration(session.totalWorkDuration)}</p>
              <p className="text-xs text-slate-500">Total Work</p>
            </div>
            <div className="p-3 bg-slate-50 rounded-xl text-center">
              <p className="text-2xl font-bold text-blue-600">{formatDuration(session.totalBreakDuration)}</p>
              <p className="text-xs text-slate-500">Break Time</p>
            </div>
            <div className="p-3 bg-slate-50 rounded-xl text-center">
              <p className="text-2xl font-bold text-amber-600">{formatDuration(session.totalIdleTime)}</p>
              <p className="text-xs text-slate-500">Idle Time</p>
            </div>
            <div className="p-3 bg-slate-50 rounded-xl text-center">
              <div className="mb-1">{getStatusBadge(session.status)}</div>
              <p className="text-xs text-slate-500">Status</p>
            </div>
          </div>

          {/* Timeline Details */}
          <div className="border-t border-slate-100 pt-4">
            <h3 className="font-semibold text-slate-800 mb-3 flex items-center gap-2">
              <Clock size={16} /> Timeline
            </h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between py-2 border-b border-slate-100">
                <span className="text-slate-500">Date:</span>
                <span className="font-medium">{formatDate(session.date)}</span>
              </div>
              <div className="flex justify-between py-2 border-b border-slate-100">
                <span className="text-slate-500">Start Time:</span>
                <span className="font-medium">{formatTime(session.startTime)}</span>
              </div>
              <div className="flex justify-between py-2 border-b border-slate-100">
                <span className="text-slate-500">End Time:</span>
                <span className="font-medium">{formatTime(session.endTime) || "In Progress"}</span>
              </div>
              <div className="flex justify-between py-2 border-b border-slate-100">
                <span className="text-slate-500">Created At:</span>
                <span className="font-medium">{new Date(session.createdAt).toLocaleString()}</span>
              </div>
              <div className="flex justify-between py-2">
                <span className="text-slate-500">Last Updated:</span>
                <span className="font-medium">{new Date(session.updatedAt).toLocaleString()}</span>
              </div>
            </div>
          </div>

          {/* Activity Logs */}
          {session.activityLogs && session.activityLogs.length > 0 && (
            <div className="border-t border-slate-100 pt-4">
              <h3 className="font-semibold text-slate-800 mb-3 flex items-center gap-2">
                <Activity size={16} /> Activity Log
              </h3>
              <div className="space-y-2 max-h-48 overflow-y-auto">
                {session.activityLogs.map((log, idx) => (
                  <div key={idx} className="p-2 bg-slate-50 rounded-lg text-xs">
                    <div className="flex justify-between mb-1">
                      <span className="font-semibold text-slate-700">{log.type}</span>
                      <span className="text-slate-400">{new Date(log.timestamp).toLocaleTimeString()}</span>
                    </div>
                    {log.details && <p className="text-slate-500">{log.details}</p>}
                    {log.duration > 0 && <p className="text-slate-400">Duration: {Math.round(log.duration)} min</p>}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default WorkSessionHistory;