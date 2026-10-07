import type { ChatMessage } from "./types";
import { MessageBubble } from "./MessageBubble";
import { ToolCallBubble } from "./ToolCallBubble";
import { TypingIndicator } from "./TypingIndicator";
import "./MessageList.css";

interface MessageListProps {
  messages: ChatMessage[];
  isTyping?: boolean;
}

export function MessageList({ messages, isTyping }: MessageListProps) {
  return (
    <div className="message-list">
      {messages.map((message) =>
        message.role === "tool" ? (
          <ToolCallBubble key={message.id} message={message} />
        ) : (
          <MessageBubble key={message.id} message={message} />
        )
      )}
      {isTyping && <TypingIndicator />}
    </div>
  );
}
