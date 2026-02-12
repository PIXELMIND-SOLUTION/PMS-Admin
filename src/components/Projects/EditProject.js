import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { FolderEdit, Upload, Plus, X, FileText } from "lucide-react";

const EditProject = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [file, setFile] = useState(null);
  const [quotationFile, setQuotationFile] = useState(null);

  const [existingFiles, setExistingFiles] = useState({
    uploadfile: null,
    quotationfile: null,
  });

  const [teamInput, setTeamInput] = useState({});

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

  /* ---------------- FETCH ---------------- */

  useEffect(() => {
    fetchProject();
  }, []);

  const fetchProject = async () => {
    try {
      const res = await fetch(
        `http://31.97.206.144:5000/api/project/${id}`
      );
      const data = await res.json();

      if (data.success) {
        const p = data.data;

        const format = (d) =>
          d ? new Date(d).toISOString().split("T")[0] : "";

        setFormData({
          ...p,
          startDate: format(p.startDate),
          projectHandoverDate: format(p.projectHandoverDate),
          deadlineDate: format(p.deadlineDate),
          teamMembers: p.teamMembers || {
            frontend: [],
            backend: [],
            designer: [],
            tester: [],
            manager: [],
          },
        });

        setExistingFiles({
          uploadfile: p.uploadfile,
          quotationfile: p.quotationfile,
        });
      } else setError("Failed to load project");
    } catch {
      setError("Network error");
    }

    setLoading(false);
  };

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

  const removeMember = (role, i) => {
    setFormData((p) => ({
      ...p,
      teamMembers: {
        ...p.teamMembers,
        [role]: p.teamMembers[role].filter((_, x) => x !== i),
      },
    }));
  };

  /* ---------------- SUBMIT ---------------- */

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError("");
    setSuccess("");

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
        `http://31.97.206.144:5000/api/project/${id}`,
        {
          method: "PUT",
          body: fd,
        }
      );

      const data = await res.json();

      if (data.success) {
        setSuccess("Project updated!");
        setTimeout(() => navigate("/projects"), 1200);
      } else setError(data.message);
    } catch {
      setError("Network error");
    }

    setSubmitting(false);
  };

  const roles = [
    "frontend",
    "backend",
    "designer",
    "tester",
    "manager",
  ];

  if (loading)
    return (
      <div className="h-screen flex items-center justify-center bg-slate-50">
        <div className="animate-pulse text-slate-500 text-lg">
          Loading project...
        </div>
      </div>
    );

  return (
    <div className="min-h-screen bg-slate-50 p-6 md:p-10">
      <div className="max-w-6xl mx-auto space-y-8">

        {/* HEADER */}

        <div className="flex items-center gap-3">
          <div className="p-3 bg-teal-100 rounded-xl">
            <FolderEdit className="text-teal-700" />
          </div>

          <div>
            <h1 className="text-3xl font-bold text-slate-800">
              Edit Project
            </h1>
            <p className="text-slate-500">
              Update project details effortlessly
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
              <Input name="projectid" value={formData.projectid} onChange={handleChange}/>
              <Input name="projectname" value={formData.projectname} onChange={handleChange}/>
              <Input name="clientname" value={formData.clientname} onChange={handleChange}/>
              <Input name="mobilenumber" value={formData.mobilenumber} onChange={handleChange}/>
              <Input name="email" value={formData.email} onChange={handleChange}/>

              <Select name="selectcategory" value={formData.selectcategory} onChange={handleChange}>
                <option value="website">Website</option>
                <option value="mobile app">Mobile App</option>
                <option value="software">Software</option>
                <option value="digital market">Digital Marketing</option>
              </Select>
            </Grid>
          </Section>

          {/* TEAM */}

          <Section title="Team Members">
            <div className="grid md:grid-cols-2 gap-6">
              {roles.map((role) => (
                <div key={role}>
                  <label className="font-semibold capitalize text-slate-700">
                    {role}
                  </label>

                  <div className="flex gap-2 mt-2">
                    <input
                      className="w-full h-11 border rounded-xl px-3 focus:ring-2 focus:ring-teal-500 outline-none"
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
                      className="h-11 px-4 bg-teal-600 hover:bg-teal-700 text-white rounded-xl flex items-center"
                    >
                      <Plus size={16} />
                    </button>
                  </div>

                  <div className="flex flex-wrap gap-2 mt-3">
                    {formData.teamMembers[role]?.map((m, i) => (
                      <span
                        key={i}
                        className="flex items-center gap-1 bg-teal-50 text-teal-700 px-3 py-1 rounded-full text-sm font-semibold"
                      >
                        {m}
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

          {/* FILES */}

          <Section title="Files">
            <div className="grid md:grid-cols-2 gap-6">

              {/* Existing */}

              {existingFiles.quotationfile && (
                <FileCard file={existingFiles.quotationfile} label="Current Quotation"/>
              )}

              {existingFiles.uploadfile && (
                <FileCard file={existingFiles.uploadfile} label="Current Project File"/>
              )}

              {/* Upload */}

              <UploadBox label="Replace Quotation" setFile={setQuotationFile}/>
              <UploadBox label="Replace Project File" setFile={setFile}/>
            </div>
          </Section>

          {/* BUTTONS */}

          <div className="flex justify-end gap-4 pt-6 border-t">
            <button
              type="button"
              onClick={() => navigate("/projects")}
              className="px-6 py-2 rounded-xl border hover:bg-slate-100"
            >
              Cancel
            </button>

            <button
              disabled={submitting}
              className="px-8 py-2 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-semibold"
            >
              {submitting ? "Updating..." : "Update Project"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

/* ---------- SMALL UI ---------- */

const Section = ({ title, children }) => (
  <div>
    <h2 className="text-xl font-semibold mb-4 text-slate-800">
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
    className="w-full h-11 border border-slate-300 rounded-xl px-3 focus:ring-2 focus:ring-teal-500 outline-none"
  />
);

const Select = ({ children, ...props }) => (
  <select
    {...props}
    className="w-full h-11 border border-slate-300 rounded-xl px-3 focus:ring-2 focus:ring-teal-500 outline-none"
  >
    {children}
  </select>
);

const UploadBox = ({ label, setFile }) => (
  <label className="flex flex-col items-center justify-center border-2 border-dashed border-slate-300 rounded-2xl p-8 cursor-pointer hover:bg-slate-50 transition">
    <Upload className="text-slate-400 mb-2" />
    <p className="font-semibold text-slate-700">{label}</p>
    <input hidden type="file" onChange={(e) => setFile(e.target.files[0])}/>
  </label>
);

const FileCard = ({ file, label }) => (
  <a
    href={file}
    target="_blank"
    rel="noreferrer"
    className="flex items-center gap-3 border rounded-2xl p-4 hover:bg-slate-50"
  >
    <FileText className="text-teal-600"/>
    <div>
      <p className="font-semibold">{label}</p>
      <p className="text-sm text-slate-500">View file</p>
    </div>
  </a>
);

export default EditProject;
