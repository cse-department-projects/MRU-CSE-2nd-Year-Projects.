import { HashRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { useEffect } from 'react';
import { Navbar } from './components/layout/Navbar';
import { Footer } from './components/layout/Footer';
import { HomePage } from './pages/HomePage';
import { ReportPage } from './pages/ReportPage';
import { IssuesPage } from './pages/IssuesPage';
import { RecyclePage } from './pages/RecyclePage';
import { IdeasPage } from './pages/IdeasPage';
import { ReportsProvider } from './context/ReportsContext';
import { Link } from 'react-router-dom';

function RouteEffects() {
  const location = useLocation();
  useEffect(() => {
    document.title = `${({ '/': 'EcoVision — Saving Our Planet', '/report': 'Report an Issue', '/issues': 'Community Issues', '/recycle': 'Recycling Guide', '/ideas': 'Innovative Ideas' } as Record<string, string>)[location.pathname] ?? 'EcoVision'} | EcoVision`;
    const target = (location.state as { scrollTarget?: string } | null)?.scrollTarget;
    if (target) requestAnimationFrame(() => document.getElementById(target)?.scrollIntoView({ behavior: 'smooth' }));
    else window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [location.pathname, location.hash, location.state]);
  return null;
}

export default function App() {
  return (
    <ReportsProvider>
      <Router>
        <RouteEffects />
        <div className="flex flex-col min-h-screen">
          <Navbar />
          <main className="flex-grow pt-[76px]">
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/report" element={<ReportPage />} />
              <Route path="/issues" element={<IssuesPage />} />
              <Route path="/recycle" element={<RecyclePage />} />
              <Route path="/ideas" element={<IdeasPage />} />
              <Route path="*" element={<div className="mx-auto flex min-h-[60vh] max-w-3xl flex-col items-center justify-center px-5 text-center"><span className="text-7xl">🌱</span><h1 className="mt-5 text-4xl">This path hasn’t sprouted yet</h1><p className="mt-3 text-forest-600">The page you’re looking for may have moved.</p><Link to="/" className="action-button mt-6">Back to EcoVision</Link></div>} />
            </Routes>
          </main>
          <Footer />
        </div>
      </Router>
    </ReportsProvider>
  );
}
