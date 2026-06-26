import { motion } from 'framer-motion';
import { type LucideIcon } from 'lucide-react';

const colorMap = {
  blue: { bg: 'bg-[#dbeafe]', icon: 'text-[#3b82f6]' },
  green: { bg: 'bg-[#dcfce7]', icon: 'text-[#22c55e]' },
  yellow: { bg: 'bg-[#fef9c3]', icon: 'text-[#eab308]' },
  red: { bg: 'bg-[#fee2e2]', icon: 'text-[#ef4444]' },
};

interface StatCardProps {
  label: string;
  value: string;
  icon: LucideIcon;
  color: keyof typeof colorMap;
}

export default function StatCard({ label, value, icon: Icon, color }: StatCardProps) {
  const colors = colorMap[color];

  return (
    <motion.div
      whileHover={{ y: -2, boxShadow: '0 4px 12px rgba(0,0,0,0.12)' }}
      transition={{ duration: 0.2 }}
      className="bg-white rounded-[10px] p-6 shadow-[0_1px_3px_rgba(0,0,0,0.08),0_1px_2px_rgba(0,0,0,0.04)] cursor-default"
    >
      <div className="flex items-center gap-4">
        <div className={`w-12 h-12 ${colors.bg} rounded-full flex items-center justify-center flex-shrink-0`}>
          <Icon className={colors.icon} size={22} />
        </div>
        <div>
          <p className="text-[32px] font-bold text-[#1e293b] leading-tight" style={{ fontVariantNumeric: 'tabular-nums' }}>
            {value}
          </p>
          <p className="text-sm text-[#64748b]">{label}</p>
        </div>
      </div>
    </motion.div>
  );
}
