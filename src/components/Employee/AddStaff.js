import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  User,
  Phone,
  Mail,
  Briefcase,
  Calendar,
  Droplet,
  Lock,
  File,
  X,
  ArrowLeft,
  CreditCard,
  Shield,
  ChevronDown,
  CheckCircle,
  AlertCircle,
  Loader,
} from "lucide-react";

const API_URL = "http://31.97.206.144:5000/api/staff";
const adminDetails = JSON.parse(sessionStorage.getItem("adminDetails"));
const AUTH_TOKEN = adminDetails?.token;

const AddStaff = () => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    employeeId: "",
    employeeName: "",
    role: "",
    mobile: "",
    email: "",
    joiningDate: "",
    bloodGroup: "",
    password: "",
  });

  const [profilePreview, setProfilePreview] = useState(null);
  const [idPreview, setIdPreview]             = useState(null);
  const [profileImage, setProfileImage]       = useState(null);
  const [idCardImage, setIdCardImage]         = useState(null);

  const [documents, setDocuments] = useState({
    experienceLetters: [],
    relievingLetters: [],
    payslips: [],
    form16: [],
    offerLetters: [],
    aadharCard: [],
    panCard: [],
    tenth: [],
    graduation: [],
  });

  const [loading, setLoading] = useState(false);
  const [toast, setToast]     = useState(null);

  const roles = [
    "CEO","HR","Backend Developer","Frontend Developer",
    "Full Stack Developer","Project Manager","Designer",
    "QA Engineer","DevOps Engineer","Team Lead",
  ];
  const bloodGroups = ["A+","A-","B+","B-","AB+","AB-","O+","O-"];

  const showToast = (type, message) => {
    setToast({ type, message });
    setTimeout(() => setToast(null), 4000);
  };

  const handleChange = (e) =>
    setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleImageUpload = (e, setter, previewSetter) => {
    const file = e.target.files[0];
    if (!file) return;
    setter(file);
    const reader = new FileReader();
    reader.onload = () => previewSetter(reader.result);
    reader.readAsDataURL(file);
  };

  const handleDocs = (e, key) => {
    const files = Array.from(e.target.files);
    setDocuments((prev) => ({ ...prev, [key]: [...prev[key], ...files] }));
  };

  const removeDoc = (key, index) =>
    setDocuments((prev) => ({
      ...prev,
      [key]: prev[key].filter((_, i) => i !== index),
    }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.employeeId.trim())                        { showToast("error","Employee ID is required."); return; }
    if (!formData.employeeName.trim())                      { showToast("error","Employee name is required."); return; }
    if (!formData.role)                                     { showToast("error","Please select a role."); return; }
    if (!formData.mobile.trim() || formData.mobile.length < 10) { showToast("error","Please enter a valid 10-digit mobile number."); return; }
    if (!formData.email.trim())                             { showToast("error","Email is required."); return; }

    setLoading(true);
    try {
      const payload = {
        employeeId:   formData.employeeId.trim(),
        employeeName: formData.employeeName.trim(),
        role:         formData.role,
        mobile:       formData.mobile.trim(),
        email:        formData.email.trim(),
        joiningDate:  formData.joiningDate || new Date().toISOString(),
        bloodGroup:   formData.bloodGroup  || "O+",
        password:     formData.password    || "Staff@123",
      };

      const response = await fetch(API_URL, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${AUTH_TOKEN}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      const json = await response.json();

      if (response.ok && json.success !== false) {
        showToast("success","Employee added successfully!");
        setTimeout(() => navigate("/staff"), 1800);
      } else {
        const errMsg = json.errors
          ? json.errors.join(", ")
          : json.message || json.error || "Failed to add employee. Please try again.";
        showToast("error", errMsg);
      }
    } catch {
      showToast("error","Network error. Please check your connection.");
    } finally {
      setLoading(false);
    }
  };

  /* ─────────────────────────── RENDER ─────────────────────────── */
  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-50/90 via-white to-teal-100/80">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap');
        *, *::before, *::after { font-family:'Inter',-apple-system,sans-serif; box-sizing:border-box; }

        .glass-card {
          background: rgba(255,255,255,0.93);
          backdrop-filter: blur(20px);
          -webkit-backdrop-filter: blur(20px);
          border: 1px solid rgba(64,224,208,0.22);
          box-shadow: 0 12px 40px -8px rgba(0,128,128,0.18);
        }

        .inp {
          width:100%;
          background:#fff;
          border:1.5px solid rgba(0,128,128,0.15);
          transition: border-color .25s, box-shadow .25s;
        }
        .inp:focus {
          border-color:#0d9488;
          box-shadow:0 0 0 3px rgba(13,148,136,0.12);
          outline:none;
        }

        .upload-zone {
          background: linear-gradient(145deg,rgba(255,255,255,0.55),rgba(240,253,250,0.35));
          border: 2px dashed rgba(0,128,128,0.25);
          transition: border-color .3s, background .3s, transform .3s;
        }
        .upload-zone:hover {
          border-color:#0d9488;
          background:rgba(20,184,166,0.06);
          transform:translateY(-2px);
        }

        .doc-card {
          background:rgba(255,255,255,0.88);
          border:1px solid rgba(20,184,166,0.18);
          box-shadow:0 2px 10px rgba(0,128,128,0.07);
          transition: box-shadow .25s, border-color .25s, transform .25s;
        }
        .doc-card:hover {
          border-color:rgba(20,184,166,0.45);
          box-shadow:0 6px 22px rgba(0,128,128,0.13);
          transform:translateY(-2px);
        }

        .badge-teal {
          background:linear-gradient(135deg,#0d9488,#0f766e);
          color:#fff;
          padding:3px 12px;
          border-radius:100px;
          font-size:11px;
          font-weight:700;
          letter-spacing:.5px;
        }

        @keyframes slideDown {
          from { opacity:0; transform:translateY(-14px); }
          to   { opacity:1; transform:translateY(0); }
        }
        .toast-in { animation:slideDown .3s ease forwards; }

        @keyframes spin { 0%{transform:rotate(0deg)} 100%{transform:rotate(360deg)} }
        .spin { animation:spin .8s linear infinite; }

        @keyframes fadeUp {
          from { opacity:0; transform:translateY(10px); }
          to   { opacity:1; transform:translateY(0); }
        }
        .fade-up { animation:fadeUp .4s ease forwards; }

        /* ── divider ── */
        .section-divider {
          display:flex; align-items:center; gap:12px;
          margin-bottom:1.25rem;
        }
        .section-divider::before, .section-divider::after {
          content:''; flex:1; height:1px;
          background:linear-gradient(to right,transparent,rgba(20,184,166,.35),transparent);
        }
      `}</style>

      {/* ── TOAST ── */}
      {toast && (
        <div className={`toast-in fixed top-4 right-4 sm:top-6 sm:right-6 z-50 flex items-center gap-3 px-4 py-3 sm:px-5 sm:py-4 rounded-2xl shadow-2xl font-semibold text-sm max-w-[calc(100vw-2rem)] sm:max-w-sm ${
          toast.type === "success" ? "bg-emerald-600 text-white" : "bg-red-600 text-white"
        }`}>
          {toast.type === "success"
            ? <CheckCircle size={18} className="shrink-0" />
            : <AlertCircle size={18} className="shrink-0" />}
          <span className="flex-1 text-xs sm:text-sm leading-snug">{toast.message}</span>
          <button onClick={() => setToast(null)} className="opacity-80 hover:opacity-100 shrink-0 ml-1">
            <X size={15} />
          </button>
        </div>
      )}

      <div className="w-full max-w-5xl mx-auto px-3 sm:px-5 md:px-6 lg:px-8 py-4 sm:py-6 lg:py-10">

        {/* ── HEADER ── */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4 mb-5 sm:mb-8 fade-up">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-2xl bg-gradient-to-br from-teal-600 to-teal-500 flex items-center justify-center shadow-lg shadow-teal-500/30 shrink-0">
              <User className="text-white" size={18} />
            </div>
            <div className="min-w-0">
              <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-800 tracking-tight truncate">
                Add New Employee
              </h1>
              <p className="text-xs sm:text-sm text-gray-500 mt-0.5">
                Create profile with secure document storage
              </p>
            </div>
          </div>
          <button
            onClick={() => navigate("/staff")}
            className="group flex items-center justify-center gap-2 px-4 sm:px-5 py-2.5 sm:py-3 rounded-xl bg-white shadow-md hover:shadow-lg border border-teal-100 hover:border-teal-300 transition-all hover:scale-[1.02] text-sm font-semibold text-teal-700 w-full sm:w-auto shrink-0"
          >
            <ArrowLeft size={16} className="group-hover:-translate-x-0.5 transition-transform" />
            Back to Staff
          </button>
        </div>

        {/* ── MAIN CARD ── */}
        <div className="glass-card rounded-2xl sm:rounded-3xl p-4 sm:p-6 lg:p-8 fade-up">

          {/* ── IMAGE UPLOADS ── */}
          <div className="section-divider">
            <span className="text-xs font-bold text-teal-600 tracking-widest uppercase whitespace-nowrap">
              Photos
            </span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6 mb-6 sm:mb-8">
            <ImageUpload
              title="Profile Photo"
              preview={profilePreview}
              icon={<User size={30} className="text-teal-400" />}
              onChange={(e) => handleImageUpload(e, setProfileImage, setProfilePreview)}
            />
            <ImageUpload
              title="ID Card Image"
              preview={idPreview}
              icon={<CreditCard size={30} className="text-teal-400" />}
              onChange={(e) => handleImageUpload(e, setIdCardImage, setIdPreview)}
            />
          </div>

          {/* ── FORM ── */}
          <form onSubmit={handleSubmit}>
            <div className="section-divider">
              <span className="text-xs font-bold text-teal-600 tracking-widest uppercase whitespace-nowrap">
                Employee Details
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 sm:gap-4 lg:gap-5 mb-6 sm:mb-8">
              <FInput label="Employee ID"   icon={<User size={14}/>} name="employeeId"   value={formData.employeeId}   onChange={handleChange} placeholder="e.g. PMS22022513" required />
              <FInput label="Employee Name" icon={<User size={14}/>} name="employeeName" value={formData.employeeName} onChange={handleChange} placeholder="e.g. Ravi Kumar"   required />
              <FSelect label="Role"         icon={<Briefcase size={14}/>} name="role"     value={formData.role}         onChange={handleChange} options={roles}       required />
              <FInput  label="Mobile"       icon={<Phone size={14}/>}     name="mobile"   value={formData.mobile}       onChange={handleChange} placeholder="10-digit number" maxLength={10} required />
              <FInput  label="Email"        icon={<Mail size={14}/>}      name="email"    value={formData.email}        onChange={handleChange} type="email" placeholder="e.g. ravi@gmail.com" required />
              <FInput  label="Joining Date" icon={<Calendar size={14}/>}  name="joiningDate" value={formData.joiningDate} onChange={handleChange} type="date" required />
              <FSelect label="Blood Group"  icon={<Droplet size={14}/>}   name="bloodGroup"  value={formData.bloodGroup}  onChange={handleChange} options={bloodGroups} />
              <FInput  label="Password"     icon={<Lock size={14}/>}      name="password" value={formData.password}     onChange={handleChange} type="password" placeholder="Min 6 chars" required />
            </div>

            {/* ── DOCUMENTS ── */}
            <div className="section-divider">
              <span className="text-xs font-bold text-teal-600 tracking-widest uppercase whitespace-nowrap">
                Documents
              </span>
            </div>

            <div className="flex items-center gap-2.5 mb-4">
              <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-teal-100 flex items-center justify-center shrink-0">
                <Shield className="text-teal-600" size={15} />
              </div>
              <h2 className="text-sm sm:text-base font-bold text-gray-800">Employee Documents</h2>
              <span className="badge-teal hidden sm:inline">Secure Vault</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 mb-6 sm:mb-8">
              {Object.keys(documents).map((key) => (
                <DocUpload
                  key={key}
                  title={formatTitle(key)}
                  files={documents[key]}
                  onChange={(e) => handleDocs(e, key)}
                  remove={(i) => removeDoc(key, i)}
                />
              ))}
            </div>

            {/* ── SUBMIT ── */}
            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2.5 py-3.5 sm:py-4 px-6 rounded-xl bg-gradient-to-r from-teal-600 to-teal-500 text-white font-bold text-sm sm:text-base shadow-lg shadow-teal-500/25 hover:shadow-xl hover:shadow-teal-500/35 hover:scale-[1.01] active:scale-[0.99] transition-all duration-300 disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:scale-100"
            >
              {loading ? (
                <><Loader size={18} className="spin" />Adding Employee…</>
              ) : (
                <><User size={18} />Add Employee to Directory</>
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

/* ──────────────────────── SUB-COMPONENTS ──────────────────────── */

const ImageUpload = ({ title, preview, onChange, icon }) => (
  <div>
    <p className="text-xs sm:text-sm font-semibold text-gray-700 mb-2 flex items-center gap-1.5">
      <span className="w-1.5 h-1.5 rounded-full bg-teal-500 inline-block shrink-0" />
      {title}
    </p>
    <label className="cursor-pointer block">
      <div className={`upload-zone relative h-40 sm:h-48 lg:h-52 rounded-xl sm:rounded-2xl overflow-hidden flex items-center justify-center ${
        preview ? "border-solid !border-teal-400" : ""
      }`}>
        {preview ? (
          <>
            <img src={preview} alt="" className="w-full h-full object-cover" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent" />
            <span className="absolute bottom-2.5 left-2.5 bg-white/90 backdrop-blur-sm px-2.5 py-1 rounded-lg text-xs font-semibold text-teal-700">
              ✓ Uploaded
            </span>
          </>
        ) : (
          <div className="text-center px-4 py-6">
            <div className="flex justify-center mb-2">{icon}</div>
            <p className="text-xs sm:text-sm font-medium text-gray-600">Click to upload</p>
            <p className="text-xs text-gray-400 mt-0.5">PNG, JPG up to 5MB</p>
          </div>
        )}
      </div>
      <input type="file" className="hidden" accept="image/*" onChange={onChange} />
    </label>
  </div>
);

const DocUpload = ({ title, files, onChange, remove }) => (
  <div className="doc-card rounded-xl p-3.5 sm:p-4">
    <div className="flex items-center justify-between mb-2.5 gap-2">
      <span className="flex items-center gap-1.5 text-xs sm:text-sm font-semibold text-gray-700 truncate">
        <File size={13} className="text-teal-500 shrink-0" />
        <span className="truncate">{title}</span>
      </span>
      {files.length > 0 && (
        <span className="bg-teal-100 text-teal-700 px-2 py-0.5 rounded-full text-xs font-bold shrink-0">
          {files.length}
        </span>
      )}
    </div>
    <label className="cursor-pointer block">
      <div className="border-2 border-dashed border-teal-200/60 rounded-lg h-16 sm:h-20 flex flex-col items-center justify-center gap-1 hover:border-teal-400 hover:bg-teal-50/50 transition-all">
        <File className="text-teal-300" size={18} />
        <span className="text-xs text-gray-400 font-medium">Upload Files</span>
      </div>
      <input multiple type="file" className="hidden" onChange={onChange} />
    </label>
    {files.length > 0 && (
      <div className="mt-2.5 space-y-1.5 max-h-24 overflow-y-auto">
        {files.map((file, i) => (
          <div key={i} className="flex items-center justify-between bg-gray-50 px-2.5 py-1.5 rounded-lg gap-2">
            <span className="text-xs truncate text-gray-600 font-medium flex-1">{file.name}</span>
            <button type="button" onClick={() => remove(i)} className="shrink-0">
              <X size={13} className="text-red-400 hover:text-red-600 transition-colors" />
            </button>
          </div>
        ))}
      </div>
    )}
  </div>
);

const FInput = ({ label, icon, className = "", ...props }) => (
  <div>
    <label className="text-xs sm:text-sm font-semibold text-gray-700 mb-1 sm:mb-1.5 block">{label}</label>
    <div className="relative">
      {icon && (
        <span className="absolute left-3 sm:left-3.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none">
          {icon}
        </span>
      )}
      <input
        {...props}
        className={`inp h-10 sm:h-11 ${icon ? "pl-9 sm:pl-10" : "pl-3.5"} pr-3.5 rounded-lg sm:rounded-xl text-sm text-gray-700 placeholder:text-gray-400 ${className}`}
      />
    </div>
  </div>
);

const FSelect = ({ label, icon, options, className = "", ...props }) => (
  <div>
    <label className="text-xs sm:text-sm font-semibold text-gray-700 mb-1 sm:mb-1.5 block">{label}</label>
    <div className="relative">
      {icon && (
        <span className="absolute left-3 sm:left-3.5 top-1/2 -translate-y-1/2 text-gray-400 z-10 pointer-events-none">
          {icon}
        </span>
      )}
      <select
        {...props}
        className={`inp h-10 sm:h-11 ${icon ? "pl-9 sm:pl-10" : "pl-3.5"} pr-8 rounded-lg sm:rounded-xl text-sm text-gray-700 appearance-none cursor-pointer ${className}`}
      >
        <option value="">Select {label}</option>
        {options.map((o) => <option key={o} value={o}>{o}</option>)}
      </select>
      <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={14} />
    </div>
  </div>
);

const formatTitle = (key) =>
  key.replace(/([A-Z])/g, " $1").replace(/^./, (s) => s.toUpperCase());

export default AddStaff;