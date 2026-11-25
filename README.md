# ✦ OmniMind & 52 周 AI 应用开发工程师转型主仓库

> **定位**：融合「52 周系统化 AI 工程学习路线」与「旗舰级全模态端云协同 AI 助手 **OmniMind**」的全栈 Monorepo。
> **核心技术栈**：**TypeScript (Hono / Node.js) + React 19 + Ant Design 5（PC 控制台 & 移动 H5）+ `@google/genai` + LangGraph.js + MCP + Supabase `pgvector` + Langfuse**（全程纯 TypeScript / React，零 Python 主栈、免原生 App 环境）。

---

## 📑 核心文档导航（已按模块拆分）

| 文档路径 | 文档职责与核心内容 |
| :--- | :--- |
| 📘 [**`LEARNING_PLAN.md`**](./LEARNING_PLAN.md) | **52 周转型学习总计划**：8 门 Google 官方课程映射、4 大阶段逐周任务与打卡表 |
| 🎯 [**`docs/01-PRD-AND-SCOPE.md`**](./docs/01-PRD-AND-SCOPE.md) | **产品需求与边界规范 (PRD)**：OmniMind 五大功能模块、MVP 边界、Non-Goals 与 5 大阻断级冒烟用例 |
| 🎨 [**`docs/02-UI-UX-DESIGN.md`**](./docs/02-UI-UX-DESIGN.md) | **详细 UI/UX 设计规范（零 Figma）**：单工作台布局图、4 类 Generative UI 动态卡片规格、溯源抽屉与 Design Tokens |
| 🖥️ [**`docs/ui-prototype/index.html`**](./docs/ui-prototype/index.html) | **可交互高保真 HTML UI 原型**：浏览器直接打开即可交互体验主工作台、卡片审批与 `[1]` 溯源抽屉 |
| 🏗️ [**`docs/03-TECH-ARCHITECTURE.md`**](./docs/03-TECH-ARCHITECTURE.md) | **前后端技术架构与 Monorepo 规范**：为什么前后端同仓、技术选型明细、自定义多通道 SSE 流式协议 |
| 🗓️ [**`docs/04-ROADMAP-AND-SCHEDULE.md`**](./docs/04-ROADMAP-AND-SCHEDULE.md) | **版本里程碑与 52 周排期表**：`v0.1 ~ v1.0` 四大 GitHub Milestones 与 23 个核心 Issue 映射表 |

---

## 📁 仓库目录分层架构（代码、文档与学习笔记物理隔离）

```text
.
├── LEARNING_PLAN.md                   # [学习计划] 52 周完整学习路线与周度打卡表
├── docs/                              # [设计文档] 按 PRD / UI / 架构 / 排期 独立拆分
│   ├── 01-PRD-AND-SCOPE.md
│   ├── 02-UI-UX-DESIGN.md
│   ├── 03-TECH-ARCHITECTURE.md
│   ├── 04-ROADMAP-AND-SCHEDULE.md
│   └── ui-prototype/index.html        # 零 Figma 交互式高保真 UI 设计原型
├── apps/                              # [前后端应用区 - Monorepo 核心工程]
│   ├── bff-server/                    # 后端：TypeScript + Hono + @google/genai + 多模型网关 + LangGraph
│   ├── mobile-h5/                     # 移动 H5 端：React 19 + Ant Design 5 + Vite + 移动多模态采集 + .ics 日历导出
│   └── web-console/                   # Web 端：React 19 + Ant Design 5 + Generative UI + RAG 评测看板
├── packages/                          # [共享协议、MCP 服务与自动化评测套件]
│   ├── shared-schema/                 # 前后端共享的 SSE 多通道事件协议与动态卡片 Zod Schema
│   ├── mcp-server/                    # 基于 @modelcontextprotocol/sdk 的自定义 MCP 工具服务
│   └── eval-suite/                    # 40 条黄金测试问答集 (Golden Dataset) 与自动化 RAG/Agent 评测脚本
└── notes/                             # [学习沉淀区 - 与生产代码完全隔离]
    ├── google-cloud-skills/           # Google Cloud 8 门官方课程与动手实验记录
    ├── badges/                        # 官方 Skill Badge 证书与验证链接归档
    └── interview-prep/                # 四大 AI 面试专题复盘笔记、系统设计图与双版本定制简历
```

---

## 🎯 四大版本里程碑（同步 GitHub Milestones & Issues）

1. **Milestone 1 (`v0.1`) — 多模态流式基座与动态卡片（第 1~6 周）**：跑通 TS Hono 多通道 SSE、多模型容灾网关与 React + Ant Design（H5 移动端 / PC 控制台）日程/记账动态卡片渲染。
2. **Milestone 2 (`v0.2`) — 个人记忆库 RAG 与量化 Eval（第 7~22 周）**：考取 Google Agent Skill Badge，实现多模态切片、`pgvector` + 全文混合检索 (RRF)、Rerank、`[1]` 角标溯源抽屉、Langfuse 监控与 40 题量化 Eval 报告。
3. **Milestone 3 (`v0.3`) — 跨端 Agent、MCP 与移动 H5 协同（第 23~38 周）**：集成 LangGraph.js 状态机、自定义 MCP Server、Human-in-the-Loop 审批拦截、H5 相机/语音采集、`.ics` 日历导出与本地隐私脱敏，并容器化部署至 Google Cloud Run。
4. **Milestone 4 (`v1.0`) — 终极性能打磨与求职冲刺（第 39~52 周）**：TTFT 首字延迟与语义缓存优化、1 分钟手机浏览器/桌面高清演示视频、双版本 STAR 简历定稿与全量求职冲刺。

---

## 🚀 本地快速启动

```bash
# 1. 安装依赖
pnpm install

# 2. 启动后端 AI BFF (http://localhost:3001)
pnpm dev:bff

# 3. 启动移动端 H5 工作台 (http://localhost:3002，支持同局域网手机浏览器直接打开)
pnpm dev:h5

# 4. 启动 PC Web 控制台 (http://localhost:3000)
pnpm dev:web
```
