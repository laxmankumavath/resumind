import { motion } from 'framer-motion';
import {
  BarChart3,
  TrendingUp,
  FileSearch,
  Check,
  AlertTriangle,
} from 'lucide-react';

const sectionMetrics = [
  { name: 'Education Section', score: 95, color: 'bg-emerald-500', note: 'Standard degree & institution formatting' },
  { name: 'Experience & Work History', score: 92, color: 'bg-emerald-500', note: 'Strong chronological alignment' },
  { name: 'Skills & Technical Core', score: 88, color: 'bg-emerald-500', note: 'Grouped by categorized competencies' },
  { name: 'Projects & Implementations', score: 81, color: 'bg-brand-indigo', note: 'Need stronger metric verification' },
  { name: 'Job Keywords Alignment', score: 76, color: 'bg-amber-500', note: '3 high-frequency terms missing' },
];

const AtsDeepDive = () => {
  return (
    <section id="ats-analysis" className="py-20 md:py-28 bg-white relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">
          
          {/* Left Column: Context & Explanations */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="lg:col-span-5"
          >
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-brand-indigo/10 border border-brand-indigo/20 text-brand-indigo text-xs font-semibold mb-4">
              <FileSearch className="w-3.5 h-3.5" />
              <span>Diagnostic Precision</span>
            </div>

            <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight leading-tight">
              Know What Your Resume Is Really Saying
            </h2>

            <p className="mt-5 text-base sm:text-lg text-slate-600 leading-relaxed">
              Get a structured breakdown of your resume so you can understand what works, what doesn't and what to improve.
            </p>

            <div className="mt-8 space-y-4">
              <div className="flex items-start gap-3.5">
                <div className="w-6 h-6 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0 mt-0.5 border border-emerald-200">
                  <Check className="w-3.5 h-3.5 stroke-[3]" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-slate-900">Grammar, Syntax & Tone Scoring</h4>
                  <p className="text-xs text-slate-600 mt-0.5">Detects passive voice, fragmented statements, and readability levels.</p>
                </div>
              </div>

              <div className="flex items-start gap-3.5">
                <div className="w-6 h-6 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0 mt-0.5 border border-emerald-200">
                  <Check className="w-3.5 h-3.5 stroke-[3]" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-slate-900">Contextual Keyword Matching</h4>
                  <p className="text-xs text-slate-600 mt-0.5">Compares terminology against industry-standard role requirements.</p>
                </div>
              </div>

              <div className="flex items-start gap-3.5">
                <div className="w-6 h-6 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0 mt-0.5 border border-emerald-200">
                  <Check className="w-3.5 h-3.5 stroke-[3]" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-slate-900">Applicant Tracking System Parsing Test</h4>
                  <p className="text-xs text-slate-600 mt-0.5">Identifies complex tables or multi-column flaws that break automated parsers.</p>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Right Column: Large Interactive Dashboard Visualization */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="lg:col-span-7"
          >
            <div className="bg-slate-900 text-white rounded-3xl p-6 sm:p-8 shadow-2xl border border-slate-800 relative overflow-hidden">
              
              {/* Background ambient lighting */}
              <div className="absolute top-0 right-0 w-64 h-64 bg-brand-indigo/20 rounded-full blur-3xl pointer-events-none" />
              <div className="absolute bottom-0 left-0 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

              {/* Card Header with Score */}
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-6 border-b border-slate-800">
                <div>
                  <div className="flex items-center gap-2">
                    <BarChart3 className="w-5 h-5 text-brand-indigo" />
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                      ATS Analysis Dashboard
                    </span>
                  </div>
                  <h3 className="text-xl font-bold text-white mt-1">
                    Resume Performance Diagnostic
                  </h3>
                </div>

                <div className="flex items-center gap-3 bg-slate-800/80 px-4 py-2 rounded-2xl border border-slate-700">
                  <div className="text-right">
                    <span className="text-[10px] font-semibold text-slate-400 uppercase block">Overall Score</span>
                    <span className="text-2xl font-black text-emerald-400 font-display">87</span>
                    <span className="text-xs text-slate-400">/100</span>
                  </div>
                  <div className="w-10 h-10 rounded-xl bg-emerald-500/20 flex items-center justify-center text-emerald-400">
                    <TrendingUp className="w-5 h-5" />
                  </div>
                </div>
              </div>

              {/* Section-level Progress Bars */}
              <div className="my-6 space-y-4">
                <p className="text-xs font-bold uppercase tracking-wider text-slate-400">
                  Section-by-Section Breakdown
                </p>

                {sectionMetrics.map((item, idx) => (
                  <div key={item.name} className="space-y-1.5">
                    <div className="flex justify-between items-center text-xs">
                      <span className="font-semibold text-slate-200">{item.name}</span>
                      <span className="font-bold font-mono text-slate-300">{item.score}%</span>
                    </div>
                    
                    {/* Animated Progress Bar */}
                    <div className="h-2.5 w-full bg-slate-800 rounded-full overflow-hidden p-0.5 border border-slate-700/60">
                      <motion.div
                        initial={{ width: 0 }}
                        whileInView={{ width: `${item.score}%` }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.2 + idx * 0.1, duration: 0.8, ease: 'easeOut' }}
                        className={`h-full rounded-full ${item.color}`}
                      />
                    </div>
                    <p className="text-[10px] text-slate-400 flex items-center gap-1">
                      <span>• {item.note}</span>
                    </p>
                  </div>
                ))}
              </div>

              {/* Areas to Improve Box */}
              <div className="pt-5 border-t border-slate-800">
                <div className="flex items-center gap-2 mb-3">
                  <AlertTriangle className="w-4 h-4 text-amber-400" />
                  <span className="text-xs font-bold uppercase tracking-wider text-amber-300">
                    Priority Areas to Improve
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                  <div className="bg-slate-800/60 border border-slate-700/70 p-2.5 rounded-xl text-xs text-slate-300">
                    <span className="text-amber-400 font-bold block mb-0.5">1. Add Metrics</span>
                    Quantify performance and impact percentages.
                  </div>
                  <div className="bg-slate-800/60 border border-slate-700/70 p-2.5 rounded-xl text-xs text-slate-300">
                    <span className="text-amber-400 font-bold block mb-0.5">2. Strengthen Projects</span>
                    Specify system architecture & tech stack.
                  </div>
                  <div className="bg-slate-800/60 border border-slate-700/70 p-2.5 rounded-xl text-xs text-slate-300">
                    <span className="text-amber-400 font-bold block mb-0.5">3. Missing Keywords</span>
                    Inject React, AWS, CI/CD naturally.
                  </div>
                </div>
              </div>

            </div>
          </motion.div>

        </div>
      </div>
    </section>
  );
};

export default AtsDeepDive;
