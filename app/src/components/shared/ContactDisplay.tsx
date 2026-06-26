import { Phone, Mail, MapPin, MessageCircle } from 'lucide-react';
import { motion } from 'framer-motion';

type ContactInfo = {
  phone: string;
  phoneRaw: string;
  email: string;
  address: string;
  mapUrl?: string;
  whatsappMessage: string;
};

type ContactDisplayProps = {
  contact: ContactInfo;
  title: string;
  subtitle?: string;
  phoneLabel: string;
  emailLabel: string;
  addressLabel: string;
  whatsappButtonText: string;
  variant?: 'default' | 'admin';
};

export default function ContactDisplay({
  contact,
  title,
  phoneLabel,
  emailLabel,
  addressLabel,
  whatsappButtonText,
  variant = 'default',
}: ContactDisplayProps) {
  const whatsappUrl = `https://wa.me/${contact.phoneRaw}?text=${encodeURIComponent(contact.whatsappMessage)}`;
  const phoneUrl = `tel:${contact.phoneRaw}`;
  const emailUrl = `mailto:${contact.email}`;
  const mapUrl =
    contact.mapUrl?.trim() ||
    `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(contact.address)}`;

  if (variant === 'admin') {
    return (
      <div className="bg-[#f8fafc] rounded-xl p-6 border border-[#e2e8f0]">
        <h3 className="text-xl font-semibold text-[#1e293b] mb-6">{title}</h3>
        <div className="space-y-5">
          <div className="flex items-start gap-4">
            <a href={phoneUrl} className="w-10 h-10 bg-[#dbeafe] rounded-lg flex items-center justify-center flex-shrink-0 hover:bg-[#bfdbfe] transition-colors"><Phone className="text-[#3b82f6]" size={20} /></a>
            <div>
              <p className="text-sm text-[#64748b]">{phoneLabel}</p>
              <a href={phoneUrl} className="text-[#1e293b] font-medium hover:text-[#3b82f6] transition-colors">{contact.phone}</a>
            </div>
          </div>
          <div className="flex items-start gap-4">
            <a href={emailUrl} className="w-10 h-10 bg-[#dcfce7] rounded-lg flex items-center justify-center flex-shrink-0 hover:bg-[#bbf7d0] transition-colors"><Mail className="text-[#22c55e]" size={20} /></a>
            <div>
              <p className="text-sm text-[#64748b]">{emailLabel}</p>
              <a href={emailUrl} className="text-[#1e293b] font-medium hover:text-[#3b82f6] transition-colors break-all">{contact.email}</a>
            </div>
          </div>
          <div className="flex items-start gap-4">
            <a href={mapUrl} target="_blank" rel="noopener noreferrer" className="w-10 h-10 bg-[#fef9c3] rounded-lg flex items-center justify-center flex-shrink-0 hover:bg-[#fde68a] transition-colors"><MapPin className="text-[#eab308]" size={20} /></a>
            <div>
              <p className="text-sm text-[#64748b]">{addressLabel}</p>
              <a href={mapUrl} target="_blank" rel="noopener noreferrer" className="text-[#1e293b] font-medium hover:text-[#3b82f6] transition-colors">{contact.address}</a>
            </div>
          </div>
        </div>
        <a href={whatsappUrl} target="_blank" rel="noopener noreferrer" className="mt-8 inline-flex items-center justify-center gap-3 w-full px-8 py-3.5 bg-[#25D366] text-white font-semibold rounded-lg hover:bg-[#20bd5a] transition-colors shadow-md">
          <MessageCircle size={22} />
          {whatsappButtonText}
        </a>
      </div>
    );
  }

  return (
    <motion.div 
      whileHover={{ y: -5 }}
      className="relative group p-1 rounded-3xl bg-gradient-to-b from-slate-200 to-slate-100 dark:from-slate-800 dark:to-slate-900 hover:from-blue-200 hover:to-purple-200 dark:hover:from-blue-500/50 dark:hover:to-purple-500/50 transition-all duration-500 shadow-lg dark:shadow-xl hover:shadow-xl dark:hover:shadow-[0_0_30px_rgba(59,130,246,0.2)] h-full"
    >
      <div className="bg-white dark:bg-[#0a0f1e] rounded-[1.35rem] p-6 sm:p-8 h-full border border-slate-100 dark:border-slate-800 group-hover:border-transparent transition-all duration-500 relative overflow-hidden flex flex-col">
        {/* Ambient Glow */}
        <div className="absolute top-0 right-0 w-40 h-40 bg-blue-100 dark:bg-blue-500/10 blur-[50px] pointer-events-none rounded-full transition-colors duration-300" />
        
        <h3 className="text-xl sm:text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-slate-900 to-slate-600 dark:from-white dark:to-slate-400 mb-6 transition-colors">{title}</h3>

        <div className="space-y-5 relative z-10 flex-grow">
          {contact.phone && (
            <div className="flex items-start gap-4">
              <a
                href={phoneUrl}
                aria-label={`Call ${contact.phone}`}
                className="w-10 h-10 sm:w-12 sm:h-12 bg-blue-50 dark:bg-blue-500/10 border border-blue-100 dark:border-blue-500/30 rounded-xl flex items-center justify-center flex-shrink-0 hover:bg-blue-100 dark:hover:bg-blue-500/20 hover:border-blue-300 dark:hover:border-blue-400 transition-all group/icon"
              >
                <Phone className="text-blue-600 dark:text-blue-400 group-hover/icon:text-blue-700 dark:group-hover/icon:text-blue-300 group-hover/icon:scale-110 transition-all" size={20} />
              </a>
              <div>
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-0.5 transition-colors">{phoneLabel}</p>
                <a
                  href={phoneUrl}
                  className="text-base sm:text-lg text-slate-800 dark:text-slate-200 font-medium hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                >
                  {contact.phone}
                </a>
              </div>
            </div>
          )}

          {contact.email && (
            <div className="flex items-start gap-4">
              <a
                href={emailUrl}
                aria-label={`Email ${contact.email}`}
                className="w-10 h-10 sm:w-12 sm:h-12 bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-100 dark:border-emerald-500/30 rounded-xl flex items-center justify-center flex-shrink-0 hover:bg-emerald-100 dark:hover:bg-emerald-500/20 hover:border-emerald-300 dark:hover:border-emerald-400 transition-all group/icon"
              >
                <Mail className="text-emerald-600 dark:text-emerald-400 group-hover/icon:text-emerald-700 dark:group-hover/icon:text-emerald-300 group-hover/icon:scale-110 transition-all" size={20} />
              </a>
              <div>
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-0.5 transition-colors">{emailLabel}</p>
                <a
                  href={emailUrl}
                  className="text-base sm:text-lg text-slate-800 dark:text-slate-200 font-medium hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors break-all"
                >
                  {contact.email}
                </a>
              </div>
            </div>
          )}

          {contact.address && (
            <div className="flex items-start gap-4">
              <a
                href={mapUrl}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={`Open ${contact.address} on Google Maps`}
                className="w-10 h-10 sm:w-12 sm:h-12 bg-amber-50 dark:bg-amber-500/10 border border-amber-100 dark:border-amber-500/30 rounded-xl flex items-center justify-center flex-shrink-0 hover:bg-amber-100 dark:hover:bg-amber-500/20 hover:border-amber-300 dark:hover:border-amber-400 transition-all group/icon"
              >
                <MapPin className="text-amber-600 dark:text-amber-400 group-hover/icon:text-amber-700 dark:group-hover/icon:text-amber-300 group-hover/icon:scale-110 transition-all" size={20} />
              </a>
              <div>
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-0.5 transition-colors">{addressLabel}</p>
                <a
                  href={mapUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm sm:text-base text-slate-800 dark:text-slate-200 font-medium hover:text-amber-600 dark:hover:text-amber-400 transition-colors leading-snug block"
                >
                  {contact.address}
                </a>
              </div>
            </div>
          )}
        </div>

        <a
          href={whatsappUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-8 mt-auto relative group px-6 py-3.5 bg-green-50 dark:bg-green-500/10 text-green-600 dark:text-green-400 text-base font-bold rounded-xl border border-green-200 dark:border-green-500/30 hover:bg-green-500 dark:hover:bg-green-500 hover:text-white dark:hover:text-white hover:border-green-500 dark:hover:border-green-500 transition-all shadow-sm dark:shadow-[0_0_15px_rgba(34,197,94,0.1)] hover:shadow-md dark:hover:shadow-[0_0_25px_rgba(34,197,94,0.4)] flex items-center justify-center gap-2"
        >
          <MessageCircle size={22} className="relative z-10" />
          <span className="relative z-10">{whatsappButtonText}</span>
        </a>
      </div>
    </motion.div>
  );
}
