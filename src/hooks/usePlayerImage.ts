import { useState, useEffect } from 'react';

// Simple in-memory cache so we don't spam Wikipedia
const imageCache: Record<string, string | null> = {};

export function usePlayerImage(name: string) {
  const [imageUrl, setImageUrl] = useState<string | null>(imageCache[name] || null);

  useEffect(() => {
    if (imageCache[name] !== undefined) {
      setImageUrl(imageCache[name]);
      return;
    }

    let isMounted = true;
    
    // We append ' football' to generic names to increase chance of finding the player
    const searchTerm = name + ' footballer';

    const url = `https://en.wikipedia.org/w/api.php?action=query&generator=search&gsrsearch=${encodeURIComponent(searchTerm)}&gsrlimit=1&prop=pageimages&format=json&pithumbsize=400&origin=*`;

    fetch(url)
      .then(res => res.json())
      .then(data => {
        if (!isMounted) return;
        const pages = data?.query?.pages;
        if (pages) {
          const pageId = Object.keys(pages)[0];
          const thumb = pages[pageId]?.thumbnail?.source;
          if (thumb) {
            imageCache[name] = thumb;
            setImageUrl(thumb);
            return;
          }
        }
        // Fallback
        imageCache[name] = null;
        setImageUrl(null);
      })
      .catch((e) => {
        // Silent fail
        if (isMounted) {
          imageCache[name] = null;
          setImageUrl(null);
        }
      });

    return () => { isMounted = false; };
  }, [name]);

  return imageUrl;
}
