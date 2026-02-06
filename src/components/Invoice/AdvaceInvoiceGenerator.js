import React, { useRef, useState } from "react";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import {
    MdPhone, MdLocationOn, MdEmail, MdLanguage
} from "react-icons/md";

const FinalInvoice = () => {
    const invoiceRef = useRef();

    // Data strictly from the provided image [cite: 1-23]
    const [client] = useState({
        name: "Vegiffy", // [cite: 4]
        phone: "+919052097475", // [cite: 6]
        location: "Hyderabad, Kphb", // [cite: 8]
        invoiceId: "PMS22022518", // [cite: 9]
        date: "13 Jan 2026", // [cite: 11]
    });

    const items = [
        { desc: "Veegify Server Charges", price: "18,350", qty: "01", total: "18,350" } // [cite: 12]
    ];

    const downloadPDF = async () => {
        const canvas = await html2canvas(invoiceRef.current, { scale: 3, useCORS: true });
        const imgData = canvas.toDataURL("image/png");
        const pdf = new jsPDF("p", "mm", "a4");
        pdf.addImage(imgData, "PNG", 0, 0, 210, 297);
        pdf.save(`Invoice_${client.invoiceId}.pdf`);
    };

    return (
        <div className="min-h-screen bg-slate-200 py-10 flex flex-col items-center">
            <button
                onClick={downloadPDF}
                className="mb-6 px-10 py-3 bg-[#13634f] text-white font-bold rounded-full shadow-lg hover:scale-105 transition-transform"
            >
                Download Official Invoice
            </button>

            {/* --- INVOICE CONTAINER --- */}
            <div
                ref={invoiceRef}
                className="bg-white relative shadow-2xl flex flex-col"
                style={{ width: "794px", height: "1020px", overflow: "hidden", fontFamily: "sans-serif" }}
            >


                {/* MAIN BODY SECTION */}
                <div className="flex flex-1">
                    {/* LEFT SIDEBAR (Ends before footer) */}
                    <div className="w-[210px] bg-[#1a6354] flex flex-col items-center pt-12">
                        <div className="mb-4 p-4">
                            <img src="/smalllight.png" className="img-fluid" />
                        </div>
                    </div>

                    {/* RIGHT CONTENT */}
                    <div className="flex-1 px-6 pt-20 relative">

                        {/* WATERMARK */}
                        <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-[0.07]">
                            <div className="text-center ">
                                <img src="/smalllogo.png" className="img-fluid" />
                            </div>
                        </div>

                        <h1 className="text-right text-5xl font-black tracking-tighter text-black mb-16">INVOICE</h1>

                        <div className="mb-10">
                            <h2 className="text-2xl font-bold text-black mb-2">Invoice To</h2>
                            <p className="text-3xl font-black text-black mb-6">{client.name}</p>


                        </div>

                        {/* INFO ROW */}
                        <div className="max-w-[650px] ml-auto mb-12">

                            <div className="flex items-center justify-between gap-6 flex-wrap">

                                {/* PHONE */}
                                <div className=" items-center gap-2 text-slate-700 font-semibold text-sm whitespace-nowrap">
                                    <div className=" items-center gap-6">

                                        {/* PHONE */}
                                        <div className="flex items-center gap-2">
                                            <div className="bg-[#1a6354] w-7 h-7 flex items-center justify-center rounded-full text-white">
                                                <MdPhone size={14} />
                                            </div>

                                            <span className="text-sm font-semibold text-slate-500">
                                                {client.phone}
                                            </span>
                                        </div>


                                        {/* LOCATION */}
                                        <div className="flex items-center gap-2">
                                            <div className="bg-[#1a6354] w-7 h-7 flex items-center justify-center rounded-full text-white">
                                                <MdLocationOn size={14} />
                                            </div>

                                            <span className="text-sm font-semibold text-slate-500">
                                                {client.location}
                                            </span>
                                        </div>

                                    </div>

                                </div>

                                {/* INVOICE */}
                                <div className="text-right whitespace-nowrap">
                                    <h2 className="text-xs font-bold text-slate-900 uppercase tracking-wide">
                                        Invoice No
                                    </h2>
                                    <p className="text-sm font-bold text-slate-500">
                                        {client.invoiceId}
                                    </p>
                                </div>

                                {/* DATE */}
                                <div className="text-right whitespace-nowrap">
                                    <h2 className="text-xs font-bold text-slate-900 uppercase tracking-wide">
                                        Date
                                    </h2>
                                    <p className="text-sm font-bold text-slate-500">
                                        {client.date}
                                    </p>
                                </div>

                            </div>
                        </div>


                        {/* TABLE */}
                        <table className="w-full text-left mb-6">
                            <thead className="bg-[#1a6354] text-white">
                                <tr>
                                    <th className="py-2 px-2 text-[10px] font-bold uppercase">Item Description</th>
                                    <th className="py-2 px-2 text-[10px] font-bold uppercase text-center">Unit Price</th>
                                    <th className="py-2 px-2 text-[10px] font-bold uppercase text-center">Quantity</th>
                                    <th className="py-2 px-2 text-[10px] font-bold uppercase text-right">Amount</th>
                                </tr>
                            </thead>
                            <tbody>
                                {items.map((item, i) => (
                                    <tr key={i} className="bg-slate-50/50">
                                        <td className="py-2 px-4 text-slate-700 text-sm">{item.desc}</td>
                                        <td className="py-2 px-4 text-center text-slate-700 text-sm">₹{item.price}</td>
                                        <td className="py-2 px-4 text-center text-slate-700 text-sm">{item.qty}</td>
                                        <td className="py-2 px-4 text-right font-bold text-slate-700 text-sm">₹{item.total}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>

                        <div className="flex justify-end pr-4 mb-32">
                            <p className="text-sm font-black text-slate-800 mr-12">SUB TOTAL :</p>
                            <p className="text-sm font-black text-slate-800">₹18,350</p>
                        </div>

                        {/* TOTAL SECTION */}
                        <div className="flex justify-between items-end">
                            <div className="flex justify-between items-center">
                                <div>
                                    <h2 className="text-xl font-bold text-black">TOTAL</h2>
                                    <h3 className="text-3xl font-black font-semibold text-black mt-2">₹18,350</h3>
                                    <p className="text-sm font-bold text-slate-800 mt-4 decoration-2">Payment Method</p>
                                </div>
                            </div>

                            <div className="text-center flex justify-center items-end">
                                <div>
                                    <p className="text-2xl font-bold text-black mb-2">K.Narasimha Varma</p>
                                    <div className="bg-[#1a6354] text-white px-2 py-1 rounded-full text-sm font-bold tracking-widest">
                                        DIRECTOR
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* FOOTER SECTION (Floating separate from sidebar) */}
                <div className="h-40 px-16 border-t border-slate-100 flex items-center justify-between">
                    <div className="space-y-3">
                        <div className="flex items-center gap-3 text-[11px] font-bold text-slate-600">
                            <div className="border border-teal-600 p-1 rounded-full text-white bg-[#1a6354]"><MdPhone size={12} /></div>
                            +919666317749
                        </div>
                        <div className="flex items-center gap-3 text-[11px] font-bold text-slate-600">
                            <div className="border border-teal-600 p-1 rounded-full text-white bg-[#1a6354]"><MdEmail size={12} /></div>
                            info@pixelmindsolutions.com
                        </div>
                    </div>

                    <div className="space-y-3 text-right">
                        <div className="flex items-center justify-end gap-3 text-[11px] font-bold text-slate-600">
                            www.pixelmindsolutions.com
                            <div className="border border-teal-600 p-1 rounded-full text-white bg-[#1a6354]"><MdLanguage size={12} /></div>
                        </div>
                        <div className="flex items-center justify-end gap-3 text-[11px] font-bold text-slate-600">
                            Hyderabad
                            <div className="border border-teal-600 p-1 rounded-full text-white bg-[#1a6354]"><MdLocationOn size={12} /></div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default FinalInvoice;