import type { ToolDefinition } from "../openrouter.js";

export interface Tool {
  definition: ToolDefinition;
  execute: (args: Record<string, unknown>) => Promise<unknown>;
}
