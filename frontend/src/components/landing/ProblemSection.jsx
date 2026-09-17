import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  FileX,
  FileText,
  CopyX,
  SearchX,
  CheckCircle2,
  XCircle,
  TrendingUp,
} from 'lucide-react';

const problems = [
  {
    icon: FileX,
    title: 'ATS Rejection',
    description: 'Your resume may never reach a recruiter if it fails automated screening systems due to formatting or unparsed structures.',
    tag: 'Automated Filtering',
    badgeColor: 'text-red-700 bg-red-50 border-red-200',
  },
  {
    icon: FileText,
    title: 'Weak Content',
    description: 'Your experience may be solid, but vague, passive bullet points can hide your true impact and quantifiable accomplishments.',
    tag: 'Vague Phrasing',
    badgeColor: 'text-amber-700 bg-amber-50 border-amber-200',
  },
  {
    icon: CopyX,
    title: 'Generic Resumes',
    description: 'Sending the same identical document to 50 companies leads to low response rates because it does not match specific job keywords.',
    tag: 'Low Keyword Match',
    badgeColor: 'text-orange-700 bg-orange-50 border-orange-200',
  },
  {
    icon: SearchX,
    title: 'No Visibility',
    description: 'You apply repeatedly without knowing why you are not getting calls or which specific resume section is holding you back.',
    tag: 'Zero Diagnostic Feedback',
    badgeColor: 'text-purple-700 bg-purple-50 border-purple-200',
  },
];

