import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import LandingNavbar from '../components/landing/LandingNavbar';
import LandingFooter from '../components/landing/LandingFooter';
import { SEOMeta } from '../components/SEOMeta';
import { DEFAULT_SITE_CONTENT } from '../data/landingContent';
import { motion } from 'framer-motion';

export default function PrivacyPolicy() {
  const navigate = useNavigate();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const handleNavigate = (sectionId: string) => {
    if (sectionId.startsWith('/')) {
      navigate(sectionId);
    } else {
      navigate('/', { state: { scrollToSection: sectionId } });
    }
  };

  const { libraryInfo, pageText, navMenuItems } = DEFAULT_SITE_CONTENT;

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#040814] text-slate-800 dark:text-slate-300 font-sans selection:bg-blue-500/30 transition-colors duration-300 flex flex-col">
      <SEOMeta
        title="Privacy Policy | Galaxy Education Hub"
        description="Privacy policy and data protection guidelines for Demo Library."
        keywords="privacy policy, data protection, demo library"
        ogUrl="https://galaxyhub.in/privacypolicy"
        canonical="https://galaxyhub.in/privacypolicy"
      />

      <LandingNavbar
        libraryInfo={libraryInfo}
        pageText={pageText}
        navMenuItems={navMenuItems}
        onNavigate={handleNavigate}
      />

      <main className="flex-grow pt-32 pb-24 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto w-full relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white dark:bg-[#0a0f1e] p-8 sm:p-12 rounded-3xl shadow-xl dark:shadow-[0_0_30px_rgba(0,0,0,0.5)] border border-slate-200 dark:border-slate-800"
        >
          <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white mb-8 text-center bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-purple-600 dark:from-blue-400 dark:to-purple-500">Privacy Policy</h1>
          
          <div className="space-y-6 text-slate-600 dark:text-slate-400 leading-relaxed text-sm sm:text-base">
            <p>
              At <strong>{libraryInfo.name}</strong>, accessible from our premises at {libraryInfo.address} and our website, one of our main priorities is the privacy of our visitors and students. This Privacy Policy document contains types of information that is collected and recorded by {libraryInfo.name} and how we use it.
            </p>

            <h2 className="text-xl font-bold text-slate-800 dark:text-slate-200 mt-8 mb-4">Information We Collect</h2>
            <p>
              We collect information to provide better services to all our users. The personal information that you are asked to provide, and the reasons why you are asked to provide it, will be made clear to you at the point we ask you to provide your personal information.
              When you register for an admission, we may ask for your contact information, including items such as name, address, email address, phone number, and ID proofs.
            </p>

            <h2 className="text-xl font-bold text-slate-800 dark:text-slate-200 mt-8 mb-4">How We Use Your Information</h2>
            <p>We use the information we collect in various ways, including to:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Provide, operate, and maintain our library/institute and website.</li>
              <li>Improve, personalize, and expand our services.</li>
              <li>Understand and analyze how you use our facilities.</li>
              <li>Develop new services, features, and functionality.</li>
              <li>Communicate with you, either directly or through one of our partners, including for customer service, to provide you with updates and other information relating to the library.</li>
              <li>Process transactions and fee payments securely.</li>
            </ul>

            <h2 className="text-xl font-bold text-slate-800 dark:text-slate-200 mt-8 mb-4">Security of Your Information</h2>
            <p>
              We value your trust in providing us your Personal Information, thus we are striving to use commercially acceptable means of protecting it. But remember that no method of transmission over the internet, or method of electronic storage is 100% secure and reliable, and we cannot guarantee its absolute security.
            </p>

            <h2 className="text-xl font-bold text-slate-800 dark:text-slate-200 mt-8 mb-4">Contact Us</h2>
            <p>
              If you have any questions or suggestions about our Privacy Policy, do not hesitate to contact us at {libraryInfo.phone} or {libraryInfo.email}.
            </p>
          </div>
        </motion.div>
      </main>

      <LandingFooter
        libraryInfo={libraryInfo}
        pageText={pageText}
        navMenuItems={navMenuItems}
        onNavigate={handleNavigate}
      />
    </div>
  );
}
