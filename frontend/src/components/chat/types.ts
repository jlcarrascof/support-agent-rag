export type MessageRole = "user" | "agent" | "tool" | "error";
export type ToolCallStatus = "completed" | "error";

export interface ChatMessage {
  id: string;
  role: MessageRole;
  text: string;
  timestamp: string;
  toolName?: string;
  toolStatus?: ToolCallStatus;
}
