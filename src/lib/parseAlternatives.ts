import type { ProductAlternative } from "./base44";

/**
 * Parse the agent's markdown content into structured alternatives.
 * Handles formats like:
 * *   **Product Title**
 *     *   Link: https://...
 *     *   Price: $24.99
 *     *   Source: Target
 */
export function parseAlternativesFromContent(content: string | undefined): ProductAlternative[] {
  if (!content || typeof content !== "string") return [];

  const alternatives: ProductAlternative[] = [];

  // Split by product blocks: "*   **Title**" (newline + bullets + bold title)
  const blocks = content.split(/\n\s*\*\s+\*\*([^*]+)\*\*/).filter(Boolean);
  if (blocks.length >= 2) {
    for (let i = 1; i < blocks.length; i += 2) {
      const title = blocks[i].trim();
      const blockContent = blocks[i + 1] ?? "";
      const urlMatch = blockContent.match(/(?:Link|URL):\s*(https?:\/\/[^\s\n*]+)/i);
      const url = urlMatch?.[1]?.trim();
      if (!title || !url) continue;
      const priceMatch = blockContent.match(/Price:\s*([^\n*]+)/i);
      const sourceRe = new RegExp("Source:\\s*([^\\n*]+)", "i");
      const sourceMatch = blockContent.match(sourceRe);
      alternatives.push({
        title,
        url,
        price: priceMatch?.[1]?.trim(),
        source: sourceMatch?.[1]?.trim(),
      });
    }
    if (alternatives.length > 0) return alternatives;
  }

  // Fallback: collect all **titles**, Link: urls, Price:, Source: and zip by index
  const titles: string[] = [];
  let m: RegExpExecArray | null;
  const titleRe = /\*\*([^*]+)\*\*/g;
  while ((m = titleRe.exec(content)) !== null) titles.push(m[1].trim());

  const urls: string[] = [];
  const urlRe = /(?:Link|URL):\s*(https?:\/\/[^\s\n*]+)/gi;
  while ((m = urlRe.exec(content)) !== null) urls.push(m[1].trim());

  const prices: string[] = [];
  const priceRe = /Price:\s*([^\n*]+)/gi;
  while ((m = priceRe.exec(content)) !== null) prices.push(m[1].trim());

  const sources: string[] = [];
  const sourceRe = new RegExp("Source:\\s*([^\\n*]+)", "gi");
  while ((m = sourceRe.exec(content)) !== null) sources.push(m[1].trim());

  const skipFirstTitle = titles.length > urls.length && (titles[0]?.length ?? 0) < 40;
  const start = skipFirstTitle ? 1 : 0;
  for (let i = 0; i < urls.length; i++) {
    const title = titles[start + i] ?? `Product ${i + 1}`;
    alternatives.push({
      title,
      url: urls[i],
      price: prices[i],
      source: sources[i],
    });
  }

  return alternatives;
}
