const PALETTE = [
  '#2F6B4F',
  '#3E63B8',
  '#B5533C',
  '#7A4EB0',
  '#C77B12',
  '#1F7A8C',
  '#A83E6B',
  '#5B6B2F',
];

export function getAvatarColor(uid: string): string {
  let hash = 0;
  for (let i = 0; i < uid.length; i++) {
    hash = (hash * 31 + uid.charCodeAt(i)) % 1000003;
  }
  return PALETTE[Math.abs(hash) % PALETTE.length];
}

export function getInitials(name: string): string {
  const words = name.trim().split(/\s+/).filter(Boolean);
  if (words.length === 0) {
    return '?';
  }
  const first = words[0][0];
  const last = words.length > 1 ? words[words.length - 1][0] : '';
  return (first + last).toUpperCase();
}
