export function getInitials(name: string): string {
  const trimmed = name.trim();
  if (!trimmed) return "NF";

  const words = trimmed.split(/\s+/).filter(Boolean);
  if (words.length >= 2) {
    return (words[0].charAt(0) + words[1].charAt(0)).toUpperCase();
  }

  const camelWords = trimmed.match(/[A-Z][a-z]*|[a-z]+|[0-9]+/g);
  if (camelWords && camelWords.length >= 2) {
    return (camelWords[0].charAt(0) + camelWords[1].charAt(0)).toUpperCase();
  }

  return trimmed.slice(0, 2).toUpperCase();
}
