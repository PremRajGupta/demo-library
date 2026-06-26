import { useCallback, useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import LandingNavbar from '../components/landing/LandingNavbar';
import HeroSlider from '../components/landing/HeroSlider';
import StatsSection from '../components/landing/StatsSection';
import GallerySection from '../components/landing/GallerySection';
import ComputerClassCTA from '../components/landing/ComputerClassCTA';
import OfferBanner from '../components/landing/OfferBanner';
import FacultySection from '../components/landing/FacultySection';
import ContactSection from '../components/landing/ContactSection';
import LandingFooter from '../components/landing/LandingFooter';
import ChatBot from '../components/ChatBot';
import { SEOMeta } from '../components/SEOMeta';
import { DEFAULT_SITE_CONTENT, type SiteContent } from '../data/landingContent';
import { loadSiteContent, getStoredSiteContent, SITE_CONTENT_UPDATED_EVENT } from '../lib/siteContentService';

export default function Index() {
  const location = useLocation();
  const navigate = useNavigate();
  const [content, setContent] = useState<SiteContent>(DEFAULT_SITE_CONTENT);
  const [loading, setLoading] = useState(true);
  const [apiOffline, setApiOffline] = useState(false);

  const refreshContent = useCallback(async () => {
    const { content: data, fromApi } = await loadSiteContent();
    setContent(data);
    setApiOffline(!fromApi);
  }, []);

  useEffect(() => {
    refreshContent().finally(() => setLoading(false));
  }, [location, refreshContent]);

  useEffect(() => {
    const onUpdated = () => {
      const stored = getStoredSiteContent();
      if (stored) {
        setContent(stored);
      }
    };

    window.addEventListener(SITE_CONTENT_UPDATED_EVENT, onUpdated);
    window.addEventListener('focus', onUpdated);
    document.addEventListener('visibilitychange', () => {
      if (document.visibilityState === 'visible') {
        onUpdated();
      }
    });

    return () => {
      window.removeEventListener(SITE_CONTENT_UPDATED_EVENT, onUpdated);
      window.removeEventListener('focus', onUpdated);
    };
  }, [refreshContent]);

  useEffect(() => {
    if (!loading && location.state && (location.state as any).scrollToSection) {
      const sectionId = (location.state as any).scrollToSection;
      
      const timer = setTimeout(() => {
        const element = document.getElementById(sectionId);
        if (element) {
          element.scrollIntoView({ behavior: 'smooth', block: 'start' });
        } else if (sectionId === 'home') {
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }
      }, 100);

      navigate('/', { replace: true, state: {} });

      return () => clearTimeout(timer);
    }
  }, [loading, location, navigate]);

  const scrollTo = (sectionId: string) => {
    if (sectionId.startsWith('/')) {
      navigate(sectionId);
      return;
    }
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    } else if (sectionId === 'home') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white dark:bg-[#040814] transition-colors duration-300">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 shadow-[0_0_15px_rgba(59,130,246,0.5)]" />
      </div>
    );
  }

  const { libraryInfo, admissionContact, pageText, navMenuItems, heroSlides, aboutContent, galleryImages, facultyMembers } = content;

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#040814] text-slate-800 dark:text-slate-300 font-sans selection:bg-blue-500/30 transition-colors duration-300">
      <SEOMeta
        title="Demo Library Tehta | Education Hub in Tehta, Jehanabad"
        description="Demo Library Tehta is the leading educational institute and education hub in Tehta, Jehanabad. Explore Galaxy Computer Center for premium education and digital skills."
        keywords="demo library tehta,demo library jehanabad, galaxy education hub tehta, galaxy educaion hub tehta, education hub in tehta, galaxy computer center tehta, computer center tehta, galaxy computer center jehanabad, educational institute tehta"
        ogUrl="https://galaxyhub.in/"
        canonical="https://galaxyhub.in/"
      />
      
      {apiOffline && (
        <div className="bg-amber-500/10 border-b border-amber-500/30 text-amber-600 dark:text-amber-400 text-center text-sm px-4 py-2 backdrop-blur-md">
          Server offline — showing saved/default content. Start backend on port 5000, then refresh.
        </div>
      )}

      <LandingNavbar
        libraryInfo={libraryInfo}
        pageText={pageText}
        navMenuItems={navMenuItems}
        onNavigate={scrollTo}
        announcement={content.announcement}
      />

      <HeroSlider
        slides={heroSlides}
      />

      <section id="about" className="relative py-24 overflow-hidden bg-white dark:bg-transparent transition-colors duration-300">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-blue-100 dark:bg-blue-600/10 rounded-full blur-[120px] pointer-events-none transition-colors duration-300" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-purple-100 dark:bg-purple-600/10 rounded-full blur-[120px] pointer-events-none transition-colors duration-300" />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.8 }}
            className="max-w-3xl mx-auto text-center mb-16"
          >
            <h2 className="text-3xl sm:text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600 dark:from-blue-400 dark:to-purple-500 mb-6 pb-2 transition-all">
              {aboutContent.title}
            </h2>
            {aboutContent.paragraphs.map((paragraph, idx) => (
              <p key={idx} className="text-slate-600 dark:text-slate-400 leading-relaxed mb-4 text-lg transition-colors">
                {paragraph}
              </p>
            ))}
          </motion.div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-8">
            {aboutContent.highlights.map((item, index) => (
              <motion.div
                key={`${item.label}-${item.value}`}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                whileHover={{ y: -5, scale: 1.02 }}
                className="group relative p-1 rounded-2xl bg-gradient-to-b from-slate-200 to-slate-100 hover:from-blue-200 hover:to-purple-200 dark:from-slate-800 dark:to-slate-900/50 dark:hover:from-blue-500/50 dark:hover:to-purple-500/50 transition-all duration-500"
              >
                <div className="h-full w-full bg-white dark:bg-[#0a0f1e] rounded-xl p-3 sm:p-5 md:p-6 text-center border border-slate-100 dark:border-slate-800 group-hover:border-transparent transition-all duration-500 flex flex-col justify-center items-center shadow-md hover:shadow-lg dark:shadow-lg dark:group-hover:shadow-[0_0_30px_rgba(59,130,246,0.3)]">
                  <p className="text-xl sm:text-2xl md:text-3xl lg:text-2xl xl:text-3xl font-black text-transparent bg-clip-text bg-gradient-to-br from-blue-600 to-cyan-500 dark:from-blue-400 dark:to-cyan-300 mb-1 sm:mb-2 drop-shadow-sm dark:drop-shadow-md transition-all">
                    {item.value}
                  </p>
                  <p className="text-xs sm:text-sm font-medium text-slate-500 dark:text-slate-400 tracking-wide uppercase group-hover:text-slate-700 dark:group-hover:text-slate-300 transition-colors">
                    {item.label}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <StatsSection pageText={pageText} />
      <ComputerClassCTA />
      <GallerySection images={galleryImages} pageText={pageText} />
      
      {content.announcement?.show && content.announcement?.text && (
        <OfferBanner announcement={content.announcement} onNavigate={scrollTo} />
      )}
      
      <FacultySection members={facultyMembers} pageText={pageText} />
      <ContactSection libraryInfo={libraryInfo} admissionContact={admissionContact} pageText={pageText} />
      
      <LandingFooter
        libraryInfo={libraryInfo}
        pageText={pageText}
        navMenuItems={navMenuItems}
        onNavigate={scrollTo}
      />
      <ChatBot />
    </div>
  );
}
