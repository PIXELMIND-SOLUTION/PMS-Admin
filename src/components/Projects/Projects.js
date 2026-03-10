import React, { useState, useEffect, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { MdEdit, MdDelete, MdVisibility, MdDownload, MdRefresh, MdAdd } from 'react-icons/md';
import { FaMobileAlt, FaEnvelope, FaSearch, FaFilter, FaFolderOpen } from 'react-icons/fa';
import * as XLSX from 'xlsx';

const API_URL = 'https://pms-backend-t3ox.onrender.com/api/projects';
const adminDetails = JSON.parse(sessionStorage.getItem('adminDetails'));
const AUTH_TOKEN = adminDetails?.token;

const headers = () => ({
  Authorization: `Bearer ${AUTH_TOKEN}`,
  'Content-Type': 'application/json',
});

const Projects = () => {
  const navigate = useNavigate();

  const [projects,    setProjects]    = useState([]);
  const [loading,     setLoading]     = useState(true);
  const [error,       setError]       = useState(null);
  const [deleteId,    setDeleteId]    = useState(null);
  const [toastMsg,    setToastMsg]    = useState(null);

  /* filters */
  const [search,          setSearch]          = useState('');
  const [categoryFilter,  setCategoryFilter]  = useState('');
  const [statusFilter,    setStatusFilter]    = useState('');
  const [currentPage,     setCurrentPage]     = useState(1);
  const [itemsPerPage,    setItemsPerPage]    = useState(10);

  /* ── FETCH ── */
  const fetchProjects = async () => {
    setLoading(true);
    setError(null);
    try {
      const res  = await fetch(API_URL, { headers: headers() });
      const data = await res.json();
      if (data.success) {
        setProjects(Array.isArray(data.data) ? data.data : []);
      } else {
        throw new Error(data.message || 'Failed to load projects');
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchProjects(); }, []);

  /* ── TOAST ── */
  const showToast = (type, message) => {
    setToastMsg({ type, message });
    setTimeout(() => setToastMsg(null), 3500);
  };

  /* ── DELETE ── */
  const handleDelete = async (id) => {
    try {
      const res  = await fetch(`${API_URL}/${id}`, { method: 'DELETE', headers: headers() });
      const data = await res.json();
      if (data.success) {
        setProjects(prev => prev.filter(p => p._id !== id));
        showToast('success', 'Project deleted successfully');
      } else {
        showToast('error', data.message || 'Delete failed');
      }
    } catch {
      showToast('error', 'Network error while deleting');
    } finally {
      setDeleteId(null);
    }
  };

  /* ── STATUS CHANGE ── */
  const handleStatusChange = async (id, newStatus) => {
    const prev = projects.find(p => p._id === id);
    setProjects(ps => ps.map(p => p._id === id ? { ...p, status: newStatus } : p));
    try {
      const res  = await fetch(`${API_URL}/${id}`, {
        method: 'PUT',
        headers: headers(),
        body: JSON.stringify({ ...prev, status: newStatus }),
      });
      const data = await res.json();
      if (!data.success) {
        setProjects(ps => ps.map(p => p._id === id ? prev : p));
        showToast('error', 'Status update failed');
      }
    } catch {
      setProjects(ps => ps.map(p => p._id === id ? prev : p));
      showToast('error', 'Network error');
    }
  };

  /* ── FILTER ── */
  const filtered = useMemo(() => {
    const s = search.toLowerCase();
    return projects.filter(p => {
      const matchSearch =
        p.projectName?.toLowerCase().includes(s) ||
        p.clientName?.toLowerCase().includes(s) ||
        p.projectId?.toLowerCase().includes(s) ||
        p.clientEmail?.toLowerCase().includes(s);
      const matchCat    = categoryFilter ? p.category === categoryFilter : true;
      const matchStatus = statusFilter   ? p.status   === statusFilter   : true;
      return matchSearch && matchCat && matchStatus;
    });
  }, [search, categoryFilter, statusFilter, projects]);

  /* ── PAGINATION ── */
  const totalPages  = Math.ceil(filtered.length / itemsPerPage);
  const startIndex  = (currentPage - 1) * itemsPerPage;
  const paginated   = filtered.slice(startIndex, startIndex + itemsPerPage);

  useEffect(() => { setCurrentPage(1); }, [search, categoryFilter, statusFilter, itemsPerPage]);

  /* ── STATS ── */
  const stats = useMemo(() => ({
    total:     projects.length,
    active:    projects.filter(p => p.status === 'active').length,
    completed: projects.filter(p => p.status === 'completed').length,
    onHold:    projects.filter(p => p.status === 'on hold').length,
  }), [projects]);

  /* ── EXPORT ── */
  const exportToExcel = () => {
    const ws = XLSX.utils.json_to_sheet(
      filtered.map(p => ({
        'Project ID':   p.projectId,
        'Project Name': p.projectName,
        'Client':       p.clientName,
        'Category':     p.category,
        'Mobile':       p.clientMobile,
        'Email':        p.clientEmail,
        'Status':       p.status,
      }))
    );
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Projects');
    XLSX.writeFile(wb, 'Projects.xlsx');
  };

  /* ── COLORS ── */
  const statusColor = (s) => ({
    active:    'bg-emerald-50 text-emerald-700 border-emerald-200',
    completed: 'bg-blue-50 text-blue-700 border-blue-200',
    'on hold': 'bg-amber-50 text-amber-700 border-amber-200',
    cancelled: 'bg-red-50 text-red-700 border-red-200',
  }[s] || 'bg-gray-50 text-gray-600 border-gray-200');

  const categoryBadge = (c) => ({
    website:          'bg-teal-50 text-teal-700 border-teal-200',
    'mobile app':     'bg-purple-50 text-purple-700 border-purple-200',
    'digital market': 'bg-orange-50 text-orange-700 border-orange-200',
    software:         'bg-blue-50 text-blue-700 border-blue-200',
  }[c?.toLowerCase()] || 'bg-gray-50 text-gray-600 border-gray-200');

  /* ─────────────────── RENDER ─────────────────── */
  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-50 via-white to-teal-50/70">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap');
        *, *::before, *::after { font-family:'Inter',-apple-system,sans-serif; box-sizing:border-box; }

        .card {
          background:rgba(255,255,255,0.93);
          border:1px solid rgba(20,184,166,0.15);
          box-shadow:0 4px 20px -4px rgba(0,128,128,0.10);
        }
        .stat-card {
          background:#fff;
          border:1px solid rgba(20,184,166,0.15);
          box-shadow:0 2px 10px rgba(0,128,128,0.07);
          transition:all .25s ease;
        }
        .stat-card:hover { transform:translateY(-2px); box-shadow:0 8px 22px rgba(0,128,128,0.13); }

        .tbl-row { transition:background .15s ease; }
        .tbl-row:hover td { background:rgba(240,253,250,0.8) !important; }

        .s-inp {
          background:#fff;
          border:1.5px solid rgba(0,128,128,0.14);
          transition:border-color .2s, box-shadow .2s;
          width:100%;
        }
        .s-inp:focus { border-color:#0d9488; box-shadow:0 0 0 3px rgba(13,148,136,0.1); outline:none; }

        .btn-act {
          display:inline-flex; align-items:center; justify-content:center;
          width:32px; height:32px; border-radius:8px;
          transition:all .2s; cursor:pointer; border:none;
        }
        .btn-act:hover { transform:scale(1.1); }

        .status-sel {
          border:1.5px solid; border-radius:8px;
          padding:3px 8px; font-size:11px; font-weight:700;
          cursor:pointer; appearance:none; text-transform:uppercase;
          letter-spacing:.3px; background:transparent;
        }

        @keyframes slideDown { from{opacity:0;transform:translateY(-12px)} to{opacity:1;transform:translateY(0)} }
        .toast-in { animation:slideDown .3s ease forwards; }

        @keyframes spin { 0%{transform:rotate(0deg)} 100%{transform:rotate(360deg)} }
        .spinner { width:40px;height:40px;border:3px solid #e0f2f1;border-top:3px solid #0d9488;border-radius:50%;animation:spin .8s linear infinite; }

        .scroll-x::-webkit-scrollbar { height:4px; }
        .scroll-x::-webkit-scrollbar-thumb { background:#99f6e4; border-radius:4px; }

        .modal-back { position:fixed;inset:0;background:rgba(0,0,0,0.45);backdrop-filter:blur(4px);z-index:50;display:flex;align-items:center;justify-content:center;padding:16px; }

        @media(max-width:600px){ .h-sm{display:none!important} }
        @media(max-width:440px){ .h-xs{display:none!important} }
      `}</style>

      {/* ── TOAST ── */}
      {toastMsg && (
        <div className={`toast-in fixed top-4 right-4 sm:top-6 sm:right-6 z-50 flex items-center gap-2.5 px-4 py-3 rounded-2xl shadow-2xl font-semibold text-sm max-w-[calc(100vw-2rem)] sm:max-w-sm ${
          toastMsg.type === 'success' ? 'bg-emerald-600 text-white' : 'bg-red-600 text-white'
        }`}>
          <span>{toastMsg.type === 'success' ? '✓' : '!'}</span>
          <span className="flex-1 text-xs sm:text-sm">{toastMsg.message}</span>
          <button onClick={() => setToastMsg(null)} className="opacity-80 hover:opacity-100 ml-1">✕</button>
        </div>
      )}

      {/* ── DELETE MODAL ── */}
      {deleteId && (
        <div className="modal-back">
          <div className="bg-white rounded-2xl p-6 w-full max-w-xs shadow-2xl">
            <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center mx-auto mb-3">
              <MdDelete className="text-red-500" size={24} />
            </div>
            <h3 className="text-base font-bold text-gray-800 text-center mb-1">Delete Project?</h3>
            <p className="text-xs text-gray-500 text-center mb-5">This action cannot be undone.</p>
            <div className="flex gap-2.5">
              <button onClick={() => setDeleteId(null)}
                className="flex-1 py-2.5 rounded-xl border-2 border-gray-200 font-semibold text-gray-600 hover:bg-gray-50 text-sm">
                Cancel
              </button>
              <button onClick={() => handleDelete(deleteId)}
                className="flex-1 py-2.5 rounded-xl bg-red-500 hover:bg-red-600 text-white font-semibold text-sm">
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="w-full max-w-screen-2xl mx-auto px-3 sm:px-5 md:px-6 lg:px-8 xl:px-10 py-4 sm:py-6 lg:py-8">

        {/* ── HEADER ── */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5 sm:mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-2xl bg-gradient-to-br from-teal-600 to-teal-500 flex items-center justify-center shadow-lg shadow-teal-500/30 shrink-0">
              <FaFolderOpen className="text-white" size={18} />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-800 tracking-tight">
                Project Management
              </h1>
              <p className="text-xs text-gray-500 mt-0.5 flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 bg-teal-500 rounded-full" />
                {stats.total} projects · {stats.active} active
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2.5 w-full sm:w-auto">
            <button onClick={exportToExcel}
              className="flex items-center gap-1.5 px-3 sm:px-4 py-2.5 bg-white rounded-xl border border-gray-200 hover:bg-gray-50 text-gray-600 font-semibold text-xs sm:text-sm transition-all shadow-sm flex-1 sm:flex-none justify-center">
              <MdDownload size={16} /> Export
            </button>
            <Link to="/add-project"
              className="flex items-center gap-1.5 px-4 sm:px-5 py-2.5 rounded-xl bg-gradient-to-r from-teal-600 to-teal-500 text-white font-semibold shadow-lg shadow-teal-500/25 hover:shadow-xl hover:scale-[1.02] transition-all text-xs sm:text-sm flex-1 sm:flex-none justify-center">
              <MdAdd size={17} /> Add Project
            </Link>
          </div>
        </div>

        {/* ── STAT CARDS ── */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 sm:gap-3 lg:gap-4 mb-5 sm:mb-6">
          {[
            { label: 'Total',     value: stats.total,     icon: '📁', color: 'teal'    },
            { label: 'Active',    value: stats.active,    icon: '🟢', color: 'emerald' },
            { label: 'Completed', value: stats.completed, icon: '✅', color: 'blue'    },
            { label: 'On Hold',   value: stats.onHold,    icon: '⏸️', color: 'amber'  },
          ].map((s, i) => (
            <div key={i} className="stat-card rounded-2xl p-3 sm:p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xl">{s.icon}</span>
                <span className={`text-xs font-bold px-2 py-0.5 rounded-full hidden sm:inline ${
                  s.color === 'teal'    ? 'bg-teal-100 text-teal-700' :
                  s.color === 'emerald' ? 'bg-emerald-100 text-emerald-700' :
                  s.color === 'blue'    ? 'bg-blue-100 text-blue-700' :
                  'bg-amber-100 text-amber-700'
                }`}>{s.label}</span>
              </div>
              <p className="text-2xl sm:text-3xl font-bold text-gray-800">{s.value}</p>
              <p className="text-xs text-gray-400 font-medium mt-0.5">{s.label}</p>
            </div>
          ))}
        </div>

        {/* ── FILTER BAR ── */}
        <div className="card rounded-2xl p-3.5 sm:p-4 lg:p-5 mb-5 sm:mb-6">
          <div className="flex items-center justify-between mb-3 flex-wrap gap-2">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-teal-100 flex items-center justify-center shrink-0">
                <FaFilter className="text-teal-600" size={12} />
              </div>
              <span className="font-bold text-gray-800 text-sm">Filters</span>
              <span className="bg-teal-100 text-teal-700 px-2 py-0.5 rounded-full text-xs font-bold">{filtered.length}</span>
            </div>
            <button onClick={() => { setSearch(''); setCategoryFilter(''); setStatusFilter(''); fetchProjects(); }}
              className="p-1.5 sm:p-2 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-600 transition-all" title="Refresh">
              <MdRefresh size={17} />
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5">
            <div className="relative sm:col-span-2 lg:col-span-1">
              <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={12} />
              <input className="s-inp h-10 pl-8 pr-3 rounded-xl text-sm placeholder:text-gray-400 text-gray-700"
                placeholder="Search project, client, ID…"
                value={search} onChange={(e) => setSearch(e.target.value)} />
            </div>
            <div className="relative">
              <select className="s-inp h-10 px-3 rounded-xl text-sm text-gray-700 appearance-none cursor-pointer"
                value={categoryFilter} onChange={(e) => setCategoryFilter(e.target.value)}>
                <option value="">All Categories</option>
                <option value="website">Website</option>
                <option value="mobile app">Mobile App</option>
                <option value="software">Software</option>
                <option value="digital market">Digital Marketing</option>
              </select>
            </div>
            <div className="relative">
              <select className="s-inp h-10 px-3 rounded-xl text-sm text-gray-700 appearance-none cursor-pointer"
                value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
                <option value="">All Status</option>
                <option value="active">Active</option>
                <option value="on hold">On Hold</option>
                <option value="completed">Completed</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>
            <div className="relative">
              <select className="s-inp h-10 px-3 rounded-xl text-sm text-gray-700 appearance-none cursor-pointer"
                value={itemsPerPage} onChange={(e) => setItemsPerPage(Number(e.target.value))}>
                <option value={8}>8 / page</option>
                <option value={10}>10 / page</option>
                <option value={20}>20 / page</option>
                <option value={50}>50 / page</option>
              </select>
            </div>
          </div>
        </div>

        {/* ── LOADING ── */}
        {loading && (
          <div className="card rounded-2xl p-14 flex flex-col items-center gap-4">
            <div className="spinner" />
            <p className="text-gray-500 text-sm font-medium">Loading projects…</p>
          </div>
        )}

        {/* ── ERROR ── */}
        {!loading && error && (
          <div className="card rounded-2xl p-10 flex flex-col items-center gap-4 text-center">
            <p className="text-5xl">⚠️</p>
            <p className="font-bold text-gray-800">Failed to load projects</p>
            <p className="text-gray-400 text-sm max-w-xs">{error}</p>
            <button onClick={fetchProjects} className="px-5 py-2.5 bg-teal-600 text-white rounded-xl font-semibold text-sm hover:bg-teal-700">Retry</button>
          </div>
        )}

        {/* ── TABLE ── */}
        {!loading && !error && (
          <div className="card rounded-2xl overflow-hidden">
            <div className="overflow-x-auto scroll-x">
              <table className="w-full" style={{ borderCollapse:'separate', borderSpacing:0, minWidth:520 }}>
                <thead>
                  <tr className="bg-gradient-to-r from-teal-700 to-teal-600 text-white">
                    <th className="py-3 px-3 sm:px-4 text-left text-xs font-semibold w-8">#</th>
                    <th className="h-xs py-3 px-3 sm:px-4 text-left text-xs font-semibold whitespace-nowrap">ID</th>
                    <th className="py-3 px-3 sm:px-4 text-left text-xs font-semibold">Project</th>
                    <th className="h-sm py-3 px-3 sm:px-4 text-left text-xs font-semibold whitespace-nowrap">Category</th>
                    <th className="h-sm py-3 px-3 sm:px-4 text-left text-xs font-semibold whitespace-nowrap">Contact</th>
                    <th className="py-3 px-3 sm:px-4 text-left text-xs font-semibold whitespace-nowrap">Status</th>
                    <th className="py-3 px-3 sm:px-4 text-left text-xs font-semibold whitespace-nowrap">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {paginated.length > 0 ? paginated.map((p, idx) => (
                    <tr key={p._id} className="tbl-row border-b border-gray-50">
                      <td className="py-3 px-3 sm:px-4 text-xs text-gray-400">{startIndex + idx + 1}</td>
                      <td className="h-xs py-3 px-3 sm:px-4">
                        <span className="font-mono font-semibold text-gray-600 text-xs whitespace-nowrap">{p.projectId}</span>
                      </td>
                      <td className="py-3 px-3 sm:px-4">
                        <p className="font-semibold text-gray-800 text-xs sm:text-sm truncate" style={{ maxWidth:'clamp(90px,22vw,200px)' }}>
                          {p.projectName}
                        </p>
                        <p className="text-xs text-gray-400 truncate" style={{ maxWidth:'clamp(90px,20vw,180px)' }}>
                          {p.clientName}
                        </p>
                        {/* mobile-only extra info */}
                        <div className="flex items-center gap-1.5 mt-0.5 sm:hidden flex-wrap">
                          <span className={`text-xs px-1.5 py-0.5 rounded-full border font-semibold ${categoryBadge(p.category)}`}>
                            {p.category}
                          </span>
                        </div>
                      </td>
                      <td className="h-sm py-3 px-3 sm:px-4">
                        <span className={`px-2.5 py-1 rounded-lg text-xs font-semibold border whitespace-nowrap ${categoryBadge(p.category)}`}>
                          {p.category}
                        </span>
                      </td>
                      <td className="h-sm py-3 px-3 sm:px-4">
                        <div className="flex flex-col gap-0.5 text-xs text-gray-500">
                          <span className="flex items-center gap-1"><FaMobileAlt size={10} className="text-gray-400" />{p.clientMobile || '—'}</span>
                          <span className="flex items-center gap-1 truncate max-w-[130px]"><FaEnvelope size={10} className="text-gray-400" />{p.clientEmail || '—'}</span>
                        </div>
                      </td>
                      <td className="py-3 px-3 sm:px-4">
                        <select
                          value={p.status}
                          onChange={(e) => handleStatusChange(p._id, e.target.value)}
                          className={`status-sel ${statusColor(p.status)}`}
                        >
                          <option value="active">Active</option>
                          <option value="on hold">On Hold</option>
                          <option value="completed">Completed</option>
                          <option value="cancelled">Cancelled</option>
                        </select>
                      </td>
                      <td className="py-3 px-3 sm:px-4">
                        <div className="flex items-center gap-1">
                          <button onClick={() => navigate(`/projects/${p._id}`)}
                            className="btn-act bg-teal-50 hover:bg-teal-100 text-teal-600" title="View">
                            <MdVisibility size={15} />
                          </button>
                          <button onClick={() => navigate(`/edit-project/${p._id}`)}
                            className="btn-act bg-blue-50 hover:bg-blue-100 text-blue-600" title="Edit">
                            <MdEdit size={15} />
                          </button>
                          <button onClick={() => setDeleteId(p._id)}
                            className="btn-act bg-red-50 hover:bg-red-100 text-red-500" title="Delete">
                            <MdDelete size={15} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  )) : (
                    <tr>
                      <td colSpan={7} className="py-14 text-center">
                        <div className="flex flex-col items-center gap-3">
                          <FaFolderOpen className="text-gray-200" size={44} />
                          <p className="text-gray-400 font-semibold text-sm">No projects found</p>
                          <Link to="/add-project"
                            className="px-4 py-2 bg-teal-600 text-white rounded-xl text-xs font-semibold hover:bg-teal-700 transition-colors">
                            Create First Project
                          </Link>
                        </div>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* PAGINATION */}
            {totalPages > 1 && (
              <div className="px-3 sm:px-5 py-3 sm:py-4 border-t border-teal-50 bg-gradient-to-r from-white to-teal-50/30">
                <div className="flex flex-col xs:flex-row xs:items-center justify-between gap-2.5">
                  <p className="text-xs text-gray-500">
                    Showing <span className="font-bold text-teal-700">{startIndex + 1}</span>–
                    <span className="font-bold text-teal-700">{Math.min(startIndex + itemsPerPage, filtered.length)}</span>
                    {' '}of <span className="font-bold text-teal-700">{filtered.length}</span>
                  </p>
                  <div className="flex items-center gap-1 flex-wrap">
                    <button disabled={currentPage === 1} onClick={() => setCurrentPage(p => p - 1)}
                      className={`px-2.5 py-1.5 rounded-lg font-semibold text-xs border transition-all ${
                        currentPage === 1 ? 'text-gray-300 border-gray-100 bg-gray-50 cursor-not-allowed'
                        : 'text-teal-700 border-teal-200 hover:bg-teal-50 bg-white'}`}>
                      ← Prev
                    </button>
                    {[...Array(totalPages)].map((_, i) => {
                      const pg = i + 1;
                      if (pg === 1 || pg === totalPages || (pg >= currentPage - 1 && pg <= currentPage + 1))
                        return (
                          <button key={pg} onClick={() => setCurrentPage(pg)}
                            className={`w-7 h-7 sm:w-8 sm:h-8 rounded-lg font-bold text-xs transition-all ${
                              currentPage === pg ? 'bg-teal-600 text-white shadow-md' : 'hover:bg-teal-50 text-gray-600 bg-white border border-gray-100'}`}>
                            {pg}
                          </button>
                        );
                      if (pg === currentPage - 2 || pg === currentPage + 2)
                        return <span key={pg} className="text-gray-400 text-xs px-1">…</span>;
                      return null;
                    })}
                    <button disabled={currentPage === totalPages} onClick={() => setCurrentPage(p => p + 1)}
                      className={`px-2.5 py-1.5 rounded-lg font-semibold text-xs border transition-all ${
                        currentPage === totalPages ? 'text-gray-300 border-gray-100 bg-gray-50 cursor-not-allowed'
                        : 'text-teal-700 border-teal-200 hover:bg-teal-50 bg-white'}`}>
                      Next →
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Projects;