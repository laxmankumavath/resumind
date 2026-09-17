import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import {
  ArrowRight,
  Zap,
  CheckCircle2,
} from 'lucide-react';
import useAuthStore from '../../store/authStore';

const CtaSection = () => {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

  return (
    <section className="py-20 md:py-28 bg-white relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Main CTA Card with Gradient Background */}
        <motion.div
          initial={{ opacity: 0, scale: 0.98 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="bg-gradient-to-br from-slate-900 via-slate-800 to-brand-dark text-white rounded-3xl p-8 sm:p-12 lg:p-16 relative overflow-hidden shadow-2xl border border-slate-800 text-center"
        >
          {/* Ambient Lighting Circles */}
          <div className="absolute top-0 left-1/4 w-96 h-96 bg-brand-indigo/25 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-brand-blue/20 rounded-full blur-3xl pointer-events-none" />

          {/* Badge */}
          <div className="relative inline-flex items-center px-3.5 py-1.5 rounded-full bg-white/10 backdrop-blur-md border border-white/15 text-white text-xs font-semibold mb-6 shadow-sm">
            <span>Ready to Stand Out to Employers?</span>
          </div>

          {/* Heading */}
          <h2 className="relative text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight max-w-3xl mx-auto leading-tight">
            Your Next Opportunity Starts With Your Resume.
          </h2>

          {/* Description */}
          <p className="relative mt-5 text-base sm:text-lg text-slate-300 max-w-2xl mx-auto leading-relaxed">
            Upload your resume, understand where it stands and start improving it today with intelligent ATS scoring and AI rewriting.
          </p>

          {/* Buttons */}
          <div className="relative mt-8 sm:mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              to={isAuthenticated ? '/dashboard/upload' : '/register'}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-4 rounded-xl text-base font-bold text-white bg-brand-indigo hover:bg-brand-purple shadow-lg shadow-brand-indigo/40 hover:shadow-xl hover:-translate-y-0.5 transition-all"
            >
              <Zap className="w-5 h-5 fill-current" />
              <span>Analyze My Resume</span>
              <ArrowRight className="w-4 h-4 ml-1" />
            </Link>

            {!isAuthenticated && (
              <Link
                to="/register"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-4 rounded-xl text-base font-semibold text-slate-200 bg-white/10 hover:bg-white/15 border border-white/20 backdrop-blur-md hover:text-white transition-all"
              >
                <span>Get Started Free</span>
              </Link>
            )}
          </div>

          {/* Micro trust indicators */}
          <div className="relative mt-10 pt-8 border-t border-slate-700/80 flex flex-wrap items-center justify-center gap-6 text-xs text-slate-400 font-medium">
            <div className="flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span>Instant ATS diagnostic</span>
            </div>
            <div className="flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span>PDF & DOCX parsing</span>
            </div>
            <div className="flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span>No credit card required</span>
            </div>
          </div>

        </motion.div>

      </div>
    </section>
  );
};

export default CtaSection;
