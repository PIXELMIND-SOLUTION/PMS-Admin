import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ClipboardPlus, Plus, Trash2, User } from "lucide-react";

const AddWorksheet = () => {
  const navigate = useNavigate();

  const [staffOptions, setStaffOptions] = useState([]);
  const [projectOptions, setProjectOptions] = useState([]);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [formData, setFormData] = useState({
    empId: "", // storing Mongo _id (BEST)
    employName: "",
    sheet: "frontend",
    projects: [
      {
        projectName: "",
        startDate: "",
        endDate: "",
        comment: "",
        hours: "",
        shift: "morning",
      },
    ],
  });

  /* ---------------- FETCH ---------------- */

  useEffect(() => {
    const fetchOptions = async () => {
      try {
        const [staffRes, projectRes] = await Promise.all([
          fetch("http://31.97.206.144:5000/api/get_all_staffs"),
          fetch("http://31.97.206.144:5000/api/projects"),
        ]);

        const staffData = await staffRes.json();
        const projectData = await projectRes.json();

        if (staffData.success) setStaffOptions(staffData.data);
        if (projectData.success) setProjectOptions(projectData.data);
      } catch {
        setError("Failed to load dropdown data");
      }
    };

    fetchOptions();
  }, []);

  /* ---------------- HANDLERS ---------------- */

  const handleMainChange = (e) =>
    setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleEmployeeSelect = (e) => {
    const selectedId = e.target.value;

    const selectedEmployee = staffOptions.find(
      (staff) => String(staff._id) === String(selectedId)
    );

    setFormData((prev) => ({
      ...prev,
      empId: selectedId,
      employName: selectedEmployee?.staffName || "",
    }));
  };

  const handleProjectChange = (i, field, value) => {
    const updated = [...formData.projects];
    updated[i][field] = value;
    setFormData({ ...formData, projects: updated });
  };

  const addProject = () => {
    setFormData({
      ...formData,
      projects: [
        ...formData.projects,
        {
          projectName: "",
          startDate: "",
          endDate: "",
          comment: "",
          hours: "",
          shift: "morning",
        },
      ],
    });
  };

  const removeProject = (i) => {
    if (formData.projects.length === 1) return;

    setFormData({
      ...formData,
      projects: formData.projects.filter((_, x) => x !== i),
    });
  };

  /* ---------------- SUBMIT ---------------- */

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (
      formData.projects.some(
        (p) => !p.projectName || !p.startDate || !p.endDate || !p.hours
      )
    ) {
      setError("Please fill all project fields");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const res = await fetch(
        "http://31.97.206.144:5000/api/assign_project",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(formData),
        }
      );

      const data = await res.json();

      if (data.success) {
        setSuccess("Assignment created successfully!");
        setTimeout(() => navigate("/assigned-works"), 1200);
      } else setError(data.message);
    } catch {
      setError("Network error");
    }

    setLoading(false);
  };

  /* ---------------- UI ---------------- */

  return (
    <div className="min-h-screen bg-slate-50 p-6 md:p-10">
      <div className="max-w-6xl mx-auto space-y-8">

        {/* HEADER */}

        <div className="flex items-center gap-4">
          <div className="p-3 rounded-2xl bg-teal-100">
            <ClipboardPlus className="text-teal-700" />
          </div>

          <div>
            <h1 className="text-3xl font-bold text-slate-800">
              Create Worksheet
            </h1>
            <p className="text-slate-500">
              Assign employees to projects efficiently
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
          className="bg-white border border-slate-200 rounded-3xl shadow-sm p-8 space-y-10"
        >
          {/* EMPLOYEE SECTION */}

          <div>
            <h2 className="text-xl font-semibold mb-4 text-slate-800">
              Employee Information
            </h2>

            <div className="grid md:grid-cols-2 gap-6">

              {/* Employee Select */}

              <div>
                <label className="block mb-1 font-semibold text-slate-700">
                  Employee
                </label>

                <select
                  value={formData.empId}
                  onChange={handleEmployeeSelect}
                  required
                  className="w-full h-11 border border-slate-300 rounded-xl px-3 focus:ring-2 focus:ring-teal-500 outline-none"
                >
                  <option value="">Select Employee</option>

                  {staffOptions.map((staff) => (
                    <option key={staff._id} value={staff._id}>
                      {staff.staffId} — {staff.staffName}
                    </option>
                  ))}
                </select>
              </div>

              {/* Auto-filled Name */}

              <div>
                <label className="block mb-1 font-semibold text-slate-700">
                  Employee Name
                </label>

                <input
                  value={formData.employName}
                  readOnly
                  className="w-full h-11 border border-slate-300 bg-slate-100 rounded-xl px-3"
                />
              </div>
            </div>

            {/* Sheet */}

            <div className="mt-6">
              <label className="block mb-1 font-semibold text-slate-700">
                Sheet Type
              </label>

              <select
                name="sheet"
                value={formData.sheet}
                onChange={handleMainChange}
                className="w-full h-11 border border-slate-300 rounded-xl px-3 focus:ring-2 focus:ring-teal-500 outline-none"
              >
                <option>frontend</option>
                <option>backend</option>
                <option>testing</option>
                <option>design</option>
                <option>Full Stack</option>
                <option>Digital Marketing</option>
              </select>
            </div>
          </div>

          {/* PROJECTS */}

          <div>
            <h2 className="text-xl font-semibold mb-4 text-slate-800">
              Project Assignments
            </h2>

            <div className="space-y-6">
              {formData.projects.map((project, i) => (
                <div
                  key={i}
                  className="border border-slate-200 rounded-2xl p-6 bg-slate-50 relative"
                >
                  {formData.projects.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeProject(i)}
                      className="absolute top-4 right-4 text-red-500 hover:text-red-700"
                    >
                      <Trash2 size={18} />
                    </button>
                  )}

                  <div className="grid md:grid-cols-2 gap-6">

                    <SelectField
                      label="Project"
                      value={project.projectName}
                      onChange={(e) =>
                        handleProjectChange(i, "projectName", e.target.value)
                      }
                    >
                      <option value="">Select Project</option>
                      {projectOptions.map((p) => (
                        <option key={p._id} value={p.projectname}>
                          {p.projectname}
                        </option>
                      ))}
                    </SelectField>

                    <SelectField
                      label="Shift"
                      value={project.shift}
                      onChange={(e) =>
                        handleProjectChange(i, "shift", e.target.value)
                      }
                    >
                      <option value="morning">Morning</option>
                      <option value="Afternoon">Afternoon</option>
                      <option value="fullday">Full Day</option>
                    </SelectField>

                    <InputField
                      label="Start Date"
                      type="date"
                      value={project.startDate}
                      onChange={(e) =>
                        handleProjectChange(i, "startDate", e.target.value)
                      }
                    />

                    <InputField
                      label="End Date"
                      type="date"
                      value={project.endDate}
                      onChange={(e) =>
                        handleProjectChange(i, "endDate", e.target.value)
                      }
                    />

                    <InputField
                      label="Hours"
                      type="number"
                      min="1"
                      value={project.hours}
                      onChange={(e) =>
                        handleProjectChange(i, "hours", e.target.value)
                      }
                    />
                  </div>

                  <div className="mt-6">
                    <label className="block mb-1 font-semibold text-slate-700">
                      Comment
                    </label>

                    <textarea
                      rows={3}
                      value={project.comment}
                      onChange={(e) =>
                        handleProjectChange(i, "comment", e.target.value)
                      }
                      className="w-full border border-slate-300 rounded-xl px-3 py-2 focus:ring-2 focus:ring-teal-500 outline-none"
                    />
                  </div>
                </div>
              ))}

              <button
                type="button"
                onClick={addProject}
                className="flex items-center gap-2 px-5 py-2 rounded-xl border border-teal-600 text-teal-700 font-semibold hover:bg-teal-50"
              >
                <Plus size={16} />
                Add Another Project
              </button>
            </div>
          </div>

          {/* BUTTONS */}

          <div className="flex justify-end gap-4 pt-6 border-t">
            <button
              type="button"
              onClick={() => navigate("/assigned-works")}
              className="px-6 py-2 rounded-xl border hover:bg-slate-100"
            >
              Cancel
            </button>

            <button
              disabled={loading}
              className="px-8 py-2 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-semibold"
            >
              {loading ? "Creating..." : "Create Worksheet"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

/* ---------- SMALL UI ---------- */

const InputField = ({ label, ...props }) => (
  <div>
    <label className="block mb-1 font-semibold text-slate-700">
      {label}
    </label>
    <input
      {...props}
      required
      className="w-full h-11 border border-slate-300 rounded-xl px-3 focus:ring-2 focus:ring-teal-500 outline-none"
    />
  </div>
);

const SelectField = ({ label, children, ...props }) => (
  <div>
    <label className="block mb-1 font-semibold text-slate-700">
      {label}
    </label>
    <select
      {...props}
      required
      className="w-full h-11 border border-slate-300 rounded-xl px-3 focus:ring-2 focus:ring-teal-500 outline-none"
    >
      {children}
    </select>
  </div>
);

export default AddWorksheet;
