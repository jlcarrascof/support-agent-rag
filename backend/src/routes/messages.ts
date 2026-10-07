import { Router } from "express";
import { runAgent } from "../agent/orchestrator.js";
import { ensureCase, getMessageHistory, insertMessage } from "../services/cases.js";

const router = Router();

router.post("/cases/:caseId/messages", async (req, res) => {
  const { caseId } = req.params;
  const { message } = req.body as { message?: unknown };

  if (typeof message !== "string" || !message.trim()) {
    res.status(400).json({ error: "Field 'message' is required and must be a non-empty string." });
    return;
  }

  try {
    await ensureCase(caseId);
    const history = await getMessageHistory(caseId);
    await insertMessage(caseId, "user", message);

    const { reply, toolCalls } = await runAgent(message, history);

    const toolName = toolCalls[0]?.name;
    await insertMessage(caseId, "agent", reply, toolName);

    res.json({ reply, toolCalls });
  } catch (error) {
    console.error("Agent request failed:", error);
    res.status(502).json({ error: "Agent service unavailable." });
  }
});

export { router as messagesRouter };
