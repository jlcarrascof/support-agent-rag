const OPENROUTER_URL = "https://openrouter.ai/api/v1/chat/completions";

// The free-models router auto-selects an available free model that supports
// the request's required features (including tool-calling), instead of
// pinning a specific model name that may rotate out of the free tier.
const MODEL = "openrouter/free";

export interface ChatMessage {
  role: "system" | "user" | "assistant" | "tool";
  content: string | null;
  tool_calls?: ToolCall[];
  tool_call_id?: string;
  name?: string;
}

export interface ToolCall {
  id: string;
  type: "function";
  function: {
    name: string;
    arguments: string;
  };
}

export interface ToolDefinition {
  type: "function";
  function: {
    name: string;
    description: string;
    parameters: Record<string, unknown>;
  };
}

interface OpenRouterResponse {
  choices: Array<{
    message: ChatMessage;
    finish_reason: string;
  }>;
}

export async function chatCompletion(
  messages: ChatMessage[],
  tools: ToolDefinition[]
): Promise<ChatMessage> {
  const response = await fetch(OPENROUTER_URL, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: MODEL,
      messages,
      tools,
    }),
  });

  if (!response.ok) {
    const body = await response.text();
    throw new Error(`OpenRouter request failed: ${response.status} ${response.statusText} - ${body}`);
  }

  const data = (await response.json()) as OpenRouterResponse;
  return data.choices[0].message;
}
