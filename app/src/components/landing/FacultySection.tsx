import { useState } from 'react';
import { motion } from 'framer-motion';
import { ImageOff, Linkedin, Twitter } from 'lucide-react';
import type { FacultyMember, PageText } from '../../data/landingContent';

type FacultySectionProps = {
  members: FacultyMember[];
  pageText: PageText;
};

function FacultyCard({ member, index }: { member: FacultyMember; index: number }) {
  const [loadFailed, setLoadFailed] = useState(false);
  const hasPhoto = Boolean(member.photo?.trim());

  return (
    <motion.article
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{ delay: index * 0.1, duration: 0.5 }}
      whileHover={{ y: -10 }}
      className="group relative overflow-hidden rounded-2xl bg-white dark:bg-gradient-to-b dark:from-slate-800 dark:to-slate-900 border border-slate-200 dark:border-slate-800 shadow-md hover:shadow-xl dark:shadow-lg dark:hover:shadow-[0_0_30px_rgba(59,130,246,0.2)] transition-all duration-500"
    >
      <div className="absolute inset-0 bg-blue-500/5 dark:bg-blue-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
      
      <div className="aspect-[4/5] relative overflow-hidden bg-slate-100 dark:bg-slate-900 transition-colors">
        {hasPhoto && !loadFailed ? (
          <>
            <img
              src={member.photo}
              alt={member.name}
              className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110 opacity-100 dark:opacity-90 dark:group-hover:opacity-100"
              loading="lazy"
              onError={() => setLoadFailed(true)}
            />
            {/* Gradient Overlay for Image */}
            <div className="absolute inset-0 bg-gradient-to-t from-white via-white/40 dark:from-slate-900 dark:via-slate-900/40 to-transparent opacity-80 group-hover:opacity-60 transition-opacity duration-500" />
          </>
        ) : (
          <div className="h-full w-full flex flex-col items-center justify-center text-slate-400 dark:text-slate-600 p-4 bg-slate-50 dark:bg-slate-800/50">
            <ImageOff size={40} className="mb-3 opacity-50" />
            <span className="text-sm text-center">{loadFailed ? 'Photo failed to load' : 'No photo URL'}</span>
          </div>
        )}

        {/* Social Links on Hover */}
        <div className="absolute top-4 right-4 flex flex-col gap-2 translate-x-12 group-hover:translate-x-0 transition-transform duration-500">
          <button className="p-2 bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm text-slate-600 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors border border-slate-200 dark:border-slate-700 shadow-sm dark:shadow-none">
            <Linkedin size={16} />
          </button>
          <button className="p-2 bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm text-slate-600 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors border border-slate-200 dark:border-slate-700 shadow-sm dark:shadow-none">
            <Twitter size={16} />
          </button>
        </div>
      </div>
      
      <div className="absolute bottom-0 inset-x-0 p-6 translate-y-4 group-hover:translate-y-0 transition-transform duration-500 bg-gradient-to-t from-white via-white/95 dark:from-slate-900 dark:via-slate-900/95 to-transparent pt-12">
        <p className="text-xl font-bold text-slate-900 dark:text-white mb-1 group-hover:text-blue-600 dark:group-hover:text-blue-300 transition-colors">{member.name}</p>
        <p className="text-sm font-semibold text-blue-600 dark:text-blue-400 mb-3">{member.role}</p>
        <p className="text-sm leading-relaxed text-slate-600 dark:text-slate-400 opacity-0 group-hover:opacity-100 transition-opacity duration-500 delay-100 line-clamp-3">
          {member.detail}
        </p>
      </div>
    </motion.article>
  );
}

export default function FacultySection({ members, pageText }: FacultySectionProps) {
  const visibleMembers = members.filter((member) => member.name?.trim() || member.photo?.trim());

  return (
    <section id="faculty" className="py-24 bg-white dark:bg-[#020617] relative transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white mb-4 transition-colors">{pageText.facultyTitle}</h2>
          <p className="text-slate-600 dark:text-slate-400 max-w-2xl mx-auto text-lg transition-colors">{pageText.facultySubtitle}</p>
        </motion.div>

        {visibleMembers.length === 0 ? (
          <p className="text-center text-slate-500 text-sm py-12">
            Faculty profiles will appear here after you add details in Website Settings.
          </p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
            {visibleMembers.map((member, index) => (
              <FacultyCard key={member.id} member={member} index={index} />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
