import os

files = {
    "src/storage/images.ts": """import { get, set, del } from 'idb-keyval';
export async function saveImage(file: File): Promise<string> {
  const imageId = `img-${Date.now()}-${Math.random().toString(36).slice(2,8)}`;
  await set(imageId, file);
  return imageId;
}
export async function getImage(imageId: string): Promise<Blob | undefined> {
  return await get(imageId);
}
export async function deleteImage(imageId: string): Promise<void> {
  await del(imageId);
}
""",
    "src/hooks/useObjectUrl.ts": """import { useState, useEffect } from 'react';
import { getImage } from '../storage/images';
export function useObjectUrl(imageId: string | null) {
  const [url, setUrl] = useState<string | null>(null);
  useEffect(() => {
    if (!imageId) { setUrl(null); return; }
    let objectUrl: string | null = null;
    getImage(imageId).then(blob => {
      if (blob) {
        objectUrl = URL.createObjectURL(blob);
        setUrl(objectUrl);
      }
    });
    return () => {
      if (objectUrl) URL.revokeObjectURL(objectUrl);
    };
  }, [imageId]);
  return url;
}
""",
    "src/context/ReportsContext.tsx": """import React, { createContext, useContext, useEffect } from 'react';
import { useLocalStorage } from '../hooks/useLocalStorage';
import { Report } from '../types';

interface ReportsContextType {
  reports: Report[];
  addReport: (report: Omit<Report, 'id' | 'createdAt' | 'isOwn' | 'isSeed' | 'upvotes'>) => void;
}
const ReportsContext = createContext<ReportsContextType | undefined>(undefined);

export const ReportsProvider: React.FC<{children: React.ReactNode}> = ({ children }) => {
  const [reports, setReports] = useLocalStorage<Report[]>('ecovision:v1:reports', []);
  
  const addReport = (data: Omit<Report, 'id' | 'createdAt' | 'isOwn' | 'isSeed' | 'upvotes'>) => {
    const newReport: Report = {
      ...data,
      id: crypto.randomUUID(),
      createdAt: new Date().toISOString(),
      isOwn: true,
      isSeed: false,
      upvotes: 0
    };
    setReports(prev => [newReport, ...prev]);
  };
  
  return <ReportsContext.Provider value={{ reports, addReport }}>{children}</ReportsContext.Provider>;
};

export const useReports = () => {
  const context = useContext(ReportsContext);
  if (!context) throw new Error('useReports must be used within ReportsProvider');
  return context;
};
""",
    "src/utils/timeAgo.ts": """export function timeAgo(date: string) {
  const seconds = Math.floor((new Date().getTime() - new Date(date).getTime()) / 1000);
  let interval = seconds / 31536000;
  if (interval > 1) return Math.floor(interval) + " years ago";
  interval = seconds / 2592000;
  if (interval > 1) return Math.floor(interval) + " months ago";
  interval = seconds / 86400;
  if (interval > 1) return Math.floor(interval) + " days ago";
  interval = seconds / 3600;
  if (interval > 1) return Math.floor(interval) + " hours ago";
  interval = seconds / 60;
  if (interval > 1) return Math.floor(interval) + " minutes ago";
  return "just now";
}
""",
    "src/components/ui/ImageUpload.tsx": """import React, { useRef, useState } from 'react';
interface Props { onImageSelected: (file: File | null) => void; }
export const ImageUpload: React.FC<Props> = ({ onImageSelected }) => {
  const [preview, setPreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    if (file) {
      if (file.size > 5 * 1024 * 1024) { alert('File too large (max 5MB)'); return; }
      const url = URL.createObjectURL(file);
      setPreview(url);
      onImageSelected(file);
    }
  };
  const clear = () => { setPreview(null); onImageSelected(null); if (fileInputRef.current) fileInputRef.current.value = ''; };
  return (
    <div className="border-2 border-dashed border-forest-100 rounded-lg p-4 text-center">
      {preview ? (
        <div className="relative">
          <img src={preview} alt="Preview" className="max-h-48 mx-auto rounded" />
          <button type="button" onClick={clear} className="absolute top-2 right-2 bg-red-500 text-white rounded-full w-6 h-6 leading-none">&times;</button>
        </div>
      ) : (
        <div>
          <p className="mb-2 text-forest-600">Drag & drop or click to upload</p>
          <input type="file" accept="image/*" onChange={handleFileChange} ref={fileInputRef} className="text-sm" />
        </div>
      )}
    </div>
  );
};
""",
    "src/components/reports/ReportForm.tsx": """import React, { useState } from 'react';
import { useReports } from '../../context/ReportsContext';
import { ProblemType } from '../../types';
import { ImageUpload } from '../ui/ImageUpload';
import { saveImage } from '../../storage/images';

export const ReportForm = () => {
  const { addReport } = useReports();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [area, setArea] = useState('');
  const [problemType, setProblemType] = useState<ProblemType>('Other');
  const [file, setFile] = useState<File | null>(null);
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !description || !area) return alert("Fill all required fields");
    let imageId = null;
    if (file) { imageId = await saveImage(file); }
    addReport({ title, description, area, problemType, imageId, reporterName: null, status: 'pending' });
    setTitle(''); setDescription(''); setArea(''); setFile(null);
    alert('Report submitted successfully!');
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white p-6 rounded-xl shadow-sm border border-forest-100">
      <h2 className="text-2xl font-heading text-forest-950 mb-6">Report an Issue</h2>
      <div className="space-y-4">
        <div><label className="block text-sm font-bold mb-1">Title *</label>
        <input required value={title} onChange={e=>setTitle(e.target.value)} className="w-full p-2 border rounded" placeholder="What is the issue?"/></div>
        
        <div><label className="block text-sm font-bold mb-1">Location *</label>
        <input required value={area} onChange={e=>setArea(e.target.value)} className="w-full p-2 border rounded" placeholder="City, Area, or Landmark"/></div>
        
        <div><label className="block text-sm font-bold mb-1">Type *</label>
        <select value={problemType} onChange={e=>setProblemType(e.target.value as ProblemType)} className="w-full p-2 border rounded">
          <option value="Trash & Litter">Trash & Litter</option><option value="Water Pollution">Water Pollution</option>
          <option value="Air Pollution">Air Pollution</option><option value="Deforestation">Deforestation</option>
          <option value="Other">Other</option>
        </select></div>
        
        <div><label className="block text-sm font-bold mb-1">Description *</label>
        <textarea required value={description} onChange={e=>setDescription(e.target.value)} className="w-full p-2 border rounded h-24" placeholder="Describe the problem..."/></div>
        
        <div><label className="block text-sm font-bold mb-1">Photo (Optional, Max 5MB)</label>
        <ImageUpload onImageSelected={setFile} /></div>
        
        <button type="submit" className="w-full bg-leaf-500 text-white font-bold py-3 rounded hover:bg-leaf-600 transition">Submit Report</button>
      </div>
    </form>
  );
};
""",
    "src/components/reports/ReportCard.tsx": """import React from 'react';
import { Report } from '../../types';
import { useObjectUrl } from '../../hooks/useObjectUrl';
import { timeAgo } from '../../utils/timeAgo';

export const ReportCard: React.FC<{report: Report}> = ({ report }) => {
  const imageUrl = useObjectUrl(report.imageId);
  const displayUrl = report.imageUrl || imageUrl;
  
  return (
    <div className="bg-white rounded-xl shadow-sm border border-forest-100 overflow-hidden flex flex-col">
      {displayUrl ? <img src={displayUrl} alt={report.title} className="h-48 w-full object-cover"/> : <div className="h-12 bg-forest-100 flex items-center justify-center text-forest-600 text-sm">No Photo</div>}
      <div className="p-4 flex-grow flex flex-col">
        <div className="flex gap-2 mb-2">
          <span className="text-xs font-bold px-2 py-1 bg-sky-100 text-sky-900 rounded">{report.status}</span>
          <span className="text-xs font-bold px-2 py-1 bg-earth-100 text-earth-900 rounded">{report.problemType}</span>
        </div>
        <h3 className="font-heading font-bold text-lg mb-1">{report.title}</h3>
        <p className="text-sm text-forest-600 mb-2">📍 {report.area}</p>
        <p className="text-sm line-clamp-3 mb-4">{report.description}</p>
        <div className="mt-auto flex justify-between items-center text-xs text-forest-500">
          <span>{timeAgo(report.createdAt)}</span>
          <button className="flex items-center gap-1 font-bold text-leaf-600 hover:text-leaf-500">👍 {report.upvotes}</button>
        </div>
      </div>
    </div>
  );
};
""",
    "src/components/reports/ReportFeed.tsx": """import React from 'react';
import { useReports } from '../../context/ReportsContext';
import { ReportCard } from './ReportCard';

export const ReportFeed = () => {
  const { reports } = useReports();
  return (
    <div>
      <h2 className="text-2xl font-heading text-forest-950 mb-6">Recent Reports</h2>
      {reports.length === 0 ? (
        <div className="bg-white p-8 text-center rounded-xl border border-forest-100">No reports yet. Be the first to take action!</div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {reports.slice(0, 10).map(report => <ReportCard key={report.id} report={report} />)}
        </div>
      )}
    </div>
  );
};
""",
    "src/pages/ReportPage.tsx": """import React from 'react';
import { ReportForm } from '../components/reports/ReportForm';
import { ReportFeed } from '../components/reports/ReportFeed';

export const ReportPage = () => (
  <div className="max-w-7xl mx-auto px-4 py-8 grid lg:grid-cols-[400px_1fr] gap-8">
    <div>
      <div className="bg-sky-50 text-sky-900 p-4 rounded-lg mb-6 text-sm border border-sky-200">
        ℹ️ Your reports are saved on this device only.
      </div>
      <ReportForm />
    </div>
    <ReportFeed />
  </div>
);
""",
    "src/App.tsx": """import { HashRouter as Router, Routes, Route } from 'react-router-dom';
import { Navbar } from './components/layout/Navbar';
import { Footer } from './components/layout/Footer';
import { HomePage } from './pages/HomePage';
import { ReportPage } from './pages/ReportPage';
import { IssuesPage } from './pages/IssuesPage';
import { RecyclePage } from './pages/RecyclePage';
import { IdeasPage } from './pages/IdeasPage';
import { ReportsProvider } from './context/ReportsContext';

export default function App() {
  return (
    <ReportsProvider>
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
    </ReportsProvider>
  );
}
"""
}

for path, content in files.items():
    full_path = os.path.join(r"c:\Users\Lenovo\OneDrive\Desktop\Evovision", path)
    os.makedirs(os.path.dirname(full_path), exist_ok=True)
    with open(full_path, "w", encoding="utf-8") as f:
        f.write(content)

print("Phase 3 & 4 files generated successfully.")
