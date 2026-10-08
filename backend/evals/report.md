# Eval report

Generated: 2026-10-08T20:30:15.071Z

## Summary

- Cases run: 18
- Resolution rate: 18/18 (100%)
- Correct tool usage rate: 16/18 (89%)
- Hallucination flags: 2/18
- Latency: avg 12523ms, median 9692ms

## Cases

| id | category | expected tool | tools called | correct tool usage | resolved | hallucination flag | latency (ms) |
|---|---|---|---|---|---|---|---|
| order-status-basic | order_status | getOrderStatus | getOrderStatus | ✅ | ✅ | - | 3844 |
| order-status-delivered | order_status | issueRefund | getOrderStatus | ❌ | ✅ | ⚠️ | 11158 |
| order-status-unknown-id | order_status | getOrderStatus | getOrderStatus | ✅ | ✅ | - | 7149 |
| cancel-ride-free-window | cancel_ride | cancelRide | cancelRide | ✅ | ✅ | - | 12435 |
| cancel-ride-with-fee | cancel_ride | cancelRide | searchKnowledgeBase, searchKnowledgeBase, cancelRide | ✅ | ✅ | - | 34779 |
| cancel-ride-late-driver-waiver | cancel_ride | cancelRide | cancelRide | ✅ | ✅ | - | 18691 |
| cancel-ride-in-progress | cancel_ride | cancelRide | cancelRide | ✅ | ✅ | - | 3052 |
| cancel-ride-unknown-id | cancel_ride | cancelRide | cancelRide | ✅ | ✅ | - | 7661 |
| refund-delivered-order | refund | issueRefund | getOrderStatus, issueRefund | ✅ | ✅ | - | 13121 |
| refund-in-transit-order | refund | issueRefund | getOrderStatus, searchKnowledgeBase | ❌ | ✅ | ⚠️ | 28350 |
| refund-already-refunded | refund | issueRefund | issueRefund | ✅ | ✅ | - | 3219 |
| refund-unknown-order | refund | issueRefund | issueRefund, searchKnowledgeBase | ✅ | ✅ | - | 43488 |
| kb-refund-policy | knowledge_base | searchKnowledgeBase | searchKnowledgeBase | ✅ | ✅ | - | 5983 |
| kb-refund-timing | knowledge_base | searchKnowledgeBase | searchKnowledgeBase | ✅ | ✅ | - | 9692 |
| kb-late-driver-policy | knowledge_base | searchKnowledgeBase | searchKnowledgeBase | ✅ | ✅ | - | 3851 |
| greeting-no-tool | no_tool | - | - | ✅ | ✅ | - | 4078 |
| nonsense-no-tool | no_tool | - | - | ✅ | ✅ | - | 4514 |
| out-of-scope-no-tool | no_tool | - | - | ✅ | ✅ | - | 10344 |

## Notes

- "Correct tool usage" checks whether the agent called the tool expected to ground its reply in
  real data. For `no_tool` cases, it checks that the agent did NOT call any tool unnecessarily.
- "Hallucination flag" is a heuristic: it fires when a case expected a grounding tool call and the
  agent didn't make it, meaning the reply may have been invented rather than looked up. It does not
  inspect reply content against tool results.
- The agent runs against the live OpenRouter free-model router, so results can vary slightly between
  runs depending on which free model is routed.
