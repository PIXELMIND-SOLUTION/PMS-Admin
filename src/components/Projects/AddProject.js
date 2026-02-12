import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { FolderPlus, Plus, X } from "lucide-react";

const AddProject = () => {
  const navigate = useNavigate();

  /* ---------------- STATE ---------------- */

  const [projectType, setProjectType] = useState("APP");

  const [formData, setFormData] = useState({
    projectID: "",
    projectName: "",
    clientName: "",
    clientMobile: "",
    clientEmail: "",
    clientAddress: "",
    startDate: "",
    duration: "",
  });

  const [appDetails, setAppDetails] = useState({
    appId: "",
    appName: "",
    timeline: {
      designing: "",
      frontend: "",
      backend: "",
      deployment: "",
    },
  });

  const [budget, setBudget] = useState([]);
  const [installment, setInstallment] = useState({
    title: "",
    amount: "",
    deadline: "",
  });

  const [marketing, setMarketing] = useState({
    reels: {
      enabled: false,
      duration: "",
      quantity: "",
      startDate: "",
    },
    posters: {
      enabled: false,
      duration: "",
      quantity: "",
      startDate: "",
    },
    seo: false,
    keywords: false,
    banners: false,
  });

  /* ---------------- HANDLERS ---------------- */

  const handleChange = (e) =>
    setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleTimeline = (e) =>
    setAppDetails({
      ...appDetails,
      timeline: {
        ...appDetails.timeline,
        [e.target.name]: e.target.value,
      },
    });

  const addInstallment = () => {
    if (!installment.title || !installment.amount) return;

    setBudget([...budget, installment]);
    setInstallment({ title: "", amount: "", deadline: "" });
  };

  const removeInstallment = (index) =>
    setBudget(budget.filter((_, i) => i !== index));

  const handleSubmit = (e) => {
    e.preventDefault();

    const payload = {
      ...formData,
      projectType,
      appDetails:
        projectType !== "DigitalMarketing" ? appDetails : null,
      marketing:
        projectType === "DigitalMarketing" ? marketing : null,
      budget,
    };

    console.log("PROJECT DATA 👉", payload);
    alert("Project Created (Local Only)");
  };

  /* ---------------- UI ---------------- */

  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-50 via-white to-teal-100 p-8">
      <div className="max-w-6xl mx-auto">

        {/* HEADER */}

        <div className="flex items-center gap-4 mb-10">
          <div className="p-4 rounded-2xl bg-teal-100">
            <FolderPlus className="text-teal-700" />
          </div>

          <div>
            <h1 className="text-4xl font-bold text-gray-800">
              Create Project
            </h1>
            <p className="text-gray-500">
              Launch projects with enterprise control
            </p>
          </div>
        </div>

        {/* FORM */}

        <form
          onSubmit={handleSubmit}
          className="bg-white/80 backdrop-blur-xl shadow-2xl rounded-3xl border border-white/40 p-10 space-y-10"
        >

          {/* CLIENT INFO */}

          <Section title="Client Information">
            <Grid>
              <Input name="projectID" placeholder="Project ID" onChange={handleChange} />
              <Input name="projectName" placeholder="Project Name" onChange={handleChange} />
              <Input name="clientName" placeholder="Client Name" onChange={handleChange} />
              <Input name="clientMobile" placeholder="Client Mobile" onChange={handleChange} />
              <Input name="clientEmail" placeholder="Client Email" onChange={handleChange} />
              <Input name="clientAddress" placeholder="Client Address" onChange={handleChange} />
            </Grid>
          </Section>

          {/* GLOBAL PROJECT DATES */}

          <Section title="Project Schedule">
            <Grid>
              <Input type="date" name="startDate" onChange={handleChange} />
              <Input
                name="duration"
                placeholder="Project Duration (Ex: 3 Months)"
                onChange={handleChange}
              />
            </Grid>
          </Section>

          {/* PROJECT TYPE */}

          <Section title="Project Type">
            <div className="flex gap-4">
              {["APP", "Website", "DigitalMarketing"].map((type) => (
                <button
                  type="button"
                  key={type}
                  onClick={() => setProjectType(type)}
                  className={`
                    px-6 py-2 rounded-xl font-semibold transition
                    ${
                      projectType === type
                        ? "bg-teal-600 text-white shadow-lg"
                        : "bg-gray-100 hover:bg-gray-200"
                    }
                  `}
                >
                  {type}
                </button>
              ))}
            </div>
          </Section>

          {/* APP + WEBSITE */}

          {(projectType === "APP" || projectType === "Website") && (
            <>
              <Section title="Project Details">
                <Grid>
                  <Input
                    placeholder="Internal Project ID"
                    value={appDetails.appId}
                    onChange={(e) =>
                      setAppDetails({
                        ...appDetails,
                        appId: e.target.value,
                      })
                    }
                  />

                  <Input
                    placeholder="Internal Project Name"
                    value={appDetails.appName}
                    onChange={(e) =>
                      setAppDetails({
                        ...appDetails,
                        appName: e.target.value,
                      })
                    }
                  />
                </Grid>
              </Section>

              <Section title="Project Timeline">
                <Grid>
                  <Input name="designing" placeholder="Designing Timeline" onChange={handleTimeline} />
                  <Input name="frontend" placeholder="Frontend Timeline" onChange={handleTimeline} />
                  <Input name="backend" placeholder="Backend Timeline" onChange={handleTimeline} />
                  <Input name="deployment" placeholder="Deployment Timeline" onChange={handleTimeline} />
                </Grid>
              </Section>
            </>
          )}

          {/* DIGITAL MARKETING */}

          {projectType === "DigitalMarketing" && (
            <Section title="Marketing Services">
              <div className="grid md:grid-cols-2 gap-6">

                {["reels", "posters"].map((type) => (
                  <div
                    key={type}
                    className="bg-white border rounded-2xl p-5 shadow-sm hover:shadow-md transition"
                  >
                    <label className="flex items-center gap-3 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={marketing[type].enabled}
                        onChange={(e) =>
                          setMarketing({
                            ...marketing,
                            [type]: {
                              ...marketing[type],
                              enabled: e.target.checked,
                            },
                          })
                        }
                      />
                      <span className="text-lg font-semibold capitalize">
                        {type}
                      </span>
                    </label>

                    {marketing[type].enabled && (
                      <div className="grid grid-cols-2 gap-3 mt-4">
                        <Select
                          value={marketing[type].duration}
                          onChange={(e) =>
                            setMarketing({
                              ...marketing,
                              [type]: {
                                ...marketing[type],
                                duration: e.target.value,
                              },
                            })
                          }
                        >
                          <option value="">Type</option>
                          <option>Month</option>
                          <option>Week</option>
                          <option>Year</option>
                          <option>Day</option>
                        </Select>

                        <Input
                          type="number"
                          placeholder="Quantity"
                          value={marketing[type].quantity}
                          onChange={(e) =>
                            setMarketing({
                              ...marketing,
                              [type]: {
                                ...marketing[type],
                                quantity: e.target.value,
                              },
                            })
                          }
                        />

                        <Input
                          type="date"
                          value={marketing[type].startDate}
                          onChange={(e) =>
                            setMarketing({
                              ...marketing,
                              [type]: {
                                ...marketing[type],
                                startDate: e.target.value,
                              },
                            })
                          }
                        />
                      </div>
                    )}
                  </div>
                ))}
              </div>

              {/* PREVIEW */}

              <div className="mt-8">
                <h3 className="font-bold text-gray-800 mb-3">
                  Selected Services
                </h3>

                <div className="flex flex-wrap gap-3">
                  {["reels", "posters"].map((type) => {
                    const data = marketing[type];
                    if (!data.enabled) return null;

                    return (
                      <div
                        key={type}
                        className="bg-gradient-to-r from-teal-600 to-teal-500 text-white px-4 py-2 rounded-full shadow-lg font-semibold"
                      >
                        {type.toUpperCase()} — {data.quantity} / {data.duration} — {data.startDate}
                      </div>
                    );
                  })}
                </div>
              </div>
            </Section>
          )}

          {/* BUDGET */}

          <Section title="Project Budget / Installments">
            <div className="grid md:grid-cols-3 gap-4">
              <Input
                placeholder="Installment Title"
                value={installment.title}
                onChange={(e) =>
                  setInstallment({
                    ...installment,
                    title: e.target.value,
                  })
                }
              />

              <Input
                type="number"
                placeholder="Amount"
                value={installment.amount}
                onChange={(e) =>
                  setInstallment({
                    ...installment,
                    amount: e.target.value,
                  })
                }
              />

              <Input
                type="date"
                value={installment.deadline}
                onChange={(e) =>
                  setInstallment({
                    ...installment,
                    deadline: e.target.value,
                  })
                }
              />
            </div>

            <button
              type="button"
              onClick={addInstallment}
              className="mt-4 flex items-center gap-2 bg-teal-600 text-white px-5 py-2 rounded-xl hover:bg-teal-700"
            >
              <Plus size={16} /> Add Installment
            </button>

            <div className="flex flex-wrap gap-2 mt-4">
              {budget.map((b, i) => (
                <span
                  key={i}
                  className="flex items-center gap-2 bg-teal-100 text-teal-700 px-3 py-1 rounded-full"
                >
                  {b.title} — ₹{b.amount}
                  <X
                    size={14}
                    className="cursor-pointer"
                    onClick={() => removeInstallment(i)}
                  />
                </span>
              ))}
            </div>
          </Section>

          {/* BUTTONS */}

          <div className="flex justify-end gap-4 pt-6 border-t">
            <button
              type="button"
              onClick={() => navigate("/projects")}
              className="px-6 py-2 rounded-xl border hover:bg-gray-100"
            >
              Cancel
            </button>

            <button className="px-8 py-2 rounded-xl bg-gradient-to-r from-teal-600 to-teal-500 text-white font-semibold shadow-lg hover:shadow-2xl">
              Create Project
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

/* ---------- UI HELPERS ---------- */

const Section = ({ title, children }) => (
  <div>
    <h2 className="text-2xl font-bold text-gray-800 mb-4">
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
    className="w-full h-12 rounded-xl border border-gray-200 px-4 focus:ring-2 focus:ring-teal-500 outline-none"
  />
);

const Select = ({ children, ...props }) => (
  <select
    {...props}
    className="w-full h-12 rounded-xl border border-gray-200 px-4 focus:ring-2 focus:ring-teal-500 outline-none"
  >
    {children}
  </select>
);

export default AddProject;
