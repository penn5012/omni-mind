import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { streamSSE } from 'hono/streaming';
import { GoogleGenAI } from '@google/genai';
import {
  ChatRequestSchema,
  ToolApprovalRequestSchema,
  type CitationItem,
  type ThinkingEvent,
  type UiCardEvent,
  type UsageMetricsEvent,
} from '@omnimind/shared-schema';

export const app = new Hono();

app.use('/*', cors());

const MEMORY_BANK: CitationItem[] = [
  {
    id: 'mem_budget_q4',
    index: 1,
    title: '《Q4 AI 基建预算纪要 (白板拍立存)》',
    chunkId: 'chunk_8f92a',
    createdAt: '2026-11-15 16:20',
    rrfScore: 0.92,
    snippet:
      '...确定全程采用 TypeScript + Flutter 路线。关于云端算力开销，月度 API 与云服务预算上限严格控制在 $30.00 以内，首周必须在 Google Cloud 配置预算告警，优先使用 Gemini 2.5 Flash...',
    highlightedTerm: '月度 API 与云服务预算上限严格控制在 $30.00 以内',
    tags: ['#预算告警', '#GoogleCloud', '#技术规划'],
  },
  {
    id: 'mem_arch_review',
    index: 2,
    title: '《多通道 SSE 流式网关设计笔记》',
    chunkId: 'chunk_3c19b',
    createdAt: '2026-11-18 21:10',
    rrfScore: 0.88,
    snippet:
      '...移动端与 Web 端统一复用 Hono streamSSE 接口，依次下发 thinking、citations、text_delta、ui_card 与 usage_metrics 五类强类型事件...',
    highlightedTerm: '依次下发 thinking、citations、text_delta、ui_card 与 usage_metrics',
    tags: ['#SSE流式', '#Hono', '#GenerativeUI'],
  },
];

app.get('/api/health', (c) => {
  return c.json({
    status: 'ok',
    service: 'omnimind-bff-server',
    version: '0.1.0',
    timestamp: new Date().toISOString(),
    memoryCount: 42,
    hasGeminiApiKey: Boolean(process.env.GEMINI_API_KEY),
    models: [
      { id: 'gemini-2.5-flash', label: 'Gemini 2.5 Flash', ttftAvgMs: 320, role: 'primary' },
      { id: 'gemini-2.5-pro', label: 'Gemini 2.5 Pro', ttftAvgMs: 780, role: 'reasoning' },
      { id: 'deepseek-v3-fallback', label: 'DeepSeek-V3 (Fallback)', ttftAvgMs: 490, role: 'fallback' },
    ],
  });
});

app.get('/api/memories', (c) => {
  return c.json({
    total: 42,
    recentItems: MEMORY_BANK,
  });
});

function detectScenario(
  message: string,
  hint?: string,
  hasImage?: boolean
): 'whiteboard_schedule' | 'receipt_expense' | 'monthly_analytics' | 'rag_budget' {
  if (hint && hint !== 'auto') {
    return hint as 'whiteboard_schedule' | 'receipt_expense' | 'monthly_analytics' | 'rag_budget';
  }
  const lower = message.toLowerCase();
  if (lower.includes('小票') || lower.includes('星巴克') || lower.includes('记账') || lower.includes('发票')) {
    return 'receipt_expense';
  }
  if (lower.includes('统计') || lower.includes('开销') || lower.includes('花了多少') || lower.includes('汇总')) {
    return 'monthly_analytics';
  }
  if (lower.includes('日程') || lower.includes('日历') || lower.includes('白板') || lower.includes('评审') || hasImage) {
    return 'whiteboard_schedule';
  }
  return 'rag_budget';
}

