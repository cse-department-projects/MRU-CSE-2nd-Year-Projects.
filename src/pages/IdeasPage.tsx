import { useMemo, useState } from 'react';
import type { FormEvent } from 'react';
import { Link } from 'react-router-dom';
import { Lightbulb, Upload, Search, Recycle, Trash2, Image as ImageIcon } from 'lucide-react';
import type { IdeaCategory } from '../types';
import { ImageUpload } from '../components/ui/ImageUpload';
import { deleteImage, saveImage } from '../storage/images';
import { useObjectUrl } from '../hooks/useObjectUrl';

type CommunityIdea = {
  id: string;
  title: string;
  category: IdeaCategory;
  materials: string;
  steps: string;
  createdAt: string;
  imageId: string | null;
};

const categories: IdeaCategory[] = ['Plastic', 'Paper', 'Glass', 'Metal', 'Wood', 'Fabric', 'Other'];
const storageKey = 'ecovision:v1:ideas';

function loadIdeas(): CommunityIdea[] {
  try {
    const saved = JSON.parse(localStorage.getItem(storageKey) || '[]') as Partial<CommunityIdea>[];
    const migrated = saved.map(idea => ({
      ...idea,
      id: idea.id || crypto.randomUUID(),
      imageId: idea.imageId ?? null,
    })) as CommunityIdea[];
    localStorage.setItem(storageKey, JSON.stringify(migrated));
    return migrated;
  } catch { return []; }
}

function IdeaCard({ idea, onDelete }: { idea: CommunityIdea; onDelete: (idea: CommunityIdea) => void }) {
  const imageUrl = useObjectUrl(idea.imageId);
  return <article className="surface-card overflow-hidden">
    {imageUrl
      ? <img src={imageUrl} alt={idea.title} className="h-52 w-full object-cover" />
      : <div className="flex h-24 items-center justify-center gap-2 bg-gradient-to-br from-leaf-50 to-forest-100 text-sm text-forest-600"><ImageIcon size={18} />No photo attached</div>}
    <div className="p-6">
      <div className="flex items-start justify-between gap-3">
        <div><span className="rounded-full bg-leaf-50 px-3 py-1 text-xs font-bold text-leaf-600">{idea.category}</span><h3 className="mt-3 text-xl">{idea.title}</h3></div>
        <div className="flex items-center gap-2"><span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-leaf-50 text-leaf-600"><Recycle size={21} /></span><button type="button" onClick={() => onDelete(idea)} aria-label={`Delete idea: ${idea.title}`} className="inline-flex items-center justify-center rounded-full border border-red-100 p-2 text-red-600 transition hover:border-red-200 hover:bg-red-50"><Trash2 size={16} /></button></div>
      </div>
      <p className="mt-4 text-sm font-bold text-forest-800">Materials</p><p className="mt-1 whitespace-pre-wrap text-sm leading-6 text-forest-600">{idea.materials}</p>
      <p className="mt-4 text-sm font-bold text-forest-800">How to make it</p><p className="mt-1 whitespace-pre-wrap text-sm leading-6 text-forest-600">{idea.steps}</p>
    </div>
  </article>;
}

