import "dotenv/config";
import { readdirSync, readFileSync } from "fs";
import { join } from "path";
import { pool } from "../db/client.js";
import { embedText } from "../services/embeddings.js";
import { chunkText } from "./chunk.js";

const DOCUMENTS_DIR = join(process.cwd(), "src/kb/documents");

function titleFromFilename(filename: string): string {
  return filename
    .replace(/\.md$/, "")
    .split("-")
    .map((word) => word[0].toUpperCase() + word.slice(1))
    .join(" ");
}

function toVectorLiteral(embedding: number[]): string {
  return `[${embedding.join(",")}]`;
}

async function ingest() {
  const files = readdirSync(DOCUMENTS_DIR).filter((file) => file.endsWith(".md"));
  console.log(`Found ${files.length} knowledge base documents.`);

  await pool.query("TRUNCATE chunks, documents RESTART IDENTITY CASCADE");

  for (const file of files) {
    const content = readFileSync(join(DOCUMENTS_DIR, file), "utf-8");
    const title = titleFromFilename(file);

    const { rows } = await pool.query<{ id: string }>(
      "INSERT INTO documents (title, content) VALUES ($1, $2) RETURNING id",
      [title, content]
    );
    const documentId = rows[0].id;

    const chunks = chunkText(content);
    console.log(`  ${title}: ${chunks.length} chunk(s)`);

    for (const chunk of chunks) {
      const embedding = await embedText(chunk.content);
      await pool.query(
        "INSERT INTO chunks (document_id, content, position, embedding) VALUES ($1, $2, $3, $4)",
        [documentId, chunk.content, chunk.position, toVectorLiteral(embedding)]
      );
    }
  }

  console.log("Ingestion complete.");
  await pool.end();
}

ingest().catch((error) => {
  console.error("Ingestion failed:", error);
  process.exit(1);
});
