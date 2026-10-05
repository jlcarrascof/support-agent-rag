import { useState, type FormEvent } from "react";
import "./ChatInput.css";

interface ChatInputProps {
  onSend: (text: string) => void;
  disabled?: boolean;
}

export function ChatInput({ onSend, disabled }: ChatInputProps) {
  const [value, setValue] = useState("");

  function handleSubmit(event: FormEvent) {
    event.preventDefault();
    const trimmed = value.trim();
    if (!trimmed) return;
    onSend(trimmed);
    setValue("");
  }

  return (
    <form className="chat-input" onSubmit={handleSubmit}>
      <input
        className="chat-input__field"
        type="text"
        placeholder="Type a message..."
        value={value}
        disabled={disabled}
        onChange={(event) => setValue(event.target.value)}
      />
      <button className="chat-input__submit" type="submit" disabled={disabled || !value.trim()}>
        Send
      </button>
    </form>
  );
}
