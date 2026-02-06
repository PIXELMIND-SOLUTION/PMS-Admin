import React, { useState, useEffect, useMemo } from "react";
import axios from "axios";
import { Bar, Pie } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
);

/* ================= DEFAULT MONTH ================= */

const getCurrentMonth = () => {
  const now = new Date();
  const month = (now.getMonth() + 1).toString().padStart(2, "0");
  return `${now.getFullYear()}-${month}`;
};

const ShowAttendance = () => {
  const [attendanceData, setAttendanceData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterMonth, setFilterMonth] = useState(getCurrentMonth());
  const [selectedEmployee, setSelectedEmployee] = useState(null);

  /* ================= FETCH ================= */

  useEffect(() => {
    const fetchAttendance = async () => {
      try {
        const res = await axios.get(
          "http://31.97.206.144:5000/api/getall-attendance"
        );

        if (res.data.success) {
          const mapped = res.data.data.map((a) => ({
            id: a._id,
            name: a.name,
            date: a.date.slice(0, 10),
            status:
              a.status.charAt(0).toUpperCase() + a.status.slice(1),
            dayType: a.dayType || "",
            hours: a.hoursWorked || "",
            staffId: a.staffId,
          }));

          setAttendanceData(mapped);
        }
      } catch (err) {
        console.error("Attendance fetch error:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchAttendance();
  }, []);

  /* ================= FILTER ================= */

  const filteredData = useMemo(() => {
    return filterMonth
      ? attendanceData.filter((a) =>
          a.date.startsWith(filterMonth)
        )
      : attendanceData;
  }, [filterMonth, attendanceData]);

  const employees = useMemo(() => {
    return [...new Set(filteredData.map((a) => a.name))];
  }, [filteredData]);

  /* ================= EMPLOYEE CLICK ================= */

  const handleEmployeeClick = async (name) => {
    try {
      const emp = filteredData.find((a) => a.name === name);
      if (!emp) return;

      const res = await axios.get(
        `http://31.97.206.144:5000/api/attendance/staff/${emp.staffId}`
      );

      if (res.data.success) {
        const empData = res.data.data.map((a) => ({
          id: a._id,
          name: a.name,
          date: a.date.slice(0, 10),
          status:
            a.status.charAt(0).toUpperCase() +
            a.status.slice(1),
          dayType: a.dayType || "",
          hours: a.hoursWorked || "",
          staffId: a.staffId,
        }));

        setAttendanceData((prev) => {
          const others = prev.filter((d) => d.name !== name);
          return [...others, ...empData];
        });

        setSelectedEmployee(name);
      }
    } catch (err) {
      console.error("Employee fetch error:", err);
    }
  };

  const goBack = () => setSelectedEmployee(null);

  /* ================= LOADING ================= */

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-slate-500 text-lg">
        Loading attendance...
      </div>
    );
  }

  /* ======================================================
        EMPLOYEE DETAIL VIEW
  ====================================================== */

  if (selectedEmployee) {
    const empData = filteredData.filter(
      (a) => a.name === selectedEmployee
    );

    const present = empData.filter(
      (d) => d.status === "Present"
    ).length;

    const absent = empData.filter(
      (d) => d.status === "Absent"
    ).length;

    const leave = empData.filter(
      (d) => d.status === "Leave"
    ).length;

    const barData = {
      labels: ["Attendance"],
      datasets: [
        {
          label: "Present",
          data: [present],
        },
        {
          label: "Absent",
          data: [absent],
        },
        {
          label: "Leave",
          data: [leave],
        },
      ],
    };

    const pieData = {
      labels: ["Present", "Absent", "Leave"],
      datasets: [
        {
          data: [present, absent, leave],
        },
      ],
    };

    return (
      <div className="min-h-screen bg-slate-50 p-6 md:p-10">
        <div className="max-w-7xl mx-auto space-y-8">

          {/* HEADER */}

          <div className="flex items-center gap-4">
            <button
              onClick={goBack}
              className="px-4 py-2 bg-white border rounded-xl shadow-sm hover:bg-slate-100 transition"
            >
              ← Back
            </button>

            <h1 className="text-3xl font-bold text-slate-800">
              {selectedEmployee}
            </h1>
          </div>

          {/* FILTER */}

          <div className="bg-white p-5 rounded-2xl shadow-sm border w-fit">
            <label className="text-sm font-semibold text-slate-600">
              Filter by Month
            </label>

            <input
              type="month"
              value={filterMonth}
              onChange={(e) =>
                setFilterMonth(e.target.value)
              }
              className="mt-2 border rounded-lg px-3 py-2 focus:ring-2 focus:ring-teal-500 outline-none"
            />
          </div>

          {/* TABLE */}

          <div className="bg-white rounded-3xl shadow-sm border overflow-hidden">
            <table className="w-full">
              <thead className="bg-slate-100 text-slate-700">
                <tr>
                  <th className="p-4 text-left">#</th>
                  <th className="p-4 text-left">Date</th>
                  <th className="p-4 text-left">Status</th>
                  <th className="p-4 text-left">Day Type</th>
                  <th className="p-4 text-left">Hours</th>
                </tr>
              </thead>

              <tbody>
                {empData.map((rec, i) => (
                  <tr
                    key={rec.id}
                    className="border-t hover:bg-slate-50 transition"
                  >
                    <td className="p-4">{i + 1}</td>
                    <td className="p-4">{rec.date}</td>
                    <td className="p-4 font-medium">
                      {rec.status}
                    </td>
                    <td className="p-4">
                      {rec.dayType || "-"}
                    </td>
                    <td className="p-4">
                      {rec.hours || "-"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* CHARTS */}

          <div className="grid md:grid-cols-2 gap-8">
            <div className="bg-white p-6 rounded-3xl shadow-sm border">
              <h3 className="font-semibold mb-4">
                Attendance Summary
              </h3>
              <Bar data={barData} />
            </div>

            <div className="bg-white p-6 rounded-3xl shadow-sm border">
              <h3 className="font-semibold mb-4">
                Distribution
              </h3>
              <Pie data={pieData} />
            </div>
          </div>
        </div>
      </div>
    );
  }

  /* ======================================================
        MAIN VIEW
  ====================================================== */

  const employeeStats = employees.map((emp) => {
    const data = filteredData.filter((a) => a.name === emp);

    return {
      name: emp,
      present: data.filter((d) => d.status === "Present")
        .length,
      absent: data.filter((d) => d.status === "Absent")
        .length,
      leave: data.filter((d) => d.status === "Leave")
        .length,
      total: data.length,
    };
  });

  return (
    <div className="min-h-screen bg-slate-50 p-6 md:p-10">
      <div className="max-w-7xl mx-auto space-y-8">

        {/* HEADER */}

        <div>
          <h1 className="text-3xl font-bold text-slate-800">
            Attendance Dashboard
          </h1>
          <p className="text-slate-500">
            Monitor employee attendance effortlessly.
          </p>
        </div>

        {/* FILTER */}

        <div className="bg-white p-5 rounded-2xl shadow-sm border w-fit">
          <label className="text-sm font-semibold text-slate-600">
            Filter by Month
          </label>

          <input
            type="month"
            value={filterMonth}
            onChange={(e) =>
              setFilterMonth(e.target.value)
            }
            className="mt-2 border rounded-lg px-3 py-2 focus:ring-2 focus:ring-teal-500 outline-none"
          />
        </div>

        {/* TABLE */}

        <div className="bg-white rounded-3xl shadow-sm border overflow-hidden">
          <table className="w-full">
            <thead className="bg-slate-100">
              <tr>
                <th className="p-4 text-left">#</th>
                <th className="p-4 text-left">
                  Employee
                </th>
                <th className="p-4 text-left">
                  Total
                </th>
                <th className="p-4 text-left">
                  Present
                </th>
                <th className="p-4 text-left">
                  Absent
                </th>
                <th className="p-4 text-left">
                  Leave
                </th>
              </tr>
            </thead>

            <tbody>
              {employeeStats.map((emp, i) => (
                <tr
                  key={emp.name}
                  onClick={() =>
                    handleEmployeeClick(emp.name)
                  }
                  className="border-t hover:bg-slate-50 cursor-pointer transition"
                >
                  <td className="p-4">{i + 1}</td>

                  <td className="p-4 font-semibold text-teal-600">
                    {emp.name}
                  </td>

                  <td className="p-4">{emp.total}</td>

                  <td className="p-4 text-green-600 font-medium">
                    {emp.present}
                  </td>

                  <td className="p-4 text-red-600 font-medium">
                    {emp.absent}
                  </td>

                  <td className="p-4 text-yellow-600 font-medium">
                    {emp.leave}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default ShowAttendance;
