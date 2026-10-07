import { searchKnowledgeBase } from "../../services/search.js";
import type { Tool } from "./types.js";

export const searchKnowledgeBaseTool: Tool = {
  definition: {
    type: "function",
    function: {
      name: "searchKnowledgeBase",
      description:
        "Search the support knowledge base for policy or FAQ information relevant to the customer's question.",
      parameters: {
        type: "object",
        properties: {
          query: { type: "string", description: "The customer's question or topic to search for." },
        },
        required: ["query"],
      },
    },
  },
  async execute(args) {
    const query = String(args.query ?? "");
    const results = await searchKnowledgeBase(query, 3);

    if (results.length === 0) {
      return { results: [], message: "No relevant knowledge base entries found." };
    }

    return {
      results: results.map((r) => ({
        documentTitle: r.documentTitle,
        content: r.content,
        similarity: r.similarity,
      })),
    };
  },
};
