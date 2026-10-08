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

export class ApiError extends Error {
  status: number;
  retryAfterSeconds?: number;

  constructor(message: string, status: number, retryAfterSeconds?: number) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.retryAfterSeconds = retryAfterSeconds;
  }
}

export async function sendMessage(caseId: string, message: string): Promise<SendMessageResponse> {
  const response = await fetch(`${API_URL}/cases/${caseId}/messages`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ message }),
  });

  if (!response.ok) {
    const body = await response.json().catch(() => ({}) as { error?: string });
    const retryAfterHeader = response.headers.get("Retry-After");
    const retryAfterSeconds = retryAfterHeader ? Number(retryAfterHeader) : undefined;

    throw new ApiError(
      body.error ?? `Request failed: ${response.status} ${response.statusText}`,
      response.status,
      retryAfterSeconds
    );
  }

  return response.json() as Promise<SendMessageResponse>;
}
