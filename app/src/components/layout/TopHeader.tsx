import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { LogOut, ChevronDown } from 'lucide-react';

export default function TopHeader() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [showDropdown, setShowDropdown] = useState(false);

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <header className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4 mb-4 sm:mb-6">
      <div className="min-w-0">
        <h1 className="text-xl sm:text-2xl font-bold text-[#1e293b] truncate">
          Welcome, {user?.displayName || 'Admin'}
        </h1>
        <span className="inline-block mt-1 px-3 py-1 bg-[#dbeafe] text-[#3b82f6] text-[10px] font-semibold uppercase tracking-wider rounded-md">
          MANAGER
        </span>
      </div>

      <div className="relative self-start sm:self-auto">
        <button
          type="button"
          onClick={() => setShowDropdown(!showDropdown)}
          className="flex items-center gap-2 px-3 sm:px-4 py-2 rounded-lg bg-[#1a2b4a] text-white hover:bg-[#2a3b5a] transition-colors"
        >
          <div className="w-8 h-8 bg-white/20 rounded flex items-center justify-center text-sm font-semibold flex-shrink-0">
            {user?.displayName?.charAt(0).toUpperCase() || 'A'}
          </div>
          <ChevronDown size={16} className={`transition-transform ${showDropdown ? 'rotate-180' : ''}`} />
        </button>

        {showDropdown && (
          <>
            <button
              type="button"
              aria-label="Close menu"
              className="fixed inset-0 z-[5]"
              onClick={() => setShowDropdown(false)}
            />
            <div className="absolute left-0 sm:left-auto sm:right-0 mt-2 w-56 sm:w-48 bg-white rounded-lg shadow-lg border border-[#e2e8f0] z-10">
              <div className="px-4 py-3 border-b border-[#e2e8f0]">
                <p className="text-sm font-medium text-[#1e293b] truncate">{user?.email}</p>
              </div>
              <button
                type="button"
                onClick={handleLogout}
                className="w-full flex items-center gap-2 px-4 py-3 text-red-600 hover:bg-red-50 transition-colors"
              >
                <LogOut size={16} />
                <span className="text-sm font-medium">Sign Out</span>
              </button>
            </div>
          </>
        )}
      </div>
    </header>
  );
}
