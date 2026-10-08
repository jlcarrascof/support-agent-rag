const OPENAI_URL = "https://api.openai.com/v1/chat/completions";

const MODEL = "gpt-4o-mini";

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

interface OpenAIResponse {
  choices: Array<{
    message: ChatMessage;
    finish_reason: string;
  }>;
}

export async function chatCompletion(
  messages: ChatMessage[],
  tools: ToolDefinition[]
): Promise<ChatMessage> {
  const response = await fetch(OPENAI_URL, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
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
    throw new Error(`OpenAI request failed: ${response.status} ${response.statusText} - ${body}`);
  }

  const data = (await response.json()) as OpenAIResponse;
  return data.choices[0].message;
}
