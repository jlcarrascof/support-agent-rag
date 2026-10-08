import { useEffect, useRef } from "react";
import type { ChatMessage } from "./types";
import { MessageBubble } from "./MessageBubble";
import { ToolCallBubble } from "./ToolCallBubble";
import { ErrorBubble } from "./ErrorBubble";
import { TypingIndicator } from "./TypingIndicator";
import { EmptyState } from "./EmptyState";
import "./MessageList.css";

interface MessageListProps {
  messages: ChatMessage[];
  isTyping?: boolean;
}

export function MessageList({ messages, isTyping }: MessageListProps) {
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [messages, isTyping]);

  if (messages.length === 0 && !isTyping) {
    return (
      <div className="message-list">
        <EmptyState />
      </div>
    );
  }

  return (
    <div className="message-list">
      {messages.map((message) => {
        if (message.role === "tool") return <ToolCallBubble key={message.id} message={message} />;
        if (message.role === "error") return <ErrorBubble key={message.id} message={message} />;
        return <MessageBubble key={message.id} message={message} />;
      })}
      {isTyping && <TypingIndicator />}
      <div ref={bottomRef} />
    </div>
  );
}
