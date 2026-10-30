import { useEffect, useRef, useState } from 'react';
import type { ChangeEvent } from 'react';
import { ImagePlus, X, Upload } from 'lucide-react';
interface Props { onImageSelected: (file: File | null) => void; }

export const ImageUpload = ({ onImageSelected }: Props) => {
  const [preview, setPreview] = useState<string | null>(null);
  const [error, setError] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);
  useEffect(() => () => { if (preview) URL.revokeObjectURL(preview); }, [preview]);
  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0] || null;
    setError('');
    if (!file) return;
    if (!file.type.startsWith('image/')) { setError('Please choose an image file.'); event.target.value = ''; return; }
    if (file.size > 5 * 1024 * 1024) { setError('That image is too large. Choose an image under 5 MB.'); event.target.value = ''; return; }
    setPreview(URL.createObjectURL(file));
    onImageSelected(file);
  };
  const clear = () => { setPreview(null); onImageSelected(null); setError(''); if (fileInputRef.current) fileInputRef.current.value = ''; };
  return <div className="rounded-2xl border-2 border-dashed border-forest-200 bg-[#f8fbf8] p-4 text-center transition hover:border-leaf-500">
    {preview ? <div className="relative"><img src={preview} alt="Selected report preview" className="mx-auto max-h-56 rounded-xl object-contain"/><button type="button" onClick={clear} aria-label="Remove selected image" className="absolute right-2 top-2 grid h-9 w-9 place-items-center rounded-full bg-forest-950/80 text-white hover:bg-forest-950"><X size={18}/></button><p className="mt-3 text-xs font-semibold text-forest-600">Image ready to attach</p></div> : <label className="flex cursor-pointer flex-col items-center gap-2 py-4"><span className="grid h-14 w-14 place-items-center rounded-full bg-leaf-100 text-leaf-600"><ImagePlus size={26}/></span><span className="font-semibold text-forest-800"><Upload size={15} className="mr-1 inline"/>Choose or take a photo</span><span className="text-xs text-forest-500">JPG, PNG or other image · up to 5 MB</span><input type="file" accept="image/*" onChange={handleFileChange} ref={fileInputRef} className="sr-only" /></label>}
    {error&&<p role="alert" className="mt-2 text-sm font-semibold text-red-700">{error}</p>}
  </div>;
};
