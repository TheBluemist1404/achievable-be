export function toSlug(title: string, description: string | undefined): string {
  const base = description ? `${title} ${description}` : title;

  return base
    .normalize("NFKD")                 // break accents (e.g. "Café" -> "Café")
    .replace(/[\u0300-\u036f]/g, "")   // remove diacritics
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")       // spaces & punctuation -> "-"
    .replace(/^-+|-+$/g, "");          // trim leading/trailing "-"
}
