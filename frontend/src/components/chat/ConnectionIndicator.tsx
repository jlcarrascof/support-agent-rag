import type { ConnectionStatus } from "../../hooks/useConnectionStatus";
import "./ConnectionIndicator.css";

interface ConnectionIndicatorProps {
  status: ConnectionStatus;
}

const LABELS: Record<ConnectionStatus, string> = {
  checking: "Connecting...",
  online: "Online",
  offline: "Offline",
};

export function ConnectionIndicator({ status }: ConnectionIndicatorProps) {
  return (
    <div className={`connection-indicator connection-indicator--${status}`}>
      <span className="connection-indicator__dot" />
      <span className="connection-indicator__label">{LABELS[status]}</span>
    </div>
  );
}
