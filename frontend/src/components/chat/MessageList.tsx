import type { ChatMessage } from "./types";
import { MessageBubble } from "./MessageBubble";
import { ToolCallBubble } from "./ToolCallBubble";
import "./MessageList.css";

interface MessageListProps {
  messages: ChatMessage[];
}

export function MessageList({ messages }: MessageListProps) {
  return (
    <div className="message-list">
      {messages.map((message) =>
        message.role === "tool" ? (
          <ToolCallBubble key={message.id} message={message} />
        ) : (
          <MessageBubble key={message.id} message={message} />
        )
      )}
    </div>
  );
}
