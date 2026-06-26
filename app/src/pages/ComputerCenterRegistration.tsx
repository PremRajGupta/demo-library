import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, User, Phone, FileText, UploadCloud, CheckCircle, Loader2, Award, CreditCard } from 'lucide-react';
import LandingNavbar from '../components/landing/LandingNavbar';
import LandingFooter from '../components/landing/LandingFooter';
import { DEFAULT_SITE_CONTENT, type SiteContent } from '../data/landingContent';
import { loadSiteContent, getStoredSiteContent, SITE_CONTENT_UPDATED_EVENT } from '../lib/siteContentService';

export default function ComputerCenterRegistration() {
  const navigate = useNavigate();
  const [content, setContent] = useState<SiteContent>(DEFAULT_SITE_CONTENT);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    // Simulate processing time
    setTimeout(() => {
      setIsSubmitting(false);
      setIsSuccess(true);
    }, 3000);
  };

  const { libraryInfo, pageText, navMenuItems } = content;
  const computerCenterInfo = { ...libraryInfo, name: 'Galaxy Computer Center' };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-[#020617] text-slate-900 dark:text-slate-100 font-sans selection:bg-blue-500/30">
      <LandingNavbar 
        libraryInfo={computerCenterInfo}
        pageText={pageText}
        navMenuItems={navMenuItems}
        onNavigate={handleNavigate}
      />
      
      <div className="flex-grow pt-24 pb-20 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto w-full relative z-10">
        
        {/* Back Button */}
        <button 
          onClick={() => navigate('/computercenter')}
          className="flex items-center gap-2 text-slate-600 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 font-medium mb-8 transition-colors group"
        >
          <ArrowLeft size={20} className="group-hover:-translate-x-1 transition-transform" />
          Back to Computer Center
        </button>
        
        <div className="text-center mb-10 flex flex-col items-center">
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-[#1e293b] dark:text-white flex items-center justify-center gap-3">
            <User className="text-blue-500 w-10 h-10" />
            Student Registration
          </h1>
          <p className="mt-4 text-lg text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
            Please fill out the admission form below with your accurate details.
          </p>
        </div>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white dark:bg-[#0f172a] rounded-3xl shadow-xl border border-slate-200 dark:border-slate-800 p-6 sm:p-10"
        >
          {isSuccess ? (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", stiffness: 200, damping: 15 }}
                className="w-24 h-24 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mb-6"
              >
                <CheckCircle className="w-12 h-12 text-green-600 dark:text-green-400" />
              </motion.div>
              <h2 className="text-3xl font-bold text-slate-900 dark:text-white mb-4">Registration Successful!</h2>
              <p className="text-lg text-slate-600 dark:text-slate-400 max-w-md">
                Your application has been received and is under review. Our team will contact you shortly.
              </p>
              <button 
                onClick={() => navigate('/computercenter')}
                className="mt-8 px-8 py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl transition-all"
              >
                Return to Home
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-8">
              
              {/* Personal Details */}
              <div>
                <h3 className="text-xl font-bold text-slate-800 dark:text-slate-200 mb-4 border-b border-slate-200 dark:border-slate-700 pb-2 flex items-center gap-2">
                  <User size={20} className="text-blue-500" /> Personal Information
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">Full Name</label>
                    <input type="text" required placeholder="Enter your full name" className="w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-[#1e293b] border border-slate-200 dark:border-slate-700 focus:ring-2 focus:ring-blue-500 outline-none transition-all dark:text-white" />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">Mobile Number</label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Phone size={18} className="text-slate-400" />
                      </div>
                      <input type="tel" required placeholder="10-digit mobile number" className="w-full pl-10 px-4 py-3 rounded-xl bg-slate-50 dark:bg-[#1e293b] border border-slate-200 dark:border-slate-700 focus:ring-2 focus:ring-blue-500 outline-none transition-all dark:text-white" />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">Father's Name</label>
                    <input type="text" required placeholder="Enter father's name" className="w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-[#1e293b] border border-slate-200 dark:border-slate-700 focus:ring-2 focus:ring-blue-500 outline-none transition-all dark:text-white" />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">Mother's Name</label>
                    <input type="text" required placeholder="Enter mother's name" className="w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-[#1e293b] border border-slate-200 dark:border-slate-700 focus:ring-2 focus:ring-blue-500 outline-none transition-all dark:text-white" />
                  </div>
                </div>
              </div>

              {/* Identity & Documents */}
              <div>
                <h3 className="text-xl font-bold text-slate-800 dark:text-slate-200 mb-4 border-b border-slate-200 dark:border-slate-700 pb-2 flex items-center gap-2">
                  <CreditCard size={20} className="text-purple-500" /> Identity Details
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">Aadhar Number</label>
                    <input type="text" required placeholder="12-digit Aadhar number" className="w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-[#1e293b] border border-slate-200 dark:border-slate-700 focus:ring-2 focus:ring-purple-500 outline-none transition-all dark:text-white" />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">Aadhar Card Photo (Both Sides)</label>
                    <div className="relative">
                      <input type="file" required className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10" />
                      <div className="w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-[#1e293b] border border-slate-200 dark:border-slate-700 border-dashed flex items-center justify-center gap-2 text-slate-500 dark:text-slate-400 group-hover:bg-slate-100 dark:group-hover:bg-slate-800 transition-colors">
                        <UploadCloud size={20} className="text-purple-500" />
                        <span>Click to upload Aadhar</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Educational Certificates */}
              <div>
                <h3 className="text-xl font-bold text-slate-800 dark:text-slate-200 mb-4 border-b border-slate-200 dark:border-slate-700 pb-2 flex items-center gap-2">
                  <Award size={20} className="text-green-500" /> Educational Certificates
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {/* 10th */}
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">10th Certificate</label>
                    <div className="relative group">
                      <input type="file" required className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10" />
                      <div className="w-full p-4 rounded-xl bg-slate-50 dark:bg-[#1e293b] border border-slate-200 dark:border-slate-700 border-dashed flex flex-col items-center justify-center gap-2 text-slate-500 dark:text-slate-400 transition-all group-hover:border-green-500 group-hover:bg-green-50 dark:group-hover:bg-green-500/10 h-32">
                        <FileText size={28} className="text-slate-400 group-hover:text-green-500 transition-colors" />
                        <span className="text-sm font-medium text-center">Upload 10th Cert.</span>
                      </div>
                    </div>
                  </div>

                  {/* 12th */}
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">12th Certificate</label>
                    <div className="relative group">
                      <input type="file" required className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10" />
                      <div className="w-full p-4 rounded-xl bg-slate-50 dark:bg-[#1e293b] border border-slate-200 dark:border-slate-700 border-dashed flex flex-col items-center justify-center gap-2 text-slate-500 dark:text-slate-400 transition-all group-hover:border-green-500 group-hover:bg-green-50 dark:group-hover:bg-green-500/10 h-32">
                        <FileText size={28} className="text-slate-400 group-hover:text-green-500 transition-colors" />
                        <span className="text-sm font-medium text-center">Upload 12th Cert.</span>
                      </div>
                    </div>
                  </div>

                  {/* Graduation */}
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">Graduation Certificate (Optional)</label>
                    <div className="relative group">
                      <input type="file" className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10" />
                      <div className="w-full p-4 rounded-xl bg-slate-50 dark:bg-[#1e293b] border border-slate-200 dark:border-slate-700 border-dashed flex flex-col items-center justify-center gap-2 text-slate-500 dark:text-slate-400 transition-all group-hover:border-green-500 group-hover:bg-green-50 dark:group-hover:bg-green-500/10 h-32">
                        <FileText size={28} className="text-slate-400 group-hover:text-green-500 transition-colors" />
                        <span className="text-sm font-medium text-center">Upload Graduation</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Submit Button */}
              <div className="pt-6">
                <button 
                  type="submit" 
                  disabled={isSubmitting}
                  className={`w-full py-4 rounded-xl text-white font-bold text-lg shadow-xl transition-all flex items-center justify-center gap-2 ${
                    isSubmitting 
                      ? 'bg-blue-500 cursor-wait' 
                      : 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 hover:-translate-y-1 hover:shadow-blue-500/40'
                  }`}
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 size={24} className="animate-spin" />
                      Processing... Please wait
                    </>
                  ) : (
                    'Submit Application'
                  )}
                </button>
                <p className="text-center text-xs text-slate-500 dark:text-slate-500 mt-4">
                  By submitting this form, you agree to our terms and conditions. Your data is secure.
                </p>
              </div>

            </form>
          )}
        </motion.div>
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
