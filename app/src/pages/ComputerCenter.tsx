import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Monitor, Cpu, Code, BookOpen, Clock, Award, ArrowRight, IndianRupee, Sparkles, ChevronRight, Menu, X, GraduationCap, Presentation, Library } from 'lucide-react';
import LandingNavbar from '../components/landing/LandingNavbar';
import LandingFooter from '../components/landing/LandingFooter';
import FacultySection from '../components/landing/FacultySection';
import ChatBot from '../components/ChatBot';
import { SEOMeta } from '../components/SEOMeta';
import { DEFAULT_SITE_CONTENT, type SiteContent } from '../data/landingContent';
import { loadSiteContent, getStoredSiteContent, SITE_CONTENT_UPDATED_EVENT } from '../lib/siteContentService';

const TYPEWRITER_WORDS = [
  "Start Your Professional Career",
  "Learn Programming & Coding",
  "Master Advanced Tech Skills"
];

const Typewriter = ({ words }: { words: string[] }) => {
  const [currentWordIndex, setCurrentWordIndex] = useState(0);
  const [currentText, setCurrentText] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    const word = words[currentWordIndex];
    let typingSpeed = isDeleting ? 30 : 80;
    
    if (!isDeleting && currentText === word) {
      typingSpeed = 2500; // Pause at end of word
      const timeout = setTimeout(() => setIsDeleting(true), typingSpeed);
      return () => clearTimeout(timeout);
    } else if (isDeleting && currentText === '') {
      setIsDeleting(false);
      setCurrentWordIndex((prev) => (prev + 1) % words.length);
      return;
    }

    const timeout = setTimeout(() => {
      setCurrentText(word.substring(0, currentText.length + (isDeleting ? -1 : 1)));
    }, typingSpeed);

    return () => clearTimeout(timeout);
  }, [currentText, isDeleting, currentWordIndex, words]);

  return (
    <span className="inline-block">
      {currentText}
      <span className="animate-pulse border-r-2 border-white ml-1 pr-1">&nbsp;</span>
    </span>
  );
};

