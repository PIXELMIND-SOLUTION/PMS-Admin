import React, { useState, useEffect } from "react";
import axios from "axios";
import { Users, Calendar, Clock } from "lucide-react";

const inputClass =
  "w-full h-11 rounded-xl border border-slate-300 bg-white px-4 text-sm outline-none transition focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20 disabled:bg-slate-100 disabled:cursor-not-allowed";

const AddAttendance = () => {
  const [attendance, setAttendance] = useState({
    staffId: "",
    date: "",
    status: "present",
    dayType: "fullDay",
    workedHours: "",
  });

  const [staffList, setStaffList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  /* ================= FETCH STAFF ================= */

  useEffect(() => {
    const fetchStaff = async () => {
      try {
        const res = await axios.get(
          "http://31.97.206.144:5000/api/get_all_staffs"
        );

        if (res.data.success) {
          setStaffList(res.data.data);
        }
      } catch (error) {
        console.error("Error fetching staff:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchStaff();
  }, []);

  /* ================= HANDLERS ================= */

  const handleChange = (e) => {
    const { name, value } = e.target;
    setAttendance((prev) => ({ ...prev, [name]: value }));
  };

  /* ================= SUBMIT ================= */

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!attendance.staffId) {
      alert("Please select a staff member.");
      return;
    }

    const selectedStaff = staffList.find(
      (staff) => staff._id === attendance.staffId
    );

    if (!selectedStaff) {
      alert("Invalid staff selected.");
      return;
    }

    const payload = {
      staff: selectedStaff._id,
      staffId: selectedStaff._id,
      name: selectedStaff.staffName,
      date: attendance.date,
      status: attendance.status,
      dayType:
        attendance.status === "present"
          ? attendance.dayType
          : undefined,
      hoursWorked:
        attendance.status === "present" &&
        (attendance.dayType === "halfDay" ||
          attendance.dayType === "extraHours")
          ? attendance.workedHours
          : undefined,
    };

    try {
      setSubmitting(true);

      const res = await axios.post(
        "http://31.97.206.144:5000/api/create-attendance",
        payload
      );

      if (res.data.success) {
        alert("Attendance submitted successfully!");

        setAttendance({
          staffId: "",
          date: "",
          status: "present",
          dayType: "fullDay",
          workedHours: "",
        });
      }
    } catch (error) {
      alert(
        error.response?.data?.message ||
          "Failed to submit attendance."
      );
    } finally {
      setSubmitting(false);
    }
  };

  /* ================= UI ================= */

  return (
    <div className="min-h-screen bg-slate-50 p-6 md:p-10">
      <div className="max-w-3xl mx-auto space-y-8">

        {/* HEADER */}

        <div>
          <h1 className="text-3xl font-bold text-slate-800">
            Add Attendance
          </h1>
          <p className="text-slate-500">
            Record daily staff attendance quickly and accurately.
          </p>
        </div>

        {/* CARD */}

        <form
          onSubmit={handleSubmit}
          className="bg-white p-8 rounded-3xl shadow-sm border border-slate-200 space-y-6"
        >
          {loading ? (
            <p className="text-slate-500">Loading staff...</p>
          ) : (
            <>
              {/* STAFF */}

              <Field label="Staff Member" icon={<Users size={16} />}>
                <select
                  name="staffId"
                  value={attendance.staffId}
                  onChange={handleChange}
                  required
                  className={inputClass}
                >
                  <option value="">Select Staff</option>

                  {staffList.map((staff) => (
                    <option key={staff._id} value={staff._id}>
                      {staff.staffName} — {staff.role}
                    </option>
                  ))}
                </select>
              </Field>

              {/* DATE */}

              <Field label="Date" icon={<Calendar size={16} />}>
                <input
                  type="date"
                  name="date"
                  value={attendance.date}
                  onChange={handleChange}
                  required
                  className={inputClass}
                />
              </Field>

              {/* STATUS */}

              <Field label="Status">
                <select
                  name="status"
                  value={attendance.status}
                  onChange={handleChange}
                  className={inputClass}
                >
                  <option value="present">Present</option>
                  <option value="absent">Absent</option>
                  <option value="leave">Leave</option>
                </select>
              </Field>

              {/* CONDITIONAL */}

              {attendance.status === "present" && (
                <div className="space-y-6">
                  <Field label="Day Type">
                    <select
                      name="dayType"
                      value={attendance.dayType}
                      onChange={handleChange}
                      className={inputClass}
                    >
                      <option value="fullDay">Full Day</option>
                      <option value="halfDay">Half Day</option>
                      <option value="extraHours">
                        Extra Hours
                      </option>
                    </select>
                  </Field>

                  {(attendance.dayType === "halfDay" ||
                    attendance.dayType ===
                      "extraHours") && (
                    <Field
                      label={
                        attendance.dayType ===
                        "halfDay"
                          ? "Worked Hours (max 4)"
                          : "Extra Hours"
                      }
                      icon={<Clock size={16} />}
                    >
                      <input
                        type="number"
                        name="workedHours"
                        value={attendance.workedHours}
                        onChange={handleChange}
                        placeholder="Enter hours"
                        min="1"
                        max={
                          attendance.dayType ===
                          "halfDay"
                            ? "4"
                            : undefined
                        }
                        required
                        className={inputClass}
                      />
                    </Field>
                  )}
                </div>
              )}

              {/* BUTTON */}

              <button
                type="submit"
                disabled={submitting}
                className="w-full h-12 rounded-xl bg-teal-600 text-white font-semibold shadow-sm transition hover:bg-teal-700 disabled:bg-slate-400"
              >
                {submitting
                  ? "Submitting..."
                  : "Submit Attendance"}
              </button>
            </>
          )}
        </form>
      </div>
    </div>
  );
};

/* ================= FIELD ================= */

const Field = ({ label, icon, children }) => (
  <div>
    <label className="flex items-center gap-2 text-sm font-semibold mb-2 text-slate-700">
      {icon}
      {label}
    </label>
    {children}
  </div>
);

export default AddAttendance;
