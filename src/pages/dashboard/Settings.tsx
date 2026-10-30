import { useState } from 'react';
import { Bell, Lock, Shield, Smartphone, Globe, EyeOff, Moon } from 'lucide-react';
import { useApp } from '../../hooks/useApp';

export default function Settings() {
  const [activeTab, setActiveTab] = useState('notifications');
  const { settings, toggleSetting } = useApp();

  const tabs = [
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'privacy', label: 'Privacy & Security', icon: Shield },
    { id: 'appearance', label: 'Appearance', icon: Moon },
    { id: 'devices', label: 'Connected Devices', icon: Smartphone },
  ];

  return (
    <div className="max-w-6xl mx-auto flex flex-col md:flex-row gap-8 font-inter">
      {/* Sidebar Tabs */}
      <div className="w-full md:w-72 space-y-3 flex-shrink-0">
        <h1 className="text-3xl sm:text-4xl font-poppins font-bold text-slate-900 mb-8 tracking-tight px-2">Settings</h1>
        
        <div className="flex md:flex-col gap-2 overflow-x-auto hide-scrollbar pb-2 md:pb-0 px-2 md:px-0">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`w-full flex items-center space-x-3 px-5 py-3.5 rounded-2xl text-sm font-bold transition-all whitespace-nowrap ${
                activeTab === tab.id 
                  ? 'bg-slate-900 text-white shadow-md' 
                  : 'text-slate-500 hover:bg-white hover:text-slate-800 hover:shadow-sm border border-transparent hover:border-gray-100'
              }`}
            >
              <tab.icon className={`w-5 h-5 ${activeTab === tab.id ? 'text-white' : 'text-slate-400'}`} />
              <span>{tab.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1">
        <div className="bg-white border border-gray-100 p-8 sm:p-10 rounded-[32px] shadow-sm min-h-[600px] relative overflow-hidden">
          
          <div className="absolute top-0 right-0 w-64 h-64 bg-slate-50 rounded-full blur-[80px] pointer-events-none" />

          {activeTab === 'notifications' && (
            <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 relative z-10">
              <div className="border-b border-gray-100 pb-6">
                <h2 className="text-2xl font-poppins font-bold text-slate-900">Notification Preferences</h2>
                <p className="text-slate-500 font-medium mt-1">Manage how you receive alerts and updates.</p>
              </div>
              
              <div className="space-y-6">
                {[
                  { id: 'appointmentReminders', title: 'Appointment Reminders', desc: 'Receive alerts 24h and 1h before your scheduled visits.' },
                  { id: 'medicationAlerts', title: 'Medication Alerts', desc: 'Push notifications for daily medication schedules.' },
                  { id: 'newTestResults', title: 'New Test Results', desc: 'Email alerts when new medical reports are analyzed by AI.' },
                  { id: 'weeklySummary', title: 'Weekly Health Summary', desc: 'A weekly digest of your health metrics via email.' }
                ].map((item) => (
                  <div key={item.id} className="flex items-start justify-between p-4 -mx-4 hover:bg-slate-50 rounded-2xl transition-colors group">
                    <div>
                      <h4 className="text-[15px] font-bold text-slate-900 group-hover:text-primary transition-colors">{item.title}</h4>
                      <p className="text-sm font-medium text-slate-500 mt-1">{item.desc}</p>
                    </div>
                    {/* Interactive Toggle Switch */}
                    <div 
                      onClick={() => toggleSetting(item.id)}
                      className={`w-14 h-8 rounded-full relative cursor-pointer shadow-inner transition-colors flex-shrink-0 border ${
                        settings[item.id] ? 'bg-primary border-primary' : 'bg-slate-100 border-gray-200'
                      }`}
                    >
                      <div className={`absolute top-1 w-6 h-6 bg-white rounded-full shadow-md transition-all ${
                        settings[item.id] ? 'right-1' : 'left-1'
                      }`}></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'privacy' && (
            <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 relative z-10">
              <div className="border-b border-gray-100 pb-6">
                <h2 className="text-2xl font-poppins font-bold text-slate-900">Privacy & Security</h2>
                <p className="text-slate-500 font-medium mt-1">Manage your data sharing and account security.</p>
              </div>
              
              <div className="space-y-8">
                <div className="flex items-center justify-between p-6 bg-slate-50 border border-gray-100 rounded-[24px]">
                  <div className="flex items-center space-x-5">
                    <div className="p-3 bg-white rounded-xl shadow-sm border border-gray-100"><Lock className="w-6 h-6 text-slate-400" /></div>
                    <div>
                      <h4 className="text-[15px] font-bold text-slate-900">Password</h4>
                      <p className="text-sm font-medium text-slate-500 mt-1">Last changed 3 months ago</p>
                    </div>
                  </div>
                  <button className="px-5 py-2.5 bg-white border border-gray-200 rounded-xl text-sm font-bold text-slate-700 hover:bg-slate-900 hover:text-white transition-all shadow-sm">Update</button>
                </div>
                
                <div className="flex items-start justify-between p-6 border border-gray-100 rounded-[24px] hover:border-gray-200 transition-colors">
                  <div>
                    <h4 className="text-[15px] font-bold text-slate-900 flex items-center">
                      <EyeOff className="w-5 h-5 mr-3 text-slate-400" /> Anonymous Data Donation
                    </h4>
                    <p className="text-sm font-medium text-slate-500 mt-2 max-w-md leading-relaxed">
                      Allow HealthSphere to use your anonymized health data for global medical research and AI training.
                    </p>
                  </div>
                  <div 
                    onClick={() => toggleSetting('anonymousData')}
                    className={`w-14 h-8 rounded-full relative cursor-pointer shadow-inner transition-colors flex-shrink-0 border mt-2 ${
                      settings.anonymousData ? 'bg-primary border-primary' : 'bg-slate-100 border-gray-200'
                    }`}
                  >
                    <div className={`absolute top-1 w-6 h-6 bg-white rounded-full shadow-md transition-all ${
                      settings.anonymousData ? 'right-1' : 'left-1'
                    }`}></div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {['appearance', 'devices'].includes(activeTab) && (
            <div className="flex flex-col items-center justify-center h-full text-center space-y-5 py-24 animate-in fade-in zoom-in-95 duration-500 relative z-10">
              <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center border border-gray-100 shadow-sm">
                <Globe className="w-10 h-10 text-slate-300" />
              </div>
              <div>
                <h3 className="text-2xl font-poppins font-bold text-slate-900">Coming Soon</h3>
                <p className="text-slate-500 font-medium mt-2 max-w-sm mx-auto leading-relaxed">
                  This settings panel is currently under development for the next premium release.
                </p>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
