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

function iconForTool(toolName?: string): string {
  return (toolName && TOOL_ICONS[toolName]) || "🔧";
}

export function ToolCallBubble({ message }: ToolCallBubbleProps) {
  return (
    <div className="tool-call-bubble">
      <span className="tool-call-bubble__icon">{iconForTool(message.toolName)}</span>
      <span className="tool-call-bubble__text">{message.text}</span>
    </div>
  );
}
