const API_URL = import.meta.env.VITE_API_URL ?? "http://localhost:3000";

export interface ToolCallRecord {
  name: string;
  arguments: Record<string, unknown>;
  result: unknown;
}

export interface SendMessageResponse {
  reply: string;
  toolCalls: ToolCallRecord[];
}

export async function sendMessage(caseId: string, message: string): Promise<SendMessageResponse> {
  const response = await fetch(`${API_URL}/cases/${caseId}/messages`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ message }),
  });

  if (!response.ok) {
    throw new Error(`Request failed: ${response.status} ${response.statusText}`);
  }

  return response.json() as Promise<SendMessageResponse>;
}
