import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Menu, X, Sun, Moon } from "lucide-react";
import AppLogo from "../AppLogo";
import type {
  LibraryInfo,
  NavMenuItem,
  PageText,
  Announcement,
} from "../../data/landingContent";
import { motion, AnimatePresence } from "framer-motion";

type LandingNavbarProps = {
  libraryInfo: LibraryInfo;
  pageText: PageText;
  navMenuItems: NavMenuItem[];
  onNavigate: (sectionId: string) => void;
  announcement?: Announcement;
};

export default function LandingNavbar({
  libraryInfo,
  pageText,
  navMenuItems,
  onNavigate,
  announcement,
}: LandingNavbarProps) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [isDark, setIsDark] = useState(true); // Default to dark as per premium theme

  useEffect(() => {
    // Initialize theme
    const storedTheme = localStorage.getItem("theme");
    const prefersDark = window.matchMedia(
      "(prefers-color-scheme: dark)",
    ).matches;

    if (
      storedTheme === "dark" ||
      (!storedTheme && prefersDark) ||
      !storedTheme
    ) {
      document.documentElement.classList.add("dark");
      setIsDark(true);
    } else {
      document.documentElement.classList.remove("dark");
      setIsDark(false);
    }

    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const toggleTheme = () => {
    if (isDark) {
      document.documentElement.classList.remove("dark");
      localStorage.setItem("theme", "light");
      setIsDark(false);
    } else {
      document.documentElement.classList.add("dark");
      localStorage.setItem("theme", "dark");
      setIsDark(true);
    }
  };

  const handleNav = (sectionId: string) => {
    onNavigate(sectionId);
    setMenuOpen(false);
  };

  const isOfferActive =
    announcement?.show &&
    announcement?.text &&
    announcement?.endDate &&
    new Date(announcement.endDate).getTime() > Date.now();

  return (
    <header
      id="main-landing-navbar"
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 bg-white/95 dark:bg-[#020617]/95 backdrop-blur-xl border-b border-slate-200 dark:border-white/10 py-2 ${scrolled ? "shadow-lg dark:shadow-black/60" : "shadow-sm dark:shadow-black/40"}`}
    >
      {isOfferActive && (
        <div className="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 text-white py-2 px-4 text-center text-xs sm:text-sm font-medium select-none flex items-center justify-center gap-2 border-b border-white/10 shadow-inner">
          <span className="tracking-wide">✨ {announcement.text}</span>
          {announcement.link && (
            <Link
              to={announcement.link}
              className="underline hover:text-blue-200 transition-colors inline-flex items-center font-bold ml-1"
            >
              Learn More →
            </Link>
          )}
        </div>
      )}

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <button
            type="button"
            onClick={() => handleNav("home")}
            className="flex items-center gap-3 text-slate-800 dark:text-white group"
          >
            <AppLogo
              size="md"
              showName={false}
              className="group-hover:scale-105 transition-transform"
            />
            <span className="text-slate-800 dark:text-white font-bold text-xl hidden sm:block tracking-wide transition-colors">
              {libraryInfo.name}
            </span>
          </button>

          <nav className="hidden lg:flex items-center gap-2 lg:gap-4 bg-slate-100/50 dark:bg-white/5 rounded-full px-2 py-1.5 border border-slate-200 dark:border-white/10 backdrop-blur-md transition-colors">
            {navMenuItems.map((link) => (
              <button
                key={link.id}
                type="button"
                onClick={() => handleNav(link.sectionId)}
                className="px-4 py-2 text-sm font-semibold text-slate-600 dark:text-slate-300 hover:text-blue-600 dark:hover:text-white hover:bg-white dark:hover:bg-white/10 rounded-full transition-all"
              >
                {link.label}
              </button>
            ))}
          </nav>

          <div className="hidden lg:flex items-center gap-4">
            <button
              onClick={toggleTheme}
              className="p-2 rounded-full bg-slate-100 dark:bg-white/10 text-slate-600 dark:text-white hover:bg-slate-200 dark:hover:bg-white/20 transition-all border border-slate-200 dark:border-white/10"
              aria-label="Toggle Dark Mode"
            >
              {isDark ? <Sun size={18} /> : <Moon size={18} />}
            </button>

            <Link
              to="/login"
              className="relative group px-6 py-2.5 bg-blue-600 text-white text-sm font-bold rounded-full overflow-hidden shadow-[0_0_15px_rgba(37,99,235,0.4)] transition-all hover:scale-105"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-cyan-400 to-blue-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              <span className="relative z-10">{pageText.navLogin}</span>
            </Link>
          </div>

          <div className="lg:hidden flex items-center gap-3">
            <button
              onClick={toggleTheme}
              className="p-2 rounded-full bg-slate-100 dark:bg-white/10 text-slate-600 dark:text-white transition-all border border-slate-200 dark:border-white/10"
            >
              {isDark ? <Sun size={18} /> : <Moon size={18} />}
            </button>
            <button
              type="button"
              className="p-2 text-slate-800 dark:text-white bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-lg transition-colors"
              onClick={() => setMenuOpen(!menuOpen)}
              aria-label="Toggle menu"
            >
              {menuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
      </div>

      <AnimatePresence>
        {menuOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="lg:hidden overflow-hidden bg-white/95 dark:bg-[#020617]/95 backdrop-blur-xl border-t border-slate-200 dark:border-white/10 px-4 py-4 space-y-2 transition-colors"
          >
            {navMenuItems.map((link) => (
              <button
                key={link.id}
                type="button"
                onClick={() => handleNav(link.sectionId)}
                className="block w-full text-left px-4 py-3 text-slate-600 dark:text-slate-300 font-medium hover:text-blue-600 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-white/10 rounded-xl transition-colors"
              >
                {link.label}
              </button>
            ))}
            <Link
              to="/login"
              onClick={() => setMenuOpen(false)}
              className="block w-full text-center mt-4 px-4 py-3 bg-gradient-to-r from-blue-600 to-cyan-500 text-white font-bold rounded-xl transition-colors shadow-lg"
            >
              {pageText.navLogin}
            </Link>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
