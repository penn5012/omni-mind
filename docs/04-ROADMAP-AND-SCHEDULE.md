# 04. OmniMind 版本里程碑与 52 周开发排期表

> **排期原则**：将 52 周 AI 应用开发转型计划直接映射为 `OmniMind` 的 **4 个大版本里程碑（Milestones）** 与 **16 个核心交付任务（GitHub Issues）**，所有里程碑均已在 GitHub Issues & Milestones 中同步创建。

---

## 一、四大 GitHub Milestones 总览

| 里程碑编号 | 里程碑名称 | 覆盖周期 | 核心技术攻克目标 | 版本准出门禁 (Gate) |
| :--- | :--- | :--- | :--- | :--- |
| **Milestone 1** | **`v0.1` 多模态流式基座与动态卡片** | 第 1 ~ 6 周<br>(2026.11 - 2027.01) | TS Hono BFF、`@google/genai` 多模态识图、多通道 SSE 协议、多模型 Fallback 网关、React + Ant Design（H5 / PC）动态卡片渲染 | 通过 `SMK-01 ~ SMK-03` 冒烟测试，打 Tag `v0.1.0` |
| **Milestone 2** | **`v0.2` 个人记忆库 RAG 与量化 Eval** | 第 7 ~ 22 周<br>(2027.01 - 2027.05) | Google Agent Skill Badge、多模态切片、Embedding、`pgvector`、混合检索 (RRF)、Rerank、`[1]` 溯源抽屉、Langfuse、40 题 Eval 跑分 | 通过 `SMK-04` 冒烟测试，产出 Eval 提分报告，打 Tag `v0.2.0` |
| **Milestone 3** | **`v0.3` 跨端 Agent、MCP 与移动 H5 协同** | 第 23 ~ 38 周<br>(2027.05 - 2027.08) | 中期试投、LangGraph.js 状态机、自定义 MCP Server、Human-in-the-Loop 审批拦截、H5 相机/语音采集、`.ics` 日历导出与端侧脱敏、Cloud Run 部署 | 通过 `SMK-05` 冒烟与移动多分辨率兼容回归，打 Tag `v0.3.0` |
| **Milestone 4** | **`v1.0` 终极性能打磨与高转化求职冲刺** | 第 39 ~ 52 周<br>(2027.09 - 2027.11) | TTFT 首字延迟与语义缓存优化、1 分钟手机 H5 / 桌面演示视频、四大面试专题复盘、双版本 STAR 简历、全量投递拿 Offer | 发布 `v1.0.0` 正式版，完成全栈 / 前端 AI 转型上岸 |

---

## 二、逐周详细开发与学习排期表

### 🚀 Milestone 1：`v0.1` 多模态流式基座与动态卡片（第 1 ~ 6 周）

| 周次 | 核心开发任务 | 关联 GitHub Issue | 本周必须产出的代码 / 文档交付物 |
| :--- | :--- | :--- | :--- |
| **第 1 周** | 市场 JD 校准 + 云预算配置 + Monorepo 初始化 | Issue #1 | 《目标岗位技能矩阵》、Google Cloud \$10/月 预算告警、Monorepo 目录初始化 |
| **第 2 周** | TS 后端 `@google/genai` 多模态接入 | Issue #2 | `apps/bff-server` 基础服务，跑通文本对话与本地图片上传识别脚本 |
| **第 3 周** | Zod 强类型 Schema 与多通道 SSE 流式协议 | Issue #3 | `packages/shared-schema` 定义 `schedule_card` / `expense_card`，实现 Hono `streamSSE` |
| **第 4 周** | Web 测试工作台与流式打字机 / 手动中断 | Issue #4 | `apps/web-console` 实现流式 Markdown、思考链折叠框与 `AbortController` 停止生成 |
| **第 5 周** | 多模型容灾路由网关 (Auto Fallback) 与耗时统计 | Issue #5 | 封装 Gemini 主模型 + DeepSeek/Qwen 备用降级路由，尾部返回 `TTFT` 与 `Tokens` |
| **第 6 周** | 移动 H5 客户端主工作台落地与 `v0.1` 冒烟门禁 | Issue #6 | `apps/mobile-h5`（React + Ant Design）落地 Design Tokens、HTML5 拍照选图与动态卡片渲染，100% 通过冒烟测试 |

---

### 🧠 Milestone 2：`v0.2` 个人记忆库 RAG、溯源抽屉与量化 Eval（第 7 ~ 22 周）

