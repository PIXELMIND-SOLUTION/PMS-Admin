import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  ArrowLeft,
  Upload,
  User,
  Mail,
  Phone,
  Briefcase,
  Calendar,
  Droplet,
  Lock,
  CreditCard,
  CheckCircle,
  AlertCircle,
  Loader,
  X,
  ChevronDown,
} from "lucide-react";

const API_URL = "https://pms-backend-t3ox.onrender.com/api/staff";
const adminDetails = JSON.parse(sessionStorage.getItem("adminDetails"));
const AUTH_TOKEN = adminDetails?.token;

const EditStaff = () => {
  const { id }    = useParams();
  const navigate  = useNavigate();

  const [loading,    setLoading]    = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [toast,      setToast]      = useState(null);

  const [profilePreview, setProfilePreview] = useState(null);
  const [profileImage,   setProfileImage]   = useState(null);
  const [idCardPreview,  setIdCardPreview]  = useState(null);
  const [idCardImage,    setIdCardImage]    = useState(null);

  const [formData, setFormData] = useState({
    employeeId:   "",
    employeeName: "",
    mobile:       "",
    email:        "",
    role:         "",
    joiningDate:  "",
    bloodGroup:   "",
    password:     "",
    isActive:     true,
  });

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

  useEffect(() => { fetchStaff(); }, [id]);

  const fetchStaff = async () => {
    try {
      const res  = await fetch(`${API_URL}/${id}`, {
        headers: { Authorization: `Bearer ${AUTH_TOKEN}` },
      });
      const data = await res.json();
      if (!data.success) throw new Error(data.message || "Failed to load staff");

      const s = data.data;
      setFormData({
        employeeId:   s.employeeId   || "",
        employeeName: s.employeeName || "",
        mobile:       s.mobile       || "",
        email:        s.email        || "",
        role:         s.role         || "",
        joiningDate:  s.joiningDate?.split("T")[0] || "",
        bloodGroup:   s.bloodGroup   || "",
        password:     "",
        isActive:     s.isActive ?? true,
      });
      if (s.profileImage && !s.profileImage.startsWith("/data/user")) setProfilePreview(s.profileImage);
      if (s.idCardImage  && !s.idCardImage.startsWith("/data/user"))  setIdCardPreview(s.idCardImage);
    } catch (err) {
      showToast("error", err.message || "Failed to load staff");
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((p) => ({ ...p, [name]: type === "checkbox" ? checked : value }));
  };

  const handleImageChange = (e, setFile, setPreview) => {
    const file = e.target.files[0];
    if (!file) return;
    setFile(file);
    const reader = new FileReader();
    reader.onload = () => setPreview(reader.result);
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const payload = {
        employeeId:   formData.employeeId.trim(),
        employeeName: formData.employeeName.trim(),
        mobile:       formData.mobile.trim(),
        email:        formData.email.trim(),
        role:         formData.role,
        joiningDate:  formData.joiningDate,
        bloodGroup:   formData.bloodGroup,
        isActive:     formData.isActive,
        ...(formData.password && { password: formData.password }),
      };

      const res  = await fetch(`${API_URL}/${id}`, {
        method: "PUT",
        headers: {
          Authorization:  `Bearer ${AUTH_TOKEN}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });
      const data = await res.json();

      if (res.ok && data.success !== false) {
        showToast("success","Staff updated successfully!");
        setTimeout(() => navigate("/staff"), 1800);
      } else {
        const errMsg = data.errors
          ? data.errors.join(", ")
          : data.message || "Update failed. Please try again.";
        showToast("error", errMsg);
      }
    } catch {
      showToast("error","Network error. Please check your connection.");
    } finally {
      setSubmitting(false);
    }
  };

  /* ── LOADING SCREEN ── */
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-teal-50 via-white to-teal-50 flex items-center justify-center px-4">
        <style>{`@keyframes spin{0%{transform:rotate(0deg)}100%{transform:rotate(360deg)}}`}</style>
        <div className="flex flex-col items-center gap-3">
          <div style={{ width:44,height:44,border:"3px solid #e0f2f1",borderTop:"3px solid #0d9488",borderRadius:"50%",animation:"spin .8s linear infinite" }} />
          <p className="text-gray-500 font-medium text-sm">Loading staff data…</p>
        </div>
      </div>
    );
  }

  /* ─────────────────────────── RENDER ─────────────────────────── */
  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-50 via-white to-teal-50/80">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap');
        *, *::before, *::after { font-family:'Inter',-apple-system,sans-serif; box-sizing:border-box; }

        .page-card {
          background:rgba(255,255,255,0.95);
          border:1px solid rgba(20,184,166,0.14);
          box-shadow:0 4px 28px -4px rgba(0,128,128,0.10), 0 1px 4px rgba(0,0,0,0.04);
        }

        .e-inp {
          width:100%;
          background:#fff;
          border:1.5px solid rgba(0,128,128,0.15);
          transition:border-color .22s, box-shadow .22s;
        }
        .e-inp:focus {
          border-color:#0d9488;
          box-shadow:0 0 0 3px rgba(13,148,136,0.11);
          outline:none;
        }

        .img-zone {
          border:2px dashed rgba(0,128,128,0.22);
          background:linear-gradient(135deg,rgba(240,253,250,.55),rgba(255,255,255,.4));
          transition:border-color .25s, background .25s, transform .25s;
        }
        .img-zone:hover {
          border-color:#0d9488;
          background:rgba(20,184,166,0.06);
          transform:translateY(-1px);
        }

        @keyframes slideDown { from{opacity:0;transform:translateY(-12px)} to{opacity:1;transform:translateY(0)} }
        .toast-in { animation:slideDown .3s ease forwards; }

        @keyframes spin { 0%{transform:rotate(0deg)} 100%{transform:rotate(360deg)} }
        .spin-i { animation:spin .8s linear infinite; }

        @keyframes fadeUp { from{opacity:0;transform:translateY(10px)} to{opacity:1;transform:translateY(0)} }
        .fade-up { animation:fadeUp .35s ease forwards; }

        /* toggle */
        .toggle-track {
          position:relative; display:inline-flex; align-items:center;
          width:44px; height:24px; border-radius:100px;
          transition:background .25s;
          cursor:pointer; flex-shrink:0;
        }
        .toggle-thumb {
          position:absolute; top:2px; left:2px;
          width:20px; height:20px; border-radius:50%;
          background:#fff; box-shadow:0 1px 4px rgba(0,0,0,.18);
          transition:transform .25s;
        }

        /* section divider */
        .s-div {
          display:flex; align-items:center; gap:10px;
          margin-bottom:1rem;
        }
        .s-div::before, .s-div::after {
          content:''; flex:1; height:1px;
          background:linear-gradient(to right,transparent,rgba(20,184,166,.3),transparent);
        }
      `}</style>

      {/* ── TOAST ── */}
      {toast && (
        <div className={`toast-in fixed top-4 right-4 sm:top-6 sm:right-6 z-50 flex items-center gap-2.5 px-4 py-3 sm:px-5 sm:py-3.5 rounded-2xl shadow-2xl font-semibold text-sm max-w-[calc(100vw-2rem)] sm:max-w-sm ${
          toast.type === "success" ? "bg-emerald-600 text-white" : "bg-red-600 text-white"
        }`}>
          {toast.type === "success"
            ? <CheckCircle size={17} className="shrink-0" />
            : <AlertCircle size={17} className="shrink-0" />}
          <span className="flex-1 text-xs sm:text-sm leading-snug">{toast.message}</span>
          <button onClick={() => setToast(null)} className="opacity-80 hover:opacity-100 shrink-0 ml-1">
            <X size={14} />
          </button>
        </div>
      )}

      <div className="w-full max-w-4xl mx-auto px-3 sm:px-5 md:px-6 lg:px-8 py-4 sm:py-6 lg:py-10">

        {/* ── HEADER ── */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5 sm:mb-7 fade-up">
          <div className="flex items-center gap-3 min-w-0">
            <button
              onClick={() => navigate("/staff")}
              className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-white shadow-md border border-gray-100 flex items-center justify-center text-gray-500 hover:text-teal-600 hover:border-teal-200 transition-all shrink-0"
            >
              <ArrowLeft size={17} />
            </button>
            <div className="min-w-0">
              <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-800 tracking-tight">
                Edit Staff Member
              </h1>
              <p className="text-xs text-gray-400 mt-0.5">Update employee profile &amp; details</p>
            </div>
          </div>
          <span className={`self-start sm:self-auto shrink-0 px-3 py-1.5 rounded-full text-xs font-bold ${
            formData.isActive ? "bg-emerald-100 text-emerald-700" : "bg-gray-100 text-gray-500"
          }`}>
            {formData.isActive ? "● Active" : "○ Inactive"}
          </span>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-5 fade-up">

          {/* ────── PHOTOS ────── */}
          <div className="page-card rounded-2xl sm:rounded-3xl p-4 sm:p-6">
            <div className="s-div">
              <span className="text-xs font-bold text-teal-600 tracking-widest uppercase whitespace-nowrap">📸 Photos</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">

              {/* Profile */}
              <div>
                <p className="text-xs sm:text-sm font-semibold text-gray-600 mb-2.5 flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-teal-500 inline-block shrink-0" />
                  Profile Photo
                </p>
                <div className="flex flex-col xs:flex-row items-center gap-3 sm:gap-4">
                  <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl bg-gray-100 overflow-hidden border-2 border-teal-100 flex items-center justify-center shrink-0">
                    {profilePreview
                      ? <img src={profilePreview} className="w-full h-full object-cover" alt="profile" />
                      : <User className="text-gray-300" size={28} />}
                  </div>
                  <div className="flex-1 w-full xs:w-auto text-center">
                    <label className="cursor-pointer inline-block w-full xs:w-auto">
                      <div className="img-zone rounded-xl px-4 py-2.5 flex items-center justify-center gap-2 text-teal-700 font-semibold text-xs sm:text-sm">
                        <Upload size={14} />
                        {profilePreview ? "Change Photo" : "Upload Photo"}
                      </div>
                      <input type="file" className="hidden" accept="image/*"
                        onChange={(e) => handleImageChange(e, setProfileImage, setProfilePreview)} />
                    </label>
                    <p className="text-xs text-gray-400 mt-1.5">JPG, PNG up to 5MB</p>
                  </div>
                </div>
              </div>

              {/* ID Card */}
              <div>
                <p className="text-xs sm:text-sm font-semibold text-gray-600 mb-2.5 flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-teal-500 inline-block shrink-0" />
                  ID Card Image
                </p>
                <div className="flex flex-col xs:flex-row items-center gap-3 sm:gap-4">
                  <div className="w-28 h-20 sm:w-32 sm:h-20 rounded-xl bg-gray-100 overflow-hidden border-2 border-teal-100 flex items-center justify-center shrink-0">
                    {idCardPreview
                      ? <img src={idCardPreview} className="w-full h-full object-cover" alt="id card" />
                      : <CreditCard className="text-gray-300" size={24} />}
                  </div>
                  <div className="flex-1 w-full xs:w-auto text-center">
                    <label className="cursor-pointer inline-block w-full xs:w-auto">
                      <div className="img-zone rounded-xl px-4 py-2.5 flex items-center justify-center gap-2 text-teal-700 font-semibold text-xs sm:text-sm">
                        <Upload size={14} />
                        {idCardPreview ? "Change ID Card" : "Upload ID Card"}
                      </div>
                      <input type="file" className="hidden" accept="image/*"
                        onChange={(e) => handleImageChange(e, setIdCardImage, setIdCardPreview)} />
                    </label>
                    <p className="text-xs text-gray-400 mt-1.5">JPG, PNG up to 5MB</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* ────── PERSONAL INFO ────── */}
          <div className="page-card rounded-2xl sm:rounded-3xl p-4 sm:p-6">
            <div className="s-div">
              <span className="text-xs font-bold text-teal-600 tracking-widest uppercase whitespace-nowrap">👤 Personal Information</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 sm:gap-4">
              <EInp icon={<User size={14}/>}     label="Employee ID"   name="employeeId"   value={formData.employeeId}   onChange={handleChange} placeholder="e.g. PMS22022513" required />
              <EInp icon={<User size={14}/>}     label="Employee Name" name="employeeName" value={formData.employeeName} onChange={handleChange} placeholder="Full Name" required />
              <EInp icon={<Phone size={14}/>}    label="Mobile"        name="mobile"       value={formData.mobile}       onChange={handleChange} placeholder="10-digit number" maxLength={10} required />
              <EInp icon={<Mail size={14}/>}     label="Email"         name="email" type="email" value={formData.email}  onChange={handleChange} placeholder="email@example.com" required />
              <ESel icon={<Briefcase size={14}/>} label="Role"         name="role"         value={formData.role}         onChange={handleChange} options={roles} required />
              <EInp icon={<Calendar size={14}/>} label="Joining Date"  name="joiningDate" type="date" value={formData.joiningDate} onChange={handleChange} />
              <ESel icon={<Droplet size={14}/>}  label="Blood Group"   name="bloodGroup"   value={formData.bloodGroup}   onChange={handleChange} options={bloodGroups} />
              <EInp icon={<Lock size={14}/>}     label="New Password"  name="password" type="password" value={formData.password} onChange={handleChange} placeholder="Leave blank to keep current" />
            </div>
          </div>

          {/* ────── STATUS ────── */}
          <div className="page-card rounded-2xl sm:rounded-3xl p-4 sm:p-5">
            <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4">
              {/* Custom toggle */}
              <label className="cursor-pointer shrink-0">
                <input
                  type="checkbox"
                  name="isActive"
                  checked={formData.isActive}
                  onChange={handleChange}
                  className="sr-only"
                />
                <div
                  className="toggle-track"
                  style={{ background: formData.isActive ? "#0d9488" : "#d1d5db" }}
                >
                  <div
                    className="toggle-thumb"
                    style={{ transform: formData.isActive ? "translateX(20px)" : "translateX(0)" }}
                  />
                </div>
              </label>
              <div className="flex-1 min-w-0">
                <p className="font-bold text-gray-800 text-sm sm:text-base leading-tight">
                  {formData.isActive ? "Active Employee" : "Inactive Employee"}
                </p>
                <p className="text-xs text-gray-500 mt-0.5">
                  {formData.isActive
                    ? "Employee can log in and appears in active reports"
                    : "Employee is deactivated and hidden from active lists"}
                </p>
              </div>
              <span className={`self-start sm:self-auto shrink-0 px-3 py-1.5 rounded-full text-xs font-bold ${
                formData.isActive ? "bg-emerald-100 text-emerald-700" : "bg-gray-100 text-gray-500"
              }`}>
                {formData.isActive ? "Active" : "Inactive"}
              </span>
            </div>
          </div>

          {/* ────── ACTION BUTTONS ────── */}
          <div className="flex flex-col-reverse sm:flex-row gap-3 pt-1">
            <button
              type="button"
              onClick={() => navigate("/staff")}
              className="flex-1 sm:flex-none sm:w-36 py-3 sm:py-3.5 rounded-xl border-2 border-gray-200 font-bold text-sm text-gray-600 hover:bg-gray-50 hover:border-gray-300 transition-all"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="flex-1 flex items-center justify-center gap-2 bg-gradient-to-r from-teal-600 to-teal-500 text-white py-3 sm:py-3.5 rounded-xl font-bold text-sm sm:text-base shadow-lg shadow-teal-500/25 hover:shadow-xl hover:scale-[1.01] active:scale-[0.99] transition-all disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:scale-100"
            >
              {submitting
                ? <><Loader size={17} className="spin-i" />Updating…</>
                : "Update Staff"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

/* ──────────────────────── SUB-COMPONENTS ──────────────────────── */

const EInp = ({ icon, label, className = "", ...props }) => (
  <div>
    {label && (
      <label className="text-xs sm:text-sm font-semibold text-gray-700 mb-1 sm:mb-1.5 block">
        {label}
      </label>
    )}
    <div className="relative">
      {icon && (
        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none z-10">
          {icon}
        </span>
      )}
      <input
        {...props}
        className={`e-inp h-10 sm:h-11 ${icon ? "pl-9" : "pl-3.5"} pr-3.5 rounded-lg sm:rounded-xl text-xs sm:text-sm text-gray-700 placeholder:text-gray-400 ${className}`}
      />
    </div>
  </div>
);

const ESel = ({ icon, label, options, className = "", ...props }) => (
  <div>
    {label && (
      <label className="text-xs sm:text-sm font-semibold text-gray-700 mb-1 sm:mb-1.5 block">
        {label}
      </label>
    )}
    <div className="relative">
      {icon && (
        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 z-10 pointer-events-none">
          {icon}
        </span>
      )}
      <select
        {...props}
        className={`e-inp h-10 sm:h-11 ${icon ? "pl-9" : "pl-3.5"} pr-8 rounded-lg sm:rounded-xl text-xs sm:text-sm text-gray-700 appearance-none cursor-pointer ${className}`}
      >
        <option value="">Select {label}</option>
        {options.map((o) => <option key={o} value={o}>{o}</option>)}
      </select>
      <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={13} />
    </div>
  </div>
);

export default EditStaff;