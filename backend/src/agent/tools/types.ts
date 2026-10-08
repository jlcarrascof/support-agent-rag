import type { ToolDefinition } from "../openai.js";

export interface Tool {
  definition: ToolDefinition;
  execute: (args: Record<string, unknown>) => Promise<unknown>;
}
