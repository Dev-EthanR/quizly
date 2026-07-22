export function getInitials(name: string): string {
  const trimmed = name.trim();
  if (!trimmed) return "NF";

  const words = trimmed.split(/\s+/).filter(Boolean);
  if (words.length >= 2) {
    return (words[0].charAt(0) + words[1].charAt(0)).toUpperCase();
  }

  return trimmed.slice(0, 2).toUpperCase();
}
