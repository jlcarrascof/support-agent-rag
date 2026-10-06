const DEFAULT_CHUNK_SIZE = 500;
const DEFAULT_CHUNK_OVERLAP = 50;

export interface Chunk {
  content: string;
  position: number;
}

/**
 * Splits text into overlapping chunks by character count, breaking on
 * paragraph boundaries where possible to avoid cutting sentences mid-way.
 */
export function chunkText(
  text: string,
  chunkSize = DEFAULT_CHUNK_SIZE,
  overlap = DEFAULT_CHUNK_OVERLAP
): Chunk[] {
  const paragraphs = text
    .split(/\n\s*\n/)
    .map((paragraph) => paragraph.trim())
    .filter(Boolean);

  const chunks: Chunk[] = [];
  let current = "";

  for (const paragraph of paragraphs) {
    const candidate = current ? `${current}\n\n${paragraph}` : paragraph;

    if (candidate.length > chunkSize && current) {
      chunks.push({ content: current, position: chunks.length });
      const overlapText = current.slice(-overlap);
      current = `${overlapText}\n\n${paragraph}`.trim();
    } else {
      current = candidate;
    }
  }

  if (current) {
    chunks.push({ content: current, position: chunks.length });
  }

  return chunks;
}
