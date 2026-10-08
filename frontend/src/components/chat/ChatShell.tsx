import { useRef, useState } from "react";
import { MessageList } from "./MessageList";
import { ChatInput } from "./ChatInput";
import { ConnectionIndicator } from "./ConnectionIndicator";
import { useConnectionStatus } from "../../hooks/useConnectionStatus";
import { sendMessage } from "../../services/api";
import { formatToolCallSummary, getToolCallStatus } from "./formatToolCall";
import type { ChatMessage } from "./types";
import "./ChatShell.css";

function nowTimestamp(): string {
  return new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

export function ChatShell() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isTyping, setIsTyping] = useState(false);
  const connectionStatus = useConnectionStatus();
  const caseIdRef = useRef(crypto.randomUUID());

  async function handleSend(text: string) {
    const userMessage: ChatMessage = {
      id: crypto.randomUUID(),
      role: "user",
      text,
      timestamp: nowTimestamp(),
    };
    setMessages((previous) => [...previous, userMessage]);
    setIsTyping(true);

    try {
      const { reply, toolCalls } = await sendMessage(caseIdRef.current, text);

      const toolMessages: ChatMessage[] = toolCalls.map((call) => ({
        id: crypto.randomUUID(),
        role: "tool",
        text: formatToolCallSummary(call),
        timestamp: nowTimestamp(),
        toolName: call.name,
        toolStatus: getToolCallStatus(call),
      }));

      setMessages((previous) => [
        ...previous,
        ...toolMessages,
        { id: crypto.randomUUID(), role: "agent", text: reply, timestamp: nowTimestamp() },
      ]);
    } catch {
      setMessages((previous) => [
        ...previous,
        {
          id: crypto.randomUUID(),
          role: "agent",
          text: "Sorry, something went wrong reaching the support agent. Please try again.",
          timestamp: nowTimestamp(),
        },
      ]);
    } finally {
      setIsTyping(false);
    }
  }

  return (
    <div className="chat-shell">
      <header className="chat-shell__header">
        <span className="chat-shell__title">Support Copilot</span>
        <ConnectionIndicator status={connectionStatus} />
      </header>
      <MessageList messages={messages} isTyping={isTyping} />
      <ChatInput onSend={handleSend} disabled={isTyping} />
    </div>
  );
}
