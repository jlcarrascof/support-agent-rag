import type { ToolCallRecord } from "../../services/api";

interface OrderResult {
  status?: string;
  error?: string;
}

interface RideResult {
  cancelled?: boolean;
  feeApplied?: boolean;
  error?: string;
}

interface RefundResult {
  refunded?: boolean;
  error?: string;
}

interface SearchResult {
  results?: unknown[];
}

export function formatToolCallSummary(call: ToolCallRecord): string {
  const result = call.result as Record<string, unknown>;

  if (typeof result?.error === "string") {
    return `Called ${call.name} → error: ${result.error}`;
  }

  switch (call.name) {
    case "getOrderStatus": {
      const r = result as OrderResult;
      return `Called getOrderStatus → order #${call.arguments.orderId} is ${r.status}`;
    }
    case "cancelRide": {
      const r = result as RideResult;
      return `Called cancelRide → ride ${call.arguments.rideId} cancelled${r.feeApplied ? " (fee applied)" : ""}`;
    }
    case "issueRefund": {
      const r = result as RefundResult;
      return `Called issueRefund → order #${call.arguments.orderId} refunded: ${r.refunded}`;
    }
    case "searchKnowledgeBase": {
      const r = result as SearchResult;
      return `Called searchKnowledgeBase → found ${r.results?.length ?? 0} result(s)`;
    }
    default:
      return `Called ${call.name}`;
  }
}
