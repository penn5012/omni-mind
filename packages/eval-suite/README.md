# `@omnimind/eval-suite` — RAG 与 Agent 自动化评测套件

- **技术栈**：TypeScript + `@google/genai` (LLM-as-a-Judge) + Langfuse Dataset API
- **核心职责**：
  1. 维护 40+ 条个人记忆与多步工具调用黄金测试集 (`golden-dataset.json`)
  2. 自动化评测 Context Recall（召回率）、Faithfulness（忠实度/无幻觉度）、Answer Relevance 与 Agent Task Success Rate
  3. 输出不同 Chunk 策略、纯向量 vs 混合检索 + Rerank 的量化对比 Markdown 报告
