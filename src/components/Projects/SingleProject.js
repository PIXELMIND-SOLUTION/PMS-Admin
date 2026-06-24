import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  MdEdit, MdArrowBack, MdDownload, MdCalendarToday,
  MdAttachMoney, MdPayment, MdPerson, MdPhone, MdEmail, MdLocationOn
} from 'react-icons/md';
import {
  FaRupeeSign, FaMobileAlt, FaEnvelope, FaFileAlt,
  FaPrint, FaChartLine, FaUserTie,
} from 'react-icons/fa';
import * as XLSX from 'xlsx';

const API_URL = 'https://pmsbackend.pixelmindsolutions.com/api/projects';
const adminDetails = JSON.parse(sessionStorage.getItem('adminDetails'));
const AUTH_TOKEN = adminDetails?.token;

const ProjectDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => { fetchProject(); }, [id]);

  const fetchProject = async () => {
    try {
      setLoading(true);
      const res = await fetch(`${API_URL}/${id}`, {
        headers: { Authorization: `Bearer ${AUTH_TOKEN}` },
      });
      const data = await res.json();
      if (data.success) {
        setProject(data.data);
      } else {
        setError(data.message || 'Failed to load project details');
      }
    } catch (err) {
      setError('Network error: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const fmt = (d) => d
    ? new Date(d).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })
    : 'Not specified';

  const statusColor = (s) => ({
    active:    'text-emerald-700 bg-emerald-50 border-emerald-200',
    completed: 'text-blue-700 bg-blue-50 border-blue-200',
    'on hold': 'text-amber-700 bg-amber-50 border-amber-200',
    cancelled: 'text-red-700 bg-red-50 border-red-200',
  }[s] || 'text-gray-600 bg-gray-50 border-gray-200');

  const catColor = (c) => ({
    website:          'text-teal-700 bg-teal-50 border-teal-200',
    'mobile app':     'text-purple-700 bg-purple-50 border-purple-200',
    'digital market': 'text-orange-700 bg-orange-50 border-orange-200',
    software:         'text-blue-700 bg-blue-50 border-blue-200',
  }[c?.toLowerCase()] || 'text-gray-600 bg-gray-50 border-gray-200');

  const exportExcel = () => {
    if (!project) return;
    const ws = XLSX.utils.json_to_sheet([{
      'Project ID': project.projectId,
      'Project Name': project.projectName,
      'Client Name': project.client?.name || 'N/A',
      'Mobile': project.client?.mobile || 'N/A',
      'Email': project.client?.email || 'N/A',
      'Category': project.category,
      'Status': project.status,
      'Start Date': fmt(project.projectStartDate),
      'Deadline': fmt(project.deadline),
      'Project Cost': project.projectCost,
      'Payment Milestones': project.paymentMilestone || 0,
    }]);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Project');
    XLSX.writeFile(wb, `project_${project.projectId}_${new Date().toISOString().split('T')[0]}.xlsx`);
  };

  if (loading) return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <style>{`@keyframes spin{0%{transform:rotate(0deg)}100%{transform:rotate(360deg)}}`}</style>
      <div className="flex flex-col items-center gap-3">
        <div style={{ width:44,height:44,border:'3px solid #e0f2f1',borderTop:'3px solid #0d9488',borderRadius:'50%',animation:'spin .8s linear infinite' }} />
        <p className="text-gray-500 text-sm font-medium">Loading project details…</p>
      </div>
    </div>
  );

  if (error || !project) return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="text-center max-w-sm">
        <p className="text-5xl mb-4">⚠️</p>
        <h2 className="text-xl font-bold text-gray-800 mb-2">Project Not Found</h2>
        <p className="text-gray-500 text-sm mb-5">{error || 'This project does not exist.'}</p>
        <button onClick={() => navigate('/projects')}
          className="px-5 py-2.5 bg-teal-600 text-white rounded-xl font-semibold text-sm hover:bg-teal-700">
          Back to Projects
        </button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 print:bg-white">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap');
        *, *::before, *::after { font-family:'Inter',-apple-system,sans-serif; box-sizing:border-box; }
        .info-card { transition:background .15s; }
        .info-card:hover { background:rgba(240,253,250,0.7); }
        @media print {
          .no-print { display:none!important; }
          body { background:white!important; }
        }
      `}</style>

      <div className="w-full max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8 py-6 lg:py-8">

        {/* Top Nav */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6 no-print">
          <button onClick={() => navigate('/projects')}
            className="flex items-center gap-2 text-gray-600 hover:text-teal-700 font-medium text-sm transition-colors self-start">
            <MdArrowBack size={18} /> Back to Projects
          </button>
          <div className="flex items-center gap-2 flex-wrap">
            <button onClick={exportExcel}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white border border-gray-200 text-gray-600 hover:bg-gray-50 font-semibold text-xs sm:text-sm transition-all shadow-sm">
              <MdDownload size={16} /> Export
            </button>
            <button onClick={() => window.print()}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white border border-gray-200 text-gray-600 hover:bg-gray-50 font-semibold text-xs sm:text-sm transition-all shadow-sm">
              <FaPrint size={13} /> Print
            </button>
            <Link to={`/edit-project/${id}`}
              className="flex items-center gap-1.5 px-3 sm:px-4 py-2 rounded-xl bg-teal-600 text-white hover:bg-teal-700 font-semibold text-xs sm:text-sm transition-all shadow-md">
              <MdEdit size={16} /> Edit Project
            </Link>
          </div>
        </div>

        {/* Hero Banner */}
        <div className="bg-gradient-to-r from-teal-700 to-teal-600 rounded-2xl sm:rounded-3xl shadow-xl overflow-hidden mb-6 sm:mb-8">
          <div className="p-4 sm:p-6 md:p-8 text-white">
            <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
              <div className="flex-1 min-w-0">
                <div className="flex flex-wrap items-center gap-2 mb-3">
                  <h1 className="text-xl sm:text-2xl md:text-3xl font-bold truncate">{project.projectName}</h1>
                  <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold border ${statusColor(project.status)}`}>
                    {project.status}
                  </span>
                  <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold border ${catColor(project.category)}`}>
                    {project.category}
                  </span>
                </div>

                <div className="grid grid-cols-1 xs:grid-cols-2 md:grid-cols-4 gap-2 sm:gap-3 mb-3">
                  {[
                    { icon: <MdPerson size={14} />, label: 'Client', val: project.client?.name || 'N/A' },
                    { icon: <MdAttachMoney size={16} />, label: 'Budget', val: `₹${project.projectCost?.toLocaleString() || 0}` },
                    { icon: <MdCalendarToday size={14} />, label: 'Start', val: fmt(project.projectStartDate) },
                    { icon: <MdPayment size={14} />, label: 'Milestones', val: project.paymentMilestone || 0 },
                  ].map((item, i) => (
                    <div key={i} className="flex items-center gap-1.5 text-white/90 text-xs sm:text-sm">
                      <span className="opacity-70 shrink-0">{item.icon}</span>
                      <span className="font-medium shrink-0">{item.label}:</span>
                      <span className="truncate">{item.val}</span>
                    </div>
                  ))}
                </div>

                <p className="text-xs text-white/70">
                  ID: <span className="font-semibold text-white/90">{project.projectId}</span>
                  {project.createdAt && <> · Created: <span className="font-semibold text-white/90">{fmt(project.createdAt)}</span></>}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Main Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          {/* Left Column (2/3) */}
          <div className="lg:col-span-2 space-y-6">

            {/* Basic Information */}
            <SectionCard title="Basic Information">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <InfoCell label="Project ID" value={project.projectId} icon="🔑" />
                <InfoCell label="Category" value={project.category} icon="📁" badgeCls={catColor(project.category)} />
                <InfoCell label="Status" value={project.status} icon="📊" badgeCls={statusColor(project.status)} />
                <InfoCell label="Project Cost" value={`₹${project.projectCost?.toLocaleString() || 0}`} icon="💰" valueCls="text-emerald-700 font-bold" />
                <InfoCell label="Payment Milestones" value={project.paymentMilestone || 0} icon="🏁" />
              </div>
            </SectionCard>

            {/* Timeline */}
            <SectionCard title="Project Timeline">
              <div className="space-y-3">
                <TimelineItem icon={<MdCalendarToday className="text-teal-600" size={16} />} label="Start Date" date={project.projectStartDate} />
                <TimelineItem icon={<MdCalendarToday className="text-blue-600" size={16} />} label="End Date" date={project.projectEndDate} />
                <TimelineItem icon={<MdCalendarToday className="text-red-500" size={16} />} label="Deadline" date={project.deadline} isDeadline />
              </div>
            </SectionCard>

            {/* Client Information */}
            <SectionCard title="Client Information">
              <div className="space-y-3">
                <ContactInfo icon={<MdPerson className="text-teal-600" size={16} />} label="Client Name" value={project.client?.name} />
                <ContactInfo icon={<MdPhone className="text-blue-600" size={16} />} label="Mobile" value={project.client?.mobile} type="phone" />
                <ContactInfo icon={<MdEmail className="text-purple-600" size={16} />} label="Email" value={project.client?.email} type="email" />
                {project.client?.address && (
                  <ContactInfo icon={<MdLocationOn className="text-gray-600" size={16} />} label="Address" value={project.client?.address} />
                )}
              </div>
            </SectionCard>

            {/* Work Division */}
            {project.workDivision && Object.keys(project.workDivision).length > 0 && (
              <SectionCard title="Work Division">
                <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
                  {Object.entries(project.workDivision).map(([key, value]) => (
                    <div key={key} className="bg-teal-50 rounded-xl p-3 text-center">
                      <p className="text-xs text-gray-500 capitalize mb-1">{key}</p>
                      <p className="text-lg font-bold text-teal-700">{value}%</p>
                    </div>
                  ))}
                </div>
                <div className="mt-3 w-full bg-gray-200 rounded-full h-2">
                  <div className="bg-teal-600 h-2 rounded-full" style={{ width: '100%' }}></div>
                </div>
              </SectionCard>
            )}
          </div>

          {/* Right Column (1/3) */}
          <div className="space-y-6">

            {/* Team Assignment */}
            {project.teamAssignment && Object.keys(project.teamAssignment).some(k => project.teamAssignment[k]?.length > 0) && (
              <SectionCard title="Team Members">
                <div className="space-y-3">
                  {Object.entries(project.teamAssignment).map(([role, members]) => (
                    members && members.length > 0 && (
                      <div key={role} className="p-3 bg-gray-50 rounded-xl">
                        <div className="flex items-center justify-between mb-2">
                          <span className="font-semibold text-gray-800 text-xs capitalize">{role}</span>
                          <span className="text-xs text-gray-400">{members.length}</span>
                        </div>
                        <div className="flex flex-wrap gap-1.5">
                          {members.map((m, i) => (
                            <span key={i} className="px-2.5 py-1 bg-white border border-gray-200 rounded-lg text-xs font-medium text-gray-700">
                              {m.name}
                            </span>
                          ))}
                        </div>
                      </div>
                    )
                  ))}
                </div>
              </SectionCard>
            )}

            {/* Project Stats */}
            <SectionCard title="Project Stats">
              <div className="space-y-3">
                <div className="flex justify-between items-center p-3 bg-gray-50 rounded-xl">
                  <span className="text-sm text-gray-600">Total Cost</span>
                  <span className="text-lg font-bold text-teal-700">₹{project.projectCost?.toLocaleString() || 0}</span>
                </div>
                <div className="flex justify-between items-center p-3 bg-gray-50 rounded-xl">
                  <span className="text-sm text-gray-600">Payment Milestones</span>
                  <span className="text-lg font-bold text-teal-700">{project.paymentMilestone || 0}</span>
                </div>
                <div className="flex justify-between items-center p-3 bg-gray-50 rounded-xl">
                  <span className="text-sm text-gray-600">Category</span>
                  <span className={`px-3 py-1 rounded-full text-xs font-bold border ${catColor(project.category)}`}>
                    {project.category}
                  </span>
                </div>
                <div className="flex justify-between items-center p-3 bg-gray-50 rounded-xl">
                  <span className="text-sm text-gray-600">Status</span>
                  <span className={`px-3 py-1 rounded-full text-xs font-bold border ${statusColor(project.status)}`}>
                    {project.status}
                  </span>
                </div>
              </div>
            </SectionCard>
          </div>
        </div>
      </div>
    </div>
  );
};

const SectionCard = ({ title, children }) => (
  <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 sm:p-5 print:shadow-none">
    <h2 className="text-sm sm:text-base font-bold text-gray-900 mb-4 pb-3 border-b border-gray-100">{title}</h2>
    {children}
  </div>
);

const InfoCell = ({ label, value, icon, badgeCls, valueCls }) => (
  <div className="info-card p-3 rounded-xl bg-gray-50">
    <p className="text-xs text-gray-500 font-medium mb-1.5">{icon} {label}</p>
    {badgeCls ? (
      <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold border ${badgeCls}`}>{value}</span>
    ) : (
      <p className={`text-sm font-semibold ${valueCls || 'text-gray-900'}`}>{value}</p>
    )}
  </div>
);

