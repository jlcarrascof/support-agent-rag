import { chatCompletion, type ChatMessage } from "./openrouter.js";
import { tools, toolDefinitions } from "./tools/index.js";

const SYSTEM_PROMPT = `You are a customer support agent for a delivery and ride-hailing platform.
Use the available tools to look up order status, cancel rides, issue refunds, and search the
knowledge base for policy questions. Always use a tool when the customer's request requires
real data or an action — never guess an order status or policy detail. Keep replies concise
and friendly.`;

const MAX_TOOL_ITERATIONS = 5;

export interface ToolCallRecord {
  name: string;
  arguments: Record<string, unknown>;
  result: unknown;
}

export interface AgentResult {
  reply: string;
  toolCalls: ToolCallRecord[];
}

export async function runAgent(
  userMessage: string,
  history: ChatMessage[] = []
): Promise<AgentResult> {
  const messages: ChatMessage[] = [
    { role: "system", content: SYSTEM_PROMPT },
    ...history,
    { role: "user", content: userMessage },
  ];

  const toolCalls: ToolCallRecord[] = [];

  for (let i = 0; i < MAX_TOOL_ITERATIONS; i++) {
    const response = await chatCompletion(messages, toolDefinitions);
    messages.push(response);

    if (!response.tool_calls || response.tool_calls.length === 0) {
      return { reply: response.content ?? "", toolCalls };
    }

    for (const call of response.tool_calls) {
      const tool = tools[call.function.name];
      const args = JSON.parse(call.function.arguments) as Record<string, unknown>;
      const result = tool
        ? await tool.execute(args)
        : { error: `Unknown tool '${call.function.name}'.` };

      toolCalls.push({ name: call.function.name, arguments: args, result });

      messages.push({
        role: "tool",
        tool_call_id: call.id,
        name: call.function.name,
        content: JSON.stringify(result),
      });
    }
  }

  return {
    reply: "I'm having trouble completing this request. Let me escalate it to a human agent.",
    toolCalls,
  };
}
