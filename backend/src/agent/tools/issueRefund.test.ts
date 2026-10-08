import { issueRefundTool } from "./issueRefund.js";
import { mockOrders } from "../mockData.js";

function snapshotOrders(): typeof mockOrders {
  return JSON.parse(JSON.stringify(mockOrders));
}

describe("issueRefund", () => {
  let originalOrders: typeof mockOrders;

  beforeAll(() => {
    originalOrders = snapshotOrders();
  });

  afterEach(() => {
    Object.assign(mockOrders, JSON.parse(JSON.stringify(originalOrders)));
  });

  it("returns an error when the order ID does not exist", async () => {
    const result = await issueRefundTool.execute({ orderId: "0000", reason: "damaged" });

    expect(result).toEqual({ error: "No order found with ID '0000'." });
  });

  it("refuses to refund an order that was already refunded", async () => {
    const result = await issueRefundTool.execute({ orderId: "9999", reason: "damaged" });

    expect(result).toEqual({
      error: "Order '9999' has already been refunded. An order can only be refunded once.",
    });
  });

  it("refuses to refund an order still placed (not yet delivered)", async () => {
    mockOrders["1234"].status = "placed";
    mockOrders["1234"].refunded = false;

    const result = await issueRefundTool.execute({ orderId: "1234", reason: "damaged" });

    expect(result).toEqual({
      error: "Order '1234' hasn't been delivered yet (status: placed). Refunds apply to delayed or delivered orders.",
    });
  });

  it("issues a refund for a delivered order", async () => {
    const result = await issueRefundTool.execute({ orderId: "5678", reason: "missing items" });

    expect(result).toEqual({
      orderId: "5678",
      refunded: true,
      reason: "missing items",
    });
    expect(mockOrders["5678"].refunded).toBe(true);
  });

  it("issues a refund for an in-transit (delayed) order", async () => {
    const result = await issueRefundTool.execute({ orderId: "1234", reason: "delayed" });

    expect(result).toEqual({
      orderId: "1234",
      refunded: true,
      reason: "delayed",
    });
  });

  it("refuses a second refund on the same order", async () => {
    await issueRefundTool.execute({ orderId: "5678", reason: "missing items" });
    const result = await issueRefundTool.execute({ orderId: "5678", reason: "missing items" });

    expect(result).toEqual({
      error: "Order '5678' has already been refunded. An order can only be refunded once.",
    });
  });
});
