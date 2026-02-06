import React from "react";
import { Wallet, Calendar, User } from "lucide-react";

const ShowPayslips = () => {
  const payslips = [
    { id: 1, employeeName: "John Doe", month: "2025-09", netSalary: 5000 },
    { id: 2, employeeName: "Jane Smith", month: "2025-09", netSalary: 4500 },
    { id: 3, employeeName: "Alice Johnson", month: "2025-09", netSalary: 5200 },
  ];

  const totalPayroll = payslips.reduce(
    (acc, p) => acc + p.netSalary,
    0
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-6 md:p-10">
      
      <div className="max-w-6xl mx-auto space-y-8">

        {/* HEADER */}

        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-4xl font-extrabold text-slate-800 tracking-tight">
              Payslips
            </h1>
            <p className="text-slate-500 mt-1">
              View and manage employee salary records.
            </p>
          </div>

          {/* Payroll Card */}

          <div className="bg-gradient-to-r from-teal-600 to-emerald-600 text-white px-6 py-4 rounded-2xl shadow-lg">
            <p className="text-sm opacity-90">
              Total Payroll
            </p>
            <h2 className="text-2xl font-bold">
              ₹ {totalPayroll.toLocaleString("en-IN")}
            </h2>
          </div>
        </div>

        {/* TABLE CARD */}

        <div className="bg-white/80 backdrop-blur-xl border border-slate-200 shadow-xl rounded-3xl overflow-hidden">

          <div className="overflow-x-auto">

            <table className="w-full">

              {/* HEADER */}

              <thead className="bg-slate-100 text-slate-700">
                <tr>
                  <th className="p-4 text-left font-semibold">#</th>
                  <th className="p-4 text-left font-semibold">
                    Employee
                  </th>
                  <th className="p-4 text-center font-semibold">
                    Month
                  </th>
                  <th className="p-4 text-center font-semibold">
                    Net Salary
                  </th>
                  <th className="p-4 text-center font-semibold">
                    Status
                  </th>
                </tr>
              </thead>

              {/* BODY */}

              <tbody>
                {payslips.map((p, index) => (
                  <tr
                    key={p.id}
                    className="border-t hover:bg-slate-50 transition duration-200"
                  >
                    <td className="p-4 text-slate-500">
                      {index + 1}
                    </td>

                    {/* Employee */}

                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-teal-100 flex items-center justify-center">
                          <User size={18} className="text-teal-700" />
                        </div>

                        <span className="font-semibold text-slate-700">
                          {p.employeeName}
                        </span>
                      </div>
                    </td>

                    {/* Month */}

                    <td className="p-4 text-center">
                      <div className="inline-flex items-center gap-2 bg-slate-100 px-3 py-1 rounded-full text-sm font-medium text-slate-600">
                        <Calendar size={14} />
                        {p.month}
                      </div>
                    </td>

                    {/* Salary */}

                    <td className="p-4 text-center">
                      <span className="font-bold text-emerald-600 text-lg">
                        ₹ {p.netSalary.toLocaleString("en-IN")}
                      </span>
                    </td>

                    {/* Status */}

                    <td className="p-4 text-center">
                      <span className="px-3 py-1 rounded-full text-xs font-semibold bg-green-100 text-green-700">
                        Paid
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>

            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ShowPayslips;
