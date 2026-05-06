import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  TrendingUp, Calendar, Download, RefreshCw, Filter,
  BarChart3, PieChart, Users, Clock, Coffee, Activity,
  AlertCircle, Loader2, ChevronLeft, ChevronRight
} from 'lucide-react';
import { getAuthHeaders, API_BASE_URL } from '../../utils/Auth';
import * as XLSX from 'xlsx';

const WorkSessionReports = () => {
  const [reportData, setReportData] = useState([]);
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  
  // Filters
  const [dateRange, setDateRange] = useState({
    startDate: new Date(new Date().setDate(new Date().getDate() - 30)).toISOString().split("T")[0],
    endDate: new Date().toISOString().split("T")[0]
  });
  const [employeeFilter, setEmployeeFilter] = useState("");
  const [employees, setEmployees] = useState([]);

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const itemsPerPage = 10;

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

  // Fetch report data
  const fetchReport = async () => {
    setRefreshing(true);
    try {
      let url = `${API_BASE_URL}/work-session/admin/report?startDate=${dateRange.startDate}&endDate=${dateRange.endDate}`;
      if (employeeFilter) {
        url += `&employeeId=${employeeFilter}`;
      }
      
      const response = await fetch(url, {
        headers: getAuthHeaders()
      });
      const data = await response.json();
      
      if (data.success) {
        setReportData(data.data);
        calculateSummary(data.data);
        setTotalPages(Math.ceil(data.data.length / itemsPerPage));
      }
    } catch (error) {
      console.error("Error fetching report:", error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchReport();
  }, [dateRange, employeeFilter]);

  const calculateSummary = (data) => {
    const totalEmployees = data.length;
    const totalWorkHours = data.reduce((sum, emp) => sum + (emp.totalWorkMinutes || 0), 0) / 60;
    const totalBreakHours = data.reduce((sum, emp) => sum + (emp.totalBreakMinutes || 0), 0) / 60;
    const totalIdleHours = data.reduce((sum, emp) => sum + (emp.totalIdleMinutes || 0), 0) / 60;
    const totalDaysWorked = data.reduce((sum, emp) => sum + (emp.days?.length || 0), 0);
    
    // Calculate average productivity
    let totalProductivity = 0;
    data.forEach(emp => {
      const totalMinutes = (emp.totalWorkMinutes || 0) + (emp.totalBreakMinutes || 0);
      const productivity = totalMinutes > 0 ? (emp.totalWorkMinutes / totalMinutes) * 100 : 0;
      totalProductivity += productivity;
    });
    const avgProductivity = totalEmployees > 0 ? Math.round(totalProductivity / totalEmployees) : 0;
    
    // Find top performers
    const topPerformers = [...data].sort((a, b) => (b.totalWorkMinutes || 0) - (a.totalWorkMinutes || 0)).slice(0, 5);
    
    setSummary({
      totalEmployees,
      totalWorkHours: totalWorkHours.toFixed(1),
      totalBreakHours: totalBreakHours.toFixed(1),
      totalIdleHours: totalIdleHours.toFixed(1),
      totalDaysWorked,
      avgProductivity,
      topPerformers
    });
  };

  const exportToExcel = () => {
    const exportData = reportData.map(emp => ({
      "Employee ID": emp.employeeId,
      "Employee Name": emp.employeeName,
      "Total Work (Hours)": ((emp.totalWorkMinutes || 0) / 60).toFixed(2),
      "Total Break (Hours)": ((emp.totalBreakMinutes || 0) / 60).toFixed(2),
      "Total Idle (Hours)": ((emp.totalIdleMinutes || 0) / 60).toFixed(2),
      "Days Worked": emp.days?.length || 0,
      "Productivity (%)": emp.days?.length > 0 ? Math.round(((emp.totalWorkMinutes || 0) / ((emp.totalWorkMinutes || 0) + (emp.totalBreakMinutes || 0))) * 100) : 0
    }));

    const ws = XLSX.utils.json_to_sheet(exportData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Work Report");
    XLSX.writeFile(wb, `Work_Report_${dateRange.startDate}_to_${dateRange.endDate}.xlsx`);
  };

  const formatDuration = (minutes) => {
    if (!minutes || minutes === 0) return "0h 0m";
    const hours = Math.floor(minutes / 60);
    const mins = Math.floor(minutes % 60);
    return `${hours}h ${mins}m`;
  };

  const getProductivityColor = (workMinutes, breakMinutes) => {
    const total = workMinutes + breakMinutes;
    if (total === 0) return "bg-gray-200";
    const percentage = (workMinutes / total) * 100;
    if (percentage >= 75) return "bg-emerald-500";
    if (percentage >= 50) return "bg-teal-500";
    if (percentage >= 25) return "bg-amber-500";
    return "bg-red-500";
  };

  const getProductivityPercentage = (workMinutes, breakMinutes) => {
    const total = workMinutes + breakMinutes;
    if (total === 0) return 0;
    return Math.round((workMinutes / total) * 100);
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

  const paginatedData = reportData.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-teal-50/30 py-6 md:py-10 px-4 md:px-6">
      <div className="max-w-7xl mx-auto space-y-6 md:space-y-8">
        
        {/* HEADER */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-slate-800 to-slate-600 bg-clip-text text-transparent">
              Work Session Reports
            </h1>
            <p className="text-slate-500 mt-1 text-sm md:text-base">
              Analytics and productivity insights
            </p>
          </div>
          <div className="flex gap-3">
            <button
              onClick={exportToExcel}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-emerald-200 text-emerald-700 hover:bg-emerald-50/60 font-semibold transition-all text-sm"
            >
              <Download size={16} />
              Export Report
            </button>
            <button
              onClick={fetchReport}
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
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">Employee</label>
              <select
                className="w-full h-11 px-3 border border-slate-200 rounded-xl bg-white/50 text-sm"
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
            </div>
          </div>
        </div>

        {/* SUMMARY CARDS */}
        {summary && (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
            <SummaryCard 
              title="Total Employees" 
              value={summary.totalEmployees} 
              icon={<Users size={18} />} 
              color="teal"
            />
            <SummaryCard 
              title="Total Work Hours" 
              value={summary.totalWorkHours} 
              unit="hrs"
              icon={<Clock size={18} />} 
              color="emerald"
            />
            <SummaryCard 
              title="Total Break Hours" 
              value={summary.totalBreakHours} 
              unit="hrs"
              icon={<Coffee size={18} />} 
              color="blue"
            />
            <SummaryCard 
              title="Avg Productivity" 
              value={summary.avgProductivity} 
              unit="%"
              icon={<TrendingUp size={18} />} 
              color="purple"
            />
            <SummaryCard 
              title="Total Days Worked" 
              value={summary.totalDaysWorked} 
              icon={<Calendar size={18} />} 
              color="amber"
            />
          </div>
        )}

        {/* TOP PERFORMERS SECTION */}
        {summary?.topPerformers?.length > 0 && (
          <div className="bg-white/80 backdrop-blur-xl border border-white/60 rounded-2xl p-5 shadow-lg">
            <h2 className="text-lg font-semibold text-slate-800 mb-4 flex items-center gap-2">
              <TrendingUp size={18} className="text-teal-600" />
              Top Performers
            </h2>
            <div className="space-y-3">
              {summary.topPerformers.map((emp, idx) => {
                const productivity = getProductivityPercentage(emp.totalWorkMinutes, emp.totalBreakMinutes);
                return (
                  <div key={emp.employeeId} className="flex items-center justify-between p-3 bg-slate-50 rounded-xl">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-teal-100 flex items-center justify-center text-teal-700 font-bold">
                        {idx + 1}
                      </div>
                      <div>
                        <p className="font-semibold text-slate-800">{emp.employeeName}</p>
                        <p className="text-xs text-slate-400">{emp.employeeId}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-emerald-600">{formatDuration(emp.totalWorkMinutes)}</p>
                      <p className="text-xs text-slate-400">Productivity: {productivity}%</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* DETAILED REPORT TABLE */}
        <div className="bg-white/80 backdrop-blur-xl border border-white/60 rounded-2xl shadow-lg overflow-hidden">
          <div className="p-4 border-b border-slate-100">
            <h2 className="text-lg font-semibold text-slate-800 flex items-center gap-2">
              <BarChart3 size={18} className="text-teal-600" />
              Detailed Employee Report
            </h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gradient-to-r from-slate-50 to-slate-100/50 text-slate-600">
                <tr>
                  <th className="p-4 text-left font-semibold">#</th>
                  <th className="p-4 text-left font-semibold">Employee</th>
                  <th className="p-4 text-left font-semibold">Total Work</th>
                  <th className="p-4 text-left font-semibold">Total Break</th>
                  <th className="p-4 text-left font-semibold">Total Idle</th>
                  <th className="p-4 text-center font-semibold">Days Worked</th>
                  <th className="p-4 text-left font-semibold">Productivity</th>
                </tr>
              </thead>
              <tbody>
                {paginatedData.length === 0 ? (
                  <tr>
                    <td colSpan="7" className="p-12 text-center text-slate-400">
                      <AlertCircle className="w-10 h-10 mx-auto text-slate-300 mb-2" />
                      <p>No data found for selected criteria</p>
                    </td>
                  </tr>
                ) : (
                  paginatedData.map((emp, index) => {
                    const productivity = getProductivityPercentage(emp.totalWorkMinutes, emp.totalBreakMinutes);
                    return (
                      <tr key={emp.employeeId} className="border-t border-slate-100/60 hover:bg-slate-50/40 transition-colors">
                        <td className="p-4 font-medium text-slate-600">{(currentPage - 1) * itemsPerPage + index + 1}</td>
                        <td className="p-4">
                          <div>
                            <div className="font-semibold text-slate-800">{emp.employeeName}</div>
                            <div className="text-xs text-slate-400">{emp.employeeId}</div>
                          </div>
                        </td>
                        <td className="p-4 font-medium text-emerald-600">{formatDuration(emp.totalWorkMinutes)}</td>
                        <td className="p-4 text-blue-600">{formatDuration(emp.totalBreakMinutes)}</td>
                        <td className="p-4 text-amber-600">{formatDuration(emp.totalIdleMinutes)}</td>
                        <td className="p-4 text-center">{emp.days?.length || 0}</td>
                        <td className="p-4">
                          <div className="flex items-center gap-2">
                            <div className="w-24 bg-gray-200 rounded-full h-2">
                              <div 
                                className={`${getProductivityColor(emp.totalWorkMinutes, emp.totalBreakMinutes)} h-2 rounded-full`} 
                                style={{ width: `${productivity}%` }}
                              />
                            </div>
                            <span className="text-xs font-medium">{productivity}%</span>
                          </div>
                        </td>
                      </tr>
                    );
                  })
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
    </div>
  );
};

// Summary Card Component
const SummaryCard = ({ title, value, unit, icon, color }) => {
  const colors = {
    teal: "from-teal-500 to-teal-600",
    emerald: "from-emerald-500 to-emerald-600",
    blue: "from-blue-500 to-blue-600",
    purple: "from-purple-500 to-purple-600",
    amber: "from-amber-500 to-amber-600"
  };
  return (
    <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-100">
      <div className={`p-2 rounded-xl bg-gradient-to-br ${colors[color]} bg-opacity-10 inline-block mb-2`}>
        {icon}
      </div>
      <p className="text-2xl font-bold text-slate-800">{value}{unit && <span className="text-sm ml-0.5">{unit}</span>}</p>
      <p className="text-xs text-slate-500 mt-1">{title}</p>
    </div>
  );
};

export default WorkSessionReports;