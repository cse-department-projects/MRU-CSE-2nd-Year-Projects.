import { useState, useEffect } from 'react';
import { getImage } from '../storage/images';
export function useObjectUrl(imageId: string | null) {
  const [loaded, setLoaded] = useState<{ imageId: string; url: string } | null>(null);
  useEffect(() => {
    if (!imageId) return;
    let objectUrl: string | null = null;
    let cancelled = false;
    getImage(imageId).then(blob => {
      if (blob && !cancelled) {
        objectUrl = URL.createObjectURL(blob);
        setLoaded({ imageId, url: objectUrl });
      }
    });
    return () => {
      cancelled = true;
      if (objectUrl) URL.revokeObjectURL(objectUrl);
    };
  }, [imageId]);
  return loaded?.imageId === imageId ? loaded.url : null;
}
