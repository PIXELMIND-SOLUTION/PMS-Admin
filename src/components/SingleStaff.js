import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
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
  MdShare
} from 'react-icons/md';
import { 
  FaUserTie, 
  FaIdCard, 
  FaChartLine, 
  FaFileAlt,
  FaPrint
} from 'react-icons/fa';

const StaffDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [staff, setStaff] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchStaffDetails();
  }, [id]);

  const fetchStaffDetails = async () => {
    try {
      setLoading(true);
      const res = await fetch(`http://31.97.206.144:5000/api/staff/${id}`);
      const data = await res.json();
      if (data.success) {
        setStaff(data.data);
      } else {
        setError('Failed to load staff details');
      }
    } catch (err) {
      setError('Network error: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Not specified';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getExperienceDisplay = (experience) => {
    if (!experience && experience !== 0) return 'Not specified';
    if (experience === 1) return '1 year';
    if (experience < 1) return `${Math.round(experience * 12)} months`;
    if (experience % 1 === 0) return `${experience} years`;
    const years = Math.floor(experience);
    const months = Math.round((experience - years) * 12);
    return `${years} year${years > 1 ? 's' : ''} ${months} month${months > 1 ? 's' : ''}`;
  };

  const handlePrint = () => {
    window.print();
  };

  const handleShare = () => {
    if (navigator.share && staff) {
      navigator.share({
        title: `Staff Details - ${staff.staffName}`,
        text: `View details of ${staff.staffName}, ${staff.role} at our company`,
        url: window.location.href,
      });
    } else {
      navigator.clipboard.writeText(window.location.href);
      alert('Link copied to clipboard!');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-teal-600"></div>
          <p className="mt-4 text-gray-600 font-medium">Loading staff details...</p>
        </div>
      </div>
    );
  }

  if (error || !staff) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="text-center max-w-md">
          <div className="text-red-500 text-5xl mb-4">⚠️</div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Staff Not Found</h2>
          <p className="text-gray-600 mb-6">{error || 'The requested staff member does not exist.'}</p>
          <button
            onClick={() => navigate('/staff')}
            className="px-6 py-3 bg-teal-600 text-white font-medium rounded-lg hover:bg-teal-700 transition-colors"
          >
            Back to Staff List
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-6 print:p-0">
      {/* Header */}
      <div className="mb-6 print:hidden">
        <div className="flex items-center justify-between">
          <button
            onClick={() => navigate('/staff')}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
          >
            <MdArrowBack />
            <span>Back to Staff</span>
          </button>
          
          <div className="flex items-center gap-3">
            
            <button
              onClick={handlePrint}
              className="flex items-center gap-2 px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
            >
              <FaPrint />
              <span className="hidden sm:inline">Print</span>
            </button>
            <Link
              to={`/staff/edit/${id}`}
              className="flex items-center gap-2 px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors"
            >
              <MdEdit />
              <span className="hidden sm:inline">Edit Staff</span>
            </Link>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-6xl mx-auto">
        {/* Profile Header */}
        <div className="bg-gradient-to-r from-teal-600 to-teal-700 rounded-2xl shadow-xl overflow-hidden mb-8 print:rounded-none">
          <div className="p-6 md:p-8 text-white">
            <div className="flex flex-col md:flex-row md:items-center gap-6">
              {/* Profile Image */}
              <div className="flex-shrink-0">
                {staff.profileImage ? (
                  <img
                    src={staff.profileImage}
                    alt={staff.staffName}
                    className="w-32 h-32 rounded-full object-cover border-4 border-white/30 shadow-2xl"
                  />
                ) : (
                  <div className="w-32 h-32 rounded-full bg-white/20 border-4 border-white/30 shadow-2xl flex items-center justify-center">
                    <FaUserTie className="text-5xl text-white/80" />
                  </div>
                )}
              </div>

              {/* Profile Info */}
              <div className="flex-1">
                <h1 className="text-3xl md:text-4xl font-bold mb-2">{staff.staffName}</h1>
                <div className="flex items-center gap-4 mb-4">
                  <span className="inline-flex items-center gap-2 px-4 py-1.5 bg-white/20 rounded-full text-sm font-medium">
                    <MdWork />
                    {staff.role}
                  </span>
                  <span className={`inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-sm font-medium ${
                    staff.isActive
                      ? 'bg-emerald-500/30 text-white'
                      : 'bg-red-500/30 text-white'
                  }`}>
                    <MdPerson />
                    {staff.isActive ? 'Active' : 'Inactive'}
                  </span>
                </div>
                <p className="text-white/80 max-w-2xl">
                  Staff ID: <span className="font-semibold">{staff.staffId}</span> • 
                  Joined on <span className="font-semibold">{formatDate(staff.joiningDate)}</span> • 
                  Experience: <span className="font-semibold">{getExperienceDisplay(staff.experience)}</span>
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Details Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Personal Info */}
          <div className="lg:col-span-2 space-y-8">
            {/* Personal Information Card */}
            <div className="bg-white rounded-2xl shadow-lg p-6 print:shadow-none">
              <h2 className="text-xl font-bold text-gray-900 mb-6 pb-3 border-b border-gray-100">
                Personal Information
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <InfoCard
                  icon={<FaIdCard className="text-2xl text-teal-600" />}
                  label="Staff ID"
                  value={staff.staffId}
                />
                <InfoCard
                  icon={<MdBloodtype className="text-2xl text-red-500" />}
                  label="Blood Group"
                  value={staff.bloodGroup || 'Not specified'}
                />
                <InfoCard
                  icon={<FaChartLine className="text-2xl text-blue-500" />}
                  label="Experience"
                  value={getExperienceDisplay(staff.experience)}
                />
                <InfoCard
                  icon={<MdCalendarToday className="text-2xl text-purple-500" />}
                  label="Joining Date"
                  value={formatDate(staff.joiningDate)}
                />
                <InfoCard
                  icon={<MdCalendarToday className="text-2xl text-amber-500" />}
                  label="Member Since"
                  value={formatDate(staff.createdAt)}
                />
                <InfoCard
                  icon={<MdPerson className="text-2xl text-emerald-500" />}
                  label="Status"
                  value={
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                      staff.isActive
                        ? 'bg-emerald-100 text-emerald-800'
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {staff.isActive ? 'Active' : 'Inactive'}
                    </span>
                  }
                />
              </div>
            </div>

            {/* Contact Information Card */}
            <div className="bg-white rounded-2xl shadow-lg p-6 print:shadow-none">
              <h2 className="text-xl font-bold text-gray-900 mb-6 pb-3 border-b border-gray-100">
                Contact Information
              </h2>
              <div className="space-y-6">
                <ContactInfo
                  icon={<MdEmail className="text-2xl text-teal-600" />}
                  label="Email Address"
                  value={staff.email}
                  type="email"
                />
                <ContactInfo
                  icon={<MdPhone className="text-2xl text-blue-600" />}
                  label="Mobile Number"
                  value={staff.mobileNumber}
                  type="phone"
                />
              </div>
            </div>
          </div>

          {/* Right Column - Documents & Quick Actions */}
          <div className="space-y-8">
            {/* Documents Card */}
            {staff.documents?.length > 0 && (
              <div className="bg-white rounded-2xl shadow-lg p-6 print:shadow-none">
                <h2 className="text-xl font-bold text-gray-900 mb-6 pb-3 border-b border-gray-100">
                  Documents & Files
                </h2>
                <div className="grid grid-cols-2 gap-4">
                  {staff.documents.map((doc, index) => (
                    <a
                      key={index}
                      href={doc}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="group relative overflow-hidden rounded-xl border border-gray-200 hover:border-teal-300 hover:shadow-md transition-all"
                    >
                      <div className="aspect-square bg-gray-50 flex items-center justify-center">
                        <FaFileAlt className="text-3xl text-gray-400 group-hover:text-teal-500 transition-colors" />
                      </div>
                      <div className="p-3 bg-white">
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium text-gray-700 truncate">
                            Document {index + 1}
                          </span>
                          <MdDownload className="text-gray-400 group-hover:text-teal-500 transition-colors" />
                        </div>
                      </div>
                    </a>
                  ))}
                </div>
              </div>
            )}

            {/* Quick Actions Card */}
            <div className="bg-gradient-to-br from-teal-600 to-teal-700 rounded-2xl shadow-lg p-6 text-white">
              <h2 className="text-xl font-bold mb-6">Quick Actions</h2>
              <div className="space-y-4">
                <Link
                  to={`/staff/edit/${id}`}
                  className="flex items-center justify-between p-4 bg-white/10 rounded-xl hover:bg-white/20 transition-colors group"
                >
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-white/20 rounded-lg">
                      <MdEdit className="text-xl" />
                    </div>
                    <span className="font-medium">Edit Profile</span>
                  </div>
                </Link>
                
                <button
                  onClick={handlePrint}
                  className="w-full flex items-center justify-between p-4 bg-white/10 rounded-xl hover:bg-white/20 transition-colors group"
                >
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-white/20 rounded-lg">
                      <FaPrint className="text-xl" />
                    </div>
                    <span className="font-medium">Print Profile</span>
                  </div>
                </button>
                
                <Link
                  to="/staff"
                  className="flex items-center justify-between p-4 bg-white/10 rounded-xl hover:bg-white/20 transition-colors group"
                >
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-white/20 rounded-lg">
                      <FaUserTie className="text-xl" />
                    </div>
                    <span className="font-medium">View All Staff</span>
                  </div>
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* Additional Info - Only in print */}
        <div className="hidden print:block mt-8">
          <div className="bg-white p-6 rounded-lg border">
            <h3 className="text-lg font-bold mb-4">Additional Information</h3>
            <p className="text-sm text-gray-600">
              This document was generated on {new Date().toLocaleDateString()}. 
              For official use only.
            </p>
          </div>
        </div>
      </div>

      {/* Print Styles */}
      <style jsx>{`
        @media print {
          body {
            background: white !important;
          }
          .print\\:hidden {
            display: none !important;
          }
          .print\\:p-0 {
            padding: 0 !important;
          }
          .print\\:rounded-none {
            border-radius: 0 !important;
          }
          .print\\:shadow-none {
            box-shadow: none !important;
          }
          a[href]::after {
            content: " (" attr(href) ")";
          }
        }
      `}</style>
    </div>
  );
};

