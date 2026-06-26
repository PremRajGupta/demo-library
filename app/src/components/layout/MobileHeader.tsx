import { Menu } from 'lucide-react';
import AppLogo from '../AppLogo';
import { useSidebar } from '../../context/SidebarContext';
import S from '../../lib/strings';

export default function MobileHeader() {
  const { toggle } = useSidebar();

  return (
    <header className="lg:hidden sticky top-0 z-40 flex items-center gap-3 px-4 py-3 bg-[#1a2b4a] shadow-md">
      <button
        type="button"
        onClick={toggle}
        className="p-2 text-white hover:bg-[#2a3b5a] rounded-lg transition-colors"
        aria-label="Open navigation menu"
      >
        <Menu size={22} />
      </button>
      <AppLogo
        size="sm"
        showName
        name={S.appName}
        nameClassName="text-white font-semibold text-lg"
      />
    </header>
  );
}