export const IdeasPage = () => {
  const [ideas, setIdeas] = useState<CommunityIdea[]>(loadIdeas);
  const [category, setCategory] = useState<IdeaCategory | 'All'>('All');
  const [query, setQuery] = useState('');
  const [title, setTitle] = useState('');
  const [kind, setKind] = useState<IdeaCategory>('Plastic');
  const [materials, setMaterials] = useState('');
  const [steps, setSteps] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [uploadKey, setUploadKey] = useState(0);
  const [notice, setNotice] = useState('');
  const [saving, setSaving] = useState(false);

  const filtered = useMemo(() => ideas.filter(idea =>
    (category === 'All' || idea.category === category) && `${idea.title} ${idea.materials} ${idea.steps}`.toLowerCase().includes(query.toLowerCase()),
  ), [ideas, category, query]);

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSaving(true);
    setNotice('');
    let imageId: string | null = null;
    try {
      if (file) imageId = await saveImage(file);
      const next: CommunityIdea[] = [{ id: crypto.randomUUID(), title: title.trim(), category: kind, materials: materials.trim(), steps: steps.trim(), createdAt: new Date().toISOString(), imageId }, ...ideas];
      localStorage.setItem(storageKey, JSON.stringify(next));
      setIdeas(next);
      setTitle(''); setMaterials(''); setSteps(''); setFile(null); setUploadKey(key => key + 1);
      setNotice('Your idea was added to this device’s gallery.');
    } catch {
      if (imageId) await deleteImage(imageId).catch(() => undefined);
      setNotice('This idea could not be saved. Check your browser storage and try again.');
    } finally { setSaving(false); }
  };

  const deleteIdea = async (idea: CommunityIdea) => {
    if (!window.confirm(`Delete “${idea.title}”? This cannot be undone.`)) return;
    const next = ideas.filter(item => item.id !== idea.id);
    try {
      localStorage.setItem(storageKey, JSON.stringify(next));
      setIdeas(next);
      if (idea.imageId) await deleteImage(idea.imageId);
      setNotice('Your idea was deleted from this device.');
    } catch { setNotice('This idea could not be fully deleted. Please try again.'); }
  };

  return <>
    <section className="page-hero"><div className="mx-auto max-w-7xl px-4 py-9 sm:px-5 sm:py-14 md:px-8 md:py-16"><Link to="/" className="mb-6 inline-flex rounded-full bg-white/15 px-4 py-2 text-sm font-bold text-white hover:bg-white/25 sm:mb-7">← &nbsp;Back to Home</Link><div className="flex flex-col gap-4 sm:flex-row sm:items-start"><span className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-white/15 sm:h-16 sm:w-16"><Lightbulb size={25} /></span><div className="min-w-0"><h1 className="text-3xl font-extrabold tracking-tight sm:text-5xl">Innovative Ideas</h1><p className="mt-3 max-w-3xl text-base leading-7 text-white/80 sm:text-lg sm:leading-8">Turned a plastic bottle into a planter? Share your upcycling idea so someone else can try it too.</p></div></div></div></section>
    <section className="mx-auto grid max-w-7xl gap-6 px-4 py-8 sm:gap-8 sm:px-5 sm:py-12 md:px-8 xl:grid-cols-[.95fr_1.05fr]">
      <div className="surface-card h-fit p-6 sm:p-8"><h2 className="flex items-center gap-3 text-2xl"><Upload className="text-leaf-600" />Share your idea</h2><p className="mt-2 text-sm leading-6 text-forest-600">A clear title, a few simple steps, and a photo help others recreate it.</p>
        <form onSubmit={submit} className="mt-6 space-y-4">
          <div><label htmlFor="idea-title" className="mb-1.5 block text-sm font-bold">Project name *</label><input id="idea-title" required minLength={3} maxLength={100} className="field" placeholder="e.g. A planter from an old bottle" value={title} onChange={event => setTitle(event.target.value)} /></div>
          <div><label htmlFor="idea-category" className="mb-1.5 block text-sm font-bold">Material *</label><select id="idea-category" className="field" value={kind} onChange={event => setKind(event.target.value as IdeaCategory)}>{categories.map(value => <option key={value}>{value}</option>)}</select></div>
          <div><label htmlFor="idea-materials" className="mb-1.5 block text-sm font-bold">What you’ll need *</label><textarea id="idea-materials" required maxLength={500} className="field min-h-24 resize-y" placeholder="List the materials and tools..." value={materials} onChange={event => setMaterials(event.target.value)} /></div>
          <div><label htmlFor="idea-steps" className="mb-1.5 block text-sm font-bold">How to make it *</label><textarea id="idea-steps" required minLength={10} maxLength={1500} className="field min-h-32 resize-y" placeholder="Write the steps so someone else can follow along..." value={steps} onChange={event => setSteps(event.target.value)} /></div>
          <div><label className="mb-1.5 block text-sm font-bold">Photo (optional, max 5 MB)</label><ImageUpload key={uploadKey} onImageSelected={setFile} /></div>
          <button className="action-button w-full" type="submit" disabled={saving}>{saving ? 'Saving idea…' : 'Share your idea'} <Lightbulb size={18} /></button>
          {notice && <p role="status" className="text-sm font-semibold text-leaf-600">{notice}</p>}
        </form>
        <p className="mt-5 rounded-xl bg-forest-50 p-3 text-xs leading-5 text-forest-600">Your ideas and photos are saved on this device only.</p>
      </div>
      <div><div className="flex items-center justify-between gap-3"><div><h2 className="text-3xl text-forest-950">Community gallery</h2><p className="mt-1 text-sm text-forest-600">{filtered.length} {filtered.length === 1 ? 'idea' : 'ideas'} shared on this device</p></div><span className="rounded-full bg-forest-100 px-3 py-1 text-sm font-bold text-forest-700">{filtered.length} ideas</span></div>
        <div className="mt-5 flex flex-wrap gap-2">{(['All', ...categories] as const).map(value => <button type="button" key={value} onClick={() => setCategory(value)} className={`rounded-full border px-4 py-2 text-sm font-semibold transition ${category === value ? 'border-[#204b2d] bg-[#204b2d] text-white' : 'border-forest-100 bg-white text-forest-700 hover:bg-leaf-50'}`}>{value}</button>)}</div>
        <label className="relative mt-4 block"><Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-leaf-600" /><input type="search" className="field rounded-full bg-white pl-11" placeholder="Search ideas..." value={query} onChange={event => setQuery(event.target.value)} /></label>
        {filtered.length ? <div className="mt-5 space-y-4">{filtered.map(idea => <IdeaCard key={idea.id} idea={idea} onDelete={deleteIdea} />)}</div> : <div className="surface-card mt-5 flex flex-col items-center px-6 py-16 text-center"><span className="grid h-16 w-16 place-items-center rounded-full bg-leaf-50 text-leaf-600"><Lightbulb size={30} /></span><h3 className="mt-5 text-2xl">{ideas.length ? 'No ideas match yet' : 'No ideas yet'}</h3><p className="mt-2 max-w-sm text-forest-600">{ideas.length ? 'Try a different filter or search.' : 'Be the first to share a clever way to reuse something.'}</p></div>}
      </div>
    </section>
  </>;
};
