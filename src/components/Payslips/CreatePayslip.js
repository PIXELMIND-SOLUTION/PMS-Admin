import React, { useState, useEffect } from "react";
import { User, Calendar, Wallet } from "lucide-react";

const inputClass =
  "w-full h-12 rounded-xl border border-slate-300 bg-white px-4 text-sm outline-none transition focus:border-teal-600 focus:ring-4 focus:ring-teal-100";

const CreatePayslip = () => {
  const [payslip, setPayslip] = useState({
    employeeName: "",
    month: "",
    basic: "",
    allowances: "",
    deductions: "",
    netSalary: "",
  });

  /* ================= AUTO NET SALARY ================= */

  useEffect(() => {
    const basic = Number(payslip.basic) || 0;
    const allowances = Number(payslip.allowances) || 0;
    const deductions = Number(payslip.deductions) || 0;

    const net = basic + allowances - deductions;

    setPayslip((prev) => ({
      ...prev,
      netSalary: net > 0 ? net : 0,
    }));
  }, [payslip.basic, payslip.allowances, payslip.deductions]);

  /* ================= HANDLERS ================= */

  const handleChange = (e) => {
    const { name, value } = e.target;
    setPayslip((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    alert(
      `Payslip Created:
Employee: ${payslip.employeeName}
Month: ${payslip.month}
Net Salary: ₹${payslip.netSalary}`
    );

    setPayslip({
      employeeName: "",
      month: "",
      basic: "",
      allowances: "",
      deductions: "",
      netSalary: "",
    });
  };

  /* ================= UI ================= */

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-6 md:p-12">

      <div className="max-w-3xl mx-auto space-y-8">

        {/* HEADER */}

        <div>
          <h1 className="text-4xl font-extrabold text-slate-800 tracking-tight">
            Create Payslip
          </h1>

          <p className="text-slate-500 mt-2">
            Generate professional salary slips for employees.
          </p>
        </div>

        {/* CARD */}

        <form
          onSubmit={handleSubmit}
          className="bg-white/80 backdrop-blur-xl border border-slate-200 shadow-xl rounded-3xl p-8 space-y-7"
        >

          {/* EMPLOYEE */}

          <Field label="Employee Name" icon={<User size={16} />}>
            <input
              name="employeeName"
              value={payslip.employeeName}
              onChange={handleChange}
              required
              className={inputClass}
              placeholder="Enter employee name"
            />
          </Field>

          {/* MONTH */}

          <Field label="Salary Month" icon={<Calendar size={16} />}>
            <input
              type="month"
              name="month"
              value={payslip.month}
              onChange={handleChange}
              required
              className={inputClass}
            />
          </Field>

          {/* SALARY BREAKDOWN */}

          <div className="grid md:grid-cols-3 gap-6">

            <Field label="Basic Salary">
              <input
                type="number"
                name="basic"
                value={payslip.basic}
                onChange={handleChange}
                className={inputClass}
                placeholder="₹ 0"
              />
            </Field>

            <Field label="Allowances">
              <input
                type="number"
                name="allowances"
                value={payslip.allowances}
                onChange={handleChange}
                className={inputClass}
                placeholder="₹ 0"
              />
            </Field>

            <Field label="Deductions">
              <input
                type="number"
                name="deductions"
                value={payslip.deductions}
                onChange={handleChange}
                className={inputClass}
                placeholder="₹ 0"
              />
            </Field>

          </div>

          {/* NET SALARY */}

          <div className="bg-gradient-to-r from-teal-600 to-emerald-600 rounded-2xl p-6 text-white shadow-lg">

            <div className="flex items-center gap-3 mb-2">
              <Wallet size={20} />
              <p className="font-semibold">Net Salary</p>
            </div>

            <h2 className="text-4xl font-extrabold tracking-tight">
              ₹ {Number(payslip.netSalary || 0).toLocaleString("en-IN")}
            </h2>

            <p className="text-teal-100 text-sm mt-1">
              Calculated automatically from salary structure
            </p>

          </div>

          {/* BUTTON */}

          <button
            type="submit"
            className="w-full h-14 rounded-xl bg-gradient-to-r from-teal-600 to-emerald-600 text-white font-bold text-lg shadow-md hover:scale-[1.02] hover:shadow-xl transition"
          >
            Generate Payslip
          </button>

        </form>
      </div>
    </div>
  );
};

/* ================= FIELD ================= */

const Field = ({ label, icon, children }) => (
  <div>
    <label className="flex items-center gap-2 text-sm font-semibold text-slate-700 mb-2">
      {icon}
      {label}
    </label>
    {children}
  </div>
);

export default CreatePayslip;
