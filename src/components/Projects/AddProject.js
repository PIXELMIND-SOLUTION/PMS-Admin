import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import { FolderPlus, Plus, X, CheckCircle, AlertCircle, Loader } from "lucide-react";

const API_URL = "https://pmsbackend.pixelmindsolutions.com/api/projects";
const adminDetails = JSON.parse(sessionStorage.getItem("adminDetails"));
const AUTH_TOKEN = adminDetails?.token;

const AddProject = () => {
  const navigate = useNavigate();

  const [projectType, setProjectType] = useState("website");
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState(null);

  const [formData, setFormData] = useState({
    projectName: "",
    clientName: "",
    clientMobile: "",
    clientEmail: "",
    clientAddress: "",
    startDate: "",
    duration: "",
    projectCost: "",
    milestone: "",
    status: "active",
    deadlineDate: "",
    projectHandoverDate: "",
  });

  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});

  const [appDetails, setAppDetails] = useState({
    appId: "",
    appName: "",
    timeline: { designing: "", frontend: "", backend: "", deployment: "" },
  });

  const [appErrors, setAppErrors] = useState({});

  const [budget, setBudget] = useState([]);
  const [installment, setInstallment] = useState({ title: "", amount: "", deadline: "" });

  const [marketing, setMarketing] = useState({
    reels: { enabled: false, duration: "", quantity: "", startDate: "" },
    posters: { enabled: false, duration: "", quantity: "", startDate: "" },
    seo: false,
    keywords: false,
    banners: false,
  });

  // Validation functions
  const validateField = (name, value) => {
    let error = "";

    switch (name) {
      case "projectName":
        if (!value.trim()) {
          error = "Project name is required";
        } else if (value.trim().length < 3) {
          error = "Project name must be at least 3 characters";
        }
        break;

      case "clientName":
        if (!value.trim()) {
          error = "Client name is required";
        } else if (value.trim().length < 2) {
          error = "Client name must be at least 2 characters";
        } else if (!/^[a-zA-Z\s\-\.]+$/.test(value.trim())) {
          error = "Client name can only contain letters, spaces, hyphens, and dots";
        }
        break;

      case "clientMobile":
        if (value && !/^[0-9]{10}$/.test(value)) {
          error = "Mobile number must be exactly 10 digits";
        }
        break;

      case "clientEmail":
        if (value && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
          error = "Please enter a valid email address";
        }
        break;

      case "startDate":
        if (value) {
          const selectedDate = new Date(value);
          const today = new Date();
          today.setHours(0, 0, 0, 0);
          if (selectedDate < today) {
            error = "Start date cannot be in the past";
          }
        }
        break;

      case "deadlineDate":
        if (value && formData.startDate) {
          const deadline = new Date(value);
          const startDate = new Date(formData.startDate);
          if (deadline < startDate) {
            error = "Deadline cannot be before start date";
          }
        }
        break;

      case "projectHandoverDate":
        if (value && formData.startDate) {
          const handover = new Date(value);
          const startDate = new Date(formData.startDate);
          if (handover < startDate) {
            error = "Handover date cannot be before start date";
          }
        }
        if (value && formData.deadlineDate) {
          const handover = new Date(value);
          const deadline = new Date(formData.deadlineDate);
          if (handover > deadline) {
            error = "Handover date cannot be after deadline";
          }
        }
        break;

      case "projectCost":
        if (value && Number(value) < 0) {
          error = "Project cost cannot be negative";
        }
        break;

      case "milestone":
        if (value && (Number(value) < 0 || !Number.isInteger(Number(value)))) {
          error = "Milestones must be a positive integer";
        }
        break;

      default:
        break;
    }

    return error;
  };

  const validateAppDetails = () => {
    const newErrors = {};
    if (appDetails.timeline.designing && !/^\d+\s*(day|week|month|year)s?$/i.test(appDetails.timeline.designing)) {
      newErrors.designing = "Format: e.g., 2 Weeks, 3 Days";
    }
    if (appDetails.timeline.frontend && !/^\d+\s*(day|week|month|year)s?$/i.test(appDetails.timeline.frontend)) {
      newErrors.frontend = "Format: e.g., 2 Weeks, 3 Days";
    }
    if (appDetails.timeline.backend && !/^\d+\s*(day|week|month|year)s?$/i.test(appDetails.timeline.backend)) {
      newErrors.backend = "Format: e.g., 2 Weeks, 3 Days";
    }
    if (appDetails.timeline.deployment && !/^\d+\s*(day|week|month|year)s?$/i.test(appDetails.timeline.deployment)) {
      newErrors.deployment = "Format: e.g., 2 Weeks, 3 Days";
    }
    setAppErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateForm = () => {
    const newErrors = {};

    newErrors.projectName = validateField("projectName", formData.projectName);
    newErrors.clientName = validateField("clientName", formData.clientName);
    newErrors.clientMobile = validateField("clientMobile", formData.clientMobile);
    newErrors.clientEmail = validateField("clientEmail", formData.clientEmail);
    newErrors.startDate = validateField("startDate", formData.startDate);
    newErrors.deadlineDate = validateField("deadlineDate", formData.deadlineDate);
    newErrors.projectHandoverDate = validateField("projectHandoverDate", formData.projectHandoverDate);
    newErrors.projectCost = validateField("projectCost", formData.projectCost);
    newErrors.milestone = validateField("milestone", formData.milestone);

    setErrors(newErrors);

    const hasErrors = Object.values(newErrors).some(error => error);
    
    if (!hasErrors && (projectType !== "digital market")) {
      return validateAppDetails();
    }
    
    return !hasErrors;
  };

  const handleBlur = (name) => {
    setTouched(prev => ({ ...prev, [name]: true }));
    const error = validateField(name, formData[name]);
    setErrors(prev => ({ ...prev, [name]: error }));
  };

  const showToast = (type, message) => {
    setToast({ type, message });
    setTimeout(() => setToast(null), 4000);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    
    if (touched[name]) {
      const error = validateField(name, value);
      setErrors(prev => ({ ...prev, [name]: error }));
    }
  };

  const handleTimelineChange = (e) => {
    const { name, value } = e.target;
    setAppDetails({
      ...appDetails,
      timeline: { ...appDetails.timeline, [name]: value },
    });
    
    if (value && !/^\d+\s*(day|week|month|year)s?$/i.test(value)) {
      setAppErrors(prev => ({ ...prev, [name]: "Format: e.g., 2 Weeks, 3 Days" }));
    } else {
      setAppErrors(prev => ({ ...prev, [name]: "" }));
    }
  };

  const addInstallment = () => {
    if (!installment.title.trim()) {
      Swal.fire({
        icon: 'warning',
        title: 'Missing Information',
        text: 'Please enter an installment title.',
        confirmButtonColor: '#0d9488',
      });
      return;
    }
    if (!installment.amount || Number(installment.amount) <= 0) {
      Swal.fire({
        icon: 'warning',
        title: 'Invalid Amount',
        text: 'Please enter a valid positive amount.',
        confirmButtonColor: '#0d9488',
      });
      return;
    }
    
    setBudget([...budget, { ...installment, amount: Number(installment.amount) }]);
    setInstallment({ title: "", amount: "", deadline: "" });
    
    Swal.fire({
      icon: 'success',
      title: 'Installment Added',
      text: `${installment.title} of ₹${installment.amount} has been added.`,
      confirmButtonColor: '#0d9488',
      timer: 1500,
      showConfirmButton: false,
    });
  };

  const removeInstallment = (index) => {
    const removed = budget[index];
    Swal.fire({
      icon: 'question',
      title: 'Remove Installment?',
      text: `Are you sure you want to remove "${removed.title}"?`,
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#0d9488',
      confirmButtonText: 'Yes, remove',
      cancelButtonText: 'Cancel'
    }).then((result) => {
      if (result.isConfirmed) {
        setBudget(budget.filter((_, i) => i !== index));
        Swal.fire('Removed!', 'Installment has been removed.', 'success');
      }
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Mark all fields as touched
    const allFields = ['projectName', 'clientName', 'clientMobile', 'clientEmail', 'startDate', 'deadlineDate', 'projectHandoverDate', 'projectCost', 'milestone'];
    const touchedFields = {};
    allFields.forEach(field => { touchedFields[field] = true; });
    setTouched(touchedFields);

    // Validate form
    if (!validateForm()) {
      const errorMessages = Object.values(errors).filter(e => e);
      if (errorMessages.length > 0) {
        Swal.fire({
          icon: 'error',
          title: 'Validation Error',
          text: errorMessages[0],
          confirmButtonColor: '#0d9488',
        });
      }
      
      // Scroll to first error
      const firstErrorField = Object.keys(errors).find(key => errors[key]);
      if (firstErrorField) {
        const element = document.querySelector(`[name="${firstErrorField}"]`);
        if (element) {
          element.scrollIntoView({ behavior: 'smooth', block: 'center' });
          element.focus();
        }
      }
      return;
    }

    if (!formData.projectName.trim()) {
      Swal.fire({
        icon: 'error',
        title: 'Missing Information',
        text: 'Project name is required.',
        confirmButtonColor: '#0d9488',
      });
      return;
    }
    
    if (!formData.clientName.trim()) {
      Swal.fire({
        icon: 'error',
        title: 'Missing Information',
        text: 'Client name is required.',
        confirmButtonColor: '#0d9488',
      });
      return;
    }

    setLoading(true);

    try {
      const payload = {
        projectName: formData.projectName.trim(),
        clientName: formData.clientName.trim(),
        clientMobile: formData.clientMobile || "",
        clientEmail: formData.clientEmail || "",
        clientAddress: formData.clientAddress || "",
        category: projectType,
        startDate: formData.startDate || null,
        projectHandoverDate: formData.projectHandoverDate || null,
        deadlineDate: formData.deadlineDate || null,
        duration: formData.duration || "",
        projectCost: formData.projectCost ? Number(formData.projectCost) : 0,
        milestone: formData.milestone ? Number(formData.milestone) : 0,
        status: formData.status || "active",
        budgetInstallments: budget,
        milestonePayments: [],
        teamMembers: { frontend: [], backend: [], designer: [], tester: [], manager: [] }
      };

      if (projectType !== "digital market") {
        payload.appDetails = {
          appId: appDetails.appId || "",
          appName: appDetails.appName || "",
          timeline: {
            designing: appDetails.timeline.designing || "",
            frontend: appDetails.timeline.frontend || "",
            backend: appDetails.timeline.backend || "",
            deployment: appDetails.timeline.deployment || ""
          }
        };
      }

      if (projectType === "digital market") {
        payload.marketing = {
          reels: {
            enabled: marketing.reels.enabled,
            duration: marketing.reels.duration || "",
            quantity: marketing.reels.quantity ? Number(marketing.reels.quantity) : 0,
            startDate: marketing.reels.startDate || null
          },
          posters: {
            enabled: marketing.posters.enabled,
            duration: marketing.posters.duration || "",
            quantity: marketing.posters.quantity ? Number(marketing.posters.quantity) : 0,
            startDate: marketing.posters.startDate || null
          },
          seo: marketing.seo || false,
          keywords: marketing.keywords || false,
          banners: marketing.banners || false
        };
      }

      const response = await fetch(API_URL, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${AUTH_TOKEN}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (response.ok && data.success !== false) {
        Swal.fire({
          icon: 'success',
          title: 'Project Created!',
          text: `Project "${data.data.projectName}" has been created successfully.`,
          confirmButtonColor: '#0d9488',
          timer: 2000,
          timerProgressBar: true,
        }).then(() => {
          navigate("/projects");
        });
      } else {
        const msg = data.errors
          ? data.errors.join(", ")
          : data.message || "Failed to create project.";
        
        Swal.fire({
          icon: 'error',
          title: 'Creation Failed',
          text: msg,
          confirmButtonColor: '#0d9488',
        });
      }
    } catch (error) {
      console.error("Submit error:", error);
      Swal.fire({
        icon: 'error',
        title: 'Network Error',
        text: 'Unable to connect to the server. Please check your connection and try again.',
        confirmButtonColor: '#0d9488',
      });
    } finally {
      setLoading(false);
    }
  };

  const typeButtons = [
    { value: "website", label: "Website" },
    { value: "mobile app", label: "Mobile App" },
    { value: "software", label: "Software" },
    { value: "digital market", label: "Digital Marketing" },
  ];

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
        .f-inp-error { border-color:#ef4444; }
        .f-inp-error:focus { border-color:#ef4444; box-shadow:0 0 0 3px rgba(239,68,68,0.11); }

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
        <div className={`toast-in fixed top-4 right-4 sm:top-6 sm:right-6 z-50 flex items-center gap-2.5 px-4 py-3 rounded-2xl shadow-2xl font-semibold text-sm max-w-[calc(100vw-2rem)] sm:max-w-sm ${toast.type === "success" ? "bg-emerald-600 text-white" : "bg-red-600 text-white"
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

            {/* CLIENT INFO */}
            <div>
              <div className="s-div"><span className="text-xs font-bold text-teal-600 tracking-widest uppercase whitespace-nowrap">👤 Client Information</span></div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 sm:gap-4">
                <FInp 
                  name="projectName" 
                  value={formData.projectName} 
                  onChange={handleChange} 
                  onBlur={() => handleBlur("projectName")}
                  placeholder="Project Name" 
                  label="Project Name" 
                  required 
                  error={touched.projectName && errors.projectName}
                />
                <FInp 
                  name="clientName" 
                  value={formData.clientName} 
                  onChange={handleChange} 
                  onBlur={() => handleBlur("clientName")}
                  placeholder="Client Name" 
                  label="Client Name" 
                  required 
                  error={touched.clientName && errors.clientName}
                />
                <FInp
                  name="clientMobile"
                  value={formData.clientMobile}
                  onChange={(e) => {
                    const value = e.target.value.replace(/\D/g, "").slice(0, 10);
                    setFormData((prev) => ({
                      ...prev,
                      clientMobile: value,
                    }));
                    if (touched.clientMobile) {
                      const error = validateField("clientMobile", value);
                      setErrors(prev => ({ ...prev, clientMobile: error }));
                    }
                  }}
                  onBlur={() => handleBlur("clientMobile")}
                  placeholder="Mobile Number"
                  label="Client Mobile"
                  maxLength={10}
                  inputMode="numeric"
                  error={touched.clientMobile && errors.clientMobile}
                />
                <FInp 
                  name="clientEmail" 
                  value={formData.clientEmail} 
                  onChange={handleChange} 
                  onBlur={() => handleBlur("clientEmail")}
                  placeholder="Email Address" 
                  label="Client Email" 
                  type="email" 
                  error={touched.clientEmail && errors.clientEmail}
                />
                <FInp 
                  name="clientAddress" 
                  value={formData.clientAddress} 
                  onChange={handleChange} 
                  placeholder="Address" 
                  label="Client Address" 
                />
              </div>
            </div>

            {/* PROJECT SCHEDULE */}
            <div>
              <div className="s-div"><span className="text-xs font-bold text-teal-600 tracking-widest uppercase whitespace-nowrap">📅 Project Schedule</span></div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 sm:gap-4">
                <FInp 
                  name="startDate" 
                  value={formData.startDate} 
                  onChange={handleChange} 
                  onBlur={() => handleBlur("startDate")}
                  label="Start Date" 
                  type="date" 
                  error={touched.startDate && errors.startDate}
                />
                <FInp 
                  name="projectHandoverDate" 
                  value={formData.projectHandoverDate} 
                  onChange={handleChange} 
                  onBlur={() => handleBlur("projectHandoverDate")}
                  label="Handover Date" 
                  type="date" 
                  error={touched.projectHandoverDate && errors.projectHandoverDate}
                />
                <FInp 
                  name="deadlineDate" 
                  value={formData.deadlineDate} 
                  onChange={handleChange} 
                  onBlur={() => handleBlur("deadlineDate")}
                  label="Deadline" 
                  type="date" 
                  error={touched.deadlineDate && errors.deadlineDate}
                />
                <FInp 
                  name="duration" 
                  value={formData.duration} 
                  onChange={handleChange} 
                  label="Duration" 
                  placeholder="e.g. 3 Months" 
                />
                <FInp 
                  name="projectCost" 
                  value={formData.projectCost} 
                  onChange={handleChange} 
                  onBlur={() => handleBlur("projectCost")}
                  label="Project Cost (₹)" 
                  type="number" 
                  placeholder="0" 
                  error={touched.projectCost && errors.projectCost}
                />
                <FInp 
                  name="milestone" 
                  value={formData.milestone} 
                  onChange={handleChange} 
                  onBlur={() => handleBlur("milestone")}
                  label="Total Milestones" 
                  type="number" 
                  placeholder="0" 
                  error={touched.milestone && errors.milestone}
                />
              </div>
            </div>

            {/* PROJECT TYPE */}
            <div>
              <div className="s-div"><span className="text-xs font-bold text-teal-600 tracking-widest uppercase whitespace-nowrap">🏷️ Project Type</span></div>
              <div className="flex flex-wrap gap-2">
                {typeButtons.map((t) => (
                  <button key={t.value} type="button" onClick={() => setProjectType(t.value)}
                    className={`px-4 sm:px-5 py-2 rounded-xl font-semibold text-xs sm:text-sm transition-all ${projectType === t.value
                        ? "bg-teal-600 text-white shadow-lg shadow-teal-500/30"
                        : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                      }`}>
                    {t.label}
                  </button>
                ))}
              </div>
            </div>

            {/* APP / WEBSITE DETAILS */}
            {(projectType === "website" || projectType === "mobile app" || projectType === "software") && (
              <div className="section-card">
                <div className="s-div"><span className="text-xs font-bold text-teal-600 tracking-widest uppercase whitespace-nowrap">⚙️ Project Details</span></div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 mb-4">
                  <FInp 
                    placeholder="Internal Project ID" 
                    value={appDetails.appId} 
                    label="Internal ID"
                    onChange={(e) => setAppDetails({ ...appDetails, appId: e.target.value })} 
                  />
                  <FInp 
                    placeholder="Internal Project Name" 
                    value={appDetails.appName} 
                    label="Internal Name"
                    onChange={(e) => setAppDetails({ ...appDetails, appName: e.target.value })} 
                  />
                </div>
                <p className="text-xs font-bold text-gray-600 mb-2.5 uppercase tracking-wider">Timeline</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  <FInp 
                    name="designing" 
                    onChange={handleTimelineChange} 
                    placeholder="e.g. 2 Weeks" 
                    label="Designing" 
                    error={appErrors.designing}
                  />
                  <FInp 
                    name="frontend" 
                    onChange={handleTimelineChange} 
                    placeholder="e.g. 4 Weeks" 
                    label="Frontend" 
                    error={appErrors.frontend}
                  />
                  <FInp 
                    name="backend" 
                    onChange={handleTimelineChange} 
                    placeholder="e.g. 4 Weeks" 
                    label="Backend" 
                    error={appErrors.backend}
                  />
                  <FInp 
                    name="deployment" 
                    onChange={handleTimelineChange} 
                    placeholder="e.g. 1 Week" 
                    label="Deployment" 
                    error={appErrors.deployment}
                  />
                </div>
              </div>
            )}

            {/* DIGITAL MARKETING */}
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
                <div className="flex flex-wrap gap-2">
                  {["reels", "posters"].map((type) => {
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

            {/* BUDGET */}
            <div className="section-card">
              <div className="s-div"><span className="text-xs font-bold text-teal-600 tracking-widest uppercase whitespace-nowrap">💰 Budget / Installments</span></div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-3">
                <FInp 
                  placeholder="e.g. Advance Payment" 
                  value={installment.title}
                  onChange={(e) => setInstallment({ ...installment, title: e.target.value })} 
                  label="Title" 
                />
                <FInp 
                  type="number" 
                  placeholder="Amount (₹)" 
                  value={installment.amount}
                  onChange={(e) => setInstallment({ ...installment, amount: e.target.value })} 
                  label="Amount" 
                />
                <FInp 
                  type="date" 
                  value={installment.deadline}
                  onChange={(e) => setInstallment({ ...installment, deadline: e.target.value })} 
                  label="Deadline" 
                />
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
                      <button type="button" onClick={() => removeInstallment(i)}>
                        <X size={12} className="hover:text-red-500" />
                      </button>
                    </span>
                  ))}
                </div>
              )}
            </div>

            {/* BUTTONS */}
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

/* FIELD INPUT */
const FInp = ({ label, className = "", error, ...props }) => (
  <div>
    {label && <label className="text-xs sm:text-sm font-semibold text-gray-700 mb-1 sm:mb-1.5 block">{label}</label>}
    <input {...props}
      className={`f-inp h-10 sm:h-11 px-3.5 rounded-lg sm:rounded-xl text-sm text-gray-700 placeholder:text-gray-400 ${error ? 'f-inp-error' : ''} ${className}`} />
    {error && <p className="text-xs text-red-500 mt-1">{error}</p>}
  </div>
);

export default AddProject;