import { useEffect, useState } from 'react';
import { ArrowUp } from 'lucide-react';
import Navbar from '../components/landing/Navbar';
import HeroSection from '../components/landing/HeroSection';
import SocialProof from '../components/landing/SocialProof';
import ProblemSection from '../components/landing/ProblemSection';
import FeaturesGrid from '../components/landing/FeaturesGrid';
import HowItWorks from '../components/landing/HowItWorks';
import Footer from '../components/landing/Footer';

const LandingPage = () => {
  const [showScrollTop, setShowScrollTop] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setShowScrollTop(window.scrollY > 400);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-white text-slate-900 flex flex-col font-sans selection:bg-brand-indigo/20 selection:text-brand-indigo overflow-x-hidden">
      {/* Sticky Top Navbar */}
      <Navbar />

      {/* Main Landing Sections */}
      <main className="flex-1">
        <HeroSection />
        <SocialProof />
        <ProblemSection />
        <FeaturesGrid />
        <HowItWorks />
      </main>

      {/* Footer */}
      <Footer />

      {/* Floating Scroll-to-Top Button */}
      {showScrollTop && (
        <button
          type="button"
          onClick={scrollToTop}
          className="fixed bottom-6 right-6 z-40 p-3 rounded-full bg-white/90 backdrop-blur-md border border-slate-200 text-slate-700 hover:text-brand-indigo hover:border-brand-indigo/40 shadow-lg shadow-slate-300/50 hover:shadow-xl transition-all duration-200 active:scale-95"
          aria-label="Scroll back to top"
        >
          <ArrowUp className="w-5 h-5" />
        </button>
      )}
    </div>
  );
};

export default LandingPage;
