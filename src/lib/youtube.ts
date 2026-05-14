export function extractYouTubeId(url: string | undefined | null): string | null {
  if (!url) return null;
  const patterns = [
    /youtube\.com\/watch\?v=([a-zA-Z0-9_-]{11})/,
    /youtu\.be\/([a-zA-Z0-9_-]{11})/,
    /youtube\.com\/embed\/([a-zA-Z0-9_-]{11})/,
    /youtube\.com\/shorts\/([a-zA-Z0-9_-]{11})/,
  ];
  for (const p of patterns) {
    const m = url.match(p);
    if (m) return m[1];
  }
  return null;
}

export function getYouTubeThumbnail(
  url: string | undefined | null,
  quality: 'maxres' | 'hq' | 'mq' = 'maxres'
): string | null {
  const id = extractYouTubeId(url);
  if (!id) return null;
  const file =
    quality === 'maxres' ? 'maxresdefault' : quality === 'hq' ? 'hqdefault' : 'mqdefault';
  return `https://img.youtube.com/vi/${id}/${file}.jpg`;
}
