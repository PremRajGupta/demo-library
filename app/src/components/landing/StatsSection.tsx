import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Users, Eye, Clock } from 'lucide-react';
import { loadPublicStatsForLanding, type PublicStats } from '../../lib/publicStatsService';
import type { PageText } from '../../data/landingContent';

type StatsSectionProps = {
  pageText: PageText;
};

function useCountUp(target: number, duration = 1500) {
  const [value, setValue] = useState(0);

  useEffect(() => {
    if (target <= 0) {
      setValue(0);
      return undefined;
    }

    const start = performance.now();
    let frame = 0;

    const tick = (now: number) => {
      const progress = Math.min((now - start) / duration, 1);
      const eased = 1 - (1 - progress) ** 3;
      setValue(Math.round(target * eased));
      if (progress < 1) frame = requestAnimationFrame(tick);
    };

    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [target, duration]);

  return value;
}

type StatCardProps = {
  icon: typeof Users;
  label: string;
  value: number;
  suffix?: string;
  accent: string;
  delay?: number;
};

function StatCard({ icon: Icon, label, value, suffix = '', accent, delay = 0 }: StatCardProps) {
  const display = useCountUp(value);

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{ duration: 0.6, delay }}
      whileHover={{ y: -8, scale: 1.02 }}
      className="relative group p-1 rounded-2xl bg-gradient-to-b from-slate-200 to-slate-100 hover:from-blue-200 hover:to-cyan-200 dark:from-slate-800 dark:to-slate-900/50 dark:hover:from-blue-500/50 dark:hover:to-cyan-500/50 transition-all duration-500"
    >
      <div className="absolute inset-0 bg-blue-500/10 dark:bg-blue-500/20 blur-xl rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
      <div className="relative h-full w-full bg-white dark:bg-[#0a0f1e] rounded-xl p-6 sm:p-8 border border-slate-100 dark:border-slate-800 group-hover:border-transparent transition-all duration-500 shadow-md hover:shadow-xl dark:shadow-xl overflow-hidden">
        <div className={`absolute top-0 left-0 w-32 h-32 blur-3xl opacity-10 dark:opacity-20 group-hover:opacity-30 dark:group-hover:opacity-40 transition-opacity ${accent}`} />
        
        <div className="flex items-center gap-5 sm:gap-6 relative z-10">
          <div className={`w-16 h-16 sm:w-20 sm:h-20 rounded-2xl flex-shrink-0 flex items-center justify-center bg-slate-50 dark:bg-gradient-to-br dark:from-slate-800 dark:to-slate-900 border border-slate-200 dark:border-slate-700 shadow-sm dark:shadow-lg group-hover:shadow-md dark:group-hover:shadow-[0_0_20px_rgba(59,130,246,0.3)] transition-all duration-500`}>
            <Icon className="text-blue-500 dark:text-blue-400 group-hover:text-cyan-500 dark:group-hover:text-cyan-300 transition-colors w-8 h-8 sm:w-10 sm:h-10" />
          </div>
          <div className="text-left flex-1">
            <p className="text-4xl lg:text-5xl font-black text-transparent bg-clip-text bg-gradient-to-br from-slate-800 to-slate-500 group-hover:from-blue-600 group-hover:to-cyan-500 dark:from-white dark:to-slate-400 dark:group-hover:from-blue-200 dark:group-hover:to-cyan-100 mb-1 tabular-nums drop-shadow-sm transition-all duration-500">
              {display.toLocaleString('en-IN')}
              {suffix}
            </p>
            <p className="text-sm sm:text-base font-semibold text-slate-500 dark:text-slate-400 tracking-wide uppercase group-hover:text-slate-700 dark:group-hover:text-slate-300 transition-colors">{label}</p>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

export default function StatsSection({ pageText }: StatsSectionProps) {
  const [stats, setStats] = useState<PublicStats | null>(null);

  useEffect(() => {
    loadPublicStatsForLanding().then(setStats);
  }, []);

  const cards = stats
    ? [
        {
          icon: Users,
          label: pageText.statsAdmissionsLabel,
          value: stats.totalAdmissions,
          accent: 'bg-blue-500',
        },
        {
          icon: Eye,
          label: pageText.statsVisitorsLabel,
          value: stats.visitorCount,
          accent: 'bg-emerald-500',
        },
        {
          icon: Clock,
          label: pageText.statsStudyShiftsLabel,
          value: 0,
          suffix: '',
          accent: 'bg-cyan-500',
          staticText: '4h – 24h',
        },
      ]
    : [];

  return (
    <section id="stats" className="relative py-24 bg-slate-50 dark:bg-[#040814] overflow-hidden transition-colors duration-300">
      <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-slate-200 dark:via-slate-800 to-transparent transition-colors duration-300" />
      <div className="absolute bottom-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-slate-200 dark:via-slate-800 to-transparent transition-colors duration-300" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white mb-4 drop-shadow-sm dark:drop-shadow-md transition-colors">{pageText.statsTitle}</h2>
          <p className="text-slate-600 dark:text-slate-400 max-w-2xl mx-auto text-lg transition-colors">{pageText.statsSubtitle}</p>
        </motion.div>

        {!stats ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8 w-full">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="h-48 bg-slate-200 dark:bg-slate-800/50 rounded-2xl border border-slate-200 dark:border-slate-800 animate-pulse transition-colors"
              />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8 w-full">
            {cards.map((card, index) =>
              'staticText' in card && card.staticText ? (
                <motion.div
                  key={card.label}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-50px" }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                  whileHover={{ y: -8, scale: 1.02 }}
                  className="relative group p-1 rounded-2xl bg-gradient-to-b from-slate-200 to-slate-100 hover:from-blue-200 hover:to-cyan-200 dark:from-slate-800 dark:to-slate-900/50 dark:hover:from-blue-500/50 dark:hover:to-cyan-500/50 transition-all duration-500"
                >
                  <div className="absolute inset-0 bg-blue-500/10 dark:bg-blue-500/20 blur-xl rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
                  <div className="relative h-full w-full bg-white dark:bg-[#0a0f1e] rounded-xl p-6 sm:p-8 border border-slate-100 dark:border-slate-800 group-hover:border-transparent transition-all duration-500 shadow-md hover:shadow-xl dark:shadow-xl overflow-hidden">
                    <div className={`absolute top-0 left-0 w-32 h-32 blur-3xl opacity-10 dark:opacity-20 group-hover:opacity-30 dark:group-hover:opacity-40 transition-opacity ${card.accent}`} />
                    
                    <div className="flex items-center gap-5 sm:gap-6 relative z-10">
                      <div className="w-16 h-16 sm:w-20 sm:h-20 flex-shrink-0 rounded-2xl flex items-center justify-center bg-slate-50 dark:bg-gradient-to-br dark:from-slate-800 dark:to-slate-900 border border-slate-200 dark:border-slate-700 shadow-sm dark:shadow-lg group-hover:shadow-md dark:group-hover:shadow-[0_0_20px_rgba(59,130,246,0.3)] transition-all duration-500">
                        <card.icon className="text-blue-500 dark:text-blue-400 group-hover:text-cyan-500 dark:group-hover:text-cyan-300 transition-colors w-8 h-8 sm:w-10 sm:h-10" />
                      </div>
                      <div className="text-left flex-1">
                        <p className="text-4xl lg:text-5xl font-black text-transparent bg-clip-text bg-gradient-to-br from-slate-800 to-slate-500 group-hover:from-blue-600 group-hover:to-cyan-500 dark:from-white dark:to-slate-400 dark:group-hover:from-blue-200 dark:group-hover:to-cyan-100 mb-1 drop-shadow-sm transition-all duration-500">
                          {card.staticText}
                        </p>
                        <p className="text-sm sm:text-base font-semibold text-slate-500 dark:text-slate-400 tracking-wide uppercase group-hover:text-slate-700 dark:group-hover:text-slate-300 transition-colors">{card.label}</p>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ) : (
                <StatCard
                  key={card.label}
                  icon={card.icon}
                  label={card.label}
                  value={card.value}
                  suffix={'suffix' in card ? card.suffix : ''}
                  accent={card.accent}
                  delay={index * 0.1}
                />
              )
            )}
          </div>
        )}

        <motion.p 
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.5 }}
          className="text-center text-sm text-slate-500 dark:text-slate-600 mt-12 font-medium tracking-wide transition-colors"
        >
          {pageText.statsFootnote}
        </motion.p>
      </div>
    </section>
  );
}
