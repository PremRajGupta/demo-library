import { Link } from 'react-router-dom';
import AppLogo from '../AppLogo';
import type { LibraryInfo, NavMenuItem, PageText } from '../../data/landingContent';
import { motion } from 'framer-motion';
import { MapPin, Phone, Mail, ChevronRight } from 'lucide-react';

type LandingFooterProps = {
  libraryInfo: LibraryInfo;
  pageText: PageText;
  navMenuItems: NavMenuItem[];
  onNavigate: (sectionId: string) => void;
};

export default function LandingFooter({
  libraryInfo,
  pageText,
  navMenuItems,
  onNavigate,
}: LandingFooterProps) {
  const year = new Date().getFullYear();

  return (
    <footer className="relative bg-white dark:bg-[#020617] text-slate-600 dark:text-slate-400 overflow-hidden border-t border-slate-200 dark:border-slate-800/50 transition-colors duration-300">
      {/* Decorative Gradient Line at Top */}
      <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-blue-600 via-indigo-500 to-purple-600" />
      
      {/* Ambient background light */}
      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-1/2 w-[90vw] max-w-[800px] h-[45vw] max-h-[300px] bg-blue-100 dark:bg-blue-600/10 blur-[120px] pointer-events-none rounded-full transition-colors duration-300" />

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 mb-8">
          {/* Logo & About */}
          <div className="flex flex-col items-start lg:col-span-1">
            <div className="mb-6 flex items-center gap-3">
              <AppLogo size="md" showName={false} />
              <span className="text-slate-900 dark:text-white font-bold text-xl tracking-wide transition-colors">
                {libraryInfo.name}
              </span>
            </div>
            <p className="text-sm leading-relaxed max-w-xs">{libraryInfo.tagline}</p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-slate-900 dark:text-white font-bold mb-6 tracking-wide uppercase text-sm transition-colors">{pageText.footerQuickLinksTitle}</h4>
            <ul className="space-y-3 text-sm">
              {navMenuItems.map((link) => (
                <li key={link.id}>
                  <button
                    type="button"
                    onClick={() => onNavigate(link.sectionId)}
                    className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors flex items-center gap-2 group"
                  >
                    <ChevronRight size={14} className="text-slate-400 group-hover:text-blue-600 group-hover:translate-x-1 transition-all" />
                    {link.label}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h4 className="text-slate-900 dark:text-white font-bold mb-6 tracking-wide uppercase text-sm transition-colors">Contact Us</h4>
            <ul className="space-y-4 text-sm">
              <li className="flex items-start gap-3">
                <MapPin size={18} className="text-blue-600 dark:text-blue-400 shrink-0 mt-0.5" />
                <span className="leading-relaxed max-w-[200px]">{libraryInfo.address}</span>
              </li>
              <li className="flex items-center gap-3">
                <Phone size={18} className="text-blue-600 dark:text-blue-400 shrink-0" />
                <span>{libraryInfo.phone}</span>
              </li>
              <li className="flex items-center gap-3">
                <Mail size={18} className="text-blue-600 dark:text-blue-400 shrink-0" />
                <span>{libraryInfo.email}</span>
              </li>
            </ul>
          </div>

          {/* Admin Login */}
          <div>
            <h4 className="text-slate-900 dark:text-white font-bold mb-6 tracking-wide uppercase text-sm transition-colors">{pageText.footerGetStartedTitle}</h4>
            <p className="text-sm mb-6 leading-relaxed max-w-xs">{pageText.footerGetStartedText}</p>
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} className="inline-block">
              <Link
                to="/login"
                className="relative group px-8 py-3 bg-blue-600 text-white text-sm font-bold rounded-xl border border-transparent hover:bg-blue-700 transition-all shadow-[0_4px_14px_0_rgb(37,99,235,0.39)] flex items-center gap-2"
              >
                {pageText.footerLoginButton}
              </Link>
            </motion.div>
          </div>
        </div>

        <div className="pt-6 border-t border-slate-200 dark:border-slate-800 flex flex-col md:flex-row items-center justify-between gap-4 text-sm font-medium transition-colors">
          <p className="md:flex-1 text-center md:text-left">&copy; {year} {libraryInfo.name}. {pageText.footerCopyright}</p>
          <p className="md:flex-1 text-center font-bold text-blue-600 dark:text-blue-400">
            Developer By: Roy Prem - From Bihar
          </p>
          <div className="md:flex-1 flex justify-center md:justify-end gap-6">
            <Link to="/privacypolicy" className="hover:text-slate-600 dark:hover:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors">Privacy Policy</Link>
            <Link to="/termsofservice" className="hover:text-slate-600 dark:hover:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors">Terms of Service</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