const TimelineItem = ({ icon, label, date, isDeadline }) => {
  const overdue = isDeadline && date && new Date(date) < new Date();
  const formatted = date
    ? new Date(date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })
    : 'Not specified';
  return (
    <div className="flex items-start gap-3 p-3 rounded-xl bg-gray-50">
      <div className="shrink-0 mt-0.5">{icon}</div>
      <div className="flex-1 min-w-0">
        <p className="font-medium text-gray-800 text-xs sm:text-sm">{label}</p>
        <p className={`text-xs mt-0.5 ${overdue ? 'text-red-600 font-semibold' : 'text-gray-500'}`}>
          {formatted}
          {overdue && <span className="ml-2 bg-red-100 text-red-800 px-1.5 py-0.5 rounded text-xs">Overdue</span>}
        </p>
      </div>
    </div>
  );
};

const ContactInfo = ({ icon, label, value, type }) => (
  <div className="flex items-center gap-3 p-3 rounded-xl bg-gray-50 hover:bg-gray-100 transition-colors">
    <div className="shrink-0">{icon}</div>
    <div className="flex-1 min-w-0">
      <p className="text-xs text-gray-500 font-medium">{label}</p>
      {type === 'email' ? (
        <a href={`mailto:${value}`} className="text-sm font-semibold text-teal-600 hover:text-teal-800 break-all">{value || '—'}</a>
      ) : type === 'phone' ? (
        <a href={`tel:${value}`} className="text-sm font-semibold text-blue-600 hover:text-blue-800">{value || '—'}</a>
      ) : (
        <p className="text-sm font-semibold text-gray-800 truncate">{value || '—'}</p>
      )}
    </div>
  </div>
);

export default ProjectDetails;