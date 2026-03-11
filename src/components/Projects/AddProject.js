import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { FolderPlus, Plus, X, CheckCircle, AlertCircle, Loader } from "lucide-react";

const API_URL = "http://31.97.206.144:5000/api/projects";
const adminDetails = JSON.parse(sessionStorage.getItem("adminDetails"));
const AUTH_TOKEN = adminDetails?.token;

const AddProject = () => {
  const navigate = useNavigate();

  const [projectType, setProjectType] = useState("website");
  const [loading, setLoading]         = useState(false);
  const [toast, setToast]             = useState(null);

  const [formData, setFormData] = useState({
    projectId:      "",
    projectName:    "",
    clientName:     "",
    clientMobile:   "",
    clientEmail:    "",
    clientAddress:  "",
    startDate:      "",
    duration:       "",
    projectCost:    "",
    milestone:      "",
    status:         "active",
    deadlineDate:   "",
    projectHandoverDate: "",
  });

  const [appDetails, setAppDetails] = useState({
    appId:    "",
    appName:  "",
    timeline: { designing: "", frontend: "", backend: "", deployment: "" },
  });

  const [budget, setBudget]           = useState([]);
  const [installment, setInstallment] = useState({ title: "", amount: "", deadline: "" });

  const [marketing, setMarketing] = useState({
    reels:   { enabled: false, duration: "", quantity: "", startDate: "" },
    posters: { enabled: false, duration: "", quantity: "", startDate: "" },
    seo: false, keywords: false, banners: false,
  });

  const showToast = (type, message) => {
    setToast({ type, message });
    setTimeout(() => setToast(null), 4000);
  };

  const handleChange  = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });
  const handleTimeline = (e) => setAppDetails({ ...appDetails, timeline: { ...appDetails.timeline, [e.target.name]: e.target.value } });

  const addInstallment = () => {
    if (!installment.title || !installment.amount) return;
    setBudget([...budget, { ...installment, amount: Number(installment.amount) }]);
    setInstallment({ title: "", amount: "", deadline: "" });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.projectName.trim()) { showToast("error", "Project name is required."); return; }
    if (!formData.clientName.trim())  { showToast("error", "Client name is required.");  return; }

    setLoading(true);
    try {
      const payload = {
        ...formData,
        projectCost: formData.projectCost ? Number(formData.projectCost) : 0,
        milestone:   formData.milestone   ? Number(formData.milestone)   : 0,
        category:    projectType,
        appDetails:  projectType !== "digital market" ? appDetails : undefined,
        marketing:   projectType === "digital market" ? marketing  : undefined,
        budgetInstallments: budget,
        milestonePayments:  [],
        teamMembers: { frontend: [], backend: [], designer: [], tester: [], manager: [] },
      };

      const res  = await fetch(API_URL, {
        method: "POST",
        headers: {
          Authorization:  `Bearer ${AUTH_TOKEN}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (res.ok && data.success !== false) {
        showToast("success", "Project created successfully!");
        setTimeout(() => navigate("/projects"), 1800);
      } else {
        const msg = data.errors
          ? data.errors.join(", ")
          : data.message || "Failed to create project.";
        showToast("error", msg);
      }
    } catch {
      showToast("error", "Network error. Please check your connection.");
    } finally {
      setLoading(false);
    }
  };

  const typeButtons = [
    { value: "website",         label: "Website" },
    { value: "mobile app",      label: "Mobile App" },
    { value: "software",        label: "Software" },
    { value: "digital market",  label: "Digital Marketing" },
  ];

  /* ─────────────────────── RENDER ─────────────────────── */
  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-50/90 via-white to-teal-100/70">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap');
        *, *::before, *::after { font-family:'Inter',-apple-system,sans-serif; box-sizing:border-box; }

        .glass-card {
          background:rgba(255,255,255,0.93);
          backdrop-filter:blur(20px);
          -webkit-backdrop-filter:blur(20px);
          border:1px solid rgba(64,224,208,0.22);
          box-shadow:0 12px 40px -8px rgba(0,128,128,0.18);
        }
        .section-card {
          background:rgba(255,255,255,0.6);
          border:1px solid rgba(20,184,166,0.15);
          border-radius:16px;
          padding:1.25rem;
        }
        @media(min-width:640px){ .section-card{ padding:1.5rem; } }

        .f-inp {
          width:100%; background:#fff;
          border:1.5px solid rgba(0,128,128,0.15);
          transition:border-color .22s, box-shadow .22s;
        }
        .f-inp:focus { border-color:#0d9488; box-shadow:0 0 0 3px rgba(13,148,136,0.11); outline:none; }

        .s-div {
          display:flex; align-items:center; gap:10px;
          margin-bottom:1rem;
        }
        .s-div::before, .s-div::after {
          content:''; flex:1; height:1px;
          background:linear-gradient(to right,transparent,rgba(20,184,166,.3),transparent);
        }

        @keyframes slideDown { from{opacity:0;transform:translateY(-12px)} to{opacity:1;transform:translateY(0)} }
        .toast-in { animation:slideDown .3s ease forwards; }
        @keyframes spin { 0%{transform:rotate(0deg)} 100%{transform:rotate(360deg)} }
        .spin { animation:spin .8s linear infinite; }
        @keyframes fadeUp { from{opacity:0;transform:translateY(10px)} to{opacity:1;transform:translateY(0)} }
        .fade-up { animation:fadeUp .35s ease forwards; }
      `}</style>

      {/* TOAST */}
      {toast && (
        <div className={`toast-in fixed top-4 right-4 sm:top-6 sm:right-6 z-50 flex items-center gap-2.5 px-4 py-3 rounded-2xl shadow-2xl font-semibold text-sm max-w-[calc(100vw-2rem)] sm:max-w-sm ${
          toast.type === "success" ? "bg-emerald-600 text-white" : "bg-red-600 text-white"
        }`}>
          {toast.type === "success" ? <CheckCircle size={17} className="shrink-0" /> : <AlertCircle size={17} className="shrink-0" />}
          <span className="flex-1 text-xs sm:text-sm">{toast.message}</span>
          <button onClick={() => setToast(null)} className="opacity-80 hover:opacity-100 ml-1 shrink-0"><X size={14} /></button>
        </div>
      )}

      <div className="w-full max-w-4xl mx-auto px-3 sm:px-5 md:px-6 lg:px-8 py-4 sm:py-6 lg:py-10">

        {/* HEADER */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5 sm:mb-7 fade-up">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-2xl bg-gradient-to-br from-teal-600 to-teal-500 flex items-center justify-center shadow-lg shadow-teal-500/30 shrink-0">
              <FolderPlus className="text-white" size={18} />
            </div>
            <div className="min-w-0">
              <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-800 tracking-tight">Create Project</h1>
              <p className="text-xs sm:text-sm text-gray-500 mt-0.5">Launch projects with enterprise control</p>
            </div>
          </div>
          <button onClick={() => navigate("/projects")}
            className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-white border border-gray-200 hover:border-teal-300 text-gray-600 font-semibold text-sm hover:shadow-md transition-all w-full sm:w-auto">
            ← Back
          </button>
        </div>

        {/* MAIN CARD */}
        <div className="glass-card rounded-2xl sm:rounded-3xl p-4 sm:p-6 lg:p-8 fade-up">
          <form onSubmit={handleSubmit} className="space-y-6 sm:space-y-7">

            {/* ── CLIENT INFO ── */}
            <div>
              <div className="s-div"><span className="text-xs font-bold text-teal-600 tracking-widest uppercase whitespace-nowrap">👤 Client Information</span></div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 sm:gap-4">
                <FInp name="projectId"     value={formData.projectId}     onChange={handleChange} placeholder="Project ID"      label="Project ID" />
                <FInp name="projectName"   value={formData.projectName}   onChange={handleChange} placeholder="Project Name"    label="Project Name" required />
                <FInp name="clientName"    value={formData.clientName}    onChange={handleChange} placeholder="Client Name"     label="Client Name" required />
                <FInp name="clientMobile"  value={formData.clientMobile}  onChange={handleChange} placeholder="Mobile Number"   label="Client Mobile" />
                <FInp name="clientEmail"   value={formData.clientEmail}   onChange={handleChange} placeholder="Email Address"   label="Client Email" type="email" />
                <FInp name="clientAddress" value={formData.clientAddress} onChange={handleChange} placeholder="Address"         label="Client Address" />
              </div>
            </div>

            {/* ── PROJECT SCHEDULE ── */}
            <div>
              <div className="s-div"><span className="text-xs font-bold text-teal-600 tracking-widest uppercase whitespace-nowrap">📅 Project Schedule</span></div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 sm:gap-4">
                <FInp name="startDate"           value={formData.startDate}           onChange={handleChange} label="Start Date"        type="date" />
                <FInp name="projectHandoverDate" value={formData.projectHandoverDate} onChange={handleChange} label="Handover Date"     type="date" />
                <FInp name="deadlineDate"        value={formData.deadlineDate}        onChange={handleChange} label="Deadline"          type="date" />
                <FInp name="duration"            value={formData.duration}            onChange={handleChange} label="Duration"          placeholder="e.g. 3 Months" />
                <FInp name="projectCost"         value={formData.projectCost}         onChange={handleChange} label="Project Cost (₹)"  type="number" placeholder="0" />
                <FInp name="milestone"           value={formData.milestone}           onChange={handleChange} label="Total Milestones"  type="number" placeholder="0" />
              </div>
            </div>

            {/* ── PROJECT TYPE ── */}
            <div>
              <div className="s-div"><span className="text-xs font-bold text-teal-600 tracking-widest uppercase whitespace-nowrap">🏷️ Project Type</span></div>
              <div className="flex flex-wrap gap-2">
                {typeButtons.map((t) => (
                  <button key={t.value} type="button" onClick={() => setProjectType(t.value)}
                    className={`px-4 sm:px-5 py-2 rounded-xl font-semibold text-xs sm:text-sm transition-all ${
                      projectType === t.value
                        ? "bg-teal-600 text-white shadow-lg shadow-teal-500/30"
                        : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                    }`}>
                    {t.label}
                  </button>
                ))}
              </div>
            </div>

            {/* ── APP / WEBSITE DETAILS ── */}
            {(projectType === "website" || projectType === "mobile app" || projectType === "software") && (
              <div className="section-card">
                <div className="s-div"><span className="text-xs font-bold text-teal-600 tracking-widest uppercase whitespace-nowrap">⚙️ Project Details</span></div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 mb-4">
                  <FInp placeholder="Internal Project ID"   value={appDetails.appId}   label="Internal ID"
                    onChange={(e) => setAppDetails({ ...appDetails, appId: e.target.value })} />
                  <FInp placeholder="Internal Project Name" value={appDetails.appName} label="Internal Name"
                    onChange={(e) => setAppDetails({ ...appDetails, appName: e.target.value })} />
                </div>
                <p className="text-xs font-bold text-gray-600 mb-2.5 uppercase tracking-wider">Timeline</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  <FInp name="designing"  onChange={handleTimeline} placeholder="e.g. 2 Weeks" label="Designing" />
                  <FInp name="frontend"   onChange={handleTimeline} placeholder="e.g. 4 Weeks" label="Frontend" />
                  <FInp name="backend"    onChange={handleTimeline} placeholder="e.g. 4 Weeks" label="Backend" />
                  <FInp name="deployment" onChange={handleTimeline} placeholder="e.g. 1 Week"  label="Deployment" />
                </div>
              </div>
            )}

            {/* ── DIGITAL MARKETING ── */}
            {projectType === "digital market" && (
              <div className="section-card">
                <div className="s-div"><span className="text-xs font-bold text-teal-600 tracking-widest uppercase whitespace-nowrap">📣 Marketing Services</span></div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-5">
                  {["reels", "posters"].map((type) => (
                    <div key={type} className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm">
                      <label className="flex items-center gap-3 cursor-pointer mb-3">
                        <input type="checkbox" checked={marketing[type].enabled}
                          onChange={(e) => setMarketing({ ...marketing, [type]: { ...marketing[type], enabled: e.target.checked } })}
                          className="w-4 h-4 accent-teal-600" />
                        <span className="text-sm font-bold capitalize text-gray-800">{type}</span>
                      </label>
                      {marketing[type].enabled && (
                        <div className="grid grid-cols-2 gap-2.5">
                          <select value={marketing[type].duration}
                            onChange={(e) => setMarketing({ ...marketing, [type]: { ...marketing[type], duration: e.target.value } })}
                            className="f-inp h-9 px-2.5 rounded-lg text-xs text-gray-700 appearance-none">
                            <option value="">Type</option>
                            <option>Month</option><option>Week</option><option>Year</option><option>Day</option>
                          </select>
                          <input type="number" placeholder="Quantity" value={marketing[type].quantity}
                            onChange={(e) => setMarketing({ ...marketing, [type]: { ...marketing[type], quantity: e.target.value } })}
                            className="f-inp h-9 px-2.5 rounded-lg text-xs text-gray-700 placeholder:text-gray-400" />
                          <input type="date" value={marketing[type].startDate}
                            onChange={(e) => setMarketing({ ...marketing, [type]: { ...marketing[type], startDate: e.target.value } })}
                            className="f-inp h-9 px-2.5 rounded-lg text-xs text-gray-700 col-span-2" />
                        </div>
                      )}
                    </div>
                  ))}
                </div>
                {/* Selected preview */}
                <div className="flex flex-wrap gap-2">
                  {["reels","posters"].map((type) => {
                    const d = marketing[type];
                    if (!d.enabled) return null;
                    return (
                      <span key={type} className="bg-gradient-to-r from-teal-600 to-teal-500 text-white px-3 py-1.5 rounded-full text-xs font-semibold shadow">
                        {type.toUpperCase()} — {d.quantity} / {d.duration}
                      </span>
                    );
                  })}
                </div>
              </div>
            )}

            {/* ── BUDGET ── */}
            <div className="section-card">
              <div className="s-div"><span className="text-xs font-bold text-teal-600 tracking-widest uppercase whitespace-nowrap">💰 Budget / Installments</span></div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-3">
                <FInp placeholder="e.g. Advance Payment" value={installment.title}
                  onChange={(e) => setInstallment({ ...installment, title: e.target.value })} label="Title" />
                <FInp type="number" placeholder="Amount (₹)" value={installment.amount}
                  onChange={(e) => setInstallment({ ...installment, amount: e.target.value })} label="Amount" />
                <FInp type="date" value={installment.deadline}
                  onChange={(e) => setInstallment({ ...installment, deadline: e.target.value })} label="Deadline" />
              </div>
              <button type="button" onClick={addInstallment}
                className="flex items-center gap-2 bg-teal-600 hover:bg-teal-700 text-white px-4 py-2 rounded-xl text-sm font-semibold transition-colors mb-3">
                <Plus size={15} /> Add Installment
              </button>
              {budget.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-1">
                  {budget.map((b, i) => (
                    <span key={i} className="flex items-center gap-1.5 bg-teal-100 text-teal-700 px-3 py-1.5 rounded-full text-xs font-semibold">
                      {b.title} — ₹{b.amount}
                      <button type="button" onClick={() => setBudget(budget.filter((_, x) => x !== i))}>
                        <X size={12} className="hover:text-red-500" />
                      </button>
                    </span>
                  ))}
                </div>
              )}
            </div>

            {/* ── BUTTONS ── */}
            <div className="flex flex-col-reverse sm:flex-row gap-3 pt-2 border-t border-gray-100">
              <button type="button" onClick={() => navigate("/projects")}
                className="flex-1 sm:flex-none sm:w-32 py-3 rounded-xl border-2 border-gray-200 font-bold text-sm text-gray-600 hover:bg-gray-50 transition-all">
                Cancel
              </button>
              <button type="submit" disabled={loading}
                className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl bg-gradient-to-r from-teal-600 to-teal-500 text-white font-bold text-sm shadow-lg shadow-teal-500/25 hover:shadow-xl hover:scale-[1.01] active:scale-[0.99] transition-all disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:scale-100">
                {loading ? <><Loader size={17} className="spin" />Creating…</> : <><FolderPlus size={17} />Create Project</>}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

/* ── FIELD INPUT ── */
const FInp = ({ label, className = "", ...props }) => (
  <div>
    {label && <label className="text-xs sm:text-sm font-semibold text-gray-700 mb-1 sm:mb-1.5 block">{label}</label>}
    <input {...props}
      className={`f-inp h-10 sm:h-11 px-3.5 rounded-lg sm:rounded-xl text-sm text-gray-700 placeholder:text-gray-400 ${className}`} />
  </div>
);

export default AddProject;