import { Router } from "express";
import { runAgent } from "../agent/orchestrator.js";
import { ensureCase, getMessageHistory, insertMessage, resolveCase } from "../services/cases.js";
import { publishEvent } from "../events/publish.js";
import type { ToolCallRecord } from "../agent/orchestrator.js";

const router = Router();

const RESOLVING_TOOLS = new Set(["cancelRide", "issueRefund"]);

function isSuccessfulResolution(call: ToolCallRecord): boolean {
  if (!RESOLVING_TOOLS.has(call.name)) return false;
  const result = call.result as Record<string, unknown>;
  return typeof result?.error !== "string";
}

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

    const resolvingCall = toolCalls.find(isSuccessfulResolution);
    if (resolvingCall) {
      await resolveCase(caseId);
      await publishEvent("case.resolved", { caseId, action: resolvingCall.name });
    }

    res.json({ reply, toolCalls });
  } catch (error) {
    console.error("Agent request failed:", error);
    res.status(502).json({ error: "Agent service unavailable." });
  }
});

export { router as messagesRouter };
