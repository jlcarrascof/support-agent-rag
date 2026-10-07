import type { ChatMessage } from "./types";
import "./ToolCallBubble.css";

interface ToolCallBubbleProps {
  message: ChatMessage;
}

export function ToolCallBubble({ message }: ToolCallBubbleProps) {
  return (
    <div className="tool-call-bubble">
      <span className="tool-call-bubble__icon">🔧</span>
      <span className="tool-call-bubble__text">{message.text}</span>
    </div>
  );
}
