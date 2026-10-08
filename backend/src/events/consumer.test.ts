import { markProcessed } from "./consumer.js";
import { pool } from "../db/client.js";

jest.mock("../db/client.js", () => ({
  pool: { query: jest.fn() },
}));

const mockedQuery = jest.mocked(pool.query);

describe("markProcessed", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("returns true and inserts the row for a new message_id", async () => {
    mockedQuery.mockResolvedValue({} as never);

    const result = await markProcessed("msg-1", "case.resolved");

    expect(result).toBe(true);
    expect(mockedQuery).toHaveBeenCalledWith(
      "INSERT INTO processed_events (message_id, event_type) VALUES ($1, $2)",
      ["msg-1", "case.resolved"]
    );
  });

  it("returns false for a duplicate message_id (unique violation)", async () => {
    mockedQuery.mockRejectedValue({ code: "23505" } as never);

    const result = await markProcessed("msg-1", "case.resolved");

    expect(result).toBe(false);
  });

  it("rethrows unexpected database errors instead of treating them as duplicates", async () => {
    mockedQuery.mockRejectedValue({ code: "ECONNREFUSED" } as never);

    await expect(markProcessed("msg-1", "case.resolved")).rejects.toEqual({
      code: "ECONNREFUSED",
    });
  });
});
