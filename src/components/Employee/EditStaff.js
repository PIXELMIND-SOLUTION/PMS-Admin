// src/components/EditStaff.jsx

import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  ArrowLeft,
  Trash2,
  Upload,
  User,
  Mail,
  Phone,
  Briefcase,
  Calendar,
  Activity,
  Droplet,
  Lock,
} from "lucide-react";

const EditStaff = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [profilePreview, setProfilePreview] = useState(null);
  const [profileImage, setProfileImage] = useState(null);

  const [documents, setDocuments] = useState([]);
  const [existingDocs, setExistingDocs] = useState([]);

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
    isActive: true,
  });

  const roles = [
    "CEO","HR","Backend Developer","Frontend Developer",
    "Full Stack Developer","Project Manager","Designer",
    "QA Engineer","DevOps Engineer","Team Lead",
  ];

  const bloodGroups = ["A+","A-","B+","B-","AB+","AB-","O+","O-"];

  useEffect(() => {
    fetchStaff();
  }, [id]);

  const fetchStaff = async () => {
    try {
      const res = await fetch(`http://31.97.206.144:5000/api/staff/${id}`);
      const data = await res.json();

      const staff = data.data;

      setFormData({
        staffId: staff.staffId || "",
        staffName: staff.staffName || "",
        mobileNumber: staff.mobileNumber || "",
        email: staff.email || "",
        role: staff.role || "",
        joiningDate: staff.joiningDate?.split("T")[0] || "",
        experience: staff.experience || "",
        bloodGroup: staff.bloodGroup || "",
        password: "",
        isActive: staff.isActive ?? true,
      });

      setProfilePreview(staff.profileImage);
      setExistingDocs(staff.documents || []);
    } catch {
      setError("Failed to load staff");
    } finally {
      setLoading(false);
    }
  };

  /* ---------------- HANDLERS ---------------- */

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((p) => ({
      ...p,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleProfileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setProfileImage(file);

    const reader = new FileReader();
    reader.onload = () => setProfilePreview(reader.result);
    reader.readAsDataURL(file);
  };

  const handleDocsChange = (e) => {
    setDocuments((p) => [...p, ...Array.from(e.target.files)]);
  };

  const removeDoc = (i) =>
    setDocuments((p) => p.filter((_, index) => index !== i));

  const removeExistingDoc = (i) =>
    setExistingDocs((p) => p.filter((_, index) => index !== i));

  /* ---------------- SUBMIT ---------------- */

  const handleSubmit = async (e) => {
    e.preventDefault();

    setSubmitting(true);

    const fd = new FormData();

    Object.entries(formData).forEach(([k, v]) => {
      if (v !== "") fd.append(k, v);
    });

    if (profileImage) fd.append("profileImage", profileImage);

    documents.forEach((doc) => fd.append("documents", doc));

    try {
      const res = await fetch(
        `http://31.97.206.144:5000/api/update_staff/${id}`,
        { method: "PUT", body: fd }
      );

      const data = await res.json();

      if (data.success) {
        setSuccess("Staff updated successfully!");
        setTimeout(() => navigate("/staff"), 1500);
      }
    } catch {
      setError("Update failed");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading)
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin w-10 h-10 border-4 border-teal-600 border-t-transparent rounded-full"></div>
      </div>
    );

  /* ====================================================== */

  return (
    <div className="min-h-screen bg-[#f5f7fb] p-8">
      <div className="max-w-6xl mx-auto space-y-6">

        {/* HEADER */}

        <button
          onClick={() => navigate("/staff")}
          className="flex items-center gap-2 text-gray-600 hover:text-teal-600"
        >
          <ArrowLeft size={18} />
          Back
        </button>

        <h1 className="text-3xl font-bold text-gray-800">
          Edit Staff Member
        </h1>

        {/* ALERTS */}

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-xl">
            {error}
          </div>
        )}

        {success && (
          <div className="bg-green-50 border border-green-200 text-green-600 px-4 py-3 rounded-xl">
            {success}
          </div>
        )}

        {/* CARD */}

        <form
          onSubmit={handleSubmit}
          className="bg-white rounded-3xl shadow-sm border p-8 space-y-10"
        >

          {/* PROFILE */}

          <div className="flex items-center gap-6">
            <div className="w-28 h-28 rounded-full bg-gray-100 overflow-hidden border">
              {profilePreview ? (
                <img
                  src={profilePreview}
                  className="w-full h-full object-cover"
                />
              ) : (
                <User className="m-auto text-gray-400" size={36} />
              )}
            </div>

            <label className="cursor-pointer">
              <div className="
                px-6 py-3
                rounded-xl
                border
                flex items-center gap-2
                hover:bg-gray-50
              ">
                <Upload size={18} />
                Change Photo
              </div>

              <input
                type="file"
                className="hidden"
                onChange={handleProfileChange}
              />
            </label>
          </div>

          {/* GRID */}

          <div className="grid md:grid-cols-2 gap-6">

            <Input icon={<User size={16} />} name="staffId" value={formData.staffId} onChange={handleChange} placeholder="Staff ID"/>
            <Input icon={<User size={16} />} name="staffName" value={formData.staffName} onChange={handleChange} placeholder="Full Name"/>
            <Input icon={<Phone size={16} />} name="mobileNumber" value={formData.mobileNumber} onChange={handleChange} placeholder="Mobile"/>
            <Input icon={<Mail size={16} />} name="email" value={formData.email} onChange={handleChange} placeholder="Email"/>

            <Select name="role" value={formData.role} onChange={handleChange} options={roles} icon={<Briefcase size={16}/>}/>
            <Input type="date" name="joiningDate" value={formData.joiningDate} onChange={handleChange} icon={<Calendar size={16}/>}/>
            <Input name="experience" value={formData.experience} onChange={handleChange} placeholder="Experience" icon={<Activity size={16}/>}/>
            <Select name="bloodGroup" value={formData.bloodGroup} onChange={handleChange} options={bloodGroups} icon={<Droplet size={16}/>}/>
            <Input type="password" name="password" value={formData.password} onChange={handleChange} placeholder="New Password" icon={<Lock size={16}/>}/>

          </div>

          {/* STATUS SWITCH */}

          <div className="flex items-center gap-3">
            <input
              type="checkbox"
              name="isActive"
              checked={formData.isActive}
              onChange={handleChange}
              className="w-5 h-5 accent-teal-600"
            />
            <span className="font-medium">
              {formData.isActive ? "Active Staff" : "Inactive"}
            </span>
          </div>

          {/* DOCUMENTS */}

          <div>
            <h3 className="font-semibold mb-3">Documents</h3>

            <label className="cursor-pointer">
              <div className="border-2 border-dashed rounded-xl p-6 text-center hover:bg-gray-50">
                Click to upload documents
              </div>

              <input
                type="file"
                multiple
                className="hidden"
                onChange={handleDocsChange}
              />
            </label>

            {/* existing */}

            <div className="flex flex-wrap gap-4 mt-4">
              {existingDocs.map((doc, i) => (
                <DocCard key={i} doc={doc} remove={() => removeExistingDoc(i)} />
              ))}

              {documents.map((file, i) => (
                <div
                  key={i}
                  className="bg-gray-100 px-3 py-2 rounded-lg flex items-center gap-2"
                >
                  {file.name}
                  <Trash2
                    size={14}
                    className="cursor-pointer text-red-500"
                    onClick={() => removeDoc(i)}
                  />
                </div>
              ))}
            </div>
          </div>

          {/* BUTTONS */}

          <div className="flex gap-4 pt-6 border-t">
            <button
              disabled={submitting}
              className="flex-1 bg-teal-600 text-white py-3 rounded-xl hover:bg-teal-700"
            >
              {submitting ? "Updating..." : "Update Staff"}
            </button>

            <button
              type="button"
              onClick={() => navigate("/staff")}
              className="flex-1 border py-3 rounded-xl"
            >
              Cancel
            </button>
          </div>

        </form>
      </div>
    </div>
  );
};

/* ---------- REUSABLE ---------- */

const Input = ({ icon, ...props }) => (
  <div className="relative">
    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
      {icon}
    </span>
    <input
      {...props}
      className="w-full h-[48px] pl-10 border rounded-xl focus:ring-2 focus:ring-teal-600 outline-none"
    />
  </div>
);

const Select = ({ icon, options, ...props }) => (
  <div className="relative">
    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
      {icon}
    </span>
    <select
      {...props}
      className="w-full h-[48px] pl-10 border rounded-xl focus:ring-2 focus:ring-teal-600 outline-none"
    >
      <option value="">Select</option>
      {options.map((o) => (
        <option key={o}>{o}</option>
      ))}
    </select>
  </div>
);

const DocCard = ({ doc, remove }) => (
  <div className="relative">
    <img
      src={doc}
      className="w-24 h-24 object-cover rounded-lg border"
    />
    <Trash2
      size={14}
      onClick={remove}
      className="absolute -top-2 -right-2 bg-white rounded-full p-1 shadow cursor-pointer text-red-500"
    />
  </div>
);

export default EditStaff;
