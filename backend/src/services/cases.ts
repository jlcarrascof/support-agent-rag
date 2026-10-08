import { pool } from "../db/client.js";
import type { ChatMessage } from "../agent/openai.js";

export async function ensureCase(caseId: string): Promise<void> {
  await pool.query("INSERT INTO cases (id) VALUES ($1) ON CONFLICT (id) DO NOTHING", [caseId]);
}

export async function resolveCase(caseId: string): Promise<void> {
  await pool.query(
    "UPDATE cases SET status = 'resolved', resolved_at = now() WHERE id = $1 AND status != 'resolved'",
    [caseId]
  );
}

export async function getMessageHistory(caseId: string): Promise<ChatMessage[]> {
  const { rows } = await pool.query<{ role: "user" | "agent"; content: string }>(
    "SELECT role, content FROM messages WHERE case_id = $1 ORDER BY created_at ASC",
    [caseId]
  );

  return rows.map((row) => ({
    role: row.role === "agent" ? "assistant" : "user",
    content: row.content,
  }));
}

export async function insertMessage(
  caseId: string,
  role: "user" | "agent",
  content: string,
  toolName?: string
): Promise<void> {
  await pool.query(
    "INSERT INTO messages (case_id, role, content, tool_name) VALUES ($1, $2, $3, $4)",
    [caseId, role, content, toolName ?? null]
  );
}
