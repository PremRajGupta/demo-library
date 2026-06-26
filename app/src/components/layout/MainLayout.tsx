import { Outlet } from 'react-router-dom';
import { motion } from 'framer-motion';
import { SidebarProvider } from '../../context/SidebarContext';
import Sidebar from './Sidebar';
import MobileHeader from './MobileHeader';

export default function MainLayout() {
  return (
    <SidebarProvider>
      <div className="flex min-h-screen bg-[#f1f5f9]">
        <Sidebar />
        <div className="flex flex-col flex-1 min-w-0 lg:ml-[260px]">
          <MobileHeader />
          <main className="flex-1 p-4 sm:p-6 lg:p-8">
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
            >
              <Outlet />
            </motion.div>
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}
