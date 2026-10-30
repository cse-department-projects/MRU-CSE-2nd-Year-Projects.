import { useState } from 'react';
import { useReports } from '../../hooks/useReports';
import type { ProblemType } from '../../types';
import { ImageUpload } from '../ui/ImageUpload';
import { saveImage } from '../../storage/images';

export const ReportForm = () => {
  const { addReport } = useReports();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [area, setArea] = useState('');
  const [problemType, setProblemType] = useState<ProblemType>('Other');
  const [file, setFile] = useState<File | null>(null);
  const [message, setMessage] = useState('');
  const [saving, setSaving] = useState(false);
  
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSaving(true); setMessage('');
    try {
      const imageId = file ? await saveImage(file) : null;
      addReport({ title: title.trim(), description: description.trim(), area: area.trim(), problemType, imageId, reporterName: null, status: 'pending' });
      setTitle(''); setDescription(''); setArea(''); setFile(null);
      setMessage('Your report has been saved on this device. Thank you for speaking up.');
    } catch {
      setMessage('We could not save this report. Please check your browser storage and try again.');
    } finally { setSaving(false); }
  };

  return (
    <form onSubmit={handleSubmit} className="surface-card p-6 sm:p-7">
      <h2 className="text-2xl font-heading text-forest-950 mb-6">Submit a report</h2>
      <div className="space-y-4">
        <div><label htmlFor="report-title" className="block text-sm font-bold mb-1.5">Title *</label>
        <input id="report-title" required minLength={3} maxLength={100} value={title} onChange={e=>setTitle(e.target.value)} className="field" placeholder="e.g. Plastic waste near MG Road"/></div>
        
        <div><label htmlFor="report-area" className="block text-sm font-bold mb-1.5">Area / location *</label>
        <input id="report-area" required minLength={2} maxLength={100} value={area} onChange={e=>setArea(e.target.value)} className="field" placeholder="e.g. Sector 14, Delhi"/></div>
        
        <div><label htmlFor="report-type" className="block text-sm font-bold mb-1.5">Problem type *</label>
        <select id="report-type" value={problemType} onChange={e=>setProblemType(e.target.value as ProblemType)} className="field">
          <option value="Trash & Litter">Trash & Litter</option><option value="Water Pollution">Water Pollution</option>
          <option value="Air Pollution">Air Pollution</option><option value="Deforestation">Deforestation</option><option value="Government Issue">Government Issue</option><option value="Roads & Infrastructure">Roads & Infrastructure</option><option value="Wildlife Threat">Wildlife Threat</option><option value="Other">Other</option>
        </select></div>
        
        <div><label htmlFor="report-description" className="block text-sm font-bold mb-1.5">Description *</label>
        <textarea id="report-description" required minLength={10} maxLength={1000} value={description} onChange={e=>setDescription(e.target.value)} className="field min-h-28 resize-y" placeholder="What did you notice? When did it happen? What could help?"/></div>
        
        <div><label className="block text-sm font-bold mb-1.5">Photo (optional, max 5 MB)</label>
        <ImageUpload onImageSelected={setFile} /></div>
        
        <button type="submit" disabled={saving} className="action-button w-full disabled:cursor-wait disabled:opacity-60">{saving ? 'Saving report…' : 'Submit report'}</button>
        {message && <p role="status" className="rounded-xl bg-leaf-50 p-3 text-sm font-semibold text-forest-700">{message}</p>}
      </div>
    </form>
  );
};