function buildScenarioPayload(
  scenario: 'whiteboard_schedule' | 'receipt_expense' | 'monthly_analytics' | 'rag_budget',
  modelId: string,
  fallbackTriggered: boolean
): {
  thinking: ThinkingEvent;
  citations: CitationItem[];
  markdownChunks: string[];
  uiCard: UiCardEvent;
  usage: UsageMetricsEvent;
} {
  if (scenario === 'receipt_expense') {
    return {
      thinking: {
        durationMs: 920,
        steps: [
          {
            id: 's1',
            label: '多模态票据 OCR 解析',
            detail: '识别商户「Starbucks 星巴克臻选」，总金额 ¥68.00，置信度 99%',
            status: 'completed',
          },
          {
            id: 's2',
            label: '个人记忆库预算比对',
            detail: '检索 11 月餐饮累计消费 ¥1,240.00 (占月度预算 62%)',
            status: 'completed',
          },
          {
            id: 's3',
            label: 'Generative UI 卡片映射',
            detail: '生成结构化消费记账卡片 (expense_card)',
            status: 'completed',
          },
        ],
      },
      citations: [MEMORY_BANK[0]],
      markdownChunks: [
        '已从您上传的小票中提取出消费明细，并对照了《Q4 预算纪要》[1] 中的月度控制目标。\n\n',
        '本次星巴克消费 **¥68.00**，请确认下方记账卡片以归档至个人记忆库：',
      ],
      uiCard: {
        cardType: 'expense_card',
        cardId: 'card_exp_101',
        merchant: 'Starbucks Reserve 星巴克臻选',
        totalAmount: 68.0,
        currency: '¥',
        category: '餐饮美食',
        date: '2026-11-22',
        confidence: 0.99,
        items: [
          { name: '冰美式咖啡 (大杯)', price: 32.0 },
          { name: '法式牛肉可颂', price: 36.0 },
        ],
        monthlyRatioPercent: 62,
      },
      usage: {
        ttftMs: 310,
        inputTokens: 320,
        outputTokens: 142,
        totalTokens: 462,
        estimatedCostUsd: 0.00016,
        modelUsed: fallbackTriggered ? 'deepseek-v3-fallback' : modelId,
        fallbackTriggered,
        traceUrl: 'https://cloud.langfuse.com/trace/omnimind-exp-101',
      },
    };
  }

  if (scenario === 'monthly_analytics') {
    return {
      thinking: {
        durationMs: 780,
        steps: [
          {
            id: 's1',
            label: '记忆库结构化聚合查询',
            detail: '聚合 2026-11 月度全部已归档消费记录 (共 28 笔)',
            status: 'completed',
          },
          {
            id: 's2',
            label: 'Generative UI 图表生成',
            detail: '构建月度分类占比卡片 (analytics_card)',
            status: 'completed',
          },
        ],
      },
      citations: [MEMORY_BANK[0]],
      markdownChunks: [
        '已为您汇总 **11 月份个人记忆库消费数据**（对照《Q4 AI 基建预算纪要》[1]）：\n\n',
        '本月总计支出 **¥3,420.00**，其中云服务与 API 消耗仍严格控制在 **$30.00** 红线内：',
      ],
      uiCard: {
        cardType: 'analytics_card',
        cardId: 'card_ana_202',
        periodTitle: '11 月度记忆库消费分类汇总',
        totalAmount: 3420.0,
        categories: [
          { label: '餐饮美食', amount: 1520, percent: 44, colorToken: 'accentPrimary' },
          { label: '云服务与数码订阅', amount: 980, percent: 29, colorToken: 'accentCyan' },
          { label: '交通出行', amount: 920, percent: 27, colorToken: 'statusSuccess' },
        ],
        aiInsight: 'AI 洞察：云服务 API 累计消耗 $4.20，远低于 $30.00 预算上限。',
      },
      usage: {
        ttftMs: 295,
        inputTokens: 260,
        outputTokens: 128,
        totalTokens: 388,
        estimatedCostUsd: 0.00014,
        modelUsed: fallbackTriggered ? 'deepseek-v3-fallback' : modelId,
        fallbackTriggered,
        traceUrl: 'https://cloud.langfuse.com/trace/omnimind-ana-202',
      },
    };
  }

  if (scenario === 'rag_budget') {
    return {
      thinking: {
        durationMs: 840,
        steps: [
          {
            id: 's1',
            label: '多轮 Query 指代消解与改写',
            detail: '重写检索词为: "Q4 Google Cloud API 月度预算上限 + 流式架构"',
            status: 'completed',
          },
          {
            id: 's2',
            label: 'Hybrid Search (全文 + pgvector) & Rerank',
            detail: '召回 Top-2 记忆切片，最高 RRF 融合得分 0.92',
            status: 'completed',
          },
        ],
      },
      citations: MEMORY_BANK,
      markdownChunks: [
        '根据您归档的《Q4 AI 基建预算纪要》[1] 与《多通道 SSE 流式网关设计笔记》[2]：\n\n',
        '1. **月度算力预算红线**：Google Cloud 与大模型 API 预算上限严格设定为 **$30.00 / 月**（当前已消耗 $4.20）。\n',
        '2. **技术路线**：全程采用 **TypeScript (Hono) + Flutter + React**，已为您整理好下阶段学习日程卡片：',
      ],
      uiCard: {
        cardType: 'schedule_card',
        cardId: 'card_sch_303',
        title: 'Flutter × AI 多通道 SSE 流式架构复盘',
        startTime: '2026-11-26 14:00',
        endTime: '2026-11-26 15:30',
        location: '个人开发工作台 / 提前 15 分钟系统提醒',
        hasConflict: false,
        reminderMinutes: 15,
      },
      usage: {
        ttftMs: 325,
        inputTokens: 290,
        outputTokens: 156,
        totalTokens: 446,
        estimatedCostUsd: 0.00015,
        modelUsed: fallbackTriggered ? 'deepseek-v3-fallback' : modelId,
        fallbackTriggered,
        traceUrl: 'https://cloud.langfuse.com/trace/omnimind-rag-303',
      },
    };
  }

  // Default: whiteboard_schedule (Multimodal photo -> RAG citation [1] + HITL Tool Approval Card)
  return {
    thinking: {
      durationMs: 1120,
      steps: [
        {
          id: 's1',
          label: '视觉解析与端侧 ML Kit 隐私校验',
          detail: '提取白板事项「AI 网关架构评审与压测复盘」，时间「周三 15:00-16:30」',
          status: 'completed',
        },
        {
          id: 's2',
          label: 'Hybrid RAG 记忆混合检索',
          detail: '召回《Q4 AI 基建预算纪要》(chunk_8f92a, RRF Score: 0.92)',
          status: 'completed',
        },
        {
          id: 's3',
          label: '端侧工具规划与 Human-in-the-Loop 拦截',
          detail: '请求调用 device_calendar.create_event，触发敏感写操作挂起等待审批',
          status: 'completed',
        },
      ],
    },
    citations: [MEMORY_BANK[0]],
    markdownChunks: [
      '根据您上周归档的《Q4 AI 基建预算纪要》[1]，您的 Google Cloud 与大模型月度预算上限严格设定为 **$30.00**（当前累计消耗 $4.20）。\n\n',
      '同时，已从白板照片中提取出架构评审日程，**写入手机系统日历前请确认审批**：',
    ],
    uiCard: {
      cardType: 'tool_approval_card',
      cardId: 'card_hitl_9821',
      toolName: 'device_calendar.create_event',
      mcpServer: 'omnimind-device-bridge',
      actionSummary: 'AI 网关架构评审与压测复盘',
      scheduledTime: '2026-11-25 (周三) 15:00 - 16:30',
      conflictCheck: '🟢 该时段无其他系统日历冲突',
      status: 'pending',
    },
    usage: {
      ttftMs: 340,
      inputTokens: 318,
      outputTokens: 168,
      totalTokens: 486,
      estimatedCostUsd: 0.00018,
      modelUsed: fallbackTriggered ? 'deepseek-v3-fallback' : modelId,
      fallbackTriggered,
      traceUrl: 'https://cloud.langfuse.com/trace/omnimind-hitl-9821',
    },
  };
}

