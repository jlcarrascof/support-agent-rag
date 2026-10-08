# Eval report

Generated: 2026-10-08T21:23:37.407Z

## Summary

- Cases run: 18
- Request errors (OpenAI/infra failures, not agent mistakes): 0/18
- Resolution rate: 18/18 (100%)
- Correct tool usage rate: 18/18 (100%)
- Hallucination flags: 0/18
- Latency: avg 2341ms, median 2413ms

## Cases

| id | category | expected tool | tools called | correct tool usage | resolved | hallucination flag | latency (ms) |
|---|---|---|---|---|---|---|---|
| order-status-basic | order_status | getOrderStatus | getOrderStatus | ✅ | ✅ | - | 2749 |
| disputed-delivery-refund | refund | issueRefund | issueRefund | ✅ | ✅ | - | 2723 |
| order-status-unknown-id | order_status | getOrderStatus | getOrderStatus | ✅ | ✅ | - | 2340 |
| cancel-ride-free-window | cancel_ride | cancelRide | cancelRide | ✅ | ✅ | - | 3165 |
| cancel-ride-with-fee | cancel_ride | cancelRide | cancelRide | ✅ | ✅ | - | 2413 |
| cancel-ride-late-driver-waiver | cancel_ride | cancelRide | cancelRide | ✅ | ✅ | - | 2681 |
| cancel-ride-in-progress | cancel_ride | cancelRide | cancelRide | ✅ | ✅ | - | 2388 |
| cancel-ride-unknown-id | cancel_ride | cancelRide | cancelRide | ✅ | ✅ | - | 2328 |
| refund-delivered-order | refund | issueRefund | issueRefund | ✅ | ✅ | - | 2905 |
| refund-in-transit-order | refund | issueRefund | issueRefund | ✅ | ✅ | - | 2625 |
| refund-already-refunded | refund | issueRefund | issueRefund | ✅ | ✅ | - | 2328 |
| refund-unknown-order | refund | issueRefund | issueRefund | ✅ | ✅ | - | 2324 |
| kb-refund-policy | knowledge_base | searchKnowledgeBase | searchKnowledgeBase | ✅ | ✅ | - | 2929 |
| kb-refund-timing | knowledge_base | searchKnowledgeBase | searchKnowledgeBase | ✅ | ✅ | - | 2085 |
| kb-late-driver-policy | knowledge_base | searchKnowledgeBase | searchKnowledgeBase | ✅ | ✅ | - | 2640 |
| greeting-no-tool | no_tool | - | - | ✅ | ✅ | - | 972 |
| nonsense-no-tool | no_tool | - | - | ✅ | ✅ | - | 1223 |
| out-of-scope-no-tool | no_tool | - | - | ✅ | ✅ | - | 1311 |

## Notes

- "Correct tool usage" checks whether the agent called the tool expected to ground its reply in
  real data. For `no_tool` cases, it checks that the agent did NOT call any tool unnecessarily.
- "Hallucination flag" is a heuristic: it fires when a case expected a grounding tool call and the
  agent didn't make it, meaning the reply may have been invented rather than looked up. It does not
  inspect reply content against tool results.
- The agent runs against the live OpenAI API (gpt-4o-mini), so results can vary slightly between
  runs.
- A "request error" means the case never got a usable response from OpenAI (e.g. a transient API or
  network failure) and is excluded from the resolution/tool-usage rates'
  numerator but counted in their denominator — it reflects infra flakiness, not an agent mistake.
- Known limitation: `issueRefund` does not detect disputed-delivery claims ("I never received this")
  on an order already marked `delivered` — it refunds on request like any other delivered-order
  refund. Verifying a non-receipt claim is a judgment call real support agents make with more context
  (delivery photos, address history, etc.), so it's out of scope for this mock tool's rule-based logic.
