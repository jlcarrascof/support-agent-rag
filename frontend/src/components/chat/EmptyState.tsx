import "./EmptyState.css";

export function EmptyState() {
  return (
    <div className="empty-state">
      <span className="empty-state__icon" aria-hidden="true">
        🤖
      </span>
      <p className="empty-state__title">Support Copilot</p>
      <p className="empty-state__hint">
        Ask about an order, a ride, or a refund — try "What's the status of order 1234?"
      </p>
    </div>
  );
}
