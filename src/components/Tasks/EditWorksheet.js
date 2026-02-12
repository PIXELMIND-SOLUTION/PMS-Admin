import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Plus, Trash2, ArrowLeft } from "lucide-react";

const EditWorksheet = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    empId: "",
    employName: "",
    sheet: "frontend",
    projects: [],
  });

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    fetchAssignment();
  }, [id]);

  const fetchAssignment = async () => {
    try {
      const res = await fetch(
        `http://31.97.206.144:5000/api/get_assign_project/${id}`
      );
      const data = await res.json();

      if (data.success) {
        setFormData(data.data);
      }
    } catch {
      setError("Failed to load assignment");
    } finally {
      setLoading(false);
    }
  };

  /* ---------------- INPUT HANDLERS ---------------- */

  const handleMainChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleProjectChange = (index, field, value) => {
    const updated = [...formData.projects];
    updated[index][field] = value;

    setFormData((prev) => ({
      ...prev,
      projects: updated,
    }));
  };

  const addProject = () => {
    setFormData((prev) => ({
      ...prev,
      projects: [
        ...prev.projects,
        {
          projectName: "",
          startDate: "",
          endDate: "",
          comment: "",
          hours: "",
          shift: "morning",
        },
      ],
    }));
  };

  const removeProject = (index) => {
    if (formData.projects.length === 1) return;

    const updated = formData.projects.filter((_, i) => i !== index);

    setFormData((prev) => ({
      ...prev,
      projects: updated,
    }));
  };

  /* ---------------- SUBMIT ---------------- */

  const handleSubmit = async (e) => {
    e.preventDefault();

    setSubmitting(true);
    setError("");
    setSuccess("");

    try {
      const res = await fetch(
        `http://31.97.206.144:5000/api/update_assign_project/${id}`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(formData),
        }
      );

      const data = await res.json();

      if (data.success) {
        setSuccess("Assignment updated successfully!");

        setTimeout(() => navigate("/assigned-works"), 1200);
      } else {
        setError(data.message || "Update failed");
      }
    } catch {
      setError("Network error");
    } finally {
      setSubmitting(false);
    }
  };

  /* ---------------- LOADING ---------------- */

  if (loading)
    return (
      <div className="h-screen flex items-center justify-center bg-slate-50">
        <div className="animate-pulse text-slate-600 text-lg">
          Loading worksheet...
        </div>
      </div>
    );

  /* ================================================= */

  return (
    <div className="min-h-screen bg-slate-50 p-6 md:p-10">
      <div className="max-w-5xl mx-auto space-y-8">

        {/* HEADER */}

        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-slate-800">
              Edit Worksheet
            </h1>
            <p className="text-slate-500">
              Update employee project assignments
            </p>
          </div>

          <button
            onClick={() => navigate("/assigned-works")}
            className="flex items-center gap-2 text-slate-600 hover:text-slate-900"
          >
            <ArrowLeft size={18} />
            Back
          </button>
        </div>

        {/* CARD */}

        <form
          onSubmit={handleSubmit}
          className="bg-white p-8 rounded-3xl shadow-sm border border-slate-200 space-y-8"
        >
          {/* ALERTS */}

          {error && (
            <div className="bg-red-50 text-red-600 px-4 py-3 rounded-xl">
              {error}
            </div>
          )}

          {success && (
            <div className="bg-emerald-50 text-emerald-600 px-4 py-3 rounded-xl">
              {success}
            </div>
          )}

          {/* EMPLOYEE */}

          <div className="grid md:grid-cols-2 gap-6">
            <Input label="Employee ID" value={formData.empId} readOnly />
            <Input label="Employee Name" value={formData.employName} readOnly />
          </div>

          {/* SHEET */}

          <div>
            <label className="block text-sm font-semibold mb-2">
              Sheet Type
            </label>

            <select
              name="sheet"
              value={formData.sheet}
              onChange={handleMainChange}
              className="w-full h-11 border border-slate-300 rounded-xl px-3 focus:ring-2 focus:ring-teal-500 outline-none"
            >
              <option value="frontend">Frontend</option>
              <option value="backend">Backend</option>
              <option value="testing">Testing</option>
              <option value="design">Design</option>
              <option value="manager">Manager</option>
            </select>
          </div>

          {/* PROJECTS */}

          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h3 className="text-xl font-semibold">
                Project Assignments
              </h3>

              <button
                type="button"
                onClick={addProject}
                className="flex items-center gap-2 px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-xl font-semibold"
              >
                <Plus size={16} />
                Add Project
              </button>
            </div>

            {formData.projects.map((project, index) => (
              <div
                key={index}
                className="border border-slate-200 rounded-2xl p-6 bg-slate-50 space-y-4 relative"
              >
                {formData.projects.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeProject(index)}
                    className="absolute top-4 right-4 text-red-500 hover:scale-110"
                  >
                    <Trash2 size={18} />
                  </button>
                )}

                <div className="grid md:grid-cols-2 gap-4">
                  <Input
                    label="Project Name"
                    value={project.projectName}
                    onChange={(e) =>
                      handleProjectChange(
                        index,
                        "projectName",
                        e.target.value
                      )
                    }
                  />

                  <Select
                    label="Shift"
                    value={project.shift}
                    onChange={(e) =>
                      handleProjectChange(index, "shift", e.target.value)
                    }
                    options={["morning", "evening", "night"]}
                  />
                </div>

                <div className="grid md:grid-cols-3 gap-4">
                  <Input
                    label="Start Date"
                    type="date"
                    value={
                      project.startDate
                        ? new Date(project.startDate)
                            .toISOString()
                            .split("T")[0]
                        : ""
                    }
                    onChange={(e) =>
                      handleProjectChange(index, "startDate", e.target.value)
                    }
                  />

                  <Input
                    label="End Date"
                    type="date"
                    value={
                      project.endDate
                        ? new Date(project.endDate)
                            .toISOString()
                            .split("T")[0]
                        : ""
                    }
                    onChange={(e) =>
                      handleProjectChange(index, "endDate", e.target.value)
                    }
                  />

                  <Input
                    label="Hours"
                    type="number"
                    value={project.hours}
                    onChange={(e) =>
                      handleProjectChange(index, "hours", e.target.value)
                    }
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold mb-2">
                    Comment
                  </label>

                  <textarea
                    rows={2}
                    value={project.comment}
                    onChange={(e) =>
                      handleProjectChange(index, "comment", e.target.value)
                    }
                    className="w-full border border-slate-300 rounded-xl px-3 py-2 focus:ring-2 focus:ring-teal-500 outline-none"
                  />
                </div>
              </div>
            ))}
          </div>

          {/* BUTTONS */}

          <div className="flex gap-4 pt-4">
            <button
              type="submit"
              disabled={submitting}
              className="px-6 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-xl font-semibold shadow-sm"
            >
              {submitting ? "Updating..." : "Update Assignment"}
            </button>

            <button
              type="button"
              onClick={() => navigate("/assigned-works")}
              className="px-6 py-2 border border-slate-300 rounded-xl hover:bg-slate-100"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

/* ================= UI COMPONENTS ================= */

const Input = ({ label, ...props }) => (
  <div>
    <label className="block text-sm font-semibold mb-2">
      {label}
    </label>

    <input
      {...props}
      className="w-full h-11 border border-slate-300 rounded-xl px-3 focus:ring-2 focus:ring-teal-500 outline-none"
    />
  </div>
);

const Select = ({ label, options, ...props }) => (
  <div>
    <label className="block text-sm font-semibold mb-2">
      {label}
    </label>

    <select
      {...props}
      className="w-full h-11 border border-slate-300 rounded-xl px-3 focus:ring-2 focus:ring-teal-500 outline-none"
    >
      {options.map((o) => (
        <option key={o}>{o}</option>
      ))}
    </select>
  </div>
);

export default EditWorksheet;
