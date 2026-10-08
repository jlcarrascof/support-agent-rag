import "dotenv/config";
import { readFileSync, writeFileSync } from "fs";
import { join } from "path";
import { runAgent } from "../src/agent/orchestrator.js";

interface EvalCase {
  id: string;
  category: string;
  message: string;
  expectedTool: string | null;
}

interface EvalCaseResult {
  id: string;
  category: string;
  message: string;
  expectedTool: string | null;
  toolsCalled: string[];
  reply: string;
  correctToolUsage: boolean;
  resolved: boolean;
  hallucinationFlag: boolean;
  latencyMs: number;
  erroredAttempt: boolean;
}

const ESCALATION_FALLBACK = "I'm having trouble completing this request. Let me escalate it to a human agent.";

const DATASET_PATH = join(process.cwd(), "evals/dataset.json");
const REPORT_PATH = join(process.cwd(), "evals/report.md");
const RAW_RESULTS_PATH = join(process.cwd(), "evals/results.json");

function evaluateCase(evalCase: EvalCase, toolsCalled: string[], reply: string, latencyMs: number): EvalCaseResult {
  const correctToolUsage =
    evalCase.expectedTool === null
      ? toolsCalled.length === 0
      : toolsCalled.includes(evalCase.expectedTool);

  const resolved = reply.trim().length > 0 && reply !== ESCALATION_FALLBACK;

  // Heuristic: if the case expected a specific tool to ground the reply in real
  // data (an order status, a refund outcome, a KB fact) but the agent never
  // called it, the reply was likely fabricated rather than looked up.
  const hallucinationFlag = evalCase.expectedTool !== null && !correctToolUsage;

  return {
    id: evalCase.id,
    category: evalCase.category,
    message: evalCase.message,
    expectedTool: evalCase.expectedTool,
    toolsCalled,
    reply,
    correctToolUsage,
    resolved,
    hallucinationFlag,
    latencyMs,
    erroredAttempt: false,
  };
}

function erroredResult(evalCase: EvalCase, error: unknown, latencyMs: number): EvalCaseResult {
  const message = error instanceof Error ? error.message : String(error);

  return {
    id: evalCase.id,
    category: evalCase.category,
    message: evalCase.message,
    expectedTool: evalCase.expectedTool,
    toolsCalled: [],
    reply: `[request failed] ${message}`,
    correctToolUsage: false,
    resolved: false,
    hallucinationFlag: false,
    latencyMs,
    erroredAttempt: true,
  };
}

function buildReport(results: EvalCaseResult[]): string {
  const total = results.length;
  const erroredCount = results.filter((r) => r.erroredAttempt).length;
  const resolvedCount = results.filter((r) => r.resolved).length;
  const correctToolCount = results.filter((r) => r.correctToolUsage).length;
  const hallucinationCount = results.filter((r) => r.hallucinationFlag).length;
  const latencies = results.map((r) => r.latencyMs).sort((a, b) => a - b);
  const avgLatency = Math.round(latencies.reduce((sum, l) => sum + l, 0) / total);
  const medianLatency = latencies[Math.floor(total / 2)];

  const rows = results
    .map((r) => {
      if (r.erroredAttempt) {
        return `| ${r.id} | ${r.category} | ${r.expectedTool ?? "-"} | ⚠️ request error | ❌ | ❌ | - | ${r.latencyMs} |`;
      }
      return `| ${r.id} | ${r.category} | ${r.expectedTool ?? "-"} | ${r.toolsCalled.join(", ") || "-"} | ${
        r.correctToolUsage ? "✅" : "❌"
      } | ${r.resolved ? "✅" : "❌"} | ${r.hallucinationFlag ? "⚠️" : "-"} | ${r.latencyMs} |`;
    })
    .join("\n");

  return `# Eval report

Generated: ${new Date().toISOString()}

## Summary

- Cases run: ${total}
- Request errors (OpenRouter/infra failures, not agent mistakes): ${erroredCount}/${total}
- Resolution rate: ${resolvedCount}/${total} (${Math.round((resolvedCount / total) * 100)}%)
- Correct tool usage rate: ${correctToolCount}/${total} (${Math.round((correctToolCount / total) * 100)}%)
- Hallucination flags: ${hallucinationCount}/${total}
- Latency: avg ${avgLatency}ms, median ${medianLatency}ms

## Cases

| id | category | expected tool | tools called | correct tool usage | resolved | hallucination flag | latency (ms) |
|---|---|---|---|---|---|---|---|
${rows}

## Notes

- "Correct tool usage" checks whether the agent called the tool expected to ground its reply in
  real data. For \`no_tool\` cases, it checks that the agent did NOT call any tool unnecessarily.
- "Hallucination flag" is a heuristic: it fires when a case expected a grounding tool call and the
  agent didn't make it, meaning the reply may have been invented rather than looked up. It does not
  inspect reply content against tool results.
- The agent runs against the live OpenRouter free-model router, so results can vary slightly between
  runs depending on which free model is routed.
- A "request error" means the case never got a usable response from OpenRouter (e.g. a malformed or
  empty response from the free-tier router) and is excluded from the resolution/tool-usage rates'
  numerator but counted in their denominator — it reflects infra flakiness, not an agent mistake.
`;
}

async function main() {
  const dataset = JSON.parse(readFileSync(DATASET_PATH, "utf-8")) as EvalCase[];
  const results: EvalCaseResult[] = [];

  for (const evalCase of dataset) {
    const startedAt = Date.now();

    let result: EvalCaseResult;
    try {
      const { reply, toolCalls } = await runAgent(evalCase.message);
      const latencyMs = Date.now() - startedAt;
      result = evaluateCase(evalCase, toolCalls.map((c) => c.name), reply, latencyMs);
    } catch (error) {
      const latencyMs = Date.now() - startedAt;
      result = erroredResult(evalCase, error, latencyMs);
      console.error(`  -> request error for ${evalCase.id}:`, error);
    }

    results.push(result);

    const label = result.erroredAttempt ? "ERROR" : result.correctToolUsage ? "OK" : "FAIL";
    console.log(`[${label}] ${evalCase.id} (${result.latencyMs}ms)`);
  }

  writeFileSync(RAW_RESULTS_PATH, JSON.stringify(results, null, 2));
  writeFileSync(REPORT_PATH, buildReport(results));

  console.log(`\nReport written to ${REPORT_PATH}`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
