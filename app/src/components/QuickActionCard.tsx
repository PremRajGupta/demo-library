import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { type LucideIcon } from 'lucide-react';

interface QuickActionCardProps {
  label: string;
  icon: LucideIcon;
  path: string;
}

export default function QuickActionCard({ label, icon: Icon, path }: QuickActionCardProps) {
  const navigate = useNavigate();

  return (
    <motion.button
      whileHover={{ y: -2, boxShadow: '0 4px 12px rgba(0,0,0,0.12)' }}
      transition={{ duration: 0.2 }}
      onClick={() => navigate(path)}
      className="bg-white rounded-[10px] p-7 shadow-[0_1px_3px_rgba(0,0,0,0.08),0_1px_2px_rgba(0,0,0,0.04)] flex flex-col items-center gap-3 hover:bg-gray-50 transition-colors duration-150"
    >
      <div className="w-14 h-14 bg-[#1a2b4a] rounded-full flex items-center justify-center">
        <Icon className="text-white" size={24} />
      </div>
      <span className="text-sm font-medium text-[#1e293b]">{label}</span>
    </motion.button>
  );
}
