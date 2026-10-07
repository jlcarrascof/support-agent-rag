import { getOrderStatusTool } from "./getOrderStatus.js";
import { cancelRideTool } from "./cancelRide.js";
import { issueRefundTool } from "./issueRefund.js";
import { searchKnowledgeBaseTool } from "./searchKnowledgeBase.js";
import type { Tool } from "./types.js";

export const tools: Record<string, Tool> = {
  getOrderStatus: getOrderStatusTool,
  cancelRide: cancelRideTool,
  issueRefund: issueRefundTool,
  searchKnowledgeBase: searchKnowledgeBaseTool,
};

export const toolDefinitions = Object.values(tools).map((tool) => tool.definition);
