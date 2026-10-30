import React, { useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './hooks/useAuth';
import { AppShell } from './layouts/AppShell';
import { LandingPage } from './pages/LandingPage';
import { LoginPage } from './pages/LoginPage';
import { CinematicIntro } from './components/landing/CinematicIntro';
import { DashboardPage } from './pages/DashboardPage';
import { LiveMapPage } from './pages/LiveMapPage';
import { AlertsPage } from './pages/AlertsPage';
import { PredictionsPage } from './pages/PredictionsPage';
import { SensorsPage } from './pages/SensorsPage';
import { AnalyticsPage } from './pages/AnalyticsPage';
import { ResponsePage } from './pages/ResponsePage';
import { SafetyGuidePage } from './pages/SafetyGuidePage';
import { SettingsPage } from './pages/SettingsPage';
import { SystemStatusPage } from './pages/SystemStatusPage';
import { DesignPosterPage } from './pages/DesignPosterPage';

export default function App() {
  // Always start with landing intro on reload / initial load
  const [showIntro, setShowIntro] = useState<boolean>(true);

  const handleCompleteIntro = () => {
    setShowIntro(false);
  };

  return (
    <AuthProvider>
      <BrowserRouter>
        {showIntro && <CinematicIntro onComplete={handleCompleteIntro} />}
        
        <Routes>
          {/* Public Landing, Auth & UI Poster Views */}
          <Route path="/" element={<LandingPage />} />
          <Route path="/landing" element={<LandingPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/signup" element={<LoginPage />} />
          <Route path="/poster" element={<DesignPosterPage />} />
          <Route path="/ui-poster" element={<DesignPosterPage />} />
          <Route path="/ui-design-poster" element={<DesignPosterPage />} />

          {/* Dedicated Console Routes wrapped in AppShell */}
          <Route path="/dashboard" element={<AppShell><DashboardPage /></AppShell>} />
          <Route path="/map" element={<AppShell><LiveMapPage /></AppShell>} />
          <Route path="/alerts" element={<AppShell><AlertsPage /></AppShell>} />
          <Route path="/safety" element={<AppShell><SafetyGuidePage /></AppShell>} />
          <Route path="/predictions" element={<AppShell><PredictionsPage /></AppShell>} />
          <Route path="/sensors" element={<AppShell><SensorsPage /></AppShell>} />
          <Route path="/analytics" element={<AppShell><AnalyticsPage /></AppShell>} />
          <Route path="/response" element={<AppShell><ResponsePage /></AppShell>} />
          <Route path="/settings" element={<AppShell><SettingsPage /></AppShell>} />
          <Route path="/status" element={<AppShell><SystemStatusPage /></AppShell>} />
          
          {/* Fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

