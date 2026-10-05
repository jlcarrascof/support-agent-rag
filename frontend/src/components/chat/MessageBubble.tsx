import type { ChatMessage } from "./types";
import "./MessageBubble.css";

interface MessageBubbleProps {
  message: ChatMessage;
}

export function MessageBubble({ message }: MessageBubbleProps) {
  const isAgent = message.role === "agent";

  return (
    <div className={`message-row ${isAgent ? "message-row--agent" : "message-row--user"}`}>
      <div className={`message-bubble ${isAgent ? "message-bubble--agent" : "message-bubble--user"}`}>
        <p className="message-bubble__text">{message.text}</p>
        <span className="message-bubble__timestamp">{message.timestamp}</span>
      </div>
    </div>
  );
}
