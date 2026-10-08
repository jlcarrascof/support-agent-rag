import type { ChatMessage } from "./types";
import "./ErrorBubble.css";

interface ErrorBubbleProps {
  message: ChatMessage;
}

export function ErrorBubble({ message }: ErrorBubbleProps) {
  return (
    <div className="error-bubble">
      <span className="error-bubble__icon">🚫</span>
      <span className="error-bubble__text">{message.text}</span>
    </div>
  );
}
