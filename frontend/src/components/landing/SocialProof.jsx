import { motion } from 'framer-motion';
import {
  GraduationCap,
  BookOpen,
  Code2,
  Palette,
  Cpu,
  Briefcase,
  Users,
} from 'lucide-react';

const roles = [
  { label: 'Students', desc: 'Internship & entry prep', icon: GraduationCap },
  { label: 'Freshers', desc: 'Project & skill framing', icon: BookOpen },
  { label: 'Developers', desc: 'Tech stack & impact metrics', icon: Code2 },
  { label: 'Designers', desc: 'Portfolio & role alignment', icon: Palette },
  { label: 'Engineers', desc: 'System & problem solving', icon: Cpu },
  { label: 'Professionals', desc: 'Career transition & clarity', icon: Briefcase },
];

const SocialProof = () => {
  return (
    <section className="py-12 bg-white border-y border-slate-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6 md:gap-8">
          
          {/* Label */}
          <div className="flex items-center gap-3 shrink-0">
            <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center text-slate-700">
              <Users className="w-4 h-4" />
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                Targeted Intelligence
              </p>
              <h3 className="text-base font-bold text-slate-900">
                Built for modern job seekers
              </h3>
            </div>
          </div>

          {/* Role Chips */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5 w-full md:w-auto">
            {roles.map((item, index) => {
              const Icon = item.icon;
              return (
                <motion.div
                  key={item.label}
                  initial={{ opacity: 0, y: 10 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.05, duration: 0.4 }}
                  className="flex items-center gap-2.5 px-3 py-2 rounded-xl bg-slate-50 border border-slate-200/70 hover:border-brand-indigo/40 hover:bg-brand-indigo/5 transition-all group"
                >
                  <div className="w-6 h-6 rounded-md bg-white flex items-center justify-center text-slate-600 group-hover:text-brand-indigo shadow-2xs border border-slate-200/50">
                    <Icon className="w-3.5 h-3.5" />
                  </div>
                  <div className="text-left">
                    <p className="text-xs font-semibold text-slate-800 group-hover:text-brand-indigo transition-colors">
                      {item.label}
                    </p>
                  </div>
                </motion.div>
              );
            })}
          </div>

        </div>
      </div>
    </section>
  );
};

export default SocialProof;
