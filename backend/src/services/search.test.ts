import { searchKnowledgeBase } from "./search.js";
import { embedText } from "./embeddings.js";
import { pool } from "../db/client.js";

jest.mock("./embeddings.js");
jest.mock("../db/client.js", () => ({
  pool: { query: jest.fn() },
}));

const mockedEmbedText = jest.mocked(embedText);
const mockedQuery = jest.mocked(pool.query);

describe("searchKnowledgeBase", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("returns an empty array for an empty query without calling the database", async () => {
    const results = await searchKnowledgeBase("");

    expect(results).toEqual([]);
    expect(mockedEmbedText).not.toHaveBeenCalled();
    expect(mockedQuery).not.toHaveBeenCalled();
  });

  it("returns an empty array for a whitespace-only query without calling the database", async () => {
    const results = await searchKnowledgeBase("   ");

    expect(results).toEqual([]);
    expect(mockedEmbedText).not.toHaveBeenCalled();
    expect(mockedQuery).not.toHaveBeenCalled();
  });

  it("returns an empty array when no chunks are close enough to match", async () => {
    mockedEmbedText.mockResolvedValue([0.1, 0.2, 0.3]);
    mockedQuery.mockResolvedValue({ rows: [] } as never);

    const results = await searchKnowledgeBase("something completely unrelated to support");

    expect(results).toEqual([]);
  });

  it("maps database rows into SearchResult objects", async () => {
    mockedEmbedText.mockResolvedValue([0.1, 0.2, 0.3]);
    mockedQuery.mockResolvedValue({
      rows: [
        {
          chunk_id: "chunk-1",
          document_id: "doc-1",
          document_title: "Refund Policy",
          content: "Refunds are processed within 3-5 business days.",
          similarity: 0.82,
        },
      ],
    } as never);

    const results = await searchKnowledgeBase("how do refunds work?");

    expect(results).toEqual([
      {
        chunkId: "chunk-1",
        documentId: "doc-1",
        documentTitle: "Refund Policy",
        content: "Refunds are processed within 3-5 business days.",
        similarity: 0.82,
      },
    ]);
  });
});