| 周次 | 核心开发任务 | 关联 GitHub Issue | 本周必须产出的代码 / 文档交付物 |
| :--- | :--- | :--- | :--- |
| **第 7 ~ 8 周** | 官方 Agent Skill Badge 考取 + 手写 Function Calling | Issue #7 | 拿下 Google Skill Badge 公开证书；手写 TS 工具自动循环调用器 |
| **第 9 ~ 10 周** | 多模态记忆入库流水线与递归语义切片器 | Issue #8 | 图片转高密度 Markdown 描述 + 可配置 `chunkSize/overlap` 的 TS 语义切片器 |
| **第 11 ~ 12 周** | Supabase `pgvector` 向量入库与基础 RAG 闭环 | Issue #9 | 完成 HNSW 向量建表、Gemini Embedding 批量向量化与带防幻觉护栏的问答 MVP |
| **第 13 ~ 14 周** | Query 改写 + 全文/向量混合检索 (RRF) + Rerank | Issue #10 | 多轮指代消解改写节点、Postgres 全文+向量 RRF 融合检索、接入 Jina Reranker |
| **第 15 ~ 16 周** | 客户端 `[1][2]` 引用角标与半屏记忆溯源抽屉 UI | Issue #11 | 点击角标滑出 `CitationSourceBottomSheet`（展示原始拍照缩略图 + 高亮原文切片） |
| **第 17 ~ 19 周** | Langfuse 全链路可观测性 + 40 题自动化 Eval 调优 | Issue #12 | 集成 Langfuse Trace 树；完成 `packages/eval-suite` 跑批脚本与调优前后指标对比表 |
| **第 20 ~ 22 周** | 安全限流、语义缓存与 `v0.2` 公网部署结项 | Issue #13 | 增加 Rate Limit 与防注入检测，完成 `v0.2.0` 冒烟门禁与第一篇深度技术复盘文 |

---

### 🤖 Milestone 3：`v0.3` 跨端 Agent、MCP 协议与端云系统联动（第 23 ~ 38 周）

| 周次 | 核心开发任务 | 关联 GitHub Issue | 本周必须产出的代码 / 文档交付物 |
| :--- | :--- | :--- | :--- |
| **第 23 ~ 25 周** | 中期简历 v1 整理与市场小批量试投校准 | Issue #14 | 投递 10~15 家目标岗位，收集真实面试追问点校准阶段 3 细节 |
| **第 26 ~ 27 周** | LangGraph.js 状态机编排与长短期 Context 记忆管理 | Issue #15 | 实现「拆解 ➔ 执行 ➔ 校验回退」状态机，以及滑动窗口 + 用户偏好持久化提取 |
| **第 28 周** | 自定义 MCP Server 开发与动态挂载 | Issue #16 | 在 `packages/mcp-server` 基于 `@modelcontextprotocol/sdk` 实现标准工具服务 |
| **第 29 ~ 30 周** | Human-in-the-Loop 工具审批流式挂起与恢复协议 | Issue #17 | 敏感写操作下发 `tool_approval_card` 并挂起状态机，支持客户端批准/拒绝后恢复执行 |
| **第 31 ~ 34 周** | 移动 H5 语音输入、`.ics` 系统日历导出与浏览器本地脱敏 | Issue #18 | 打通 Web Speech 语音输入与 `.ics` 日历导出闭环；实现上传前手机号/身份证号本地正则脱敏 |
| **第 35 ~ 38 周** | Docker + Google Cloud Run 部署与移动端多浏览器回归 | Issue #19 | 多阶段 Dockerfile 部署至 Cloud Run；完成 iOS Safari / Android Chrome 360px~430px 兼容测试，发布 `v0.3.0` |

---

### 🏆 Milestone 4：`v1.0` 终极性能打磨与高转化求职冲刺（第 39 ~ 52 周）

| 周次 | 核心开发任务 | 关联 GitHub Issue | 本周必须产出的代码 / 文档交付物 |
| :--- | :--- | :--- | :--- |
| **第 39 周** | GitHub 门面精修、TTFT 性能优化与真机演示视频 | Issue #20 | 1 分钟高清真机演示视频、完整 README 架构图与评测数据看板，发布 `v1.0.0` |
| **第 40 ~ 44 周** | 四大 AI 面试专题复盘与 3 道系统设计白板演练 | Issue #21 | 沉淀 `notes/interview-prep/` 口语化问答库与企业级 RAG / 多模态网关架构图 |
| **第 45 ~ 46 周** | 双版本定制简历（AI 全栈 / AI 前端与 H5）与手写代码热身 | Issue #22 | 定稿两版高针对性简历 + 6 个 STAR 调优故事 + 手写 SSE 解析器/并发池练习 |
| **第 47 ~ 52 周** | 分批梯度投递、技术深水区突破与 Offer 谈薪上岸 | Issue #23 | 完成热身批与主攻批投递，拿到满意 AI 应用开发工程师 Offer |
