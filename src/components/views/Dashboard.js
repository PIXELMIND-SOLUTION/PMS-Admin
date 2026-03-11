import React, { useEffect, useState } from "react";
import axios from "axios";
import {
  AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from "recharts";
import {
  CalendarDays, ChevronRight, Clock, AlertTriangle,
  FolderKanban, Smartphone, Globe, Megaphone, Users,
} from "lucide-react";

/* ─── Static chart data ─── */
const trendData = [
  { month: "Oct", projects: 1, staff: 3 },
  { month: "Nov", projects: 2, staff: 4 },
  { month: "Dec", projects: 2, staff: 4 },
  { month: "Jan", projects: 3, staff: 5 },
  { month: "Feb", projects: 3, staff: 5 },
  { month: "Mar", projects: 3, staff: 5 },
];

const weekActivity = [
  { day: "Mon", active: 4, idle: 1 },
  { day: "Tue", active: 5, idle: 0 },
  { day: "Wed", active: 3, idle: 2 },
  { day: "Thu", active: 5, idle: 0 },
  { day: "Fri", active: 4, idle: 1 },
];

/* ─── Helpers ─── */
const fmtDate = (iso) =>
  new Date(iso).toLocaleDateString("en-GB", {
    day: "2-digit", month: "short", year: "numeric",
  });

const urgencyClasses = (days) => {
  if (days < 0)  return "bg-red-50 text-red-600 border border-red-200";
  if (days <= 7) return "bg-amber-50 text-amber-600 border border-amber-200";
  return               "bg-emerald-50 text-emerald-600 border border-emerald-200";
};

const statusClasses = {
  active:     "bg-teal-50 text-teal-700 border border-teal-200",
  completed:  "bg-sky-50 text-sky-700 border border-sky-200",
  "on hold":  "bg-amber-50 text-amber-700 border border-amber-200",
};

/* label → Tailwind colour tokens (no dynamic hex needed) */
const STAT_MAP = {
  Projects:  { icon: FolderKanban, num: "text-teal-600",   icon_bg: "bg-teal-50",   bar: "bg-teal-500",   orb: "bg-teal-400"   },
  Apps:      { icon: Smartphone,   num: "text-emerald-600", icon_bg: "bg-emerald-50", bar: "bg-emerald-500", orb: "bg-emerald-400" },
  Websites:  { icon: Globe,        num: "text-sky-600",     icon_bg: "bg-sky-50",     bar: "bg-sky-500",     orb: "bg-sky-400"     },
  Marketing: { icon: Megaphone,    num: "text-pink-600",    icon_bg: "bg-pink-50",    bar: "bg-pink-500",    orb: "bg-pink-400"    },
  Staff:     { icon: Users,        num: "text-violet-600",  icon_bg: "bg-violet-50",  bar: "bg-violet-500",  orb: "bg-violet-400"  },
};

const PIE_COLORS = ["#0891b2", "#059669", "#e11d48", "#f59e0b"];

/* ─── Animated counter ─── */
const Counter = ({ target }) => {
  const [v, setV] = useState(0);
  useEffect(() => {
    let raf;
    const tick = () =>
      setV((c) => {
        if (c >= target) return target;
        raf = requestAnimationFrame(tick);
        return c + Math.ceil((target - c) / 7);
      });
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [target]);
  return <>{v}</>;
};

/* ─── Chart tooltip ─── */
const ChartTip = ({ active, payload, label }) =>
  active && payload?.length ? (
    <div className="bg-white border border-slate-100 rounded-xl px-3 py-2 shadow-lg text-xs">
      <p className="text-slate-400 mb-1">{label}</p>
      {payload.map((p) => (
        <p key={p.dataKey} className="font-semibold" style={{ color: p.color }}>
          {p.name}: {p.value}
        </p>
      ))}
    </div>
  ) : null;

/* ─── Stat Card ─── */
const StatCard = ({ label, count }) => {
  const m = STAT_MAP[label] || STAT_MAP.Projects;
  const Icon = m.icon;
  return (
    <div className="bg-white rounded-2xl p-4 relative overflow-hidden border border-slate-100 hover:-translate-y-1 hover:shadow-lg transition-all duration-200 cursor-default">
      <div className={`absolute -top-6 -right-6 w-20 h-20 rounded-full opacity-10 ${m.orb}`} />
      <div className="flex items-start justify-between mb-3">
        <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${m.icon_bg}`}>
          <Icon size={17} className={m.num} />
        </div>
        <span className={`text-2xl font-extrabold leading-none ${m.num}`}>
          <Counter target={count} />
        </span>
      </div>
      <p className="text-xs font-semibold text-slate-400 uppercase tracking-widest">{label}</p>
      <div className={`mt-3 h-0.5 w-8 rounded-full ${m.bar}`} />
    </div>
  );
};

/* ─── Section card wrapper ─── */
const Card = ({ children, className = "" }) => (
  <div className={`bg-white rounded-2xl border border-slate-100 overflow-hidden ${className}`}>
    {children}
  </div>
);

const CardHead = ({ children }) => (
  <div className="flex items-center justify-between px-5 py-4 border-b border-slate-50 flex-wrap gap-2">
    {children}
  </div>
);

/* ══════════════════════════════ MAIN ══════════════════════════════ */
const Dashboard = () => {
  const [data, setData]       = useState(null);
  const [loading, setLoading] = useState(true);

  const adminDetails = JSON.parse(sessionStorage.getItem("adminDetails") || "{}");
  const token        = adminDetails?.token;
  const adminName    = adminDetails?.adminName || "Admin";

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const res = await axios.get("http://31.97.206.144:5000/api/dashboard", {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (res.data.success) setData(res.data.data);
      } catch {
        /* dev fallback */
        setData({
          stats: [
            { label: "Projects",  count: 3 },
            { label: "Apps",      count: 1 },
            { label: "Websites",  count: 2 },
            { label: "Marketing", count: 0 },
            { label: "Staff",     count: 5 },
          ],
          projects: [
            { _id: "1", projectId: "pms111", projectName: "PMS Mobile Apps 111", clientName: "Vijay",  status: "active",    deadlineDate: "2026-06-10T00:00:00.000Z", daysRemaining: 91 },
            { _id: "2", projectId: "pms",    projectName: "PMS Mobile Apps",     clientName: "Vebdrj", status: "active",    deadlineDate: "2026-03-06T00:00:00.000Z", daysRemaining: -5 },
            { _id: "3", projectId: "001",    projectName: "Jjj",                 clientName: "Hhh",    status: "completed", deadlineDate: "2026-03-20T00:00:00.000Z", daysRemaining: 9  },
          ],
          deadlines: [
            { id: "3", projectId: "001", name: "Jjj",            clientName: "Hhh",    deadline: "2026-03-20T00:00:00.000Z", daysRemaining: 9  },
            { id: "2", projectId: "pms", name: "PMS Mobile Apps", clientName: "Vebdrj", deadline: "2026-03-06T00:00:00.000Z", daysRemaining: -5 },
          ],
          counts: { totalProjects: 3, apps: 1, websites: 2, marketing: 0, staff: 5, upcomingDeadlines: 1 },
        });
      } finally {
        setLoading(false);
      }
    };
    fetchDashboard();
  }, [token]);

  /* ── Loading ── */
  if (loading) return (
    <div className="flex items-center justify-center min-h-screen bg-slate-50">
      <div className="text-center">
        <div className="w-10 h-10 border-[3px] border-teal-600 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
        <p className="text-slate-400 text-sm">Loading dashboard…</p>
      </div>
    </div>
  );

  const { stats, projects, deadlines, counts } = data;
  const pieData = stats.filter(s => s.label !== "Staff" && s.label !== "Projects");

  return (
    <div className="bg-slate-50 min-h-screen w-full">

      {/* ═══ HEADER BANNER ═══ */}
      <div className="bg-gradient-to-r from-teal-700 to-teal-500 px-4 sm:px-6 lg:px-8 py-5">
        <div className="max-w-screen-xl mx-auto flex items-center justify-between flex-wrap gap-4">
          <div>
            <p className="text-teal-200 text-xs uppercase tracking-widest font-semibold mb-1">
              Admin Panel
            </p>
            <h1 className="text-white text-2xl sm:text-3xl font-extrabold leading-tight">
              Welcome back, {adminName} 👋
            </h1>
          </div>
          <div className="flex items-center gap-3">
            <div className="bg-white/10 backdrop-blur border border-white/20 rounded-xl px-3 py-2 flex items-center gap-2 text-white text-xs">
              <span className="w-2 h-2 rounded-full bg-emerald-400 shadow-[0_0_6px_rgba(52,211,153,0.8)]" />
              All systems operational
            </div>
            <div className="w-10 h-10 rounded-full bg-white/20 border-2 border-white/40 flex items-center justify-center text-white font-extrabold text-base shrink-0">
              {adminName.charAt(0)}
            </div>
          </div>
        </div>
      </div>

      {/* ═══ BODY ═══ */}
      <div className="max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-5">

        {/* ── STAT CARDS ── */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
          {stats.map((s) => <StatCard key={s.label} label={s.label} count={s.count} />)}
        </div>

        {/* ── CHARTS ── */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

          {/* Area chart */}
          <Card>
            <CardHead>
              <div>
                <p className="text-sm font-bold text-slate-800">Growth Trend</p>
                <p className="text-xs text-slate-400 mt-0.5">Projects & staff over 6 months</p>
              </div>
              <span className="bg-emerald-50 text-emerald-600 border border-emerald-200 rounded-lg px-2.5 py-1 text-xs font-semibold">
                ↑ Active
              </span>
            </CardHead>
            <div className="p-4">
              <ResponsiveContainer width="100%" height={180}>
                <AreaChart data={trendData}>
                  <defs>
                    <linearGradient id="gProj" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#0d9488" stopOpacity={0.2} />
                      <stop offset="100%" stopColor="#0d9488" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="gStaff" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#7c3aed" stopOpacity={0.15} />
                      <stop offset="100%" stopColor="#7c3aed" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis dataKey="month" tick={{ fill: "#94a3b8", fontSize: 11 }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fill: "#94a3b8", fontSize: 11 }} axisLine={false} tickLine={false} />
                  <Tooltip content={<ChartTip />} />
                  <Area type="monotone" dataKey="projects" name="Projects" stroke="#0d9488" strokeWidth={2.5} fill="url(#gProj)" dot={{ fill: "#0d9488", r: 3, strokeWidth: 0 }} />
                  <Area type="monotone" dataKey="staff"    name="Staff"    stroke="#7c3aed" strokeWidth={2}   fill="url(#gStaff)" dot={{ fill: "#7c3aed", r: 3, strokeWidth: 0 }} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </Card>

          {/* Bar chart */}
          <Card>
            <CardHead>
              <div>
                <p className="text-sm font-bold text-slate-800">Staff Activity</p>
                <p className="text-xs text-slate-400 mt-0.5">Active vs idle this week</p>
              </div>
            </CardHead>
            <div className="p-4">
              <ResponsiveContainer width="100%" height={180}>
                <BarChart data={weekActivity} barSize={14}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis dataKey="day"  tick={{ fill: "#94a3b8", fontSize: 11 }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fill: "#94a3b8", fontSize: 11 }} axisLine={false} tickLine={false} />
                  <Tooltip content={<ChartTip />} />
                  <Bar dataKey="active" name="Active" fill="#0d9488" radius={[5, 5, 0, 0]} />
                  <Bar dataKey="idle"   name="Idle"   fill="#e2e8f0" radius={[5, 5, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </Card>
        </div>

        {/* ── TABLE + SIDE PANEL ── */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">

          {/* Projects table */}
          <Card className="xl:col-span-2">
            <CardHead>
              <p className="text-sm font-bold text-slate-800">📋 Latest Projects</p>
              <button className="bg-gradient-to-br from-teal-600 to-teal-700 hover:opacity-90 transition text-white text-xs font-bold px-4 py-2 rounded-xl">
                + New Project
              </button>
            </CardHead>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50">
                    {["#", "ID", "Project Name", "Client", "Deadline", "Days Left", "Status"].map((h) => (
                      <th key={h} className="px-4 py-3 text-[10.5px] text-slate-400 uppercase tracking-wider font-semibold whitespace-nowrap">
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {projects.map((p, i) => {
                    const uCls = urgencyClasses(p.daysRemaining);
                    const sCls = statusClasses[p.status] || statusClasses.active;
                    return (
                      <tr key={p._id} className="border-t border-slate-50 hover:bg-slate-50/60 transition-colors">
                        <td className="px-4 py-3 text-slate-300 font-semibold text-sm">{i + 1}</td>
                        <td className="px-4 py-3 text-teal-600 font-bold text-xs font-mono">{p.projectId}</td>
                        <td className="px-4 py-3 font-semibold text-slate-800 text-sm whitespace-nowrap">{p.projectName}</td>
                        <td className="px-4 py-3 text-slate-500 text-sm whitespace-nowrap">{p.clientName}</td>
                        <td className="px-4 py-3 text-slate-500 text-xs whitespace-nowrap">{fmtDate(p.deadlineDate)}</td>
                        <td className="px-4 py-3">
                          <span className={`inline-flex items-center gap-1 text-[11px] font-semibold px-2.5 py-0.5 rounded-full ${uCls}`}>
                            {p.daysRemaining < 0
                              ? <><AlertTriangle size={9} />{Math.abs(p.daysRemaining)}d overdue</>
                              : `${p.daysRemaining}d`}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <span className={`inline-block text-[11px] font-semibold px-2.5 py-0.5 rounded-full capitalize ${sCls}`}>
                            {p.status}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            <div className="px-5 py-3 border-t border-slate-50 flex justify-end">
              <button className="text-teal-600 text-xs font-semibold flex items-center gap-1 hover:gap-2 transition-all">
                View all <ChevronRight size={13} />
              </button>
            </div>
          </Card>

          {/* ── Side panel ── */}
          <div className="flex flex-col gap-4">

            {/* Donut */}
            <Card className="p-5">
              <p className="text-sm font-bold text-slate-800 mb-4">Project Types</p>
              <div className="flex items-center gap-4">
                <div className="shrink-0">
                  <ResponsiveContainer width={100} height={100}>
                    <PieChart>
                      <Pie data={pieData} cx="50%" cy="50%" innerRadius={28} outerRadius={46} dataKey="count" stroke="none">
                        {pieData.map((_, i) => (
                          <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                        ))}
                      </Pie>
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div className="flex-1 space-y-2.5">
                  {pieData.map((c, i) => (
                    <div key={c.label} className="flex items-center gap-2">
                      <div
                        className="w-2 h-2 rounded-full shrink-0"
                        style={{ background: PIE_COLORS[i % PIE_COLORS.length] }}
                      />
                      <span className="text-xs text-slate-500 flex-1">{c.label}</span>
                      <span className="text-sm font-bold text-slate-800">{c.count}</span>
                    </div>
                  ))}
                </div>
              </div>
            </Card>

            {/* Quick stats */}
            <Card className="p-5">
              <p className="text-sm font-bold text-slate-800 mb-3">Quick Stats</p>
              {[
                { label: "Total Projects",     val: counts.totalProjects,     cls: "text-teal-600"    },
                { label: "Upcoming Deadlines", val: counts.upcomingDeadlines, cls: "text-amber-500"   },
                { label: "Staff Members",      val: counts.staff,             cls: "text-violet-600"  },
                { label: "Marketing",          val: counts.marketing,         cls: "text-pink-600"    },
              ].map((item) => (
                <div key={item.label} className="flex justify-between items-center py-2.5 border-b border-slate-50 last:border-0">
                  <span className="text-xs text-slate-500">{item.label}</span>
                  <span className={`text-base font-extrabold ${item.cls}`}>{item.val}</span>
                </div>
              ))}
            </Card>

            {/* Deadlines */}
            <Card className="p-5 flex-1">
              <div className="flex items-center justify-between mb-4">
                <p className="text-sm font-bold text-slate-800">⏰ Deadlines</p>
                <Clock size={14} className="text-amber-400" />
              </div>

              {deadlines.length === 0 ? (
                <div className="text-center text-slate-300 py-4">
                  <CalendarDays size={28} className="mx-auto mb-2" />
                  <p className="text-xs">No upcoming deadlines</p>
                </div>
              ) : (
                <div className="space-y-0">
                  {deadlines.map((d) => {
                    const uCls = urgencyClasses(d.daysRemaining);
                    return (
                      <div key={d.id} className="flex justify-between items-start gap-3 py-3 border-b border-slate-50 last:border-0">
                        <div className="min-w-0">
                          <p className="text-xs font-semibold text-slate-800 truncate">{d.name}</p>
                          <p className="text-[11px] text-slate-400 mt-0.5">{d.clientName} · {fmtDate(d.deadline)}</p>
                        </div>
                        <span className={`shrink-0 text-[11px] font-semibold px-2 py-0.5 rounded-full inline-flex items-center gap-1 ${uCls}`}>
                          {d.daysRemaining < 0
                            ? <><AlertTriangle size={9} />{Math.abs(d.daysRemaining)}d late</>
                            : `${d.daysRemaining}d`}
                        </span>
                      </div>
                    );
                  })}
                </div>
              )}
            </Card>

          </div>
        </div>

        {/* Footer */}
        <p className="text-center text-[10px] text-slate-300 tracking-widest uppercase pb-2">
          Admin Dashboard · {new Date().getFullYear()}
        </p>

      </div>
    </div>
  );
};

export default Dashboard;