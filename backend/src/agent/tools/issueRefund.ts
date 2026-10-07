import { mockOrders } from "../mockData.js";
import type { Tool } from "./types.js";

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

    if (order.status === "placed" || order.status === "preparing") {
      return {
        error: `Order '${orderId}' hasn't been delivered yet (status: ${order.status}). Refunds apply to delayed or delivered orders.`,
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