const ProblemSection = () => {
  const [activeTab, setActiveTab] = useState('after');

  return (
    <section className="py-20 md:py-28 bg-slate-50/70 border-b border-slate-200/80 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16 md:mb-20">
          <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-red-50 border border-red-200 text-red-700 text-xs font-semibold mb-4">
            <span>The Core Problem</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
            Why Most Resumes Never Reach the Recruiter
          </h2>
          <p className="mt-4 text-base sm:text-lg text-slate-600 leading-relaxed">
            The modern job application process is heavily automated. Even qualified candidates get rejected before a human ever reads their resume.
          </p>
        </div>

        {/* 4 Problem Diagnostic Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-20">
          {problems.map((problem, index) => {
            const Icon = problem.icon;
            return (
              <motion.div
                key={problem.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1, duration: 0.5 }}
                className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs hover:shadow-md transition-shadow flex flex-col justify-between"
              >
                <div>
                  <div className="w-12 h-12 rounded-xl bg-slate-100 flex items-center justify-center text-slate-700 mb-5">
                    <Icon className="w-6 h-6" />
                  </div>
                  <h3 className="text-lg font-bold text-slate-900 mb-2">
                    {problem.title}
                  </h3>
                  <p className="text-sm text-slate-600 leading-relaxed">
                    {problem.description}
                  </p>
                </div>
                <div className="mt-6 pt-4 border-t border-slate-100">
                  <span className={`inline-block text-[11px] font-bold px-2.5 py-1 rounded-full border ${problem.badgeColor}`}>
                    {problem.tag}
                  </span>
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Interactive Comparison: Before vs After */}
        <div className="bg-white rounded-3xl border border-slate-200/90 shadow-xl overflow-hidden max-w-5xl mx-auto">
          
          <div className="p-6 sm:p-8 bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 text-white flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-brand-indigo">
                Real-World Impact
              </span>
              <h3 className="text-xl sm:text-2xl font-extrabold mt-1">
                See the Resumind Transformation
              </h3>
            </div>
            
            {/* Toggle selector buttons */}
            <div className="flex bg-slate-800 p-1 rounded-xl border border-slate-700 shrink-0">
              <button
                type="button"
                onClick={() => setActiveTab('before')}
                className={`px-4 py-2 rounded-lg text-xs sm:text-sm font-semibold transition-all ${
                  activeTab === 'before'
                    ? 'bg-red-500/20 text-red-300 border border-red-500/40 shadow-xs'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                Standard Resume
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('after')}
                className={`px-4 py-2 rounded-lg text-xs sm:text-sm font-semibold transition-all ${
                  activeTab === 'after'
                    ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 shadow-xs'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                Resumind Optimized
              </button>
            </div>
          </div>

          <div className="p-6 sm:p-8 grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
            
            {/* Before Card */}
            <div className={`rounded-2xl border p-6 transition-all ${
              activeTab === 'before'
                ? 'border-red-300 bg-red-50/40 ring-2 ring-red-200 shadow-md'
                : 'border-slate-200 bg-slate-50/50 opacity-60'
            }`}>
              <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-200/80">
                <div className="flex items-center gap-2">
                  <XCircle className="w-5 h-5 text-red-500" />
                  <span className="text-sm font-bold text-slate-900">Before: Generic Bullet Point</span>
                </div>
                <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-red-100 text-red-800">
                  ATS Score: 48/100
                </span>
              </div>

              <div className="space-y-4 text-xs sm:text-sm font-sans text-slate-800">
                <div className="p-3 bg-white rounded-lg border border-red-200/70 shadow-2xs">
                  <p className="text-red-700 font-semibold mb-1 flex items-center gap-1.5 text-xs">
                    <XCircle className="w-3.5 h-3.5 text-red-500" />
                    Vague Action Verb & No Metrics
                  </p>
                  <p className="text-slate-600 line-through">
                    "Worked on the company frontend and helped improve some features in our web application."
                  </p>
                  <p className="text-[11px] text-red-600 mt-1.5">
                    ✗ Missing technologies, scope, and quantitative impact.
                  </p>
                </div>

                <div className="p-3 bg-white rounded-lg border border-red-200/70 shadow-2xs">
                  <p className="text-red-700 font-semibold mb-1 flex items-center gap-1.5 text-xs">
                    <XCircle className="w-3.5 h-3.5 text-red-500" />
                    Keyword Omission
                  </p>
                  <div className="flex flex-wrap gap-1.5 mt-1">
                    <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-500 line-through text-[11px]">React</span>
                    <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-500 line-through text-[11px]">Node.js</span>
                    <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-500 line-through text-[11px]">Performance</span>
                  </div>
                  <p className="text-[11px] text-slate-500 mt-1">
                    Recruiter search filters fail to discover this candidate.
                  </p>
                </div>
              </div>
            </div>

            {/* After Card */}
            <div className={`rounded-2xl border p-6 transition-all ${
              activeTab === 'after'
                ? 'border-emerald-300 bg-emerald-50/40 ring-2 ring-emerald-200 shadow-md'
                : 'border-slate-200 bg-slate-50/50 opacity-60'
            }`}>
              <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-200/80">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                  <span className="text-sm font-bold text-slate-900">After: Resumind Intelligence</span>
                </div>
                <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                  ATS Score: 94/100
                </span>
              </div>

              <div className="space-y-4 text-xs sm:text-sm font-sans text-slate-800">
                <div className="p-3 bg-white rounded-lg border border-emerald-200/70 shadow-2xs">
                  <p className="text-emerald-700 font-semibold mb-1 flex items-center gap-1.5 text-xs">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                    Action Verb & Measurable Outcome
                  </p>
                  <p className="text-slate-800 font-medium">
                    "Architected and deployed a responsive web application using <strong className="text-brand-indigo">React</strong> and <strong className="text-brand-indigo">Node.js</strong>, optimizing query execution to reduce page latency by <strong className="text-emerald-700">42%</strong> for 1,200+ active users."
                  </p>
                  <p className="text-[11px] text-emerald-700 mt-1.5">
                    ✓ High recruiter scan speed + clear business value.
                  </p>
                </div>

                <div className="p-3 bg-white rounded-lg border border-emerald-200/70 shadow-2xs">
                  <p className="text-emerald-700 font-semibold mb-1 flex items-center gap-1.5 text-xs">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                    100% Target Keyword Match
                  </p>
                  <div className="flex flex-wrap gap-1.5 mt-1">
                    <span className="bg-emerald-50 text-emerald-700 text-[11px] px-2 py-0.5 rounded border border-emerald-200 font-medium">React ✓</span>
                    <span className="bg-emerald-50 text-emerald-700 text-[11px] px-2 py-0.5 rounded border border-emerald-200 font-medium">TypeScript ✓</span>
                    <span className="bg-emerald-50 text-emerald-700 text-[11px] px-2 py-0.5 rounded border border-emerald-200 font-medium">REST APIs ✓</span>
                    <span className="bg-emerald-50 text-emerald-700 text-[11px] px-2 py-0.5 rounded border border-emerald-200 font-medium">CI/CD Pipeline ✓</span>
                  </div>
                </div>

                <div className="p-3 bg-white rounded-lg border border-emerald-200/70 shadow-2xs">
                  <p className="text-emerald-700 font-semibold mb-1 flex items-center gap-1.5 text-xs">
                    <TrendingUp className="w-3.5 h-3.5 text-emerald-600" />
                    Standard ATS Compatible Hierarchy
                  </p>
                  <p className="text-[11px] text-slate-600">
                    Clean semantic single-column hierarchy ensuring 100% parser fidelity on Greenhouse, Lever, Workday, and Taleo.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

      </div>
    </section>
  );
};

export default ProblemSection;
