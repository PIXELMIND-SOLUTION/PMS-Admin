// src/components/AddStaff.jsx

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
} from "lucide-react";

const AddStaff = () => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    staffId: "",
    staffName: "",
    mobileNumber: "",
    email: "",
    role: "",
    joiningDate: "",
    experience: "",
    bloodGroup: "",
    password: "",
  });

  const [profilePreview, setProfilePreview] = useState(null);
  const [profileImage, setProfileImage] = useState(null);
  const [documents, setDocuments] = useState([]);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  const bloodGroups = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"];

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

  const handleChange = (e) =>
    setFormData({ ...formData, [e.target.name]: e.target.value });

  /* ---------- Profile Upload ---------- */

  const handleProfileImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setProfileImage(file);

    const reader = new FileReader();
    reader.onload = () => setProfilePreview(reader.result);
    reader.readAsDataURL(file);
  };

  /* ---------- Documents ---------- */

  const handleDocumentsChange = (e) => {
    const files = Array.from(e.target.files);
    setDocuments((prev) => [...prev, ...files]);
  };

  const removeDocument = (index) =>
    setDocuments((prev) => prev.filter((_, i) => i !== index));

  /* ---------- Submit ---------- */

  const handleSubmit = async (e) => {
    e.preventDefault();

    const formDataToSend = new FormData();

    Object.entries(formData).forEach(([key, val]) =>
      formDataToSend.append(key, val)
    );

    if (profileImage)
      formDataToSend.append("profileImage", profileImage);

    documents.forEach((doc) =>
      formDataToSend.append("documents", doc)
    );

    try {
      setLoading(true);

      const res = await fetch(
        "http://31.97.206.144:5000/api/create_staff",
        {
          method: "POST",
          body: formDataToSend,
        }
      );

      const data = await res.json();

      if (data.success) {
        setSuccess("Staff added successfully!");
        setTimeout(() => navigate("/staff"), 1400);
      } else {
        setError(data.message);
      }
    } catch {
      setError("Network error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f5f7fb] p-8">
      <div className="max-w-6xl mx-auto">

        {/* HEADER */}
        <div className="flex justify-between items-center mb-10">
          <div>
            <h1 className="text-3xl font-bold text-gray-800">
              Add New Staff
            </h1>
            <p className="text-gray-500">
              Create staff profile with role & documents
            </p>
          </div>

          <button
            onClick={() => navigate("/staff")}
            className="flex items-center gap-2 bg-white border border-gray-200 px-5 py-2.5 rounded-xl shadow-sm hover:shadow transition"
          >
            <ArrowLeft size={18} />
            Back
          </button>
        </div>

        {/* CARD */}
        <div className="bg-white rounded-2xl shadow-md border border-gray-100 p-10">

          {/* Alerts */}
          {error && (
            <div className="mb-6 bg-red-50 text-red-600 px-4 py-3 rounded-lg border border-red-200">
              {error}
            </div>
          )}

          {success && (
            <div className="mb-6 bg-green-50 text-green-600 px-4 py-3 rounded-lg border border-green-200">
              {success}
            </div>
          )}

          {/* Profile */}
          {/* Profile Upload */}
          <div className="flex items-center gap-6 mb-12">
            <div className="w-24 h-24 rounded-full bg-gray-100 border flex items-center justify-center overflow-hidden">
              {profilePreview ? (
                <img
                  src={profilePreview}
                  className="w-full h-full object-cover"
                  alt=""
                />
              ) : (
                <User className="text-gray-400" size={32} />
              )}
            </div>

            {/* Custom Upload */}
            <label className="cursor-pointer">
              <div className="
      flex flex-col items-center justify-center
      w-64 h-28
      border-2 border-dashed border-gray-300
      rounded-xl
      hover:border-teal-500
      hover:bg-teal-50
      transition
    ">
                <span className="text-gray-500 font-medium">
                  Click to upload profile
                </span>

                <span className="text-xs text-gray-400">
                  JPG / PNG • Max 2MB
                </span>
              </div>

              <input
                type="file"
                className="hidden"
                onChange={handleProfileImageChange}
              />
            </label>
          </div>

          {/* FORM */}
          <form className="grid md:grid-cols-2 gap-6" onSubmit={handleSubmit}>

            <Input label="Staff ID" icon={<User size={18} />} name="staffId" value={formData.staffId} onChange={handleChange} />
            <Input label="Staff Name" icon={<User size={18} />} name="staffName" value={formData.staffName} onChange={handleChange} />
            <Input label="Mobile Number" icon={<Phone size={18} />} name="mobileNumber" value={formData.mobileNumber} onChange={handleChange} />
            <Input label="Email" icon={<Mail size={18} />} name="email" value={formData.email} onChange={handleChange} />

            <Select label="Role" icon={<Briefcase size={18} />} name="role" value={formData.role} onChange={handleChange} options={roles} />

            <Input label="Joining Date" type="date" icon={<Calendar size={18} />} name="joiningDate" value={formData.joiningDate} onChange={handleChange} />

            <Input label="Experience (Years)" icon={<Calendar size={18} />} name="experience" value={formData.experience} onChange={handleChange} />

            <Select label="Blood Group" icon={<Droplet size={18} />} name="bloodGroup" value={formData.bloodGroup} onChange={handleChange} options={bloodGroups} />

            <Input label="Password" type="password" icon={<Lock size={18} />} name="password" value={formData.password} onChange={handleChange} />

            {/* Documents */}
            <div className="md:col-span-2">
              <label className="font-semibold text-gray-700 block mb-2">
                Upload Documents
              </label>

              <label className="cursor-pointer block">
                <div className="
      flex flex-col items-center justify-center
      w-full h-36
      border-2 border-dashed border-gray-300
      rounded-xl
      hover:border-indigo-500
      hover:bg-indigo-50
      transition
    ">
                  <File className="text-gray-400 mb-2" size={26} />

                  <p className="text-gray-600 font-medium">
                    Click to upload documents
                  </p>

                  <p className="text-xs text-gray-400">
                    Images, PDF, DOC • Max 5MB
                  </p>
                </div>

                <input
                  type="file"
                  multiple
                  className="hidden"
                  onChange={handleDocumentsChange}
                />
              </label>

              {/* File Preview */}
              {documents.length > 0 && (
                <div className="flex flex-wrap gap-3 mt-4">
                  {documents.map((file, i) => (
                    <div
                      key={i}
                      className="
            flex items-center gap-2
            bg-gray-100
            px-3 py-2
            rounded-lg
            border
          "
                    >
                      <File size={16} className="text-indigo-500" />

                      <span className="text-sm text-gray-700 max-w-[160px] truncate">
                        {file.name}
                      </span>

                      <X
                        size={16}
                        className="cursor-pointer text-red-500 hover:scale-110 transition"
                        onClick={() => removeDocument(i)}
                      />
                    </div>
                  ))}
                </div>
              )}
            </div>


            {/* Buttons */}
            <div className="md:col-span-2 flex gap-4 mt-6">
              <button
                disabled={loading}
                className="flex-1 bg-teal-600 hover:bg-teal-700 text-white py-3 rounded-xl font-semibold shadow-sm transition"
              >
                {loading ? "Adding Staff..." : "Add Staff"}
              </button>

              <button
                type="button"
                onClick={() => navigate("/staff")}
                className="flex-1 border border-gray-300 py-3 rounded-xl hover:bg-gray-50 transition"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

/* ---------- PERFECT INPUT ---------- */

const Input = ({ label, icon, ...props }) => (
  <div>
    <label className="block font-semibold text-gray-700 mb-1">
      {label}
    </label>

    <div className="relative">
      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
        {icon}
      </span>

      <input
        {...props}
        className="
        w-full h-[48px]
        pl-10 pr-4
        border border-gray-200
        rounded-xl
        bg-white
        focus:ring-2 focus:ring-teal-500
        outline-none
        transition
        "
      />
    </div>
  </div>
);

/* ---------- PERFECT SELECT ---------- */

const Select = ({ label, icon, options, ...props }) => (
  <div>
    <label className="block font-semibold text-gray-700 mb-1">
      {label}
    </label>

    <div className="relative">
      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
        {icon}
      </span>

      <select
        {...props}
        className="
        w-full h-[48px]
        pl-10 pr-4
        border border-gray-200
        rounded-xl
        bg-white
        focus:ring-2 focus:ring-teal-500
        outline-none
        appearance-none
        "
      >
        <option value="">Select</option>
        {options.map((opt) => (
          <option key={opt} value={opt}>
            {opt}
          </option>
        ))}
      </select>
    </div>
  </div>
);

export default AddStaff;
