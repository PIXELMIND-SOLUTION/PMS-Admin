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
} from "lucide-react";

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
  const [idPreview, setIdPreview] = useState(null);

  const [profileImage, setProfileImage] = useState(null);
  const [idCardImage, setIdCardImage] = useState(null);

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

  const roles = [
    "CEO",
    "HR",
    "Backend Developer",
    "Frontend Developer",
    "Full Stack Developer",
    "Project Manager",
    "Designer",
    "QA Engineer",
    "DevOps Engineer",
    "Team Lead",
  ];

  const bloodGroups = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"];

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

    setDocuments((prev) => ({
      ...prev,
      [key]: [...prev[key], ...files],
    }));
  };

  const removeDoc = (key, index) => {
    setDocuments((prev) => ({
      ...prev,
      [key]: prev[key].filter((_, i) => i !== index),
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    const payload = {
      ...formData,
      profileImage,
      idCardImage,
      documents,
    };

    console.log("EMPLOYEE DATA:", payload);
    alert("Employee Added Successfully (Local Only)");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-50/90 via-white to-teal-100/80 p-4 md:p-8 lg:p-12">
      {/* Premium Global Styles */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap');
        
        * {
          font-family: 'Inter', -apple-system, sans-serif;
        }
        
        .glass-card {
          background: rgba(255, 255, 255, 0.9);
          backdrop-filter: blur(20px);
          -webkit-backdrop-filter: blur(20px);
          border: 1px solid rgba(64, 224, 208, 0.3);
          box-shadow: 0 20px 40px -12px rgba(0, 128, 128, 0.25);
        }
        
        .input-premium {
          background: rgba(255, 255, 255, 0.9);
          border: 1.5px solid rgba(0, 128, 128, 0.15);
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        }
        
        .input-premium:focus {
          border-color: #008080;
          box-shadow: 0 0 0 4px rgba(0, 128, 128, 0.1);
          background: white;
        }
        
        .upload-area {
          background: linear-gradient(145deg, rgba(255,255,255,0.5), rgba(255,255,255,0.2));
          backdrop-filter: blur(8px);
          border: 2px dashed rgba(0, 128, 128, 0.3);
          transition: all 0.4s ease;
        }
        
        .upload-area:hover {
          border-color: #008080;
          background: rgba(64, 224, 208, 0.08);
          transform: translateY(-2px);
        }
        
        .badge-premium {
          background: linear-gradient(145deg, #008080, #006666);
          color: white;
          padding: 2px 12px;
          border-radius: 100px;
          font-size: 12px;
          font-weight: 600;
          letter-spacing: 0.5px;
          box-shadow: 0 4px 10px rgba(0,128,128,0.2);
        }
      `}</style>

      <div className="max-w-7xl mx-auto">
        {/* Ultra Premium Header */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between mb-8 lg:mb-12 gap-6">
          <div className="relative">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-teal-600 to-teal-500 flex items-center justify-center shadow-xl shadow-teal-500/30">
                <User className="text-white" size={24} />
              </div>
              <div>
                <h1 className="text-3xl lg:text-4xl font-bold text-gray-800 tracking-tight">
                  Add New Employee
                </h1>
                <p className="text-gray-500 mt-1 lg:mt-2 text-sm lg:text-base">
                  Create employee profile with secure document storage
                </p>
              </div>
            </div>
            <div className="absolute -top-2 -left-2 w-24 h-24 bg-teal-400 rounded-full mix-blend-multiply filter blur-2xl opacity-20 animate-pulse" />
          </div>

          <button
            onClick={() => navigate("/staff")}
            className="group flex items-center justify-center gap-2 px-6 py-3 lg:px-8 lg:py-4 rounded-xl bg-white shadow-lg hover:shadow-2xl border border-teal-100 transition-all duration-300 hover:scale-105"
          >
            <ArrowLeft size={20} className="text-teal-600 group-hover:-translate-x-1 transition-transform" />
            <span className="font-semibold text-teal-600">Back to Staff</span>
          </button>
        </div>

        {/* Main Premium Card */}
        <div className="glass-card rounded-3xl lg:rounded-4xl p-6 lg:p-10 xl:p-12">
          
          {/* Image Upload Grid - Ultra Responsive */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 mb-12 lg:mb-16">
            <ImageUpload
              title="Employee Profile Image"
              preview={profilePreview}
              icon={<User size={34} />}
              onChange={(e) =>
                handleImageUpload(e, setProfileImage, setProfilePreview)
              }
            />

            <ImageUpload
              title="Employee ID Card"
              preview={idPreview}
              icon={<CreditCard size={34} />}
              onChange={(e) =>
                handleImageUpload(e, setIdCardImage, setIdPreview)
              }
            />
          </div>

          {/* Form Grid */}
          <form
            onSubmit={handleSubmit}
            className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8"
          >
            <Input label="Employee ID" icon={<User size={18} />} name="employeeId" onChange={handleChange} required />
            <Input label="Employee Name" icon={<User size={18} />} name="employeeName" onChange={handleChange} required />
            <Select label="Role" icon={<Briefcase size={18} />} options={roles} name="role" onChange={handleChange} required />
            <Input label="Mobile" icon={<Phone size={18} />} name="mobile" onChange={handleChange} required />
            <Input label="Email" icon={<Mail size={18} />} name="email" onChange={handleChange} type="email" required />
            <Input type="date" label="Joining Date" icon={<Calendar size={18} />} name="joiningDate" onChange={handleChange} required />
            <Select label="Blood Group" icon={<Droplet size={18} />} options={bloodGroups} name="bloodGroup" onChange={handleChange} />
            <Input type="password" label="Password" icon={<Lock size={18} />} name="password" onChange={handleChange} required />

            {/* Document Section - Full Width */}
            <div className="md:col-span-2 mt-6 lg:mt-8">
              <div className="flex items-center gap-3 mb-6 lg:mb-8">
                <div className="w-10 h-10 rounded-xl bg-teal-100 flex items-center justify-center">
                  <Shield className="text-teal-600" size={22} />
                </div>
                <h2 className="text-xl lg:text-2xl font-bold text-gray-800">
                  Employee Documents
                </h2>
                <span className="badge-premium ml-2">Secure Vault</span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
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
            </div>

            {/* Submit Button */}
            <div className="md:col-span-2 mt-8 lg:mt-12">
              <button
                type="submit"
                className="group relative w-full py-4 lg:py-5 px-8 rounded-xl bg-gradient-to-r from-teal-600 via-teal-500 to-teal-600 text-white text-lg lg:text-xl font-bold shadow-xl shadow-teal-500/30 hover:shadow-2xl hover:shadow-teal-500/40 transition-all duration-500 hover:scale-[1.02] active:scale-[0.98] overflow-hidden"
              >
                <span className="relative z-10 flex items-center justify-center gap-3">
                  <User size={22} />
                  Add Employee to Directory
                </span>
                <div className="absolute inset-0 bg-gradient-to-r from-teal-400 via-teal-300 to-teal-400 opacity-0 group-hover:opacity-100 transition-opacity duration-500 blur-xl" />
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

/* ========== ULTRA PREMIUM IMAGE UPLOAD ========== */
const ImageUpload = ({ title, preview, onChange, icon }) => (
  <div className="relative">
    <p className="font-semibold text-gray-700 mb-3 flex items-center gap-2">
      <span className="w-2 h-2 rounded-full bg-teal-500" />
      {title}
    </p>

    <label className="cursor-pointer block">
      <div
        className={`
          relative h-56 lg:h-64 rounded-2xl overflow-hidden
          upload-area flex items-center justify-center
          ${preview ? 'border-solid border-teal-500' : 'border-dashed'}
        `}
      >
        {preview ? (
          <>
            <img src={preview} alt="" className="w-full h-full object-cover" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent" />
            <div className="absolute bottom-3 left-3 bg-white/90 backdrop-blur px-3 py-1.5 rounded-lg text-xs font-medium text-teal-700">
              ✓ Uploaded
            </div>
          </>
        ) : (
          <div className="text-teal-500 text-center p-6">
            <div className="mb-3 flex justify-center">{icon}</div>
            <p className="text-sm font-medium text-gray-600">Click to upload</p>
            <p className="text-xs text-gray-400 mt-1">PNG, JPG up to 5MB</p>
          </div>
        )}
      </div>
      <input type="file" className="hidden" accept="image/*" onChange={onChange} />
    </label>
  </div>
);

/* ========== ULTRA PREMIUM DOC UPLOAD ========== */
const DocUpload = ({ title, files, onChange, remove }) => (
  <div className="group bg-white/80 backdrop-blur-sm p-5 lg:p-6 rounded-2xl border border-teal-100/50 shadow-lg hover:shadow-xl transition-all duration-300 hover:border-teal-300">
    <p className="font-semibold text-gray-700 mb-3 flex items-center justify-between">
      <span className="flex items-center gap-2">
        <File size={16} className="text-teal-600" />
        {title}
      </span>
      {files.length > 0 && (
        <span className="bg-teal-100 text-teal-700 px-2 py-0.5 rounded-full text-xs font-bold">
          {files.length}
        </span>
      )}
    </p>

    <label className="cursor-pointer block">
      <div className="border-2 border-dashed border-teal-200/70 rounded-xl h-24 lg:h-28 flex flex-col items-center justify-center gap-1 group-hover:border-teal-500 group-hover:bg-teal-50/50 transition-all duration-300">
        <File className="text-teal-400 group-hover:text-teal-600" size={24} />
        <span className="text-xs font-medium text-gray-500 group-hover:text-teal-600">
          Upload Files
        </span>
      </div>
      <input multiple type="file" className="hidden" onChange={onChange} />
    </label>

    {files.length > 0 && (
      <div className="mt-4 max-h-32 overflow-y-auto scrollbar-thin scrollbar-thumb-teal-200">
        {files.map((file, i) => (
          <div
            key={i}
            className="flex items-center justify-between bg-gray-50/80 backdrop-blur px-3 py-2 rounded-lg mb-2 group/file"
          >
            <span className="text-xs truncate max-w-[140px] lg:max-w-[180px] font-medium text-gray-700">
              {file.name}
            </span>
            <X
              size={16}
              className="cursor-pointer text-red-400 hover:text-red-600 transition-colors"
              onClick={() => remove(i)}
            />
          </div>
        ))}
      </div>
    )}
  </div>
);

/* ========== ULTRA PREMIUM INPUT ========== */
const Input = ({ label, icon, className = "", ...props }) => (
  <div className="relative">
    <label className="text-sm font-semibold text-gray-700 mb-1.5 block">
      {label}
    </label>
    <div className="relative">
      <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
        {icon}
      </span>
      <input
        {...props}
        className={`
          w-full h-[52px] lg:h-[56px]
          pl-11 pr-4
          input-premium
          rounded-xl
          focus:outline-none
          bg-white
          text-gray-700
          placeholder:text-gray-400
          ${className}
        `}
      />
    </div>
  </div>
);

/* ========== ULTRA PREMIUM SELECT ========== */
const Select = ({ label, icon, options, className = "", ...props }) => (
  <div className="relative">
    <label className="text-sm font-semibold text-gray-700 mb-1.5 block">
      {label}
    </label>
    <div className="relative">
      <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 z-10">
        {icon}
      </span>
      <select
        {...props}
        className={`
          w-full h-[52px] lg:h-[56px]
          pl-11 pr-10
          input-premium
          rounded-xl
          focus:outline-none
          bg-white
          text-gray-700
          appearance-none
          cursor-pointer
          ${className}
        `}
      >
        <option value="">Select {label}</option>
        {options.map((o) => (
          <option key={o} value={o}>{o}</option>
        ))}
      </select>
      <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={18} />
    </div>
  </div>
);

const formatTitle = (key) =>
  key
    .replace(/([A-Z])/g, " $1")
    .replace(/^./, (s) => s.toUpperCase())
    .replace(/([a-z])([A-Z])/g, "$1 $2");

export default AddStaff;