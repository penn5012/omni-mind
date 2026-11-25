# 03. OmniMind 前后端技术架构与 Monorepo 工程规范

> **技术路线红线**：全程采用 **TypeScript + React + Ant Design（PC 控制台 & 移动 H5，零 Python 主栈、免原生 App 环境）**。
> **工程组织模式**：采用 **Full-Stack AI Monorepo** 架构，将前后端、共享 Schema、自定义 MCP Server 与自动化 Eval 套件统一编排，按目录严格物理隔离。

---

## 一、为什么前后端代码适合放在同一仓库（Monorepo 架构决策记录 ADR）

在个人全栈 AI 作品集与敏捷开发场景下，将前后端放在同一个仓库（Monorepo）具备 **4 大压倒性优势**：

1. **AI 流式协议与 Generative UI Schema 强一致（Single Source of Truth）**
   - AI 应用的核心复杂度在于「后端 SSE 多通道事件流」与「前端动态卡片渲染器」的契约同步。
   - 在 Monorepo 下，`packages/shared-schema` 定义的 `Zod` / TypeScript 类型可以直接被后端 `apps/bff-server`、移动 H5 `apps/mobile-h5` 和桌面端 `apps/web-console` 原生共享引用，零跨语言代码生成成本，彻底杜绝前后端字段不一致导致的解析崩溃。
2. **面试官 30 秒黄金审阅体验**
   - 面试官点击简历上的 GitHub 链接时，通常只停留 30~60 秒。
   - 单一旗舰级 Monorepo 仓库能在根目录集中展示完整的端到端系统架构图、RAG Eval 评测对比报告与演示视频，下一层目录清晰呈现 `bff-server`、`mobile-h5`、`web-console`、`mcp-server`、`eval-suite`，一眼体现候选人的**全栈 AI 工程把控力**。
3. **一次 Commit 完成端到端特性闭环**
   - 新增一张动态卡片或新增一个端侧 Tool 时，可以在同一个 Commit / Issue 中闭环「后端 Prompt/Tool 定义 + React/Antd 动态卡片渲染 + 冒烟测试」，无需跨多个仓库同步版本号。
4. **独立部署与 CI/CD 完全解耦**
   - 放在同一仓库不等于耦合打包：`apps/bff-server` 拥有独立的 `Dockerfile` 部署至 **Google Cloud Run**；`apps/mobile-h5` 与 `apps/web-console` 可独立构建静态产物部署至 Vercel / Cloudflare Pages / Nginx。

---

## 二、Monorepo 目录分层隔离规范

为了保证代码库与日常学习笔记互不污染，仓库严格划分为 **4 大物理隔离区**：

```text
omni-mind/ (OmniMind Monorepo)
├── README.md                          # 仓库总览、架构图与快速导航
├── LEARNING_PLAN.md                   # [学习区] 52 周转型总计划与打卡表
├── docs/                              # [文档区 - 按职责严格拆分]
│   ├── 01-PRD-AND-SCOPE.md            # 产品需求、MVP 边界与 5 大阻断级冒烟用例
│   ├── 02-UI-UX-DESIGN.md             # 零 Figma 详细 UI 设计图、组件树与 Design Tokens
│   ├── 03-TECH-ARCHITECTURE.md        # 前后端技术选型、Monorepo 规范与 SSE 协议设计
│   ├── 04-ROADMAP-AND-SCHEDULE.md     # 4 大版本里程碑与 52 周开发排期表
│   └── ui-prototype/
│       └── index.html                 # 可在浏览器直接交互的高保真 HTML UI 原型
├── apps/                              # [生产应用区 - 前后端核心代码]
│   ├── bff-server/                    # 后端：TypeScript + Hono + @google/genai + LangGraph.js
│   ├── mobile-h5/                     # 移动 H5 端：React 19 + Ant Design 5 + Vite + 相机/语音/.ics 日历
│   └── web-console/                   # PC Web 端：React 19 + Ant Design 5 + Generative UI + RAG 看板
├── packages/                          # [核心 AI 模块与评测区]
│   ├── shared-schema/                 # 前后端共享的 SSE 事件协议与动态卡片 Zod Schema
│   ├── mcp-server/                    # 自定义 MCP (Model Context Protocol) 工具服务端
│   └── eval-suite/                    # 40 条黄金测试集 (Golden Dataset) 与自动化评测脚本
└── notes/                             # [个人学习笔记区 - 与生产代码完全隔离]
    ├── google-cloud-skills/           # Google 官方 8 门课程与动手实验笔记
    ├── badges/                        # 官方 Skill Badge 证书凭证
    └── interview-prep/                # 四大面试专题复盘笔记与双版本定制简历
```

