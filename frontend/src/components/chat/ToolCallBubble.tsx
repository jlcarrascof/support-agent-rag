import type { ChatMessage } from "./types";
import "./ToolCallBubble.css";

interface ToolCallBubbleProps {
  message: ChatMessage;
}

const TOOL_ICONS: Record<string, string> = {
  getOrderStatus: "📦",
  cancelRide: "🚗",
  issueRefund: "💳",
  searchKnowledgeBase: "📚",
};

function iconFor(message: ChatMessage): string {
  if (message.toolStatus === "error") return "⚠️";
  return (message.toolName && TOOL_ICONS[message.toolName]) || "🔧";
}

export function ToolCallBubble({ message }: ToolCallBubbleProps) {
  const isError = message.toolStatus === "error";

  return (
    <div className={`tool-call-bubble ${isError ? "tool-call-bubble--error" : "tool-call-bubble--completed"}`}>
      <span className="tool-call-bubble__icon">{iconFor(message)}</span>
      <span className="tool-call-bubble__text">{message.text}</span>
    </div>
  );
}
