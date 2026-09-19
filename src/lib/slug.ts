const banglaDigitMap: Record<string, string> = {
  "0": "০",
  "1": "১",
  "2": "২",
  "3": "৩",
  "4": "৪",
  "5": "৫",
  "6": "৬",
  "7": "৭",
  "8": "৮",
  "9": "৯"
};

export function toBanglaDigits(value: string | number) {
  return String(value).replace(/\d/g, (digit) => banglaDigitMap[digit] ?? digit);
}

export function createBanglaSlug(value: string) {
  return value
    .trim()
    .toLowerCase()
    .replace(/[^\p{Script=Bengali}\p{Letter}\p{Number}\s-]/gu, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

export function ensureSlug(input: string | null | undefined, fallback: string) {
  const slug = createBanglaSlug(input || fallback);
  return slug || crypto.randomUUID();
}