app.post('/api/chat/stream', async (c) => {
  const rawBody = await c.req.json().catch(() => ({}));
  const parsed = ChatRequestSchema.safeParse(rawBody);
  if (!parsed.success) {
    return c.json({ error: 'Invalid chat request payload', issues: parsed.error.issues }, 400);
  }

  const reqData = parsed.data;
  const scenario = detectScenario(reqData.message, reqData.scenarioHint, Boolean(reqData.imageAttachment));
  const simulateFallback = reqData.message.includes('模拟超时') || reqData.modelId === 'deepseek-v3-fallback';
  const payload = buildScenarioPayload(scenario, reqData.modelId, simulateFallback);

  return streamSSE(c, async (stream) => {
    // 1. Emit thinking steps
    await stream.writeSSE({
      event: 'thinking',
      data: JSON.stringify(payload.thinking),
    });

    // 2. Emit RAG citations metadata
    await stream.writeSSE({
      event: 'citations',
      data: JSON.stringify({ items: payload.citations }),
    });

    // 3. If real GEMINI_API_KEY is configured and user asked a freeform question, optionally enrich via @google/genai
    let chunksToStream = payload.markdownChunks;
    if (process.env.GEMINI_API_KEY && reqData.message.startsWith('LIVE:')) {
      try {
        const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
        const response = await ai.models.generateContent({
          model: 'gemini-2.5-flash',
          contents: reqData.message.replace(/^LIVE:\s*/, ''),
        });
        if (response.text) {
          chunksToStream = [response.text, '\n\n（附关联记忆参考 [1]）'];
        }
      } catch {
        // Auto fallback to deterministic scenario chunks on API error
      }
    }

    // Stream text deltas smoothly
    for (const chunk of chunksToStream) {
      await stream.writeSSE({
        event: 'text_delta',
        data: JSON.stringify({ delta: chunk }),
      });
      await stream.sleep(40);
    }

    // 4. Emit Generative UI dynamic card
    await stream.writeSSE({
      event: 'ui_card',
      data: JSON.stringify(payload.uiCard),
    });

    // 5. Emit LLMOps observability usage metrics
    await stream.writeSSE({
      event: 'usage_metrics',
      data: JSON.stringify(payload.usage),
    });

    await stream.writeSSE({
      event: 'done',
      data: JSON.stringify({ ok: true }),
    });
  });
});

app.post('/api/chat/approve', async (c) => {
  const rawBody = await c.req.json().catch(() => ({}));
  const parsed = ToolApprovalRequestSchema.safeParse(rawBody);
  if (!parsed.success) {
    return c.json({ error: 'Invalid approval payload', issues: parsed.error.issues }, 400);
  }

  const { cardId, toolName, approved } = parsed.data;
  return c.json({
    ok: true,
    cardId,
    toolName,
    status: approved ? 'approved' : 'rejected',
    eventId: approved ? 'cal_9821' : null,
    message: approved
      ? '✓ 已批准并调用系统日历写入成功 (event_id: cal_9821)'
      : '✕ 用户已拒绝执行该敏感写操作，已通知云端 Agent 回滚',
    executedAt: new Date().toISOString(),
  });
});
