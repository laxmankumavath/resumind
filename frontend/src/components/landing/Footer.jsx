import { Link } from 'react-router-dom';
import { ArrowUp } from 'lucide-react';

const Footer = () => {
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSmoothScroll = (e, targetId) => {
    e.preventDefault();
    const element = document.querySelector(targetId);
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
    <footer className="bg-white border-t border-slate-200/80 pt-16 pb-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 lg:gap-8 pb-12 border-b border-slate-200">
          
          {/* Col 1 & 2: Brand & Description */}
          <div className="lg:col-span-2 space-y-4">
            <Link
              to="/"
              className="flex items-center text-2xl font-extrabold text-slate-900 tracking-tight"
            >
              <span>
                Resu<span className="text-brand-indigo">Mind</span>
              </span>
            </Link>

            <p className="text-sm text-slate-600 max-w-sm leading-relaxed">
              AI-powered resume intelligence for modern job seekers. Analyze, improve and match your experience with real job requirements.
            </p>

            <div className="flex items-center gap-3 pt-2 text-slate-400">
              <span className="text-xs text-slate-500">
                Building career confidence since 2026.
              </span>
            </div>
          </div>

          {/* Col 3: Product */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900 mb-4">
              Product
            </h4>
            <ul className="space-y-2.5 text-sm text-slate-600">
              <li>
                <a
                  href="#features"
                  onClick={(e) => handleSmoothScroll(e, '#features')}
                  className="hover:text-brand-indigo transition-colors"
                >
                  Features
                </a>
              </li>
              <li>
                <a
                  href="#how-it-works"
                  onClick={(e) => handleSmoothScroll(e, '#how-it-works')}
                  className="hover:text-brand-indigo transition-colors"
                >
                  How It Works
                </a>
              </li>
            </ul>
          </div>

          {/* Col 4: Company / Resources */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900 mb-4">
              Company
            </h4>
            <ul className="space-y-2.5 text-sm text-slate-600">
              <li>
                <span className="hover:text-brand-indigo cursor-pointer transition-colors">
                  About Us
                </span>
              </li>
              <li>
                <span className="hover:text-brand-indigo cursor-pointer transition-colors">
                  Contact
                </span>
              </li>
              <li>
                <span className="hover:text-brand-indigo cursor-pointer transition-colors">
                  Privacy Policy
                </span>
              </li>
              <li>
                <span className="hover:text-brand-indigo cursor-pointer transition-colors">
                  Terms of Service
                </span>
              </li>
            </ul>
          </div>

          {/* Col 5: Account & Actions */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900 mb-4">
              Account
            </h4>
            <ul className="space-y-2.5 text-sm text-slate-600">
              <li>
                <Link to="/login" className="hover:text-brand-indigo transition-colors">
                  Log In
                </Link>
              </li>
              <li>
                <Link to="/register" className="hover:text-brand-indigo transition-colors">
                  Create Account
                </Link>
              </li>
              <li>
                <Link to="/dashboard" className="hover:text-brand-indigo transition-colors">
                  Dashboard
                </Link>
              </li>
              <li>
                <Link to="/dashboard/upload" className="hover:text-brand-indigo transition-colors">
                  Upload Resume
                </Link>
              </li>
            </ul>
          </div>

        </div>

        {/* Bottom Bar with Copyright & Back to top */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <p>© 2026 Resumind. All rights reserved.</p>

          <button
            type="button"
            onClick={scrollToTop}
            className="flex items-center gap-1.5 text-slate-600 hover:text-brand-indigo font-semibold transition-colors"
          >
            <span>Back to top</span>
            <ArrowUp className="w-3.5 h-3.5" />
          </button>
        </div>

      </div>
    </footer>
  );
};

export default Footer;
