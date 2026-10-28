const pad = (n: number) => String(n).padStart(2, '0');

const hhmm = (d: Date) => `${pad(d.getHours())}:${pad(d.getMinutes())}`;
const ddmm = (d: Date) => `${pad(d.getDate())}/${pad(d.getMonth() + 1)}`;

const isSameDay = (a: Date, b: Date) =>
  a.getFullYear() === b.getFullYear() &&
  a.getMonth() === b.getMonth() &&
  a.getDate() === b.getDate();

export function formatMessageTime(ts?: number): string {
  return ts ? hhmm(new Date(ts)) : '';
}

export function formatListTime(ts: number | undefined, now: number = Date.now()): string {
  if (!ts) {
    return '';
  }
  const d = new Date(ts);
  return isSameDay(d, new Date(now)) ? hhmm(d) : ddmm(d);
}

export function formatLastSeen(ts: number | undefined, now: number = Date.now()): string {
  if (!ts) {
    return '';
  }
  const d = new Date(ts);
  return isSameDay(d, new Date(now)) ? `Hoạt động lúc ${hhmm(d)}` : `Hoạt động ngày ${ddmm(d)}`;
}
