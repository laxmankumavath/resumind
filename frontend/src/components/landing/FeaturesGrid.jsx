import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import {
  BarChart3,
  ShieldCheck,
  Wand2,
  Building2,
  Lightbulb,
  Download,
  ArrowRight,
  CheckCircle2,
} from 'lucide-react';
import useAuthStore from '../../store/authStore';

const FeaturesGrid = () => {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

  return (
    <section id="features" className="py-20 md:py-28 bg-white relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16 md:mb-20">
          <div className="inline-flex items-center px-3.5 py-1 rounded-full bg-brand-indigo/10 border border-brand-indigo/20 text-brand-indigo text-xs font-semibold mb-4">
            <span>Comprehensive Career Platform</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
            Everything You Need to Build a Stronger Resume
          </h2>
          <p className="mt-4 text-base sm:text-lg text-slate-600 leading-relaxed">
            From granular section scoring to AI-assisted rewriting and job-specific role matching, Resumind provides the exact tools required to present your best professional self.
          </p>
        </div>

        {/* 6 Feature Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          
          {/* Feature 1: AI Resume Analysis */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="bg-slate-50/70 rounded-2xl p-7 border border-slate-200/80 shadow-xs hover:shadow-md hover:border-brand-indigo/30 transition-all flex flex-col justify-between"
          >
            <div>
              <div className="w-12 h-12 rounded-xl bg-brand-indigo/10 flex items-center justify-center text-brand-indigo mb-5">
                <BarChart3 className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-2">
                AI Resume Analysis
              </h3>
              <p className="text-sm text-slate-600 leading-relaxed mb-6">
                Get an intelligent analysis of your resume and understand exactly what needs improvement across all major sections.
              </p>

              {/* Visual Demo: Radial Progress + Section Scores */}
              <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-2xs space-y-3">
                <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                  <span className="text-xs font-semibold text-slate-500">Overall Score</span>
                  <span className="text-sm font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-100">87/100</span>
                </div>
                <div className="space-y-2 text-xs">
                  <div className="flex justify-between items-center text-slate-700">
                    <span>Strengths identified</span>
                    <span className="font-semibold text-emerald-600">4 areas</span>
                  </div>
                  <div className="flex justify-between items-center text-slate-700">
                    <span>Weaknesses flagged</span>
                    <span className="font-semibold text-amber-600">2 areas</span>
                  </div>
                  <div className="flex justify-between items-center text-slate-700">
                    <span>Section-level depth</span>
                    <span className="font-semibold text-brand-indigo">95% Complete</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-6 pt-4 border-t border-slate-200/60">
              <span className="text-xs font-semibold text-brand-indigo flex items-center gap-1">
                Section-level diagnostic <ArrowRight className="w-3.5 h-3.5" />
              </span>
            </div>
          </motion.div>

          {/* Feature 2: ATS Optimization */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="bg-slate-50/70 rounded-2xl p-7 border border-slate-200/80 shadow-xs hover:shadow-md hover:border-brand-indigo/30 transition-all flex flex-col justify-between"
          >
            <div>
              <div className="w-12 h-12 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-600 mb-5">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-2">
                ATS Optimization
              </h3>
              <p className="text-sm text-slate-600 leading-relaxed mb-6">
                Identify the issues that can affect how your resume performs against Applicant Tracking Systems without misleading promises.
              </p>

              {/* Visual Demo: Keyword Analysis, Structure & Formatting */}
              <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-2xs space-y-2.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-600 font-medium">Keyword Analysis</span>
                  <span className="font-bold text-emerald-600">92% Matched</span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-600 font-medium">Resume Structure</span>
                  <span className="font-bold text-emerald-600">Single Column ✓</span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-600 font-medium">Formatting & Typography</span>
                  <span className="font-bold text-emerald-600">Clean UTF-8 ✓</span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-600 font-medium">Skill Grouping</span>
                  <span className="font-bold text-brand-indigo">Optimized</span>
                </div>
              </div>
            </div>

            <div className="mt-6 pt-4 border-t border-slate-200/60">
              <span className="text-xs font-semibold text-emerald-700 flex items-center gap-1">
                Parsing compliance checks <ArrowRight className="w-3.5 h-3.5" />
              </span>
            </div>
          </motion.div>

          {/* Feature 3: AI Resume Rewriter */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="bg-slate-50/70 rounded-2xl p-7 border border-slate-200/80 shadow-xs hover:shadow-md hover:border-brand-indigo/30 transition-all flex flex-col justify-between"
          >
            <div>
              <div className="w-12 h-12 rounded-xl bg-brand-purple/10 flex items-center justify-center text-brand-purple mb-5">
                <Wand2 className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-2">
                AI Resume Rewriter
              </h3>
              <p className="text-sm text-slate-600 leading-relaxed mb-6">
                Transform weak resume content into clearer, stronger and more professional achievements with active phrasing.
              </p>

              {/* Visual Demo: Interactive Before -> After snippet */}
              <div className="bg-white rounded-xl p-3.5 border border-slate-200 shadow-2xs space-y-2">
                <div className="text-[11px] p-2 bg-red-50/60 border border-red-100 rounded text-slate-600">
                  <span className="text-red-600 font-bold uppercase text-[9px] block">Before</span>
                  "Worked on a website for college project."
                </div>
                <div className="text-[11px] p-2 bg-emerald-50/60 border border-emerald-100 rounded text-slate-800 font-medium">
                  <span className="text-emerald-700 font-bold uppercase text-[9px] block">After</span>
                  "Developed a responsive web application using React and Node.js, improving usability and streamlining workflow."
                </div>
              </div>
            </div>

            <div className="mt-6 pt-4 border-t border-slate-200/60 flex items-center justify-between">
              <Link
                to={isAuthenticated ? '/dashboard/rewrite' : '/register'}
                className="text-xs font-bold text-brand-indigo hover:text-brand-purple flex items-center gap-1"
              >
                Rewrite My Resume <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </motion.div>

          {/* Feature 4: Job Description Matching */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="bg-slate-50/70 rounded-2xl p-7 border border-slate-200/80 shadow-xs hover:shadow-md hover:border-brand-indigo/30 transition-all flex flex-col justify-between"
          >
            <div>
              <div className="w-12 h-12 rounded-xl bg-brand-blue/10 flex items-center justify-center text-brand-blue mb-5">
                <Building2 className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-2">
                Job Description Matching
              </h3>
              <p className="text-sm text-slate-600 leading-relaxed mb-6">
                Compare your resume with a specific job description and discover how closely your skills match the target role.
              </p>

              {/* Visual Demo: Match Visualization */}
              <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-2xs space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-[10px] uppercase font-bold text-slate-400">Target Role</p>
                    <p className="text-xs font-bold text-slate-800">Software Engineer</p>
                  </div>
                  <span className="text-sm font-extrabold text-brand-indigo bg-brand-indigo/10 px-2.5 py-1 rounded-lg">
                    78% Match
                  </span>
                </div>
                <div className="flex flex-wrap gap-1.5 pt-1">
                  <span className="text-[10px] font-semibold bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded border border-emerald-200">React ✓</span>
                  <span className="text-[10px] font-semibold bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded border border-emerald-200">JavaScript ✓</span>
                  <span className="text-[10px] font-semibold bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded border border-emerald-200">REST APIs ✓</span>
                  <span className="text-[10px] font-semibold bg-amber-50 text-amber-800 px-2 py-0.5 rounded border border-amber-200">Docker ⚠</span>
                  <span className="text-[10px] font-semibold bg-amber-50 text-amber-800 px-2 py-0.5 rounded border border-amber-200">AWS ⚠</span>
                </div>
              </div>
            </div>

            <div className="mt-6 pt-4 border-t border-slate-200/60">
              <span className="text-xs font-semibold text-brand-blue flex items-center gap-1">
                Pinpoint skill gaps <ArrowRight className="w-3.5 h-3.5" />
              </span>
            </div>
          </motion.div>

          {/* Feature 5: Improvement Recommendations */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="bg-slate-50/70 rounded-2xl p-7 border border-slate-200/80 shadow-xs hover:shadow-md hover:border-brand-indigo/30 transition-all flex flex-col justify-between"
          >
            <div>
              <div className="w-12 h-12 rounded-xl bg-amber-50 flex items-center justify-center text-amber-600 mb-5">
                <Lightbulb className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-2">
                Improvement Recommendations
              </h3>
              <p className="text-sm text-slate-600 leading-relaxed mb-6">
                Get actionable recommendations instead of vague feedback so you know exactly what to edit next.
              </p>

              {/* Visual Demo: Actionable Recommendations */}
              <div className="space-y-1.5">
                <div className="p-2 bg-white rounded-lg border border-slate-200 text-xs font-medium text-slate-700 flex items-center gap-2 shadow-2xs">
                  <CheckCircle2 className="w-3.5 h-3.5 text-brand-indigo shrink-0" />
                  <span>Add measurable achievements</span>
                </div>
                <div className="p-2 bg-white rounded-lg border border-slate-200 text-xs font-medium text-slate-700 flex items-center gap-2 shadow-2xs">
                  <CheckCircle2 className="w-3.5 h-3.5 text-brand-indigo shrink-0" />
                  <span>Improve your summary statement</span>
                </div>
                <div className="p-2 bg-white rounded-lg border border-slate-200 text-xs font-medium text-slate-700 flex items-center gap-2 shadow-2xs">
                  <CheckCircle2 className="w-3.5 h-3.5 text-brand-indigo shrink-0" />
                  <span>Add missing technical skills</span>
                </div>
                <div className="p-2 bg-white rounded-lg border border-slate-200 text-xs font-medium text-slate-700 flex items-center gap-2 shadow-2xs">
                  <CheckCircle2 className="w-3.5 h-3.5 text-brand-indigo shrink-0" />
                  <span>Strengthen project descriptions</span>
                </div>
              </div>
            </div>

            <div className="mt-6 pt-4 border-t border-slate-200/60">
              <span className="text-xs font-semibold text-amber-700 flex items-center gap-1">
                Prioritized checklists <ArrowRight className="w-3.5 h-3.5" />
              </span>
            </div>
          </motion.div>

          {/* Feature 6: Resume Export */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.5 }}
            className="bg-slate-50/70 rounded-2xl p-7 border border-slate-200/80 shadow-xs hover:shadow-md hover:border-brand-indigo/30 transition-all flex flex-col justify-between"
          >
            <div>
              <div className="w-12 h-12 rounded-xl bg-slate-100 flex items-center justify-center text-slate-800 mb-5">
                <Download className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-2">
                Resume Export
              </h3>
              <p className="text-sm text-slate-600 leading-relaxed mb-6">
                Take your improved resume with you anywhere. Export clean, recruiter-ready files formatted for seamless application workflows.
              </p>

              {/* Visual Demo: Document Formats */}
              <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-2xs space-y-3">
                <div className="flex items-center justify-between p-2 rounded-lg bg-slate-50 border border-slate-100">
                  <div className="flex items-center gap-2.5">
                    <div className="w-7 h-7 rounded bg-red-100 text-red-700 flex items-center justify-center text-[10px] font-bold">
                      PDF
                    </div>
                    <span className="text-xs font-bold text-slate-800">Export as PDF</span>
                  </div>
                  <span className="text-[10px] font-semibold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded">Ready</span>
                </div>

                <div className="flex items-center justify-between p-2 rounded-lg bg-slate-50 border border-slate-100">
                  <div className="flex items-center gap-2.5">
                    <div className="w-7 h-7 rounded bg-blue-100 text-blue-700 flex items-center justify-center text-[10px] font-bold">
                      DOCX
                    </div>
                    <span className="text-xs font-bold text-slate-800">Export as Word DOCX</span>
                  </div>
                  <span className="text-[10px] font-semibold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded">Ready</span>
                </div>
              </div>
            </div>

            <div className="mt-6 pt-4 border-t border-slate-200/60">
              <span className="text-xs font-semibold text-slate-800 flex items-center gap-1">
                Direct ATS-safe download <ArrowRight className="w-3.5 h-3.5" />
              </span>
            </div>
          </motion.div>

        </div>
      </div>
    </section>
  );
};

export default FeaturesGrid;
