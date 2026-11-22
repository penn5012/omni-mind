# `@omnimind/shared-schema` — 前后端共享协议与 Zod Schema

- **核心职责**：
  1. 定义多通道 SSE 事件流强类型契约 (`thinking`, `text_delta`, `citations`, `ui_card`, `usage_metrics`)
  2. 定义 4 类 Generative UI 动态卡片 (`schedule_card`, `expense_card`, `tool_approval_card`, `analytics_card`) 的 Zod Schema
  3. 定义端云协同 Tool Call 参数与审批恢复负载结构
