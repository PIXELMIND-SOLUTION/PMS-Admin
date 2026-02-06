import React, { useState, useEffect } from "react";
import axios from "axios";

const AddAttendance = () => {
  const [attendance, setAttendance] = useState({
    staffId: "", // stores MongoDB _id
    date: "",
    status: "present",
    dayType: "fullDay",
    workedHours: "", // Will map to hoursWorked in backend
  });

  const [staffList, setStaffList] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStaff = async () => {
      try {
        const res = await axios.get(
          "http://31.97.206.144:5000/api/get_all_staffs"
        );
        if (res.data.success) setStaffList(res.data.data);
      } catch (error) {
        console.error("Error fetching staff:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchStaff();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setAttendance({ ...attendance, [name]: value });
  };

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
      staff: selectedStaff._id, // ObjectId
      staffId: selectedStaff._id, // string staffId
      name: selectedStaff.staffName, // required by schema
      date: attendance.date,
      status: attendance.status,
      dayType:
        attendance.status === "present" ? attendance.dayType : undefined,
      hoursWorked:
        attendance.status === "present" &&
        (attendance.dayType === "halfDay" || attendance.dayType === "extraHours")
          ? attendance.workedHours
          : undefined,
    };

    try {
      const res = await axios.post(
        "http://31.97.206.144:5000/api/create-attendance",
        payload,
        { headers: { "Content-Type": "application/json" } }
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
      console.error("Error submitting attendance:", error);
      alert(
        error.response?.data?.message || "Failed to submit attendance. Try again."
      );
    }
  };

  return (
    <div className="container mt-4">
      <h3 className="mb-4">Add Attendance</h3>
      {loading ? (
        <p>Loading staff...</p>
      ) : (
        <form onSubmit={handleSubmit} className="w-50">
          <div className="mb-3">
            <label className="form-label">Staff Name</label>
            <select
              className="form-select"
              name="staffId"
              value={attendance.staffId}
              onChange={handleChange}
              required
            >
              <option value="">Select Staff</option>
              {staffList.map((staff) => (
                <option key={staff._id} value={staff._id}>
                  {staff.staffName} ({staff.role})
                </option>
              ))}
            </select>
          </div>

          <div className="mb-3">
            <label className="form-label">Date</label>
            <input
              type="date"
              className="form-control"
              name="date"
              value={attendance.date}
              onChange={handleChange}
              required
            />
          </div>

          <div className="mb-3">
            <label className="form-label">Status</label>
            <select
              className="form-select"
              name="status"
              value={attendance.status}
              onChange={handleChange}
            >
              <option value="present">Present</option>
              <option value="absent">Absent</option>
              <option value="leave">Leave</option>
            </select>
          </div>

          {attendance.status === "present" && (
            <>
              <div className="mb-3">
                <label className="form-label">Day Type</label>
                <select
                  className="form-select"
                  name="dayType"
                  value={attendance.dayType}
                  onChange={handleChange}
                >
                  <option value="fullDay">Full Day</option>
                  <option value="halfDay">Half Day</option>
                  <option value="extraHours">Extra Hours</option>
                </select>
              </div>

              {(attendance.dayType === "halfDay" ||
                attendance.dayType === "extraHours") && (
                <div className="mb-3">
                  <label className="form-label">
                    {attendance.dayType === "halfDay"
                      ? "Worked Hours (max 4)"
                      : "Extra Hours Worked"}
                  </label>
                  <input
                    type="number"
                    className="form-control"
                    name="workedHours"
                    value={attendance.workedHours}
                    onChange={handleChange}
                    placeholder="Enter number of hours"
                    min="1"
                    max={attendance.dayType === "halfDay" ? "4" : undefined}
                    required
                  />
                </div>
              )}
            </>
          )}

          <button type="submit" className="btn btn-primary">
            Submit Attendance
          </button>
        </form>
      )}
    </div>
  );
};

export default AddAttendance;
