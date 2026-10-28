// Cùng một cặp người dùng luôn ra cùng một phòng chat
export function getChatId(a: string, b: string): string {
  return [a, b].sort().join('_');
}
