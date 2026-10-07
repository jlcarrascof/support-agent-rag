export type MessageRole = "user" | "agent" | "tool";

export interface ChatMessage {
  id: string;
  role: MessageRole;
  text: string;
  timestamp: string;
  toolName?: string;
}