// Helper Components
const InfoCard = ({ icon, label, value }) => (
  <div className="flex items-start gap-4 p-4 rounded-xl bg-gray-50 hover:bg-gray-100 transition-colors">
    <div className="flex-shrink-0">{icon}</div>
    <div className="flex-1">
      <div className="text-sm text-gray-600 font-medium mb-1">{label}</div>
      <div className="text-lg font-semibold text-gray-900">{value}</div>
    </div>
  </div>
);

const ContactInfo = ({ icon, label, value, type }) => (
  <div className="flex items-center gap-4 p-4 rounded-xl bg-gray-50 hover:bg-gray-100 transition-colors">
    <div className="flex-shrink-0">{icon}</div>
    <div className="flex-1">
      <div className="text-sm text-gray-600 font-medium mb-1">{label}</div>
      {type === 'email' ? (
        <a 
          href={`mailto:${value}`}
          className="text-lg font-semibold text-teal-600 hover:text-teal-800 transition-colors break-all"
        >
          {value}
        </a>
      ) : type === 'phone' ? (
        <a 
          href={`tel:${value}`}
          className="text-lg font-semibold text-blue-600 hover:text-blue-800 transition-colors"
        >
          {value}
        </a>
      ) : (
        <div className="text-lg font-semibold text-gray-900">{value}</div>
      )}
    </div>
  </div>
);

export default StaffDetails;