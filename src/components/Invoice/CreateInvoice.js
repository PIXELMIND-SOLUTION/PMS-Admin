import React, { useState, useEffect } from "react";

const inputClass =
  "w-full h-11 rounded-xl border border-slate-300 bg-white px-4 text-sm outline-none transition focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20";

const company = {
  logo: "https://dummyimage.com/120x60/0f766e/ffffff&text=LOGO",
  name: "TechCorp Solutions",
  mobile: "+91 9876543210",
  address: "Madhapur, Hyderabad, India",
  email: "info@techcorp.com",
  website: "www.techcorp.com",
};

const CreateInvoice = () => {
  const [invoice, setInvoice] = useState({
    invoiceId: "",
    clientName: "",
    clientMobile: "",
    clientAddress: "",
    date: "",
    description: "",
    price: "",
    quantity: "",
    totalAmount: "",
    status: "Unpaid",
  });

  /* AUTO TOTAL */
  useEffect(() => {
    const total =
      Number(invoice.price || 0) * Number(invoice.quantity || 0);

    setInvoice((prev) => ({
      ...prev,
      totalAmount: total,
    }));
  }, [invoice.price, invoice.quantity]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setInvoice((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    alert("Invoice Created Successfully!");

    setInvoice({
      invoiceId: "",
      clientName: "",
      clientMobile: "",
      clientAddress: "",
      date: "",
      description: "",
      price: "",
      quantity: "",
      totalAmount: "",
      status: "Unpaid",
    });
  };

  return (
    <div className="min-h-screen bg-slate-50 p-6 md:p-10">
      <div className="max-w-4xl mx-auto space-y-8">
        
        {/* COMPANY HEADER */}

        <div className="bg-white rounded-3xl shadow-sm border border-slate-200 p-6 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <img src={company.logo} alt="logo" />
          </div>

          <div className="text-sm text-slate-600 space-y-1 text-right">
            <p className="font-bold text-lg text-slate-800">
              {company.name}
            </p>
            <p>{company.address}</p>
            <p>{company.mobile}</p>
            <p>{company.email}</p>
            <p className="text-teal-600 font-medium">
              {company.website}
            </p>
          </div>
        </div>

        {/* FORM */}

        <form
          onSubmit={handleSubmit}
          className="bg-white rounded-3xl shadow-sm border border-slate-200 p-8 space-y-6"
        >
          <h2 className="text-2xl font-bold text-slate-800">
            Create Invoice
          </h2>

          {/* Invoice + Date */}

          <div className="grid md:grid-cols-2 gap-6">
            <Field label="Invoice ID">
              <input
                name="invoiceId"
                value={invoice.invoiceId}
                onChange={handleChange}
                required
                className={inputClass}
              />
            </Field>

            <Field label="Invoice Date">
              <input
                type="date"
                name="date"
                value={invoice.date}
                onChange={handleChange}
                required
                className={inputClass}
              />
            </Field>
          </div>

          {/* CLIENT */}

          <div className="grid md:grid-cols-2 gap-6">
            <Field label="Client Name">
              <input
                name="clientName"
                value={invoice.clientName}
                onChange={handleChange}
                required
                className={inputClass}
              />
            </Field>

            <Field label="Client Mobile">
              <input
                name="clientMobile"
                value={invoice.clientMobile}
                onChange={handleChange}
                required
                className={inputClass}
              />
            </Field>
          </div>

          <Field label="Client Address">
            <textarea
              name="clientAddress"
              value={invoice.clientAddress}
              onChange={handleChange}
              rows={3}
              className={`${inputClass} h-24 py-2`}
            />
          </Field>

          {/* ITEM */}

          <h3 className="font-semibold text-lg text-slate-700">
            Item Details
          </h3>

          <Field label="Description">
            <input
              name="description"
              value={invoice.description}
              onChange={handleChange}
              required
              className={inputClass}
            />
          </Field>

          <div className="grid md:grid-cols-3 gap-6">
            <Field label="Price">
              <input
                type="number"
                name="price"
                value={invoice.price}
                onChange={handleChange}
                required
                className={inputClass}
              />
            </Field>

            <Field label="Quantity">
              <input
                type="number"
                name="quantity"
                value={invoice.quantity}
                onChange={handleChange}
                required
                className={inputClass}
              />
            </Field>

            <Field label="Total Amount">
              <input
                value={invoice.totalAmount}
                readOnly
                className={`${inputClass} bg-slate-100 font-semibold`}
              />
            </Field>
          </div>

          {/* STATUS */}

          <Field label="Status">
            <select
              name="status"
              value={invoice.status}
              onChange={handleChange}
              className={inputClass}
            >
              <option>Unpaid</option>
              <option>Paid</option>
            </select>
          </Field>

          <button className="w-full h-12 bg-teal-600 hover:bg-teal-700 text-white rounded-xl font-semibold shadow-sm transition">
            Create Invoice
          </button>
        </form>
      </div>
    </div>
  );
};

const Field = ({ label, children }) => (
  <div>
    <label className="block text-sm font-semibold mb-2 text-slate-700">
      {label}
    </label>
    {children}
  </div>
);

export default CreateInvoice;
