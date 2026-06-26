import { motion } from 'framer-motion';
import ContactDisplay from '../shared/ContactDisplay';
import type { ContactCardInfo, LibraryInfo, PageText } from '../../data/landingContent';

type ContactSectionProps = {
  libraryInfo: LibraryInfo;
  admissionContact: ContactCardInfo;
  pageText: PageText;
};

export default function ContactSection({ libraryInfo, admissionContact, pageText }: ContactSectionProps) {
  return (
    <section id="contact" className="py-24 bg-white dark:bg-[#020617] relative overflow-hidden transition-colors duration-300">
      {/* Decorative ambient light */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[90vw] max-w-[800px] h-[90vw] max-h-[800px] bg-blue-100/50 dark:bg-blue-600/5 rounded-full blur-[150px] pointer-events-none transition-colors duration-300" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white mb-4 transition-colors">{pageText.contactTitle}</h2>
          <p className="text-slate-600 dark:text-slate-400 max-w-2xl mx-auto text-lg transition-colors">{pageText.contactSubtitle}</p>
        </motion.div>

        <div className="w-full grid grid-cols-1 lg:grid-cols-2 gap-8">
          <ContactDisplay
            contact={{
              phone: libraryInfo.phone,
              phoneRaw: libraryInfo.phoneRaw,
              email: libraryInfo.email,
              address: libraryInfo.address,
              mapUrl: libraryInfo.mapUrl,
              whatsappMessage: libraryInfo.whatsappMessage,
            }}
            title={libraryInfo.ownerName}
            phoneLabel={pageText.contactPhoneLabel}
            emailLabel={pageText.contactEmailLabel}
            addressLabel={pageText.contactAddressLabel}
            whatsappButtonText={pageText.whatsappButton}
          />

          <ContactDisplay
            contact={{
              phone: admissionContact.phone,
              phoneRaw: admissionContact.phoneRaw,
              email: admissionContact.email,
              address: admissionContact.address,
              mapUrl: admissionContact.mapUrl,
              whatsappMessage: admissionContact.whatsappMessage,
            }}
            title={admissionContact.title}
            phoneLabel={pageText.contactSecondPhoneLabel}
            emailLabel={pageText.contactSecondEmailLabel}
            addressLabel={pageText.contactSecondAddressLabel}
            whatsappButtonText={pageText.whatsappButton}
          />
        </div>
      </div>
    </section>
  );
}
