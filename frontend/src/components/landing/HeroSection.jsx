import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import {
  ArrowRight,
  CheckCircle2,
  AlertTriangle,
  Wand2,
  FileCheck,
  TrendingUp,
  ShieldCheck,
  Zap,
} from 'lucide-react';
import useAuthStore from '../../store/authStore';

const HeroSection = () => {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

  const handleScrollToFeatures = (e) => {
    e.preventDefault();
    const element = document.querySelector('#features');
    if (element) {
      const topOffset = 80;
      const elementPosition = element.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.pageYOffset - topOffset;
      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth',
      });
    }
  };

  return (
    <section className="relative pt-32 pb-20 md:pt-40 md:pb-28 overflow-hidden bg-gradient-to-b from-slate-50 via-white to-slate-50/50">
      {/* Background Decorative Blur Glows */}
      <div className="absolute top-20 left-1/2 -translate-x-1/2 w-full max-w-7xl h-96 pointer-events-none overflow-hidden -z-10">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-brand-indigo/10 rounded-full blur-3xl" />
        <div className="absolute top-10 right-1/4 w-80 h-80 bg-brand-blue/10 rounded-full blur-3xl" />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
          
          {/* Left Hero Content */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: 'easeOut' }}
            className="lg:col-span-7 text-center lg:text-left"
          >
            {/* Badge */}
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-brand-indigo/10 border border-brand-indigo/20 text-brand-indigo text-xs md:text-sm font-semibold mb-6 shadow-sm">
              <span className="flex h-2 w-2 rounded-full bg-brand-indigo animate-pulse" />
              <span>AI-Powered Resume Intelligence</span>
            </div>

            {/* Main Headline */}
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-slate-900 tracking-tight leading-[1.12]">
              Turn Your Resume Into Your{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-indigo via-brand-purple to-brand-blue">
                Career Advantage
              </span>
            </h1>

            {/* Supporting Description */}
            <p className="mt-6 text-lg sm:text-xl text-slate-600 max-w-2xl mx-auto lg:mx-0 leading-relaxed font-normal">
              Resumind analyzes your resume, identifies what is holding it back, improves your content and helps you match your experience with real job requirements.
            </p>

            {/* CTA Buttons */}
            <div className="mt-8 sm:mt-10 flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4">
              <Link
                to={isAuthenticated ? '/dashboard/upload' : '/register'}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 px-7 py-4 rounded-xl text-base font-bold text-white bg-brand-indigo hover:bg-brand-purple shadow-lg shadow-brand-indigo/30 hover:shadow-xl hover:shadow-brand-indigo/40 hover:-translate-y-0.5 active:translate-y-0 transition-all"
              >
                <Zap className="w-5 h-5 fill-current" />
                <span>Analyze My Resume</span>
                <ArrowRight className="w-4 h-4 ml-1" />
              </Link>

              <a
                href="#features"
                onClick={handleScrollToFeatures}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-7 py-4 rounded-xl text-base font-semibold text-slate-700 bg-white hover:bg-slate-50 border border-slate-200 shadow-sm hover:shadow transition-all"
              >
                <span>Explore Features</span>
              </a>
            </div>

            {/* Trust Step Statement */}
            <div className="mt-10 pt-8 border-t border-slate-200/80 flex items-center justify-center lg:justify-start">
              <div className="flex flex-wrap items-center justify-center gap-2 text-xs sm:text-sm font-medium text-slate-500">
                <span className="text-slate-800 font-semibold flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-brand-indigo" />
                  Analyze
                </span>
                <span className="text-slate-400">→</span>
                <span className="text-slate-800 font-semibold flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-brand-purple" />
                  Improve
                </span>
                <span className="text-slate-400">→</span>
                <span className="text-slate-800 font-semibold flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-brand-blue" />
                  Match
                </span>
                <span className="text-slate-400">→</span>
                <span className="text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md font-semibold border border-emerald-200/60 flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                  Get Ready
                </span>
              </div>
            </div>
          </motion.div>

          {/* Right Hero Product Visual (High-Fidelity Resumind Mockup) */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 30 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2, ease: 'easeOut' }}
            className="lg:col-span-5 relative"
          >
            {/* Ambient Back Glow */}
            <div className="absolute -inset-4 bg-gradient-to-r from-brand-indigo/20 via-brand-purple/20 to-brand-blue/20 rounded-3xl blur-2xl -z-10 opacity-70" />

            {/* Main Interactive Floating Card */}
            <div className="bg-white rounded-2xl border border-slate-200/90 shadow-2xl shadow-slate-900/10 p-5 sm:p-6 relative animate-float-slow">
              
              {/* Header of Mockup Card */}
              <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-5">
                <div className="flex items-center gap-2.5">
                  <div className="w-3 h-3 rounded-full bg-red-400" />
                  <div className="w-3 h-3 rounded-full bg-amber-400" />
                  <div className="w-3 h-3 rounded-full bg-emerald-400" />
                  <span className="ml-2 text-xs font-mono text-slate-400 truncate max-w-[140px] sm:max-w-[180px]">
                    Software_Engineer_Resume.pdf
                  </span>
                </div>
                <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
                  <FileCheck className="w-3 h-3 text-emerald-600" />
                  Live Analysis
                </span>
              </div>

              {/* ATS Score Section */}
              <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white rounded-xl p-5 mb-5 shadow-inner">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                      Overall ATS Score
                    </span>
                    <h3 className="text-3xl font-extrabold mt-0.5 flex items-baseline gap-1">
                      <span className="text-emerald-400 font-display">87</span>
                      <span className="text-slate-400 text-sm font-normal">/ 100</span>
                    </h3>
                    <p className="text-xs text-slate-300 mt-1 flex items-center gap-1">
                      <TrendingUp className="w-3.5 h-3.5 text-emerald-400" />
                      Top 12% for Software Engineer roles
                    </p>
                  </div>

                  {/* Circular visual progress badge */}
                  <div className="relative w-16 h-16 flex items-center justify-center">
                    <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
                      <path
                        className="text-slate-700"
                        strokeWidth="3.5"
                        stroke="currentColor"
                        fill="none"
                        d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                      />
                      <path
                        className="text-emerald-400 stroke-current"
                        strokeWidth="3.5"
                        strokeDasharray="87, 100"
                        strokeLinecap="round"
                        fill="none"
                        d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                      />
                    </svg>
                    <span className="absolute text-xs font-bold text-white">87%</span>
                  </div>
                </div>
              </div>

              {/* Section Checks & Warnings */}
              <div className="space-y-2.5 mb-5">
                <div className="flex items-center justify-between p-2.5 bg-emerald-50/70 border border-emerald-100 rounded-lg text-xs font-medium text-emerald-900">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>Strong Skills & Tech Stack Section</span>
                  </div>
                  <span className="text-[10px] font-bold uppercase text-emerald-700">92%</span>
                </div>

                <div className="flex items-center justify-between p-2.5 bg-emerald-50/70 border border-emerald-100 rounded-lg text-xs font-medium text-emerald-900">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>Good Experience Chronology & Structure</span>
                  </div>
                  <span className="text-[10px] font-bold uppercase text-emerald-700">88%</span>
                </div>

                <div className="flex items-center justify-between p-2.5 bg-amber-50/70 border border-amber-100 rounded-lg text-xs font-medium text-amber-900">
                  <div className="flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
                    <span>Add More Job-Specific Keywords (React, AWS)</span>
                  </div>
                  <span className="text-[10px] font-bold uppercase text-amber-700">Missing 3</span>
                </div>

                <div className="flex items-center justify-between p-2.5 bg-amber-50/70 border border-amber-100 rounded-lg text-xs font-medium text-amber-900">
                  <div className="flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
                    <span>Improve Achievement Metrics in Bullet Points</span>
                  </div>
                  <span className="text-[10px] font-bold uppercase text-amber-700">Action</span>
                </div>
              </div>

              {/* AI Suggested Improvement Floating Card */}
              <div className="p-3.5 bg-gradient-to-r from-brand-indigo/5 to-brand-purple/5 border border-brand-indigo/20 rounded-xl relative">
                <div className="flex items-center gap-2 mb-1.5">
                  <div className="w-5 h-5 rounded-md bg-brand-indigo text-white flex items-center justify-center">
                    <Wand2 className="w-3 h-3" />
                  </div>
                  <span className="text-xs font-bold text-brand-indigo">
                    Suggested AI Improvement
                  </span>
                </div>
                <p className="text-xs text-slate-700 leading-snug">
                  "Improved your experience section with measurable achievements and stronger action verbs (+35% query latency reduction)."
                </p>
              </div>
            </div>

            {/* Small Floating Micro-Badge on Top-Right */}
            <div className="absolute -top-4 -right-2 sm:-right-4 bg-white border border-slate-200/90 shadow-lg rounded-xl px-3 py-2 flex items-center gap-2 animate-bounce duration-1000">
              <ShieldCheck className="w-4 h-4 text-brand-indigo" />
              <span className="text-xs font-bold text-slate-800">ATS Optimized</span>
            </div>
          </motion.div>

        </div>
      </div>
    </section>
  );
};

export default HeroSection;
