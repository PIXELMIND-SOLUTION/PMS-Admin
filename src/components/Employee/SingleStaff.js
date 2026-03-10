import React, { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import {
  MdEmail,
  MdPhone,
  MdWork,
  MdCalendarToday,
  MdBloodtype,
  MdPerson,
  MdEdit,
  MdArrowBack,
  MdDownload,
} from "react-icons/md";
import { FaUserTie, FaIdCard, FaFileAlt, FaPrint } from "react-icons/fa";

const API_URL = "https://pms-backend-t3ox.onrender.com/api/staff";
const adminDetails = JSON.parse(sessionStorage.getItem("adminDetails"));
const AUTH_TOKEN = adminDetails?.token;

const StaffDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [staff, setStaff] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchStaffDetails();
  }, [id]);

  const fetchStaffDetails = async () => {
    try {
      setLoading(true);
      const res = await fetch(`${API_URL}/${id}`, {
        headers: { Authorization: `Bearer ${AUTH_TOKEN}` },
      });
      const data = await res.json();

      if (data.success) {
        setStaff(data.data);
      } else {
        setError(data.message || "Failed to load staff details");
      }
    } catch (err) {
      setError("Network error: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return "Not specified";
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const handlePrint = () => window.print();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-600">Loading staff details...</p>
      </div>
    );
  }

  if (error || !staff) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-bold">Staff Not Found</h2>
          <p>{error}</p>
        </div>
      </div>
    );
  }

  const profileImageUrl = staff.profileImage ? staff.profileImage : null;

  const idCardImageUrl =
    staff.idCardImage && !staff.idCardImage.startsWith("/data/user")
      ? staff.idCardImage
      : null;

  const docEntries = [];
  if (staff.documents && typeof staff.documents === "object") {
    Object.entries(staff.documents).forEach(([category, files]) => {
      if (Array.isArray(files)) {
        files.forEach((f) =>
          docEntries.push({ name: f.name || category, path: f.path })
        );
      }
    });
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-6">

      {/* Header */}
      <div className="mb-6 flex items-center justify-between flex-wrap gap-3">
        <button
          onClick={() => navigate("/staff")}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-900"
        >
          <MdArrowBack />
          Back to Staff
        </button>

        <div className="flex gap-3">
          <button
            onClick={handlePrint}
            className="flex items-center gap-2 px-4 py-2 bg-gray-100 rounded-lg"
          >
            <FaPrint />
            <span className="hidden sm:inline">Print</span>
          </button>

          <Link
            to={`/edit-staff/${id}`}
            className="flex items-center gap-2 px-4 py-2 bg-teal-600 text-white rounded-lg"
          >
            <MdEdit />
            <span className="hidden sm:inline">Edit Staff</span>
          </Link>
        </div>
      </div>

      <div className="max-w-6xl mx-auto">

        {/* Profile Header */}
        <div className="bg-gradient-to-r from-teal-600 to-teal-700 rounded-2xl shadow-xl mb-8 p-6 md:p-8 text-white">
          <div className="flex flex-col md:flex-row items-center gap-6">

            {profileImageUrl ? (
              <img
                src={`https://pms-backend-t3ox.onrender.com${profileImageUrl}`}
                alt={staff.employeeName}
                className="w-32 h-32 rounded-full object-cover border-4 border-white/30"
              />
            ) : (
              <div className="w-32 h-32 rounded-full bg-white/20 flex items-center justify-center">
                <FaUserTie className="text-5xl text-white/80" />
              </div>
            )}

            <div>
              <h1 className="text-3xl font-bold">{staff.employeeName}</h1>

              <div className="flex flex-wrap gap-3 mt-2">
                <span className="bg-white/20 px-3 py-1 rounded-full flex items-center gap-1">
                  <MdWork /> {staff.role}
                </span>

                <span
                  className={`px-3 py-1 rounded-full ${
                    staff.isActive ? "bg-green-500/30" : "bg-red-500/30"
                  }`}
                >
                  {staff.isActive ? "Active" : "Inactive"}
                </span>
              </div>

              <p className="text-sm mt-2">
                Staff ID: <b>{staff.employeeId}</b>
              </p>
            </div>
          </div>
        </div>

        {/* Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

          {/* Left */}
          <div className="lg:col-span-6 space-y-8">

            {/* Personal Info */}
            <div className="bg-white rounded-2xl shadow p-6">
              <h2 className="text-xl font-bold mb-6 border-b pb-3">
                Personal Information
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

                <InfoCard
                  icon={<FaIdCard className="text-teal-600 text-xl" />}
                  label="Employee ID"
                  value={staff.employeeId}
                />

                <InfoCard
                  icon={<MdBloodtype className="text-red-500 text-xl" />}
                  label="Blood Group"
                  value={staff.bloodGroup || "Not specified"}
                />

                <InfoCard
                  icon={<MdCalendarToday className="text-purple-500 text-xl" />}
                  label="Joining Date"
                  value={formatDate(staff.joiningDate)}
                />

                <InfoCard
                  icon={<MdPerson className="text-green-500 text-xl" />}
                  label="Status"
                  value={staff.isActive ? "Active" : "Inactive"}
                />

              </div>
            </div>

            {/* Contact Info */}
            <div className="bg-white rounded-2xl shadow p-6">
              <h2 className="text-xl font-bold mb-6 border-b pb-3">
                Contact Information
              </h2>

              <div className="space-y-6">
                <ContactInfo
                  icon={<MdEmail className="text-teal-600 text-xl" />}
                  label="Email"
                  value={staff.email}
                  type="email"
                />

                <ContactInfo
                  icon={<MdPhone className="text-blue-600 text-xl" />}
                  label="Mobile"
                  value={staff.mobile}
                  type="phone"
                />
              </div>
            </div>

            {/* ID Card */}
            {idCardImageUrl && (
              <div className="bg-white rounded-2xl shadow p-6">
                <h2 className="text-xl font-bold mb-4 border-b pb-3">
                  ID Card
                </h2>

                <img
                  src={idCardImageUrl}
                  alt="ID Card"
                  className="rounded-lg max-h-56 object-cover"
                />
              </div>
            )}
          </div>

          {/* Right - Documents */}
          <div className="space-y-8">

            {docEntries.length > 0 && (
              <div className="bg-white rounded-2xl shadow p-6">
                <h2 className="text-xl font-bold mb-6 border-b pb-3">
                  Documents
                </h2>

                <div className="space-y-3">
                  {docEntries.map((doc, index) => (
                    <a
                      key={index}
                      href={doc.path}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50"
                    >
                      <div className="flex items-center gap-3">
                        <FaFileAlt className="text-teal-600" />
                        <span>{doc.name}</span>
                      </div>

                      <MdDownload />
                    </a>
                  ))}
                </div>
              </div>
            )}

          </div>
        </div>
      </div>
    </div>
  );
};

const InfoCard = ({ icon, label, value }) => (
  <div className="flex gap-4 p-4 bg-gray-50 rounded-xl">
    {icon}
    <div>
      <div className="text-sm text-gray-500">{label}</div>
      <div className="font-semibold">{value}</div>
    </div>
  </div>
);

const ContactInfo = ({ icon, label, value, type }) => (
  <div className="flex gap-4 p-4 bg-gray-50 rounded-xl">
    {icon}
    <div>
      <div className="text-sm text-gray-500">{label}</div>

      {type === "email" ? (
        <a href={`mailto:${value}`} className="text-teal-600">
          {value}
        </a>
      ) : (
        <a href={`tel:${value}`} className="text-blue-600">
          {value}
        </a>
      )}
    </div>
  </div>
);

export default StaffDetails;