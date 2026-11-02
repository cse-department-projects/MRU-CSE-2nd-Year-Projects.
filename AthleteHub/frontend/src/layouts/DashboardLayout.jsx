import { Outlet, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigation } from '@/lib/navigation-store';
import { AppSidebar } from '@/components/layout/app-sidebar';
import { TopNavBar } from '@/components/layout/top-nav-bar';
import { StatusBar, FloatingActionButton } from '@/components/layout/status-bar-fab';
import { ContextPanel } from '@/components/layout/context-panel';
import { ErrorBoundary } from '@/components/ui/ErrorBoundary';
import { cn } from '@/lib/utils';

export default function DashboardLayout() {
  const { sidebarCollapsed, contextPanelOpen } = useNavigation();
  const location = useLocation();

  return (
    <div className="min-h-screen bg-background text-foreground font-sans bg-glow-container selection:bg-primary/20 selection:text-primary">
      {/* Global Ambient UI Glows */}
      <div className="bg-glow-primary w-[800px] h-[800px] top-[-200px] left-[-200px] opacity-15 fixed" />
      <div className="bg-glow-primary w-[1000px] h-[1000px] bottom-[-300px] right-[-300px] opacity-10 fixed" />
      <ErrorBoundary>
        {/* Sidebar — docked on left */}
        <AppSidebar />

        {/* Content column to the right of the sidebar */}
        <div
          className={cn(
            'flex-1 flex flex-col min-w-0 transition-all duration-300 ease-out pb-[32px]',
            sidebarCollapsed ? 'lg:pl-[68px]' : 'lg:pl-[220px]',
            contextPanelOpen ? 'lg:pr-[340px]' : 'pr-0'
          )}
        >
          {/* Top Navigation Bar — Not fixed, flows naturally with page */}
          <TopNavBar />

          {/* Main content */}
          <main className="flex-1 p-6 lg:p-8 max-w-7xl w-full mx-auto">
            <AnimatePresence mode="wait">
              <motion.div
                key={location.pathname}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
                className="h-full"
              >
                <ErrorBoundary>
                  <Outlet />
                </ErrorBoundary>
              </motion.div>
            </AnimatePresence>
          </main>
        </div>

        {/* Right Context Panel */}
        <div className="hidden lg:block">
          <ContextPanel />
        </div>

        {/* Status Bar */}
        <StatusBar />

        {/* Floating Action Button */}
        <FloatingActionButton />
      </ErrorBoundary>
    </div>
  );
}
