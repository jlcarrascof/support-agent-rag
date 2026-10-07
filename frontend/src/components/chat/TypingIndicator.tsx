import "./TypingIndicator.css";

export function TypingIndicator() {
  return (
    <div className="message-row message-row--agent">
      <div className="typing-indicator">
        <span className="typing-indicator__dot" />
        <span className="typing-indicator__dot" />
        <span className="typing-indicator__dot" />
      </div>
    </div>
  );
}