---

## 三、前后端技术栈明细表

| 技术层级 | 选定框架 / 核心库 | 核心职责与工程选型理由 |
| :--- | :--- | :--- |
| **移动 H5 客户端 (`apps/mobile-h5`)** | **React 19** + **Ant Design 5.x (`antd` + `@ant-design/icons`)** + **Vite 6** | 替代原生 App，手机浏览器免安装即开即用；针对 `360px ~ 480px` 移动视口、安全区与底部 `Drawer` 深度优化；集成 HTML5 相机 + Canvas 压缩、Web Speech 语音输入、本地正则隐私脱敏与 `.ics` 日历导出 |
| **Web 客户端 (`apps/web-console`)** | **React 19** + **Ant Design 5.x (`antd` + `@ant-design/icons`)** + **Vite / Next.js** | 复用既有 React 优势，基于 Ant Design `ConfigProvider` Design Token 主题定制，共用同一套 TS BFF，负责大屏流式问答、知识库文档批量管理与 Eval 评测可视化看板 |
| **AI 后端 BFF (`apps/bff-server`)** | **Hono (Node.js + TypeScript)** + **Zod** | 原生支持 Web Standard `streamSSE`，体积轻量、冷启动极快，完美契合 Google Cloud Run 容器化部署 |
| **大模型与网关层** | **`@google/genai`** + **Vercel AI SDK (`ai`)** | 主力调用 `gemini-2.5-flash` / `gemini-2.5-pro` 及 `text-embedding-004`；通过 OpenAI 兼容层接入 `DeepSeek-V3` / `Qwen-Max` 实现超时自动 Fallback |
| **Agent 与 MCP 层 (`packages/mcp-server`)** | **`@langchain/langgraph`** + **`@modelcontextprotocol/sdk`** | LangGraph.js 实现多步规划与 Human-in-the-Loop 状态挂起/恢复；官方 MCP SDK 开发标准化工具服务 |
| **向量与混合检索层** | **Supabase (`pgvector` + Postgres Full-Text)** + **Jina Reranker** | 免费云端 Postgres 同时支撑结构化业务表、高维向量索引（HNSW）与 BM25 全文检索，实现 RRF 混合检索 + 重排 |
| **可观测性与云原生** | **Langfuse TypeScript SDK** + **Docker** + **Google Cloud Run** | 全链路记录 Trace、TTFT 首字延迟与 Token 成本；Docker 多阶段构建部署至 Cloud Run |

---

## 四、自定义多通道 SSE 流式通信协议规范

后端 `/api/chat/stream` 接口统一采用 `text/event-stream` 协议，单次对话按序下发以下 5 类强类型事件：

```typescript
// packages/shared-schema/src/sse-protocol.ts

export type SseEventType =
  | 'thinking'         // 1. 思考链与检索/工具规划步骤
  | 'text_delta'       // 2. 正文 Markdown 增量打字机片段 (含 [1][2] 角标)
  | 'citations'        // 3. RAG 召回的引用溯源元数据列表 (供点击角标弹出抽屉)
  | 'ui_card'          // 4. Generative UI 动态卡片负载 (schedule / expense / approval / analytics)
  | 'usage_metrics';   // 5. 本次请求可观测性指标 (TTFT, inputTokens, outputTokens, cost, modelUsed)
```
