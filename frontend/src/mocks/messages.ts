import type { ChatMessage } from "../components/chat/types";

export const mockMessages: ChatMessage[] = [
  {
    id: "1",
    role: "user",
    text: "Hi, I need to check the status of my order #1234",
    timestamp: "09:12",
  },
  {
    id: "2",
    role: "agent",
    text: "Sure, let me look that up for you.",
    timestamp: "09:12",
  },
  {
    id: "3",
    role: "agent",
    text: "Your order #1234 is currently in transit and should arrive within 20 minutes.",
    timestamp: "09:13",
  },
  {
    id: "4",
    role: "user",
    text: "Great, thanks! Can you also cancel my ride for tomorrow?",
    timestamp: "09:14",
  },
];
