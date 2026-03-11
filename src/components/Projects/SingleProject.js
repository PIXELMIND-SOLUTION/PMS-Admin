import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  MdEdit, MdArrowBack, MdDownload, MdCalendarToday,
  MdAttachMoney, MdPayment,
} from 'react-icons/md';
import {
  FaRupeeSign, FaMobileAlt, FaEnvelope, FaFileAlt,
  FaPrint, FaChartLine, FaUserTie,
} from 'react-icons/fa';
import * as XLSX from 'xlsx';

const API_URL = 'http://31.97.206.144:5000/api/projects';
const adminDetails = JSON.parse(sessionStorage.getItem('adminDetails'));
const AUTH_TOKEN = adminDetails?.token;

const ProjectDetails = () => {
  const { id }     = useParams();
  const navigate   = useNavigate();

  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState('');

  useEffect(() => { fetchProject(); }, [id]);

  const fetchProject = async () => {
    try {
      setLoading(true);
      const res  = await fetch(`${API_URL}/${id}`, {
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

  const payModeColor = (m) => ({
    cash:            'bg-emerald-100 text-emerald-800',
    'bank transfer': 'bg-blue-100 text-blue-800',
    upi:             'bg-teal-100 text-teal-800',
    cheque:          'bg-amber-100 text-amber-800',
  }[m?.toLowerCase()] || 'bg-gray-100 text-gray-700');

  const totalPaid = () =>
    project?.milestonePayments?.filter(p => p.paid).reduce((s, p) => s + (p.amount || 0), 0) || 0;

  const progress = () => {
    if (!project?.milestonePayments?.length) return 0;
    return Math.round((project.milestonePayments.filter(p => p.paid).length / project.milestonePayments.length) * 100);
  };

  const exportExcel = () => {
    if (!project) return;
    const ws = XLSX.utils.json_to_sheet([{
      'Project ID':   project.projectId,
      'Project Name': project.projectName,
      'Client Name':  project.clientName,
      'Mobile':       project.clientMobile,
      'Email':        project.clientEmail,
      'Category':     project.category,
      'Status':       project.status,
      'Start Date':   fmt(project.startDate),
      'Deadline':     fmt(project.deadlineDate),
      'Project Cost': project.projectCost,
      'Milestones':   project.milestone || 0,
    }]);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Project');
    XLSX.writeFile(wb, `project_${project.projectId}_${new Date().toISOString().split('T')[0]}.xlsx`);
  };

  /* ── LOADING ── */
  if (loading) return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <style>{`@keyframes spin{0%{transform:rotate(0deg)}100%{transform:rotate(360deg)}}`}</style>
      <div className="flex flex-col items-center gap-3">
        <div style={{ width:44,height:44,border:'3px solid #e0f2f1',borderTop:'3px solid #0d9488',borderRadius:'50%',animation:'spin .8s linear infinite' }} />
        <p className="text-gray-500 text-sm font-medium">Loading project details…</p>
      </div>
    </div>
  );

  /* ── ERROR ── */
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

  /* ─────────────────────── RENDER ─────────────────────── */
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

      <div className="w-full max-w-screen-xl mx-auto px-3 sm:px-5 md:px-6 lg:px-8 py-4 sm:py-6 lg:py-8">

        {/* ── TOP NAV ── */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5 sm:mb-6 no-print">
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

        {/* ── HERO BANNER ── */}
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
                    { icon: <FaUserTie size={12} />,    label: 'Client',     val: project.clientName },
                    { icon: <MdAttachMoney size={14} />, label: 'Budget',    val: `₹${project.projectCost?.toLocaleString() || 0}` },
                    { icon: <MdCalendarToday size={13} />, label: 'Start',   val: fmt(project.startDate) },
                    { icon: <FaChartLine size={12} />,  label: 'Milestones', val: project.milestone || 0 },
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

        {/* ── MAIN GRID ── */}
        <div className="grid grid-cols-1 md:grid-cols-1 lg:grid-cols-1 gap-5 sm:gap-6 lg:gap-8">

          {/* LEFT: 2/3 */}
          <div className="lg:col-span-6 space-y-5 sm:space-y-6">

            {/* Basic Info */}
            <SCard title="Basic Information">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                <InfoCell label="Project ID"    value={project.projectId}    icon="🔑" />
                <InfoCell label="Category"      value={project.category}     icon="📁" badgeCls={catColor(project.category)} />
                <InfoCell label="Status"        value={project.status}       icon="📊" badgeCls={statusColor(project.status)} />
                <InfoCell label="Project Cost"  value={`₹${project.projectCost?.toLocaleString() || 0}`} icon="💰" valueCls="text-emerald-700 font-bold" />
                <InfoCell label="Milestones"    value={project.milestone || 0} icon="🏁" />
                <InfoCell label="Duration"      value={project.duration || 'Not specified'} icon="⏱️" />
              </div>
            </SCard>

            {/* Timeline */}
            <SCard title="Project Timeline">
              <div className="space-y-3">
                <TLine icon={<MdCalendarToday className="text-teal-600" size={16} />}  label="Start Date"      date={project.startDate} />
                <TLine icon={<MdCalendarToday className="text-blue-600" size={16} />}  label="Handover Date"   date={project.projectHandoverDate} />
                <TLine icon={<MdCalendarToday className="text-red-500" size={16} />}   label="Deadline"        date={project.deadlineDate} isDeadline />
              </div>
            </SCard>

            {/* Client Info */}
            <SCard title="Client Information">
              <div className="space-y-3">
                <CInfo icon={<FaUserTie className="text-teal-600" size={14} />}  label="Client Name"    value={project.clientName} />
                <CInfo icon={<FaMobileAlt className="text-blue-600" size={14} />} label="Mobile"        value={project.clientMobile} type="phone" />
                <CInfo icon={<FaEnvelope className="text-purple-600" size={14} />} label="Email"        value={project.clientEmail} type="email" />
                {project.clientAddress && (
                  <CInfo icon={<span className="text-gray-500 text-sm">📍</span>} label="Address" value={project.clientAddress} />
                )}
              </div>
            </SCard>

            {/* App/Website Timeline */}
            {project.appDetails?.timeline && (
              <SCard title="Development Timeline">
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {Object.entries(project.appDetails.timeline).map(([key, val]) => (
                    val && (
                      <div key={key} className="bg-teal-50 rounded-xl p-3 text-center">
                        <p className="text-xs text-gray-500 capitalize mb-1">{key}</p>
                        <p className="text-sm font-bold text-teal-700">{val}</p>
                      </div>
                    )
                  ))}
                </div>
              </SCard>
            )}

            {/* Budget Installments */}
            {project.budgetInstallments?.length > 0 && (
              <SCard title="Budget Installments">
                <div className="space-y-2.5">
                  {project.budgetInstallments.map((b, i) => (
                    <div key={i} className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                      <div>
                        <p className="font-semibold text-gray-800 text-sm">{b.title}</p>
                        {b.deadline && <p className="text-xs text-gray-400 mt-0.5">Due: {fmt(b.deadline)}</p>}
                      </div>
                      <span className="font-bold text-emerald-700 text-sm">₹{b.amount?.toLocaleString()}</span>
                    </div>
                  ))}
                </div>
              </SCard>
            )}
          </div>

          {/* RIGHT: 1/3 */}
          <div className="space-y-5 sm:space-y-6">

            {/* Milestone Payments */}
            {project.milestonePayments?.length > 0 && (
              <SCard title="Milestone Payments">
                {/* Progress */}
                <div className="mb-4 p-3 bg-gray-50 rounded-xl">
                  <div className="flex justify-between mb-2">
                    <span className="text-xs font-medium text-gray-600">Payment Progress</span>
                    <span className="text-sm font-bold text-teal-600">{progress()}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div className="bg-teal-600 h-2 rounded-full transition-all" style={{ width: `${progress()}%` }} />
                  </div>
                  <div className="flex justify-between mt-2 text-xs text-gray-500">
                    <span>₹{totalPaid().toLocaleString()} paid</span>
                    <span>₹{((project.projectCost || 0) - totalPaid()).toLocaleString()} left</span>
                  </div>
                </div>
                {/* List */}
                <div className="space-y-3">
                  {project.milestonePayments.map((pay, i) => (
                    <div key={pay._id || i} className="p-3 border border-gray-200 rounded-xl hover:border-teal-200 transition-colors">
                      <div className="flex items-start justify-between gap-2 mb-1.5">
                        <div className="flex items-center gap-2 min-w-0">
                          <div className={`w-7 h-7 rounded-full flex items-center justify-center text-white font-bold text-xs shrink-0 ${pay.paid ? 'bg-emerald-500' : 'bg-amber-500'}`}>
                            {i + 1}
                          </div>
                          <p className="font-semibold text-gray-800 text-xs sm:text-sm truncate">
                            {pay.description || `Milestone ${i + 1}`}
                          </p>
                        </div>
                        <span className="font-bold text-emerald-700 text-sm shrink-0">₹{pay.amount?.toLocaleString()}</span>
                      </div>
                      <div className="flex items-center gap-1.5 flex-wrap">
                        {pay.paymentMode && (
                          <span className={`px-2 py-0.5 rounded text-xs font-medium ${payModeColor(pay.paymentMode)}`}>
                            {pay.paymentMode}
                          </span>
                        )}
                        <span className={`px-2 py-0.5 rounded text-xs font-medium ${pay.paid ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'}`}>
                          {pay.paid ? 'Paid' : 'Pending'}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </SCard>
            )}

            {/* Team Members */}
            {project.teamMembers && Object.values(project.teamMembers).some(v => Array.isArray(v) && v.length > 0) && (
              <SCard title="Team Members">
                <div className="space-y-3">
                  {Object.entries(project.teamMembers).map(([role, members]) => (
                    Array.isArray(members) && members.length > 0 && (
                      <div key={role} className="p-3 bg-gray-50 rounded-xl">
                        <div className="flex items-center justify-between mb-2">
                          <span className="font-semibold text-gray-800 text-xs capitalize">{role}</span>
                          <span className="text-xs text-gray-400">{members.length}</span>
                        </div>
                        <div className="flex flex-wrap gap-1.5">
                          {members.map((m, i) => (
                            <span key={i} className="px-2.5 py-1 bg-white border border-gray-200 rounded-lg text-xs font-medium text-gray-700">
                              {m}
                            </span>
                          ))}
                        </div>
                      </div>
                    )
                  ))}
                </div>
              </SCard>
            )}

            {/* Files */}
            {(project.uploadfile || project.quotationfile) && (
              <SCard title="Attached Files">
                <div className="space-y-2.5">
                  {[
                    { file: project.quotationfile, label: 'Quotation File',  color: 'blue' },
                    { file: project.uploadfile,    label: 'Project File',    color: 'teal' },
                  ].filter(f => f.file).map((f, i) => (
                    <a key={i} href={f.file} target="_blank" rel="noopener noreferrer"
                      className="flex items-center justify-between p-3 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors group">
                      <div className="flex items-center gap-2.5">
                        <div className={`p-2 rounded-lg ${f.color === 'teal' ? 'bg-teal-50' : 'bg-blue-50'}`}>
                          <FaFileAlt className={f.color === 'teal' ? 'text-teal-600' : 'text-blue-600'} size={14} />
                        </div>
                        <div>
                          <p className="font-semibold text-gray-800 text-xs">{f.label}</p>
                          <p className="text-xs text-gray-400">Click to view</p>
                        </div>
                      </div>
                      <MdDownload className="text-gray-400 group-hover:text-teal-600 transition-colors" size={16} />
                    </a>
                  ))}
                </div>
              </SCard>
            )}

            {/* Digital Marketing */}
            {project.marketing && (
              <SCard title="Marketing Services">
                <div className="space-y-2.5">
                  {Object.entries(project.marketing).map(([key, val]) => {
                    if (typeof val === 'boolean') {
                      return val ? (
                        <div key={key} className="flex items-center gap-2 p-2.5 bg-teal-50 rounded-lg">
                          <span className="text-teal-500">✓</span>
                          <span className="text-sm font-semibold text-teal-800 capitalize">{key}</span>
                        </div>
                      ) : null;
                    }
                    if (val?.enabled) {
                      return (
                        <div key={key} className="p-2.5 bg-teal-50 rounded-lg">
                          <p className="text-sm font-bold text-teal-800 capitalize mb-1">{key}</p>
                          <p className="text-xs text-teal-600">{val.quantity} / {val.duration} · Starts {fmt(val.startDate)}</p>
                        </div>
                      );
                    }
                    return null;
                  })}
                </div>
              </SCard>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

/* ── SECTION CARD ── */
const SCard = ({ title, children }) => (
  <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 sm:p-5 print:shadow-none">
    <h2 className="text-sm sm:text-base font-bold text-gray-900 mb-4 pb-3 border-b border-gray-100">{title}</h2>
    {children}
  </div>
);

/* ── INFO CELL ── */
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

/* ── TIMELINE ITEM ── */
const TLine = ({ icon, label, date, isDeadline }) => {
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

/* ── CONTACT INFO ── */
const CInfo = ({ icon, label, value, type }) => (
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