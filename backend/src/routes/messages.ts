import { Router } from "express";
import { rateLimit } from "../middleware/rateLimit.js";
import { runAgent } from "../agent/orchestrator.js";
import { ensureCase, getMessageHistory, insertMessage, resolveCase } from "../services/cases.js";
import { getCachedHistory, setCachedHistory } from "../services/conversationCache.js";
import { publishEvent } from "../events/publish.js";
import type { ToolCallRecord } from "../agent/orchestrator.js";
import type { ChatMessage } from "../agent/openai.js";

const router = Router();

const RESOLVING_TOOLS = new Set(["cancelRide", "issueRefund"]);

function isSuccessfulResolution(call: ToolCallRecord): boolean {
  if (!RESOLVING_TOOLS.has(call.name)) return false;
  const result = call.result as Record<string, unknown>;
  return typeof result?.error !== "string";
}

async function loadHistory(caseId: string): Promise<ChatMessage[]> {
  const cached = await getCachedHistory(caseId);
  if (cached) return cached;

  const fromDb = await getMessageHistory(caseId);
  await setCachedHistory(caseId, fromDb);
  return fromDb;
}

router.post("/cases/:caseId/messages", rateLimit, async (req, res) => {
  const caseId = String(req.params.caseId);
  const { message } = req.body as { message?: unknown };

  if (typeof message !== "string" || !message.trim()) {
    res.status(400).json({ error: "Field 'message' is required and must be a non-empty string." });
    return;
  }

  try {
    await ensureCase(caseId);
    const history = await loadHistory(caseId);
    await insertMessage(caseId, "user", message);

    const { reply, toolCalls } = await runAgent(message, history);

    const toolName = toolCalls[0]?.name;
    await insertMessage(caseId, "agent", reply, toolName);

    await setCachedHistory(caseId, [
      ...history,
      { role: "user", content: message },
      { role: "assistant", content: reply },
    ]);

    const resolvingCall = toolCalls.find(isSuccessfulResolution);
    if (resolvingCall) {
      await resolveCase(caseId);
      await publishEvent("case.resolved", { caseId, action: resolvingCall.name });
    }

    const refundCall = toolCalls.find((call) => call.name === "issueRefund" && isSuccessfulResolution(call));
    if (refundCall) {
      await publishEvent("refund.issued", {
        caseId,
        orderId: refundCall.arguments.orderId,
        reason: refundCall.arguments.reason,
      });
    }

    res.json({ reply, toolCalls });
  } catch (error) {
    console.error("Agent request failed:", error);
    res.status(502).json({ error: "Agent service unavailable." });
  }
});

export { router as messagesRouter };
