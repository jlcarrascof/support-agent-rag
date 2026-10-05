import { useState } from "react";
import { MessageList } from "./MessageList";
import { ChatInput } from "./ChatInput";
import { mockMessages } from "../../mocks/messages";
import type { ChatMessage } from "./types";
import "./ChatShell.css";

export function ChatShell() {
  const [messages, setMessages] = useState<ChatMessage[]>(mockMessages);

  function handleSend(text: string) {
    const newMessage: ChatMessage = {
      id: crypto.randomUUID(),
      role: "user",
      text,
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    };
    setMessages((previous) => [...previous, newMessage]);
  }

  return (
    <div className="chat-shell">
      <header className="chat-shell__header">
        <span className="chat-shell__title">Support Copilot</span>
      </header>
      <MessageList messages={messages} />
      <ChatInput onSend={handleSend} />
    </div>
  );
}
