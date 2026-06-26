import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import LandingNavbar from '../components/landing/LandingNavbar';
import LandingFooter from '../components/landing/LandingFooter';
import { SEOMeta } from '../components/SEOMeta';
import { DEFAULT_SITE_CONTENT } from '../data/landingContent';
import { motion } from 'framer-motion';

export default function TermsOfService() {
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
        title="Terms of Service | Galaxy Education Hub"
        description="Terms of service and rules for Demo Library."
        keywords="terms of service, rules, demo library"
        ogUrl="https://galaxyhub.in/termsofservice"
        canonical="https://galaxyhub.in/termsofservice"
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
          <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white mb-8 text-center bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-purple-600 dark:from-blue-400 dark:to-purple-500">Terms of Service</h1>
          
          <div className="space-y-6 text-slate-600 dark:text-slate-400 leading-relaxed text-sm sm:text-base">
            <p>
              Welcome to <strong>{libraryInfo.name}</strong>. These terms and conditions outline the rules and regulations for the use of our facilities and website.
            </p>

            <h2 className="text-xl font-bold text-slate-800 dark:text-slate-200 mt-8 mb-4">1. Membership and Admission</h2>
            <ul className="list-disc pl-6 space-y-2">
              <li>Admission is granted subject to availability of seats and verification of identity.</li>
              <li>Membership is non-transferable. The ID card provided must be carried at all times.</li>
              <li>We reserve the right to refuse or cancel membership if any provided information is found to be false.</li>
            </ul>

            <h2 className="text-xl font-bold text-slate-800 dark:text-slate-200 mt-8 mb-4">2. Code of Conduct</h2>
            <ul className="list-disc pl-6 space-y-2">
              <li>Maintain absolute silence within the study areas. Mobile phones must be kept on silent mode.</li>
              <li>Eating or drinking (except water in spill-proof bottles) is strictly prohibited in the reading halls.</li>
              <li>Members are expected to behave respectfully towards staff and other members.</li>
              <li>Any damage to library property will be charged to the responsible member.</li>
            </ul>

            <h2 className="text-xl font-bold text-slate-800 dark:text-slate-200 mt-8 mb-4">3. Fees and Payments</h2>
            <ul className="list-disc pl-6 space-y-2">
              <li>Monthly fees must be paid in advance before the 5th of every month.</li>
              <li>Late payment may incur additional charges or temporary suspension of access.</li>
              <li>Fees once paid are non-refundable and non-adjustable.</li>
            </ul>

            <h2 className="text-xl font-bold text-slate-800 dark:text-slate-200 mt-8 mb-4">4. Locker Usage (If Applicable)</h2>
            <p>
              Lockers are provided on a first-come, first-served basis. The library management is not responsible for any loss or damage to items stored in the lockers.
            </p>

            <h2 className="text-xl font-bold text-slate-800 dark:text-slate-200 mt-8 mb-4">5. Modifications to Terms</h2>
            <p>
              {libraryInfo.name} reserves the right to revise these terms and conditions at any time. By continuing to use our services, you agree to be bound by the updated terms.
            </p>

            <h2 className="text-xl font-bold text-slate-800 dark:text-slate-200 mt-8 mb-4">Contact Us</h2>
            <p>
              If you have any questions about these Terms of Service, please contact us at {libraryInfo.phone}.
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
