import { motion } from 'framer-motion';
import {
  GraduationCap,
  BookOpen,
  Code2,
  Target,
  Briefcase,
  Check,
} from 'lucide-react';

const audiences = [
  {
    title: 'Students',
    tagline: 'Before your first internship',
    description: 'Transform academic coursework, hackathon submissions, and campus leadership into credible, recruiter-friendly resume bullets.',
    icon: GraduationCap,
    features: ['Coursework structuring', 'Entry-level formatting', 'Project highlight framing'],
    accent: 'border-blue-200 hover:border-blue-400 bg-blue-50/30',
    iconColor: 'bg-blue-100 text-blue-700',
  },
  {
    title: 'Freshers',
    tagline: 'Launch your tech career',
    description: 'Turn capstone projects, self-taught skills, and certifications into strong proof points that stand out against competition.',
    icon: BookOpen,
    features: ['Skill prioritization', 'Eliminating filler words', 'ATS parser compatibility'],
    accent: 'border-purple-200 hover:border-purple-400 bg-purple-50/30',
    iconColor: 'bg-purple-100 text-purple-700',
  },
  {
    title: 'Developers',
    tagline: 'Engineers & Tech Specialists',
    description: 'Frame complex system architectures, latency reductions, and tech stacks with crisp quantifiable accomplishments.',
    icon: Code2,
    features: ['Quantified performance metrics', 'Framework & tooling alignment', 'System scale framing'],
    accent: 'border-indigo-200 hover:border-indigo-400 bg-indigo-50/30',
    iconColor: 'bg-indigo-100 text-indigo-700',
  },
  {
    title: 'Job Seekers',
    tagline: 'Active role targeting',
    description: 'Tailor customized variations of your resume for specific job descriptions to dramatically raise your interview callback rate.',
    icon: Target,
    features: ['Job description keyword match', 'Missing skill detection', 'Role-tailored rewrites'],
    accent: 'border-emerald-200 hover:border-emerald-400 bg-emerald-50/30',
    iconColor: 'bg-emerald-100 text-emerald-700',
  },
  {
    title: 'Professionals',
    tagline: 'Mid-to-Senior Transitions',
    description: 'Condense years of multi-disciplinary experience into high-impact leadership narratives that resonate with executive recruiters.',
    icon: Briefcase,
    features: ['Executive summary polish', 'Leadership & KPI clarity', 'Modern single-page flow'],
    accent: 'border-amber-200 hover:border-amber-400 bg-amber-50/30',
    iconColor: 'bg-amber-100 text-amber-700',
  },
];

const AudienceSection = () => {
  return (
    <section className="py-20 md:py-28 bg-white relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-brand-indigo/10 border border-brand-indigo/20 text-brand-indigo text-xs font-semibold mb-4">
            <Target className="w-3.5 h-3.5" />
            <span>Tailored For Every Stage</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
            Who Is Resumind For?
          </h2>
          <p className="mt-4 text-base sm:text-lg text-slate-600 leading-relaxed">
            Whether you are writing your very first internship application or optimizing for a senior engineering role, Resumind meets you at your career stage.
          </p>
        </div>

        {/* 5 Audience Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
          {audiences.slice(0, 3).map((item, index) => {
            const Icon = item.icon;
            return (
              <motion.div
                key={item.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1, duration: 0.5 }}
                className={`rounded-2xl p-7 border transition-all flex flex-col justify-between ${item.accent}`}
              >
                <div>
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-5 ${item.iconColor}`}>
                    <Icon className="w-6 h-6" />
                  </div>
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                    {item.tagline}
                  </span>
                  <h3 className="text-2xl font-bold text-slate-900 mt-1 mb-3">
                    {item.title}
                  </h3>
                  <p className="text-sm text-slate-600 leading-relaxed mb-6">
                    {item.description}
                  </p>

                  <div className="space-y-2 pt-4 border-t border-slate-200/60">
                    {item.features.map((feat) => (
                      <div key={feat} className="flex items-center gap-2 text-xs font-medium text-slate-700">
                        <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                        <span>{feat}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Bottom 2 Centered Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
          {audiences.slice(3, 5).map((item, index) => {
            const Icon = item.icon;
            return (
              <motion.div
                key={item.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: (index + 3) * 0.1, duration: 0.5 }}
                className={`rounded-2xl p-7 border transition-all flex flex-col justify-between ${item.accent}`}
              >
                <div>
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-5 ${item.iconColor}`}>
                    <Icon className="w-6 h-6" />
                  </div>
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                    {item.tagline}
                  </span>
                  <h3 className="text-2xl font-bold text-slate-900 mt-1 mb-3">
                    {item.title}
                  </h3>
                  <p className="text-sm text-slate-600 leading-relaxed mb-6">
                    {item.description}
                  </p>

                  <div className="space-y-2 pt-4 border-t border-slate-200/60">
                    {item.features.map((feat) => (
                      <div key={feat} className="flex items-center gap-2 text-xs font-medium text-slate-700">
                        <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                        <span>{feat}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>

      </div>
    </section>
  );
};

export default AudienceSection;
