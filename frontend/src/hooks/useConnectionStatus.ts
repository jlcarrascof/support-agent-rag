import { useEffect, useState } from "react";

export type ConnectionStatus = "checking" | "online" | "offline";

const HEALTH_URL = import.meta.env.VITE_API_URL
  ? `${import.meta.env.VITE_API_URL}/health`
  : "http://localhost:3000/health";

const POLL_INTERVAL_MS = 10_000;

export function useConnectionStatus(): ConnectionStatus {
  const [status, setStatus] = useState<ConnectionStatus>("checking");

  useEffect(() => {
    let cancelled = false;

    async function checkHealth() {
      try {
        const response = await fetch(HEALTH_URL);
        if (!cancelled) {
          setStatus(response.ok ? "online" : "offline");
        }
      } catch {
        if (!cancelled) {
          setStatus("offline");
        }
      }
    }

    checkHealth();
    const interval = setInterval(checkHealth, POLL_INTERVAL_MS);

    return () => {
      cancelled = true;
      clearInterval(interval);
    };
  }, []);

  return status;
}
