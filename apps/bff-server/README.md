# `@omnimind/bff-server` — TypeScript AI BFF 与 Agent 编排后端

- **技术栈**：Node.js + TypeScript + Hono + `@google/genai` + Vercel AI SDK + LangGraph.js + Langfuse
- **核心职责**：
  1. 提供 `/api/chat/stream` 多通道 SSE 流式接口（`thinking` / `text_delta` / `citations` / `ui_card` / `usage_metrics`）
  2. 多模型路由与超时自动 Fallback（Gemini 2.5 Flash/Pro ➔ DeepSeek-V3 / Qwen-Max）
  3. 个人记忆库 RAG 混合检索（Supabase `pgvector` + Postgres 全文检索 RRF + Jina Rerank）
  4. LangGraph.js 状态机与 Human-in-the-Loop 工具审批挂起/恢复
