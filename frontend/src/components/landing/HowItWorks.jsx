import { useState } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import {
  UploadCloud,
  BarChart3,
  Wand2,
  Building2,
  ArrowRight,
} from 'lucide-react';
import useAuthStore from '../../store/authStore';

const steps = [
  {
    step: '01',
    title: 'Upload',
    subtitle: 'Upload your PDF or DOCX resume',
    description: 'Drag and drop your existing document. Our secure parser extracts text and preserves structural hierarchy without distortion.',
    icon: UploadCloud,
    preview: {
      tag: 'Secure Ingestion',
      content: 'Supported: .pdf, .docx, .doc (up to 10MB)',
      status: 'Fast Parsing Active',
    },
  },
  {
    step: '02',
    title: 'Analyze',
    subtitle: 'Evaluate critical resume sections',
    description: 'Resumind conducts an in-depth ATS evaluation, scoring experience, skills, education, structure, and keyword density.',
    icon: BarChart3,
    preview: {
      tag: 'Automated Diagnostic',
      content: 'Scored against modern ATS screening criteria',
      status: 'Overall Score: 87/100',
    },
  },
  {
    step: '03',
    title: 'Improve',
    subtitle: 'Personalized recommendations & AI rewriting',
    description: 'Transform passive phrases into quantifiable achievements. Polish individual bullet points or trigger a full section rewrite.',
    icon: Wand2,
    preview: {
      tag: 'AI Enhancement',
      content: 'Action verbs + quantified business metrics',
      status: 'Impact Rating: High',
    },
  },
  {
    step: '04',
    title: 'Match',
    subtitle: 'Compare against real job descriptions',
    description: 'Paste any target job description to pinpoint missing skills, calculate compatibility percentages, and tailor your resume for maximum relevance.',
    icon: Building2,
    preview: {
      tag: 'Target Alignment',
      content: 'Keyword match & company suitability predictor',
      status: 'Match Rate: 78%+',
    },
  },
];

const HowItWorks = () => {
  const [activeStep, setActiveStep] = useState(0);
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

  return (
    <section id="how-it-works" className="py-20 md:py-28 bg-slate-50 relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-16 md:mb-20">
          <div className="inline-flex items-center px-3.5 py-1 rounded-full bg-brand-indigo/10 border border-brand-indigo/20 text-brand-indigo text-xs font-semibold mb-4">
            <span>Simple, Structured Process</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
            From Resume to Job-Ready in 4 Steps
          </h2>
          <p className="mt-4 text-base sm:text-lg text-slate-600 leading-relaxed">
            No guesswork. Follow our proven 4-step pipeline to transform your resume into a targeted application asset.
          </p>
        </div>

        {/* 4 Step Timeline Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 relative mb-16">
          {steps.map((item, index) => {
            const Icon = item.icon;
            const isActive = activeStep === index;

            return (
              <motion.div
                key={item.step}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1, duration: 0.5 }}
                onClick={() => setActiveStep(index)}
                className={`cursor-pointer rounded-2xl p-6 transition-all duration-300 flex flex-col justify-between border ${
                  isActive
                    ? 'bg-white border-brand-indigo shadow-lg shadow-brand-indigo/10 ring-2 ring-brand-indigo/20 scale-[1.02]'
                    : 'bg-white/80 border-slate-200/80 hover:border-slate-300 hover:bg-white shadow-xs'
                }`}
              >
                <div>
                  {/* Top Step Number & Icon */}
                  <div className="flex items-center justify-between mb-5">
                    <span className={`text-2xl font-black font-display ${
                      isActive ? 'text-brand-indigo' : 'text-slate-300'
                    }`}>
                      {item.step}
                    </span>
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center transition-colors ${
                      isActive
                        ? 'bg-brand-indigo text-white shadow-md shadow-brand-indigo/20'
                        : 'bg-slate-100 text-slate-600'
                    }`}>
                      <Icon className="w-5 h-5" />
                    </div>
                  </div>

                  <h3 className="text-lg font-bold text-slate-900 mb-1">
                    {item.title}
                  </h3>
                  <p className="text-xs font-semibold text-brand-indigo mb-3">
                    {item.subtitle}
                  </p>
                  <p className="text-sm text-slate-600 leading-relaxed">
                    {item.description}
                  </p>
                </div>

                {/* Micro Step Preview Box */}
                <div className="mt-6 pt-4 border-t border-slate-100">
                  <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-200/60 text-xs">
                    <div className="flex justify-between items-center text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                      <span>{item.preview.tag}</span>
                    </div>
                    <p className="text-slate-700 font-medium text-[11px] truncate">
                      {item.preview.content}
                    </p>
                    <span className="inline-block text-[10px] font-bold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded mt-1.5 border border-emerald-100">
                      ✓ {item.preview.status}
                    </span>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Section Bottom CTA */}
        <div className="text-center">
          <Link
            to={isAuthenticated ? '/dashboard/upload' : '/register'}
            className="inline-flex items-center gap-2 px-8 py-4 rounded-xl text-base font-bold text-white bg-brand-indigo hover:bg-brand-purple shadow-md shadow-brand-indigo/20 hover:shadow-lg transition-all"
          >
            <span>Start With Your Resume</span>
            <ArrowRight className="w-5 h-5" />
          </Link>
        </div>

      </div>
    </section>
  );
};

export default HowItWorks;
