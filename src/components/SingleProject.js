import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { 
  MdEdit, 
  MdArrowBack, 
  MdDownload, 
  MdShare,
  MdCalendarToday,
  MdAttachMoney,
  MdPeople,
  MdDescription,
  MdPayment
} from 'react-icons/md';
import { 
  FaRupeeSign, 
  FaMobileAlt, 
  FaEnvelope, 
  FaFileAlt,
  FaPrint,
  FaChartLine,
  FaUserTie
} from 'react-icons/fa';
import * as XLSX from 'xlsx';

const ProjectDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchProjectDetails();
  }, [id]);

  const fetchProjectDetails = async () => {
    try {
      setLoading(true);
      const res = await fetch(`http://31.97.206.144:5000/api/project/${id}`);
      const data = await res.json();
      if (data.success) {
        setProject(data.data);
      } else {
        setError('Failed to load project details');
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

  const getStatusColor = (status) => {
    switch (status) {
      case 'active': return 'text-emerald-600 bg-emerald-50 border-emerald-200';
      case 'completed': return 'text-blue-600 bg-blue-50 border-blue-200';
      case 'on hold': return 'text-amber-600 bg-amber-50 border-amber-200';
      case 'cancelled': return 'text-red-600 bg-red-50 border-red-200';
      default: return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const getCategoryColor = (category) => {
    switch (category) {
      case 'website': return 'text-teal-600 bg-teal-50 border-teal-200';
      case 'mobile app': return 'text-green-600 bg-green-50 border-green-200';
      case 'digital market': return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      case 'software': return 'text-blue-600 bg-blue-50 border-blue-200';
      case 'consulting': return 'text-purple-600 bg-purple-50 border-purple-200';
      default: return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const getPaymentModeColor = (mode) => {
    switch (mode?.toLowerCase()) {
      case 'cash': return 'bg-emerald-100 text-emerald-800';
      case 'bank transfer': return 'bg-blue-100 text-blue-800';
      case 'upi': return 'bg-teal-100 text-teal-800';
      case 'cheque': return 'bg-amber-100 text-amber-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const calculateProgress = () => {
    if (!project?.milestonePayments?.length) return 0;
    const paidCount = project.milestonePayments.filter(p => p.paid).length;
    return Math.round((paidCount / project.milestonePayments.length) * 100);
  };

  const calculateTotalPaid = () => {
    if (!project?.milestonePayments?.length) return 0;
    return project.milestonePayments
      .filter(p => p.paid)
      .reduce((total, p) => total + (p.amount || 0), 0);
  };

  const exportProjectToExcel = () => {
    if (!project) return;

    const worksheetData = [
      {
        'Project ID': project.projectid,
        'Project Name': project.projectname,
        'Client Name': project.clientname,
        'Client Mobile': project.mobilenumber,
        'Client Email': project.email,
        'Category': project.selectcategory,
        'Status': project.status,
        'Start Date': formatDate(project.startDate),
        'Handover Date': formatDate(project.projectHandoverDate),
        'Deadline': formatDate(project.deadlineDate),
        'Project Cost': project.projectCost,
        'Total Milestones': project.milestone || '0',
        'Created Date': formatDate(project.createdAt)
      }
    ];

    const ws = XLSX.utils.json_to_sheet(worksheetData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Project Details");
    XLSX.writeFile(wb, `project_${project.projectid}_${new Date().toISOString().split('T')[0]}.xlsx`);
  };

  const handlePrint = () => {
    window.print();
  };

  const handleShare = () => {
    if (navigator.share && project) {
      navigator.share({
        title: `Project Details - ${project.projectname}`,
        text: `View details of project "${project.projectname}"`,
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
          <p className="mt-4 text-gray-600 font-medium">Loading project details...</p>
        </div>
      </div>
    );
  }

  if (error || !project) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="text-center max-w-md">
          <div className="text-red-500 text-5xl mb-4">⚠️</div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Project Not Found</h2>
          <p className="text-gray-600 mb-6">{error || 'The requested project does not exist.'}</p>
          <button
            onClick={() => navigate('/projects')}
            className="px-6 py-3 bg-teal-600 text-white font-medium rounded-lg hover:bg-teal-700 transition-colors"
          >
            Back to Projects
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-6 print:p-0">
      {/* Header */}
      <div className="mb-6 print:hidden">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <button
            onClick={() => navigate('/projects')}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors self-start"
          >
            <MdArrowBack />
            <span>Back to Projects</span>
          </button>
          
          <div className="flex flex-wrap items-center gap-3">
            <Link
              to={`/edit-project/${id}`}
              className="flex items-center gap-2 px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors"
            >
              <MdEdit />
              <span className="hidden sm:inline">Edit Project</span>
            </Link>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto">
        {/* Project Header */}
        <div className="bg-gradient-to-r from-teal-600 to-teal-700 rounded-2xl shadow-xl overflow-hidden mb-8 print:rounded-none">
          <div className="p-6 md:p-8 text-white">
            <div className="flex flex-col md:flex-row md:items-start justify-between gap-6">
              <div className="flex-1">
                <div className="flex flex-wrap items-center gap-3 mb-4">
                  <h1 className="text-2xl md:text-3xl font-bold">{project.projectname}</h1>
                  <div className="flex items-center gap-2">
                    <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium border ${getStatusColor(project.status)}`}>
                      {project.status}
                    </span>
                    <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium border ${getCategoryColor(project.selectcategory)}`}>
                      {project.selectcategory}
                    </span>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
                  <div className="flex items-center gap-2">
                    <FaUserTie className="text-white/80" />
                    <span className="font-medium">Client:</span>
                    <span>{project.clientname}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <MdAttachMoney className="text-white/80" />
                    <span className="font-medium">Budget:</span>
                    <span>₹{project.projectCost?.toLocaleString() || '0'}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <MdCalendarToday className="text-white/80" />
                    <span className="font-medium">Start Date:</span>
                    <span>{formatDate(project.startDate)}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <FaChartLine className="text-white/80" />
                    <span className="font-medium">Milestones:</span>
                    <span>{project.milestone || '0'}</span>
                  </div>
                </div>

                <div className="text-sm text-white/80">
                  Project ID: <span className="font-semibold">{project.projectid}</span> • 
                  Created: <span className="font-semibold">{formatDate(project.createdAt)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Project Details */}
          <div className="lg:col-span-2 space-y-8">
            {/* Basic Information */}
            <div className="bg-white rounded-2xl shadow-lg p-6 print:shadow-none">
              <h2 className="text-xl font-bold text-gray-900 mb-6 pb-3 border-b border-gray-100">
                Basic Information
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <InfoCard
                  label="Project ID"
                  value={project.projectid}
                  icon="🔑"
                />
                <InfoCard
                  label="Category"
                  value={project.selectcategory}
                  icon="📁"
                  badgeClass={getCategoryColor(project.selectcategory)}
                />
                <InfoCard
                  label="Status"
                  value={project.status}
                  icon="📊"
                  badgeClass={getStatusColor(project.status)}
                />
                <InfoCard
                  label="Project Cost"
                  value={`₹${project.projectCost?.toLocaleString() || '0'}`}
                  icon="💰"
                  valueClass="text-emerald-600 font-bold"
                />
              </div>
            </div>

            {/* Timeline Information */}
            <div className="bg-white rounded-2xl shadow-lg p-6 print:shadow-none">
              <h2 className="text-xl font-bold text-gray-900 mb-6 pb-3 border-b border-gray-100">
                Project Timeline
              </h2>
              <div className="space-y-4">
                <TimelineItem
                  icon={<MdCalendarToday className="text-teal-600" />}
                  label="Start Date"
                  date={project.startDate}
                />
                <TimelineItem
                  icon={<MdCalendarToday className="text-blue-600" />}
                  label="Handover Date"
                  date={project.projectHandoverDate}
                />
                <TimelineItem
                  icon={<MdCalendarToday className="text-red-600" />}
                  label="Deadline"
                  date={project.deadlineDate}
                  isDeadline={true}
                />
              </div>
            </div>

            {/* Client Information */}
            <div className="bg-white rounded-2xl shadow-lg p-6 print:shadow-none">
              <h2 className="text-xl font-bold text-gray-900 mb-6 pb-3 border-b border-gray-100">
                Client Information
              </h2>
              <div className="space-y-4">
                <ContactInfo
                  icon={<FaUserTie className="text-teal-600" />}
                  label="Client Name"
                  value={project.clientname}
                />
                <ContactInfo
                  icon={<FaMobileAlt className="text-blue-600" />}
                  label="Mobile Number"
                  value={project.mobilenumber}
                  type="phone"
                />
                <ContactInfo
                  icon={<FaEnvelope className="text-purple-600" />}
                  label="Email Address"
                  value={project.email}
                  type="email"
                />
              </div>
            </div>
          </div>

          {/* Right Column - Milestones & Team */}
          <div className="space-y-8">
            {/* Milestone Payments */}
            {project.milestonePayments?.length > 0 && (
              <div className="bg-white rounded-2xl shadow-lg p-6 print:shadow-none">
                <h2 className="text-xl font-bold text-gray-900 mb-6 pb-3 border-b border-gray-100">
                  Milestone Payments
                </h2>
                
                {/* Progress Summary */}
                <div className="mb-6 p-4 bg-gray-50 rounded-xl">
                  <div className="flex items-center justify-between mb-3">
                    <div className="text-sm font-medium text-gray-700">Payment Progress</div>
                    <div className="text-lg font-bold text-teal-600">{calculateProgress()}%</div>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2.5">
                    <div 
                      className="bg-teal-600 h-2.5 rounded-full" 
                      style={{ width: `${calculateProgress()}%` }}
                    ></div>
                  </div>
                  <div className="flex justify-between mt-2 text-sm text-gray-600">
                    <span>₹{calculateTotalPaid().toLocaleString()} paid</span>
                    <span>₹{(project.projectCost - calculateTotalPaid()).toLocaleString()} remaining</span>
                  </div>
                </div>

                {/* Milestones List */}
                <div className="space-y-4">
                  {project.milestonePayments.map((payment, index) => (
                    <div 
                      key={payment._id || index} 
                      className="p-4 border border-gray-200 rounded-xl hover:border-teal-300 transition-colors"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white font-bold ${
                            payment.paid ? 'bg-emerald-500' : 'bg-amber-500'
                          }`}>
                            {index + 1}
                          </div>
                          <div>
                            <h4 className="font-semibold text-gray-900">
                              {payment.description || `Milestone ${index + 1}`}
                            </h4>
                            <div className="flex items-center gap-2 mt-1">
                              <span className={`px-2 py-1 rounded text-xs font-medium ${getPaymentModeColor(payment.paymentMode)}`}>
                                {payment.paymentMode}
                              </span>
                              <span className={`px-2 py-1 rounded text-xs font-medium ${
                                payment.paid ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                              }`}>
                                {payment.paid ? 'Paid' : 'Pending'}
                              </span>
                            </div>
                          </div>
                        </div>
                        <div className="text-lg font-bold text-emerald-600">
                          ₹{payment.amount?.toLocaleString()}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Team Members */}
            {project.teamMembers && Object.keys(project.teamMembers).length > 0 && (
              <div className="bg-white rounded-2xl shadow-lg p-6 print:shadow-none">
                <h2 className="text-xl font-bold text-gray-900 mb-6 pb-3 border-b border-gray-100">
                  Team Members
                </h2>
                <div className="space-y-4">
                  {Object.entries(project.teamMembers).map(([role, members]) => (
                    members.length > 0 && (
                      <div key={role} className="p-3 bg-gray-50 rounded-lg">
                        <div className="flex items-center justify-between mb-2">
                          <span className="font-medium text-gray-900 capitalize">{role}</span>
                          <span className="text-sm text-gray-600">{members.length} members</span>
                        </div>
                        <div className="flex flex-wrap gap-2">
                          {members.map((member, idx) => (
                            <span 
                              key={idx} 
                              className="px-3 py-1.5 bg-white border border-gray-200 rounded-lg text-sm font-medium"
                            >
                              {member}
                            </span>
                          ))}
                        </div>
                      </div>
                    )
                  ))}
                </div>
              </div>
            )}

            {/* Attached Files */}
            {(project.uploadfile || project.quotationfile) && (
              <div className="bg-white rounded-2xl shadow-lg p-6 print:shadow-none">
                <h2 className="text-xl font-bold text-gray-900 mb-6 pb-3 border-b border-gray-100">
                  Attached Files
                </h2>
                <div className="space-y-3">
                  {project.uploadfile && (
                    <a
                      href={project.uploadfile}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center justify-between p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors group"
                    >
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-teal-50 rounded-lg">
                          <FaFileAlt className="text-xl text-teal-600" />
                        </div>
                        <div>
                          <div className="font-medium text-gray-900">Project File</div>
                          <div className="text-sm text-gray-600">Click to view/download</div>
                        </div>
                      </div>
                      <MdDownload className="text-gray-400 group-hover:text-teal-600 transition-colors" />
                    </a>
                  )}
                  {project.quotationfile && (
                    <a
                      href={project.quotationfile}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center justify-between p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors group"
                    >
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-blue-50 rounded-lg">
                          <FaFileAlt className="text-xl text-blue-600" />
                        </div>
                        <div>
                          <div className="font-medium text-gray-900">Quotation File</div>
                          <div className="text-sm text-gray-600">Click to view/download</div>
                        </div>
                      </div>
                      <MdDownload className="text-gray-400 group-hover:text-blue-600 transition-colors" />
                    </a>
                  )}
                </div>
              </div>
            )}
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
const InfoCard = ({ label, value, icon, badgeClass, valueClass }) => (
  <div className="p-4 rounded-xl bg-gray-50 hover:bg-gray-100 transition-colors">
    <div className="text-sm text-gray-600 font-medium mb-2">{label}</div>
    <div className="flex items-center gap-2">
      {icon && <span className="text-xl">{icon}</span>}
      {badgeClass ? (
        <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium border ${badgeClass}`}>
          {value}
        </span>
      ) : (
        <span className={`text-lg font-semibold ${valueClass || 'text-gray-900'}`}>
          {value}
        </span>
      )}
    </div>
  </div>
);

const TimelineItem = ({ icon, label, date, isDeadline }) => {
  const formattedDate = date ? new Date(date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  }) : 'Not specified';

  const isOverdue = isDeadline && date && new Date(date) < new Date();

  return (
    <div className="flex items-start gap-4 p-4 rounded-xl bg-gray-50">
      <div className="flex-shrink-0 mt-1">{icon}</div>
      <div className="flex-1">
        <div className="font-medium text-gray-900">{label}</div>
        <div className={`text-sm ${isOverdue ? 'text-red-600 font-semibold' : 'text-gray-600'}`}>
          {formattedDate}
          {isOverdue && <span className="ml-2 text-xs bg-red-100 text-red-800 px-2 py-1 rounded">Overdue</span>}
        </div>
      </div>
    </div>
  );
};

const ContactInfo = ({ icon, label, value, type }) => (
  <div className="flex items-center gap-4 p-4 rounded-xl bg-gray-50 hover:bg-gray-100 transition-colors">
    <div className="flex-shrink-0">{icon}</div>
    <div className="flex-1">
      <div className="font-medium text-gray-900">{label}</div>
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

export default ProjectDetails;