import React from "react";

const invoices = [
  {
    id: 1,
    invoiceId: "INV001",
    clientName: "Acme Corp",
    clientMobile: "9876543210",
    date: "2025-10-14",
    totalAmount: 5000,
    status: "Paid",
  },
  {
    id: 2,
    invoiceId: "INV002",
    clientName: "Globex",
    clientMobile: "9123456780",
    date: "2025-10-15",
    totalAmount: 3500,
    status: "Unpaid",
  },
];

const ShowInvoices = () => {
  return (
    <div className="min-h-screen bg-slate-50 p-6 md:p-10">
      <div className="max-w-6xl mx-auto bg-white rounded-3xl shadow-sm border border-slate-200 p-6">
        
        <h2 className="text-2xl font-bold mb-6">
          Invoices
        </h2>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            
            <thead>
              <tr className="bg-slate-100 text-slate-700">
                <th className="p-3 text-left">Invoice</th>
                <th className="p-3 text-left">Client</th>
                <th className="p-3">Mobile</th>
                <th className="p-3">Date</th>
                <th className="p-3">Amount</th>
                <th className="p-3">Status</th>
                <th className="p-3">Download</th>
              </tr>
            </thead>

            <tbody>
              {invoices.map((inv) => (
                <tr
                  key={inv.id}
                  className="border-b hover:bg-slate-50 transition"
                >
                  <td className="p-3 font-semibold">
                    {inv.invoiceId}
                  </td>

                  <td className="p-3">
                    {inv.clientName}
                  </td>

                  <td className="p-3 text-center">
                    {inv.clientMobile}
                  </td>

                  <td className="p-3 text-center">
                    {inv.date}
                  </td>

                  <td className="p-3 text-center font-semibold">
                    ₹{inv.totalAmount}
                  </td>

                  <td className="p-3 text-center">
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-semibold ${
                        inv.status === "Paid"
                          ? "bg-green-100 text-green-700"
                          : "bg-red-100 text-red-700"
                      }`}
                    >
                      {inv.status}
                    </span>
                  </td>

                  <td className="p-3 text-center">
                    <button className="px-3 py-1.5 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition text-xs">
                      Download
                    </button>
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

export default ShowInvoices;
