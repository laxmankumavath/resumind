import { useState } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import {
  FileText,
  BarChart3,
  Wand2,
  Building2,
  CheckCircle2,
  TrendingUp,
  Download,
  Eye,
  ShieldCheck,
  Zap,
} from 'lucide-react';
import useAuthStore from '../../store/authStore';

const mockResumes = [
  {
    name: 'Senior_FullStack_Engineer_2026.pdf',
    date: 'Uploaded 2 hours ago',
    score: 87,
    status: 'Optimized',
    match: 'FAANG / Tier 1 (84%)',
  },
  {
    name: 'Frontend_React_Lead.pdf',
    date: 'Uploaded yesterday',
    score: 92,
    status: 'Job Ready',
    match: 'Product Startups (95%)',
  },
  {
    name: 'Data_Analyst_Resume_Draft.pdf',
    date: 'Uploaded 3 days ago',
    score: 74,
    status: 'Rewrite Recommended',
    match: 'FinTech (78%)',
  },
];

const DashboardShowcase = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

  return (
    <section className="py-20 md:py-28 bg-slate-50 relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-brand-indigo/10 border border-brand-indigo/20 text-brand-indigo text-xs font-semibold mb-4">
            <LayoutDashboard className="w-3.5 h-3.5" />
            <span>Unified Workflow</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
            Your Resume Journey, In One Place
          </h2>
          <p className="mt-4 text-base sm:text-lg text-slate-600 leading-relaxed">
            Keep your resume analysis, improvements and job matching workflow organized from one dashboard.
          </p>
        </div>

        {/* Dashboard Mockup Frame */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7 }}
          className="bg-white rounded-3xl border border-slate-200 shadow-2xl shadow-slate-300/50 overflow-hidden"
        >
          {/* Mock Browser/OS Bar */}
          <div className="bg-slate-100/90 border-b border-slate-200 px-4 py-3 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-red-400" />
              <div className="w-3 h-3 rounded-full bg-amber-400" />
              <div className="w-3 h-3 rounded-full bg-emerald-400" />
              <div className="ml-3 px-3 py-1 bg-white rounded-md border border-slate-200/80 text-[11px] text-slate-500 font-mono hidden sm:flex items-center gap-1.5">
                <span className="text-brand-indigo">app.resumind.com</span>/dashboard
              </div>
            </div>
            <div className="text-xs font-bold text-slate-600 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-500" />
              Resumind Suite Active
            </div>
          </div>

          {/* Internal Dashboard Viewport */}
          <div className="grid grid-cols-1 md:grid-cols-12 min-h-[520px]">
            
            {/* Sidebar Mock */}
            <div className="hidden md:block md:col-span-3 bg-slate-50 border-r border-slate-200 p-4 space-y-6">
              <div className="px-2">
                <h3 className="text-lg font-bold text-slate-900">
                  Resu<span className="text-brand-indigo">Mind</span>
                </h3>
                <p className="text-[11px] text-slate-500">Career Intelligence OS</p>
              </div>

              <div className="space-y-1 text-xs font-medium">
                <button
                  type="button"
                  onClick={() => setActiveTab('overview')}
                  className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg transition-colors text-left ${
                    activeTab === 'overview'
                      ? 'bg-brand-indigo/10 text-brand-indigo font-bold'
                      : 'text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  <LayoutDashboard className="w-4 h-4" />
                  Dashboard Overview
                </button>

                <div className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer">
                  <UploadCloud className="w-4 h-4" />
                  Upload Resume
                </div>

                <div className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer">
                  <BarChart3 className="w-4 h-4" />
                  ATS Analysis
                </div>

                <div className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer">
                  <Wand2 className="w-4 h-4" />
                  Resume Rewrite
                </div>

                <div className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer">
                  <Building2 className="w-4 h-4" />
                  Company Match
                </div>
              </div>

              {/* User badge */}
              <div className="pt-4 border-t border-slate-200">
                <div className="flex items-center gap-2.5 px-2">
                  <div className="w-8 h-8 rounded-full bg-brand-indigo text-white flex items-center justify-center font-bold text-xs">
                    JD
                  </div>
                  <div className="truncate">
                    <p className="text-xs font-bold text-slate-800">John Developer</p>
                    <p className="text-[10px] text-slate-400 truncate">john@resumind.com</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Main Area Mock */}
            <div className="md:col-span-9 p-6 sm:p-8 bg-white flex flex-col justify-between">
              
              <div>
                {/* Greeting & Action Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 border-b border-slate-100 gap-4 mb-6">
                  <div>
                    <h3 className="text-xl sm:text-2xl font-bold text-slate-900">
                      Welcome back, John 👋
                    </h3>
                    <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
                      3 resumes uploaded. 1 needs keyword tuning for Software Engineer.
                    </p>
                  </div>
                  <Link
                    to={isAuthenticated ? '/dashboard/upload' : '/register'}
                    className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-brand-indigo text-white text-xs font-bold hover:bg-brand-purple shadow-sm transition-all"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Upload Resume</span>
                  </Link>
                </div>

                {/* KPI Metrics */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
                  <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80">
                    <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">
                      Total Resumes
                    </span>
                    <p className="text-2xl font-extrabold text-slate-900 mt-1">3 Active</p>
                    <span className="text-[10px] text-slate-500 flex items-center gap-1 mt-1">
                      <Clock className="w-3 h-3 text-slate-400" /> Synced across devices
                    </span>
                  </div>

                  <div className="p-4 rounded-xl bg-emerald-50/50 border border-emerald-100">
                    <span className="text-[11px] font-semibold text-emerald-800 uppercase tracking-wider block">
                      Avg ATS Score
                    </span>
                    <p className="text-2xl font-extrabold text-emerald-700 mt-1 font-display">84 / 100</p>
                    <span className="text-[10px] text-emerald-700 flex items-center gap-1 mt-1 font-medium">
                      <TrendingUp className="w-3 h-3" /> +19 pts after AI rewrite
                    </span>
                  </div>

                  <div className="p-4 rounded-xl bg-brand-indigo/5 border border-brand-indigo/10">
                    <span className="text-[11px] font-semibold text-brand-indigo uppercase tracking-wider block">
                      Top Target Fit
                    </span>
                    <p className="text-2xl font-extrabold text-slate-900 mt-1">95% Match</p>
                    <span className="text-[10px] text-brand-indigo flex items-center gap-1 mt-1 font-medium">
                      <TrendingUp className="w-3 h-3" /> High hiring probability
                    </span>
                  </div>
                </div>

                {/* Recent Resumes List */}
                <div>
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-3">
                    Recent Resumes
                  </h4>
                  <div className="space-y-2.5">
                    {mockResumes.map((r) => (
                      <div
                        key={r.name}
                        className="p-3.5 rounded-xl border border-slate-200 hover:border-brand-indigo/40 hover:bg-slate-50/70 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <div className="w-8 h-8 rounded-lg bg-brand-indigo/10 text-brand-indigo flex items-center justify-center shrink-0">
                            <FileText className="w-4 h-4" />
                          </div>
                          <div className="min-w-0">
                            <p className="text-xs font-bold text-slate-900 truncate">
                              {r.name}
                            </p>
                            <p className="text-[10px] text-slate-400">{r.date}</p>
                          </div>
                        </div>

                        <div className="flex items-center gap-3 shrink-0">
                          <div className="text-right hidden sm:block">
                            <span className="text-[10px] font-bold text-slate-400 uppercase block">ATS Score</span>
                            <span className="text-xs font-black text-emerald-700">{r.score}/100</span>
                          </div>
                          <span className="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 border border-slate-200">
                            {r.status}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Bottom Card Footer */}
              <div className="pt-6 mt-6 border-t border-slate-100 flex items-center justify-between">
                <span className="text-xs text-slate-500">
                  Ready to test your latest resume draft?
                </span>
                <Link
                  to={isAuthenticated ? '/dashboard' : '/register'}
                  className="text-xs font-bold text-brand-indigo hover:text-brand-purple flex items-center gap-1"
                >
                  Open Dashboard <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>

            </div>

          </div>
        </motion.div>

      </div>
    </section>
  );
};

export default DashboardShowcase;
