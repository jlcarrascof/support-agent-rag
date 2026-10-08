import { mockOrders } from "../mockData.js";
import type { Tool } from "./types.js";

const DELAY_REFUND_THRESHOLD_MINUTES = 45;

export const issueRefundTool: Tool = {
  definition: {
    type: "function",
    function: {
      name: "issueRefund",
      description: "Issue a refund for an order by its order ID, following the refund policy.",
      parameters: {
        type: "object",
        properties: {
          orderId: { type: "string", description: "The order ID, e.g. '1234'." },
          reason: {
            type: "string",
            description: "Why the customer is requesting a refund (damaged, incomplete, delayed, etc.).",
          },
        },
        required: ["orderId", "reason"],
      },
    },
  },
  async execute(args) {
    const orderId = String(args.orderId ?? "");
    const order = mockOrders[orderId];

    if (!order) {
      return { error: `No order found with ID '${orderId}'.` };
    }

    if (order.refunded) {
      return { error: `Order '${orderId}' has already been refunded. An order can only be refunded once.` };
    }

    const isSignificantlyDelayed = order.minutesLate >= DELAY_REFUND_THRESHOLD_MINUTES;

    if ((order.status === "placed" || order.status === "preparing") && !isSignificantlyDelayed) {
      return {
        error: `Order '${orderId}' hasn't been delivered yet (status: ${order.status}). Refunds apply to orders delayed by ${DELAY_REFUND_THRESHOLD_MINUTES}+ minutes or already delivered.`,
      };
    }

    if (order.status === "in_transit" && !isSignificantlyDelayed) {
      return {
        error: `Order '${orderId}' is in transit and only ${order.minutesLate} minute(s) past its estimate, which is within the normal delivery window. Refunds for delivery delays apply once an order is more than ${DELAY_REFUND_THRESHOLD_MINUTES} minutes late.`,
      };
    }

    order.refunded = true;

    return {
      orderId: order.id,
      refunded: true,
      reason: args.reason,
    };
  },
};
