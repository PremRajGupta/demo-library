import { useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useSidebar } from '../../context/SidebarContext';
import {
  LayoutDashboard,
  UserPlus,
  Wallet,
  Armchair,
  MessageSquare,
  Users,
  FileText,
  Download,
  LogOut,
  X,
  Globe,
  Monitor,
} from 'lucide-react';

import AppLogo from '../AppLogo';
import S from '../../lib/strings';

const menuItems = [
  { path: '/dashboard', label: S.sidebar.dashboard, icon: LayoutDashboard },
  { path: '/admission', label: S.sidebar.admission, icon: UserPlus },
  { path: '/fees', label: S.sidebar.fees, icon: Wallet },
  { path: '/pdf-generator', label: S.sidebar.receipts, icon: Download },
  { path: '/seat-map', label: S.sidebar.seatMap, icon: Armchair },
  { path: '/requests', label: S.sidebar.requests, icon: MessageSquare },
  { path: '/students', label: S.sidebar.students, icon: Users },
  { path: '/reports', label: S.sidebar.reports, icon: FileText },
  { path: '/computer-center-settings', label: 'Computer Center', icon: Monitor },
  { path: '/website-settings', label: S.sidebar.website, icon: Globe },
];

export default function Sidebar() {
  const location = useLocation();
  const navigate = useNavigate();
  const { logout } = useAuth();
  const { isOpen, close } = useSidebar();

  useEffect(() => {
    close();
  }, [location.pathname, close]);

  const isActive = (path: string) => {
    if (path === '/dashboard') {
      return location.pathname === '/dashboard';
    }
    return location.pathname.startsWith(path);
  };

  const handleNavigate = (path: string) => {
    navigate(path);
    close();
  };

  return (
    <>
      {isOpen && (
        <button
          type="button"
          aria-label="Close navigation menu"
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={close}
        />
      )}

      <aside
        className={`fixed left-0 top-0 h-screen w-[260px] max-w-[85vw] bg-[#1a2b4a] flex flex-col z-50 transition-transform duration-300 ease-in-out ${
          isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        <div className="px-6 py-6 flex items-center justify-between gap-3">
          <AppLogo
            size="md"
            showName
            name={S.appName}
            nameClassName="text-white font-semibold text-xl"
          />
          <button
            type="button"
            onClick={close}
            className="lg:hidden p-1.5 text-[#8b9bb4] hover:text-white hover:bg-[#2a3b5a] rounded-lg transition-colors"
            aria-label="Close menu"
          >
            <X size={20} />
          </button>
        </div>

        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.path);
            return (
              <button
                key={item.path}
                type="button"
                onClick={() => handleNavigate(item.path)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all duration-150 ${
                  active
                    ? 'bg-[#2a3b5a] text-white border-l-[3px] border-[#3b82f6]'
                    : 'text-[#8b9bb4] hover:bg-[#2a3b5a] hover:text-white'
                }`}
              >
                <Icon size={20} />
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>

        <div className="px-3 py-4">
          <button
            type="button"
            onClick={logout}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium text-[#ef4444] hover:bg-[#2a3b5a] transition-all duration-150"
          >
            <LogOut size={20} />
            <span>Logout</span>
          </button>
        </div>
      </aside>
    </>
  );
}
