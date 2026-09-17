import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import {
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  Briefcase,
  Search,
  Target,
} from 'lucide-react';
import useAuthStore from '../../store/authStore';

const JobMatchShowcase = () => {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

  return (
    <section id="job-matching" className="py-20 md:py-28 bg-white relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-brand-blue/10 border border-brand-blue/20 text-brand-blue text-xs font-semibold mb-4">
            <Target className="w-3.5 h-3.5" />
            <span>Targeted Alignment</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
            Tailor Your Resume to the Job
          </h2>
          <p className="mt-4 text-base sm:text-lg text-slate-600 leading-relaxed">
            Paste a job description and see where your resume aligns — and where it needs work.
          </p>
        </div>

        {/* Mockup Container */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="max-w-4xl mx-auto bg-slate-900 text-white rounded-3xl p-6 sm:p-8 lg:p-10 shadow-2xl border border-slate-800 relative overflow-hidden"
        >
          {/* Subtle Background Glow */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-brand-blue/15 rounded-full blur-3xl pointer-events-none" />

          {/* Top Bar */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 border-b border-slate-800 gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-brand-blue/20 text-brand-blue flex items-center justify-center font-bold">
                <Briefcase className="w-5 h-5" />
              </div>
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  Target Role Specification
                </span>
                <h3 className="text-lg font-bold text-white">
                  Frontend Developer / Software Engineer
                </h3>
              </div>
            </div>

            {/* Match Percentage Pill */}
            <div className="flex items-center gap-3 bg-slate-800 px-4 py-2 rounded-2xl border border-slate-700">
              <div className="text-right">
                <span className="text-[10px] uppercase font-bold text-slate-400 block">Resume Match</span>
                <span className="text-2xl font-black text-emerald-400 font-display">78%</span>
              </div>
              <div className="w-3 h-3 rounded-full bg-emerald-400 animate-pulse" />
            </div>
          </div>

          {/* Content Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 my-8">
            
            {/* Required Skills Analysis */}
            <div className="bg-slate-800/60 rounded-2xl p-5 border border-slate-700">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-300 mb-4 flex items-center gap-2">
                <Search className="w-4 h-4 text-brand-blue" />
                Required Keywords Evaluated
              </h4>

              <div className="space-y-2.5">
                <div className="flex items-center justify-between p-2.5 bg-slate-800 rounded-lg border border-slate-700/60 text-xs">
                  <span className="font-semibold text-slate-200">React.js & Architecture</span>
                  <span className="text-emerald-400 font-bold flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" /> Found (3x)
                  </span>
                </div>

                <div className="flex items-center justify-between p-2.5 bg-slate-800 rounded-lg border border-slate-700/60 text-xs">
                  <span className="font-semibold text-slate-200">JavaScript / ES6+</span>
                  <span className="text-emerald-400 font-bold flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" /> Found (4x)
                  </span>
                </div>

                <div className="flex items-center justify-between p-2.5 bg-slate-800 rounded-lg border border-slate-700/60 text-xs">
                  <span className="font-semibold text-slate-200">REST APIs & Integration</span>
                  <span className="text-emerald-400 font-bold flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" /> Found (2x)
                  </span>
                </div>

                <div className="flex items-center justify-between p-2.5 bg-amber-950/40 rounded-lg border border-amber-800/50 text-xs">
                  <span className="font-semibold text-amber-200">TypeScript</span>
                  <span className="text-amber-400 font-bold flex items-center gap-1">
                    <AlertTriangle className="w-3.5 h-3.5" /> Missing
                  </span>
                </div>

                <div className="flex items-center justify-between p-2.5 bg-amber-950/40 rounded-lg border border-amber-800/50 text-xs">
                  <span className="font-semibold text-amber-200">AWS / Cloud Hosting</span>
                  <span className="text-amber-400 font-bold flex items-center gap-1">
                    <AlertTriangle className="w-3.5 h-3.5" /> Missing
                  </span>
                </div>
              </div>
            </div>

            {/* Actionable Keyword Insertion Guide */}
            <div className="bg-slate-800/60 rounded-2xl p-5 border border-slate-700 flex flex-col justify-between">
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-amber-300 mb-3 flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4" />
                  Missing High-Value Keywords
                </h4>
                <p className="text-xs text-slate-400 leading-relaxed mb-4">
                  Recruiters for this role heavily filter candidates using these specific terms. We recommend incorporating them into your project bullets:
                </p>

                <div className="flex flex-wrap gap-2 mb-6">
                  <span className="bg-amber-500/10 text-amber-300 border border-amber-500/30 px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5">
                    <span className="text-amber-400">+</span> TypeScript
                  </span>
                  <span className="bg-amber-500/10 text-amber-300 border border-amber-500/30 px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5">
                    <span className="text-amber-400">+</span> AWS (S3 / Lambda)
                  </span>
                  <span className="bg-amber-500/10 text-amber-300 border border-amber-500/30 px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5">
                    <span className="text-amber-400">+</span> Automated Testing
                  </span>
                  <span className="bg-amber-500/10 text-amber-300 border border-amber-500/30 px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5">
                    <span className="text-amber-400">+</span> Performance Profiling
                  </span>
                </div>
              </div>

              <div className="p-3 bg-slate-900 rounded-xl border border-slate-700 text-xs text-slate-300">
                <span className="text-emerald-400 font-bold block mb-1">Expected Match After Insertion:</span>
                Estimated match jumps from <strong className="text-white">78%</strong> to <strong className="text-emerald-400">94%</strong>.
              </div>
            </div>

          </div>

          {/* Bottom Action in Mockup */}
          <div className="pt-4 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4">
            <span className="text-xs text-slate-400">
              Compatible with all standard job portal postings (LinkedIn, Indeed, Greenhouse).
            </span>

            <Link
              to={isAuthenticated ? '/dashboard/company-match' : '/register'}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl text-sm font-bold text-white bg-brand-indigo hover:bg-brand-purple shadow-md transition-all"
            >
              <span>Check My Job Match</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

        </motion.div>

      </div>
    </section>
  );
};

export default JobMatchShowcase;
