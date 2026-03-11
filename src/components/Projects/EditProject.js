import React, { useState, useEffect, useCallback, useRef } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  Upload, Plus, X,
  FileText, CheckCircle, AlertCircle, Loader, ChevronDown, Search, User,
} from "lucide-react";

const API_URL   = "http://31.97.206.144:5000/api/projects";
const STAFF_URL = "http://31.97.206.144:5000/api/staff";
const adminDetails = JSON.parse(sessionStorage.getItem("adminDetails"));
const AUTH_TOKEN   = adminDetails?.token;

const ROLES      = ["frontend", "backend", "designer", "tester", "manager"];
const CATEGORIES = [
  { value: "website",        label: "Website" },
  { value: "mobile app",     label: "Mobile App" },
  { value: "software",       label: "Software" },
  { value: "digital market", label: "Digital Marketing" },
];
const STATUSES   = ["active", "on hold", "completed", "cancelled"];
const EMPTY_TEAM = { frontend: [], backend: [], designer: [], tester: [], manager: [] };

/* ─────────────────────────────────────────────────────────── */
/*  StaffDropdown – searchable dropdown with "type to add"    */
/* ─────────────────────────────────────────────────────────── */
const StaffDropdown = ({ role, staffList, addMember }) => {
  const [open,    setOpen]    = useState(false);
  const [query,   setQuery]   = useState("");
  const ref = useRef(null);

  /* close on outside click */
  useEffect(() => {
    const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const filtered = staffList.filter(s =>
    s.employeeName.toLowerCase().includes(query.toLowerCase()) ||
    s.role.toLowerCase().includes(query.toLowerCase())
  );

  const pick = (name) => {
    addMember(role, name);
    setQuery("");
    setOpen(false);
  };

  const handleKey = (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      if (filtered.length === 1) { pick(filtered[0].employeeName); }
      else if (query.trim())     { addMember(role, query.trim()); setQuery(""); setOpen(false); }
    }
    if (e.key === "Escape") setOpen(false);
  };

  return (
    <div ref={ref} className="relative">
      {/* trigger row */}
      <div className="team-row">
        <div
          className="e-inp h-10 sm:h-11 px-3.5 rounded-lg sm:rounded-xl text-sm flex items-center gap-2 cursor-text"
          onClick={() => setOpen(true)}
        >
          <Search size={14} className="text-slate-400 shrink-0" />
          <input
            type="text"
            className="flex-1 bg-transparent outline-none text-sm text-slate-700 placeholder:text-slate-400"
            placeholder={`Search or type ${role} name…`}
            value={query}
            onChange={(e) => { setQuery(e.target.value); setOpen(true); }}
            onFocus={() => setOpen(true)}
            onKeyDown={handleKey}
          />
          <ChevronDown
            size={14}
            className={`text-slate-400 shrink-0 transition-transform ${open ? "rotate-180" : ""}`}
          />
        </div>
        <button
          type="button"
          onClick={() => { if (query.trim()) { addMember(role, query.trim()); setQuery(""); setOpen(false); } }}
          className="h-10 sm:h-11 px-3 sm:px-4 bg-teal-600 hover:bg-teal-700 active:bg-teal-800
            text-white rounded-lg sm:rounded-xl flex items-center justify-center
            shrink-0 transition-colors shadow-sm"
          title={`Add ${role}`}
        >
          <Plus size={18} />
        </button>
      </div>

      {/* dropdown panel */}
      {open && (
        <div className="absolute z-50 left-0 right-10 mt-1 bg-white border border-slate-200
          rounded-xl shadow-xl overflow-hidden max-h-52 overflow-y-auto">

          {filtered.length === 0 && (
            <div className="px-4 py-3 text-xs text-slate-400 italic text-center">
              {query.trim()
                ? <span>Press <kbd className="bg-slate-100 px-1.5 py-0.5 rounded text-slate-600 not-italic font-mono text-[11px]">Enter</kbd> to add "<b className="text-teal-600 not-italic">{query}</b>"</span>
                : "No staff found"}
            </div>
          )}

          {filtered.map((s) => (
            <button
              key={s._id}
              type="button"
              onMouseDown={(e) => { e.preventDefault(); pick(s.employeeName); }}
              className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-teal-50
                text-left transition-colors border-b border-slate-100 last:border-0"
            >
              {/* avatar */}
              <div className="w-7 h-7 rounded-full bg-teal-100 flex items-center justify-center shrink-0">
                <User size={13} className="text-teal-600" />
              </div>
              <div className="min-w-0">
                <p className="text-sm font-semibold text-slate-800 truncate">{s.employeeName}</p>
                <p className="text-[11px] text-slate-400 truncate">{s.role} · {s.employeeId}</p>
              </div>
            </button>
          ))}

          {/* free-type hint when there ARE matches but user may still want custom */}
          {filtered.length > 0 && query.trim() && !filtered.some(s => s.employeeName.toLowerCase() === query.toLowerCase()) && (
            <button
              type="button"
              onMouseDown={(e) => { e.preventDefault(); addMember(role, query.trim()); setQuery(""); setOpen(false); }}
              className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-amber-50
                text-left transition-colors border-t border-slate-100"
            >
              <div className="w-7 h-7 rounded-full bg-amber-100 flex items-center justify-center shrink-0">
                <Plus size={13} className="text-amber-600" />
              </div>
              <p className="text-sm text-amber-700 font-medium">Add "<b>{query}</b>" manually</p>
            </button>
          )}
        </div>
      )}
    </div>
  );
};

/* ─────────────────────────────────────────────────────────── */
/*  Main EditProject Component                                 */
/* ─────────────────────────────────────────────────────────── */
const EditProject = () => {
  const { id }   = useParams();
  const navigate = useNavigate();

  const [loading,    setLoading]    = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [toast,      setToast]      = useState(null);

  const [file,          setFile]          = useState(null);
  const [quotationFile, setQuotationFile] = useState(null);
  const [existingFiles, setExistingFiles] = useState({ uploadfile: null, quotationfile: null });

  const [teamMembers, setTeamMembers] = useState(EMPTY_TEAM);
  const [staffList,   setStaffList]   = useState([]);

  const [milestonePayments, setMilestonePayments] = useState([]);

  const [formData, setFormData] = useState({
    projectId:           "",
    projectName:         "",
    clientName:          "",
    clientMobile:        "",
    clientEmail:         "",
    clientAddress:       "",
    category:            "website",
    startDate:           "",
    projectHandoverDate: "",
    deadlineDate:        "",
    duration:            "",
    projectCost:         "",
    milestone:           "",
    status:              "active",
  });

  /* ── TOAST ── */
  const showToast = useCallback((type, message) => {
    setToast({ type, message });
    setTimeout(() => setToast(null), 4000);
  }, []);

  /* ── FETCH STAFF ── */
  useEffect(() => {
    const fetchStaff = async () => {
      try {
        const res  = await fetch(STAFF_URL, {
          headers: { Authorization: `Bearer ${AUTH_TOKEN}` },
        });
        const data = await res.json();
        if (data.success) setStaffList(data.data || []);
      } catch {
        /* staff fetch failure is non-critical */
      }
    };
    fetchStaff();
  }, []);

  /* ── FETCH PROJECT ── */
  useEffect(() => { fetchProject(); }, [id]);

  const fetchProject = async () => {
    try {
      const res  = await fetch(`${API_URL}/${id}`, {
        headers: { Authorization: `Bearer ${AUTH_TOKEN}` },
      });
      const data = await res.json();

      if (data.success) {
        const p   = data.data;
        const fmt = (d) => (d ? new Date(d).toISOString().split("T")[0] : "");

        setFormData({
          projectId:           p.projectId           || "",
          projectName:         p.projectName         || "",
          clientName:          p.clientName          || "",
          clientMobile:        p.clientMobile        || "",
          clientEmail:         p.clientEmail         || "",
          clientAddress:       p.clientAddress       || "",
          category:            p.category            || "website",
          startDate:           fmt(p.startDate),
          projectHandoverDate: fmt(p.projectHandoverDate),
          deadlineDate:        fmt(p.deadlineDate),
          duration:            p.duration            || "",
          projectCost:         p.projectCost != null ? String(p.projectCost) : "",
          milestone:           p.milestone   != null ? String(p.milestone)   : "",
          status:              p.status              || "active",
        });

        const raw = p.teamMembers || {};
        setTeamMembers({
          frontend: Array.isArray(raw.frontend) ? raw.frontend : [],
          backend:  Array.isArray(raw.backend)  ? raw.backend  : [],
          designer: Array.isArray(raw.designer) ? raw.designer : [],
          tester:   Array.isArray(raw.tester)   ? raw.tester   : [],
          manager:  Array.isArray(raw.manager)  ? raw.manager  : [],
        });

        setMilestonePayments(Array.isArray(p.milestonePayments) ? p.milestonePayments : []);
        setExistingFiles({ uploadfile: p.uploadfile || null, quotationfile: p.quotationfile || null });
      } else {
        showToast("error", data.message || "Failed to load project");
      }
    } catch (err) {
      showToast("error", "Network error: " + (err.message || "unknown"));
    } finally {
      setLoading(false);
    }
  };

  /* ── FIELD CHANGE ── */
  const handleChange = useCallback((e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  }, []);

  /* ── TEAM HANDLERS ── */
  const addMember = useCallback((role, name) => {
    if (!name || !name.trim()) return;
    setTeamMembers(prev => {
      if (prev[role].includes(name.trim())) return prev;   // prevent duplicates
      return { ...prev, [role]: [...prev[role], name.trim()] };
    });
  }, []);

  const removeMember = useCallback((role, idx) => {
    setTeamMembers(prev => ({
      ...prev,
      [role]: prev[role].filter((_, i) => i !== idx),
    }));
  }, []);

  /* ── SUBMIT ── */
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.projectName.trim()) { showToast("error", "Project name is required."); return; }
    if (!formData.clientName.trim())  { showToast("error", "Client name is required.");  return; }

    setSubmitting(true);
    try {
      let body;
      let extraHeaders = {};

      if (file || quotationFile) {
        const fd = new FormData();
        Object.entries(formData).forEach(([k, v]) => fd.append(k, v));
        fd.append("teamMembers",       JSON.stringify(teamMembers));
        fd.append("milestonePayments", JSON.stringify(milestonePayments));
        if (file)          fd.append("uploadfile",    file);
        if (quotationFile) fd.append("quotationfile", quotationFile);
        body = fd;
      } else {
        body = JSON.stringify({
          ...formData,
          projectCost: formData.projectCost ? Number(formData.projectCost) : 0,
          milestone:   formData.milestone   ? Number(formData.milestone)   : 0,
          teamMembers,
          milestonePayments,
        });
        extraHeaders = { "Content-Type": "application/json" };
      }

      const res  = await fetch(`${API_URL}/${id}`, {
        method:  "PUT",
        headers: { Authorization: `Bearer ${AUTH_TOKEN}`, ...extraHeaders },
        body,
      });
      const data = await res.json();

      if (res.ok && data.success !== false) {
        showToast("success", "Project updated successfully!");
        setTimeout(() => navigate("/projects"), 1800);
      } else {
        const msg = data.errors ? data.errors.join(", ") : data.message || "Update failed.";
        showToast("error", msg);
      }
    } catch {
      showToast("error", "Network error. Please check your connection.");
    } finally {
      setSubmitting(false);
    }
  };

  /* ── LOADING ── */
  if (loading) return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center px-4">
      <style>{`@keyframes spin{0%{transform:rotate(0deg)}100%{transform:rotate(360deg)}}`}</style>
      <div className="flex flex-col items-center gap-3">
        <div style={{
          width: 44, height: 44,
          border: "3px solid #e0f2f1",
          borderTop: "3px solid #0d9488",
          borderRadius: "50%",
          animation: "spin .8s linear infinite",
        }} />
        <p className="text-gray-500 font-medium text-sm">Loading project…</p>
      </div>
    </div>
  );

  /* ══════════════════════════ RENDER ══════════════════════════ */
  return (
    <div className="min-h-screen bg-slate-50">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap');
        *, *::before, *::after {
          font-family: 'Inter', -apple-system, sans-serif;
          box-sizing: border-box;
        }
        .pg-card {
          background: #fff;
          border: 1px solid rgba(20,184,166,0.13);
          box-shadow: 0 2px 16px rgba(0,0,0,0.05);
        }
        .e-inp {
          width: 100%;
          background: #fff;
          border: 1.5px solid #e2e8f0;
          transition: border-color .2s, box-shadow .2s;
        }
        .e-inp:focus-within {
          border-color: #0d9488;
          box-shadow: 0 0 0 3px rgba(13,148,136,0.11);
          outline: none;
        }
        .e-inp input:focus { outline: none; }
        .e-inp::placeholder, .e-inp input::placeholder { color: #94a3b8; }
        .team-row { display: flex; gap: 8px; }
        .team-row > div:first-child { flex: 1; min-width: 0; }
        .up-zone {
          border: 2px dashed #cbd5e1;
          transition: border-color .25s, background .25s;
          cursor: pointer;
        }
        .up-zone:hover { border-color: #0d9488; background: rgba(20,184,166,0.04); }
        .s-div {
          display: flex; align-items: center; gap: 10px; margin-bottom: 1rem;
        }
        .s-div::before, .s-div::after {
          content: ''; flex: 1; height: 1px;
          background: linear-gradient(to right, transparent, rgba(20,184,166,.25), transparent);
        }
        @keyframes slideDown {
          from { opacity: 0; transform: translateY(-12px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .toast-in { animation: slideDown .3s ease forwards; }
        @keyframes spin { 0%{transform:rotate(0deg)} 100%{transform:rotate(360deg)} }
        .spin-i { animation: spin .8s linear infinite; }
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(10px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .fade-up { animation: fadeUp .35s ease forwards; }
      `}</style>

      {/* TOAST */}
      {toast && (
        <div className={`toast-in fixed top-4 right-4 sm:top-6 sm:right-6 z-50 flex items-center gap-2.5
          px-4 py-3 rounded-2xl shadow-2xl font-semibold text-sm
          max-w-[calc(100vw-2rem)] sm:max-w-sm
          ${toast.type === "success" ? "bg-emerald-600 text-white" : "bg-red-600 text-white"}`}>
          {toast.type === "success"
            ? <CheckCircle size={17} className="shrink-0" />
            : <AlertCircle size={17} className="shrink-0" />}
          <span className="flex-1 text-xs sm:text-sm leading-snug">{toast.message}</span>
          <button onClick={() => setToast(null)} className="opacity-80 hover:opacity-100 ml-1 shrink-0">
            <X size={14} />
          </button>
        </div>
      )}

      <div className="w-full max-w-4xl mx-auto px-3 sm:px-5 md:px-6 lg:px-8 py-4 sm:py-6 lg:py-10">

        {/* HEADER */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5 sm:mb-7 fade-up">
          <div className="flex items-center gap-3 min-w-0">
            <button
              onClick={() => navigate("/projects")}
              className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-white shadow border border-gray-100
                flex items-center justify-center text-gray-500
                hover:text-teal-600 hover:border-teal-200 transition-all shrink-0"
            >←</button>
            <div className="min-w-0">
              <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-slate-800 tracking-tight">
                Edit Project
              </h1>
              <p className="text-xs text-slate-400 mt-0.5">Update project details &amp; team</p>
            </div>
          </div>
          <span className={`self-start sm:self-auto shrink-0 px-3 py-1.5 rounded-full text-xs font-bold capitalize ${
            formData.status === "active"    ? "bg-emerald-100 text-emerald-700" :
            formData.status === "completed" ? "bg-blue-100 text-blue-700" :
            formData.status === "on hold"   ? "bg-amber-100 text-amber-700" :
            "bg-red-100 text-red-700"
          }`}>● {formData.status}</span>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-5 fade-up">

          {/* PROJECT INFO */}
          <div className="pg-card rounded-2xl sm:rounded-3xl p-4 sm:p-6">
            <div className="s-div">
              <span className="text-xs font-bold text-teal-600 tracking-widest uppercase whitespace-nowrap">
                📋 Project Information
              </span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 sm:gap-4">
              <EInp name="projectId"     value={formData.projectId}     onChange={handleChange} label="Project ID"     placeholder="Project ID" />
              <EInp name="projectName"   value={formData.projectName}   onChange={handleChange} label="Project Name"   placeholder="Project Name" required />
              <EInp name="clientName"    value={formData.clientName}    onChange={handleChange} label="Client Name"    placeholder="Client Name" required />
              <EInp name="clientMobile"  value={formData.clientMobile}  onChange={handleChange} label="Client Mobile"  placeholder="Mobile Number" />
              <EInp name="clientEmail"   value={formData.clientEmail}   onChange={handleChange} label="Client Email"   placeholder="Email Address" type="email" />
              <EInp name="clientAddress" value={formData.clientAddress} onChange={handleChange} label="Client Address" placeholder="Address" />
              <div>
                <label className="text-xs sm:text-sm font-semibold text-slate-700 mb-1 sm:mb-1.5 block">Category</label>
                <select name="category" value={formData.category} onChange={handleChange}
                  className="e-inp h-10 sm:h-11 px-3.5 rounded-lg sm:rounded-xl text-sm text-slate-700 appearance-none cursor-pointer">
                  {CATEGORIES.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
                </select>
              </div>
              <div>
                <label className="text-xs sm:text-sm font-semibold text-slate-700 mb-1 sm:mb-1.5 block">Status</label>
                <select name="status" value={formData.status} onChange={handleChange}
                  className="e-inp h-10 sm:h-11 px-3.5 rounded-lg sm:rounded-xl text-sm text-slate-700 appearance-none cursor-pointer">
                  {STATUSES.map(s => <option key={s} value={s} className="capitalize">{s}</option>)}
                </select>
              </div>
            </div>
          </div>

          {/* SCHEDULE & BUDGET */}
          <div className="pg-card rounded-2xl sm:rounded-3xl p-4 sm:p-6">
            <div className="s-div">
              <span className="text-xs font-bold text-teal-600 tracking-widest uppercase whitespace-nowrap">
                📅 Schedule &amp; Budget
              </span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 sm:gap-4">
              <EInp name="startDate"           value={formData.startDate}           onChange={handleChange} label="Start Date"       type="date" />
              <EInp name="projectHandoverDate" value={formData.projectHandoverDate} onChange={handleChange} label="Handover Date"    type="date" />
              <EInp name="deadlineDate"        value={formData.deadlineDate}        onChange={handleChange} label="Deadline"         type="date" />
              <EInp name="duration"            value={formData.duration}            onChange={handleChange} label="Duration"         placeholder="e.g. 3 Months" />
              <EInp name="projectCost"         value={formData.projectCost}         onChange={handleChange} label="Project Cost (₹)" type="number" placeholder="0" />
              <EInp name="milestone"           value={formData.milestone}           onChange={handleChange} label="Total Milestones" type="number" placeholder="0" />
            </div>
          </div>

          {/* TEAM MEMBERS */}
          <div className="pg-card rounded-2xl sm:rounded-3xl p-4 sm:p-6">
            <div className="s-div">
              <span className="text-xs font-bold text-teal-600 tracking-widest uppercase whitespace-nowrap">
                👥 Team Members
              </span>
            </div>

            {staffList.length === 0 && (
              <p className="text-xs text-amber-600 bg-amber-50 border border-amber-200 rounded-xl px-4 py-2.5 mb-4">
                ⚠ Staff list couldn't be loaded — you can still type names manually.
              </p>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5">
              {ROLES.map((role) => (
                <div key={role}>
                  {/* label + count badge */}
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="text-xs sm:text-sm font-semibold capitalize text-slate-700">{role}</label>
                    {teamMembers[role].length > 0 && (
                      <span className="text-xs bg-teal-100 text-teal-700 px-2 py-0.5 rounded-full font-bold">
                        {teamMembers[role].length}
                      </span>
                    )}
                  </div>

                  {/* searchable dropdown */}
                  <StaffDropdown
                    role={role}
                    staffList={staffList}
                    addMember={addMember}
                  />

                  {/* member chips */}
                  {teamMembers[role].length > 0 ? (
                    <div className="flex flex-wrap gap-1.5 mt-2.5">
                      {teamMembers[role].map((m, i) => (
                        <span
                          key={`${role}-${i}`}
                          className="flex items-center gap-1.5 bg-teal-50 border border-teal-200
                            text-teal-800 px-2.5 py-1 rounded-full text-xs font-semibold"
                        >
                          {m}
                          <button
                            type="button"
                            onClick={() => removeMember(role, i)}
                            className="text-teal-500 hover:text-red-500 transition-colors leading-none"
                            aria-label={`Remove ${m}`}
                          >
                            <X size={11} />
                          </button>
                        </span>
                      ))}
                    </div>
                  ) : (
                    <p className="text-xs text-slate-400 mt-2 italic">No members added yet</p>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* FILES */}
          <div className="pg-card rounded-2xl sm:rounded-3xl p-4 sm:p-6">
            <div className="s-div">
              <span className="text-xs font-bold text-teal-600 tracking-widest uppercase whitespace-nowrap">
                📎 Files
              </span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {existingFiles.quotationfile && (
                <ExistingFile file={existingFiles.quotationfile} label="Current Quotation" />
              )}
              {existingFiles.uploadfile && (
                <ExistingFile file={existingFiles.uploadfile} label="Current Project File" />
              )}
              <UploadBox label="Replace Quotation"    current={quotationFile?.name} setFile={setQuotationFile} />
              <UploadBox label="Replace Project File" current={file?.name}          setFile={setFile} />
            </div>
          </div>

          {/* ACTION BUTTONS */}
          <div className="flex flex-col-reverse sm:flex-row gap-3 pt-1">
            <button
              type="button"
              onClick={() => navigate("/projects")}
              className="flex-1 sm:flex-none sm:w-32 py-3 rounded-xl border-2 border-gray-200
                font-bold text-sm text-gray-600 hover:bg-gray-50 hover:border-gray-300 transition-all"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl
                bg-gradient-to-r from-teal-600 to-teal-500 text-white font-bold text-sm
                shadow-lg shadow-teal-500/25 hover:shadow-xl hover:scale-[1.01]
                active:scale-[0.99] transition-all
                disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:scale-100"
            >
              {submitting
                ? <><Loader size={17} className="spin-i" /> Updating…</>
                : "Update Project"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

/* ══════════════ SUB-COMPONENTS ══════════════ */

const EInp = ({ label, className = "", ...props }) => (
  <div>
    {label && (
      <label className="text-xs sm:text-sm font-semibold text-slate-700 mb-1 sm:mb-1.5 block">{label}</label>
    )}
    <input
      {...props}
      className={`e-inp h-10 sm:h-11 px-3.5 rounded-lg sm:rounded-xl text-sm text-slate-700 ${className}`}
    />
  </div>
);

const UploadBox = ({ label, setFile, current }) => (
  <label className="up-zone flex flex-col items-center justify-center rounded-2xl p-5 sm:p-7 transition-all">
    <Upload className="text-slate-400 mb-2" size={22} />
    <p className="font-semibold text-slate-700 text-sm text-center">{label}</p>
    {current
      ? <p className="text-xs text-teal-600 mt-1 text-center truncate max-w-full px-2">✓ {current}</p>
      : <p className="text-xs text-slate-400 mt-0.5">Click to select file</p>}
    <input hidden type="file" onChange={(e) => setFile(e.target.files[0])} />
  </label>
);

const ExistingFile = ({ file, label }) => (
  <a
    href={file}
    target="_blank"
    rel="noreferrer"
    className="flex items-center gap-3 border border-slate-200 rounded-2xl p-3.5 sm:p-4
      hover:bg-slate-50 transition-colors"
  >
    <div className="p-2 bg-teal-50 rounded-lg shrink-0">
      <FileText className="text-teal-600" size={18} />
    </div>
    <div className="min-w-0">
      <p className="font-semibold text-slate-800 text-sm">{label}</p>
      <p className="text-xs text-slate-400 truncate">Click to view file</p>
    </div>
  </a>
);

export default EditProject;