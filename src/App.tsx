import { useState, useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import AuthLayout from './components/layout/AuthLayout';
import DashboardLayout from './components/layout/DashboardLayout';
import ProtectedRoute from './components/auth/ProtectedRoute';
import Logo from './components/Logo';

import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
import ForgotPassword from './pages/auth/ForgotPassword';
import Dashboard from './pages/Dashboard';
import AiAssistant from './pages/dashboard/AiAssistant';
import MedicalReports from './pages/dashboard/MedicalReports';
import HealthTracker from './pages/dashboard/HealthTracker';
import Medication from './pages/dashboard/Medication';
import DoctorFinder from './pages/dashboard/DoctorFinder';
import Profile from './pages/dashboard/Profile';
import Settings from './pages/dashboard/Settings';
import BodyExplorer from './pages/dashboard/BodyExplorer';

const NotFound404 = () => <div className="flex flex-col items-center justify-center h-[calc(100vh-200px)] text-center space-y-4"><h1 className="text-6xl font-bold text-slate-800">404</h1><p className="text-gray-500">Page not found.</p></div>;

function App() {
  const [showIntro, setShowIntro] = useState(true);

  useEffect(() => {
    // Check if we've already shown the intro in this session to prevent annoyance on reloads during dev,
    // but for the sake of the requirement, we'll show it if the path is exactly '/' on initial load.
    if (window.location.pathname !== '/') {
      setShowIntro(false);
      return;
    }
    
    const timer = setTimeout(() => {
      setShowIntro(false);
    }, 3000);
    return () => clearTimeout(timer);
  }, []);

  return (
    <>
      <AnimatePresence>
        {showIntro && (
          <motion.div
            key="intro"
            initial={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.8, ease: 'easeInOut' }}
            className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-[#020617]"
          >
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ 
                scale: [0.8, 1.15, 1], 
                opacity: 1, 
                filter: ['drop-shadow(0 0 0px #06b6d4)', 'drop-shadow(0 0 50px rgba(6,182,212,0.8))', 'drop-shadow(0 0 20px rgba(6,182,212,0.5))'] 
              }}
              transition={{ duration: 2.5, ease: 'easeOut' }}
            >
              <Logo size={140} />
            </motion.div>
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8, duration: 1 }}
              className="mt-8 text-4xl font-poppins font-bold text-transparent bg-clip-text bg-gradient-to-r from-white to-cyan-200 tracking-widest uppercase"
            >
              HealthSphere
            </motion.h1>
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1.5, duration: 1 }}
              className="mt-4 text-cyan-400/60 font-medium tracking-widest text-sm uppercase"
            >
              AI-Powered Healthcare
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <Routes>
      <Route path="/" element={
        <div className="min-h-screen flex flex-col bg-background text-slate-800">
          <Navbar />
          <main className="flex-grow pt-20">
            <Home />
          </main>
        </div>
      } />
      
      <Route element={<AuthLayout />}>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
      </Route>

      {/* Protected Dashboard Routes */}
      <Route element={<ProtectedRoute />}>
        <Route path="/dashboard" element={<DashboardLayout />}>
          <Route index element={<Dashboard />} />
          <Route path="tracker" element={<HealthTracker />} />
          <Route path="anatomy" element={<BodyExplorer />} />
          <Route path="medication" element={<Medication />} />
          <Route path="doctors" element={<DoctorFinder />} />
          <Route path="reports" element={<MedicalReports />} />

          <Route path="ai" element={<AiAssistant />} />
          <Route path="profile" element={<Profile />} />
          <Route path="settings" element={<Settings />} />
        </Route>
      </Route>

      <Route path="*" element={<NotFound404 />} />
      </Routes>
    </>
  );
}

export default App;