export default function ComputerCenter() {
  const navigate = useNavigate();
  const [isSecondaryMenuOpen, setIsSecondaryMenuOpen] = useState(false);
  const [content, setContent] = useState<SiteContent>(DEFAULT_SITE_CONTENT);
  const [navHeight, setNavHeight] = useState(72);

  useEffect(() => {
    const updateNavHeight = () => {
      const mainNav = document.getElementById('main-landing-navbar');
      if (mainNav) {
        setNavHeight(mainNav.getBoundingClientRect().height);
      }
    };
    updateNavHeight();
    window.addEventListener('resize', updateNavHeight);
    
    // Also run occasionally in case the announcement loads later
    const interval = setInterval(updateNavHeight, 1000);
    
    return () => {
      window.removeEventListener('resize', updateNavHeight);
      clearInterval(interval);
    };
  }, []);

  const handleScrollToSection = (e: React.MouseEvent, id: string) => {
    e.preventDefault();
    setIsSecondaryMenuOpen(false);
    setTimeout(() => {
      const element = document.getElementById(id);
      if (element) {
        // navHeight is main navbar, plus ~60px for the secondary navbar
        const y = element.getBoundingClientRect().top + window.scrollY - navHeight - 60;
        window.scrollTo({ top: y, behavior: 'smooth' });
      }
    }, 150);
  };

  const NavLinks = () => (
    <>
      <a href="#" className="flex items-center px-4 py-3 lg:py-2 text-[#ff5c5c] hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-xl lg:rounded-full transition-all whitespace-nowrap">Home</a>
      <a 
        href="#about-us" 
        onClick={(e) => handleScrollToSection(e, 'about-us')}
        className="flex items-center px-4 py-3 lg:py-2 text-slate-700 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-500/10 rounded-xl lg:rounded-full transition-all whitespace-nowrap"
      >
        About Us
      </a>
      <a 
        href="#faculty" 
        onClick={(e) => handleScrollToSection(e, 'faculty')}
        className="flex items-center px-4 py-3 lg:py-2 text-slate-700 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-500/10 rounded-xl lg:rounded-full transition-all whitespace-nowrap"
      >
        Teachers
      </a>
      {/* <a href="#" className="flex items-center px-4 py-3 lg:py-2 text-[#ff5c5c] hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-xl lg:rounded-full transition-all whitespace-nowrap">Franchise</a> */}
      <a 
        href="#courses-section"
        onClick={(e) => handleScrollToSection(e, 'courses-section')}
        className="flex items-center px-4 py-3 lg:py-2 text-slate-700 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-500/10 rounded-xl lg:rounded-full transition-all whitespace-nowrap"
      >
        Courses
      </a>
      {/* <a href="#" className="flex items-center px-4 py-3 lg:py-2 text-slate-700 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-500/10 rounded-xl lg:rounded-full transition-all whitespace-nowrap">State Partner</a> */}
      
      <div 
        onClick={() => {
          navigate('/computercenter/registration');
          setIsSecondaryMenuOpen(false);
        }}
        className="group cursor-pointer flex items-center justify-between lg:justify-start px-4 py-3 lg:py-2 text-slate-700 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-500/10 rounded-xl lg:rounded-full transition-all whitespace-nowrap gap-1"
      >
        <span>Registration</span> 
      </div>
      
      <div className="group cursor-pointer flex items-center justify-between lg:justify-start px-4 py-3 lg:py-2 text-slate-700 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-500/10 rounded-xl lg:rounded-full transition-all whitespace-nowrap gap-1">
        <span>Certifications</span> 
      </div>
      
      <a 
        href="https://trickfastdigital.com/student-verification.php"
        target="_blank"
        rel="noopener noreferrer"
        className="group cursor-pointer flex items-center justify-between lg:justify-start px-4 py-3 lg:py-2 text-slate-700 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-500/10 rounded-xl lg:rounded-full transition-all whitespace-nowrap gap-1"
      >
        <span>Verification</span>
      </a>

      {/* <div className="group cursor-pointer flex items-center justify-between lg:justify-start px-4 py-3 lg:py-2 text-slate-700 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-500/10 rounded-xl lg:rounded-full transition-all whitespace-nowrap gap-1">
        <span>Our Projects</span> 
      </div> */}
      
      {/* <div className="group cursor-pointer flex items-center justify-between lg:justify-start px-4 py-3 lg:py-2 text-slate-700 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-500/10 rounded-xl lg:rounded-full transition-all whitespace-nowrap gap-1">
        <span>Gallery</span> 
      </div> */}

      {/* <a href="#" className="flex items-center px-4 py-3 lg:py-2 text-slate-700 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-500/10 rounded-xl lg:rounded-full transition-all whitespace-nowrap">Blog</a> */}
    </>
  );

  useEffect(() => {
    window.scrollTo(0, 0);
    loadSiteContent().then(({ content }) => setContent(content));

    const onUpdate = () => {
      const stored = getStoredSiteContent();
      if (stored) setContent(stored);
    };
    window.addEventListener(SITE_CONTENT_UPDATED_EVENT, onUpdate);
    return () => window.removeEventListener(SITE_CONTENT_UPDATED_EVENT, onUpdate);
  }, []);

  const handleNavigate = (sectionId: string) => {
    navigate('/', { state: { scrollToSection: sectionId } });
  };

  const { libraryInfo, pageText, navMenuItems, computerCourses } = content;
  const courses = computerCourses || DEFAULT_SITE_CONTENT.computerCourses || [];
  const computerCenterInfo = { ...libraryInfo, name: 'Galaxy Computer Center' };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#040814] text-slate-800 dark:text-slate-300 font-sans selection:bg-blue-500/30 transition-colors duration-300 flex flex-col">
      <SEOMeta
        title="Galaxy Computer Center Tehta | Education Hub in Tehta, Jehanabad"
        description="Join Galaxy Computer Center Tehta, the top educational hub in Jehanabad. Master programming, digital skills, and advance your career at Demo Library Tehta."
        keywords="galaxy computer center tehta, computer center tehta, galaxy computer center jehanabad, education hub in tehta, galaxy educaion hub tehta, galaxy education hub tehta, demo library tehta, programming courses"
        ogUrl="https://galaxyhub.in/computercenter"
        canonical="https://galaxyhub.in/computercenter"
      />

      <LandingNavbar
        libraryInfo={computerCenterInfo}
        pageText={pageText}
        navMenuItems={navMenuItems}
        onNavigate={handleNavigate}
      />

      <main className="flex-grow w-full relative">
        {/* SECONDARY NAVIGATION BAR */}
        <div 
          className="w-full sticky z-40 bg-white/95 dark:bg-[#0f172a]/95 backdrop-blur-xl border-y border-slate-200 dark:border-slate-800 shadow-md"
          style={{ top: `${navHeight}px`, marginTop: `${navHeight}px` }}
        >
          <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8">
            
            {/* Mobile Toggle Button */}
            <div className="lg:hidden flex items-center justify-between py-3">
              <span className="font-bold text-slate-800 dark:text-slate-200">Quick Links</span>
              <button 
                onClick={() => setIsSecondaryMenuOpen(!isSecondaryMenuOpen)}
                className="p-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
              >
                {isSecondaryMenuOpen ? <X size={20} /> : <Menu size={20} />}
              </button>
            </div>

            {/* Desktop Nav */}
            <div className="hidden lg:flex items-center justify-center py-2.5">
              <nav className="flex items-center gap-1 sm:gap-2 text-[14px] font-semibold min-w-max">
                <NavLinks />
              </nav>
            </div>

            {/* Mobile Nav Dropdown */}
            <AnimatePresence>
              {isSecondaryMenuOpen && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="lg:hidden overflow-hidden"
                >
                  <nav className="flex flex-col gap-1 text-[14px] font-semibold pb-4 pt-1">
                    <NavLinks />
                  </nav>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* HERO SECTION */}
        <section className="relative w-full min-h-[calc(100vh-140px)] flex flex-col justify-start overflow-hidden bg-slate-900">
          {/* Background Image & Overlay */}
          <div className="absolute inset-0 z-0">
            <img 
              src="https://images.unsplash.com/photo-1620712943543-bcc4688e7485?q=80&w=1965&auto=format&fit=crop" 
              alt="Cyber Background" 
              className="w-full h-full object-cover opacity-60 mix-blend-luminosity"
            />
            {/* Deep gradient overlay to make text readable */}
            <div className="absolute inset-0 bg-gradient-to-r from-[#020617] via-[#020617]/80 to-transparent"></div>
            <div className="absolute inset-0 bg-gradient-to-t from-[#020617] via-transparent to-transparent"></div>
          </div>

          <div className="flex-grow flex items-center justify-start w-full relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-20">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              className="max-w-3xl"
            >
              {/* Badge */}
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-900/50 border border-slate-700/50 text-blue-400 font-semibold text-sm mb-6 backdrop-blur-md">
                <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse"></span>
                Trusted IT Training Institute
              </div>
              
              {/* Typing Headline */}
              <h1 className="text-4xl sm:text-5xl lg:text-5xl font-extrabold text-white mb-4 leading-[1.2] tracking-tight drop-shadow-md min-h-[120px] sm:min-h-[80px] flex items-center">
                <Typewriter words={TYPEWRITER_WORDS} />
              </h1>
              
              {/* Subtext */}
              <p className="text-lg sm:text-xl lg:text-2xl text-slate-300/90 mb-10 max-w-2xl leading-relaxed font-medium">
                At Galaxy Computer Center, we empower students with in-demand digital skills to build a successful, career-ready future.
              </p>
              
              {/* Buttons */}
              <div className="flex flex-wrap items-center gap-5">
                <button 
                  type="button"
                  onClick={() => window.scrollTo({ top: 800, behavior: 'smooth' })}
                  className="px-8 py-4 rounded-full bg-gradient-to-r from-red-600 via-red-500 to-orange-500 hover:from-red-500 hover:to-orange-400 text-white font-bold text-lg transition-all shadow-[0_0_20px_rgba(239,68,68,0.4)] hover:shadow-[0_0_30px_rgba(239,68,68,0.6)] flex items-center gap-2 group tracking-wide"
                >
                  Explore Courses
                  <ArrowRight size={22} className="group-hover:translate-x-1.5 transition-transform" />
                </button>
                <a 
                  href={`https://wa.me/${libraryInfo.phoneRaw}?text=Hi! I want to get admission in Galaxy Computer Center.`}
                  target="_blank"
                  rel="noreferrer"
                  className="px-8 py-4 rounded-full bg-transparent border-2 border-white/70 text-white hover:bg-white hover:text-slate-900 font-bold text-lg transition-all backdrop-blur-sm tracking-wide"
                >
                  Get Admission
                </a>
              </div>
            </motion.div>
          </div>
        </section>

        {/* ABOUT SECTION */}
        <section id="about-us" className="relative w-full py-12 lg:py-16 overflow-hidden bg-[#fcfdfa] dark:bg-[#020617] scroll-mt-24">
          {/* Background Shapes */}
          <div className="absolute top-0 -left-48 w-[45%] h-full bg-[#0cb8a6] -skew-x-[20deg] z-0 hidden lg:block"></div>
          <div className="absolute top-1/2 left-4 sm:left-20 lg:left-32 transform -translate-y-1/2 w-[280px] h-[280px] sm:w-[350px] sm:h-[350px] lg:w-[480px] lg:h-[480px] rounded-full bg-[#effacc] dark:bg-[#effacc]/10 z-0"></div>

          <div className="relative z-10 max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col lg:flex-row items-center gap-8 lg:gap-16">
              
              {/* Image Side */}
              <div className="w-full lg:w-1/2 flex justify-center lg:justify-start">
                <img 
                  src="https://images.unsplash.com/photo-1544717302-de2939b7ef71?q=80&w=1000&auto=format&fit=crop" 
                  alt="Student smiling" 
                  className="relative z-10 max-h-[350px] lg:max-h-[500px] object-contain drop-shadow-2xl"
                />
              </div>

              {/* Text Side */}
              <div className="w-full lg:w-1/2 flex flex-col items-start text-left bg-white/60 dark:bg-slate-900/60 lg:bg-transparent backdrop-blur-md lg:backdrop-blur-none p-5 lg:p-0 rounded-3xl mt-6 lg:mt-0">
                <h3 className="text-[#ff5c5c] font-bold tracking-[0.2em] text-xs sm:text-sm uppercase mb-4">
                  About Our Galaxy Computer Center
                </h3>
                
                <p className="text-slate-600 dark:text-slate-300 text-sm sm:text-base leading-relaxed mb-8 max-w-2xl">
                  Galaxy Computer Center is a renowned company that specializes in providing franchise opportunities to computer institutes and skill development course providers. With a strong focus on education and training, Galaxy Computer Center offers comprehensive courses that cover a wide range of topics in the field of computer science and skill development.
                </p>

                <div className="flex flex-col gap-5 w-full">
                  {/* Feature 1 */}
                  <div className="flex items-center gap-4 group">
                    <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-full bg-[#ffe898] dark:bg-yellow-500/20 flex items-center justify-center shrink-0 shadow-sm group-hover:scale-110 transition-transform">
                      <GraduationCap className="text-yellow-800 dark:text-yellow-500 w-6 h-6 sm:w-8 sm:h-8" />
                    </div>
                    <span className="text-lg sm:text-xl font-bold text-slate-800 dark:text-slate-200">Scholarship Facility</span>
                  </div>

                  {/* Feature 2 */}
                  <div className="flex items-center gap-4 group">
                    <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-full bg-[#ffd4d4] dark:bg-red-500/20 flex items-center justify-center shrink-0 shadow-sm group-hover:scale-110 transition-transform">
                      <Presentation className="text-red-800 dark:text-red-500 w-6 h-6 sm:w-8 sm:h-8" />
                    </div>
                    <span className="text-lg sm:text-xl font-bold text-slate-800 dark:text-slate-200">Skilled Lecturers</span>
                  </div>

                  {/* Feature 3 */}
                  <div className="flex items-center gap-4 group">
                    <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-full bg-[#d4f2ff] dark:bg-blue-500/20 flex items-center justify-center shrink-0 shadow-sm group-hover:scale-110 transition-transform">
                      <Library className="text-blue-800 dark:text-blue-500 w-6 h-6 sm:w-8 sm:h-8" />
                    </div>
                    <span className="text-lg sm:text-xl font-bold text-slate-800 dark:text-slate-200">Book Library & Store</span>
                  </div>
                </div>

              </div>
            </div>
          </div>
        </section>

        {/* TOP COURSES SECTION */}
        <section id="courses-section" className="px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto py-20 relative z-10 bg-slate-50 dark:bg-[#040814]">
          <div className="text-center mb-12 flex flex-col items-center">
            <h2 className="text-3xl sm:text-4xl font-extrabold text-[#1e293b] dark:text-white flex items-center justify-center gap-3">
              <Sparkles className="text-yellow-500 fill-yellow-500 w-8 h-8" />
              Our Top Courses
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {courses.slice(0, 4).map((course, index) => (
              <motion.div 
                key={course.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{ duration: 0.4, delay: index * 0.1 }}
                className="bg-white dark:bg-[#0f172a] rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300 border border-slate-100 dark:border-slate-800 overflow-hidden flex flex-col"
              >
                {/* Course Banner / Thumbnail */}
                <div className={`h-40 relative flex flex-col items-center justify-center p-4 text-center border-b-[3px] border-yellow-400 overflow-hidden group`}>
                  {/* Background image */}
                  <img src={course.image} alt={course.title} className="absolute inset-0 w-full h-full object-cover z-0 group-hover:scale-110 transition-transform duration-700" />
                  {/* Dark overlay for readability */}
                  <div className={`absolute inset-0 bg-gradient-to-br ${course.color} opacity-80 z-0 group-hover:opacity-70 transition-opacity duration-300`}></div>
                  
                  <h3 className="text-4xl sm:text-5xl font-black text-white drop-shadow-md z-10 uppercase tracking-tight">
                    {course.title === 'Tally With Gst' ? 'TALLY' : course.title === 'Computer Networking' ? 'NETWORK' : course.title === 'C Programming' ? 'C PROG' : course.title}
                  </h3>
                  <p className="text-[10px] font-bold text-yellow-400 tracking-widest z-10 mt-1 uppercase">
                    {course.fullName}
                  </p>
                  
                  <div className="absolute bottom-2 left-2 bg-yellow-400 text-slate-900 text-[9px] font-black px-2 py-0.5 rounded-sm z-10 flex items-center gap-0.5 shadow-sm transform transition-transform group-hover:scale-105">
                    ENROLL NOW <ChevronRight size={10} strokeWidth={4} />
                  </div>
                </div>

                {/* Course Details */}
                <div className="p-5 flex flex-col items-center flex-grow text-center">
                  <h4 className="text-[17px] font-bold text-slate-800 dark:text-white mb-3">
                    {course.title}
                  </h4>
                  
                  <div className="flex flex-col items-center gap-1 text-[13px] font-medium text-slate-500 dark:text-slate-400 mb-5 w-full">
                    <div className="flex items-center gap-1.5 justify-center">
                      <Clock size={14} className="text-blue-600 dark:text-blue-400" />
                      <span>Duration: {course.duration}</span>
                    </div>
                    <div className="flex items-center gap-1.5 justify-center">
                      <IndianRupee size={14} className="text-green-600 dark:text-green-400" />
                      <span>Fee: ₹{course.fee}</span>
                    </div>
                  </div>
                  
                  <button className="mt-auto px-6 py-2.5 bg-[#4f46e5] hover:bg-[#4338ca] text-white text-sm font-bold rounded-full transition-all shadow-md shadow-indigo-500/20 w-full max-w-[160px] hover:-translate-y-0.5">
                    View Details
                  </button>
                </div>
              </motion.div>
            ))}
          </div>

          <div className="mt-12 text-center">
            <button 
              onClick={() => navigate('/computercenter/courses')}
              className="px-8 py-3.5 bg-[#3b82f6] hover:bg-[#2563eb] text-white font-bold rounded-full shadow-lg shadow-blue-500/30 transition-all hover:-translate-y-1 hover:shadow-blue-500/40 text-sm tracking-wide"
            >
              Show All Courses
            </button>
          </div>
        </section>

        {/* FEATURES GRID SECTION */}
        <section className="px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto py-24 relative z-10">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white mb-4">
              Why Choose Galaxy?
            </h2>
            <p className="text-lg text-slate-600 dark:text-slate-400">
              We provide the best environment and expert syllabus for practical, job-oriented learning.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-20">
            {[
              { icon: Monitor, title: 'Basic Computer Skills', desc: 'Master fundamentals like MS Office, internet browsing, and everyday computing.' },
              { icon: Code, title: 'Programming & Web Dev', desc: 'Learn to code and build modern websites and software applications.' },
              { icon: Cpu, title: 'Advanced Tech Courses', desc: 'Explore advanced topics to stay ahead in the digital world.' },
              { icon: BookOpen, title: 'Expert Syllabus', desc: 'Curriculum designed by industry experts for real-world applications.' },
              { icon: Clock, title: 'Flexible Batches', desc: 'Choose a batch timing that perfectly fits your schedule.' },
              { icon: Award, title: 'Certification', desc: 'Get certified upon course completion to boost your career prospects.' }
            ].map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="p-8 rounded-2xl bg-white dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 hover:border-blue-500/30 dark:hover:border-blue-500/30 transition-all hover:shadow-xl dark:hover:shadow-2xl dark:hover:shadow-blue-500/10 group"
              >
                <div className="w-14 h-14 rounded-xl bg-blue-50 dark:bg-blue-500/10 flex items-center justify-center mb-6 text-blue-600 dark:text-blue-400 group-hover:scale-110 transition-transform">
                  <feature.icon size={28} />
                </div>
                <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-3">{feature.title}</h3>
                <p className="text-slate-600 dark:text-slate-400">{feature.desc}</p>
              </motion.div>
            ))}
          </div>

          
        </section>

        {/* OUR TEACHER SECTION */}
        <FacultySection 
          members={content.computerCenterTeachers || []} 
          pageText={{
            ...pageText,
            facultyTitle: pageText.teacherTitle || 'Our Teacher',
            facultySubtitle: pageText.teacherSubtitle || 'Meet the expert educators guiding students at Galaxy Computer Center.',
          }} 
        />
      </main>

      <LandingFooter
        libraryInfo={computerCenterInfo}
        pageText={pageText}
        navMenuItems={navMenuItems}
        onNavigate={handleNavigate}
      />
      <ChatBot />
    </div>
  );
}
