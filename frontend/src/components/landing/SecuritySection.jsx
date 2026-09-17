import { motion } from 'framer-motion';
import {
  ShieldCheck,
  Lock,
  KeyRound,
  FileCheck2,
  Cloud,
  Check,
} from 'lucide-react';

const securityFeatures = [
  {
    icon: KeyRound,
    title: 'Secure Authentication',
    description: 'Stateless JSON Web Tokens (JWT), salted bcrypt password hashing, and token refresh mechanisms to safeguard your credentials.',
  },
  {
    icon: ShieldCheck,
    title: 'Protected API Routes',
    description: 'Server-side route guards, strict rate-limiting, and sanitized input validation on every endpoint to prevent malicious requests.',
  },
  {
    icon: FileCheck2,
    title: 'Controlled Resume Uploads',
    description: 'Strict MIME-type validation and file size limits (up to 10MB) ensure only verified PDF and DOCX documents enter the processing pipeline.',
  },
  {
    icon: Cloud,
    title: 'Secure Storage Architecture',
    description: 'Isolated user collections with access tokens so your uploaded files and generated analysis remain tied strictly to your authenticated account.',
  },
];

const SecuritySection = () => {
  return (
    <section className="py-20 md:py-28 bg-slate-50 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-200/80 text-slate-800 text-xs font-semibold mb-4 border border-slate-300">
            <Lock className="w-3.5 h-3.5 text-slate-700" />
            <span>Built-In Security & Integrity</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
            Your Resume Is Personal. Treat It That Way.
          </h2>
          <p className="mt-4 text-base sm:text-lg text-slate-600 leading-relaxed">
            We adhere to rigorous technical safeguards across authentication, APIs, and file ingestion so your career data remains protected.
          </p>
        </div>

        {/* 4 Realistic Security Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {securityFeatures.map((item, index) => {
            const Icon = item.icon;
            return (
              <motion.div
                key={item.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.08, duration: 0.5 }}
                className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs hover:shadow-md transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="w-12 h-12 rounded-xl bg-slate-100 flex items-center justify-center text-slate-800 mb-5">
                    <Icon className="w-6 h-6 text-brand-indigo" />
                  </div>
                  <h3 className="text-lg font-bold text-slate-900 mb-2">
                    {item.title}
                  </h3>
                  <p className="text-sm text-slate-600 leading-relaxed">
                    {item.description}
                  </p>
                </div>

                <div className="mt-6 pt-4 border-t border-slate-100 flex items-center gap-1.5 text-xs font-semibold text-emerald-700">
                  <Check className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Production Safeguard</span>
                </div>
              </motion.div>
            );
          })}
        </div>

      </div>
    </section>
  );
};

export default SecuritySection;
