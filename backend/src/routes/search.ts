import { Router } from "express";
import { searchKnowledgeBase } from "../services/search.js";

const router = Router();

router.post("/search", async (req, res) => {
  const { query } = req.body as { query?: unknown };

  if (typeof query !== "string" || !query.trim()) {
    res.status(400).json({ error: "Field 'query' is required and must be a non-empty string." });
    return;
  }

  try {
    const results = await searchKnowledgeBase(query);
    res.json({ results });
  } catch (error) {
    console.error("Search failed:", error);
    res.status(502).json({ error: "Search service unavailable." });
  }
});

export { router as searchRouter };
