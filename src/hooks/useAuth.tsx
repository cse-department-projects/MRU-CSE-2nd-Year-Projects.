import React, { createContext, useContext, useState, useEffect } from 'react';
import { StakeholderRole, StakeholderUser } from '../types';

export const DEMO_USERS: Record<StakeholderRole, StakeholderUser> = {
  citizen: {
    id: 'usr-cit-001',
    name: 'Aarav Sharma',
    email: 'aarav.citizen@sentinel-ews.org',
    role: 'citizen',
    roleTitle: 'Resident / Citizen',
    organization: 'Yamuna River Basin Community',
    jurisdiction: 'Sector 4, New Delhi',
    phone: '+91 98765 43210',
    verified: true,
    accessibleModules: ['Dashboard', 'Live Map', 'Warnings & Alerts', 'Citizen Safety Guide', 'Shelters & Relief Ops']
  },
  ngo: {
    id: 'usr-ngo-002',
    name: 'Priya Mukherjee',
    email: 'priya.relief@redcross-response.org',
    role: 'ngo',
    roleTitle: 'NGO Relief Coordinator',
    organization: 'International Disaster Relief & Red Cross',
    jurisdiction: 'Northern Zone Field Operations',
    phone: '+91 91234 56789',
    badgeId: 'NGO-VOL-8821',
    verified: true,
    accessibleModules: ['Dashboard', 'Live Map', 'Warnings & Alerts', 'Shelters & Relief Ops', '72h AI Forecast', 'Risk Trends']
  },
  government: {
    id: 'usr-gov-003',
    name: 'Dr. Rajesh Verma, IAS',
    email: 'rajesh.verma@ndma.gov.in',
    role: 'government',
    roleTitle: 'NDMA Authority Disaster Director',
    organization: 'National Disaster Management Authority (NDMA)',
    jurisdiction: 'National Central Operations Command',
    phone: '+91 11 2670 1700',
    badgeId: 'GOV-NDMA-0019',
    verified: true,
    accessibleModules: ['All Modules', 'Broadcast Alerts', 'Sensor Overrides', 'Evacuation Orders', 'Resource Dispatch']
  },
  first_responder: {
    id: 'usr-resp-004',
    name: 'Commander Vikram Singh',
    email: 'v.singh@ndrf.gov.in',
    role: 'first_responder',
    roleTitle: 'NDRF 8th Battalion Commander',
    organization: 'National Disaster Response Force (NDRF)',
    jurisdiction: 'Rapid Deployment Task Force #4',
    phone: '+91 94567 89012',
    badgeId: 'NDRF-BAT-084',
    verified: true,
    accessibleModules: ['Tactical Dispatch', 'Live Map', 'Incident Reports', 'GPS Rescue Navigation', 'Warnings & Alerts']
  }
};

interface AuthContextType {
  user: StakeholderUser | null;
  isAuthenticated: boolean;
  login: (email: string, role: StakeholderRole, name?: string) => void;
  loginWithPreset: (role: StakeholderRole) => void;
  register: (userData: Omit<StakeholderUser, 'id' | 'verified'>) => void;
  logout: () => void;
  switchRole: (role: StakeholderRole) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Default to citizen user or persisted user in localStorage
  const [user, setUser] = useState<StakeholderUser | null>(() => {
    try {
      const saved = localStorage.getItem('sentinel_active_user');
      if (saved) {
        return JSON.parse(saved);
      }
      return DEMO_USERS.citizen;
    } catch {
      return DEMO_USERS.citizen;
    }
  });

  useEffect(() => {
    if (user) {
      localStorage.setItem('sentinel_active_user', JSON.stringify(user));
    } else {
      localStorage.removeItem('sentinel_active_user');
    }
  }, [user]);

  const login = (email: string, role: StakeholderRole, name?: string) => {
    const template = DEMO_USERS[role];
    const loggedUser: StakeholderUser = {
      ...template,
      id: `usr-${Date.now().toString().slice(-4)}`,
      name: name || template.name,
      email: email || template.email,
      role
    };
    setUser(loggedUser);
  };

  const loginWithPreset = (role: StakeholderRole) => {
    setUser(DEMO_USERS[role]);
  };

  const register = (userData: Omit<StakeholderUser, 'id' | 'verified'>) => {
    const newUser: StakeholderUser = {
      ...userData,
      id: `usr-reg-${Date.now().toString().slice(-4)}`,
      verified: true
    };
    setUser(newUser);
  };

  const logout = () => {
    setUser(null);
  };

  const switchRole = (role: StakeholderRole) => {
    setUser(DEMO_USERS[role]);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        login,
        loginWithPreset,
        register,
        logout,
        switchRole
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
