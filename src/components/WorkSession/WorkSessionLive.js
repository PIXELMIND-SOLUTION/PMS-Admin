// WorkSessionLive.js
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Users, UserCheck, Coffee, Clock, TrendingUp, Calendar,
  Search, Filter, Download, RefreshCw, Eye, ChevronRight,
  Activity, PieChart, BarChart3, AlertCircle, Loader2,
  PlayCircle, PauseCircle, StopCircle, Coffee as CoffeeIcon
} from 'lucide-react';
import { getAuthHeaders, API_BASE_URL } from '../../utils/Auth';

const WorkSessionLive = () => {
  const [activeEmployees, setActiveEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  useEffect(() => {
    console.log("✅ WorkSessionLive component mounted");
    console.log("Current path:", window.location.pathname);
  }, []);

  // const fetchActiveEmployees = async () => {
  //   setRefreshing(true);
  //   try {
  //     const response = await fetch(`${API_BASE_URL}/work-session/active-employees`, {
  //       headers: getAuthHeaders()
  //     });
  //     const data = await response.json();
  //     if (data.success) {
  //       setActiveEmployees(data.data);
  //     }
  //   } catch (error) {
  //     console.error("Error fetching active employees:", error);
  //   } finally {
  //     setLoading(false);
  //     setRefreshing(false);
  //   }
  // };

  const fetchActiveEmployees = async () => {
  setRefreshing(true);
  try {
    console.log("📡 Fetching active employees...");
    const response = await fetch(`${API_BASE_URL}/work-session/active-employees`, {
      headers: getAuthHeaders()
    });
    const data = await response.json();
    console.log("📡 API Response:", data);
    console.log("📡 Success:", data.success);
    console.log("📡 Data received:", data.data);
    console.log("📡 Number of active employees:", data.data?.length);
    
    if (data.success) {
      setActiveEmployees(data.data);
      
      // Log each employee details
      if (data.data && data.data.length > 0) {
        data.data.forEach((emp, index) => {
          console.log(`Employee ${index + 1}:`, {
            name: emp.employeeName,
            id: emp.employeeId,
            status: emp.status,
            workDuration: emp.currentWorkDuration
          });
        });
      } else {
        console.log("⚠️ No active employees found");
      }
    } else {
      console.error("❌ API returned success=false:", data.message);
    }
  } catch (error) {
    console.error("❌ Error fetching active employees:", error);
  } finally {
    setLoading(false);
    setRefreshing(false);
  }
};

  useEffect(() => {
    fetchActiveEmployees();
    // Auto-refresh every 15 seconds
    const interval = setInterval(fetchActiveEmployees, 15000);
    return () => clearInterval(interval);
  }, []);

  // Filter employees
  const filteredEmployees = activeEmployees.filter(emp => {
    const matchesSearch = emp.employeeName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         emp.employeeId?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === "all" || emp.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const getStatusInfo = (status) => {
    switch(status) {
      case "working": 
        return { 
          color: "bg-emerald-100 text-emerald-700", 
          icon: <PlayCircle size={14} />, 
          label: "Working",
          borderColor: "border-emerald-200"
        };
      case "idle": 
        return { 
          color: "bg-amber-100 text-amber-700", 
          icon: <PauseCircle size={14} />, 
          label: "Idle",
          borderColor: "border-amber-200"
        };
      case "on_break": 
        return { 
          color: "bg-blue-100 text-blue-700", 
          icon: <CoffeeIcon size={14} />, 
          label: "On Break",
          borderColor: "border-blue-200"
        };
      default: 
        return { 
          color: "bg-gray-100 text-gray-500", 
          icon: <StopCircle size={14} />, 
          label: "Inactive",
          borderColor: "border-gray-200"
        };
    }
  };

  const formatDuration = (minutes) => {
    if (!minutes || minutes === 0) return "0h 0m";
    const hours = Math.floor(minutes / 60);
    const mins = Math.floor(minutes % 60);
    return `${hours}h ${mins}m`;
  };

  const stats = {
    totalActive: activeEmployees.length,
    working: activeEmployees.filter(e => e.status === "working").length,
    idle: activeEmployees.filter(e => e.status === "idle").length,
    onBreak: activeEmployees.filter(e => e.status === "on_break").length
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
              Live Work Session
            </h1>
            <p className="text-slate-500 mt-1 text-sm md:text-base">
              Real-time employee work activity tracking
            </p>
          </div>
          <div className="flex gap-3">
            <button
              onClick={fetchActiveEmployees}
              disabled={refreshing}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 font-semibold transition-all text-sm"
            >
              <RefreshCw size={16} className={refreshing ? "animate-spin" : ""} />
              Refresh
            </button>
          </div>
        </div>

        {/* STATS CARDS */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <StatCard title="Active Employees" value={stats.totalActive} icon={<Users size={18} />} color="teal" />
          <StatCard title="Working Now" value={stats.working} icon={<Activity size={18} />} color="emerald" />
          <StatCard title="On Break" value={stats.onBreak} icon={<Coffee size={18} />} color="blue" />
          <StatCard title="Idle" value={stats.idle} icon={<PauseCircle size={18} />} color="amber" />
        </div>

        {/* FILTERS */}
        <div className="bg-white/80 backdrop-blur-xl border border-white/60 rounded-2xl p-4 shadow-lg">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Search by name or ID..."
                className="w-full pl-9 pr-3 h-11 border border-slate-200 rounded-xl bg-white/50 focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 outline-none transition-all text-sm"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <select
              className="h-11 px-3 border border-slate-200 rounded-xl bg-white/50 text-sm"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="all">All Status</option>
              <option value="working">Working</option>
              <option value="idle">Idle</option>
              <option value="on_break">On Break</option>
            </select>
          </div>
        </div>

        {/* ACTIVE EMPLOYEES LIST */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 md:gap-4">
          {filteredEmployees.length === 0 ? (
            <div className="col-span-full bg-white/80 backdrop-blur-xl border border-white/60 rounded-2xl p-8 md:p-12 text-center">
              <AlertCircle className="w-10 h-10 md:w-12 md:h-12 mx-auto text-slate-300 mb-2 md:mb-3" />
              <p className="text-slate-500 text-sm md:text-base">No active employees found</p>
            </div>
          ) : (
            filteredEmployees.map((emp) => {
              const statusInfo = getStatusInfo(emp.status);
              return (
                <div key={emp.employeeId} className={`bg-white rounded-xl md:rounded-2xl border ${statusInfo.borderColor} p-3 md:p-5 shadow-sm hover:shadow-md transition-all`}>
                  <div className="flex items-start justify-between mb-3 md:mb-4">
                    <div className="flex items-center gap-2 md:gap-3 min-w-0 flex-1">
                      {emp.profileImage ? (
                        <img src={emp.profileImage} alt={emp.employeeName} className="w-10 h-10 md:w-12 md:h-12 rounded-full object-cover flex-shrink-0" />
                      ) : (
                        <div className="w-10 h-10 md:w-12 md:h-12 rounded-full bg-gradient-to-br from-teal-400 to-teal-600 flex items-center justify-center text-white font-bold text-base md:text-lg flex-shrink-0">
                          {emp.employeeName?.charAt(0)}
                        </div>
                      )}
                      <div className="min-w-0 flex-1">
                        <h3 className="font-semibold text-slate-800 text-sm md:text-base truncate">{emp.employeeName}</h3>
                        <p className="text-xs text-slate-400 truncate">{emp.employeeId}</p>
                      </div>
                    </div>
                    <span className={`inline-flex items-center gap-1 px-2 py-0.5 md:px-2.5 md:py-1 rounded-full text-xs font-semibold ${statusInfo.color} flex-shrink-0 ml-2`}>
                      <span className="hidden sm:inline">{statusInfo.icon}</span>
                      <span className="sm:hidden">{statusInfo.iconMobile || statusInfo.icon}</span>
                      <span className="text-[11px] md:text-xs">{statusInfo.label}</span>
                    </span>
                  </div>

                  <div className="space-y-1.5 md:space-y-2 text-xs md:text-sm">
                    <div className="flex justify-between items-center">
                      <span className="text-slate-500">Work Duration:</span>
                      <span className="font-semibold text-slate-700">{formatDuration(emp.currentWorkDuration)}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-slate-500">Break Time:</span>
                      <span className="font-semibold text-slate-700">{formatDuration(emp.totalBreakDuration)}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-slate-500">Started At:</span>
                      <span className="font-semibold text-slate-700 text-xs md:text-sm">
                        {emp.startTime ? new Date(emp.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : "-"}
                      </span>
                    </div>
                    {emp.breakInfo && (
                      <div className="mt-2 p-1.5 md:p-2 bg-blue-50 rounded-lg">
                        <p className="text-[11px] md:text-xs text-blue-600">
                          ⏰ {emp.breakInfo.breakType} break - {emp.breakInfo.remainingMinutes} min left
                        </p>
                      </div>
                    )}
                    {emp.isIdle && (
                      <div className="mt-2 p-1.5 md:p-2 bg-amber-50 rounded-lg">
                        <p className="text-[11px] md:text-xs text-amber-600">
                          💤 Idle since {emp.lastActiveTime ? new Date(emp.lastActiveTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : "unknown"}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};

const StatCard = ({ title, value, icon, color }) => {
  const colors = {
    teal: "from-teal-500 to-teal-600",
    emerald: "from-emerald-500 to-emerald-600", 
    blue: "from-blue-500 to-blue-600",
    amber: "from-amber-500 to-amber-600"
  };
  return (
    <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100">
      <div className={`p-2 rounded-xl bg-gradient-to-br ${colors[color]} bg-opacity-10 inline-block mb-3`}>
        {icon}
      </div>
      <p className="text-2xl font-bold text-slate-800">{value}</p>
      <p className="text-sm text-slate-500 mt-1">{title}</p>
    </div>
  );
};

export default WorkSessionLive;