import os
import json

files = {
    "src/types/index.ts": """export type ReportStatus = 'pending' | 'reviewed' | 'resolved';
export type ProblemType = 'Trash & Litter' | 'Water Pollution' | 'Air Pollution' | 'Deforestation' | 'Government Issue' | 'Roads & Infrastructure' | 'Wildlife Threat' | 'Other';
export interface Report {
  id: string; title: string; description: string; area: string; problemType: ProblemType;
  imageId: string | null; imageUrl?: string; reporterName: string | null; status: ReportStatus;
  upvotes: number; createdAt: string; isSeed: boolean; isOwn: boolean;
}
export type IdeaCategory = 'Plastic' | 'Paper' | 'Glass' | 'Metal' | 'Wood' | 'Fabric' | 'Other';
export interface Idea {
  id: string; title: string; whatItIs: string; requiredItems: string; steps: string;
  category: IdeaCategory; imageId: string | null; imageUrl?: string; creatorName: string | null;
  upvotes: number; createdAt: string; isSeed: boolean; isOwn: boolean;
}
""",
    "src/hooks/useLocalStorage.ts": """import { useState, useEffect } from 'react';
export function useLocalStorage<T>(key: string, initialValue: T) {
  const [storedValue, setStoredValue] = useState<T>(() => {
    try {
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      console.log(error); return initialValue;
    }
  });
  const setValue = (value: T | ((val: T) => T)) => {
    try {
      const valueToStore = value instanceof Function ? value(storedValue) : value;
      setStoredValue(valueToStore);
      window.localStorage.setItem(key, JSON.stringify(valueToStore));
    } catch (error) { console.log(error); }
  };
  return [storedValue, setValue] as const;
}
""",
    "src/components/layout/Navbar.tsx": """import { Link } from 'react-router-dom';
export const Navbar = () => (
  <nav className="fixed top-0 w-full p-4 flex justify-between bg-white/80 backdrop-blur z-50">
    <Link to="/" className="font-bold text-xl text-forest-950">EcoVision</Link>
    <div className="flex gap-4">
      <Link to="/report" className="text-forest-600 hover:text-forest-950">Report</Link>
      <Link to="/issues" className="text-forest-600 hover:text-forest-950">Issues</Link>
      <Link to="/recycle" className="text-forest-600 hover:text-forest-950">Recycle</Link>
      <Link to="/ideas" className="text-forest-600 hover:text-forest-950">Ideas</Link>
    </div>
  </nav>
);
""",
    "src/components/layout/Footer.tsx": """export const Footer = () => (
  <footer className="bg-forest-950 text-white p-8 text-center mt-auto">
    <p>Made with &hearts; for our planet.</p>
  </footer>
);
""",
    "src/pages/HomePage.tsx": """import { Link } from 'react-router-dom';
export const HomePage = () => (
  <div className="flex flex-col items-center justify-center min-h-screen text-center p-8 bg-forest-100">
    <h1 className="text-4xl md:text-6xl text-forest-950 mb-4">EcoVision</h1>
    <p className="text-xl text-forest-600 mb-8 max-w-2xl">Saving Our Planet, One Action at a Time. Learn, Report, Recycle, and Make an Impact today.</p>
    <Link to="/report" className="px-6 py-3 bg-leaf-500 text-white rounded-full font-bold hover:bg-leaf-600 transition">Take Action</Link>
  </div>
);
""",
    "src/pages/ReportPage.tsx": """export const ReportPage = () => <div className="p-8"><h1>Report Issue</h1><p>WIP: Form goes here</p></div>;""",
    "src/pages/IssuesPage.tsx": """export const IssuesPage = () => <div className="p-8"><h1>Issues Raised</h1><p>WIP: Grid goes here</p></div>;""",
    "src/pages/RecyclePage.tsx": """export const RecyclePage = () => <div className="p-8"><h1>Recycling Guide</h1><p>WIP: Process steps go here</p></div>;""",
    "src/pages/IdeasPage.tsx": """export const IdeasPage = () => <div className="p-8"><h1>Innovative Ideas</h1><p>WIP: Gallery goes here</p></div>;""",
    "src/App.tsx": """import { HashRouter as Router, Routes, Route } from 'react-router-dom';
import { Navbar } from './components/layout/Navbar';
import { Footer } from './components/layout/Footer';
import { HomePage } from './pages/HomePage';
import { ReportPage } from './pages/ReportPage';
import { IssuesPage } from './pages/IssuesPage';
import { RecyclePage } from './pages/RecyclePage';
import { IdeasPage } from './pages/IdeasPage';

export default function App() {
  return (
    <Router>
      <div className="flex flex-col min-h-screen">
        <Navbar />
        <main className="flex-grow pt-16">
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/report" element={<ReportPage />} />
            <Route path="/issues" element={<IssuesPage />} />
            <Route path="/recycle" element={<RecyclePage />} />
            <Route path="/ideas" element={<IdeasPage />} />
          </Routes>
        </main>
        <Footer />
      </div>
    </Router>
  );
}
"""
}

for path, content in files.items():
    full_path = os.path.join(r"c:\Users\Lenovo\OneDrive\Desktop\Evovision", path)
    os.makedirs(os.path.dirname(full_path), exist_ok=True)
    with open(full_path, "w", encoding="utf-8") as f:
        f.write(content)

print("Files generated successfully.")
