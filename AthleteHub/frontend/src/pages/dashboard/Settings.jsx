import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { User, Palette, Shield, Bell, Lock, Sliders, Info, Activity } from 'lucide-react';
import { AppearanceSettings } from './settings/AppearanceSettings';
import { ErrorBoundary } from '@/components/ui/ErrorBoundary';

// Only functional, verified options are exposed
const SETTINGS_SECTIONS = [
  { id: 'appearance', label: 'Theme & Appearance', icon: Palette, component: AppearanceSettings },
];

export default function Settings() {
  const location = useLocation();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('appearance');

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const tab = params.get('tab');
    if (tab && SETTINGS_SECTIONS.find(s => s.id === tab)) {
      setActiveTab(tab);
    } else {
      setActiveTab('appearance');
    }
  }, [location]);

  const handleTabChange = (id) => {
    setActiveTab(id);
    navigate(`/dashboard/settings?tab=${id}`, { replace: true });
  };

  const ActiveComponent = SETTINGS_SECTIONS.find(s => s.id === activeTab)?.component || AppearanceSettings;

  return (
    <div className="space-y-8 page-enter max-w-6xl mx-auto">
      <div>
        <div className="flex items-center gap-3">
          <h1 className="text-3xl font-extrabold tracking-tight text-foreground">Account & System Preferences</h1>
          <span className="font-mono-telemetry text-xs font-bold px-2.5 py-0.5 rounded-full bg-primary/10 text-primary border border-primary/20">
            Settings Console
          </span>
        </div>
        <p className="text-muted-foreground mt-1 text-sm">Configure display themes, color palettes, and interface appearance.</p>
      </div>

      <div className="flex flex-col md:flex-row gap-8 pb-12">
        <div className="w-full md:w-64 shrink-0">
          <nav className="card-telemetry-elevated p-2 space-y-1">
            {SETTINGS_SECTIONS.map((section) => (
              <button
                key={section.id}
                onClick={() => handleTabChange(section.id)}
                className={cn(
                  "flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all text-left w-full",
                  activeTab === section.id 
                    ? "bg-primary text-primary-foreground shadow-xs font-bold" 
                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                )}
              >
                <section.icon className="w-4 h-4 shrink-0" />
                {section.label}
              </button>
            ))}
          </nav>
        </div>
        
        <div className="flex-1 min-w-0">
          <ErrorBoundary>
            <ActiveComponent />
          </ErrorBoundary>
        </div>
      </div>
    </div>
  );
}
