import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { FolderPlus, Upload, Plus, X } from "lucide-react";

const AddProject = () => {
  const navigate = useNavigate();

  /* ---------------- STATE ---------------- */

  const [formData, setFormData] = useState({
    projectid: "",
    projectname: "",
    clientname: "",
    mobilenumber: "",
    email: "",
    selectcategory: "website",
    startDate: "",
    projectHandoverDate: "",
    deadlineDate: "",
    projectCost: "",
    milestone: "",
    teamMembers: {
      frontend: [],
      backend: [],
      designer: [],
      tester: [],
      manager: [],
    },
    status: "active",
    milestonePayments: [],
  });

  const [teamInput, setTeamInput] = useState({});
  const [file, setFile] = useState(null);
  const [quotationFile, setQuotationFile] = useState(null);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  /* ---------------- HANDLERS ---------------- */

  const handleChange = (e) =>
    setFormData({ ...formData, [e.target.name]: e.target.value });

  const addMember = (role) => {
    const val = teamInput[role]?.trim();
    if (!val) return;

    setFormData((p) => ({
      ...p,
      teamMembers: {
        ...p.teamMembers,
        [role]: [...p.teamMembers[role], val],
      },
    }));

    setTeamInput((p) => ({ ...p, [role]: "" }));
  };

  const removeMember = (role, index) => {
    setFormData((p) => ({
      ...p,
      teamMembers: {
        ...p.teamMembers,
        [role]: p.teamMembers[role].filter((_, i) => i !== index),
      },
    }));
  };

  /* ---------------- SUBMIT ---------------- */

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    const fd = new FormData();

    Object.entries(formData).forEach(([k, v]) => {
      if (k !== "teamMembers" && k !== "milestonePayments")
        fd.append(k, v);
    });

    fd.append("teamMembers", JSON.stringify(formData.teamMembers));
    fd.append(
      "milestonePayments",
      JSON.stringify(formData.milestonePayments)
    );

    if (file) fd.append("uploadfile", file);
    if (quotationFile) fd.append("quotationfile", quotationFile);

    try {
      const res = await fetch(
        "http://31.97.206.144:5000/api/projects",
        {
          method: "POST",
          body: fd,
        }
      );

      const data = await res.json();

      if (data.success) {
        setSuccess("Project created successfully!");
        setTimeout(() => navigate("/projects"), 1200);
      } else setError(data.message);
    } catch {
      setError("Network error");
    }

    setLoading(false);
  };

  const roles = [
    "frontend",
    "backend",
    "designer",
    "tester",
    "manager",
  ];

  return (
    <div className="min-h-screen bg-slate-50 p-6 md:p-10">
      <div className="max-w-6xl mx-auto space-y-8">

        {/* HEADER */}

        <div className="flex items-center gap-3">
          <div className="p-3 rounded-xl bg-teal-100">
            <FolderPlus className="text-teal-700" />
          </div>

          <div>
            <h1 className="text-3xl font-bold text-slate-800">
              Create New Project
            </h1>
            <p className="text-slate-500">
              Fill the details to launch a new project
            </p>
          </div>
        </div>

        {/* ALERTS */}

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-xl">
            {error}
          </div>
        )}

        {success && (
          <div className="bg-emerald-50 border border-emerald-200 text-emerald-600 px-4 py-3 rounded-xl">
            {success}
          </div>
        )}

        {/* FORM */}

        <form
          onSubmit={handleSubmit}
          className="bg-white rounded-3xl shadow-sm border border-slate-200 p-8 space-y-10"
        >
          {/* PROJECT INFO */}

          <Section title="Project Information">
            <Grid>
              <Input name="projectid" placeholder="Project ID" onChange={handleChange} />
              <Input name="projectname" placeholder="Project Name" onChange={handleChange} />
              <Input name="clientname" placeholder="Client Name" onChange={handleChange} />
              <Input name="mobilenumber" placeholder="Mobile Number" onChange={handleChange} />
              <Input name="email" placeholder="Email Address" onChange={handleChange} />

              <Select name="selectcategory" onChange={handleChange}>
                <option value="website">Website</option>
                <option value="mobile app">Mobile App</option>
                <option value="software">Software</option>
                <option value="digital market">Digital Marketing</option>
              </Select>
            </Grid>
          </Section>

          {/* TIMELINE */}

          <Section title="Project Timeline">
            <Grid>
              <Input type="date" name="startDate" onChange={handleChange} />
              <Input type="date" name="projectHandoverDate" onChange={handleChange} />
              <Input type="date" name="deadlineDate" onChange={handleChange} />
              <Input type="number" name="projectCost" placeholder="Project Cost" onChange={handleChange} />
            </Grid>
          </Section>

          {/* TEAM */}

          <Section title="Team Members">
            <div className="grid md:grid-cols-2 gap-6">
              {roles.map((role) => (
                <div key={role}>
                  <label className="font-semibold text-slate-700 capitalize">
                    {role}
                  </label>

                  <div className="flex gap-2 mt-2">
                    <input
                      className="w-full h-11 rounded-xl border border-slate-300 px-3 focus:outline-none focus:ring-2 focus:ring-teal-500"
                      placeholder={`Add ${role}`}
                      value={teamInput[role] || ""}
                      onChange={(e) =>
                        setTeamInput({
                          ...teamInput,
                          [role]: e.target.value,
                        })
                      }
                    />

                    <button
                      type="button"
                      onClick={() => addMember(role)}
                      className="h-11 px-4 rounded-xl bg-teal-600 text-white hover:bg-teal-700 flex items-center"
                    >
                      <Plus size={16} />
                    </button>
                  </div>

                  {/* TAGS */}

                  <div className="flex flex-wrap gap-2 mt-3">
                    {formData.teamMembers[role].map((member, i) => (
                      <span
                        key={i}
                        className="flex items-center gap-1 bg-teal-50 text-teal-700 px-3 py-1 rounded-full text-sm font-semibold"
                      >
                        {member}
                        <X
                          size={14}
                          className="cursor-pointer hover:text-red-500"
                          onClick={() => removeMember(role, i)}
                        />
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </Section>

          {/* FILE UPLOAD */}

          <Section title="Attachments">
            <div className="grid md:grid-cols-2 gap-6">
              <UploadBox label="Upload Quotation" setFile={setQuotationFile} />
              <UploadBox label="Upload Project Files" setFile={setFile} />
            </div>
          </Section>

          {/* BUTTONS */}

          <div className="flex justify-end gap-4 pt-6 border-t">
            <button
              type="button"
              onClick={() => navigate("/projects")}
              className="px-6 py-2 rounded-xl border border-slate-300 hover:bg-slate-100"
            >
              Cancel
            </button>

            <button
              disabled={loading}
              className="px-8 py-2 rounded-xl bg-teal-600 text-white hover:bg-teal-700 font-semibold"
            >
              {loading ? "Creating..." : "Create Project"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

/* ---------- SMALL UI COMPONENTS ---------- */

const Section = ({ title, children }) => (
  <div>
    <h2 className="text-xl font-semibold text-slate-800 mb-4">
      {title}
    </h2>
    {children}
  </div>
);

const Grid = ({ children }) => (
  <div className="grid md:grid-cols-2 gap-6">{children}</div>
);

const Input = ({ ...props }) => (
  <input
    {...props}
    required
    className="w-full h-11 rounded-xl border border-slate-300 px-3 focus:outline-none focus:ring-2 focus:ring-teal-500"
  />
);

const Select = ({ children, ...props }) => (
  <select
    {...props}
    className="w-full h-11 rounded-xl border border-slate-300 px-3 focus:outline-none focus:ring-2 focus:ring-teal-500"
  >
    {children}
  </select>
);

const UploadBox = ({ label, setFile }) => (
  <label className="flex flex-col items-center justify-center border-2 border-dashed border-slate-300 rounded-2xl p-8 cursor-pointer hover:bg-slate-50 transition">
    <Upload className="text-slate-400 mb-2" />
    <p className="font-semibold text-slate-700">{label}</p>
    <input
      type="file"
      hidden
      onChange={(e) => setFile(e.target.files[0])}
    />
  </label>
);

export default AddProject;
