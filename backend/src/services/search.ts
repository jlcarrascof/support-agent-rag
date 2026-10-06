import { pool } from "../db/client.js";
import { embedText } from "./embeddings.js";

export interface SearchResult {
  chunkId: string;
  documentId: string;
  documentTitle: string;
  content: string;
  similarity: number;
}

function toVectorLiteral(embedding: number[]): string {
  return `[${embedding.join(",")}]`;
}

export async function searchKnowledgeBase(query: string, limit = 5): Promise<SearchResult[]> {
  const trimmed = query.trim();
  if (!trimmed) return [];

  const embedding = await embedText(trimmed);

  const { rows } = await pool.query<{
    chunk_id: string;
    document_id: string;
    document_title: string;
    content: string;
    similarity: number;
  }>(
    `SELECT
       c.id AS chunk_id,
       d.id AS document_id,
       d.title AS document_title,
       c.content AS content,
       1 - (c.embedding <=> $1::vector) AS similarity
     FROM chunks c
     JOIN documents d ON d.id = c.document_id
     WHERE c.embedding IS NOT NULL
     ORDER BY c.embedding <=> $1::vector
     LIMIT $2`,
    [toVectorLiteral(embedding), limit]
  );

  return rows.map((row) => ({
    chunkId: row.chunk_id,
    documentId: row.document_id,
    documentTitle: row.document_title,
    content: row.content,
    similarity: row.similarity,
  }));
}
