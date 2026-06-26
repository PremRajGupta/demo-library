import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Clock, IndianRupee, Sparkles, ChevronRight, ArrowLeft } from 'lucide-react';
import LandingNavbar from '../components/landing/LandingNavbar';
import LandingFooter from '../components/landing/LandingFooter';
import { DEFAULT_SITE_CONTENT, type SiteContent, type ComputerCourse } from '../data/landingContent';
import { loadSiteContent, getStoredSiteContent, SITE_CONTENT_UPDATED_EVENT } from '../lib/siteContentService';

export default function AllCourses() {
  const navigate = useNavigate();

  const [content, setContent] = useState<SiteContent>(DEFAULT_SITE_CONTENT);

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
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-[#020617] text-slate-900 dark:text-slate-100 font-sans selection:bg-blue-500/30">
      <LandingNavbar 
        libraryInfo={computerCenterInfo}
        pageText={pageText}
        navMenuItems={navMenuItems}
        onNavigate={handleNavigate}
      />
      
      <div className="flex-grow pt-24 pb-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full relative z-10">
        
        {/* Back Button */}
        <button 
          onClick={() => navigate('/computercenter')}
          className="flex items-center gap-2 text-slate-600 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 font-medium mb-8 transition-colors group"
        >
          <ArrowLeft size={20} className="group-hover:-translate-x-1 transition-transform" />
          Back to Computer Center
        </button>
        
        <div className="text-center mb-12 flex flex-col items-center">
          <h1 className="text-4xl sm:text-5xl font-extrabold text-[#1e293b] dark:text-white flex items-center justify-center gap-3">
            <Sparkles className="text-yellow-500 fill-yellow-500 w-10 h-10" />
            All Courses
          </h1>
          <p className="mt-4 text-lg text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
            Explore our complete catalog of professional computer courses designed to help you succeed in your career.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {courses.map((course: ComputerCourse, index: number) => (
            <motion.div 
              key={course.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ duration: 0.4, delay: index * 0.05 }}
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
      </div>

      <LandingFooter 
        libraryInfo={computerCenterInfo}
        pageText={pageText}
        navMenuItems={navMenuItems}
        onNavigate={handleNavigate}
      />
    </div>
  );
}
