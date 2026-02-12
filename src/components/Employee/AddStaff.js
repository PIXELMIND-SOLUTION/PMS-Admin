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

  /* IMAGE HANDLER */
  const handleImageUpload = (e, setter, previewSetter) => {
    const file = e.target.files[0];
    if (!file) return;

    setter(file);

    const reader = new FileReader();
    reader.onload = () => previewSetter(reader.result);
    reader.readAsDataURL(file);
  };

  /* DOCUMENT HANDLER */
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
    <div className="min-h-screen bg-gradient-to-br from-teal-50 via-white to-teal-100 p-10">
      <div className="max-w-7xl mx-auto">
        {/* HEADER */}

        <div className="flex justify-between items-center mb-12">
          <div>
            <h1 className="text-4xl font-bold text-gray-800">
              Add New Employee
            </h1>
            <p className="text-gray-500 mt-2">
              Create employee profile with secure document storage
            </p>
          </div>

          <button
            onClick={() => navigate("/staff")}
            className="
            flex items-center gap-2
            px-6 py-3
            rounded-xl
            bg-white
            shadow-md
            hover:shadow-xl
            transition
            "
          >
            <ArrowLeft size={18} />
            Back
          </button>
        </div>

        {/* MAIN CARD */}

        <div
          className="
          bg-white/80
          backdrop-blur-lg
          border border-white/40
          shadow-2xl
          rounded-3xl
          p-12
          "
        >
          {/* IMAGE UPLOADS */}

          <div className="grid md:grid-cols-2 gap-10 mb-14">
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

          {/* FORM */}

          <form
            onSubmit={handleSubmit}
            className="grid md:grid-cols-2 gap-7"
          >
            <Input label="Employee ID" icon={<User size={18} />} name="employeeId" onChange={handleChange} />
            <Input label="Employee Name" icon={<User size={18} />} name="employeeName" onChange={handleChange} />
            <Select label="Role" icon={<Briefcase size={18} />} options={roles} name="role" onChange={handleChange} />
            <Input label="Mobile" icon={<Phone size={18} />} name="mobile" onChange={handleChange} />
            <Input label="Email" icon={<Mail size={18} />} name="email" onChange={handleChange} />
            <Input type="date" label="Joining Date" icon={<Calendar size={18} />} name="joiningDate" onChange={handleChange} />
            <Select label="Blood Group" icon={<Droplet size={18} />} options={bloodGroups} name="bloodGroup" onChange={handleChange} />
            <Input type="password" label="Password" icon={<Lock size={18} />} name="password" onChange={handleChange} />

            {/* DOCUMENT SECTION */}

            <div className="md:col-span-2 mt-6">
              <h2 className="text-2xl font-bold mb-6 text-gray-800">
                Employee Documents
              </h2>

              <div className="grid md:grid-cols-2 gap-6">
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

            {/* BUTTON */}

            <div className="md:col-span-2 mt-10">
              <button
                className="
                w-full
                py-4
                rounded-xl
                text-lg
                font-semibold
                bg-gradient-to-r from-teal-600 to-teal-500
                hover:from-teal-700 hover:to-teal-600
                text-white
                shadow-lg
                hover:shadow-2xl
                transition
                "
              >
                Add Employee
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

/* IMAGE UPLOAD */

const ImageUpload = ({ title, preview, onChange, icon }) => (
  <div>
    <p className="font-semibold mb-3 text-gray-700">{title}</p>

    <label className="cursor-pointer block">
      <div
        className="
        h-56
        rounded-2xl
        border-2 border-dashed border-teal-300
        hover:border-teal-500
        bg-teal-50/40
        flex items-center justify-center
        overflow-hidden
        transition
        "
      >
        {preview ? (
          <img src={preview} alt="" className="w-full h-full object-cover" />
        ) : (
          <div className="text-teal-500">{icon}</div>
        )}
      </div>

      <input type="file" className="hidden" onChange={onChange} />
    </label>
  </div>
);

/* DOC UPLOAD */

const DocUpload = ({ title, files, onChange, remove }) => (
  <div className="bg-white p-5 rounded-2xl border shadow-sm hover:shadow-md transition">
    <p className="font-semibold mb-3 text-gray-700">{title}</p>

    <label className="cursor-pointer block">
      <div className="border-2 border-dashed border-teal-300 rounded-xl h-28 flex items-center justify-center hover:bg-teal-50 transition">
        <File className="text-teal-400 mr-2" />
        Upload Files
      </div>

      <input multiple type="file" className="hidden" onChange={onChange} />
    </label>

    {files.length > 0 && (
      <div className="mt-3 flex flex-wrap gap-2">
        {files.map((file, i) => (
          <div
            key={i}
            className="flex items-center gap-2 bg-gray-100 px-3 py-1 rounded-lg"
          >
            <span className="text-xs max-w-[120px] truncate">
              {file.name}
            </span>

            <X
              size={14}
              className="cursor-pointer text-red-500"
              onClick={() => remove(i)}
            />
          </div>
        ))}
      </div>
    )}
  </div>
);

/* INPUT */

const Input = ({ label, icon, ...props }) => (
  <div>
    <label className="font-semibold text-gray-700 block mb-1">
      {label}
    </label>

    <div className="relative">
      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
        {icon}
      </span>

      <input
        {...props}
        className="
        w-full h-[50px]
        pl-10 pr-4
        border border-gray-200
        rounded-xl
        focus:ring-2 focus:ring-teal-500
        outline-none
        transition
        "
      />
    </div>
  </div>
);

/* SELECT */

const Select = ({ label, icon, options, ...props }) => (
  <div>
    <label className="font-semibold text-gray-700 block mb-1">
      {label}
    </label>

    <div className="relative">
      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
        {icon}
      </span>

      <select
        {...props}
        className="
        w-full h-[50px]
        pl-10 pr-4
        border border-gray-200
        rounded-xl
        focus:ring-2 focus:ring-teal-500
        outline-none
        appearance-none
        "
      >
        <option value="">Select</option>
        {options.map((o) => (
          <option key={o}>{o}</option>
        ))}
      </select>
    </div>
  </div>
);

const formatTitle = (key) =>
  key
    .replace(/([A-Z])/g, " $1")
    .replace(/^./, (s) => s.toUpperCase());

export default AddStaff;
