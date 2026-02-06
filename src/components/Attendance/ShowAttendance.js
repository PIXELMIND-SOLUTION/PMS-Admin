import React, { useState, useEffect, useMemo } from 'react';
import axios from 'axios';
import { Bar, Pie } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, BarElement, ArcElement, Title, Tooltip, Legend);

// Set default month to current month
const getCurrentMonth = () => {
  const now = new Date();
  const month = (now.getMonth() + 1).toString().padStart(2, '0'); // 01-12
  return `${now.getFullYear()}-${month}`;
};

const ShowAttendance = () => {
  const [attendanceData, setAttendanceData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterMonth, setFilterMonth] = useState(getCurrentMonth());
  const [selectedEmployee, setSelectedEmployee] = useState(null);

  // Fetch all attendance on mount
  useEffect(() => {
    const fetchAttendance = async () => {
      try {
        const res = await axios.get('http://31.97.206.144:5000/api/getall-attendance');
        if (res.data.success) {
          // Map API data to consistent format
          const mappedData = res.data.data.map((a) => ({
            id: a._id,
            name: a.name,
            date: a.date.slice(0, 10), // YYYY-MM-DD
            status: a.status.charAt(0).toUpperCase() + a.status.slice(1), // Capitalize
            dayType: a.dayType || '',
            hours: a.hoursWorked || '',
            staffId: a.staffId,
          }));
          setAttendanceData(mappedData);
        }
      } catch (error) {
        console.error('Error fetching attendance:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchAttendance();
  }, []);

  const getStatusColor = (status) => {
    switch (status) {
      case 'Present': return 'green';
      case 'Absent': return 'red';
      case 'Leave': return 'orange';
      default: return 'gray';
    }
  };

  // Filter data by month
  const filteredData = useMemo(() => {
    return filterMonth
      ? attendanceData.filter((a) => a.date.startsWith(filterMonth))
      : attendanceData;
  }, [filterMonth, attendanceData]);

  // Unique employees from filtered data
  const employees = useMemo(() => {
    return [...new Set(filteredData.map((a) => a.name))];
  }, [filteredData]);

  // Handle employee click: fetch individual attendance (optional)
  const handleEmployeeClick = async (name) => {
    try {
      const emp = filteredData.find((a) => a.name === name);
      if (!emp) return;

      const res = await axios.get(`http://31.97.206.144:5000/api/attendance/staff/${emp.staffId}`);
      if (res.data.success) {
        const empData = res.data.data.map((a) => ({
          id: a._id,
          name: a.name,
          date: a.date.slice(0, 10),
          status: a.status.charAt(0).toUpperCase() + a.status.slice(1),
          dayType: a.dayType || '',
          hours: a.hoursWorked || '',
          staffId: a.staffId,
        }));
        setAttendanceData((prev) => {
          // Update filteredData for selected employee only
          const otherData = prev.filter((d) => d.name !== name);
          return [...otherData, ...empData];
        });
        setSelectedEmployee(name);
      }
    } catch (error) {
      console.error('Error fetching employee attendance:', error);
    }
  };

  // Go back to main view
  const goBack = () => setSelectedEmployee(null);

  if (loading) return <p className="text-center mt-5">Loading attendance data...</p>;

  // --- Employee Detailed View ---
  if (selectedEmployee) {
    const empData = filteredData.filter((a) => a.name === selectedEmployee);

    const present = empData.filter((d) => d.status === 'Present').length;
    const absent = empData.filter((d) => d.status === 'Absent').length;
    const leave = empData.filter((d) => d.status === 'Leave').length;

    const barData = {
      labels: ['Attendance Summary'],
      datasets: [
        { label: 'Present', data: [present], backgroundColor: 'green' },
        { label: 'Absent', data: [absent], backgroundColor: 'red' },
        { label: 'Leave', data: [leave], backgroundColor: 'orange' },
      ],
    };

    const pieData = {
      labels: ['Present', 'Absent', 'Leave'],
      datasets: [{ data: [present, absent, leave], backgroundColor: ['green', 'red', 'orange'] }],
    };

    return (
      <div className="container mt-4">
        <div className="d-flex align-items-center mb-4">
          <button className="btn btn-sm btn-outline-secondary me-3" onClick={goBack}>
            ← Back
          </button>
          <h4>Attendance: {selectedEmployee}</h4>
        </div>

        {/* Filter */}
        <div className="mb-3 w-25">
          <label className="form-label">Filter by Month</label>
          <input
            type="month"
            className="form-control"
            value={filterMonth}
            onChange={(e) => setFilterMonth(e.target.value)}
          />
        </div>

        {/* Attendance Table */}
        <table className="table table-bordered mb-5">
          <thead className="table-light">
            <tr>
              <th>#</th>
              <th>Date</th>
              <th>Status</th>
              <th>Day Type</th>
              <th>Hours</th>
            </tr>
          </thead>
          <tbody>
            {empData.length > 0 ? (
              empData.map((record, idx) => (
                <tr key={record.id}>
                  <td>{idx + 1}</td>
                  <td>{record.date}</td>
                  <td>
                    <span
                      style={{
                        display: 'inline-block',
                        width: '12px',
                        height: '12px',
                        borderRadius: '50%',
                        backgroundColor: getStatusColor(record.status),
                        marginRight: '8px',
                      }}
                    ></span>
                    {record.status}
                  </td>
                  <td>{record.dayType || '-'}</td>
                  <td>{record.hours || '-'}</td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="5" className="text-center text-muted">
                  No records found
                </td>
              </tr>
            )}
          </tbody>
        </table>

        {/* Charts */}
        <div className="row">
          <div className="col-md-6">
            <h5>Attendance Summary (Bar)</h5>
            <Bar
              data={barData}
              options={{
                responsive: true,
                plugins: { legend: { position: 'top' } },
                scales: { y: { beginAtZero: true, ticks: { stepSize: 1 } } },
              }}
            />
          </div>
          <div className="col-md-6">
            <h5>Attendance Distribution (Pie)</h5>
            <Pie
              data={pieData}
              options={{ responsive: true, plugins: { legend: { position: 'bottom' } } }}
            />
          </div>
        </div>
      </div>
    );
  }

  // --- Main View: All Employees ---
  const employeeStats = employees.map((emp) => {
    const empData = filteredData.filter((a) => a.name === emp);
    return {
      name: emp,
      present: empData.filter((d) => d.status === 'Present').length,
      absent: empData.filter((d) => d.status === 'Absent').length,
      leave: empData.filter((d) => d.status === 'Leave').length,
      total: empData.length,
    };
  });

  return (
    <div className="container mt-4">
      <h3 className="mb-4">Attendance Records</h3>

      {/* Month Filter */}
      <div className="mb-3 w-25">
        <label className="form-label">Filter by Month</label>
        <input
          type="month"
          className="form-control"
          value={filterMonth}
          onChange={(e) => setFilterMonth(e.target.value)}
        />
      </div>

      {/* Employee Summary Table */}
      <table className="table table-bordered">
        <thead className="table-light">
          <tr>
            <th>#</th>
            <th>Employee Name</th>
            <th>Total Days</th>
            <th>Present</th>
            <th>Absent</th>
            <th>Leave</th>
          </tr>
        </thead>
        <tbody>
          {employeeStats.length > 0 ? (
            employeeStats.map((emp, idx) => (
              <tr
                key={emp.name}
                onClick={() => handleEmployeeClick(emp.name)}
                style={{ cursor: 'pointer' }}
                className="table-row-hover"
              >
                <td>{idx + 1}</td>
                <td className="text-primary fw-medium">{emp.name}</td>
                <td>{emp.total}</td>
                <td className="text-success">{emp.present}</td>
                <td className="text-danger">{emp.absent}</td>
                <td className="text-warning">{emp.leave}</td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="6" className="text-center text-muted">
                No attendance data available
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};

export default ShowAttendance;
