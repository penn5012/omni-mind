# AI 应用开发工程师转型学习计划（v3 52 周全细化版 · 1 年期）

> **目标岗位**：AI 应用开发工程师（主攻 **AI 全栈 / AI 前端** 与 **AI 移动端应用开发**）
> **学员背景**：具备 **Android / Flutter / React** 开发经验，**不学 Python 作为开发主栈**（全程采用 **TypeScript + React + Flutter / Android**，仅保留看懂 Python 示例逻辑的基础阅读能力）
> **转型周期**：**52 周 / 1 年（2026-11 ~ 2027-11）**，建议每周投入 **10 ~ 12 小时**（工作日每天 1~1.5h，周末 3~5h）
> **配套资源**：Google Skills / Cloud Skills Boost 平台课程 + Google AI Studio / Google Cloud（\$30 开发者额度）

---

## 📑 目录导航

- [一、核心战略与技术栈定位](#一核心战略与技术栈定位)
  - [1. 差异化竞争壁垒（最大化复用既有经验）](#1-差异化竞争壁垒最大化复用既有经验)
  - [2. 生产级技术栈（零 Python 主栈 + 多模型兼容）](#2-生产级技术栈零-python-主栈--多模型兼容)
- [二、截图 8 门课程完整映射表](#二截图-8-门课程完整映射表)
- [三、52 周逐周详细执行计划（2026-11 ~ 2027-11）](#三52-周逐周详细执行计划2026-11--2027-11)
  - [阶段 1（第 1 ~ 6 周）：市场校准 + 多模型 TS 流式应用入门](#阶段-1第-1--6-周--202611-下旬---202701-上旬市场校准--多模型-ts-流式应用入门)
  - [阶段 2（第 7 ~ 22 周）：Agent 徽章 + 生产级 RAG + Generative UI + Eval（作品集项目 1）](#阶段-2第-7--22-周--202701-中旬---202705-上旬agent-徽章--生产级-rag--generative-ui--eval作品集项目-1)
  - [阶段 3（第 23 ~ 38 周）：中期试投 + 跨端多模态 Agent + MCP + 云原生（作品集项目 2）](#阶段-3第-23--38-周--202705-中旬---202708-下旬中期试投--跨端多模态-agent--mcp--云原生作品集项目-2)
  - [阶段 4（第 39 ~ 52 周）：作品集终极打磨 + 面试体系冲刺 + 全量上岸](#阶段-4第-39--52-周--202709-上旬---202711-下旬作品集终极打磨--面试体系冲刺--全量上岸)
- [四、执行纪律与安全红线](#四执行纪律与安全红线)
- [五、52 周学习进度打卡表](#五52-周学习进度打卡表)

---

## 一、核心战略与技术栈定位

### 1. 差异化竞争壁垒（最大化复用既有经验）
- **Web 端护城河（React）**：不做千篇一律的纯文本聊天框，重点打造 **Generative UI（流式动态组件渲染、精准引用溯源高亮、交互式结果卡片）**。
- **移动端护城河（Flutter / Android）**：打造结合相机、实时语音、系统本地能力与端侧模型的 **端云协同多模态 Agent**。

### 2. 生产级技术栈（零 Python 主栈 + 多模型兼容）
- **AI 后端与编排层（BFF）**：TypeScript + Node.js（Next.js Route Handlers / Hono）、Google `@google/genai`、**Vercel AI SDK**、**OpenAI 兼容协议**（无缝切换 Gemini / DeepSeek / Qwen / Claude）、**MCP TypeScript SDK**、LangGraph.js / Genkit JS。
- **客户端层**：React / Next.js（Web）+ Flutter / Android Kotlin（移动端多模态 + 端侧 ML Kit / Gemini Nano）。
- **检索与数据层**：Embedding API + 向量数据库（Supabase `pgvector` 或 Qdrant JS SDK）+ Rerank 重排。
- **工程质量与云原生**：**Langfuse**（链路追踪）+ TypeScript **自动化 Eval 评测** + Docker + **Google Cloud Run** / Cloud Storage / IAM。

---

## 二、截图 8 门课程完整映射表

> **实操原则**：平台 Lab 若默认提供 Python 代码，只需在实验室内跑通流程理解 API 机制，**课后一律使用 TypeScript（`@google/genai` / Vercel AI SDK）重写落地**。

| 课程 / 路径名称 | 类型 | 截图时长 | 精确排期周次 | 优先级 | 学习策略 |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `Introduction to Generative AI` | Course | 45 分钟 | **第 1 周** | 必学 | 快速建立 LLM 与生成式 AI 全局概念框架 |
| `Getting Started with Google Generative AI Using the Gen AI SDK` | Lab | 30 分钟 | **第 2 周** | 必学 | 平台跑通流程，课后用 TS `@google/genai` 完整复现 |
| `Create Generative AI Apps on Google Cloud` | Course | 4 小时 | **第 4 周** | 必学 | 掌握 Google Cloud 生成式 AI 应用架构与服务编排 |
| `Generative AI Explorer - Agent Platform` | Course | 2 小时 30 分钟 | **第 7 周** | 必学 | 掌握 Agent 平台能力、Function Calling 与任务编排 |
| `Explore Generative AI in Agent Platform` | Course + Skill badge | 30 分钟 | **第 8 周** | 必学 | 通过中级实战评估，获取官方 **Skill Badge** 写入简历 |
| `Deploy and Manage Generative AI Models` | Path | 18 小时 30 分钟 | **第 37 周** | 选学拓展 | 挑选云端部署、监控与评估核心模块（约 4~6h 精华），跳过纯 Python 底层训练脚本 |
| `Generative AI for Healthcare` | Course | 1 小时 | 暂不安排 | 可跳过 | 医疗垂直行业课，与通用应用开发无关 |
| `Generative AI Leader Certification` | Path | 7 小时 23 分钟 | 暂不安排 | 可跳过 | 偏管理层与商业战略，非工程编码方向 |

---

## 三、52 周逐周详细执行计划（2026-11 ~ 2027-11）

### 阶段 1（第 1 ~ 6 周 | 2026.11 下旬 - 2027.01 上旬）：市场校准 + 多模型 TS 流式应用入门
> **阶段目标**：摸清目标岗位真实技术要求，刷完前 3 门基础课，用 **React + TypeScript** 独立交付支持多模型切换、流式输出与传图理解的 Web AI 助手。

- [ ] **第 1 周：市场校准 + 概念扫盲 + 环境与预算配置**
  - **学习/调研**：在招聘平台收集 20~30 份目标城市的「AI 前端 / AI 全栈 / AI 移动端」真实 JD，提炼高频技术词；学完 **`Introduction to Generative AI`**（45m）。
  - **实操交付**：开通 Google AI Studio API Key，在 Google Cloud 配置 **\$30 预算告警**；初始化 GitHub 学习主仓库，输出《目标岗位技能矩阵清单》。
- [ ] **第 2 周：Gen AI SDK 实战与多模态调通（TypeScript）**
  - **学习**：完成 **`Getting Started with Google Generative AI Using the Gen AI SDK`**（30m Lab）；系统学习 System Instruction、Temperature / Top-P / MaxTokens 参数机制。
  - **实操交付**：初始化 Node.js + TypeScript 工程，使用 `@google/genai` 编写文本对话、多轮上下文维护、本地图片上传理解（Multimodal）命令行/接口脚本。
- [ ] **第 3 周：强类型结构化输出（Structured Output）与 SSE 底层流式传输**
  - **学习**：掌握 JSON Schema / Zod 约束模型输出结构；理解 HTTP Server-Sent Events（SSE）分块流式协议。
  - **实操交付**：用 TS 实现「输入非结构化长文本/截图 → 严格输出强类型 JSON 数据」，并手写一个原生 Node.js SSE 流式转发接口与 React 流式读取 Hook。
- [ ] **第 4 周：Google Cloud 应用课 + Vercel AI SDK 流式对话骨架**
  - **学习**：学完 **`Create Generative AI Apps on Google Cloud`**（4h Course）；学习 React/Next.js 生态事实标准 **Vercel AI SDK**（`ai` 库）。
  - **实操交付**：搭建 Next.js / React + TS BFF 全栈骨架，实现丝滑的 Markdown/代码高亮打字机渲染、流式生成中途手动中断（`AbortController`）与错误重试。
- [ ] **第 5 周：去单一厂商绑定——多模型网关与容灾路由**
  - **学习**：掌握 OpenAI 兼容协议标准及主流模型（Gemini、DeepSeek、Qwen、Claude）的能力边界与计费方式。
  - **实操交付**：在 TS 服务端封装统一模型路由层，支持前端下拉切换模型、主模型超时自动 Fallback 降级至备用模型，并统计每次请求的输入/输出 Token 数。
- [ ] **第 6 周：阶段 1 结项打磨与复盘**
  - **实操交付**：整合前 5 周成果，完成 **Mini 项目：多模型多模态流式 Web 助手**（传图解析 + 结构化卡片展示 + 服务端 API Key 安全隔离），补齐 README 与架构说明并推送到 GitHub。

---

### 阶段 2（第 7 ~ 22 周 | 2027.01 中旬 - 2027.05 上旬）：Agent 徽章 + 生产级 RAG + Generative UI + Eval（作品集项目 1）
> **阶段目标**：考取 Google 官方 Agent Skill Badge；完成带 **Generative UI 交互壁垒、Langfuse 可观测性与量化 Eval 报告** 的生产级 RAG 知识库系统。

- [ ] **第 7 周：Agent 平台入门与原生 Function Calling 手写实现**
  - **学习**：完成 **`Generative AI Explorer - Agent Platform`**（2h30m Course），吃透 Tool Use / Function Calling 的请求-回调循环机制。
  - **实操交付**：不依赖重型框架，用纯 TypeScript + `@google/genai` 手写一个包含 3 个工具（天气查询、网页抓取、本地计算）的自动循环调用脚本。
- [ ] **第 8 周：冲刺官方 Skill Badge + 平台动手实验拓展（一）**
  - **学习**：完成 **`Explore Generative AI in Agent Platform`**（30m Course + 实战考核），拿下 **Skill Badge**；在平台 `generative ai` 目录筛选 `Format → Lab` 完成 2 个 Introductory/Intermediate 实验。
  - **实操交付**：保存并验证官方技能徽章公开链接（后续放入简历），将实验中的核心 Prompt 与编排思路用 TS 记录归档。
- [ ] **第 9 周：平台实验拓展（二）+ RAG 文档解析流水线**
  - **学习**：再选做 2~3 个平台 GenAI 动手 Lab；学习 RAG 全链路架构与常见文档解析痛点（乱码、表格丢失、页眉页脚噪音）。
  - **实操交付**：立项 **作品集项目 1（Generative UI 知识库问答系统）**，在 TS 后端接入 `unpdf` / Markdown 解析器，实现多格式文档提取与文本清洗模块。
- [ ] **第 10 周：文本切片工程（Chunking 策略与元数据设计）**
  - **学习**：对比固定长度切片、递归字符切片（Recursive Character Text Splitting）、按 Markdown 标题层级语义切片的优劣。
  - **实操交付**：用 TS 实现可配置 Chunk Size 与 Overlap 的递归+语义切片器，为每个切片附加文档 ID、页码、章节标题等 Metadata。
- [ ] **第 11 周：Embedding 向量化与向量数据库接入**
  - **学习**：理解高维向量空间、余弦相似度 / 内积距离、HNSW 索引基础。
  - **实操交付**：调用 Gemini Embedding API 实现批量向量化（含并发限速控制），接入 **Supabase `pgvector`**（或 Qdrant JS SDK）完成建表、向量入库与带 Metadata 过滤的 Top-K 检索。
- [ ] **第 12 周：项目 1 基础闭环（MVP）跑通**
  - **实操交付**：串联「前端上传文档 → 异步切片与向量入库 → 用户提问 → Top-K 检索 → Prompt 注入上下文流式回答」，加入基础防幻觉指令（仅依据给定上下文作答，未知则拒答）。
- [ ] **第 13 周：检索进阶（一）——Query 改写与多轮指代消解**
  - **学习**：解决多轮对话中“它多少钱？”这类指代不明导致检索失效的问题，学习 Query Rewriting、Multi-Query 扩展与 HyDE 思想。
  - **实操交付**：在检索前增加轻量级 Query 重写节点，将多轮历史压缩为独立精准的检索词，支持并行多路查询合并去重。
- [ ] **第 14 周：检索进阶（二）——混合检索（Hybrid Search）与 Rerank 重排**
  - **学习**：理解纯向量检索对专有名词/精确编号不敏感的缺陷，掌握「全文检索（BM25 / Postgres Full-Text）+ 向量检索」的 RRF（倒数秩融合）算法及 Cross-Encoder Rerank。
  - **实操交付**：在数据库中实现全文+向量混合检索，并接入 Rerank API（如 Cohere / Jina Reranker）对召回的前 20 条片段重排取 Top-5。
- [ ] **第 15 周：React 前端壁垒（一）——精准引用溯源 UI（Citations）**
  - **实操交付**：设计结构化引用协议，在 React 对话流中渲染可交互角标 `[1][2]`；右侧实现文档预览抽屉，点击角标自动滚动定位并高亮对应的 PDF 页码或 Markdown 原文段落。
- [ ] **第 16 周：React 前端壁垒（二）——Generative UI 动态组件渲染**
  - **学习**：深入 Vercel AI SDK 的 `streamUI` / Tool Invocation 前端组件映射模式。
  - **实操交付**：让大模型根据问答内容自动触发前端渲染**交互式对比表格、数据趋势图表（Recharts）、知识卡片与一键追问按钮**，彻底拉开与普通文本聊天框的视觉差距。
- [ ] **第 17 周：AI 可观测性——接入 Langfuse 全链路追踪**
  - **学习**：掌握生产级 LLM 应用监控指标（首字延迟 TTFT、端到端耗时、各环节耗时占比、Token 成本、用户点赞/点踩反馈收集）。
  - **实操交付**：在项目 1 中集成 **Langfuse TypeScript SDK**，记录从 Query 改写、混合检索、Rerank 到最终流式生成的完整 Trace 树。
- [ ] **第 18 周：自动化评测（Eval）体系搭建**
  - **学习**：掌握 RAG 核心评测指标（Context Recall 召回率、Faithfulness 忠实度/无幻觉度、Answer Relevance 回答相关性）及 LLM-as-a-Judge 方法。
  - **实操交付**：针对业务测试文档人工构造 **30~50 条黄金测试问答对（Golden Dataset）**，用 TS 编写自动化跑批评测脚本输出量化分数。
- [ ] **第 19 周：数据驱动检索调优实验（面试核心谈资）**
  - **实操交付**：基于第 18 周的 Eval 脚本做对照实验（对比不同 Chunk 大小、纯向量 vs 混合检索 + Rerank），把召回率/准确率从基线提升的过程记录成真实对比表格。
- [ ] **第 20 周：生产级健壮性加固（安全、限流与缓存）**
  - **实操交付**：增加上传文件大小/类型校验、IP 级请求限流（Rate Limiting）、基础 Prompt 注入检测，以及高频相似问题缓存优化以降低延迟与成本。
- [ ] **第 21 周：项目 1 云端部署上线**
  - **实操交付**：将项目 1 部署到公网（Vercel / Google Cloud Run + Supabase），配置自定义域名或稳定访问地址，邀请身边朋友实测并修复交互体验 Bug。
- [ ] **第 22 周：项目 1 结项包装与技术沉淀**
  - **实操交付**：打磨项目 1 GitHub 仓库（系统架构图、Generative UI 动图、Eval 优化前后量化指标对比表、Langfuse 监控截图、1 分钟演示视频），撰写第 1 篇深度复盘技术文章。

---

### 阶段 3（第 23 ~ 38 周 | 2027.05 中旬 - 2027.08 下旬）：中期试投 + 跨端多模态 Agent + MCP + 云原生（作品集项目 2）
> **阶段目标**：通过中期真实面试校准市场需求；结合 **Flutter / Android** 强项与 **TS Agent 后端** 打造跨端多模态王牌项目，并用 Docker + Cloud Run 完成云原生上线。

- [ ] **第 23 周：简历 v1 整理与中期试投准备**
  - **实操交付**：产出第一版转型简历（突出 React/Flutter/Android 既有研发功底 + Google Skill Badge + 项目 1 的 Generative UI 与 Eval 数据），梳理项目 1 面试讲稿。
- [ ] **第 24 周：中期市场试投摸底（一）**
  - **实操交付**：在招聘平台小批量定向投递 **10~15 家** AI 前端 / AI 全栈 / AI 移动端岗位，争取 2~4 场真实面试，检验市场反馈。
- [ ] **第 25 周：中期试投复盘与下半程校准（二）**
  - **实操交付**：整理面试中被高频追问但回答不够深入的知识点（如多 Agent 编排、移动端流式稳定性、特定框架等），微调阶段 3 项目 2 的功能设计。
- [ ] **第 26 周：复杂 Agent 编排模式与状态机实战**
  - **学习**：深入对比 ReAct、Plan-and-Execute、Reflection（自我反思修正）模式；学习 **LangGraph.js**（或 Genkit JS）有向图状态机编排。
  - **实操交付**：用 TS 状态机实现一个支持「任务拆解 → 分步执行 → 结果校验不达标自动回退重做」的多步 Agent 原型。
- [ ] **第 27 周：Context Engineering（上下文工程与长短期记忆）**
  - **学习**：解决长任务 Token 爆炸与关键信息遗忘问题，掌握滑动窗口裁剪、历史对话异步摘要压缩、用户画像/偏好长期记忆（Memory）提取。
  - **实操交付**：用 TS 实现可插拔的上下文管理器（自动控制上下文在指定 Token 预算内，并将关键事实持久化到数据库）。
- [ ] **第 28 周：MCP（Model Context Protocol）协议开发实战**
  - **学习**：吃透 MCP 架构（Host / Client / Server，Resources、Prompts、Tools 三大原语及 Stdio / Streamable HTTP 传输）。
  - **实操交付**：使用官方 `@modelcontextprotocol/sdk` (TypeScript) 独立开发一个自定义 **MCP Server**（封装日程管理、笔记检索或第三方业务 API），并在自己的 TS Agent 中作为 MCP Client 动态挂载调用。
- [ ] **第 29 周：工具调用容错与 Human-in-the-Loop（人工确认）**
  - **实操交付**：实现工具参数 Schema 校验失败时的模型自修复重试机制；针对敏感写操作（如删除数据、发送邮件、创建日程），实现**流式挂起等待客户端用户点击“批准/拒绝”后再继续执行**的闭环。
- [ ] **第 30 周：作品集项目 2 立项与 TS Agent BFF 层开发**
  - **实操交付**：正式立项 **项目 2：跨端多模态个人/业务效率 Agent**，设计自定义多通道 SSE 协议（区分 `thinking` 思考链、`tool_call` 工具执行状态、`approval_request` 审批卡片、`text_delta` 文本流），完成 TS 后端主体开发。
- [ ] **第 31 周：移动端差异化实战（一）——Flutter / Android 高可靠流式客户端**
  - **实操交付**：基于你熟悉的 **Flutter（或 Android Kotlin）** 初始化移动客户端工程，封装生产级 SSE 流式网络层（支持断网重连、后台切前台状态恢复、流式 Markdown 与代码块丝滑渲染、低帧率防抖优化）。
- [ ] **第 32 周：移动端差异化实战（二）——原生相机与语音多模态接入**
  - **实操交付**：在移动端接入相机拍照/相册选图（客户端端侧压缩裁剪）与语音录制输入，对接后端多模态大模型（例如：拍一张白板会议记录/票据/报错屏幕 + 语音说一句话，Agent 自动提取结构化信息并执行后续动作）。
- [ ] **第 33 周：移动端差异化实战（三）——端云工具联动与原生交互卡片**
  - **实操交付**：打通「云端 Agent 决策 → 下发客户端 Tool 指令 → Flutter/Android 调用系统日历/本地提醒/剪贴板/原生审批弹窗 → 回传执行结果给云端继续推理」的完整端云协同链路。
- [ ] **第 34 周：端侧 AI 探索（Android Gemini Nano / ML Kit 加分项）**
  - **学习**：调研学习 Android **ML Kit GenAI APIs / Gemini Nano**（或端侧轻量推理引擎）的适用场景与硬件限制。
  - **实操交付**：设计并验证“端侧离线快速摘要/敏感文本预处理 + 复杂多步工具编排路由至云端”的端云混合架构（即使部分设备受限，也要写出清晰的降级策略与架构文档，面试极具辨识度）。
- [ ] **第 35 周：云原生基础补齐（Docker + Google Cloud Storage + IAM）**
  - **学习**：结合 Google Skills **`云架构`** 方向，学习容器多阶段构建、对象存储签名上传与 IAM 最小权限原则。
  - **实操交付**：为 TS Agent 后端编写体积精简的多阶段 `Dockerfile` 本地跑通；配置 **Google Cloud Storage** 实现移动端图片/音频安全上传，并配置服务账号 IAM 权限。
- [ ] **第 36 周：Google Cloud Run 容器化公网部署**
  - **实操交付**：结合账号 **\$30 额度**，将容器镜像推送并部署至 **Google Cloud Run**，配置 Secret Manager / 环境变量保护 API Key、设置最大实例数防止意外超支，打通真机 App 直连公网 Cloud Run 服务。
- [ ] **第 37 周：截图进阶路径选学——MLOps 与生产运维视野**
  - **学习**：选学 **`Deploy and Manage Generative AI Models`**（18h30m Path）中的云端服务部署、版本管理、线上监控告警与延迟优化核心章节（精选约 4~6 小时与工程落地强相关内容，跳过底层 Python 训练细节）。
  - **实操交付**：为项目 2 补齐请求日志监控、错误率统计与接口超时熔断配置。
- [ ] **第 38 周：项目 2 评测压测与全套交付物归档**
  - **实操交付**：设计 20 个多步工具调用测试场景评估 Agent 任务一次完成率（Task Success Rate）；打出 Android Release APK（确保无崩溃、无布局溢出），录制「真机语音拍照 + 工具审批 + 云端联动」高清演示视频，完善项目 2 GitHub 文档。

---

### 阶段 4（第 39 ~ 52 周 | 2027.09 上旬 - 2027.11 下旬）：作品集终极打磨 + 面试体系冲刺 + 全量上岸
> **阶段目标**：将两个核心项目与全栈/移动端 AI 知识体系打磨至资深面试标准，完成高转化率求职投递并拿到满意 Offer。

- [ ] **第 39 周：GitHub 门面与双项目终极质检**
  - **实操交付**：优化 GitHub 个人主页，置顶项目 1（Web Generative UI + RAG）与项目 2（Flutter/Android + TS MCP Agent）；复查所有在线 Demo 链接秒开、补充首字延迟（TTFT）与 Token 成本优化前后对比数据。
- [ ] **第 40 周：面试专题复盘（一）——大模型基础与 Prompt / 结构化工程**
  - **复习重点**：Transformer 宏观推理机制（KV Cache 概念对延迟与上下文成本的影响）、Tokenizer、采样参数（Temperature / Top-P）、System Prompt 防护、JSON Schema 受限解码原理。
  - **交付**：整理成自己的口语化面试问答笔记（拒绝死记硬背）。
- [ ] **第 41 周：面试专题复盘（二）——生产级 RAG 全链路深挖**
  - **复习重点**：文档解析坑点、Chunking 粒度权衡、向量检索原理、Query 改写、混合检索（RRF）与 Rerank 收益、幻觉治理、RAG Eval 评测体系设计（紧密结合项目 1 真实数据作答）。
- [ ] **第 42 周：面试专题复盘（三）——Agent 架构、MCP 与上下文工程**
  - **复习重点**：ReAct vs Plan-and-Execute、状态机容错、Function Calling 死循环预防、长对话 Context 压缩策略、MCP 协议解决的核心痛点、Human-in-the-Loop 与安全护栏（紧密结合项目 2 作答）。
- [ ] **第 43 周：面试专题复盘（四）——React / Flutter / Android × AI 交叉高频题**
  - **复习重点**：SSE vs WebSocket 选型权衡、React 高频流式 Token 渲染防卡顿优化、Generative UI 协议设计、移动端弱网断线续传、音频/图片端侧预处理、端云协同架构权衡。
- [ ] **第 44 周：AI 系统架构设计题专项演练**
  - **实操演练**：独立画出并脱稿讲透 3 道经典系统设计题：① 支持千人并发与权限隔离的企业级 RAG 知识库；② 低延迟跨端多模态 AI 助手架构；③ 多模型路由网关（降本、限流、容灾 Fallback）。
- [ ] **第 45 周：双版本精准简历定稿与 STAR 故事打磨**
  - **实操交付**：分别定制 **《AI 全栈/前端开发工程师》**（侧重 React + Next.js + TS + Generative UI + RAG）与 **《AI 移动端应用开发工程师》**（侧重 Flutter/Android + 多模态交互 + 端云 Agent）两版简历；为每个项目提炼 3 个「痛点 → 排查 → 方案权衡 → 量化提升」的 STAR 案例。
- [ ] **第 46 周：全真模拟面试与高频手写代码热身**
  - **实操演练**：打磨 3 分钟高说服力自我介绍（突出“成熟客户端/前端工程经验 + 端到端 AI 应用落地能力”的复合优势）；手写练习高频 Coding 题（TS 异步并发池控制、SSE 流解析器、带退避的自动重试函数、常用数据结构题）。
- [ ] **第 47 周：全量投递第一波（热身批 20~30 家）**
  - **求职行动**：优先投递二梯队目标公司与 AI 创业团队，快速找回高频面试节奏，每次面试后 1 小时内记录所有被问问题与卡壳点。
- [ ] **第 48 周：第一波面试复盘与靶向补漏**
  - **求职行动**：针对第 47 周暴露出的薄弱环节，集中 1 周时间修补话术、补充项目小特性或重刷对应手写代码题，提升二面转化率。
- [ ] **第 49 周：全量投递第二波（核心主攻批 + 内推直达）**
  - **求职行动**：重点投递一梯队目标团队（成熟 AI 产品公司、出海 AI 应用团队、大厂创新业务 / 客户端 AI 团队），主动通过技术社区与校友/前同事渠道找内推直投研发负责人。
- [ ] **第 50 周：技术深水区二面 / 三面集中突破**
  - **求职行动**：全力应对密集的技术主管面与架构面，展示项目在线 Demo 与真机视频，重点体现工程质量意识（Eval、可观测性、成本与延迟控制、端侧交互体验）。
- [ ] **第 51 周：HR 面推进、多线进度对齐与谈薪博弈**
  - **求职行动**：推动意向强烈的公司同步进入 Offer 审批环节；结合过往 Android / Flutter / React 研发年限（而非按零经验应届生定位），合理沟通职级与薪资包。
- [ ] **第 52 周：Offer 决策、转型复盘与入职衔接**
  - **求职行动**：综合评估团队 AI 业务落地前景、工程氛围与薪资敲定最终 Offer；整理这一年的代码库与学习总结，预习新公司技术栈，完成 1 年期转型目标。

---

## 四、执行纪律与安全红线

1. **周度闭环原则**：每周末用 15 分钟在下方进度表打卡，若当周因加班/事务落后，次周优先砍掉非核心扩展阅读，**绝不砍代码产出**。
2. **安全与账单红线**：所有大模型 API Key 严禁硬编码在 React 前端或 Flutter/Android 客户端安装包中，必须走服务端环境变量；首周务必设好 **Google Cloud \$30 预算告警**。
3. **坚持主栈，开放阅读**：编码全程坚持 **TypeScript + React + Flutter/Android**，遇到仅提供 Python 示例的前沿开源库或文档时，直接提炼其 Prompt 与接口调用逻辑并用 TS 复现。

---

## 五、52 周学习进度打卡表

| 日期 / 周次 | 完成内容 | 仓库链接 / 笔记与遇到的问题 |
| :--- | :--- | :--- |
| 2026-11-21（准备期） | 制定并升级至 v3（52 周逐周细化版）学习计划 | 确立 `TS + React + Flutter/Android` 零 Python 主栈路线，映射截图全部 8 门课程并拆解到第 1~52 周 |
| 第 1 周 | 待打卡 | |
| 第 2 周 | 待打卡 | |
| 第 3 周 | 待打卡 | |
| 第 4 周 | 待打卡 | |
