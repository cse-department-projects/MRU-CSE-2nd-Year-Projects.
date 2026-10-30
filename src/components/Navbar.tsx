import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Menu, X, ChevronRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import Logo from './Logo';
import { supabase } from '../lib/supabase';

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <>
      <nav 
        className={`fixed w-full z-50 transition-all duration-300 ${
          scrolled ? 'bg-white/80 backdrop-blur-md shadow-sm border-b border-gray-200/50 py-3' : 'bg-transparent py-5'
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center">
            {/* Logo */}
            <Link to="/" className="flex items-center space-x-3 group">
              <div className="group-hover:scale-110 group-hover:rotate-3 transition-transform duration-500 ease-out">
                <Logo size={42} />
              </div>
              <span className="text-2xl font-poppins font-bold text-slate-900 tracking-tight group-hover:text-primary transition-colors duration-300">
                HealthSphere
              </span>
            </Link>

            {/* Desktop Auth */}
            <div className="hidden lg:flex items-center space-x-4">
              <Link to="/login">
                <span className="text-sm font-bold text-slate-700 hover:text-primary transition-colors px-2">Sign In</span>
              </Link>
              <button 
                onClick={async () => {
                  // Explicitly sign out of any stale sessions to prevent auto-redirect
                  await supabase.auth.signOut();
                  navigate('/login');
                }}
                className="flex items-center space-x-1.5 px-5 py-2.5 bg-slate-900 text-white rounded-full text-sm font-bold hover:bg-slate-800 hover:shadow-md hover:-translate-y-0.5 transition-all">
                <span>Get Started</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>

            {/* Mobile Menu Button */}
            <button 
              className="lg:hidden p-2 rounded-xl text-slate-600 hover:bg-slate-100 transition-colors"
              onClick={() => setMobileMenuOpen(true)}
            >
              <Menu className="w-6 h-6" />
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile Navigation Overlay */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <>
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 bg-slate-900/20 backdrop-blur-sm lg:hidden"
              onClick={() => setMobileMenuOpen(false)}
            />
            <motion.div 
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: "spring", bounce: 0, duration: 0.4 }}
              className="fixed right-0 top-0 bottom-0 w-[80%] max-w-sm bg-white z-50 shadow-2xl flex flex-col p-6 lg:hidden"
            >
              <div className="flex justify-between items-center mb-10">
                <span className="text-xl font-poppins font-bold text-slate-900">Menu</span>
                <button 
                  onClick={() => setMobileMenuOpen(false)}
                  className="p-2 bg-slate-50 rounded-full text-slate-500 hover:bg-slate-100 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="flex flex-col space-y-3 pt-6 flex-1">
                <Link to="/login" onClick={() => setMobileMenuOpen(false)}>
                  <button className="w-full py-3.5 text-center font-bold text-slate-700 border border-gray-200 rounded-xl hover:bg-slate-50 transition-colors">
                    Sign In
                  </button>
                </Link>
                <button 
                  onClick={async () => {
                    setMobileMenuOpen(false);
                    await supabase.auth.signOut();
                    navigate('/login');
                  }}
                  className="w-full py-3.5 text-center font-bold text-white bg-slate-900 rounded-xl hover:bg-slate-800 transition-colors">
                  Get Started
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
