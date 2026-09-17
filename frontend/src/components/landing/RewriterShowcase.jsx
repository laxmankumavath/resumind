import { useState } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import {
  Wand2,
  ArrowRight,
  CheckCircle2,
  XCircle,
  Copy,
  Check,
} from 'lucide-react';
import useAuthStore from '../../store/authStore';

const examples = [
  {
    role: 'Software Engineer',
    original: 'Created a project using React and fixed some bugs on the server with Node.js.',
    originalCritique: 'Passive verb, missing architectural detail, zero quantifiable impact.',
    improved: 'Built a responsive React-based web application with reusable component architecture and REST API integration in Node.js, reducing average query response latency by 35%.',
    improvedHighlight: 'Active action verb ("Built", "Architected"), specific framework context, and quantified performance metric ("35% reduction").',
    scoreBefore: '48',
    scoreAfter: '94',
  },
  {
    role: 'Data / Cloud Engineer',
    original: 'Helped the team with data pipelines and moved database tables to the cloud.',
    originalCritique: 'Vague team role ("Helped"), generic terms ("moved tables"), no scale.',
    improved: 'Engineered automated ETL data pipelines in Python and Apache Airflow, migrating 2.4TB of PostgreSQL relational data to AWS Redshift with zero downtime.',
    improvedHighlight: 'Clear technical ownership ("Engineered", "Migrated"), exact dataset volume ("2.4TB"), and production reliability guarantee ("zero downtime").',
    scoreBefore: '52',
    scoreAfter: '96',
  },
  {
    role: 'Product / Business Analyst',
    original: 'Responsible for talking to users and creating Jira tickets for developers.',
    originalCritique: 'Routine duty phrasing ("Responsible for"), no business outcome or user retention metric.',
    improved: 'Conducted 40+ structured customer discovery interviews, translating user pain points into prioritized product roadmaps that lifted Q3 feature adoption by 28%.',
    improvedHighlight: 'Customer-focused execution, structured sprint ownership, and measurable adoption KPI ("+28%").',
    scoreBefore: '45',
    scoreAfter: '91',
  },
];

const RewriterShowcase = () => {
  const [selectedRole, setSelectedRole] = useState(0);
  const [copied, setCopied] = useState(false);
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

  const currentExample = examples[selectedRole];

  const handleCopy = () => {
    navigator.clipboard.writeText(currentExample.improved);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <section id="resume-rewriter" className="py-20 md:py-28 bg-slate-50 relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-14">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-brand-purple/10 border border-brand-purple/20 text-brand-purple text-xs font-semibold mb-4">
            <Wand2 className="w-3.5 h-3.5" />
            <span>Intelligent Rewriting Engine</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
            Don't Just Find Problems. Fix Them.
          </h2>
          <p className="mt-4 text-base sm:text-lg text-slate-600 leading-relaxed">
            Resumind turns resume feedback into actionable improvements so you can spend less time editing and more time applying.
          </p>

          {/* Interactive Role Switcher Tabs */}
          <div className="mt-8 inline-flex flex-wrap items-center justify-center p-1.5 bg-white rounded-2xl border border-slate-200/80 shadow-xs gap-1">
            {examples.map((ex, idx) => (
              <button
                key={ex.role}
                type="button"
                onClick={() => setSelectedRole(idx)}
                className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all ${
                  selectedRole === idx
                    ? 'bg-brand-indigo text-white shadow-sm'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                {ex.role}
              </button>
            ))}
          </div>
        </div>

        {/* Split-Screen Interactive Comparison */}
        <motion.div
          key={selectedRole}
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 lg:p-10 shadow-lg shadow-slate-200/40 relative"
        >
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            
            {/* Left Box: Original */}
            <div className="lg:col-span-5 bg-slate-50/80 rounded-2xl border border-slate-200 p-6 flex flex-col justify-between h-full">
              <div>
                <div className="flex items-center justify-between pb-3 border-b border-slate-200 mb-4">
                  <div className="flex items-center gap-2">
                    <XCircle className="w-4 h-4 text-red-500" />
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-700">
                      Original Resume Bullet
                    </span>
                  </div>
                  <span className="text-[11px] font-bold text-red-700 bg-red-100 px-2 py-0.5 rounded-full">
                    Score: {currentExample.scoreBefore}/100
                  </span>
                </div>

                <div className="p-4 bg-white rounded-xl border border-slate-200/80 font-mono text-xs sm:text-sm text-slate-700 leading-relaxed shadow-2xs mb-4">
                  "{currentExample.original}"
                </div>

                <p className="text-xs text-red-600 font-sans flex items-start gap-1.5">
                  <span className="font-bold shrink-0">Flaw:</span>
                  <span>{currentExample.originalCritique}</span>
                </p>
              </div>

              <div className="mt-6 pt-3 border-t border-slate-200 text-[11px] text-slate-400">
                Lacks ATS resonance and quantifiable metrics.
              </div>
            </div>

            {/* Center Transformation Indicator */}
            <div className="lg:col-span-2 flex flex-col items-center justify-center py-2 lg:py-0">
              <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-brand-indigo to-brand-purple flex items-center justify-center text-white shadow-md shadow-brand-indigo/30 animate-pulse">
                <Wand2 className="w-6 h-6" />
              </div>
              <span className="mt-2 text-xs font-extrabold uppercase tracking-wider text-brand-indigo">
                AI Improve →
              </span>
            </div>

            {/* Right Box: Resumind Improved Version */}
            <div className="lg:col-span-5 bg-gradient-to-br from-brand-indigo/[0.03] to-brand-purple/[0.03] rounded-2xl border border-brand-indigo/30 p-6 flex flex-col justify-between h-full shadow-sm">
              <div>
                <div className="flex items-center justify-between pb-3 border-b border-brand-indigo/20 mb-4">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    <span className="text-xs font-bold uppercase tracking-wider text-brand-indigo">
                      Resumind Optimized
                    </span>
                  </div>
                  <span className="text-[11px] font-bold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded-full">
                    Score: {currentExample.scoreAfter}/100
                  </span>
                </div>

                <div className="p-4 bg-white rounded-xl border border-brand-indigo/20 font-sans text-xs sm:text-sm text-slate-900 font-medium leading-relaxed shadow-2xs mb-4 relative group">
                  "{currentExample.improved}"
                  <button
                    type="button"
                    onClick={handleCopy}
                    className="absolute top-2 right-2 p-1.5 rounded-md bg-slate-100 hover:bg-slate-200 text-slate-600 transition-colors"
                    title="Copy improved bullet"
                  >
                    {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                  </button>
                </div>

                <p className="text-xs text-emerald-700 flex items-start gap-1.5">
                  <span className="font-bold shrink-0">Impact:</span>
                  <span>{currentExample.improvedHighlight}</span>
                </p>
              </div>

              <div className="mt-6 pt-3 border-t border-brand-indigo/15 flex items-center justify-between">
                <span className="text-[11px] text-emerald-700 font-medium">
                  ✓ Ready to paste into resume
                </span>
              </div>
            </div>

          </div>
        </motion.div>

        {/* Section Bottom CTA */}
        <div className="text-center mt-12">
          <Link
            to={isAuthenticated ? '/dashboard/rewrite' : '/register'}
            className="inline-flex items-center gap-2 px-8 py-4 rounded-xl text-base font-bold text-white bg-brand-indigo hover:bg-brand-purple shadow-md shadow-brand-indigo/20 hover:shadow-lg transition-all"
          >
            <span>Improve My Resume</span>
            <ArrowRight className="w-5 h-5" />
          </Link>
        </div>

      </div>
    </section>
  );
};

export default RewriterShowcase;
