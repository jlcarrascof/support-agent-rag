import { mockOrders } from "../mockData.js";
import type { Tool } from "./types.js";

export const getOrderStatusTool: Tool = {
  definition: {
    type: "function",
    function: {
      name: "getOrderStatus",
      description: "Get the current status and estimated delivery time of an order by its order ID.",
      parameters: {
        type: "object",
        properties: {
          orderId: { type: "string", description: "The order ID, e.g. '1234'." },
        },
        required: ["orderId"],
      },
    },
  },
  async execute(args) {
    const orderId = String(args.orderId ?? "");
    const order = mockOrders[orderId];

    if (!order) {
      return { error: `No order found with ID '${orderId}'.` };
    }

    return {
      orderId: order.id,
      status: order.status,
      estimatedDeliveryMinutes: order.status === "delivered" ? 0 : order.estimatedDeliveryMinutes,
    };
  },
};
